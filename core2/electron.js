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
        if (
          process.platform === "linux" &&
          process.versions.sharp !== "0.31.3"
        ) {
          const err = new Error(
            `Can't start application, please install sharp 0.31.3 (linux only requirements, see readme)`
          );
          err.code = "sharp_version_mismatch";
          dev.error(err);
          dialog.showErrorBox("Could not start application", err.message);
          app.exit(0);
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

      let page_timeout = setTimeout(async () => {
        if (win) win.close();
        const err = new Error("Failed to capture screenshot");
        err.code = "timeout";
        throw err;
      }, 10_000);

      try {
        win = await _loadWebpage({ url });
        const image = await win.capturePage();
        if (win) win.close();
        clearTimeout(page_timeout);
        await writeFileAtomic(full_path_to_thumb, image.toPNG(1.0));
        return;
      } catch (err) {
        if (win) win.close();
        clearTimeout(page_timeout);
        throw err;
      }
    },
    exportToPDFOrImage: ({
      url,
      recipe,
      layout_mode,
      document_width,
      document_height,
      reportProgress,
    }) => {
      return new Promise((resolve, reject) => {
        const { BrowserWindow } = require("electron");

        const magnify_factor =
          this.instructions.layout_mode === "print" ? 3.7952 : 1;

        // magnify browser window size if print with css px to mm of 3.7952
        // if screen, browser window size is same as page size
        const bw_pagesize = {
          width: Math.floor(document_size.width * magnify_factor),
          height: Math.floor(document_size.height * magnify_factor) + 0 /*25*/,
          // height: Math.floor(document_size.height * magnify_factor) + 25 /*25*/,
        };

        // print to pdf with size, try to match pagesize with pixels
        const reduction_factor =
          this.instructions.layout_mode === "print" ? 1 : 3.7952;

        const printToPDF_pagesize = {
          width: document_size.width / 10 / 2.54 / reduction_factor,
          height: document_size.height / 10 / 2.54 / reduction_factor,
        };

        let win = new BrowserWindow({
          width: bw_pagesize.width,
          height: bw_pagesize.height,
          show: false,
          enableLargerThanScreen: true,
          webPreferences: {
            contextIsolation: true,
            allowRunningInsecureContent: true,
            offscreen: true,
          },
        });
        win.loadURL(url);
        win.webContents.setAudioMuted(true);

        this._notifyProgress(5);

        let page_timeout = setTimeout(() => {
          if (win) win.close();
          this._notifyEnded({
            event: "failed",
          });
          return reject(new Error(`page-timeout`));
        }, 30_000);

        win.webContents.once("did-finish-load", async () => {
          dev.logverbose("did-finish-load " + url);
          this._notifyProgress(40);

          new Promise(function (resolve, reject) {
            setTimeout(() => resolve(1), 4000);
          })
            .then(async () => {
              this._notifyProgress(45);
              if (this.instructions.recipe === "pdf")
                return win.webContents.printToPDF({
                  // electron >= 21
                  // margins are set using @page in css
                  margins: {
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                  },
                  pageSize: printToPDF_pagesize,
                  printBackground: true,
                  printSelectionOnly: false,
                });
              else if (this.instructions.recipe === "png")
                return win.capturePage();
            })
            .then((data) => {
              this._notifyProgress(80);
              if (page_timeout) clearTimeout(page_timeout);
              if (win) win.close();
              return data;
            })
            .then(async (data) => {
              if (this.instructions.recipe === "pdf") {
                const full_path_to_pdf = await this._saveData("pdf", data);
                this._notifyProgress(95);
                return resolve(full_path_to_pdf);
              } else if (this.instructions.recipe === "png") {
                const full_path_to_image = await this._saveImage({
                  data: data.toPNG(1.0),
                  width: bw_pagesize.width,
                  height: bw_pagesize.height,
                });
                return resolve(full_path_to_image);
              }
            })
            .catch((error) => {
              dev.logverbose("Failed to print to pdf " + url);
              dev.error(error.message);
              if (page_timeout) clearTimeout(page_timeout);
              if (win) win.close();
              this._notifyEnded({
                event: "failed",
              });
              return reject(error);
            });
        });

        win.webContents.once(
          "did-fail-load",
          (event, code, desc, url, isMainFrame) => {
            dev.error(`Failed to load print pdf page ${url}`);
            if (page_timeout) clearTimeout(page_timeout);
            dev.error("did-fail-load: ");
            // dev.error("did-fail-load: ", event, code, desc, url, isMainFrame);
            if (win) win.close();
            this._notifyEnded({
              event: "failed",
            });
            return reject(new Error(`did-fail-load`));
          }
        );
      });
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

  async function _loadWebpage({ url }) {
    let page_timeout = setTimeout(() => {
      if (win) win.close();
      throw new Error(`page-timeout`);
    }, 5_000);

    const win = new BrowserWindow({
      width: 1600,
      height: 900,
      show: false,
      enableLargerThanScreen: true,
    });

    win.loadURL(url, {
      // improve chance of getting a screenshot
      userAgent: "facebookexternalhit/1.1",
    });
    win.webContents.setAudioMuted(true);

    await new Promise((resolve, reject) => {
      win.webContents.once("did-finish-load", async () => {
        if (page_timeout) clearTimeout(page_timeout);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        resolve();
      });
      win.webContents.on("did-fail-load", (event, error) => {
        reject(error);
      });
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
