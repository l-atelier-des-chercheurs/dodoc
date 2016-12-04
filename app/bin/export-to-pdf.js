var path = require('path');
var fs = require('fs-extra');
var phantom = require('phantom');

var dodoc  = require('../dodoc');

var dodocAPI = require('./dodoc-api.js');
var dodocPubli = require('./dodoc-publi.js');

var exportPubliToPDF = (function() {

  const API = {
    exportPubliToPDF     : function(socket, d, io) { return exportPubliToPDF(socket, d, io); },
    createFolders        : function(d, io) { return createFolders(d, io); },
    generatePDF          : function(printFolderPath, d, io) { return generatePDF(printFolderPath, d, io); },
  };

  function exportPubliToPDF(socket, d, io){
    dev.logfunction( "EVENT - exportPubliToPDF");
    createFolders(d, io); 
  }

  function createFolders(d, io){
    var folderName = d.slugFolderName;
    var projectName = d.slugProjectName;
    var publiName = d.slugPubliName;
    var publicationsFolder = path.join(dodocAPI.getUserPath(), dodoc.exportedPubliDir);
    var printFolderName = "print";
    
    createExportPubliFolder(folderName, publicationsFolder).then(function(exportFolderPath){
      createExportPubliFolder(projectName,exportFolderPath).then(function(exportProjectPath){
        createExportPubliFolder(publiName, exportProjectPath).then(function(exportPubliPath){
          createExportPubliFolder(printFolderName, exportPubliPath).then(function(printFolderPath){
            console.log(printFolderPath);
            generatePDF(printFolderPath, d, io);
          });
        });
      });
    });
  }

  function generatePDF(printFolderPath, d, io){
    var currentUrl = d.url; 
    var pdfPath = path.join(printFolderPath, dodocAPI.getCurrentDate()+'.pdf');

    phantom.create([
    '--ignore-ssl-errors=yes',
    '--ssl-protocol=any', 
    '--load-images=yes',
    '--local-to-remote-url-access=yes',
    ]).then(function(ph) {
      ph.createPage().then(function(page) {
        page.open(currentUrl+"/print")
        .then(function(){
          page.property('paperSize', { format: "A4", orientation: 'portrait', margin: '1cm' })
          .then(function() {
            setTimeout(function(){
              page.render(pdfPath).then(function() {
                console.log('success');

                io.sockets.emit('pdfIsGenerated', pdfPath);
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

