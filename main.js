const {app, BrowserWindow, Menu, dialog} = require('electron');

const path = require('path');
const fs = require('fs-extra');
const flags = require('flags');

const dev = require('./bin/dev-log');
const config = require('./config.json');
const dodoc = require('./dodoc');
const dodocAPI = require('./bin/dodoc-api');
const server = require('./server');
const JSONStorage = require('node-localstorage').JSONStorage;
var portscanner = require('portscanner');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

app.commandLine.appendSwitch('--ignore-certificate-errors');

function createWindow() {

  var storageLocation = app.getPath('userData');
  global.nodeStorage = new JSONStorage(storageLocation);

  flags.defineBoolean('debug');
  flags.defineBoolean('verbose');
  flags.parse();

  const debug = flags.get('debug');
  const verbose = flags.get('verbose');
  dev.init(debug, verbose);

  if( global.appInfos === undefined)
    global.appInfos = {};

  global.appInfos.version = app.getVersion();
  dev.log('——— Starting dodoc app v' + global.appInfos.version);
  dev.log(`version: ${JSON.stringify(process.versions, null, 4)}`);

  // checkout which langage to load
  var envLang = app.getLocale();
//   envLang = 'en';
  dodoc.setCurrentCodeLang(envLang);
  dev.log('Environment lang is ' + dodoc.getCurrentCodeLang());
  dodoc.init();

  process.on('unhandledRejection', function(reason, p) {
    dev.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
      // application specific logging, throwing an error, or other logic here
  });

  var windowState = {};
  try {
    windowState = global.nodeStorage.getItem('windowstate') ? global.nodeStorage.getItem('windowstate') : {};
    dev.log('Found defaults for windowState: ');
    dev.log(JSON.stringify(windowState, null, 4));
  } catch (err) {
    dev.log('No default for windowState');
  }

  // Create the browser window.
  win = new BrowserWindow({
    x: windowState.bounds && windowState.bounds.x || undefined,
    y: windowState.bounds && windowState.bounds.y || undefined,
    width: windowState.bounds && windowState.bounds.width || 1200,
    height: windowState.bounds && windowState.bounds.height || 800,

    backgroundColor: '#EBEBEB',
    icon: path.join(__dirname, 'build', 'icons', '512x512.png'),
    show: false,

    webPreferences: {
      allowDisplayingInsecureContent: true,
      allowRunningInsecureContent: true,
      nodeIntegration: true
    }
  });

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

  ['resize', 'move', 'close'].forEach(function(e) {
    win.on(e, function() {
      try {
        storeWindowState();
      } catch(e) {
        dev.error('Couldn’t update local settings with window position: ' + e);
      }
    });
  });

  setApplicationMenu();

  copyAndRenameUserFolder().then(function(pathToUserContent) {
    global.pathToUserContent = pathToUserContent;
    dev.log(`main.js - Will store contents in: ${global.pathToUserContent}`);

    try {
      dev.log(`main.js - Will try to start dodoc at port: ${config.port}`);
      portscanner.findAPortNotInUse(config.port, config.port + 20).then((port) => {

        dev.log(`main.js - Found available port: ${port}`);
        app.port = port;
        global.appInfos.homeURL = `${config.protocol}://${config.host}:${app.port}`;
        global.appInfos.port = app.port;

        app.server = server(app);

        // and load the base url of the app.
        win.loadURL(global.appInfos.homeURL);

        if(dev.isDebug() || global.nodeStorage.getItem('logToFile')) {
          win.webContents.openDevTools();
        }

      })
    } catch (e) {
      dev.error('Couldn’t load app:', e);
    }


    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    });

    win.on('ready-to-show', function() {
      win.show();
      win.focus();
    });

  }, function(err) {
    dev.error( 'Failed to check existing content folder : ' + err);
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

function setApplicationMenu() {
  // Create the Application's main menu
  var template = [{
    label: 'do•doc',
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
        label: 'Hide do•doc',
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
        click: function() { app.quit(); }
      },
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
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'Command+R',
        click: function() { BrowserWindow.getFocusedWindow().reload(); }
      },
      {
        label: 'Toggle DevTools',
        accelerator: 'Alt+Command+I',
        click: function() { BrowserWindow.getFocusedWindow().toggleDevTools(); }
      },
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
      },
    ]
  },
  {
    label: 'Help',
    submenu: []
  }];

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function copyAndRenameUserFolder() {
  return new Promise(function(resolve, reject) {

    // check if nodeStorage has a userDirPath field
    let userDirPath = '';
    try {
      userDirPath = global.nodeStorage.getItem('userDirPath');
      dev.log('global.nodeStorage.getItem("userDirPath") : ' + global.nodeStorage.getItem('userDirPath'));
    } catch (err) {
      dev.log('Fail loading node storage for userDirPath');
      // the file is there, but corrupt. Handle appropriately.
    }

    // if it has an empty userDirPath
    if(userDirPath === '') {
      dev.log('Missing path to dodoc parent folder');
      try {
        userDirPath = dialog.showOpenDialog({
          title: 'Sélectionnez le dossier qui contiendra le contenu de dodoc',
          defaultPath: app.getPath('documents'),
          properties: ['openDirectory']
        })[0];
        dev.log('A path was picked: ' + userDirPath);
      } catch(err){
        dev.log('Cancel was click, not path selected. Settings userDirPath back to default.');
        userDirPath = app.getPath(config.userDirPath);
      }
      global.nodeStorage.setItem('userDirPath', userDirPath);
    }

    // if it has a non-empty userDirPath, lets use it
    else if(userDirPath !== null && userDirPath.length > 0) {
      dev.log('Found usable userDirPath:' + userDirPath);
    }

    // if it doens't have a userDirPath
    else {
      dev.log('No usable userDirPath, using default');
      userDirPath = app.getPath(config.userDirPath);
    }

    const pathToUserContent = path.join(userDirPath, config.userDirname);
    const sourcePathInApp = path.join(app.getAppPath(), `user`);

    fs.access(pathToUserContent, fs.F_OK, function(err) {
      // if dodoc folder doesn't exist yet at destination
      if(err) {
        dev.log('Content folder ' + config.userDirname + ' does not already exists in ' + userDirPath);
        dev.log('->duplicating /user to create a new one');
        fs.copy(sourcePathInApp, pathToUserContent, function (err) {
          if(err) {
            dev.error('failed to copy: ' + err);
            reject(err);
          }
          resolve(pathToUserContent);
        });
      } else {
        dev.log('Content folder ' + config.userDirname + ' already exists in ' + userDirPath);
        dev.log('->not creating a new one');

        // now we’ll check if that content folder contains the same folders
        // this is done to simplify installation of dodoc v6 (where the templates folder has changed)
        // but it’ll make it easier down the line to correct a corrupted installation

        // list all folders and files in sourcePathInApp
        fs.readdir(sourcePathInApp, function (err, filenames) {
          if (err) return dev.error(`Couldn't read sourcePathInApp: ${err}`);

          var sourceFolders = filenames.filter( function(slugFolderName){ return new RegExp( dodoc.settings().regexpMatchFolderNames, 'i').test( slugFolderName); });

          // list all folders and files in pathToUserContent
          fs.readdir(pathToUserContent, function (err, filenames) {
            if (err) return dev.error(`Couldn't read pathToUserContent: ${err}`);

            var userFolders = filenames.filter( function(slugFolderName){ return new RegExp( dodoc.settings().regexpMatchFolderNames, 'i').test( slugFolderName); });

            // now, find what’s missing
            let tasks = [];

            sourceFolders.forEach(function(sourceFolder) {
              if(!userFolders.includes(sourceFolder)) {
                dev.log(`One user folder is missing from ${pathToUserContent}: ${sourceFolder}. Will attempt to copy it.`);
                let copyFolderToUserPath = new Promise((resolve, reject) => {
                  fs.copy(path.join(sourcePathInApp, sourceFolder), path.join(pathToUserContent, sourceFolder), function (err) {
                    if(err) {
                      dev.error('failed to copy: ' + err);
                      reject(err);
                    }
                    resolve();
                  });
                });
                // if missing in user folders, copy over
                tasks.push(copyFolderToUserPath);
              }
            });

            Promise.all(tasks).then(() => {
              resolve(pathToUserContent);
            });
          });
        });
      }
    });
  });
}