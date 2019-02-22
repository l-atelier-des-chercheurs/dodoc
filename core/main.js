const getPath = require('platform-folders');
const path = require('path');
const fs = require('fs-extra');
const portscanner = require('portscanner');

const server = require('./server');

const dev = require('./dev-log'),
  api = require('./api'),
  file = require('./file');

module.exports = function({ router }) {
  let win;
  const electron = require('electron');

  const { app, BrowserWindow, Menu } = electron;

  const { dialog } = require('electron');
  const JSONStorage = require('node-localstorage').JSONStorage;

  const is_electron = process.versions.hasOwnProperty('electron');

  if (is_electron) {
    require('electron-context-menu')({
      prepend: (params, BrowserWindow) => [
        {
          // Only show it when right-clicking images
          visible: params.mediaType === 'image'
        }
      ]
    });

    const {
      default: installExtension,
      VUEJS_DEVTOOLS
    } = require('electron-devtools-installer');

    installExtension(VUEJS_DEVTOOLS)
      .then(name => dev.logverbose(`Added Extension:  ${name}`))
      .catch(err => dev.logverbose('An error occurred: ', err));

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      createWindow(win);
    });

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
      // On macOS it is common for applications and their menu bar
      // to stay active until the user quits explicitly with Cmd + Q
      // if (process.platform !== 'darwin') {
      app.quit();
      // }
    });

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (win === null) {
        createWindow(win);
      }
    });
  } else {
    setupApp()
      .then(() => {
        server(router);
      })
      .catch(err => {
        dev.error(`Error code: ${err}`);
      });
  }

  function setupApp() {
    return new Promise(function(resolve, reject) {
      console.log(`Starting app ${global.appInfos.name}`);
      console.log(process.versions);

      const debug =
        process.argv.length >= 4 ? process.argv[3] === '--debug' : false;
      const verbose =
        process.argv.length >= 5 ? process.argv[4] === '--verbose' : false;
      const logToFile = false;

      dev.init(debug, verbose, logToFile);

      if (dev.isDebug()) {
        process.traceDeprecation = true;
      }

      global.tempStorage = getPath.getCacheFolder();

      dev.log(`——— Starting dodoc2 app version ${global.appInfos.version}`);

      cleanCacheFolder().then(
        () => {
          copyAndRenameUserFolder().then(
            function(pathToUserContent) {
              global.pathToUserContent = pathToUserContent;
              dev.log('Will store contents in: ' + global.pathToUserContent);

              readSessionMetaFile().then(sessionMeta => {
                if (
                  !!sessionMeta &&
                  sessionMeta.hasOwnProperty('session_password') &&
                  sessionMeta.session_password !== '' &&
                  typeof sessionMeta.session_password === 'string'
                ) {
                  function hashCode(s) {
                    return s.split('').reduce(function(a, b) {
                      a = (a << 5) - a + b.charCodeAt(0);
                      return a & a;
                    }, 0);
                  }

                  global.session_password = hashCode(
                    sessionMeta.session_password
                  );
                }
                portscanner
                  .findAPortNotInUse(
                    global.settings.desired_port,
                    global.settings.desired_port + 20
                  )
                  .then(
                    port => {
                      global.appInfos.port = port;
                      global.appInfos.homeURL = `${
                        global.settings.protocol
                      }://${global.settings.host}:${global.appInfos.port}`;

                      dev.log(`main.js - Found available port: ${port}`);
                      return resolve();
                    },
                    function(err) {
                      dev.error('Failed to find available port: ' + err);
                      return reject(err);
                    }
                  )
                  .catch(err => {
                    dev.error(`err ${err}`);
                    if (is_electron)
                      dev.showErrorBox(
                        `The app ${app.getName()} wasn’t able to start`,
                        `Error code: ${err}`
                      );
                  });
              });
            },
            function(err) {
              dev.error('Failed to check existing content folder: ' + err);
              return reject(err);
            }
          );
        },
        function(err) {
          dev.error('Failed to clean cache folder: ' + err);
          return reject(err);
        }
      );
    });
  }

  function createWindow(win) {
    app.commandLine.appendSwitch('--ignore-certificate-errors');
    app.commandLine.appendSwitch('--disable-http-cache');

    var storageLocation = app.getPath('userData');
    global.nodeStorage = new JSONStorage(storageLocation);

    var windowState = {};
    try {
      windowState = global.nodeStorage.getItem('windowstate')
        ? global.nodeStorage.getItem('windowstate')
        : {};
      dev.log('Found defaults for windowState');
    } catch (err) {
      dev.log('No default for windowState');
    }

    // Create the browser window.
    win = new BrowserWindow({
      x: (windowState.bounds && windowState.bounds.x) || undefined,
      y: (windowState.bounds && windowState.bounds.y) || undefined,
      width: (windowState.bounds && windowState.bounds.width) || 1200,
      height: (windowState.bounds && windowState.bounds.height) || 800,

      backgroundColor: '#EBEBEB',
      show: false,
      titleBarStyle: 'hidden',

      webPreferences: {
        allowDisplayingInsecureContent: true,
        allowRunningInsecureContent: true,
        nodeIntegration: true,
        plugins: true
      }
    });

    require('electron-pdf-window').addSupport(win);

    if (windowState.isMaximized) {
      win.maximize();
    }

    var storeWindowState = function() {
      windowState.isMaximized = win.isMaximized();
      if (!windowState.isMaximized) {
        // only update bounds if the window isn't currently maximized
        windowState.bounds = win.getBounds();
      }
      global.nodeStorage.setItem('windowstate', windowState);
    };

    ['close'].forEach(function(e) {
      win.on(e, function() {
        try {
          storeWindowState();
        } catch (e) {
          dev.error(
            'Couldn’t update local settings with window position: ' + e
          );
        }
      });
    });

    if (process.platform == 'darwin') {
      app.setAboutPanelOptions({
        applicationName: global.appInfos.name,
        applicationVersion: app.getVersion(),
        copyright: 'Released under the Creative Commons license.'
      });
    }

    setApplicationMenu();

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null;
    });

    win.on('ready-to-show', function() {
      win.show();
      win.focus();
    });

    setupApp()
      .then(() => {
        server(router);

        win.loadURL(global.appInfos.homeURL);

        if (dev.isDebug()) {
          // win.webContents.openDevTools({mode: 'detach'});
        }
      })
      .catch(err => {
        dialog.showErrorBox(`Error code: ${err}`);
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
            selector: 'orderFrontStandardAboutPanel:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: `Cacher ${global.appInfos.productName}`,
            accelerator: 'Command+H',
            selector: 'hide:'
          },
          {
            label: 'Cacher les autres',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          },
          {
            label: 'Montrer tout',
            selector: 'unhideAllApplications:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quitter',
            accelerator: 'Command+Q',
            click: function() {
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edition',
        submenu: [
          {
            label: 'Annuler',
            accelerator: 'Command+Z',
            selector: 'undo:'
          },
          {
            label: 'Rétablir',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Couper',
            accelerator: 'Command+X',
            selector: 'cut:'
          },
          {
            label: 'Copier',
            accelerator: 'Command+C',
            selector: 'copy:'
          },
          {
            label: 'Coller',
            accelerator: 'Command+V',
            selector: 'paste:'
          },
          {
            label: 'Sélectionner tout',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          }
        ]
      },
      {
        label: 'Affichage',
        submenu: [
          {
            label: 'Recharger',
            accelerator: 'Command+R',
            click: function() {
              BrowserWindow.getFocusedWindow().reload();
            }
          },
          {
            label: 'Afficher les outils de développement',
            accelerator: 'Alt+Command+I',
            click: function() {
              BrowserWindow.getFocusedWindow().toggleDevTools();
            }
          }
        ]
      },
      {
        label: 'Fenêtre',
        submenu: [
          {
            label: 'Réduire',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Fermer',
            accelerator: 'Command+W',
            selector: 'performClose:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Mettre tout au premier plan',
            selector: 'arrangeInFront:'
          }
        ]
      },
      {
        label: 'Aide',
        submenu: []
      }
    ];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
  function copyAndRenameUserFolder() {
    return new Promise(function(resolve, reject) {
      const userDirPath = is_electron
        ? app.getPath(global.settings.userDirPath)
        : getPath.getDocumentsFolder();

      const pathToUserContent = path.join(
        userDirPath,
        global.settings.userDirname
      );
      fs.access(pathToUserContent, fs.F_OK, function(err) {
        // if userDir folder doesn't exist yet at destination
        if (err) {
          dev.log(
            `Content folder ${
              global.settings.userDirname
            } does not already exists in ${userDirPath}`
          );
          dev.log(
            `->duplicating ${
              global.settings.contentDirname
            } to create a new one`
          );

          let sourcePathInApp;
          if (is_electron) {
            sourcePathInApp = path.join(
              `${global.appRoot.replace(`${path.sep}app.asar`, '')}`,
              `${global.settings.contentDirname}`
            );
          } else {
            sourcePathInApp = path.join(
              `${global.appRoot}`,
              `${global.settings.contentDirname}`
            );
          }
          fs.copy(sourcePathInApp, pathToUserContent, function(err) {
            if (err) {
              dev.error(`Failed to copy: ${err}`);
              reject(err);
            }
            resolve(pathToUserContent);
          });
        } else {
          dev.log(
            `Content folder ${
              global.settings.userDirname
            } already exists in ${userDirPath}`
          );
          dev.log(`-> not creating a new one`);
          resolve(pathToUserContent);
        }
      });
    });
  }

  function cleanCacheFolder() {
    return new Promise(function(resolve, reject) {
      let cachePath = path.join(
        global.tempStorage,
        global.settings.cacheDirname
      );
      fs.emptyDir(cachePath)
        .then(() => {
          resolve();
        })
        .catch(err => {
          dev.error(err);
          return reject(err);
        });
    });
  }

  function readSessionMetaFile() {
    return new Promise(function(resolve, reject) {
      var pathToSessionMeta = api.getFolderPath('meta.txt');
      try {
        var metaFileContent = fs.readFileSync(
          pathToSessionMeta,
          global.settings.textEncoding
        );
        return resolve(api.parseData(metaFileContent));
      } catch (err) {
        return resolve();
      }
    });
  }
};
