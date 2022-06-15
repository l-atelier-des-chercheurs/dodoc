var gutil = require("gulp-util");
var path = require("path");

module.exports = dev = (function () {
  let isDebugMode = false;
  let isVerboseMode = false;
  let logToFile = false;

  const API = {
    init: (isDebug, isVerbose, logToFile) => {
      return initModule(isDebug, isVerbose, logToFile);
    },
    space: space,
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

  function space() {
    if (!logToFile && !isVerboseMode) return;

    if (logToFile) _sendToLogFile(``);
    if (isDebugMode) _sendToConsole(``);
  }

  function log() {
    const message = _createLogMessage({
      fct: log,
      args: arguments,
    });

    if (logToFile) _sendToLogFile(message);
    _sendToConsole(message);
  }
  function logverbose() {
    if (!logToFile && !isVerboseMode) return;

    const message =
      `- ` +
      _createLogMessage({
        fct: logverbose,
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

    if (logToFile) _sendToLogFile(log_string);
    if (isDebugMode) _sendToConsole(log_string, gutil.colors.green);
  }
  function logfunction() {
    if (!logToFile && !isDebugMode) return;

    const message =
      `~ ` +
      _createLogMessage({
        fct: logfunction,
        args: arguments,
      });

    if (logToFile) _sendToLogFile(message);
    if (isDebugMode) _sendToConsole(message, gutil.colors.magenta);
  }
  function error() {
    const message =
      `ERROR! ` +
      _createLogMessage({
        fct: error,
        args: arguments,
      });

    if (logToFile) _sendToLogFile(message);
    _sendToConsole(message, gutil.colors.red);
  }

  function performance() {
    var args = Array.prototype.slice.call(arguments);

    const fct_name = performance.caller.name;
    var logArgs = `~ ${fct_name} - `.concat(args);

    if (logToFile) _sendToLogFile(logArgs);
    _sendToConsole(logArgs, gutil.colors.yellow);
  }

  function _sendToLogFile(logArgs) {}
  function _sendToConsole(logArgs, color = gutil.colors.white) {
    gutil.log(color(logArgs));
  }

  function _customStringify(obj) {
    // JSON does not allow undefined values
    return JSON.stringify(obj, (key, value) =>
      value === undefined ? "__undefined__" : value
    );
  }

  function _createLogMessage({ fct, args }) {
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

    const fct_filename = _getFunctionFilename();
    const fct_name = fct.caller.name;

    let str = "";
    if (fct_filename) str += `${fct_filename} • `;
    if (fct_name) str += `${fct_name} – `;
    return str + content.join(" / ");
  }

  function _getFunctionFilename() {
    const err = new Error();
    Error.prepareStackTrace = (_, stack) => stack;

    const stack = err.stack;
    Error.prepareStackTrace = undefined;

    const filename = stack[3].getFileName();
    return path.parse(filename).name.toUpperCase();
  }
  return API;
})();
