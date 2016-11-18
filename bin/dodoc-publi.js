var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');

var dodoc  = require('../public/dodoc');

var dodocAPI = require('./dodoc-api.js');
var dodocFolder = require('./dodoc-folder.js');
var dodocProject = require('./dodoc-project.js');
var dodocMedia = require('./dodoc-media.js');

var dodocPubli = (function() {

  const API = {
    getPathToPubli             : function(slugFolderName, slugProjectName, pslug) { return getPathToPubli( slugFolderName, slugProjectName, pslug); },
    getPubliPathOfProject      : function() { return getPubliPathOfProject(); },
    listMediaAndMetaFromOnePubli : function(slugFolderName, slugProjectName, slugPubliName) { return listMediaAndMetaFromOnePubli(slugFolderName, slugProjectName, slugPubliName); },
    filterMediasFromPubliList  : function(publiContent, mediaFolderContent) { return filterMediasFromPubliList(publiContent, mediaFolderContent); },
    createPubli                : function(publiData) { return createPubli(publiData); },
    editThisPubli              : function(pdata) { return editThisPubli(pdata); },
    listPublis                 : function(slugFolderName, slugProjectName, thisPubliName) { return listPublis(slugFolderName, slugProjectName, thisPubliName); },
  };

  /***************************************************************************************************/
  /******************************************** public functions *************************************/
  /***************************************************************************************************/

  // if two args, then get path to publi folder
  // if three args, then get path to one publi
  function getPathToPubli(slugFolderName, slugProjectName, pslug) {
    var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
    var pathToPubli = path.join( projectPath, getPubliPathOfProject());
    if( pslug !== undefined)
      pathToPubli = path.join( pathToPubli, pslug);
    return pathToPubli;
  }
  function getPubliPathOfProject() {
    return dodoc.projectPublisFoldername;
  }

  function listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listMediaAndMetaFromOnePubli : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " publiName = " + slugPubliName);

      var publiContent = _getPubliMeta( slugFolderName, slugProjectName, slugPubliName);
      dodocMedia.listAllMedias( slugFolderName, slugProjectName).then(function( mediaFolderContent) {
        filterMediasFromPubliList( publiContent, mediaFolderContent).then(function( publiMedias) {
          publiContent.medias = publiMedias;
          publiContent.slugFolderName = slugFolderName;
          publiContent.slugProjectName = slugProjectName;
          publiContent.slugPubliName = slugPubliName;
          publiContent.pathToPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName);

          // make an array that looks like listPublis
          var folderPubliMeta = {};
          folderPubliMeta[slugPubliName] = publiContent;
          resolve( folderPubliMeta);
        }, function(error) {
          dev.error("Failed to filter medias for a publi! Error: ", error);
          reject( 'fail');
        });
      }, function(error) {
        dev.error("Failed to list one media! Error: ", error);
        reject( 'fail');
      });
    });
  }

  function filterMediasFromPubliList(publiContent, mediaFolderContent) {
    return new Promise(function(resolve, reject) {
        dev.logfunction( "COMMON — filterMediasFromPubliList : publiContent = " + JSON.stringify(publiContent, null, 4) + " mediaFolderContent = " + JSON.stringify(mediaFolderContent, null, 4));
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

  function createPubli(publiData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — createPubli: " + JSON.stringify(publiData, null, 4));

      var currentDateString = dodocAPI.getCurrentDate();

      var pname = publiData.publiName;
      var pslug = slugg( pname);
      var ptemplate = publiData.template;

      var slugFolderName = publiData.slugFolderName;
      var slugProjectName = publiData.slugProjectName;

      var pathToThisPubliFolder = getPathToPubli( slugFolderName, slugProjectName);
      pslug = dodocAPI.findFirstFilenameNotTaken( pslug, pathToThisPubliFolder, dodoc.metaFileext);

      var pathToThisPubli = getPathToPubli( slugFolderName, slugProjectName, pslug) + dodoc.metaFileext;

      console.log("New publi created with name " + pname + " and path " + pathToThisPubli);

      var newPubliData =
      {
        "name" : pname,
        "template" : ptemplate,
        "created" : currentDateString,
        "modified" : currentDateString,
        "informations" : "",
        "medias" : [{}],
      };

      dodocAPI.storeData( pathToThisPubli, newPubliData, 'create').then(function( newPubliData) {
        newPubliData.slugProjectName = slugProjectName;
        newPubliData.slugFolderName = slugFolderName;
        newPubliData.slugPubliName = pslug;
        resolve( newPubliData);
      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t create publi file.'));
        reject( 'Couldn\'t create publi');
      });

    });
  }
  function editThisPubli(pdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — editThisPubli : publiData = " + JSON.stringify( pdata, null, 4));

      var pathToPubli = getPathToPubli( pdata.slugFolderName, pdata.slugProjectName, pdata.slugPubliName);
      var publiMetaFilepath = pathToPubli + dodoc.metaFileext;

      // get and parse publi json data
      var publiMetaData = _getPubliMeta( pdata.slugFolderName, pdata.slugProjectName, pdata.slugPubliName);

      // update modified date
      publiMetaData.modified = dodocAPI.getCurrentDate();

      // update title if pdata has newPubliName
      if( pdata.name !== undefined)
        publiMetaData.name = pdata.name;

      if( pdata.template !== undefined)
        publiMetaData.template = pdata.template;

      // update medias if pdata has medias
      if( pdata.medias !== undefined)
        publiMetaData.medias = pdata.medias;

      dodocAPI.storeData( publiMetaFilepath, publiMetaData, 'update').then(function( publiMetaData) {
        publiMetaData.slugPubliName = pdata.slugPubliName;
        publiMetaData.slugFolderName = pdata.slugFolderName;
        publiMetaData.slugProjectName = pdata.slugProjectName;
        resolve( publiMetaData);
      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t update publi file.'));
        reject( 'Couldn\'t update publi');
      });
    });
  }

  // if thisPubliName !== undefined => list that publi meta
  // otherwise => return all publis of this project
  // returns a JSON array of json with filenames as keys
  function listPublis( slugFolderName, slugProjectName, thisPubliName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listPublis : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " publiName (can be undefined) = " + thisPubliName);

      // lister toutes les publis issues du dossier publi
      var pathToPubliFolder = getPathToPubli(slugFolderName, slugProjectName);
      var lookingForSpecificJson = thisPubliName !== undefined ? true : false;
      var filesInPubliFolder = fs.readdirSync( pathToPubliFolder);

  //     dev.log( "- looking for files in " + publisPath);
      var foldersPublisMeta = [];
      filesInPubliFolder.forEach( function( filename) {
        if( !new RegExp( dodoc.regexpMatchFolderNames, 'i').test( filename) && filename !== ".DS_Store") {
          var fileExtension = new RegExp( dodoc.regexpGetFileExtension, 'i').exec( filename);
          if( fileExtension == dodoc.metaFileext && !new RegExp( '^' + dodoc.deletedPrefix).test( filename)) {
            if( !lookingForSpecificJson)
              foldersPublisMeta.push( filename);
            else if( filename == thisPubliName + dodoc.metaFileext) {
              foldersPublisMeta.push( filename);
              return;
            }
          }
        }
      });


      var folderPubliMeta = new Object();
      console.log( "- foldersPublisMeta : " + JSON.stringify( foldersPublisMeta, null, 4));
      for (var i=0; i<foldersPublisMeta.length; i++) {
        var publiFilename = foldersPublisMeta[i];
        var slugPubliName = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( publiFilename)[1];

        if( !folderPubliMeta.hasOwnProperty( slugPubliName)) {
          folderPubliMeta[slugPubliName] = new Object();
          // read meta file and add the content to the folder
          var publiMetaData = _getPubliMeta( slugFolderName, slugProjectName, slugPubliName);
          publiMetaData.slugPubliName = slugPubliName;
          publiMetaData.slugFolderName = slugFolderName;
          publiMetaData.slugProjectName = slugProjectName;
          publiMetaData.pathToPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName);

          folderPubliMeta[slugPubliName] = publiMetaData;
        }
      }
      resolve( folderPubliMeta);
    });
  }


  /***************************************************************************************************/
  /******************************************** private functions ************************************/
  /***************************************************************************************************/

  function _getPubliMeta(slugFolderName, slugProjectName, pslug) {
    var pathToPubli = getPathToPubli( slugFolderName, slugProjectName, pslug);
    var publiJSONFilepath = pathToPubli + dodoc.metaFileext;
    var publiData = fs.readFileSync( publiJSONFilepath, dodoc.textEncoding);
    var publiMetaData = dodocAPI.parseData( publiData);
    return publiMetaData;
  }

  return API;
})();

module.exports = dodocPubli;