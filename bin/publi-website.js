var path = require('path');
var fs = require('fs-extra');
var clientFTP = require('ftp');
var FtpDeploy = require('ftp-deploy');
var archiver = require('archiver');

var dodoc  = require('../dodoc');
var dodocAPI = require('./dodoc-api');
var dodocPubli = require('./dodoc-publi');
var dev = require('./dev-log');

var publiWebsite = (function() {

  const API = {
    makeWebsite                : (d) => makeWebsite(d),
    sendFilesToServerViaFTP    : (d) => sendFilesToServerViaFTP(d)
  };

  function makeWebsite(d){
    return new Promise(function(resolve, reject) {
      dev.logfunction( `EVENT - makeWebsite: ${JSON.stringify(d, null, 4)}`);

      var publicationsFolder = path.join(dodocAPI.getUserPath(), dodoc.settings().exportedPubliDir);
      var currentDate = dodocAPI.getCurrentDate();

      var publicationsFolderRelativePath = path.join('/', dodoc.settings().exportedPubliDir, d.slugFolderName, d.slugProjectName, d.slugPubliName, 'web', currentDate);

      dodocAPI.makeFolderAtPath(d.slugFolderName, publicationsFolder)
      .then(exportFolderPath => {
        return dodocAPI.makeFolderAtPath(d.slugProjectName,exportFolderPath);
      })
      .then(exportProjectPath => {
        return dodocAPI.makeFolderAtPath(d.slugPubliName,exportProjectPath);
      })
      .then(exportPubliPath => {
        return dodocAPI.makeFolderAtPath('web', exportPubliPath)
      })
      .then(webFolderPath => {
        return dodocAPI.makeFolderAtPath(currentDate, webFolderPath)
      })
      .then(webPubliFolderPath => {
        let tasks = [];
        const clientPath = path.join(require('electron').app.getAppPath(), `client`);

        tasks.push(_copyFiles(path.join(clientPath, 'css'), webPubliFolderPath, 'style.min.css'));

        // copy font files
        let copyFontFiles = new Promise((resolve, reject) => {
          fs.readdir(path.join(clientPath, 'fonts', 'Fira'), (err, filenames) => {
            if(err) {
              dev.error(`Couldn’t read font dir : ${err}`);
              resolve();
            };

            var files = filenames.filter((filename) => {
              return !new RegExp( dodoc.settings().regexpMatchFolderNames, 'i').test(filename) && filename !== ".DS_Store";
            });

            let tasks = [];
            files.map((name) => {
              tasks.push(_copyFiles(path.join(clientPath, 'fonts', 'Fira'), path.join(webPubliFolderPath, 'fonts'), name));
            });
            Promise.all(tasks).then(() => {
              resolve();
            });
          });
        });
        tasks.push(copyFontFiles);

        // JS will be implemented later
/*
        tasks.push(_copyFiles(path.join(clientPath, 'bower_components', 'jquery', 'dist'), webPubliFolderPath, 'jquery.min.js') );
        tasks.push(_copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate), webPubliFolderPath, 'script.js') );
*/
        tasks.push(_copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate), webPubliFolderPath, 'template.css') );

        let createIndexHTMLFile = new Promise((resolve, reject) => {
          dodocAPI.storeData(path.join(webPubliFolderPath, 'index.html'), d.html, 'update').then((newPubliData) => {
            resolve();
          }, function() {
            dev.error(`--> Couldn\'t create index.html for publi file.`);
            reject(`Failed to create publi`);
          });
        });

        tasks.push(createIndexHTMLFile);

        Promise.all(tasks).then(() => {
          dodocAPI.makeFolderAtPath('medias', webPubliFolderPath).then(webMediasFolderPath => {
            return saveImagesLocal(webMediasFolderPath, d.slugFolderName, d.slugProjectName, d.slugPubliName);
          }).then(() => {

            let returnData = {
              pathToWebsiteFolder: webPubliFolderPath,
              dateOfExport: currentDate,
              slugPubliName: d.slugPubliName,
              publicationsFolderRelativePath
            };

            _makeZIPFromFolder(webPubliFolderPath).then(function() {
              dev.logverbose(`Now checking internet connection.`);

              _checkInternetConnection().then((status) => {
                dev.log(`Has internet`);
                returnData.is_internetConnected = true;
                resolve(returnData);
              }, function(reason) {
                dev.error(`No internet`);
                returnData.is_internetConnected = false;
                resolve(returnData);
              });
            }, function(error) {
              dev.error(`Failed to ZIP folder: ${error}`);
              reject();
            });

          }, function(reason) {
            dev.error(`Failed to copy images: ${reason}`);
            reject();
          });
        });

      });
    });
  }

  function sendFilesToServerViaFTP(d){
    return new Promise(function(resolve, reject) {
      dev.logfunction( 'EVENT - sendFilesToServerViaFTP : ' + JSON.stringify(d, null, 4));

      var remote = path.join(d.sousDossierFtp, d.slugPubliName, d.dateOfExport);
      dev.logverbose(`Attempting creation of folder on server at path: ${remote}`);

      var config = {
        host: d.FTPsettings.host,
        username: d.FTPsettings.user,
        password: d.FTPsettings.pass,
        port: 21,
        localRoot: d.pathToWebsiteFolder,
        remoteRoot: remote,
        continueOnError: true
      };

      // can’t create folders with FTP deploy
      var c = new clientFTP();

      c.on('error', function(err){
        dev.error('can’t connect to the server : '+ err);
        reject(err);
      });
      c.on('ready', function() {
        c.mkdir(remote, true,  function(err) {
          if (err) {
            dev.error(`Couldn’t create folder on server: ${err}`);
            reject(err);
          } else {

            var ftpDeploy = new FtpDeploy();

            // FtpDeploy doesn’t like when
            config.remoteRoot = '/' + remote;

            dev.logverbose('Folder created on server successfully.');
            ftpDeploy.on('uploading', function(data) {
              dev.logverbose(`Uploading files to ${config.remoteRoot} --> file ${data.filename} at ${data.percentComplete}%`);
              // <em>${data.filename}</em> —
              require('../sockets').notifyUser(dodoc.lang().uploadingFiles + ' ' + data.percentComplete + '%');
            });

            ftpDeploy.on('upload-error', function (data) {
              dev.error(data.err); // data will also include filename, relativePath, and other goodies
            });

            ftpDeploy.deploy(config, function(err) {
              if(err) {
                dev.error(err);
                reject(err);
              } else {
                dev.log('sendFilesToServerViaFTP / ftpDeploy finished sending content');
                const urlToPubli =  d.FTPsettings.baseURL + config.remoteRoot;
                dev.log('Publication was transferred and is now at: ' + urlToPubli);
                resolve(urlToPubli);
              }
            });

          }
        });
      });

      c.connect({
        host: config.host,
        user: config.username,
        password: config.password
      });

    });
  }

  function saveImagesLocal(webMediasFolderPath, slugFolderName, slugProjectName, slugPubliName){
    return new Promise(function(resolve, reject) {
      dev.logfunction( 'publiWebsite — saveImagesLocal');
      dodocPubli.listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName).then(function(publi) {
        for (var prop in publi) {
          var medias = publi[prop].medias;
          for(var index in medias){
            var media = medias[index];
            for(var fichiers in media){
              var eachFiles = media[fichiers].files;
              var mediaFolder = media[fichiers].mediaFolderPath;
              for(var fileToCopy in eachFiles){
                var fileName = eachFiles[fileToCopy];
                var oldPath = path.join( dodocAPI.getProjectPath(slugFolderName, slugProjectName), mediaFolder, fileName);
                var newPath = path.join( webMediasFolderPath, fileName);
                try {
                  fs.copySync(oldPath, newPath);
                  resolve();
                  dev.logverbose(`Saved image successful for ${fileName}`);
                } catch (err) {
                  dev.error(err);
                  reject();
                }
              }
            }

          }
        }
      }, function(error) {
        dev.error('Failed to list one media! Error: ', error);
        reject();
      });
    });
  };

  function _checkInternetConnection() {
    return new Promise(function(resolve, reject) {
      dev.logfunction('publiWebsite — _checkInternetConnection');
      require('dns').resolve('www.wikipedia.org', function(err) {
        if(err) {
          dev.error(`No connection: ${err}`);
          reject(`No internet connection.`);
        } else {
          dev.log('Connected to Internet');
          resolve(`Internet is available`);
        }
      });
    });
  }

  function _makeZIPFromFolder(folderPath) {
    return new Promise((resolve, reject) => {
      dev.logfunction(`_makeZIPFromFolder — ${folderPath}`);
      	// creating archives
      	let zipPath = folderPath + '.zip';

      var output = fs.createWriteStream(zipPath);
      var archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });

      output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        dev.logverbose(`Successfully made a ZIP`);
        resolve();

      });

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          // log warning
          dev.error(err);
        } else {
          // throw error
          dev.error(err);
        }
      });
      // good practice to catch this error explicitly
      archive.on('error', function(err) {
        dev.error(err);
      });

      archive.pipe(output);

      archive.directory(folderPath, false);

      archive.finalize();
    });
  }

  function _copyFiles(sourceFolder, destFolder, filename) {
    //sourceFile, destFile
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON — _copyFiles: ${filename} from ${sourceFolder} to ${destFolder}`);

      let sourceFile = path.join(sourceFolder, filename);
      let destFile = path.join(destFolder, filename);

      fs.unlink(destFile, function(err){
        fs.access(sourceFile, fs.F_OK, function(err) {
          if (!err) {
            fs.copy(sourceFile, destFile, function(err){
              if(err) {
                dev.error(`Failed to copy ${filename} from ${sourceFile} into ${destFile}: ${err}`);
                reject();
              } else {
                dev.log(`Copy files from ${sourceFile} into ${destFile}`);
                resolve(destFile);
              }
            });
          } else {
            dev.log(`No ${sourceFile} file found.`);
            resolve();
          }
        });
      });
    });
  }

  return API;
})();

module.exports = publiWebsite;