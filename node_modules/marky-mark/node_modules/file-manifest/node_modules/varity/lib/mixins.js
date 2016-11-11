var _ = require('underscore'),
    stringify = require('./stringify');

module.exports = {
  capitalize: function(thing) {
    return thing.charAt(0).toUpperCase() + thing.slice(1).toLowerCase();
  },
  stringify: function(thing) {
    try {
      return thing.constructor.name;
    } catch (e) {
      // Even works for undefined and null
      return (/\[object (.+)\]/).exec(stringify.call(thing))[1];
    }
  },
  isDefined: function(thing) {
    return typeof thing !== 'undefined' && thing !== null;
  }
};
