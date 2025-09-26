const path = require("path"),
  chalk = require("chalk").default,
  journal = require("./journal");

module.exports = dev = (function () {
  let isDebugMode = false;
  let isVerboseMode = false;
  let isLivereload = false;

  const API = {
    init: ({ debug, verbose, livereload }) => {
      return initModule({ debug, verbose, livereload });
    },
    space: space,
    log: log,
    logverbose: logverbose,
    logpackets: logpackets,
    logsockets: logsockets,
    logrooms: logrooms,
    logapi: logapi,
    logfunction: logfunction,
    error: error,
    performance: performance,
    isDebug: () => isDebugMode,
    isLivereload: () => isLivereload,
  };

  function initModule({ debug, verbose, livereload }) {
    isDebugMode = debug;
    isVerboseMode = verbose;
    isLivereload = livereload;
    console.log(
      `Init module with debug = ${debug} verbose = ${verbose} livereload = ${isLivereload}`
    );

    if (isDebugMode) {
      console.log("Debug mode is enabled");
      console.log("---");
      dev.logfunction("logfunction");
      dev.logapi("logapi");
      dev.logpackets("logpackets");
      dev.logsockets("logsockets");
      dev.logrooms("logsockets");
      if (isVerboseMode) {
        dev.logverbose("(dev and verbose) gray for regular parsing data");
      }
    }
    return;
  }

  function space() {
    if (!isVerboseMode) return;

    _sendToConsole(``);
  }

  function log() {
    const message = _createLogMessage({
      fct: log,
      args: arguments,
    });

    _sendToConsole(message);
  }
  function logverbose() {
    if (!isVerboseMode) return;

    const message =
      `- ` +
      _createLogMessage({
        fct: logverbose,
        args: arguments,
      });

    if (isDebugMode) _sendToConsole(message, chalk.gray);
  }
  function logpackets() {
    if (!isVerboseMode) return;

    const message =
      `* ` +
      _createLogMessage({
        fct: logpackets,
        args: arguments,
      });

    if (isDebugMode) _sendToConsole(message, chalk.green);
  }
  function logsockets() {
    if (!isVerboseMode) return;

    const message =
      `→ ` +
      _createLogMessage({
        fct: logsockets,
        args: arguments,
      });

    if (isDebugMode) _sendToConsole(message, chalk.cyan);
  }
  function logrooms() {
    if (!isVerboseMode) return;

    const message =
      `¶ ` +
      _createLogMessage({
        fct: logsockets,
        args: arguments,
      });

    if (isDebugMode) _sendToConsole(message, chalk.yellow);
  }
  function logfunction() {
    if (!isDebugMode) return;

    const message =
      `~ ` +
      _createLogMessage({
        fct: logfunction,
        args: arguments,
      });

    if (isDebugMode) _sendToConsole(message, chalk.magenta);
  }
  function logapi() {
    const message =
      `↓ ` +
      _createLogMessage({
        fct: logapi,
        args: arguments,
      });

    _sendToConsole(message, chalk.blue);
  }
  function error() {
    const message =
      `! ` +
      _createLogMessage({
        fct: logfunction,
        args: arguments,
      });

    journal.log({ message, from: "dev-log", event: "error" });
    console.error(chalk.red(message));
  }

  function performance() {
    var args = Array.prototype.slice.call(arguments);

    const fct_name = performance.caller.name;
    var message = `~ ${fct_name} - `.concat(args);

    _sendToConsole(message, chalk.yellow);
  }

  function _sendToConsole(message, color = chalk.white) {
    console.log(color(message));
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
        let str = "";
        if (typeof arg === "string" || typeof arg === "number") str = arg;
        else if (Array.isArray(arg)) str = arg.join(", ");
        else if (typeof arg === "object") str = _customStringify(arg);
        if (str.length > 350) {
          str = str.slice(0, 350);
          str += "[…]";
        }
        content.push(str);
      });
    }

    const fct_filename = _getFunctionFilename();
    const fct_name = fct.caller?.name;

    let str = "";
    if (fct_filename) {
      if (process.platform === "win32") str += `${fct_filename} . `;
      else str += `${fct_filename} • `;
    }
    if (fct_name)
      if (process.platform === "win32") str += `${fct_name} : `;
      else str += `${fct_name} – `;

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
