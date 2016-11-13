var dodoc  = require('../public/dodoc');
var devLog = require('./dev-log.js');
var moment = require('moment');
var path = require('path');
var fs = require('fs-extra');
var parsedown = require('dodoc-parsedown');


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

};
