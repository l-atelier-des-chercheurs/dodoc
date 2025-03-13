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

const utils = require("./utils");
const notifier = require("./notifier");

app.commandLine.appendSwitch("ignore-certificate-errors", "true");
app.commandLine.appendSwitch("allow-insecure-localhost", "true");
app.commandLine.appendSwitch("disable-http-cache", "true");

const electronPDFWindow = require("electron-pdf-window");

const windowStateKeeper = require("electron-window-state");
const Store = require("electron-store");

module.exports = (function () {
  const store = new Store();
  let win;

  return {
    init: () => {
      return new Promise(function (resolve, reject) {
        // check if ubuntu + electron + sharp
        if (process.platform === "linux") {
          // if sharp reports its version number, it means it's version > 0.32.0
          // because of a memory cage instability issue with sharp > 0.31.3, we show an error
          const found_sharp_version = require("sharp").versions?.sharp;
          if (found_sharp_version) {
            // const err = new Error(
            //   `Can't start application, please install sharp 0.31.3 (current version ${found_sharp_version}, see readme)`
            // );
            // err.code = "sharp_version_mismatch";
            // dev.error(err);
            // dialog.showErrorBox("Could not start application", err.message);
            // app.exit(0);
          }
        }

        // check if a custom storage path was set
        // todo cleanup and move this to contentPath in main2.js
        const custom_storage_path = store.get("custom_content_path");
        if (custom_storage_path) {
          global.settings.contentPath = custom_storage_path;
          dev.log(
            `ELECTRON — custom storage path is detected and will be used ${custom_storage_path}`
          );
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
          global.ffmpeg_processes.map((f) => f.kill());
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
            dev.logfunction(`ELECTRON — init : certificate-error`);
            // On certificate error we disable default behaviour (stop loading the page)
            // and we then say "it is all fine - true" to the callback
            event.preventDefault();
            callback(true);
          }
        );
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

      let page_timeout = setTimeout(async () => {
        closeWin();
        const err = new Error("Failed to capture screenshot");
        err.code = "timeout";
        throw err;
      }, 10_000);

      try {
        win = await _loadWebpage({ url });
        const image = await win.webContents.capturePage();
        closeWin();
        clearTimeout(page_timeout);
        await writeFileAtomic(full_path_to_thumb, image.toPNG(1.0));
        return;
      } catch (err) {
        closeWin();
        clearTimeout(page_timeout);
        throw err;
      }
    },
    exportToPDFOrImage: async ({
      url,
      recipe,
      bw_pagesize,
      printToPDF_pagesize,
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

        const data = await win.webContents.printToPDF({
          margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          },
          pageSize,
          printBackground: true,
          printSelectionOnly: false,
        });

        reportProgress(80);

        const full_path_to_pdf = await utils.createUniqueFilenameInCache("pdf");
        await writeFileAtomic(full_path_to_pdf, data);

        reportProgress(90);
        return full_path_to_pdf;
      } else if (recipe === "png") {
        const data = await win.webContents.capturePage();

        reportProgress(80);

        const full_path_to_image = await utils.createUniqueFilenameInCache(
          "png"
        );
        await utils.convertAndCopyImage({
          source: data.toPNG(1.0),
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
      electronPDFWindow.addSupport(win);

      if (process.platform == "darwin") {
        app.setAboutPanelOptions({
          applicationName: global.appInfos.name,
          applicationVersion: app.getVersion(),
          copyright: "Released under the free software GNU AGPL license.",
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

    await new Promise((resolve, reject) => {
      win.webContents.once("did-finish-load", async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return resolve();
      });
      win.webContents.on("did-fail-load", (event, error) => {
        return reject(error);
      });
    }).catch((error) => {
      throw error;
    });

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
            selector: "orderFrontStandardAboutPanel:",
          },
          {
            type: "separator",
          },
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
          {
            label: "Quitter",
            accelerator: "Command+Q",
            click: function () {
              global.ffmpeg_processes.map((f) => f.kill());
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
            accelerator: "Command+Z",
            selector: "undo:",
          },
          {
            label: "Rétablir",
            accelerator: "Shift+Command+Z",
            selector: "redo:",
          },
          {
            type: "separator",
          },
          {
            label: "Couper",
            accelerator: "Command+X",
            selector: "cut:",
          },
          {
            label: "Copier",
            accelerator: "Command+C",
            selector: "copy:",
          },
          {
            label: "Coller",
            accelerator: "Command+V",
            selector: "paste:",
          },
          {
            label: "Sélectionner tout",
            accelerator: "Command+A",
            selector: "selectAll:",
          },
        ],
      },
      {
        label: "Affichage",
        submenu: [
          {
            label: "Recharger",
            accelerator: "Command+R",
            click: function () {
              BrowserWindow.getFocusedWindow().reload();
            },
          },
          {
            label: "Afficher les outils de développement",
            accelerator: "Alt+Command+I",
            click: function () {
              BrowserWindow.getFocusedWindow().toggleDevTools();
            },
          },
        ],
      },
      {
        label: "Fenêtre",
        submenu: [
          {
            label: "Réduire",
            accelerator: "Command+M",
            selector: "performMiniaturize:",
          },
          {
            label: "Fermer",
            accelerator: "Command+W",
            selector: "performClose:",
          },
          {
            type: "separator",
          },
          {
            label: "Mettre tout au premier plan",
            selector: "arrangeInFront:",
          },
        ],
      },
      {
        label: "Aide",
        submenu: [],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
})();
