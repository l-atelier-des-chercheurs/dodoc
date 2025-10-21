const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  dialog,
} = require("electron");
const path = require("path");
const writeFileAtomic = require("write-file-atomic");

const utils = require("./utils"),
  notifier = require("./notifier"),
  cacheManager = require("./cache-manager"),
  journal = require("./journal"),
  ffmpegTracker = require("./ffmpeg-tracker");

// Set command line switches before app is ready
try {
  app.commandLine.appendSwitch("ignore-certificate-errors", "true");
  app.commandLine.appendSwitch("allow-insecure-localhost", "true");
  app.commandLine.appendSwitch("disable-http-cache", "true");
} catch (err) {
  console.warn("Could not set command line switches:", err.message);
}

const windowStateKeeper = require("electron-window-state");
const Store = require("electron-store").default;

module.exports = (function () {
  const store = new Store({ name: "dodoc" });
  let win;
  let aboutModalOpening = false; // Flag to prevent multiple rapid clicks

  return {
    init: () => {
      return new Promise(function (resolve, reject) {
        // check if a custom storage path was set
        // todo cleanup and move this to contentPath in main2.js
        const custom_storage_path = store.get("custom_content_path");
        if (custom_storage_path) {
          global.settings.contentPath = custom_storage_path;
          dev.log(
            `ELECTRON — custom storage path is detected and will be used ${custom_storage_path}`
          );
          journal.log({
            message: `ELECTRON — custom storage path is detected and will be used ${custom_storage_path}`,
            from: "electron",
          });
        }

        notifier.on("restartApp", () => {
          dev.logfunction(`ELECTRON — init : restart`);
          app.relaunch();
          app.exit(0);
        });

        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on("ready", () => {
          dev.log(`ELECTRON — init : ready`);
          journal.log({
            message: "ELECTRON — init : ready",
            from: "electron",
          });

          _createWindow().then((_win) => {
            dev.logfunction(`ELECTRON — init : ready / window created`);
            win = _win;
            return resolve(win);
          });
        });

        // Quit when all windows are closed.
        app.on("window-all-closed", () => {
          dev.logfunction(`ELECTRON — init : window-all-closed`);
          // On macOS it is common for applications and their menu bar
          // to stay active until the user quits explicitly with Cmd + Q
          // if (process.platform !== 'darwin') {
          ffmpegTracker.killAllProcesses();
          app.quit();
          // }
        });

        app.on("activate", () => {
          dev.logfunction(`ELECTRON — init : activate`);
          // On macOS it's common to re-create a window in the app when the
          // dock icon is clicked and there are no other windows open.
          if (win === null) {
            _createWindow().then((_win) => {
              win = _win;
              return resolve(win);
            });
          }
        });

        // SSL/TSL: this is the self signed certificate support
        app.on(
          "certificate-error",
          (event, webContents, url, error, certificate, callback) => {
            dev.logfunction(`ELECTRON — init : certificate-error for ${url}`);
            // On certificate error we disable default behaviour (stop loading the page)
            // and we then say "it is all fine - true" to the callback
            event.preventDefault();
            callback(true);
          }
        );

        // Add cleanup on app quit
        app.on("before-quit", async () => {
          try {
            // Kill any running ffmpeg processes
            ffmpegTracker.killAllProcesses();
            cacheManager.handleExit();
          } catch (err) {
            dev.error("Error during cache cleanup on quit:", err);
          }
        });
      });
    },
    captureScreenshot: async ({ url, full_path_to_thumb }) => {
      dev.logfunction({ url, full_path_to_thumb });

      let win;

      function closeWin() {
        if (!win) return;
        win.close();
        win = null;
      }

      try {
        await Promise.race([
          (async () => {
            win = await _loadWebpage({ url });
            const image = await win.webContents.capturePage();
            closeWin();
            await writeFileAtomic(full_path_to_thumb, image.toPNG(1.0));
          })(),
          new Promise((_, reject) => {
            setTimeout(() => {
              closeWin();
              dev.error("Failed to capture screenshot: timeout");
              const err = new Error("Failed to capture screenshot");
              err.code = "timeout";
              reject(err);
            }, 10_000);
          }),
        ]);
        return;
      } catch (err) {
        closeWin();
        dev.error("Failed to capture screenshot: " + err.message);
        throw err;
      }
    },
    exportToPDFOrImage: async ({
      url,
      recipe,
      bw_pagesize,
      printToPDF_pagesize,
      number_of_pages_to_export,
      reportProgress,
    }) => {
      let win;

      reportProgress(10);

      win = await _loadWebpage({
        url,
        width: bw_pagesize.width,
        height: bw_pagesize.height,
      });

      reportProgress(20);

      if (recipe === "pdf") {
        const pageSize = {
          width: printToPDF_pagesize.width / 10 / 2.54,
          height: printToPDF_pagesize.height / 10 / 2.54,
        };

        const options = {
          margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          pageSize,
          printBackground: true,
        };

        if (number_of_pages_to_export) {
          options.pageRanges = `1-${number_of_pages_to_export}`;
        }

        const pdf_data = await win.webContents.printToPDF(options);

        reportProgress(80);

        const full_path_to_pdf = await utils.createUniqueFilenameInCache("pdf");
        await writeFileAtomic(full_path_to_pdf, pdf_data);

        reportProgress(90);
        return full_path_to_pdf;
      } else if (recipe === "png") {
        const png_data = await win.webContents.capturePage();

        reportProgress(80);

        const full_path_to_image = await utils.createUniqueFilenameInCache(
          "png"
        );
        await utils.convertAndCopyImage({
          source: png_data.toPNG(1.0),
          destination: full_path_to_image,
          width: bw_pagesize.width,
          height: bw_pagesize.height,
        });

        reportProgress(90);

        return full_path_to_image;
      }
    },
  };

  function _createWindow() {
    return new Promise(function (resolve, reject) {
      dev.logfunction();

      let mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800,
      });

      // Create the browser window.
      let win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        backgroundColor: "#EBEBEB",
        // titleBarStyle: "hidden",
        show: true,
        title: global.appInfos.productName,
        icon: path.join(global.appRoot, "build", "icon.png"),

        webPreferences: {
          allowRunningInsecureContent: true,
          nodeIntegration: false,
          contextIsolation: true,
          enableRemoteModule: false, // turn off remote
          plugins: true,
          preload: path.join(__dirname, "preload.js"),
        },
      });

      mainWindowState.manage(win);

      if (process.platform == "darwin") {
        app.setAboutPanelOptions({
          applicationName: global.appInfos.productName,
          applicationVersion: app.getVersion(),
          copyright:
            "do•doc est un outil de documentation pour la créativité. Publié sous licence libre GNU AGPL. \n\n do•doc is a documentation tool for creativity. Released under the free software GNU AGPL license.",
        });
      }

      setApplicationMenu();

      // Emitted when the window is closed.
      win.on("closed", () => {
        dev.log(`ELECTRON — createWindow : closed`);
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
      });

      win.on("ready-to-show", function () {
        dev.log(`ELECTRON — createWindow : ready-to-show`);
        win.show();
        win.focus();
      });

      ipcMain.on("toMain", (event, args) => {
        if (args.type === "open_path") {
          if (args.path) shell.openPath(utils.getPathToUserContent(args.path));
          else if (args.absolute_path) shell.openPath(args.absolute_path);
        } else if (args.type === "open_external") {
          shell.openExternal(args.url);
        } else if (args.type === "get_path") {
          _pickPath();
        }

        // Send result back to renderer process
        // win.webContents.send("fromMain", responseObj);
      });

      return resolve(win);
    });
  }

  async function _loadWebpage({ url, width = 1600, height = 900 }) {
    const win = new BrowserWindow({
      width: width,
      height: height,
      show: false,
      enableLargerThanScreen: true,
      webPreferences: {
        contextIsolation: true,
        allowRunningInsecureContent: true,
        offscreen: true,
      },
    });

    win.loadURL(url, {
      // improve chance of getting a screenshot
      userAgent: "facebookexternalhit/1.1",
    });
    win.webContents.setAudioMuted(true);
    win.webContents.setZoomLevel(1);

    try {
      await new Promise((resolve, reject) => {
        win.webContents.once("did-finish-load", async () => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return resolve();
        });
        win.webContents.on("did-fail-load", (event, error) => {
          dev.log(`Failed to load webpage content: ${error}`);
          return reject(new Error("Failed to load webpage content: " + error));
        });
      });
    } catch (error) {
      dev.error(`Error loading webpage: ${error}`);
      throw new Error("Failed to load webpage: " + error);
    }

    return win;
  }

  async function _pickPath() {
    dev.logfunction();
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory", "createDirectory"],
    });
    if (result.canceled) return false;

    const path_to_content = result.filePaths[0];
    win.webContents.send("fromMain", {
      type: "new_path",
      path_to_content,
    });
  }

  function setApplicationMenu() {
    // Create the Application's main menu
    var template = [
      {
        label: global.appInfos.productName,
        submenu: [
          {
            label: `À propos ${global.appInfos.productName}`,
            click: () => {
              // Prevent multiple rapid clicks
              if (aboutModalOpening) {
                return;
              }

              // Check if the page is ready before executing JavaScript
              if (!win || !win.webContents) {
                return;
              }

              aboutModalOpening = true;

              // Trigger the existing About modal in the app
              win.webContents
                .executeJavaScript(
                  `
                try {
                  // Wait for DOM to be ready
                  if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', function() {
                      setTimeout(openAboutModal, 100);
                    });
                  } else {
                    openAboutModal();
                  }
                  
                  function openAboutModal() {
                    // Find the help button and click it to open the About modal
                    const helpBtn = document.querySelector('.u-button._helpBtn');
                    if (helpBtn && !helpBtn.disabled) {
                      helpBtn.click();
                    } else {
                      // Fallback: try to trigger the modal directly
                      const event = new CustomEvent('show-about-modal');
                      window.dispatchEvent(event);
                    }
                  }
                } catch (error) {
                  console.error('Error opening About modal:', error);
                }
              `
                )
                .catch((error) => {
                  console.error("Failed to execute JavaScript:", error);
                  // Fallback to native dialog if JavaScript execution fails
                  dialog.showMessageBox(win, {
                    type: "info",
                    title: `À propos ${global.appInfos.productName}`,
                    message: global.appInfos.productName,
                    detail: `Version ${app.getVersion()}\n\n${
                      global.appInfos.productName
                    } est un outil de documentation pour la créativité. Publié sous licence libre GNU AGPL.\n\n${
                      global.appInfos.productName
                    } is a documentation tool for creativity. Released under the free software GNU AGPL license.`,
                    buttons: ["OK"],
                  });
                })
                .finally(() => {
                  // Reset the flag after a short delay
                  setTimeout(() => {
                    aboutModalOpening = false;
                  }, 1000);
                });
            },
            ...(process.platform === "darwin" && {
              selector: "orderFrontStandardAboutPanel:",
            }),
          },
          {
            type: "separator",
          },
          ...(process.platform === "darwin"
            ? [
                {
                  label: "Services",
                  submenu: [],
                },
                {
                  type: "separator",
                },
                {
                  label: `Cacher ${global.appInfos.productName}`,
                  accelerator: "Command+H",
                  selector: "hide:",
                },
                {
                  label: "Cacher les autres",
                  accelerator: "Command+Shift+H",
                  selector: "hideOtherApplications:",
                },
                {
                  label: "Montrer tout",
                  selector: "unhideAllApplications:",
                },
                {
                  type: "separator",
                },
              ]
            : []),
          {
            label: "Quitter",
            accelerator: process.platform === "darwin" ? "Command+Q" : "Ctrl+Q",
            click: function () {
              ffmpegTracker.killAllProcesses();
              app.quit();
            },
          },
        ],
      },
      {
        label: "Edition",
        submenu: [
          {
            label: "Annuler",
            accelerator: process.platform === "darwin" ? "Command+Z" : "Ctrl+Z",
            role: "undo",
          },
          {
            label: "Rétablir",
            accelerator:
              process.platform === "darwin" ? "Shift+Command+Z" : "Ctrl+Y",
            role: "redo",
          },
          {
            type: "separator",
          },
          {
            label: "Couper",
            accelerator: process.platform === "darwin" ? "Command+X" : "Ctrl+X",
            role: "cut",
          },
          {
            label: "Copier",
            accelerator: process.platform === "darwin" ? "Command+C" : "Ctrl+C",
            role: "copy",
          },
          {
            label: "Coller",
            accelerator: process.platform === "darwin" ? "Command+V" : "Ctrl+V",
            role: "paste",
          },
          {
            label: "Sélectionner tout",
            accelerator: process.platform === "darwin" ? "Command+A" : "Ctrl+A",
            role: "selectall",
          },
        ],
      },
      {
        label: "Affichage",
        submenu: [
          {
            label: "Recharger",
            accelerator: process.platform === "darwin" ? "Command+R" : "Ctrl+R",
            click: function () {
              BrowserWindow.getFocusedWindow()?.reload();
            },
          },
          {
            label: "Afficher les outils de développement",
            accelerator:
              process.platform === "darwin" ? "Alt+Command+I" : "F12",
            click: function () {
              BrowserWindow.getFocusedWindow()?.toggleDevTools();
            },
          },
        ],
      },
      ...(process.platform === "darwin"
        ? [
            {
              label: "Fenêtre",
              submenu: [
                {
                  label: "Réduire",
                  accelerator: "Command+M",
                  role: "minimize",
                },
                {
                  label: "Fermer",
                  accelerator: "Command+W",
                  role: "close",
                },
                {
                  type: "separator",
                },
                {
                  label: "Mettre tout au premier plan",
                  role: "front",
                },
              ],
            },
          ]
        : []),
      {
        label: "Aide",
        submenu: [],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
})();
