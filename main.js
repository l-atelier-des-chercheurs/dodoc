const getPath = require('platform-folders');
const path = require('path');
const fs = require('fs-extra');
const portscanner = require('portscanner');
const os = require('os');

const server = require('./server');

const settings = require('./settings.json'),
  dev = require('./core/dev-log'),
  api = require('./core/api'),
  file = require('./core/file');

console.log(
  `Starting app ${require('./package.json').name} v${
    require('./package.json').version
  }`
);
console.log(process.versions);

debugger;

const debug = process.argv.length >= 3 ? process.argv[2] === '--debug' : false;
const verbose =
  process.argv.length >= 4 ? process.argv[3] === '--verbose' : false;
const logToFile = false;

dev.init(debug, verbose, logToFile);

if (dev.isDebug()) {
  process.traceDeprecation = true;
}

if (global.appInfos === undefined) {
  global.appInfos = {};
}

global.appRoot = path.resolve(__dirname);
global.tempStorage = getPath.getCacheFolder();

global.appInfos.version = require('./package.json').version;

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

            global.session_password = hashCode(sessionMeta.session_password);
          }
          portscanner.findAPortNotInUse(settings.port, settings.port + 20).then(
            port => {
              dev.log(`main.js - Found available port: ${port}`);
              global.appInfos.port = port;
              global.appInfos.homeURL = `${settings.protocol}://${
                settings.host
              }:${global.appInfos.port}`;

              server();
            },
            function(err) {
              dev.error('Failed to find available port: ' + err);
            }
          );
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

function copyAndRenameUserFolder() {
  return new Promise(function(resolve, reject) {
    const userDirPath = getPath.getDocumentsFolder();

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
          `${__dirname}`,
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

function readSessionMetaFile() {
  return new Promise(function(resolve, reject) {
    var pathToSessionMeta = api.getFolderPath('meta.txt');
    try {
      var metaFileContent = fs.readFileSync(
        pathToSessionMeta,
        settings.textEncoding
      );
      return resolve(api.parseData(metaFileContent));
    } catch (err) {
      return resolve();
    }
  });
}
