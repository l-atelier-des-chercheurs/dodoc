var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');
var merge = require('merge');

var mm = require('marky-mark');
var ffmpeg = require('fluent-ffmpeg');
var gm = require('gm');
var gm = require('gm').subClass({imageMagick: true});

var dodoc  = require('../public/dodoc');
var devLog = require('./dev-log.js');

var dodocAPI = require('./dodoc-api.js');
var dodocProject = require('./dodoc-project.js');

var dodocMedia = module.exports = {

  /********************************************* SHORT FUNCTIONS *********************************************/

  getMediaFolderPathByType: function( mediaType) {
    if( mediaType == 'photo')
      return dodocMedia.getPhotoPathOfProject();
    if( mediaType == 'video')
      return dodocMedia.getVideoPathOfProject();
    if( mediaType == 'animation')
      return dodocMedia.getAnimationPathOfProject();
    if( mediaType == 'audio')
      return dodocMedia.getAudioPathOfProject();
    if( mediaType == 'text')
      return dodocMedia.getTextPathOfProject();
  },
  getMediaPath: function( slugFolderName, slugProjectName, mediaFolder) {
    return path.join( dodocProject.getProjectPath( slugFolderName, slugProjectName), mediaFolder);
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

  getAllMediasFoldersPathAsArray: function() {
    var mediasFolders = [];
    mediasFolders.push( dodocMedia.getPhotoPathOfProject());
    mediasFolders.push( dodocMedia.getAnimationPathOfProject());
    mediasFolders.push( dodocMedia.getVideoPathOfProject());
    mediasFolders.push( dodocMedia.getAudioPathOfProject());
    mediasFolders.push( dodocMedia.getTextPathOfProject());
    return mediasFolders;
  },

  getMediaMeta : function(projectPath, mediaFolderPath, mediaName) {
    dev.logfunction( "COMMON — getMediaMeta : projectPath = " + projectPath + " mediaFolderPath = " + mediaFolderPath + " mediaName = " + mediaName);
    var mediaJSONFilepath = dodocMedia.getPathToMedia(projectPath, mediaFolderPath, mediaName) + dodoc.metaFileext;
    var mediaData = fs.readFileSync(mediaJSONFilepath, dodoc.textEncoding);
    var mediaMetaData = dodocAPI.parseData(mediaData);
    return mediaMetaData;
  },

  getPathToMedia : function( projectPath, mediasFolderPath, mediaName) {
    return path.join( projectPath, mediasFolderPath, mediaName);
  },


  readTextMedia: function(textMediaPath) {
    var textMediaData = fs.readFileSync(textMediaPath, dodoc.textEncoding);
    textMediaData = dodocAPI.parseData(textMediaData);
    // we should get a title and text field, let's parse them in markdown and add title_md and text_md fields
    textMediaData.title_md = mm.parse(textMediaData.title).content;
    textMediaData.text_md = mm.parse(textMediaData.text).content;
    return textMediaData;
  },



  /********************************************* LONG FUNCTIONS *********************************************/

  listAllMedias: function( slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listAllMedias : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var mediasFoldersPath = dodocMedia.getAllMediasFoldersPathAsArray();
      var mediasProcessed = 0;
      var mediaFolderContent = [];
      mediasFoldersPath.forEach( function( mediasFolderPath) {
        mediaFolderContent = merge( mediaFolderContent, dodocMedia.listMediasOfOneType( slugFolderName, slugProjectName, mediasFolderPath));
      });
      resolve( mediaFolderContent);
    });
  },

  listMediasOfOneType: function(slugFolderName, slugProjectName, mediasFolderPath, mediaName) {
    dev.logfunction( "COMMON — listMediasOfOneType with");

    var projectPath = dodocProject.getProjectPath( slugFolderName, slugProjectName);
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
            var mdata = dodocMedia.getMediaMeta( projectPath, mediasFolderPath, metaFileNameWithoutExtension);
            mdata.mediaFolderPath = mediasFolderPath;
            mdata.mediaName = metaFileNameWithoutExtension;
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;

            // if the file is a text, then also add the content of the TXT in the answer
            if( new RegExp( dodoc.regexpGetFileExtension, 'i').exec( mediaFilename)[0] === '.md') {
              var textMediaData = dodocMedia.readTextMedia( path.join( projectPath, mediasFolderPath, mediaFilename));
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
  },

  listOneMedia: function( slugFolderName, slugProjectName, singleMediaFolderPath, mediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listOneMedia : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " singleMediaFolderPath = " + singleMediaFolderPath + " mediaName = " + mediaName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var mediaFolderContent = [];
      mediaFolderContent = merge( mediaFolderContent, dodocMedia.listMediasOfOneType( slugFolderName, slugProjectName, singleMediaFolderPath, mediaName));
      resolve( mediaFolderContent);
    });
  },

  createNewMedia:function(newMediaData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON - createNewMedia " + newMediaData.mediaType + " in project " + newMediaData.slugProjectName);

      var slugFolderName = newMediaData.slugFolderName;
      var slugProjectName = newMediaData.slugProjectName;
      var newFileName = dodocAPI.getCurrentDate();
      var newMediaType = newMediaData.mediaType;

      var mediaFolder = '';
      var pathToFile = '';
      var fileExtension;

      var mediaFolder = dodocMedia.getMediaFolderPathByType( newMediaType);

      switch (newMediaType) {
        case 'photo':
          var mediaPath = dodocMedia.getMediaPath( slugFolderName, slugProjectName, mediaFolder);
          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath, dodoc.metaFileext);
          pathToFile = path.join( mediaPath, newFileName);

          fileExtension = '.png';
          var imageBuffer = dodocAPI.decodeBase64Image( newMediaData.mediaData);

          fs.writeFile( pathToFile + fileExtension, imageBuffer.data, function(err) {
            if (err) reject( err);
            console.log("Image added at path " + pathToFile);

            gm( pathToFile + fileExtension)
              .resize( dodoc.mediaThumbWidth+'>', dodoc.mediaThumbHeight+'>')
              .quality( 60)
              .autoOrient()
              .write( pathToFile + dodoc.thumbSuffix + fileExtension, function (err) {
                if( err)
                  console.log( gutil.colors.red('--> Failed to make a thumbnail for a photo! Error: ', err));
                  dodocMedia.createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
                  mdata.slugFolderName = slugFolderName;
                  mdata['slugProjectName'] = slugProjectName;
                  mdata['mediaFolderPath'] = mediaFolder;
                  console.log( 'just created a photo, its meta is ' + JSON.stringify( mdata, null, 4));
                  resolve( mdata);
                }, function() {
                  reject( 'failed to create meta for photo');
                });
            });
          });

          break;
        case 'video':
          var mediaPath = dodocMedia.getMediaPath( slugFolderName, slugProjectName, mediaFolder);

          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = path.join( mediaPath, newFileName);

          fileExtension = dodoc.videoext;

          dodocAPI.writeVideoToDisk( pathToFile, fileExtension, newMediaData.mediaData)
          .then(function() {
            dev.error("Saved a video.");
            dodocMedia.createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
              mdata.slugFolderName = slugFolderName;
              mdata.slugProjectName = slugProjectName;
              mdata.mediaFolderPath = mediaFolder;

              dodocAPI.createThumbnails( pathToFile + fileExtension, newFileName, mediaPath).then(function( mediaFolderContent) {
                resolve( mdata);
              }, function(error) {
                console.log( gutil.colors.red('--> Failed to make a thumbnail one media! Error: ', error));
                resolve( mdata);
              });
            }, function() {
              reject( 'failed to create meta for video');
            });

          }, function(error) {
            dev.error("Failed to save video! Error: ", error);
            reject();
          });

          break;
        case 'animation':
          // get the path to the mediaFolder
            var mediaPath = dodocMedia.getMediaPath( slugFolderName, slugProjectName, mediaFolder);

          // get the path to the cache folder and the mp4 (it's the same without the extension)
          // WARNING : animation doesn't use newFileName, it already has a filename to use (generated at the beginning of a stopmotion capture)
          newFileName = newMediaData.stopMotionCacheFolder;
          pathToFile = path.join( mediaPath, newFileName);
          fileExtension = dodoc.stopMotionext;

          var frameRate = newMediaData.frameRate || 4;

          // ask ffmpeg to make a video from the cache images
          var proc = new ffmpeg({ "source" : pathToFile + '/%*.png'})
            // using 12 fps
            .withFpsInput(frameRate)
            .withVideoCodec('libvpx')
            .addOptions(['-vb 8000k', '-f webm'])
            // setup event handlers
            .on('end', function() {
              console.log('file has been converted succesfully');

              dodocMedia.createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
                mdata.slugFolderName = slugFolderName;
                mdata.slugProjectName = slugProjectName;
                mdata.mediaFolderPath = mediaFolder;
                dodocAPI.createThumbnails( pathToFile + fileExtension, newFileName, mediaPath).then(function( mediaFolderContent) {
                  resolve( mdata);
                }, function(error) {
                  dev.error("Failed to make a thumbnail one media! Error: ", error);
                  resolve( mdata);
                });
              }, function() {
                reject( 'failed to create meta for stopmotion');
              });

            })
            .on('error', function(err) {
              console.log('an error happened: ' + err.message);
              reject( "couldn't create a stopmotion animation");
            })
            // save to file
            .save( pathToFile + fileExtension);
          break;
        case 'audio':
          var mediaPath = dodocMedia.getMediaPath( slugFolderName, slugProjectName, mediaFolder);
          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath, dodoc.metaFileext);
          pathToFile = path.join( mediaPath, newFileName);

          fileExtension = '.wav';
          var dataMedia = newMediaData.mediaData.split(',').pop();
          var audioBuffer = new Buffer( dataMedia, 'base64');
          fs.writeFileSync( pathToFile + fileExtension, audioBuffer);

          var imgExtension = '.png';
          var imageBuffer = dodocAPI.decodeBase64Image( newMediaData.audioScreenshot);
          fs.writeFileSync( pathToFile + imgExtension, imageBuffer.data);

          dodocMedia.createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;
            mdata.mediaFolderPath = mediaFolder;
            resolve( mdata);
          }, function() {
            reject( 'failed to create meta for audio');
          });

          break;
        case 'text':
          var mediaPath = dodocMedia.getMediaPath( slugFolderName, slugProjectName, mediaFolder);
          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath, dodoc.metaFileext);
          pathToFile = path.join( mediaPath, newFileName);

          fileExtension = '.md';
          var dataTitle = newMediaData.title;
          var dataText = newMediaData.text;
          console.log( "Creating a new text media at path " + pathToFile + fileExtension + " with title : " + dataTitle + " and text : " + dataText);

          var mediaData = {
            "title" : dataTitle,
            "text" : dataText
          };
          dodocAPI.storeData(pathToFile + fileExtension, mediaData, "create").then(function( meta) {
            dodocMedia.createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
              var textMediaData = dodocMedia.readTextMedia(pathToFile + fileExtension);
              mdata.textMediaContent = textMediaData;
              mdata.slugFolderName = slugFolderName;
              mdata.slugProjectName = slugProjectName;
              mdata.mediaFolderPath = mediaFolder;
              resolve( mdata);
            }, function(err) {
              reject( 'failed to create meta for text media : ' + err);
            });
          }, function(err) {
            reject( 'failed to create textfile for text media : ' + err);
          });

          break;
      // end of switch
      }
    // end of promise
    });
  },


  createMediaMeta: function(newMediaType, pathToFile, fileName) {
    return new Promise(function(resolve, reject) {
      var mdata =
        {
          "created" : dodocAPI.getCurrentDate(),
          "modified" : dodocAPI.getCurrentDate(),
          "informations" : "",
          "type" : newMediaType,
          "fav" : false
        };
      dodocAPI.storeData( pathToFile + dodoc.metaFileext, mdata, 'update').then(function( meta) {
        meta.mediaName = fileName;
        console.log( "New media meta file created at path " + pathToFile + dodoc.metaFileext);
        resolve( meta);
      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t create media meta.'));
        reject( 'Couldn\'t create media meta');
      });
    });
  },


  editMediaMeta: function(editMediaData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON - editMediaMeta : " + JSON.stringify(editMediaData, null, 4));

      var slugFolderName = editMediaData.slugFolderName;
      var slugProjectName = editMediaData.slugProjectName;
      var mediaFolderPath = editMediaData.mediaFolderPath;
      var mediaName = editMediaData.mediaName;

      // get the path to the media JSON and its content
      var projectPath = dodocProject.getProjectPath( slugFolderName, slugProjectName);
      var mediaFilepath = dodocMedia.getPathToMedia( projectPath, mediaFolderPath, mediaName);
      var mediaMetaData = dodocMedia.getMediaMeta( projectPath, mediaFolderPath, mediaName);

      // switch the fav state
      if( editMediaData.switchFav !== undefined)
        mediaMetaData.fav = !mediaMetaData.fav;

      if( editMediaData.informations !== undefined)
        mediaMetaData.informations = editMediaData.informations;

      // if this is a text media, also update its content
      mediaMetaData.modified = dodocAPI.getCurrentDate();

      dodocAPI.storeData( mediaFilepath + dodoc.metaFileext, mediaMetaData, 'update').then(function( mdata) {
        dev.log('stored meta');
        // if media is a text, let's add the text content to the obj for convenience client-side
        if( mediaFolderPath === dodoc.projectTextsFoldername && editMediaData.titleOfTextmedia !== undefined && editMediaData.textOfTextmedia !== undefined) {

          var mediaFilepathWithExt = mediaFilepath + '.md';
          var mediaData = {
            "title" : editMediaData.titleOfTextmedia,
            "text" : editMediaData.textOfTextmedia
          };
          dev.log('now storing text media');
          dodocAPI.storeData( mediaFilepathWithExt, mediaData, 'update').then(function(mediaData) {
            dev.log('just stored text media');
            var textMediaData = dodocMedia.readTextMedia(mediaFilepathWithExt);
            mdata.textMediaContent = textMediaData;
            mdata.mediaName = mediaName;
            mdata.mediaFolderPath = mediaFolderPath;
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;
            resolve( mdata);
          }, function(err) {
            console.log( gutil.colors.red('--> Couldn\'t update text media : ' + err));
            reject( 'Couldn\'t update text media');
          });
        } else {
          dev.log('not a text media');
          // for updating the result
          mdata.mediaName = mediaName;
          mdata.mediaFolderPath = mediaFolderPath;
          mdata.slugFolderName = slugFolderName;
          mdata.slugProjectName = slugProjectName;
          resolve( mdata);
        }

      }, function(err) {
        console.log( gutil.colors.red('--> Couldn\'t update media meta. : ' + err));
        reject( 'Couldn\'t update media meta');
      });
    });
  },

  deleteOneMedia: function(slugFolderName, slugProjectName, mediaFolder, mediaName) {
    return new Promise(function(resolve, reject) {
      var pathToMediaFolder = dodocMedia.getMediaPath( slugFolderName, slugProjectName, mediaFolder);
      // find in path

      try {
        var filesInMediaFolder = fs.readdirSync( pathToMediaFolder);
        filesInMediaFolder.forEach( function( filename) {
          var fileNameWithoutExtension = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( filename)[1];
          if( fileNameWithoutExtension === mediaName) {
            var filePath = path.join( pathToMediaFolder, filename);
            var deletedFilePath = path.join( pathToMediaFolder, dodoc.deletedPrefix + filename);
            fs.renameSync( filePath, deletedFilePath);
            console.log( "A file will be deleted (renamed but hidden from dodoc) : \n - " + filePath + "\n - " + deletedFilePath);
          }
        });
        var mediaMetaData =
        {
          "slugFolderName" : slugFolderName,
          "slugProjectName" : slugProjectName,
          "mediaFolder" : mediaFolder,
          "mediaName" : mediaName,
          "mediaKey" : path.join( mediaFolder, mediaName + dodoc.metaFileext)
        }
        resolve( mediaMetaData);
      } catch( err) {
        reject( err);
      }
    });
  },



};