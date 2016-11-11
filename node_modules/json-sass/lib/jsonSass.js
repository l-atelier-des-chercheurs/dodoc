"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var through = _interopRequire(require("through2"));

var jsToSassString = _interopRequire(require("./jsToSassString"));

var assign = _interopRequire(require("object-assign"));

var DEFAULTS = {
  prefix: "",
  suffix: ";" };

function jsonSass(options) {
  var options = assign({}, DEFAULTS, options);

  return through(function (chunk, enc, callback) {
    var jsValue = JSON.parse(chunk);
    var sassString = jsToSassString(jsValue);
    sassString = options.prefix + sassString + options.suffix;
    this.push(sassString);
    callback();
  });
}

module.exports = jsonSass;
exports["default"] = jsonSass;
exports.convertJs = jsToSassString;
Object.defineProperty(exports, "__esModule", {
  value: true
});
