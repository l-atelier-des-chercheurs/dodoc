var path = require('path');
var fs = require('fs-extra');

var dodoc  = require('../dodoc');

var dodocAPI = require('./dodoc-api.js');
var dodocPubli = require('./dodoc-publi.js');
var dev = require('./dev-log');

var publiPDF = (function() {

  const API = {
    exportPubliToPDF     : (d) => { return exportPubliToPDF(d); },
  };

  function exportPubliToPDF(d){
    return new Promise(function(resolve, reject) {
      dev.logfunction( "EVENT - exportPubliToPDF");
      createFolders(d).then(d => {
        return _makePDF(d)
      })
      .then(pdfInfos => {
        resolve(pdfInfos);
      })
      .catch(err => {
        dev.error("Failed to create a new folder! Error: " + err);
      });
    });
  }

  function createFolders(d){
    return new Promise(function(resolve, reject) {
      var publicationsFolder = path.join(dodocAPI.getUserPath(), dodoc.settings().exportedPubliDir);
      var printFolderName = "print";

      // todo: simplify with a simple call that recursively creates structure
      dodocAPI.makeFolderAtPath(d.slugFolderName, publicationsFolder)
      .then((exportFolderPath) => {
        return dodocAPI.makeFolderAtPath(d.slugProjectName, exportFolderPath)
      })
      .then((exportProjectPath) => {
        return dodocAPI.makeFolderAtPath(d.slugPubliName, exportProjectPath)
      })
      .then((exportPubliPath) => {
        return dodocAPI.makeFolderAtPath(printFolderName, exportPubliPath)
      })
      .then((printFolderPath) => {
        dev.logverbose('printFolderPath: ', printFolderPath);
        d.printFolderPath = printFolderPath;
        d.relativePrintFolder = path.join(dodoc.settings().exportedPubliDir, d.slugFolderName, d.slugProjectName, d.slugPubliName, printFolderName);
        resolve(d);
      });
    });
  }

  function _makePDF(d){
    return new Promise(function(resolve, reject) {

      var pdfName = dodocAPI.getCurrentDate()+'.pdf';
      var pdfPath = path.join(d.printFolderPath, pdfName);
      var pdfURL = path.join('/', d.relativePrintFolder, pdfName);

      dev.logverbose('Will make pdf');

      const {BrowserWindow} = require('electron')

      let win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false
      });
      win.loadURL(d.url)

      win.webContents.on('did-finish-load', () => {
        // Use default printing options
        setTimeout(() => {
          win.webContents.printToPDF({
            marginsType: 0,
            pageSize: 'A4',
          }, (error, data) => {
            if (error) throw error
            fs.writeFile(pdfPath, data, (error) => {
              if (error) throw error
              console.log('Write PDF successfully.')
              resolve({ pdfURL, pdfPath });
            });
          });
        }, 500);
      });
    });
  }

  return API;
})();

module.exports = publiPDF;