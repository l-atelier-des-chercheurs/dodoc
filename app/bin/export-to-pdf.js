var path = require('path');
var fs = require('fs-extra');
var phantom = require('phantom');

var dodoc  = require('../dodoc');

var dodocAPI = require('./dodoc-api.js');
var dodocPubli = require('./dodoc-publi.js');

var exportPubliToPDF = (function() {

  const API = {
    exportPubliToPDF     : function(socket, d) { return exportPubliToPDF(socket, d); },
    createFolders        : function() { return createFolders(); },
    generatePDF          : function() { return generatePDF(); },
  };

  function exportPubliToPDF(socket, d){
    dev.logfunction( "EVENT - exportPubliToPDF");
    createFolders(d); 
  }

  function createFolders(d){
    var folderName = d.slugFolderName;
    var projectName = d.slugProjectName;
    var publiName = d.slugPubliName;
    var publicationsFolder = path.join(dodoc.userDirname, dodoc.exportedPubliDir);
    var printFolderName = "print";
    
    createExportPubliFolder(folderName, publicationsFolder).then(function(exportFolderPath){
      createExportPubliFolder(projectName,exportFolderPath).then(function(exportProjectPath){
        createExportPubliFolder(publiName, exportProjectPath).then(function(exportPubliPath){
          createExportPubliFolder(printFolderName, exportPubliPath).then(function(printFolderPath){
            console.log(printFolderPath);
            generatePDF(printFolderPath, d);
          });
        });
      });
    });
  }

  function generatePDF(printFolderPath, d){
    var currentUrl = d.url; 

    phantom.create([
    '--ignore-ssl-errors=yes',
    '--ssl-protocol=any', 
    '--load-images=yes',
    '--local-to-remote-url-access=yes',
    ]).then(function(ph) {
      ph.createPage().then(function(page) {
        page.open(currentUrl)
        .then(function(){
          page.property('paperSize', { format: "A4", orientation: 'portrait', margin: '0cm' })
          .then(function() {
            // page.property("onLoadFinished").then(function(){
            //   page.render(printFolderPath+'/01.pdf').then(function() {
            //     console.log('success');
            //     page.close();
            //     ph.exit();
            //   });
            // });

            setTimeout(function(){
              page.render(printFolderPath+'/03.pdf').then(function() {
                console.log('success');
                //io.sockets.emit('pdfIsGenerated');
                page.close();
                ph.exit();
              });
            }, 2000)
          });
        });
      });
    });
  }

  function createExportPubliFolder(name, path) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — createNewFolder");

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

module.exports = exportPubliToPDF;

