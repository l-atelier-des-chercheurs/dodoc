var gutil = require("gulp-util");

module.exports = dev = (function () {
  let isDebugMode = false;
  let isVerboseMode = false;
  let logToFile = false;

  const API = {
    init: (isDebug, isVerbose, logToFile) => {
      return initModule(isDebug, isVerbose, logToFile);
    },
    log: log,
    logverbose: logverbose,
    logpackets: logpackets,
    logfunction: logfunction,
    error: error,
    performance: performance,
    isDebug: () => isDebugMode,
  };

  function initModule(d, v, l) {
    isDebugMode = d;
    isVerboseMode = v;
    logToFile = l;
    console.log(`Init module with debug = ${d} and verbose = ${v}`);

    if (isDebugMode) {
      console.log("Debug mode is enabled");
      console.log("---");
      dev.logfunction("(log) magenta is for functions");
      dev.logpackets({ str: "(log) green is for packets" });
      if (isVerboseMode) {
        dev.logverbose("(dev and verbose) gray for regular parsing data");
      }
    }
    if (logToFile) {
      console.log("Logging to file");
    } else {
      console.log("Not logging to a file");
    }
    return;
  }

  function log() {
    var args = Array.prototype.slice.call(arguments);
    var logArgs = args;
    _sendToLogFile(logArgs);
    _sendToConsole(logArgs, gutil.colors.white);
  }
  function logverbose() {
    if (!logToFile && !isVerboseMode) return;

    const message =
      `- ` +
      _createLogMessage({
        fct_name: logverbose.caller.name,
        args: arguments,
      });

    if (logToFile) _sendToLogFile(message);
    if (isDebugMode) _sendToConsole(message, gutil.colors.gray);
  }
  function logpackets({ str, obj }) {
    if (!logToFile && !isDebugMode) return;
    // green
    let log_string = "* ";

    if (str) log_string += str;
    if (obj) log_string += JSON.stringify(obj);

    if (logToFile) {
      _sendToLogFile(log_string);
    }
    if (isDebugMode) {
      _sendToConsole(log_string, gutil.colors.green);
    }
  }
  function logfunction() {
    if (!logToFile && !isDebugMode) return;

    const message =
      `~ ` +
      _createLogMessage({
        fct_name: logfunction.caller.name,
        args: arguments,
      });

    if (logToFile) _sendToLogFile(message);
    if (isDebugMode) _sendToConsole(message, gutil.colors.magenta);
  }
  function error() {
    // red
    var args = Array.prototype.slice.call(arguments);
    var logArgs = "ERROR! ".concat(args);

    _sendToLogFile(logArgs);
    _sendToConsole(logArgs, gutil.colors.red);
  }

  function performance() {
    var args = Array.prototype.slice.call(arguments);

    const fct_name = performance.caller.name;
    var logArgs = `~ ${fct_name} - `.concat(args);

    _sendToLogFile(logArgs);
    _sendToConsole(logArgs, gutil.colors.yellow);
  }

  function _sendToLogFile(logArgs) {}
  function _sendToConsole(logArgs, color = gutil.colors.white) {
    gutil.log(color(logArgs));
  }

  function _customStringify(obj) {
    return JSON.stringify(obj);
  }

  function _createLogMessage({ fct_name, args }) {
    let content = [];

    if (typeof args === "string") {
      content.push(args);
    } else if (typeof args === "object") {
      args = Array.prototype.slice.call(args);
      args.map((arg) => {
        if (typeof arg === "string") content.push(arg);
        else if (Array.isArray(arg)) content.push(arg.join(", "));
        else if (typeof arg === "object") content.push(_customStringify(arg));
      });
    }
    return `${fct_name} – ${content.join(" / ")}`;
  }

  return API;
})();
