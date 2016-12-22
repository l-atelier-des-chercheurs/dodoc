var gutil = require('gulp-util');

var dev = (function() {
  let isDebugMode = 'false';
  let isVerboseMode = 'false';

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
    var logString = gutil.colors.white(args);
    _sendToLog(logString);
  }
  function logverbose() {
    if(!(isDebugMode && isVerboseMode))
      return;
    var args = Array.prototype.slice.call(arguments);
    var logString = gutil.colors.gray('- '.concat(args));
    _sendToLog(logString);
  }
  function logpackets() {
    if(!isDebugMode)
      return;
    var args = Array.prototype.slice.call(arguments);
    var logString = gutil.colors.green('* '.concat(args));
    _sendToLog(logString);
  }
  function logfunction() {
    if(!isDebugMode)
      return;
    var args = Array.prototype.slice.call(arguments);
    var logString = gutil.colors.magenta('~ '.concat(args));
    _sendToLog(logString);
  }
  function error() {
    var logString = gutil.colors.red('ERROR! '.concat(args));
    _sendToLog(logString);
  }

  function _sendToLog(logString) {
    gutil.log(logString);
  }

  return API;
})();

module.exports = dev;