var pedestrian = require('pedestrian');
var $ = require('varity');
var async = require('async');
var path = require('path');
var _ = require('lodash');
var fs = require('fs');
var callerId = require('caller-id');

_.mixin(require('underscore.string'));

exports.generate = function() {
  var args = [].slice.call(arguments);
  if (args[0].charAt(0) !== '/') {
    var caller = callerId.getData();
    args[0] = path.resolve(path.dirname(caller.filePath), args[0]);
  }
  return exports.__generate.apply(null, args);
};

exports.__generate = $('s+oa|s-ff', function(dir, options, patterns, reducer, callback) {
  options.patterns = options.patterns || patterns || '';
  options.patterns = _.isArray(options.patterns) || _.isEmpty(options.patterns) ? options.patterns : [options.patterns];
  options.dir = dir;
  options.memo = options.memo || {};
  options.reducer = options.reducer || (exports.isAsync(callback) ? reducer : callback) || exports.reduce;
  options.require = typeof options.require === 'function' ? options.require : exports[options.require || 'require'];
  options.namer = options.namer || 'camelCase';
  return exports.run(options, callback);
});

exports.run = function(options, cb) {
  if (cb && options.reducer !== cb) {
    exports.collect(options, function(err, files) {
      async.reduce(files, options.memo, function(memo, file, next) {
        options.reducer(options, memo, exports.buildFileObj(options, file), next);
      }, cb);
    });
  } else {
    return _.reduce(exports.collect(options), function(memo, file) {
      return options.reducer(options, memo, exports.buildFileObj(options, file));
    }, options.memo);
  }
};

exports.buildFileObj = function(options, file) {
  var basename = path.basename(file);
  var ext = path.extname(file);
  return {
    relativePath: file.replace(options.dir + '/', ''),
    relativeName: file.replace(options.dir + '/', '').replace(ext, ''),
    fullPath: file,
    basename: basename,
    name: basename.replace(ext, ''),
    ext: ext
  };
};

exports.isAsync = function(fn) {
  try {
    return (/function\s*\(err/).test(fn.toString());
  } catch (e) {
    return false;
  }
};

exports.collect = function(options, cb) {
  if (cb) {
    pedestrian.walk(options.dir, options.patterns, cb);
  } else {
    return pedestrian.walk(options.dir, options.patterns);
  }
};

exports.reduce = function(options, manifest, file, cb) {
  var namer = typeof options.namer === 'function' ? options.namer : exports.namer;
  var key = namer(options, file);
  if (typeof cb === 'function') {
    options.require(options, file, function(err, value) {
      manifest[key] = value;
      cb(null, manifest);
    });
  } else {
    manifest[key] = options.require(options, file);
    return manifest;
  }
};

exports.require = function(options, file, cb) {
  if (cb) {
    cb(null, require(file.fullPath));
  } else {
    return require(file.fullPath);
  }
};

exports.readFile = function(options, file, cb) {
  if (cb) {
    fs.readFile(file.fullPath, 'utf8', cb);
  } else {
    return fs.readFileSync(file.fullPath, 'utf8');
  }
};

exports.namer = function(options, file) {
  var fileParts = file.relativeName.split(/\W/g);
  return exports[options.namer](fileParts, options);
};

exports.camelCase = function(items, options) {
  return items.map(function(item, index) {
    return index ? _.capitalize(item) : item;
  }).join('');
};

exports.dash = function(items, options) {
  return items.join('-').toLowerCase();
};

exports.slash = function(items, options) {
  return items.join('/');
};

exports.pipe = function(items, options) {
  return items.join('|');
};

exports['class'] = function(items, options) {
  return items.map(_.capitalize).join('');
};

exports.lower = function(items, options) {
  return items.join('').toLowerCase();
};

exports.upper = function(items, options) {
  return items.join('').toUpperCase();
};

exports.underscore = exports.snake = function(items, options) {
  return items.join('_').toLowerCase();
};

exports.human = function(items, options) {
  var str = items.join(' ').toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};
