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
      dev.log('all functions are prepended with ~ ');
      dev.logpackets('(dev mode) green for sent packets');
      if(isVerboseMode) {
        dev.logverbose('(dev and verbose) gray for regular parsing data');
      }
    }
    return;
  }

  function log(term) {
    if(isDebugMode)
      console.log(gutil.colors.blue('- ' + term));
  }
  function logverbose(term) {
    if(isDebugMode && isVerboseMode)
      console.log(gutil.colors.gray('- ' + term));
  }
  function logpackets(term) {
    if(isDebugMode)
      console.log(gutil.colors.green('- ' + term));
  }
  function logfunction(term) {
    if(isDebugMode)
      console.info(gutil.colors.magenta('~ ' + term));
  }
  function error(term) {
    console.error(gutil.colors.red('ERROR! ' + term));
  }

  return API;
})();

module.exports = dev;