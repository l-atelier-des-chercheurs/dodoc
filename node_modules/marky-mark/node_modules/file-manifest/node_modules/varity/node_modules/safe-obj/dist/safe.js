;(function(root) {

  var isObject = function isObject(obj) {
    // Implementation lifted from underscore
    return typeof obj === 'function' || typeof obj === 'object' && !!obj;
  };

  var isArray = function isArray(arr) {
    return Array.isArray ? Array.isArray(arr) : arr instanceof Array || (arr && arr.constructor && arr.constructor.name === 'Array');
  };

  var any = function any(list, func) {
    var i;
    var l = list.length;
    for (i = 0; i < l; i++) {
      if (func(list[i])) {
        return true;
      }
    }
    return false;
  };

  var every = function every(list, func) {
    var i;
    var l = list.length;
    for (i = 0; i < l; i++) {
      if (!func(list[i])) {
        return false;
      }
    }
    return true;
  };

  var isEqual = function isEqual(a, b) {
    if (a === b) {
      return true;
    }

    if (a.constructor !== b.constructor) {
      return false;
    }

    if (typeof a === 'object') {
      if (a instanceof Array) {
        if (a.length !== b.length) {
          return false;
        }
        var i;
        var l = a.length;
        for (i = 0; i < l; i++) {
          if (!isEqual(a[i], b[i])) {
            return false;
          }
        }
        return true;
      } else {
        for (var k in a) {
          if (!(k in b) || !isEqual(a[k], b[k])) {
            return false;
          }
        }
        return true;

      }
    } else {
      return false;
    }
  };

  var anyOrAll = function anyOrAll(method, _args) {
    var paths = [], obj = {};

    // args is of type Arguments
    var args = [].slice.call(_args);

    // Allow array or list of strings
    if (isArray(args[1])) {
      obj = args[0];
      paths = args[1];
    } else {
      paths = args;
      obj = paths.shift();
    }

    if (isObject(obj)) {
      return method(paths, function(path) {
        return _safe.safe(obj, path);
      });
    } else {
      return false;
    }
  };

  var _safe = {
    safe: function (obj, path, otherwise) {
      if (!path) {
        return otherwise;
      }
      obj = isObject(obj) ? obj : {};
      var props = path.split('.');
      if (props.length === 1) {
        if (typeof obj[props[0]] === 'undefined') {
          return otherwise;
        } else if (obj[props[0]] === null) {
          return typeof otherwise === 'undefined' ? null : otherwise;
        } else {
          return obj[props.shift()];
        }
      } else {
        var prop = props.shift();
        return isObject(obj[prop]) ? _safe.safe(obj[prop], props.join('.'), otherwise) : otherwise;
      }
    },

    expand: function (obj, path, thing) {
      if (!path || typeof thing === 'undefined') {
        return;
      }
      obj = isObject(obj) && obj !== null ? obj : {};
      var props = path.split('.');
      if (props.length === 1) {
        obj[props.shift()] = thing;
      } else {
        var prop = props.shift();
        if (!(prop in obj)) {
          obj[prop] = {};
        }
        _safe.expand(obj[prop], props.join('.'), thing);
      }
    },

    ensure: function (obj, path, disallowed, otherwise) {
      if (arguments.length === 3) {
        otherwise = disallowed;
        disallowed = [];
      }
      var current = _safe.safe(obj, path);
      if  (typeof current === 'undefined' || current === null || any(disallowed, function(item) { return isEqual(current, item); })) {
        _safe.expand(obj, path, otherwise);
      }
    },

    allOf: function() {
      return anyOrAll.apply(null, [every].concat(arguments));
    },

    anyOf: function() {
      return anyOrAll.apply(null, [any].concat(arguments));
    },

    noneOf: function() {
      return !_safe.anyOf.apply(null, arguments);
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = _safe;
    }
    exports._safe = _safe;
  }
  
  root._ = root._ || {};
  root._._safe = _safe;
})(this);
