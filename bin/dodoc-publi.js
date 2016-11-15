var dodoc  = require('../public/dodoc');
var devLog = require('./dev-log.js');
var dodocAPI = require('./dodoc-api.js');
var moment = require('moment');
var path = require('path');
var fs = require('fs-extra');
var parsedown = require('dodoc-parsedown');


var dodocPubli = module.exports = {

  listMediaAndMetaFromOnePubli: function ( slugFolderName, slugProjectName, slugPubliName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listMediaAndMetaFromOnePubli : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " publiName = " + slugPubliName);

      var publiContent = dodocPubli.getPubliMeta( slugFolderName, slugProjectName, slugPubliName);
      dodocAPI.listAllMedias( slugFolderName, slugProjectName).then(function( mediaFolderContent) {
      dodocPubli.filterMediasFromList( publiContent, mediaFolderContent).then(function( publiMedias) {

          publiContent.medias = publiMedias;
          publiContent.slugFolderName = slugFolderName;
          publiContent.slugProjectName = slugProjectName;
          publiContent.slugPubliName = slugPubliName;
          publiContent.pathToPubli = dodocPubli.getPathToPubli( slugFolderName, slugProjectName, slugPubliName);

          // make an array that looks like listPublis
          var folderPubliMeta = {};
          folderPubliMeta[slugPubliName] = publiContent;
          resolve( folderPubliMeta);
        }, function(error) {
          console.error("Failed to filter medias for a publi! Error: ", error);
          reject( 'fail');
        });
      }, function(error) {
        console.error("Failed to list one media! Error: ", error);
        reject( 'fail');
      });
    });
  },

  // if two args, then get path to publi folder
  // if three args, then get path to one publi
  getPathToPubli: function( slugFolderName, slugProjectName, pslug) {
    var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
    var pathToPubli = path.join( projectPath, dodocPubli.getPubliPathOfProject());
    if( pslug !== undefined)
      pathToPubli = path.join( pathToPubli, pslug);
    return pathToPubli;
  },

  getPubliMeta: function( slugFolderName, slugProjectName, pslug) {
    var pathToPubli = dodocPubli.getPathToPubli( slugFolderName, slugProjectName, pslug);
    var publiJSONFilepath = pathToPubli + dodoc.metaFileext;
    var publiData = fs.readFileSync( publiJSONFilepath, dodoc.textEncoding);
    var publiMetaData = dodocAPI.parseData( publiData);
    return publiMetaData;
  }, 

  getPubliPathOfProject: function () {
    return dodoc.projectPublisFoldername;
  },

  filterMediasFromList: function ( publiContent, mediaFolderContent) {
    return new Promise(function(resolve, reject) {
        dev.logfunction( "COMMON — filterMediasFromList : publiContent = " + JSON.stringify(publiContent, null, 4) + " mediaFolderContent = " + JSON.stringify(mediaFolderContent, null, 4));
      var publiMedias = [];
      for( var item of publiContent.medias) {
        dev.logverbose('item : ' + item.name);
        if( mediaFolderContent.hasOwnProperty( item.name) === true) {
          // and copy it to an empty obj
          var mediaitem = {};
          mediaitem[item.name] = mediaFolderContent[item.name];
          publiMedias.push( mediaitem);
        }
      }
      resolve( publiMedias);
    });
  }


};
