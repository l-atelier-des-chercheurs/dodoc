var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');
var merge = require('merge');

var mm = require('marky-mark');

var ffmpegstatic = require('ffmpeg-static');
var ffmpeg = require('fluent-ffmpeg');

var sharp = require('sharp');

var dodoc  = require('../dodoc');
var dodocAPI = require('./dodoc-api');
var dev = require('./dev-log');

ffmpeg.setFfmpegPath(ffmpegstatic.path);

var dodocMedia = (function() {

  const API = {
    getMediaFolderPathByType  : (mediaType) => { return getMediaFolderPathByType(mediaType); },
    getAnimationPathOfProject : () => { return getAnimationPathOfProject(); },
    getAllMediasFoldersPathAsArray : () => { return getAllMediasFoldersPathAsArray(); },
    listAllMedias             : (slugFolderName, slugProjectName) => { return listAllMedias(slugFolderName, slugProjectName); },
    listOneMedia              : (slugFolderName, slugProjectName, singleMediaFolderPath, mediaName) => { return listOneMedia(slugFolderName, slugProjectName, singleMediaFolderPath, mediaName); },
    createNewMedia            : (newMediaData) => { return createNewMedia(newMediaData); },
    editMediaMeta             : (editMediaData) => { return editMediaMeta(editMediaData); },
    deleteOneMedia            : (slugFolderName, slugProjectName, mediaFolder, mediaName) => { return deleteOneMedia(slugFolderName, slugProjectName, mediaFolder, mediaName); },
    makeImageFromData         : (imageBufferData, pathToFile) => { return makeImageFromData(imageBufferData, pathToFile); },
  };

  /***************************************************************************************************/
  /******************************************** public functions *************************************/
  /***************************************************************************************************/

  function getMediaFolderPathByType( mediaType) {
    if( mediaType == 'photo')
      return _getPhotoPathOfProject();
    if( mediaType == 'video')
      return _getVideoPathOfProject();
    if( mediaType == 'animation')
      return getAnimationPathOfProject();
    if( mediaType == 'audio')
      return _getAudioPathOfProject();
    if( mediaType == 'text')
      return _getTextPathOfProject();
  }
  function getAnimationPathOfProject() {
    return dodoc.projectAnimationsFoldername;
  }
  function getAllMediasFoldersPathAsArray() {
    var mediasFolders = [];
    mediasFolders.push( _getPhotoPathOfProject());
    mediasFolders.push( getAnimationPathOfProject());
    mediasFolders.push( _getVideoPathOfProject());
    mediasFolders.push( _getAudioPathOfProject());
    mediasFolders.push( _getTextPathOfProject());
    return mediasFolders;
  }

  function listAllMedias( slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listAllMedias : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var mediasFoldersPath = getAllMediasFoldersPathAsArray();
      var mediasProcessed = 0;
      var mediaFolderContent = [];
      mediasFoldersPath.forEach( function( mediasFolderPath) {
        mediaFolderContent = merge( mediaFolderContent, _listMediasOfOneType( slugFolderName, slugProjectName, mediasFolderPath));
      });
      resolve( mediaFolderContent);
    });
  }

  function listOneMedia( slugFolderName, slugProjectName, singleMediaFolderPath, mediaName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listOneMedia : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " singleMediaFolderPath = " + singleMediaFolderPath + " mediaName = " + mediaName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var mediaFolderContent = [];
      mediaFolderContent = merge( mediaFolderContent, _listMediasOfOneType( slugFolderName, slugProjectName, singleMediaFolderPath, mediaName));
      resolve( mediaFolderContent);
    });
  }
  function createNewMedia(newMediaData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON - createNewMedia " + newMediaData.mediaType + " in project " + newMediaData.slugProjectName);

      var slugFolderName = newMediaData.slugFolderName;
      var slugProjectName = newMediaData.slugProjectName;
      var newFileName = dodocAPI.getCurrentDate();
      var newMediaType = newMediaData.mediaType;

      var mediaFolder = '';
      var pathToFile = '';
      var fileExtension;

      var mediaFolder = getMediaFolderPathByType(newMediaType);

      dev.logverbose('Adding a new media…');
      switch (newMediaType) {
        case 'photo':
          var mediaPath = _getMediaPath(slugFolderName, slugProjectName, mediaFolder);
          newFileName = dodocAPI.findFirstFilenameNotTaken(newFileName, mediaPath, dodoc.metaFileext);
          pathToFile = path.join(mediaPath, newFileName);

          var imageBuffer = dodocAPI.decodeBase64Image( newMediaData.mediaData);
          dev.logverbose('Will store this photo at path: ' + pathToFile);

          makeImageFromData(imageBuffer.data, pathToFile)
          .then(function(imagePath) {
            var thumbPath = pathToFile + '-' + dodoc.thumbSuffix + '.jpeg';
            return _makeImageThumb(imagePath, thumbPath);
          }, function(error) {
            dev.error("Failed to save image! Error: " + error);
            reject();
          })
          .then(function(err) {
            if( err) { dev.error('--> Failed to make a thumbnail for a photo! Error: ', err); }
            return _createMediaMeta( newMediaType, pathToFile, newFileName);
          })
          .then( function( mdata) {
            mdata.slugFolderName = slugFolderName;
            mdata['slugProjectName'] = slugProjectName;
            mdata['mediaFolderPath'] = mediaFolder;
            console.log('Just created a photo, its meta is ' + JSON.stringify( mdata, null, 4));
            resolve(mdata);
          }, function(error) {
            dev.error('Failed to create meta for photo! Error: ' + error);
            reject( 'failed to create meta for photo');
          });

          break;
        case 'video':
          var mediaPath = _getMediaPath( slugFolderName, slugProjectName, mediaFolder);

          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = path.join( mediaPath, newFileName);

          dodocAPI.writeMediaDataToDisk( pathToFile, dodoc.videoext, newMediaData.mediaData.videoData)
/*
          .then(function() {
            return dodocAPI.writeMediaDataToDisk( pathToFile, dodoc.audioext, newMediaData.mediaData.audioData)
          }, function(error) { reject('Failed to save video: ' + error); })
*/
          .then(function() {
            return _createMediaMeta(newMediaType, pathToFile, newFileName)
          }, function(error) { reject('Failed to save audio: ' + error); })
          .then( function(mdata) {
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;
            mdata.mediaFolderPath = mediaFolder;

            _createThumbnails(pathToFile + dodoc.videoext, newFileName, mediaPath)
            .then(function(mediaFolderContent) {

              if(newMediaData.mediaData.audioData === undefined) {
                resolve(mdata);
              }

/*
              var audioFile = pathToFile + dodoc.audioext;
              var videoFile = pathToFile + dodoc.videoext;

              var proc = new ffmpeg()
                .addOptions(['-vb 8000k', '-i '+audioFile, '-itsoffset -00:00:01', '-i '+videoFile, '-map 0:0', '-map 1:0'])
// var command = "ffmpeg -i " + audioFile + " -itsoffset -00:00:01 -i " + videoFile + " -map 0:0 -map 1:0 " + mergedFile;
                // setup event handlers
                .on('end', function() {
                  dev.log('Successful merge of video+audio track.');
                  resolve(mdata);
                })
                .on('error', function(err) {
                  console.log('an error happened: ' + err.message);
                  resolve('couldn\'t create a video animation');
                })
                // save to file
                .save( pathToFile + '_merged' + dodoc.videoext);
*/

            }, function(error) {
              dev.error('--> Failed to make a thumbnail for a video! Error: ' + error);
              resolve(mdata);
            });

          }, function(error) { reject('Failed to make video meta: ' + error); })

          break;
        case 'animation':
          // get the path to the mediaFolder
            var mediaPath = _getMediaPath( slugFolderName, slugProjectName, mediaFolder);

          // get the path to the cache folder and the mp4 (it's the same without the extension)
          // WARNING : animation doesn't use newFileName, it already has a filename to use (generated at the beginning of a stopmotion capture)
          newFileName = newMediaData.stopMotionCacheFolder;
          pathToFile = path.join( mediaPath, newFileName);
          fileExtension = dodoc.stopMotionext;

          var frameRate = newMediaData.frameRate || 4;

          // ask ffmpeg to make a video from the cache images
          var proc = new ffmpeg({ "source" : pathToFile + '/%*.jpeg'})
            // using 12 fps
            .withFpsInput(frameRate)
            .withVideoCodec('libvpx')
            .addOptions(['-vb 8000k', '-f webm'])
            // setup event handlers
            .on('end', function() {
              console.log('file has been converted succesfully');

              _createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
                mdata.slugFolderName = slugFolderName;
                mdata.slugProjectName = slugProjectName;
                mdata.mediaFolderPath = mediaFolder;
                _createThumbnails( pathToFile + fileExtension, newFileName, mediaPath).then(function( mediaFolderContent) {
                  resolve( mdata);
                }, function(error) {
                  dev.error("Failed to make a thumbnail for a stopmotion! Error: " + error);
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
          var mediaPath = _getMediaPath( slugFolderName, slugProjectName, mediaFolder);
          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath, dodoc.metaFileext);
          pathToFile = path.join( mediaPath, newFileName);

          dodocAPI.writeMediaDataToDisk( pathToFile, dodoc.audioext, newMediaData.mediaData)
          .then(function() {
            var imgExtension = '.png';
            var imageBuffer = dodocAPI.decodeBase64Image( newMediaData.audioScreenshot);
            fs.writeFileSync( pathToFile + imgExtension, imageBuffer.data);

            _createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
              mdata.slugFolderName = slugFolderName;
              mdata.slugProjectName = slugProjectName;
              mdata.mediaFolderPath = mediaFolder;
              resolve( mdata);
            }, function() {
              reject( 'failed to create meta for audio');
            });

          }, function(error) {
            dev.error("Failed to save audio! Error: " + error);
            reject();
          });

          break;
        case 'text':
          var mediaPath = _getMediaPath( slugFolderName, slugProjectName, mediaFolder);
          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath, dodoc.metaFileext);
          pathToFile = path.join( mediaPath, newFileName);

          fileExtension = '.md';
          var dataText = newMediaData.text;
          console.log( "Creating a new text media at path " + pathToFile + fileExtension + " with text : " + dataText);

          var mediaData = {
            "text" : dataText
          };
          dodocAPI.storeData(pathToFile + fileExtension, mediaData, "create").then(function( meta) {
            _createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
              var textMediaData = _readTextMedia(pathToFile + fileExtension);
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
  }
  function editMediaMeta(editMediaData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON - editMediaMeta : " + JSON.stringify(editMediaData, null, 4));

      var slugFolderName = editMediaData.slugFolderName;
      var slugProjectName = editMediaData.slugProjectName;
      var mediaFolderPath = editMediaData.mediaFolderPath;
      var mediaName = editMediaData.mediaName;

      // get the path to the media JSON and its content
      var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
      var mediaFilepath = _getPathToMedia( projectPath, mediaFolderPath, mediaName);
      var mediaMetaData = _getMediaMeta( projectPath, mediaFolderPath, mediaName);

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
        if( mediaFolderPath === dodoc.projectTextsFoldername && editMediaData.textOfTextmedia) {

          var mediaFilepathWithExt = mediaFilepath + '.md';
          var mediaData = {
            "text" : editMediaData.textOfTextmedia
          };
          dev.log('now storing text media');
          dodocAPI.storeData( mediaFilepathWithExt, mediaData, 'update').then(function(mediaData) {
            dev.log('just stored text media');
            var textMediaData = _readTextMedia(mediaFilepathWithExt);
            mdata.textMediaContent = textMediaData;
            mdata.mediaName = mediaName;
            mdata.mediaFolderPath = mediaFolderPath;
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;
            resolve( mdata);
          }, function(err) {
            dev.error('--> Couldn\'t update text media : ' + err);
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
        dev.error('--> Couldn\'t update media meta. : ' + err);
        reject( 'Couldn\'t update media meta');
      });
    });
  }

  function deleteOneMedia(slugFolderName, slugProjectName, mediaFolder, mediaName) {
    return new Promise(function(resolve, reject) {
      var pathToMediaFolder = _getMediaPath( slugFolderName, slugProjectName, mediaFolder);
      try {
        var filesInMediaFolder = fs.readdirSync( pathToMediaFolder);
        filesInMediaFolder.forEach(function(filename) {
          var cleanMediaName = _getMediaFileNameFromFileName(filename);
          if( cleanMediaName === mediaName) {
            var filePath = path.join( pathToMediaFolder, filename);
            var deletedFilePath = path.join( pathToMediaFolder, dodoc.deletedPrefix + filename);
            fs.renameSync( filePath, deletedFilePath);
            console.log( "A file will be deleted (renamed and hidden from dodoc) : \n - " + filePath + "\n - " + deletedFilePath);
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
  }


  function _createThumbnails(videoPath, videoFilename, pathToMediaFolder){
    return new Promise(function(resolve, reject) {
      dev.logverbose('Will attempt to make a thumbnail out of a video or stopmotion with info ' + JSON.stringify({videoPath, videoFilename, pathToMediaFolder}));
      var proc = ffmpeg( videoPath)
      // setup event handlers
      .on('end', function(files) {
        console.log('screenshot was saved');
        resolve();
      })
      .on('error', function(err) {
        console.log('an error happened: ' + err.message);
        reject(err.message);
      })
      // take 2 screenshots at predefined timemarks
      .takeScreenshots({ count: 1, timemarks: [ '00:00:00'], "filename" : videoFilename + ".jpeg", "-q:v": 5}, pathToMediaFolder);
    });
  }

  // receives base64data and a path to filename (without ext)
  function makeImageFromData(imageBufferData, pathToFile) {
    return new Promise(function(resolve, reject) {
      var imagePath = pathToFile + '.jpeg';
      dev.logverbose('Now using image processore to optimize new image.');
/*
      Jimp.read(imageBufferData, function(err, image) {
        if (err) reject(err);
        image
          .quality(90)
          .write(imagePath, function(err, info) {
            if (err) reject(err);
            dev.logverbose('Image has been saved, resolving its path.');
            resolve(imagePath);
          });
        });
*/

      // equivalent in sharp (but sharp needs native deps, which is annoying)
      sharp(imageBufferData)
        .rotate()
        .withMetadata()
        .toFormat(sharp.format.jpeg)
        .quality(90)
        .toFile(imagePath, function(err, info) {
          dev.logverbose('Image has been saved, resolving its path.');
          resolve(imagePath);
        });

    });
  }


  /***************************************************************************************************/
  /******************************************** private functions ************************************/
  /***************************************************************************************************/

  function _getMediaPath( slugFolderName, slugProjectName, mediaFolder) {
    dev.logverbose('_getMediaPath with slugFolderName:' + slugFolderName + ' slugProjectName: ' + slugProjectName + ' mediaFolder: ' + mediaFolder);
    return path.join( dodocAPI.getProjectPath(slugFolderName, slugProjectName), mediaFolder);
  }

  function _getPhotoPathOfProject() {
    return dodoc.projectPhotosFoldername;
  }
  function _getVideoPathOfProject() {
    return dodoc.projectVideosFoldername;
  }
  function _getAudioPathOfProject() {
    return dodoc.projectAudiosFoldername;
  }


  function _getTextPathOfProject() {
    return dodoc.projectTextsFoldername;
  }
  function _getMediaMeta(projectPath, mediaFolderPath, mediaName) {
    dev.logfunction( "COMMON — _getMediaMeta : projectPath = " + projectPath + " mediaFolderPath = " + mediaFolderPath + " mediaName = " + mediaName);
    var mediaJSONFilepath = _getPathToMedia(projectPath, mediaFolderPath, mediaName) + dodoc.metaFileext;
    var mediaData = fs.readFileSync(mediaJSONFilepath, dodoc.textEncoding);
    var mediaMetaData = dodocAPI.parseData(mediaData);
    return mediaMetaData;
  }
  function _getPathToMedia( projectPath, mediasFolderPath, mediaName) {
    return path.join( projectPath, mediasFolderPath, mediaName);
  }
  function _readTextMedia(textMediaPath) {
    var textMediaData = fs.readFileSync(textMediaPath, dodoc.textEncoding);
    textMediaData = dodocAPI.parseData(textMediaData);
    textMediaData.text_md = mm.parse(textMediaData.text).content;
    return textMediaData;
  }
  function _listMediasOfOneType(slugFolderName, slugProjectName, mediasFolderPath, mediaName) {
    dev.logfunction( "COMMON — _listMediasOfOneType with " + JSON.stringify({slugFolderName, slugProjectName, mediasFolderPath, mediaName}));

    var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
    var mediasPath = path.join( projectPath, mediasFolderPath);
    var lookingForSpecificJson = mediaName !== undefined ? true : false;

    var filesInMediaFolder = fs.readdirSync( mediasPath);
    var foldersMediasMeta = [];
    var foldersMediasFiles = [];
//     dev.log( "- looking for files in " + mediasPath);
    filesInMediaFolder.forEach( function( filename) {
      // if file is not a folder and not .DS_STORE
      if( !new RegExp( dodoc.regexpMatchFolderNames, 'i').test( filename) && filename !== ".DS_Store") {
        var fileExtension = new RegExp( dodoc.regexpGetFileExtension, 'i').exec( filename)[0];
        // match only meta files that are not deleted (prefixed with a custom prefix
        if( fileExtension === dodoc.metaFileext && !new RegExp( '^' + dodoc.deletedPrefix).test( filename)) {
          if( !lookingForSpecificJson)
            foldersMediasMeta.push( filename);
          else if( filename === mediaName + dodoc.metaFileext) {
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
        // if this media filename corresponds to the meta filename
        if (mediaFilename.indexOf(metaFileNameWithoutExtension) !== -1 ) {
          var mediaObjKey = path.join( mediasFolderPath, mediaMetaFilename);
          // if we don't have an obj with this key
          if( !folderMediaMetaAndFileName.hasOwnProperty( mediaObjKey)) {
            // let's make one
            folderMediaMetaAndFileName[mediaObjKey] = new Object();
            // read JSON file and add the content to the folder
            var mdata = _getMediaMeta( projectPath, mediasFolderPath, metaFileNameWithoutExtension);
            mdata.mediaFolderPath = mediasFolderPath;
            mdata.mediaName = metaFileNameWithoutExtension;
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;

            // if the file is a text, then also add the content of the TXT in the answer
            if( new RegExp( dodoc.regexpGetFileExtension, 'i').exec( mediaFilename)[0] === '.md') {
              var textMediaData = _readTextMedia( path.join( projectPath, mediasFolderPath, mediaFilename));
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
  function _createMediaMeta(newMediaType, pathToFile, fileName) {
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
        dev.error('--> Couldn\'t create media meta.');
        reject( 'Couldn\'t create media meta');
      });
    });
  }

  // a mediaFileName starts at the beginning of a filename and end at the first dash
  // i.e. the following filenames have the same mediaFileName "20161121_164329_1" :
  // --> 20161121_164329_1.txt
  // --> 20161121_164329_1-thumb.png
  // --> 20161121_164329_1-any-option.webm
  function _getMediaFileNameFromFileName(filename) {
    var fileNameWithoutExtension = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec(filename)[1];
    // get the "name" part of this filename
    var cleanMediaName = new RegExp( dodoc.regexpGetMediaName, 'i').exec(fileNameWithoutExtension)[0];
    return cleanMediaName;
  }

  function _makeImageThumb(imagePath, thumbPath) {
    return new Promise(function(resolve, reject) {
      dev.logverbose("Making a thumb at thumbPath: " + thumbPath);

/*
      Jimp.read(imagePath, function(err, image) {
        if (err) reject(err);
        image
          .clone()
          .quality(dodoc.mediaThumbQuality)
          .scaleToFit(dodoc.mediaThumbWidth, dodoc.mediaThumbHeight)
          .write(thumbPath, function(err, info) {
            if (err) reject(err);
            dev.logverbose('Image has been saved, resolving its path.');
            resolve();
          });
      });
*/
      sharp(imagePath)
        .rotate()
        .resize(dodoc.mediaThumbWidth, dodoc.mediaThumbHeight)
        .max()
        .withoutEnlargement()
        .withMetadata()
        .toFormat('jpeg')
        .quality(dodoc.mediaThumbQuality)
        .toFile(thumbPath)
        .then(function() {
          resolve();
        });
    });
  }

  return API;
})();

module.exports = dodocMedia;