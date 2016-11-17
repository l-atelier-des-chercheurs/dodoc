var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');
var moment = require('moment');
var parsedown = require('dodoc-parsedown');

var dodoc  = require('../public/dodoc');
var devLog = require('./dev-log.js');


var dodocAPI = module.exports = {

  getCurrentDate : function(f = dodoc.metaDateFormat) {
    return moment().format(f);
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

  readMetaFile: function(metaFile){
    var metaFileContent = fs.readFileSync( metaFile, 'utf8');
    var metaFileContentParsed = dodocAPI.parseData( metaFileContent);
    return metaFileContentParsed;
  },

  getUserPath: function() {
    return global.userDirname;
  },

  findFirstFilenameNotTaken: function( fileName, currentPath, fileext) {
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
  },

  eventAndContent: function(sendEvent, objectJson) {
    var eventContentJSON =
    {
      "socketevent" : sendEvent,
      "content" : objectJson
    };
    return eventContentJSON;
  },
  sendEventWithContent: function(sendEvent, objectContent, io, socket) {
    var eventAndContentJson = dodocAPI.eventAndContent( sendEvent, objectContent);
    dev.logpackets("eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    if(socket === undefined)
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    else
      socket.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    dev.logpackets("packet sent");
  },


  // Décode les images en base64
  // http://stackoverflow.com/a/20272545
  decodeBase64Image: function(dataString) {
    dev.logverbose("Decoding base 64 image");
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};
    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    return response;
  },

  writeVideoToDisk: function( pathToFile, fileExtension, dataURL) {
    return new Promise(function(resolve, reject) {

      dataURL = dataURL.split(',').pop();
      dev.logverbose( 'Will save the video at path : ' + pathToFile + fileExtension);

      var fileBuffer = new Buffer(dataURL, 'base64');
        fs.writeFile( pathToFile + fileExtension, fileBuffer, function(err) {
          if (err) reject( err);
          resolve();
        });
    });
  },

  createThumbnails: function( videoPath, videoFilename, pathToMediaFolder){
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
  },

};
