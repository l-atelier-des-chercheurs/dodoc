var path = require('path');
var fs = require('fs-extra');
var clientFTP = require('ftp');

var dodoc  = require('../dodoc');
var dodocAPI = require('./dodoc-api');
var dodocPubli = require('./dodoc-publi');
var dev = require('./dev-log');

var publiFTP = (function() {

  const API = {
    exportPubliToFtp     : (socket, d) => { return exportPubliToFtp(socket, d); },
    sendFileToServer     : (d)         => { return sendFileToServer(d); },
  };

  function exportPubliToFtp(socket, d){

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
      return dodocAPI.makeFolderAtPath("web", exportPubliPath)
    })
    .then(webFolderPath => {
      return dodocAPI.makeFolderAtPath(currentDate, webFolderPath)
    })
    .then(webPubliFolderPath => {
      _copyFiles(path.join('client', 'css', 'style.css'), path.join(webPubliFolderPath, 'style.css'));
      _copyFiles(path.join('client', 'bower_components', 'jquery', 'dist', 'jquery.min.js'), path.join(webPubliFolderPath, 'jquery.min.js'));
      _copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate, 'script.js'), path.join(webPubliFolderPath, 'script.js'));
      _copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate, 'style.css'), path.join(webPubliFolderPath, 'template.css'));

      fs.writeFile(path.join(webPubliFolderPath, "index.html"), d.html);

      dodocAPI.makeFolderAtPath("medias", webPubliFolderPath)
      .then(webMediasFolderPath => {
        return saveImagesLocal(webMediasFolderPath, d.slugFolderName, d.slugProjectName, d.slugPubliName);
      })
      .then(arrayImages => {
        _checkInternetConnection(webPubliFolderPath, arrayImages, currentDate, socket);
      });
    });
  }

  function sendFileToServer(d){
    return new Promise(function(resolve, reject) {
      dev.logfunction( "EVENT - sendFileToServer : " + JSON.stringify(d, null, 4));

      var webPubliFolderPath = d.webPubliFolderPath
      // instance for FTP client
      var c = new clientFTP();
      var serverFolder = path.join(d.dossierFtp, d.slugPubliName, d.currentDate);
      dev.logverbose('Attempting creation of folder on server at path: ' + serverFolder);

      c.on('ready', function() {
        c.mkdir(serverFolder, true,  function(err) {
          if (err) dev.logverbose('Couldn\'t create folder on server. Err: ' + err);
          else {
            dev.log("Folder create on server transferred successfully!");
          }
          c.put(path.join(webPubliFolderPath, 'index.html'), path.join(serverFolder,'index.html'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose("HTML File transferred successfully!");
          });
          c.put(path.join(webPubliFolderPath, 'jquery.min.js'), path.join(serverFolder,'jquery.min.js'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose("Jquery File transferred successfully!");
          });
          c.put(path.join(webPubliFolderPath, 'script.js'), path.join(serverFolder, 'script.js'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose("JS File transferred successfully!");
          });
          c.put(path.join(webPubliFolderPath, 'style.css'), path.join(serverFolder,'style.css'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose("CSS File transferred successfully!");
          });
          c.put(path.join(webPubliFolderPath, 'template.css'), path.join(serverFolder,'template.css'), function(err) {
            if (err) dev.error('not transferred:' + err);
            else dev.logverbose("CSS File transferred successfully!");
          });
          c.mkdir(path.join(serverFolder, 'medias'), function(err) {
            if (err) dev.error('medias not transferred:' + err);
            else dev.logverbose("Medias folder created successfully!");
            for(var fileName in d.images){
              c.append(path.join(webPubliFolderPath, 'medias', d.images[fileName]), path.join(serverFolder,'medias', d.images[fileName]), function(err) {
                if (err) dev.error('not transferred:' + err);
                else {
                  dev.logverbose("media transferred " + d.images[fileName]);
                }
              });
            }
            c.end();
            const urlToPubli = path.join(d.baseURL, serverFolder);
            dev.log("Publication was transferred and is now at: " + urlToPubli);
            resolve(urlToPubli);
          });

        });
      });

      c.on('error', function(err){
        dev.error("can't connect to the server : "+ err);
        reject();
      });

      c.connect({
        host: d.host,
        user: d.user,
        password: d.pass
      });
    });
  }

  function saveImagesLocal(webMediasFolderPath, slugFolderName, slugProjectName, slugPubliName){
    var arrayImages = [];
    return new Promise(function(resolve, reject) {
      dev.logfunction( "publiFTP — saveImagesLocal");
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
                  dev.log("success!");
                } catch (err) {
                  dev.error(err);
                  reject();
                }
              }
            }

          }
        }
      }, function(error) {
        dev.error("Failed to list one media! Error: ", error);
        reject();
      });
    });
  };

  function _checkInternetConnection(webPubliFolderPath, arrayImages, currentDate, socket){
    // check internet connection
    return new Promise(function(resolve, reject) {
      dev.logfunction( "publiFTP — _checkInternetConnection");
      require('dns').resolve('www.google.com', function(err) {
        if(err) {
          dev.log("No connection");
          socket.emit('noConnection', webPubliFolderPath);
          reject();
        }else{
          dev.log("you are connected to internet you can send your file!");
          socket.emit('webConnectionFound', webPubliFolderPath, arrayImages, currentDate);
          resolve();
        }
      });
    });
  }

  function _copyFiles(sourceFile, destFile){
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — _copyFiles");
      fs.unlink(destFile, function(err){
        fs.access(sourceFile, fs.F_OK, function(err) {
          if (!err) {
            fs.copy(sourceFile, destFile, function(err){
              if(err) {
                dev.error(err);
                reject();
              } else {
                dev.log("Copy files from " + sourceFile + " into " + destFile);
                resolve(destFile);
              }
            });
          } else {
            dev.log("No " + sourceFile + " file in this template");
          }
        });
      });
    });
  };

  return API;
})();

module.exports = publiFTP;