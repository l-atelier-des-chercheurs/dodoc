const electron = require('electron');
const {app, BrowserWindow} = electron;

const path = require('path');
const fs = require('fs-extra');
const flags = require('flags');
const devLog = require('./bin/dev-log');
const {dialog} = require('electron')

const config = require('./config.json');
const dodoc = require('./dodoc');
const dodocAPI = require('./bin/dodoc-api');


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

  if( global.dodoc === undefined)
    global.dodoc = {};
  global.dodoc.homeURL = `${config.protocol}://${config.host}:${config.port}`;

  var JSONStorage = require('node-localstorage').JSONStorage;
  var storageLocation = app.getPath('userData');
  global.nodeStorage = new JSONStorage(storageLocation);

  // check if content folder exists
  console.log('Will store contents in: ' + global.userDirname);

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

  win.focus();

  copyAndRenameUserFolder().then(function(dodocPath) {

    global.userDirname = dodocPath;

    try {
      app.server = require('./server')(app);
    }
    catch (e) {
      console.log('Couldn’t load app:', e);
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

    // check if nodeStorage has a userDirpath field
    let userDirpath = '';
    try {
      userDirpath = global.nodeStorage.getItem('userDirpath');
      console.log('global.nodeStorage.getItem("userDirpath") : ' + global.nodeStorage.getItem('userDirpath'));
    } catch (err) {
      console.log('Fail loading node storage for userDirpath');
      // the file is there, but corrupt. Handle appropriately.
    }

    // if it has an empty userDirpath
    if(userDirpath === '') {
      console.log('Missing path to dodoc parent folder');
      userDirpath = dialog.showOpenDialog({
        title: 'Sélectionnez le dossier qui contiendra le contenu de dodoc',
        defaultPath: app.getPath("documents"),
        properties: ['openDirectory']
      })[0];
      console.log('A path was picked: ' + userDirpath);
      global.nodeStorage.setItem('userDirpath', userDirpath);
    } else

    // if it has a non-empty userDirpath, lets use it
    if(userDirpath !== null && userDirpath.length > 0) {
      console.log('Found usable userDirpath:' + userDirpath);
    }

    // if it doens't have a userDirPath
    else {
      console.log('No usable userDirpath, using default');
      userDirpath = app.getPath(config.userDirpath);
    }

    const dodocPathInUser = path.join(userDirpath, config.userDirname);

    fs.access(dodocPathInUser, fs.F_OK, function(err) {
      // if dodoc folder doesn't exist yet at destination
      if(err) {
        console.log('Content folder ' + config.userDirname + ' does not already exists in ' + userDirpath);
        console.log('->duplicating /user to create a new one');
        const sourcePathInApp = path.join(__dirname, dodoc.userDirname)
        fs.copy(sourcePathInApp, dodocPathInUser, {clobber: false}, function (err) {
          if(err) reject(err);
          resolve(dodocPathInUser);
        });
      } else {
        console.log('Content folder ' + config.userDirname + ' already exists in ' + config.userDirpath);
        console.log('->not creating a new one');
        resolve(dodocPathInUser);
      }
    });
  });
}
