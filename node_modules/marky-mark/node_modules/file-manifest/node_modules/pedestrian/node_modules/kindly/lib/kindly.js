var fs = require('fs'),
    async = require('async');

var getType = function(memo, path, stat) {
  if (stat.isFile()) {
    memo.files.push(path);
  } else if (stat.isDirectory()) {
    memo.directories.push(path);
  } else {
    memo.other.push(path);
  }
  return memo;
};

module.exports = {
  get: function(path, cb) {
    var obj = {
      files: [],
      directories: [],
      other: []
    };
    if (cb && typeof cb === 'function') {
      fs.readdir(path, function(err, files) {
        if (err) return cb(err);
        async.reduce(files, obj, function(memo, file, next) {
          var fullPath = path + '/' + file;
          fs.stat(fullPath, function(err, stat) {
            if (err) return next(err);  
            next(null, getType(memo, fullPath, stat));
          });
        }, cb);
      });
    } else {
      var descriptors = fs.readdirSync(path);
      return reduce(descriptors, function(memo, descriptor) {
        var fullPath = path + '/' + descriptor;
        return getType(memo, fullPath, fs.statSync(fullPath));
      }, obj);
    }
  }
};

function reduce(list, cb, memo) {
  list.forEach(function(item, index, arr) {
    memo = cb(memo, item, index, arr);
  });
  return memo;
}
