var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');
var moment = require('moment');
var parsedown = require('dodoc-parsedown');

var dodoc  = require('../public/dodoc');

var dodocAPI = (function() {

  const API = {
    getCurrentDate      : function(f) { return getCurrentDate(f = dodoc.metaDateFormat); },
    parseData           : function(d) { return parseData(d); },
    storeData           : function(mpath, d, e) { return storeData(mpath, d, e); },
    readMetaFile        : function(metaFile) { return readMetaFile(metaFile); },
    getUserPath         : function() { return getUserPath(); },
    findFirstFilenameNotTaken : function(fileName, currentPath, fileext) { return findFirstFilenameNotTaken(fileName, currentPath, fileext); },
    eventAndContent     : function(sendEvent, objectJson) { return eventAndContent(sendEvent, objectJson); },
    sendEventWithContent: function(sendEvent, objectContent, io, socket) { return sendEventWithContent(sendEvent, objectContent, io, socket); },
    decodeBase64Image   : function(dataString) { return decodeBase64Image(dataString); },
    writeVideoToDisk    : function(pathToFile, fileExtension, dataURL) { return writeVideoToDisk(pathToFile, fileExtension, dataURL); },
    createThumbnails    : function(videoPath, videoFilename, pathToMediaFolder) { return createThumbnails(videoPath, videoFilename, pathToMediaFolder);},
    listAllTemplates    : function() { return listAllTemplates(); },
  };

  function getCurrentDate(f) {
    return moment().format(f);
  }

  function parseData(d) {
    var parsed = parsedown.parse(d);
  // the fav field is a boolean, so let's convert it
    if( parsed.hasOwnProperty('fav'))
      parsed.fav = (parsed.fav === 'true');
    return parsed;
  }

  function storeData(mpath, d, e) {
    return new Promise(function(resolve, reject) {
      dev.logverbose('Will store data');
      var textd = parsedown.textify(d);
      if( e === "create") {
        fs.appendFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(parseData(textd));
        });
      }
      if( e === "update") {
        fs.writeFile( mpath, textd, function(err) {
        if (err) reject( err);
          resolve(parseData(textd));
        });
      }
    });
  }

  function readMetaFile(metaFile){
    var metaFileContent = fs.readFileSync( metaFile, 'utf8');
    var metaFileContentParsed = parseData( metaFileContent);
    return metaFileContentParsed;
  }

  function getUserPath() {
    return global.userDirname;
  }

  function findFirstFilenameNotTaken( fileName, currentPath, fileext) {
    // no fileext = search for folder
    fileext = typeof fileext !== 'undefined' ?  fileext : '';

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
    } catch( err) {
      dev.error('Error while finding unused filename in findFirstFilenameNotTaken : ' + err);
    }
    console.log( "- - this filename is not taken : " + newFileName);
    return newFileName;
  }

  function eventAndContent(sendEvent, objectJson) {
    var eventContentJSON =
    {
      "socketevent" : sendEvent,
      "content" : objectJson
    };
    return eventContentJSON;
  }

  function sendEventWithContent(sendEvent, objectContent, io, socket) {
    var eventAndContentJson = eventAndContent( sendEvent, objectContent);
    dev.logpackets("eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    if(socket === undefined)
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    else
      socket.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    dev.logpackets("packet sent");
  }

  // Décode les images en base64
  // http://stackoverflow.com/a/20272545
  function decodeBase64Image(dataString) {
    dev.logverbose("Decoding base 64 image");
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    return response;
  }

  function writeVideoToDisk(pathToFile, fileExtension, dataURL) {
    return new Promise(function(resolve, reject) {

      dataURL = dataURL.split(',').pop();
      dev.logverbose( 'Will save the video at path : ' + pathToFile + fileExtension);

      var fileBuffer = new Buffer(dataURL, 'base64');
        fs.writeFile( pathToFile + fileExtension, fileBuffer, function(err) {
          if (err) reject( err);
          resolve();
        });
    });
  }

  function createThumbnails(videoPath, videoFilename, pathToMediaFolder){
    return new Promise(function(resolve, reject) {
      var proc = ffmpeg( videoPath)
      // setup event handlers
      .on('end', function(files) {
        console.log('screenshot was saved');
        resolve();
      })
      .on('error', function(err) {
        console.log('an error happened: ' + err.message);
        reject();
      })
      // take 2 screenshots at predefined timemarks
      .takeScreenshots({ count: 1, timemarks: [ '00:00:00'], "filename" : videoFilename + ".png"}, pathToMediaFolder);
    });
  }

  function listAllTemplates() {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listAllTemplates");
      var templateFolderPath = path.join( getUserPath(), dodoc.publicationTemplateDirname);
      fs.readdir( templateFolderPath, function (err, filenames) {
        if (err) reject( dev.error('Couldn\'t read content dir : ' + err));
        var folders = filenames.filter(function(slugPubliName){
          // only get folders that don't start with "_"
          return new RegExp(dodoc.regexpMatchFolderNames, 'i').test(slugPubliName) && slugPubliName.substr(0,1) !== '_';
        });
        dev.log('Found ' + folders.length + ' templates in ' + templateFolderPath);
        resolve(folders);
      });
    });
  }

  return API;
})();

module.exports = dodocAPI;