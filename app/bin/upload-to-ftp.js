var path = require('path');
var fs = require('fs-extra');

var dodoc  = require('../dodoc');
var dodocAPI = require('./dodoc-api');
var dodocPubli = require('./dodoc-publi');

var exportPubliToFtp = (function() {

  const API = {
    exportPubliToFtp     : function(socket, d) { return exportPubliToFtp(socket, d); },
    createFolders        : function() { return createNewFolder(); },
    generatePDF          : function() { return generatePDF(); },
  };

  exportPubliToFtp : function(socket, d){
    dev.logfunction( "EVENT - exportPubliToFtp");
    var currentDateString = dodocAPI.getCurrentDate();
    var projectPath = dodocAPI.getProjectPath( d.slugFolderName, d.slugProjectName);

    var exportedPubliFolderName = currentDateString + "_" + d.slugPubliName;
    exportedPubliFolderName = dodocAPI.findFirstFilenameNotTaken( exportedPubliFolderName, dodoc.exportedPubliDir, '');

    var exportedPubliPath = path.join(dodoc.exportedPubliDir, exportedPubliFolderName);
    var exportedMediaFolderName = exportedPubliPath + "/" + "medias";

    // create publi directory with publi name
    fs.mkdir(exportedPubliPath, function(){
      // create medias directory in publi directory
      fs.mkdir(exportedMediaFolderName, function(){
        // copy css file
        exportPubliToFtp.copyFiles('client/css/style.css', exportedPubliPath + "/style.css", function(){
          exportPubliToFtp.copyFiles('client/css/templates.css', exportedPubliPath + "/templates.css", function(){
            //copy js file
            exportPubliToFtp.copyFiles('client/js/production/all.min.js', exportedPubliPath + "/script.min.js", function(){
              // create html file
              fs.writeFile(exportedPubliPath + "/index.html", d.html, function(){
                  exportPubliToFtp.saveImagesLocal(projectPath, exportedPubliFolderName, exportedMediaFolderName, d.slugFolderName, d.slugProjectName, d.slugPubliName, socket);
              });
            });
          });
        });
      });
    });
  },

  saveImagesLocal : function(projectPath, folderPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket){
    var arrayImages = [];
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
              var oldPath = path.join( projectPath, mediaFolder, fileName);
              var newPath = path.join( mediasPath, fileName);
              arrayImages.push(fileName);
              try {
                fs.copySync(oldPath, newPath);
                console.log("success!");
              } catch (err) {
                dev.error(err)
              }
            }
          }
        }
      }
      // check internet connection
      // require('dns').resolve('www.google.com', function(err) {
      //   if (err) {
      //     console.log("No connection");
      //     socket.emit('noConnection');
      //   } else {
      //     sendFileToServer(arrayImages, folderPath, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket);
      //   }
      // });
    }, function(error) {
      dev.error("Failed to list one media! Error: ", error);
    });
  },


  sendFileToServer : function(arrayImages, folderPath, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, socket){
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
  },

  sendImageToServer : function(arrayImages, projectPath, mediasPath, slugFolderName, slugProjectName, slugPubliName, c, domainFolder, domain, socket) {
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
  },


  copyFiles : function(sourceFile, destFile, callback){
    fs.unlink(destFile, function(){
      fs.copy(sourceFile, destFile, callback);
    });
  },
  
  return API;
})();

module.exports = exportPubliToPDF;