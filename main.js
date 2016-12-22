const electron = require('electron');
const {app, BrowserWindow} = electron;

const path = require('path');
const fs = require('fs-extra');
const flags = require('flags');
var dev = require('./bin/dev-log');
const {dialog} = require('electron')

const config = require('./config.json');
const dodoc = require('./dodoc');
const dodocAPI = require('./bin/dodoc-api');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

app.commandLine.appendSwitch('--ignore-certificate-errors');

function createWindow () {

  var JSONStorage = require('node-localstorage').JSONStorage;
  var storageLocation = app.getPath('userData');
  global.nodeStorage = new JSONStorage(storageLocation);

  flags.defineBoolean('debug');
  flags.defineBoolean('verbose');
  flags.parse();

  const debug = flags.get('debug');
  const verbose = flags.get('verbose');
  dev.init(debug, verbose);

  if( global.dodoc === undefined)
    global.dodoc = {};
  global.dodoc.homeURL = `${config.protocol}://${config.host}:${config.port}`;

  // Create the browser window.
  win = new BrowserWindow({
    width: 1180,
    height: 700,
    backgroundColor: '#EBEBEB',
    icon: __dirname + '/build/icon.ico',
    webPreferences: {
      allowDisplayingInsecureContent: true,
      allowRunningInsecureContent: true,
      nodeIntegration: true
    }
  });
  // win.maximize();

  win.focus();

  copyAndRenameUserFolder().then(function(pathToUserContent) {

    global.pathToUserContent = pathToUserContent;
    dev.log('Will store contents in: ' + global.pathToUserContent);

    try {
      app.server = require('./server')(app);
    }
    catch (e) {
      dev.error('Couldn’t load app:', e);
    }

    // and load the base url of the app.
    win.loadURL(global.dodoc.homeURL);

    // Open the DevTools.
    if(dev.isDebug())
      win.webContents.openDevTools();


    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
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
      userDirPath = dialog.showOpenDialog({
        title: 'Sélectionnez le dossier qui contiendra le contenu de dodoc',
        defaultPath: app.getPath("documents"),
        properties: ['openDirectory']
      })[0];
      dev.log('A path was picked: ' + userDirPath);
      global.nodeStorage.setItem('userDirPath', userDirPath);
    } else

    // if it has a non-empty userDirPath, lets use it
    if(userDirPath !== null && userDirPath.length > 0) {
      dev.log('Found usable userDirPath:' + userDirPath);
    }

    // if it doens't have a userDirPath
    else {
      dev.log('No usable userDirPath, using default');
      userDirPath = app.getPath(config.userDirPath);
    }

    const pathToUserContent = path.join(userDirPath, config.userDirname);

    fs.access(pathToUserContent, fs.F_OK, function(err) {
      // if dodoc folder doesn't exist yet at destination
      if(err) {
        dev.log('Content folder ' + config.userDirname + ' does not already exists in ' + userDirPath);
        dev.log('->duplicating /user to create a new one');
        const sourcePathInApp = path.join(__dirname, dodoc.userDirname)
        fs.copy(sourcePathInApp, pathToUserContent, {clobber: false}, function (err) {
          if(err) reject(err);
          resolve(pathToUserContent);
        });
      } else {
        dev.log('Content folder ' + config.userDirname + ' already exists in ' + userDirPath);
        dev.log('->not creating a new one');
        resolve(pathToUserContent);
      }
    });
  });
}
