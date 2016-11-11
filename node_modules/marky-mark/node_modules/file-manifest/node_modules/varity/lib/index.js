var Varity = require('./varity'),
    _ = require('underscore');

_.mixin(require('./mixins'));

var wrap = function() {
  var v = new Varity();
  return v.wrap.apply(v, arguments);
};

wrap.configure = function(opts) {
  Varity.configure(opts);
};

wrap.reset = function() {
  Varity.reset();
};

wrap.letters = function(letter, name) {
  Varity.extend('letters.' + letter, name);
};

wrap.symbols = function(symbol, fn) {
  Varity.extend('symbols.' + symbol, fn);
};

wrap.defaults = function(type, value) {
  Varity.extend('defaults.' + type, value);
};

wrap.populate = function(type, value) {
  if (typeof type === 'boolean') {
    Varity._instanceOptions.populate = type;
  } else {
    Varity._instanceOptions.populate = (Varity._instanceOptions.populate || []).concat(type);
    if (value) {
      wrap.defaults(type, value);
    }
  }
};

wrap.extend = function(type, value) {
  Varity.extend('extend.' + type, value);
};

module.exports = wrap;
