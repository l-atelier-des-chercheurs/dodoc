var dodoc  = require('../public/dodoc');
var devLog = require('./dev-log.js');
var moment = require('moment');
var path = require('path');
var fs = require('fs-extra');
var parsedown = require('dodoc-parsedown');
var merge = require('merge');
var appRoot = require('app-root-path');


var dodocAPI = module.exports = {

  getCurrentDate : function(f = dodoc.metaDateFormat) {
    return moment().format(f);
  },

  getMediaMeta : function(projectPath, mediaFolderPath, mediaName) {
    dev.logfunction( "COMMON — getMediaMeta : projectPath = " + projectPath + " mediaFolderPath = " + mediaFolderPath + " mediaName = " + mediaName);
    var mediaJSONFilepath = dodocAPI.getPathToMedia(projectPath, mediaFolderPath, mediaName) + dodoc.metaFileext;
    var mediaData = fs.readFileSync(mediaJSONFilepath, dodoc.textEncoding);
    var mediaMetaData = dodocAPI.parseData(mediaData);
    return mediaMetaData;
  },

  getPathToMedia : function( projectPath, mediasFolderPath, mediaName) {
    return path.join( projectPath, mediasFolderPath, mediaName);
  },

  parseData : function(d) {
    var parsed = parsedown.parse(d);
  // the fav field is a boolean, so let's convert it
    if( parsed.hasOwnProperty('fav'))
      parsed.fav = (parsed.fav === 'true');
    return parsed;
  },

  storeData : function( mpath, d, e) {
    return new Promise(function(resolve, reject) {
      dev.logverbose('Will store data');
      var textd = parsedown.textify(d);
      if( e === "create") {
        fs.appendFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(dodocAPI.parseData(textd));
        });
      }
      if( e === "update") {
        fs.writeFile( mpath, textd, function(err) {
        if (err) reject( err);
          resolve(dodocAPI.parseData(textd));
        });
      }
    });
  },

  getProjectPath: function( slugFolderName, slugProjectName) {
    return path.join( dodocAPI.getContentPath( slugFolderName), slugProjectName);
  },

  getContentPath: function(thisPath) {
    return path.join( dodocAPI.getRootPath(), dodoc.contentDir, thisPath);
  },

  getRootPath: function () {
    return appRoot.path;
  },

  findFirstFilenameNotTaken: function( fileName, currentPath, fileext) {
    fileext = typeof fileext !== 'undefined' ?  fileext : dodoc.metaFileext;

    try {
      var newFileName = fileName;
      var index = 0;
      var newPathToFile = path.join( currentPath, newFileName);
      while( !fs.accessSync( newPathToFile + fileext, fs.F_OK)){
        dev.logverbose("- - following path is already taken : " + newPathToFile);
        index++;
        newFileName = fileName + "-" + index;
        newPathToFile = path.join( currentPath, newFileName);
      }
    } catch( err) {}

    console.log( "- - this filename is not taken : " + newFileName);
    return newFileName;
  },

  listAllMedias: function( slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listAllMedias : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var mediasFoldersPath = dodocAPI.getAllMediasFoldersPathAsArray();

      var mediasProcessed = 0;
      var mediaFolderContent = [];
      mediasFoldersPath.forEach( function( mediasFolderPath) {
        mediaFolderContent = merge( mediaFolderContent, dodocAPI.listMediasOfOneType( slugFolderName, slugProjectName, mediasFolderPath));
      });
      resolve( mediaFolderContent);
    });
  }, 

  getAllMediasFoldersPathAsArray: function() {
    var mediasFolders = [];
    mediasFolders.push( dodocAPI.getPhotoPathOfProject());
    mediasFolders.push( dodocAPI.getAnimationPathOfProject());
    mediasFolders.push( dodocAPI.getVideoPathOfProject());
    mediasFolders.push( dodocAPI.getAudioPathOfProject());
    mediasFolders.push( dodocAPI.getTextPathOfProject());
    return mediasFolders;
  }, 

  getPhotoPathOfProject: function() {
    return dodoc.projectPhotosFoldername;
  },
  getAnimationPathOfProject: function() {
    return dodoc.projectAnimationsFoldername;
  },
  getVideoPathOfProject: function() {
    return dodoc.projectVideosFoldername;
  },
  getAudioPathOfProject: function() {
    return dodoc.projectAudiosFoldername;
  },
  getTextPathOfProject: function() {
    return dodoc.projectTextsFoldername;
  },

  listMediasOfOneType: function( slugFolderName, slugProjectName, mediasFolderPath, mediaName) {
    dev.logfunction( "COMMON — listMediasOfOneType with");

    var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
    var mediasPath = path.join( projectPath, mediasFolderPath);
    var lookingForSpecificJson = mediaName !== undefined ? true : false;

    var filesInMediaFolder = fs.readdirSync( mediasPath);
    var foldersMediasMeta = [];
    var foldersMediasFiles = [];

//     dev.log( "- looking for files in " + mediasPath);

    filesInMediaFolder.forEach( function( filename) {
      if( !new RegExp( dodoc.regexpMatchFolderNames, 'i').test( filename) && filename !== ".DS_Store") {
        var fileExtension = new RegExp( dodoc.regexpGetFileExtension, 'i').exec( filename)[0];
//         dev.log( "- - fileEXTENSION of " + filename + " is " + fileExtension);
//         dev.log( "- - Is file a deleted file ? " + new RegExp( '^' + dodoc.deletedPrefix).test( filename));
        // match only json that are not deleted (prefixed with a custom prefix
        if( fileExtension === dodoc.metaFileext && !new RegExp( '^' + dodoc.deletedPrefix).test( filename)) {
          if( !lookingForSpecificJson)
            foldersMediasMeta.push( filename);
          else if( filename == mediaName + dodoc.metaFileext) {
            foldersMediasMeta.push( filename);
            return;
          }
        }
        else {
          foldersMediasFiles.push( filename);
        }
      }
    });

    // in foldersMediasMeta, there should always be at least another file with the same name.
    // Let's add them inside our json reference file
    var folderMediaMetaAndFileName = new Object();
    dev.logverbose( "- foldersMediasMeta : " + JSON.stringify( foldersMediasMeta, null, 4));

    for( var mediaMetaFilename of foldersMediasMeta) {
      var metaFileNameWithoutExtension = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( mediaMetaFilename)[1];
//       dev.log( "- looking for medias filenames that start with " + metaFileNameWithoutExtension);
      for( var mediaFilename of foldersMediasFiles) {
//         dev.log( "- comparing to " + mediaFilename);
        // check if both mediaFilename and metaFileNameWithoutExtension have a dash in them or not
        // only match XXX.txt with XXX.jpg, and -1.txt with -1.jpg
        if( (mediaFilename.indexOf('-') === -1) !== (metaFileNameWithoutExtension.indexOf('-') === -1))
          continue;

        // if this media filename corresponds to the meta filename
        if (mediaFilename.indexOf(metaFileNameWithoutExtension) !== -1 ) {
          var mediaObjKey = path.join( mediasFolderPath, mediaMetaFilename);
          // if we don't have an obj with this key
          if( !folderMediaMetaAndFileName.hasOwnProperty( mediaObjKey)) {
            // let's make one
            folderMediaMetaAndFileName[mediaObjKey] = new Object();
            // read JSON file and add the content to the folder
            var mdata = dodocAPI.getMediaMeta( projectPath, mediasFolderPath, metaFileNameWithoutExtension);
            mdata.mediaFolderPath = mediasFolderPath;
            mdata.mediaName = metaFileNameWithoutExtension;
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;

            // if the file is a text, then also add the content of the TXT in the answer
            if( new RegExp( dodoc.regexpGetFileExtension, 'i').exec( mediaFilename)[0] === '.md') {
              var textMediaData = readTextMedia( path.join( projectPath, mediasFolderPath, mediaFilename));
              mdata.textMediaContent = textMediaData;
            }

            folderMediaMetaAndFileName[mediaObjKey] = mdata;
          }

          // otherwise if we have already initialized that key, but we don't have a files property
          if( !folderMediaMetaAndFileName[mediaObjKey].hasOwnProperty( "files")) {
            folderMediaMetaAndFileName[mediaObjKey]["files"] = new Array();
          }

          // then, let's add this file to the list of files for that json
          folderMediaMetaAndFileName[mediaObjKey]["files"].push( mediaFilename);

        }
      }
    }
    return folderMediaMetaAndFileName;

  }



};
