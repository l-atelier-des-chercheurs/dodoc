const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;
const PDFWindow = require('electron-pdf-window');

const {
  default: installExtension,
  VUEJS_DEVTOOLS
} = require('electron-devtools-installer');

const path = require('path');
const fs = require('fs-extra');
const { dialog } = require('electron');
const JSONStorage = require('node-localstorage').JSONStorage;
const portscanner = require('portscanner');

const server = require('./server');

const settings = require('./settings.json'),
  dev = require('./core/dev-log');

require('electron-context-menu')({
  prepend: (params, BrowserWindow) => [
    {
      // Only show it when right-clicking images
      visible: params.mediaType === 'image'
    }
  ]
});

let win;
app.commandLine.appendSwitch('--ignore-certificate-errors');
app.commandLine.appendSwitch('--disable-http-cache');

function createWindow() {
  console.log(`Starting app ${app.getName()}`);
  console.log(process.versions);
  var storageLocation = app.getPath('userData');
  global.nodeStorage = new JSONStorage(storageLocation);

  const debug =
    process.argv.length >= 4 ? process.argv[3] === '--debug' : false;
  const verbose =
    process.argv.length >= 5 ? process.argv[4] === '--verbose' : false;
  const logToFile = false;

  dev.init(debug, verbose, logToFile);

  if (dev.isDebug()) {
    process.traceDeprecation = true;
  }

  if (global.appInfos === undefined) {
    global.appInfos = {};
  }

  global.appRoot = path.resolve(__dirname);
  global.tempStorage = app.getPath('temp');
  global.appInfos.version = app.getVersion();

  dev.log(`——— Starting dodoc2 app version ${global.appInfos.version}`);

  var windowState = {};
  try {
    windowState = global.nodeStorage.getItem('windowstate')
      ? global.nodeStorage.getItem('windowstate')
      : {};
    dev.log('Found defaults for windowState: ');
    dev.log(windowState);
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

  PDFWindow.addSupport(win);

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
        dev.error('Couldn’t update local settings with window position: ' + e);
      }
    });
  });

  if (process.platform == 'darwin') {
    app.setAboutPanelOptions({
      applicationName: app.getName(),
      applicationVersion: app.getVersion(),
      copyright: 'Released under the Creative Commons license.'
    });
  }

  setApplicationMenu();

  cleanCacheFolder().then(
    () => {
      copyAndRenameUserFolder().then(
        function(pathToUserContent) {
          global.pathToUserContent = pathToUserContent;
          dev.log('Will store contents in: ' + global.pathToUserContent);

          portscanner.findAPortNotInUse(settings.port, settings.port + 20).then(
            port => {
              dev.log(`main.js - Found available port: ${port}`);
              global.appInfos.port = port;
              global.appInfos.homeURL = `${settings.protocol}://${
                settings.host
              }:${global.appInfos.port}`;

              app.server = server(app);

              // and load the base url of the app.
              win.loadURL(global.appInfos.homeURL);

              if (dev.isDebug()) {
                // win.webContents.openDevTools({mode: 'detach'});
                installExtension(VUEJS_DEVTOOLS)
                  .then(name => console.log(`Added Extension:  ${name}`))
                  .catch(err => console.log('An error occurred: ', err));
              }
            },
            function(err) {
              dev.error('Failed to find available port: ' + err);
              dialog.showErrorBox(
                `The app ${app.getName()} wasn’t able to start`,
                `It seems ports between ${settings.port} and ${settings.port +
                  20} are not available.\nError code: ${err}`
              );
            }
          );

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
        },
        function(err) {
          dev.error('Failed to check existing content folder: ' + err);
        }
      );
    },
    function(err) {
      dev.error('Failed to clean cache folder: ' + err);
    }
  );
}

function setApplicationMenu() {
  // Create the Application's main menu
  var template = [
    {
      label: 'Electron',
      submenu: [
        {
          label: 'About do•doc',
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
          label: 'Hide Electron',
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Command+Z',
          selector: 'undo:'
        },
        {
          label: 'Redo',
          accelerator: 'Shift+Command+Z',
          selector: 'redo:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Cut',
          accelerator: 'Command+X',
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'Command+C',
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'Command+V',
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:'
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: function() {
            BrowserWindow.getFocusedWindow().reload();
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+Command+I',
          click: function() {
            BrowserWindow.getFocusedWindow().toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          selector: 'performClose:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Bring All to Front',
          selector: 'arrangeInFront:'
        }
      ]
    },
    {
      label: 'Help',
      submenu: []
    }
  ];

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
function copyAndRenameUserFolder() {
  return new Promise(function(resolve, reject) {
    const userDirPath = app.getPath(settings.userDirPath);
    const pathToUserContent = path.join(userDirPath, settings.userDirname);
    fs.access(pathToUserContent, fs.F_OK, function(err) {
      // if userDir folder doesn't exist yet at destination
      if (err) {
        dev.log(
          `Content folder ${
            settings.userDirname
          } does not already exists in ${userDirPath}`
        );
        dev.log(`->duplicating ${settings.contentDirname} to create a new one`);
        const sourcePathInApp = path.join(
          `${__dirname.replace(`${path.sep}app.asar`, '')}`,
          `${settings.contentDirname}`
        );
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
            settings.userDirname
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
    let cachePath = path.join(global.tempStorage, settings.cacheDirname);
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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

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
    createWindow();
  }
});
