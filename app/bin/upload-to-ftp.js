var path = require('path');
var fs = require('fs-extra');

var dodoc  = require('../dodoc');
var dodocAPI = require('./dodoc-api');
var dodocPubli = require('./dodoc-publi');

var exportPubliToFtp = (function() {

  const API = {
    exportPubliToFtp     : function(socket, d) { return exportPubliToFtp(socket, d); },
    createFolders        : function(socket, d) { return createFolders(socket, d); },
  };

  function exportPubliToFtp(socket, d){
    dev.logfunction( "EVENT - exportPubliToFtp");

    createFolders(socket, d);


    // var currentDateString = dodocAPI.getCurrentDate();
    // var projectPath = dodocAPI.getProjectPath( d.slugFolderName, d.slugProjectName);

    // var exportedPubliFolderName = currentDateString + "_" + d.slugPubliName;
    // exportedPubliFolderName = dodocAPI.findFirstFilenameNotTaken( exportedPubliFolderName, dodoc.exportedPubliDir, '');

    // var exportedPubliPath = path.join(dodoc.exportedPubliDir, exportedPubliFolderName);
    // var exportedMediaFolderName = exportedPubliPath + "/" + "medias";

    // // create publi directory with publi name
    // fs.mkdir(exportedPubliPath, function(){
    //   // create medias directory in publi directory
    //   fs.mkdir(exportedMediaFolderName, function(){
    //     // copy css file
    //     exportPubliToFtp.copyFiles('client/css/style.css', exportedPubliPath + "/style.css", function(){
    //       exportPubliToFtp.copyFiles('client/css/templates.css', exportedPubliPath + "/templates.css", function(){
    //         //copy js file
    //         exportPubliToFtp.copyFiles('client/js/production/all.min.js', exportedPubliPath + "/script.min.js", function(){
    //           // create html file
    //           fs.writeFile(exportedPubliPath + "/index.html", d.html, function(){
    //               exportPubliToFtp.saveImagesLocal(projectPath, exportedPubliFolderName, exportedMediaFolderName, d.slugFolderName, d.slugProjectName, d.slugPubliName, socket);
    //           });
    //         });
    //       });
    //     });
    //   });
    // });
  }

  function createFolders(socket, d){
    var folderName = d.slugFolderName;
    var projectName = d.slugProjectName;
    var publiName = d.slugPubliName;
    var publicationsFolder = path.join(dodocAPI.getUserPath(), dodoc.exportedPubliDir);
    var webFolderName = "web";
    var webMediasFolderName = "medias";

    // exportPubliToFtp.copyFiles('client/css/style.css', exportedPubliPath + "/style.css", function(){
    //       exportPubliToFtp.copyFiles('client/css/templates.css', exportedPubliPath + "/templates.css", function(){
    //         //copy js file
    //         exportPubliToFtp.copyFiles('client/js/production/all.min.js', exportedPubliPath + "/script.min.js", function(){
    //           // create html file
    //           fs.writeFile(exportedPubliPath + "/index.html", d.html, function(){
    //               exportPubliToFtp.saveImagesLocal(projectPath, exportedPubliFolderName, exportedMediaFolderName, d.slugFolderName, d.slugProjectName, d.slugPubliName, socket);
    //           });
    //         });
    //       });
    //     });
    
    createExportPubliFolder(folderName, publicationsFolder).then(function(exportFolderPath){
      createExportPubliFolder(projectName,exportFolderPath).then(function(exportProjectPath){
        createExportPubliFolder(publiName, exportProjectPath).then(function(exportPubliPath){
          createExportPubliFolder(webFolderName, exportPubliPath).then(function(webFolderPath){
            createExportPubliFolder(dodocAPI.getCurrentDate(), webFolderPath).then(function(webPubliFolderPath){
              copyFiles(path.join('app', 'client', 'css', 'style.css'), path.join(webPubliFolderPath, 'style.css'));
              copyFiles(path.join('app', 'client', 'bower_components', 'jquery', 'dist', 'jquery.min.js'), path.join(webPubliFolderPath, 'jquery.min.js'));
              copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate, 'script.js'), path.join(webPubliFolderPath, 'script.js'));
              copyFiles(path.join(dodocAPI.getUserPath(), 'templates' , d.currentTemplate, 'style.css'), path.join(webPubliFolderPath, 'template.css'));
              fs.writeFile(path.join(webPubliFolderPath, "index.html"), d.html);
              createExportPubliFolder(webMediasFolderName, webPubliFolderPath).then(function(webMediasFolderPath){
                saveImagesLocal(webMediasFolderPath, d.slugFolderName, d.slugProjectName, d.slugPubliName).then(function(){
                  checkInternetConnection(webPubliFolderPath, socket).then(function(){
                    // sendFileToServer(arrayImages, folderPath, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket);
                  });
                });
              });
            });
          });
        });
      });
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
                  resolve();
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

  function checkInternetConnection(webPubliFolderPath, socket){
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
          socket.emit('webConnectionFound');
          resolve();
        }
      });
    });
  }

  function sendFileToServer(arrayImages, folderPath, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket){
    // config ftp in ftp-config.js
    if(exportConfig !== undefined) {
      var domain = exportConfig.domaineName;
      var domainFolder = exportConfig.subFolder
      // instance for FTP Client
      var c = new Client();

      c.on('ready', function() {
        c.mkdir( path.join( domainFolder, slugPubliName), function(err) {
          if (err) console.log(slugPubliName+ ' not transferred:' + err);
          else {
            console.log("Folder create on server transferred successfully!");
          }
          c.put(folderPath + '/index.html', domainFolder+'/'+ slugPubliName+'/index.html', function(err) {
            if (err) console.log('not transferred:' + err);
            else console.log("HTML File transferred successfully!");
          });
          c.put(folderPath + '/style.css', domainFolder+'/'+ slugPubliName+'/style.css', function(err) {
            if (err) console.log('not transferred:' + err);
            else console.log("CSS File transferred successfully!");
          });
          c.put(folderPath + '/script.min.js', domainFolder+'/'+ slugPubliName+'/script.min.js', function(err) {
            if (err) console.log('not transferred:' + err);
            else console.log("JS File transferred successfully!");
          });

          c.mkdir(domainFolder+'/'+ slugPubliName+'/medias', function(err) {
            if (err) console.log('medias: not transferred:' + err);
            else console.log("File transferred successfully!");
            exportPubliToFtp.sendImageToServer(arrayImages, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, c, domainFolder, domain, socket);
          });
        });
      });


      c.connect({
        host: exportConfig.host,
        port: exportConfig.port,
        user: exportConfig.user,
        password: exportConfig.password
      });
      console.log("Connected");

    } else {
      dev.error("Couldn't find a ftp-config.js with FTP information to use.");
    }
  }

  // sendImageToServer : function(arrayImages, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, c, domainFolder, domain, socket) {
  //   for(var fileName in arrayImages){
  //     c.append(mediasPath + '/' + arrayImages[fileName], domainFolder+'/'+ slugPubliName+'/medias/'+arrayImages[fileName], function(err) {
  //       if (err) console.log('not transferred:' + err);
  //       else {
  //         console.log("media transferred");
  //       }
  //     });
  //   }
  //   console.log("Publication was transferred at: "+domain+domainFolder+'/'+slugPubliName);
  //   socket.emit('pubiTransferred', domain+domainFolder+'/'+slugPubliName);
  //   c.end();
  // }


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