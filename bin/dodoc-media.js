var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');
var merge = require('merge');

var md = require('markdown-it')();
var glob = require('glob')
var pad = require('pad-left');

var ffmpegstatic = require('ffmpeg-static');
var ffmpeg = require('fluent-ffmpeg');

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
    return dodoc.settings().projectAnimationsFoldername;
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

      // adding a random string characters at the end, in case two medias get sent at the precise same moment
      var randomCharacters = (Math.random().toString(36)+'00000000000000000').slice(2, 3 + 2);
      var newFileName = dodocAPI.getCurrentDate() + '_' + randomCharacters;

      var newMediaType = newMediaData.mediaType;

      var mediaFolder = '';
      var pathToFile = '';
      var fileExtension;

      var mediaFolder = getMediaFolderPathByType(newMediaType);

      dev.logverbose('Adding a new media…');
      switch (newMediaType) {
        case 'photo':
          var mediaPath = _getMediaPath(slugFolderName, slugProjectName, mediaFolder);
          newFileName = dodocAPI.findFirstFilenameNotTaken(newFileName, mediaPath, dodoc.settings().metaFileext);
          pathToFile = path.join(mediaPath, newFileName);

          var projectPath = dodocAPI.getProjectPath(slugFolderName, slugProjectName);
          // check if it already has a preview
          var dodocProject = require('./dodoc-project');
          if(!dodocProject.getProjectPreview(projectPath)) {
            // if it doesn't let's set that image to be one
            dodocProject.addProjectPreview(projectPath, newMediaData.mediaData);
          }

          var imageBuffer = dodocAPI.decodeBase64Image( newMediaData.mediaData);
          dev.logverbose('Will store this photo at path: ' + pathToFile);

          dodocAPI.makeImageFromData(imageBuffer.data, pathToFile)
          .then(function(imagePath) {
            var thumbPath = pathToFile + '-' + dodoc.settings().thumbSuffix + '.jpeg';
            return dodocAPI.makeImageThumb(imagePath, thumbPath);
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
            dev.log('Just created a photo, its meta is ' + JSON.stringify( mdata, null, 4));
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

          dodocAPI.writeMediaDataToDisk( pathToFile, dodoc.settings().videoext, newMediaData.mediaData.videoData)
/*
          .then(function() {
            return dodocAPI.writeMediaDataToDisk( pathToFile, dodoc.settings().audioext, newMediaData.mediaData.audioData)
          }, function(error) { reject('Failed to save video: ' + error); })
*/
          .then(function() {
            return _createMediaMeta(newMediaType, pathToFile, newFileName)
          }, function(error) { reject('Failed to save video: ' + error); })
          .then( function(mdata) {
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;
            mdata.mediaFolderPath = mediaFolder;

            _createThumbnails(pathToFile + dodoc.settings().videoext, newFileName, mediaPath)
            .then(function(mediaFolderContent) {
              if(newMediaData.mediaData.audioData === undefined) {
                resolve(mdata);
              }
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
          fileExtension = dodoc.settings().stopMotionext;

          var frameRate = newMediaData.frameRate || 4;

          var numberOfImagesToProcess = fs.readdirSync(pathToFile).length;
          dev.logverbose(`Number of images to process in ${pathToFile} is ${numberOfImagesToProcess}`);

          _batchCopyToNewFolder(pathToFile)
          .then(stopmotionImageSequenceFolderPath => {
            // ask ffmpeg to make a video from the cache images
            var proc = new ffmpeg()
              .input(path.join(stopmotionImageSequenceFolderPath, 'img-%04d.jpeg'))
              // using 12 fps
              .withFpsInput(frameRate)
              .withVideoCodec('libvpx')
              .addOptions(['-vb 8000k', '-f webm'])
              .output(pathToFile + fileExtension)
              // setup event handlers
              .on('progress', progress => {
                var msg = {
                  "author" : newMediaData.author,
                  "content" : `${dodoc.lang().stopMotionCompilationProgress} ${progress.frames}/${numberOfImagesToProcess} ${dodoc.lang().imagesAdded}`
                };
                require('../sockets').notifyUser(msg);
                dev.logverbose(`Processing new stopmotion: image ${progress.frames}/${numberOfImagesToProcess}`);
              })
              .on('end', () => {
                dev.log('file has been converted succesfully');
                // remove temp folder with seq images
                fs.remove(stopmotionImageSequenceFolderPath);

                _createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
                  mdata.slugFolderName = slugFolderName;
                  mdata.slugProjectName = slugProjectName;
                  mdata.mediaFolderPath = mediaFolder;
                  _createThumbnails( pathToFile + fileExtension, newFileName, mediaPath).then(function( mediaFolderContent) {
                    resolve( mdata);
                  }, error => {
                    dev.error("Failed to make a thumbnail for a stopmotion! Error: " + error);
                    resolve( mdata);
                  });
                }, () => {
                  reject( 'failed to create meta for stopmotion');
                });

              })

              .on('error', function(err, stdout, stderr) {
                dev.error('An error happened: ' + err.message);
                dev.error('ffmpeg standard output:\n' + stdout);
                dev.error('ffmpeg standard error:\n' + stderr);
                reject( "couldn't create a stopmotion animation");
              })

              // save to file
              .run();
          });

          break;
        case 'audio':
          var mediaPath = _getMediaPath( slugFolderName, slugProjectName, mediaFolder);
          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath, dodoc.settings().metaFileext);
          pathToFile = path.join( mediaPath, newFileName);

          dodocAPI.writeMediaDataToDisk( pathToFile, dodoc.settings().audioext, newMediaData.mediaData.audioData)
          .then(function() {

            if(newMediaData.audioScreenshot !== undefined) {
              var imgExtension = '.png';
              var imageBuffer = dodocAPI.decodeBase64Image( newMediaData.audioScreenshot);
              fs.writeFileSync( pathToFile + imgExtension, imageBuffer.data);
            }

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
          newFileName = dodocAPI.findFirstFilenameNotTaken( newFileName, mediaPath, dodoc.settings().metaFileext);
          pathToFile = path.join( mediaPath, newFileName);

          fileExtension = '.md';
          var dataText = newMediaData.text;
          dev.log(`Creating a new text media at path ${pathToFile}${fileExtension} with text : ${dataText}`);

          dodocAPI.storeData(pathToFile + fileExtension, dataText, "create").then(function( meta) {
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

      dodocAPI.storeData( mediaFilepath + dodoc.settings().metaFileext, mediaMetaData, 'update').then(function( mdata) {
        dev.logverbose('Just stored meta for media');
        // if media is a text, let's add the text content to the obj for convenience client-side
        if( mediaFolderPath === dodoc.settings().projectTextsFoldername && editMediaData.textOfTextmedia) {

          var mediaFilepathWithExt = mediaFilepath + '.md';
          var mediaData = {
            "text" : editMediaData.textOfTextmedia
          };
          dev.logverbose('now storing text media');
          dodocAPI.storeData( mediaFilepathWithExt, mediaData, 'update').then(function(mediaData) {
            dev.logverbose('just stored text media');
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
          dev.logverbose('not a text media');
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
      dev.logfunction( "COMMON - deleteOneMedia : " + JSON.stringify({slugFolderName, slugProjectName, mediaFolder, mediaName}, null, 4));
      var pathToMediaFolder = _getMediaPath( slugFolderName, slugProjectName, mediaFolder);
      try {
        var filesInMediaFolder = fs.readdirSync( pathToMediaFolder);
        dev.logverbose(`Looking for all files that start with ${mediaName}.`);
        filesInMediaFolder.forEach(function(filename) {
          var cleanMediaName = _getMediaFileNameFromFileName(filename);
          dev.logverbose(`Current filename = ${filename} with cleanMediaName = ${cleanMediaName} `);
          if( cleanMediaName === mediaName) {
            var filePath = path.join( pathToMediaFolder, filename);
            var deletedFilePath = path.join( pathToMediaFolder, dodoc.settings().deletedPrefix + filename);

            // ugly fix but windows locks files right after readdirSync, so we need to add a small delay before renaming files
            setTimeout(() => {
              fs.renameSync( filePath, deletedFilePath);
              dev.log( "A file will be deleted (renamed and hidden from dodoc) : \n - " + filePath + "\n - " + deletedFilePath);

              var mediaMetaData =
              {
                "slugFolderName" : slugFolderName,
                "slugProjectName" : slugProjectName,
                "mediaFolder" : mediaFolder,
                "mediaName" : mediaName,
                "mediaKey" : path.join( mediaFolder, mediaName + dodoc.settings().metaFileext)
              }
              resolve( mediaMetaData);
            }, 200);
          }
        });
      } catch( err) {
        dev.error(`Failed to read dir ${pathToMediaFolder}`);
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
        dev.log('screenshot was saved');
        resolve();
      })
      .on('error', function(err) {
        dev.log('an error happened: ' + err.message);
        reject(err.message);
      })
      // take 2 screenshots at predefined timemarks
      .takeScreenshots({ count: 1, timemarks: [ '00:00:00'], "filename" : videoFilename + ".jpeg", "-q:v": 5}, pathToMediaFolder);
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
    return dodoc.settings().projectPhotosFoldername;
  }
  function _getVideoPathOfProject() {
    return dodoc.settings().projectVideosFoldername;
  }
  function _getAudioPathOfProject() {
    return dodoc.settings().projectAudiosFoldername;
  }


  function _getTextPathOfProject() {
    return dodoc.settings().projectTextsFoldername;
  }
  function _getMediaMeta(projectPath, mediaFolderPath, mediaName) {
    dev.logfunction( "COMMON — _getMediaMeta : projectPath = " + projectPath + " mediaFolderPath = " + mediaFolderPath + " mediaName = " + mediaName);
    var mediaJSONFilepath = _getPathToMedia(projectPath, mediaFolderPath, mediaName) + dodoc.settings().metaFileext;
    var mediaData = fs.readFileSync(mediaJSONFilepath, dodoc.settings().textEncoding);
    var mediaMetaData = dodocAPI.parseData(mediaData);
    return mediaMetaData;
  }
  function _getPathToMedia( projectPath, mediasFolderPath, mediaName) {
    return path.join( projectPath, mediasFolderPath, mediaName);
  }
  function _readTextMedia(textMediaPath) {
    dev.logfunction(`COMMON — _readTextMedia for ${textMediaPath}`);
    var textMediaData = fs.readFileSync(textMediaPath, dodoc.settings().textEncoding);
    textMediaData = dodocAPI.parseData(textMediaData);
    dev.logverbose(`textMediaData = ${JSON.stringify(textMediaData, null, 4)}`);
    let textContentToParse = textMediaData.hasOwnProperty('text') ? textMediaData.text : textMediaData.content;

    let textInfos = {
      text_md: md.render(textContentToParse),
      text: textContentToParse
    }
    return textInfos;
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
      if( !new RegExp( dodoc.settings().regexpMatchFolderNames, 'i').test( filename) && filename !== ".DS_Store") {
        var fileExtension = new RegExp( dodoc.settings().regexpGetFileExtension, 'i').exec( filename)[0];
        // match only meta files that are not deleted (prefixed with a custom prefix
        if( fileExtension === dodoc.settings().metaFileext && !new RegExp( '^' + dodoc.settings().deletedPrefix).test( filename)) {
          if( !lookingForSpecificJson)
            foldersMediasMeta.push( filename);
          else if( filename === mediaName + dodoc.settings().metaFileext) {
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
      var metaFileNameWithoutExtension = new RegExp( dodoc.settings().regexpRemoveFileExtension, 'i').exec( mediaMetaFilename)[1];
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
            if( new RegExp( dodoc.settings().regexpGetFileExtension, 'i').exec( mediaFilename)[0] === '.md') {
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
      dodocAPI.storeData( pathToFile + dodoc.settings().metaFileext, mdata, 'update').then(function( meta) {
        meta.mediaName = fileName;
        dev.log( "New media meta file created at path " + pathToFile + dodoc.settings().metaFileext);
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
  // --> 20161121_164329_1-thumb.jpeg
  // --> 20161121_164329_1-any-option.webm
  function _getMediaFileNameFromFileName(filename) {
    var fileNameWithoutExtension = new RegExp( dodoc.settings().regexpRemoveFileExtension, 'i').exec(filename)[1];
    // get the "name" part of this filename
    var cleanMediaName = new RegExp( dodoc.settings().regexpGetMediaName, 'i').exec(fileNameWithoutExtension)[0];
    return cleanMediaName;
  }

  function _batchCopyToNewFolder(pathToFile) {
    return new Promise(function(resolve, reject) {
      dev.logfunction("COMMON — _batchCopyToNewFolder");
      // create a folder at pathToFile
      var seqImageFolder = path.join(pathToFile, 'seq');
      fs.ensureDirSync(seqImageFolder);

      // copy each images there with a name following img-%04d.jpeg
      glob(pathToFile + '/*.jpeg', [], function (er, files) {

        	let processed = 0, index = 0;
        	files.forEach(function(file) {
        		// todo : passer en async et check à la fin

        		fs.copy(file, path.join(seqImageFolder, 'img-' + pad(index, 4, '0') + '.jpeg'), function (err) {
            if(err) {
              dev.error('failed to copy: ' + err);
              reject(err);
            }
            processed++;
            if(processed === files.length) {
              // resolve path to this new folder
              resolve(seqImageFolder);
              dev.log("Stopmotion - renaming step : " + processed + " files processed out of " + files.length);
            }
          });

          index++;

        	});
      });
    });
  }

  return API;
})();

module.exports = dodocMedia;