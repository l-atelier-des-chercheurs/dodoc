const electron = require('electron');
const {app, BrowserWindow} = electron;
const path = require('path');
const fs = require('fs-extra');
const flags = require('flags');
const devLog = require('./app/bin/dev-log');
const {dialog} = require('electron')

const config = require('./app/config.json');
const dodoc = require('./app/dodoc');
const dodocAPI = require('./app/bin/dodoc-api');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

app.commandLine.appendSwitch('--ignore-certificate-errors');

function createWindow () {

  flags.defineBoolean('debug');
  flags.defineBoolean('verbose');
  flags.parse();
  var isDebugMode = flags.get('debug');
  var isVerbose = flags.get('verbose');
  global.dev = devLog(isDebugMode, isVerbose);

  // check if content folder exists
  copyAndRenameUserFolder().then(function(dodocPath) {

    global.userDirname = dodocPath;
    console.log('Will store contents in: ' + global.userDirname);

    if(dev.isDebug()) {
      const contextMenu = require('electron-context-menu')({
/*
        prepend: (params, browserWindow) => [{
          label: 'Rainbow',
          // only show it when right-clicking images
          visible: params.mediaType === 'image'
        }]
*/
      });
    }

    try {
      app.server = require(path.join(__dirname, 'app', 'server'))(app);
    }
    catch (e) {
      console.log('Couldn’t load app:', e);
    }

    // const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize


    // Create the browser window.
    win = new BrowserWindow({
      width: 1180,
      height: 700,
      backgroundColor: '#EBEBEB',
      webPreferences: {
        allowDisplayingInsecureContent: true,
        allowRunningInsecureContent: true,
        nodeIntegration: true
      }
    });
    // win.maximize();

    // and load the base url of the app.
    win.loadURL(`${config.protocol}://${config.host}:${config.port}`);

    // Open the DevTools.
    if(dev.isDebug())
      win.webContents.openDevTools();

    win.focus();

    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    });
  }, function(err) {
    console.log( 'Failed to check existing content folder : ' + err);
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
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
})


function copyAndRenameUserFolder() {
  return new Promise(function(resolve, reject) {

    if(!config.userDirpath) {
      console.log('Missing path to dodoc parent folder');
      config.userDirpath = dialog.showOpenDialog({
        title: 'Sélectionnez le dossier qui contiendra le contenu de dodoc',
        defaultPath: app.getPath("documents"),
        properties: ['openDirectory']
      })[0];
      console.log('A path was picked: ' + config.userDirpath);

      fs.writeFile( './app/config.json', JSON.stringify(config, null, 2), function(err) {
        if (err) dev.error('Couldn’t update file: ' + err);
        dev.logverbose('. saved config data to config.json');
      }, function() {
        dev.error('--> Couldn’t save config.json data.');
      });
    } else {
      console.log('Path to dodoc folder defined in config.json as: ' + config.userDirpath);
    }

    let userDirPath = config.userDirpath === "documents" ? app.getPath(config.userDirpath) : config.userDirpath;
    const dodocPathInUser = path.join( userDirPath, config.userDirname);

    // if dodoc folder doesn't exist yet at destination
    fs.access(dodocPathInUser, fs.F_OK, function(err) {
      if(!err) {
        console.log('Content folder ' + config.userDirname + ' already exists in ' + config.userDirpath);
        console.log('->not creating a new one');
        resolve(dodocPathInUser);
        return;
      }
      console.log('Content folder ' + config.userDirname + ' does not already exists in ' + config.userDirpath);
      console.log('->duplicating /user to create a new one');
      const sourcePathInApp = path.join(__dirname, 'app', dodoc.userDirname)
      fs.copy(sourcePathInApp, dodocPathInUser, {clobber: false}, function (err) {
        if(err) reject(err);
        resolve(dodocPathInUser);
      });
    });
  });
}
