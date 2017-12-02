var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');

var dodoc  = require('../dodoc');

var dodocAPI = require('./dodoc-api');
var dodocFolder = require('./dodoc-folder');
var dodocProject = require('./dodoc-project');
var dodocMedia = require('./dodoc-media');
var dev = require('./dev-log');

var dodocPubli = (function() {

  const API = {
    getPubliPath             : (slugFolderName, slugProjectName, pslug) => { return getPubliPath(slugFolderName, slugProjectName, pslug); },
    listMediaAndMetaFromOnePubli : (slugFolderName, slugProjectName, slugPubliName) => { return listMediaAndMetaFromOnePubli(slugFolderName, slugProjectName, slugPubliName); },
    filterMediasFromPubliList  : (publiContent, mediaFolderContent) => { return filterMediasFromPubliList(publiContent, mediaFolderContent); },
    createPubli                : (publiData) => { return createPubli(publiData); },
    removeOnePubli             : (publiData)     => { return removeOnePubli(publiData); },
    editThisPubli              : (pdata) => { return editThisPubli(pdata); },
    listPublis                 : (slugFolderName, slugProjectName, thisPubliName) => { return listPublis(slugFolderName, slugProjectName, thisPubliName); },
  };

  /***************************************************************************************************/
  /******************************************** public functions *************************************/
  /***************************************************************************************************/

  // if two args, then get path to publi folder
  // if three args, then get path to one publi
  function getPubliPath(slugFolderName, slugProjectName, pslug) {
    var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
    var pathToPubli = path.join(projectPath, dodoc.settings().projectPublisFoldername);
    if( pslug !== undefined)
      pathToPubli = path.join(pathToPubli, pslug);
    return pathToPubli;
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
          publiContent.pathToPubli = getPubliPath(slugFolderName, slugProjectName, slugPubliName);

          // make an array that looks like listPublis
          var folderPubliMeta = {};
          folderPubliMeta[slugPubliName] = publiContent;
          resolve( folderPubliMeta);
        }, function(error) {
          dev.error("Failed to filter medias for a publi! Error: " + error);
          reject( 'fail');
        });
      }, function(error) {
        dev.error("Failed to list one media! Error: " + error);
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

      var pathToThisPubliFolder = getPubliPath(slugFolderName, slugProjectName);
      pslug = dodocAPI.findFirstFilenameNotTaken( pslug, pathToThisPubliFolder, dodoc.settings().metaFileext);

      var pathToThisPubli = getPubliPath(slugFolderName, slugProjectName, pslug) + dodoc.settings().metaFileext;

      dev.log("New publi created with name " + pname + " and path " + pathToThisPubli);

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
        dev.error('--> Couldn\'t create publi file.');
        reject( 'Couldn\'t create publi');
      });

    });
  }

  function removeOnePubli(pdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — removeOnePubli: " + JSON.stringify(pdata, null, 4));

      var pathToPubli = getPubliPath(pdata.slugFolderName, pdata.slugProjectName, pdata.slugPubliName);
      var publiMetaFilepath = pathToPubli + dodoc.settings().metaFileext;

      fs.unlink(publiMetaFilepath, function(err){
        if(err) reject(err);
        resolve(pdata);
      });
    });
  }

  function editThisPubli(pdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — editThisPubli : publiData = " + JSON.stringify( pdata, null, 4));

      var pathToPubli = getPubliPath(pdata.slugFolderName, pdata.slugProjectName, pdata.slugPubliName);
      var publiMetaFilepath = pathToPubli + dodoc.settings().metaFileext;

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
        dev.error('--> Couldn\'t update publi file.');
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
      var pathToPubliFolder = getPubliPath(slugFolderName, slugProjectName);
      var lookingForSpecificJson = thisPubliName !== undefined ? true : false;
      var filesInPubliFolder = fs.readdirSync( pathToPubliFolder);

      var foldersPublisMeta = [];
      filesInPubliFolder.forEach( function( filename) {
        if( !new RegExp( dodoc.settings().regexpMatchFolderNames, 'i').test( filename) && filename !== ".DS_Store") {
          var fileExtension = new RegExp( dodoc.settings().regexpGetFileExtension, 'i').exec( filename);
          if( fileExtension == dodoc.settings().metaFileext && !new RegExp( '^' + dodoc.settings().deletedPrefix).test( filename)) {
            if( !lookingForSpecificJson)
              foldersPublisMeta.push( filename);
            else if( filename == thisPubliName + dodoc.settings().metaFileext) {
              foldersPublisMeta.push( filename);
              return;
            }
          }
        }
      });


      var folderPubliMeta = new Object();
      dev.log( "- foldersPublisMeta : " + JSON.stringify( foldersPublisMeta, null, 4));
      for (var i=0; i<foldersPublisMeta.length; i++) {
        var publiFilename = foldersPublisMeta[i];
        var slugPubliName = new RegExp( dodoc.settings().regexpRemoveFileExtension, 'i').exec( publiFilename)[1];

        if( !folderPubliMeta.hasOwnProperty( slugPubliName)) {
          folderPubliMeta[slugPubliName] = new Object();
          // read meta file and add the content to the folder
          var publiMetaData = _getPubliMeta( slugFolderName, slugProjectName, slugPubliName);
          publiMetaData.slugPubliName = slugPubliName;
          publiMetaData.slugFolderName = slugFolderName;
          publiMetaData.slugProjectName = slugProjectName;
          publiMetaData.pathToPubli = getPubliPath(slugFolderName, slugProjectName, slugPubliName);

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
    var pathToPubli = getPubliPath(slugFolderName, slugProjectName, pslug);
    var publiJSONFilepath = pathToPubli + dodoc.settings().metaFileext;
    var publiData = fs.readFileSync( publiJSONFilepath, dodoc.settings().textEncoding);
    var publiMetaData = dodocAPI.parseData( publiData);
    return publiMetaData;
  }

  return API;
})();

module.exports = dodocPubli;