var gutil = require('gulp-util');

function devLog( d, v) {
  const isDebugMode = d;
  const isVerbose = v;

  const API = {
    init        : function() { return initModule() },
    log         : function(term) { if( isDebugMode) console.log(gutil.colors.blue('- ' + term)); },
    logverbose  : function(term) { if( isDebugMode && isVerbose) console.log(gutil.colors.gray('- ' + term)); },
    logpackets  : function(term) { if( isDebugMode) console.log(gutil.colors.green('- ' + term)); },
    logfunction : function(term) { if( isDebugMode) console.info(gutil.colors.magenta('~ ' + term)); }
  };

  function initModule() {
    if(isDebugMode) {
      console.log('Debug mode is Enabled');
      console.log('---');
      dev.log('all functions are prepended with ~ ');
      dev.logpackets('(dev mode) green for sent packets');
      if(isVerbose) {
        dev.logverbose('(dev and verbose) gray for regular parsing data');
      }
    }
    return;
  }
  return API;
}

module.exports = devLog;

