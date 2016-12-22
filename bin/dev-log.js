var gutil = require('gulp-util');
var logger = require('electron-log');

var dev = (function() {
  let isDebugMode = 'false';
  let isVerboseMode = 'false';

  logger.transports.console = false;

  const API = {
    init        : (isDebug, isVerbose)   => { return initModule(isDebug, isVerbose) },
    log         : log,
    logverbose  : logverbose,
    logpackets  : logpackets,
    logfunction : logfunction,
    error       : error,
    isDebug     : ()   => { return isDebugMode; },
  };

  function initModule(d, v) {
    isDebugMode = d;
    isVerboseMode = v
    if(isDebugMode) {
      console.log('Debug mode is Enabled');
      console.log('---');
      dev.logfunction('(log) magenta is for functions');
      dev.logpackets('(log) green is for packets');
      dev.logpackets('(log) green is for packets');
      if(isVerboseMode) {
        dev.logverbose('(dev and verbose) gray for regular parsing data');
      }
    }
    return;
  }

  function log() {
    var args = Array.prototype.slice.call(arguments);
    var logString = args;
    _sendToLog(logString, gutil.colors.white);
  }
  function logverbose() { // gray
    if(!(isDebugMode && isVerboseMode))
      return;
    var args = Array.prototype.slice.call(arguments);
    var logString = '- '.concat(args);
    _sendToLog(logString, gutil.colors.gray);
  }
  function logpackets() { // green
    if(!isDebugMode)
      return;
    var args = Array.prototype.slice.call(arguments);
    var logString = '* '.concat(args);
    _sendToLog(logString, gutil.colors.green);
  }
  function logfunction() { // magenta
    if(!isDebugMode)
      return;
    var args = Array.prototype.slice.call(arguments);
    var logString = '~ '.concat(args);
    _sendToLog(logString, gutil.colors.magenta);
  }
  function error() { // red
    var logString = 'ERROR! '.concat(args);
    _sendToLog(logString, gutil.colors.red);
  }

  function _sendToLog(logString, color = gutil.colors.white) {
    gutil.log(color(logString));
    logger.info(logString.toString());
  }

  return API;
})();

module.exports = dev;