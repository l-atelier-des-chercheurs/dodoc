var path = require('path');
var fs = require('fs-extra');
var clientFTP = require('ftp');
var ftpSync = require('ftpsync');

var dodoc  = require('../dodoc');
var dodocAPI = require('./dodoc-api');
var dodocPubli = require('./dodoc-publi');
var dev = require('./dev-log');

var publiWebsite = (function() {

  const API = {
    makeWebsite                : (d) => makeWebsite(d),
    sendFilesToServerViaFTP    : (d)         => sendFilesToServerViaFTP(d),
  };

  function makeWebsite(d){
    return new Promise(function(resolve, reject) {
      dev.logfunction( `EVENT - makeWebsite: ${JSON.stringify(d, null, 4)}`);

      var publicationsFolder = path.join(dodocAPI.getUserPath(), dodoc.settings().exportedPubliDir);
      var currentDate = dodocAPI.getCurrentDate();

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

        tasks.push(_copyFiles(path.join('client', 'css'), webPubliFolderPath, 'style.css') );
        tasks.push(_copyFiles(path.join('client', 'bower_components', 'jquery', 'dist'), webPubliFolderPath, 'jquery.min.js') );
        tasks.push(_copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate), webPubliFolderPath, 'script.js') );
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
          }).then(arrayImages => {

            let returnData = {
              pathToWebsiteFolder: webPubliFolderPath,
              dateOfExport: currentDate
            };

            _checkInternetConnection(webPubliFolderPath, arrayImages, currentDate).then((status) => {
              dev.log(`Has internet`);
              returnData.is_internetConnected = true;
              resolve(returnData);
            }, function(reason) {
              dev.error(`No internet`);
              returnData.is_internetConnected = false;
              resolve(returnData);
            });
          }).catch(reason => {
            dev.error(`Failed to copy images.`);
            reject();
          });
        });

      });
    });
  }

  function sendFilesToServerViaFTP(d){
    return new Promise(function(resolve, reject) {
      dev.logfunction( 'EVENT - sendFilesToServerViaFTP : ' + JSON.stringify(d, null, 4));

      // this is pretty stupid : we just need to upload the folder’s content and be done with it
      // or, at least, iterate with its content and upload that

      var remote = path.join(d.sousDossierFtp, d.slugPubliName, d.dateOfExport);
      dev.logverbose('Attempting creation of folder on server at path: ' + serverFolder);

      var options = {
        host: d.FTPsettings.host,
        user: d.FTPsettings.user,
        pass: d.FTPsettings.pass,
        local: d.pathToWebsiteFolder,
        remote: remote
      };

      ftpSunc.settings = options;
      ftpSync.run(function(err, result) {

      };



            const urlToPubli = d.baseURL.endsWith('/') ? d.baseURL + serverFolder : d.baseURL + '/' + serverFolder;

            // otherwise just concatenate strings
            dev.log('Publication was transferred and is now at: ' + urlToPubli);
            resolve(urlToPubli);

/*
      var webPubliFolderPath = d.webPubliFolderPath
      // instance for FTP client
      var c = new clientFTP();
      var serverFolder = path.join(d.sousDossierFtp, d.slugPubliName, d.currentDate);
      dev.logverbose('Attempting creation of folder on server at path: ' + serverFolder);

      c.on('ready', function() {
        c.mkdir(serverFolder, true,  function(err) {
          if (err) {
            dev.logverbose('Couldn\'t create folder on server. ' + err);
            require('../sockets').notifyUser();
            reject(err);
          } else {
            dev.log('Folder create on server transferred successfully!');
          }

          c.put(path.join(webPubliFolderPath, 'index.html'), path.join(serverFolder,'index.html'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose('HTML File transferred successfully!');
          });
          c.put(path.join(webPubliFolderPath, 'jquery.min.js'), path.join(serverFolder,'jquery.min.js'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose('Jquery File transferred successfully!');
          });
          c.put(path.join(webPubliFolderPath, 'script.js'), path.join(serverFolder, 'script.js'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose('JS File transferred successfully!');
          });
          c.put(path.join(webPubliFolderPath, 'style.css'), path.join(serverFolder,'style.css'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose('CSS File transferred successfully!');
          });
          c.put(path.join(webPubliFolderPath, 'template.css'), path.join(serverFolder,'template.css'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose('CSS File transferred successfully!');
          });
          c.mkdir(path.join(serverFolder, 'medias'), function(err) {
            if (err) dev.error('medias not transferred:' + err);
            else dev.logverbose('Medias folder created successfully!');
            for(var fileName in d.images){
              c.append(path.join(webPubliFolderPath, 'medias', d.images[fileName]), path.join(serverFolder,'medias', d.images[fileName]), function(err) {
                if (err) dev.error('not transferred:' + err);
                else {
                  dev.logverbose('media transferred ' + d.images[fileName]);
                }
              });
            }
            c.end();

            const urlToPubli = d.baseURL.endsWith('/') ? d.baseURL + serverFolder : d.baseURL + '/' + serverFolder;

            // otherwise just concatenate strings
            dev.log('Publication was transferred and is now at: ' + urlToPubli);
            resolve(urlToPubli);
          });

        });
      });

      c.on('error', function(err){
        dev.error('can’t connect to the server : '+ err);
        reject();
      });

      c.connect({
        host: d.host,
        user: d.user,
        password: d.pass
      });
*/
    });
  }

  function saveImagesLocal(webMediasFolderPath, slugFolderName, slugProjectName, slugPubliName){
    return new Promise(function(resolve, reject) {
      var arrayImages = [];
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
                arrayImages.push(fileName);
                try {
                  fs.copySync(oldPath, newPath);
                  resolve(arrayImages);
                  dev.log('success!');
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

  function _checkInternetConnection(webPubliFolderPath, arrayImages, currentDate){
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

  function _copyFiles(sourceFolder, destFolder, filename) {
    //sourceFile, destFile
    return new Promise(function(resolve, reject) {
      dev.logfunction('COMMON — _copyFiles');

      let sourceFile = path.join(sourceFolder, filename);
      let destFile = path.join(destFolder, filename);

      fs.unlink(destFile, function(err){
        fs.access(sourceFile, fs.F_OK, function(err) {
          if (!err) {
            fs.copy(sourceFile, destFile, function(err){
              if(err) {
                dev.error(err);
                reject();
              } else {
                dev.log(`Copy files from ${sourceFile} into ${destFile}`);
                resolve(destFile);
              }
            });
          } else {
            dev.log(`No ${sourceFile} file in this template`);
            resolve();
          }
        });
      });
    });
  }

  return API;
})();

module.exports = publiWebsite;