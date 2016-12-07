var path = require('path');
var fs = require('fs-extra');
var Client = require('ftp');

var dodoc  = require('../dodoc');
var dodocAPI = require('./dodoc-api');
var dodocPubli = require('./dodoc-publi');

var exportPubliToFtp = (function() {

  const API = {
    exportPubliToFtp     : function(socket, d) { return exportPubliToFtp(socket, d); },
    sendFileToServer     : function(socket, d) { return sendFileToServer(socket, d); },
  };

  function exportPubliToFtp(socket, d){
    dev.logfunction( "EVENT - exportPubliToFtp");

    var folderName = d.slugFolderName;
    var projectName = d.slugProjectName;
    var publiName = d.slugPubliName;
    var publicationsFolder = path.join(dodocAPI.getUserPath(), dodoc.exportedPubliDir);
    var webFolderName = "web";
    var webMediasFolderName = "medias";
    var currentDate = dodocAPI.getCurrentDate();
    
    createExportPubliFolder(folderName, publicationsFolder).then(function(exportFolderPath){
      createExportPubliFolder(projectName,exportFolderPath).then(function(exportProjectPath){
        createExportPubliFolder(publiName, exportProjectPath).then(function(exportPubliPath){
          createExportPubliFolder(webFolderName, exportPubliPath).then(function(webFolderPath){
            createExportPubliFolder(currentDate, webFolderPath).then(function(webPubliFolderPath){
              copyFiles(path.join('app', 'client', 'css', 'style.css'), path.join(webPubliFolderPath, 'style.css'));
              copyFiles(path.join('app', 'client', 'bower_components', 'jquery', 'dist', 'jquery.min.js'), path.join(webPubliFolderPath, 'jquery.min.js'));
              copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate, 'script.js'), path.join(webPubliFolderPath, 'script.js'));
              copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate, 'style.css'), path.join(webPubliFolderPath, 'template.css'));
              fs.writeFile(path.join(webPubliFolderPath, "index.html"), d.html);
              createExportPubliFolder(webMediasFolderName, webPubliFolderPath).then(function(webMediasFolderPath){
                saveImagesLocal(webMediasFolderPath, d.slugFolderName, d.slugProjectName, d.slugPubliName).then(function(arrayImages){
                  checkInternetConnection(webPubliFolderPath, arrayImages, currentDate, socket);
                });
              });
            });
          });
        });
      });
    });
  }

  function sendFileToServer(socket, data){
  
      var domain = data.domain;
      var domainFolder = data.dossierFtp
      var webPubliFolderPath = data.webPubliFolderPath
      // instance for FTP Client
      var c = new Client();
      var serverFolder = path.join( domainFolder, data.slugPubliName, data.currentDate);

      c.on('ready', function() {
        c.mkdir(serverFolder,  function(err) {
          if (err) console.log(data.slugPubliName+ ' already exist' + err);
          else {
            console.log("Folder create on server transferred successfully!");
          }
          c.put(path.join(webPubliFolderPath, 'index.html'), path.join(serverFolder,'index.html'), function(err) {
            if (err) console.log('not transferred:' + err);
            else console.log("HTML File transferred successfully!");
          });
          c.put(path.join(webPubliFolderPath, 'jquery.min.js'), path.join(serverFolder,'jquery.min.js'), function(err) {
            if (err) console.log('not transferred:' + err);
            else console.log("Jquery File transferred successfully!");
          });
          c.put(path.join(webPubliFolderPath, 'script.js'), path.join(serverFolder, 'script.js'), function(err) {
            if (err) console.log('not transferred:' + err);
            else console.log("JS File transferred successfully!");
          });
          c.put(path.join(webPubliFolderPath, 'style.css'), path.join(serverFolder,'style.css'), function(err) {
            if (err) console.log('not transferred:' + err);
            else console.log("CSS File transferred successfully!");
          });
          c.put(path.join(webPubliFolderPath, 'template.css'), path.join(serverFolder,'template.css'), function(err) {
            if (err) console.log('not transferred:' + err);
            else console.log("CSS File transferred successfully!");
          });
          c.mkdir(path.join(serverFolder, 'medias'), function(err) {
            if (err) console.log('medias: not transferred:' + err);
            else console.log("Medias folder created successfully!");
            for(var fileName in data.images){
              c.append(path.join(webPubliFolderPath, 'medias', data.images[fileName]), path.join(serverFolder,'medias', data.images[fileName]), function(err) {
                if (err) console.log('not transferred:' + err);
                else {
                  console.log("media transferred " + data.images[fileName]);
                }
              });
            }
            console.log("Publication was transferred at: "+domain+'/'+domainFolder+'/'+data.slugPubliName);
            socket.emit('pubiTransferred');
            c.end();
            
          });
          
        });
      });

      c.on('error', function(err){
        console.log("can't connect to the server : "+ err);
        socket.emit('cannotConnectFtp');
      }); 

      c.connect({
        host: data.host,
        port: data.port,
        user: data.user,
        password: data.pass
      });
  }

  function saveImagesLocal(webMediasFolderPath, slugFolderName, slugProjectName, slugPubliName){
    var arrayImages = [];
    return new Promise(function(resolve, reject) {
      dev.logfunction( "UploadToFTP — saveImagesLocal");
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
                  console.log("success!");
                } catch (err) {
                  console.log.error(err);
                  reject();
                }
              }
            }

          }
        }
      }, function(error) {
        console.log("Failed to list one media! Error: ", error);
        reject();
      });
    });
  };

  function checkInternetConnection(webPubliFolderPath, arrayImages, currentDate, socket){
    // check internet connection
    return new Promise(function(resolve, reject) {
      dev.logfunction( "UploadToFTP — checkInternetConnection");
      require('dns').resolve('www.google.com', function(err) {
        console.log('DNS - ' + err);
        if(err) {
          console.log("No connection");
          socket.emit('noConnection', webPubliFolderPath);
          reject();
        }else{
          console.log("you are connected to internet you can send your file!");
          socket.emit('webConnectionFound', webPubliFolderPath, arrayImages, currentDate);
          resolve();
        }
      });
    });
  }

  function sendImageToServer(arrayImages, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, c, domainFolder, domain, socket) {
    for(var fileName in arrayImages){
      c.append(mediasPath + '/' + arrayImages[fileName], domainFolder+'/'+ slugPubliName+'/medias/'+arrayImages[fileName], function(err) {
        if (err) console.log('not transferred:' + err);
        else {
          console.log("media transferred");
        }
      });
    }
    console.log("Publication was transferred at: "+domain+domainFolder+'/'+slugPubliName);
    socket.emit('pubiTransferred', domain+domainFolder+'/'+slugPubliName);
    c.end();
  }


  function copyFiles(sourceFile, destFile){
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — copyFiles");
      fs.unlink(destFile, function(err){
        fs.access(sourceFile, fs.F_OK, function(err) {
          if (!err) {
            fs.copy(sourceFile, destFile, function(err){
              if(err) {
                console.log(err);
                reject();
              } else {
                console.log("Copy files from " + sourceFile + " into " + destFile);
                resolve(destFile);
              }
            });   
          } else {
            console.log("No " + sourceFile + " file in this template");
          }
        });
      });
    });
  };

  function createExportPubliFolder(name, path) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — createExportPubliFolder");

      var folderName = name;
      var folderPath = path+'/'+name;

      fs.access( folderPath, fs.F_OK, function( err) {
        // if there's nothing at path
        if(err) {
          console.log("New folder created with name " + folderName + " and path " + path);
          fs.ensureDirSync(folderPath);//write new folder in folders
          resolve(folderPath);
        } else {
          console.log("Folder already exist");
          // reject();
          resolve(folderPath);
        }
      });

    });
  }
  
  return API;
})();

module.exports = exportPubliToFtp;