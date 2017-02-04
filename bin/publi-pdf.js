var path = require('path');
var fs = require('fs-extra');
var phantom = require('phantom');

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
        return _generatePDF(d)
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

  function _generatePDF(d){
    return new Promise(function(resolve, reject) {

      var pdfName = dodocAPI.getCurrentDate()+'.pdf';
      var pdfPath = path.join(d.printFolderPath, pdfName);
      var pdfURL = path.join('/', d.relativePrintFolder, pdfName)
      dev.logverbose('Will make phantom pdf');

      phantom.create([
        '--ignore-ssl-errors=yes',
        '--ssl-protocol=any',
        '--load-images=yes',
        '--local-to-remote-url-access=yes',
      ]).then(ph => {
        dev.logverbose('phantom is created');
        ph.createPage().then(page => {
          dev.logverbose('page is created');
          page.property('paperSize', { format: "A4", orientation: 'portrait', margin: '1cm' });
          page.on('onLoadFinished', function(success) {
            if(success === success) {
              page.render(pdfPath);
              ph.exit();
              dev.logverbose(">> Render complete")
              resolve({ pdfURL, pdfPath });
            } else {
              dev.logverbose('fail');
              reject();
            }
          });
          page.setContent(d.html, global.dodoc.homeURL);
        }).catch(error => {
          dev.error('Fail to createpage: ' + error);
          reject();
        });
      })
      .catch(error => {
        dev.error('Fail to start phantomjs: ' + error);
        reject();
      });
    });
  }

  return API;
})();

module.exports = publiPDF;

