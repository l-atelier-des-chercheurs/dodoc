var fs = require('fs');
var path = require('path'); 
var yaml = require('js-yaml');
var marked = require('marked');	// markdown processor
var fm = require('file-manifest');
var content = require('./lib/content');
var extend = require('config-extend');
var async = require('async');

var getAbsolute = function(file) {
  // If the file is not absolute, resolve it from cwd
  return file.charAt(0) === '/' ? file : path.resolve(process.cwd(), file);
};

exports.marked = marked;

/**
 * parseDirectorySync - Parse all markdown files in the given directory
 *
 * @param {string} directory - directory to read files from
 * @param {object} options - parsing options
 */
exports.parseDirectorySync = function (directory, options) {
  return exports.parseMatchesSync(directory, '**/*.md', options);
};

/**
 * parseMatchesSync - Parse all markdown files in the given directory matching the given pattern(s)
 *
 * @param {string} directory - directory to read files from
 * @param {string|array} patterns - globstar patterns for filtering out files
 * @param {object} options - parsing options
 */
exports.parseMatchesSync = function(directory, patterns, options) {
  // Recursively collect all matching files
  return fm.generate(directory, { memo: [], patterns: patterns }, function(fmOpts, manifest, file) {
    var contents = fs.readFileSync(file.fullPath, 'utf8');
    manifest.push(exports.parse(contents, file.name, options));
    return manifest;
  });
};

/**
 * parseFileSync - Parse a single markdown file
 *
 * If file is relative, it will be resolved to an absolute path using the cwd
 *
 * @param {string} file - relative or absolute file path
 * @param {object} options - parsing options
 */
exports.parseFileSync = function(file, options) {
  file = getAbsolute(file);
  var filename = path.basename(file, '.md');
  // Pass encoding as string, which is compatible with node v0.8.x
  var contents = fs.readFileSync(file, 'utf8');
  return exports.parse(contents, filename, options);
};

/**
 * parseFilesSync - Parse multiple markdown files
 *
 * If any file is relative, it will be resolve to an absolute path using the cwd
 *
 * @param {array} files - list of relative or absolute file paths
 * @param {object} options - parsing options
 */
exports.parseFilesSync = function(files, options) {
  var results = [];
  files.forEach(function(file) {
    results.push(exports.parseFileSync(file, options));
  });
  return results;
};

/**
 * parse - The main logic. Converts a string of markdown (optionally with yml front-matter) into an object with html and other properties
 *
 * @param {string} md - A string of markdown
 * @param {string} filename - The (optional) filename for the returned context object
 * @param {object} options - parsing options
 *
 * Options
 *   preCompile: a function to call with de-ymled markdown. Accepts (and returns) a markdown string.
 *   postCompile: a function to call with processed html. Accepts (and returns) an html string.
 *   context: an object of additional context properties (extends the front-matter, if any).
 *   marked: options to pass directly to the marked module.
 */
exports.parse = function(md, filename, options) {
  if (typeof filename === 'object') {
    options = filename;
    filename = null;
  }

  options = options || {};

  // Generate frontMatter and actual markdown content
  var lines = md.split('\n');
  var frontMatter = content.getFrontMatter(lines);
  var newContent = lines.join('\n');

  if (options.preCompile) {
    newContent = options.preCompile(newContent) || newContent;
  }

  var html = marked(newContent, options.marked || {});

  if (options.postCompile) {
    html = options.postCompile(html) || html;
  }

  var matter = frontMatter ? yaml.load(frontMatter) : {};

  // Construct and return a context object
  var context = { 
    filenameExtension: '.md',
    yaml: frontMatter.trim(),
    markdown: newContent.trim(),
    content: html.trim(),
    meta: matter
  };

  if (filename) {
    context.filename = filename;
  }

  extend(context.meta, options.context || {});
  return context;
};

/**
 * parseDirectory - Parse all markdown files in the given directory asynchronously
 *
 * @param {string} directory - directory to read files from
 * @param {object} options - parsing options
 * @param {function} cb - callback
 */
exports.parseDirectory = function(directory, options, cb) {
  exports.parseMatches(directory, '**/*.md', options, cb);
};

/**
 * parseMatches - Parse all markdown files in the given directory matching the given pattern(s) asynchronously
 *
 * @param {string} directory - directory to read files from
 * @param {string|array} patterns - globstar patterns for filtering out files
 * @param {object} options - parsing options
 * @param {funciton} cb - callback
 */
exports.parseMatches = function(directory, patterns, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  // Recursively collect all matching files
  fm.generate(directory, { memo: [], patterns: patterns }, function(fmOpts, manifest, file, next) {
    // Pass encoding as string, which is compatible with node v0.8.x
    fs.readFile(file.fullPath, 'utf8', function(err, contents) {
      manifest.push(exports.parse(contents, file.name, options));
      next(null, manifest);
    });
  }, cb);
};

/**
 * parseFile - Parse a single markdown file asynchronously
 *
 * If file is relative, it will be resolved to an absolute path using the cwd
 *
 * @param {string} file - relative or absolute file path
 * @param {object} options - parsing options
 * @param {function} cb - callback
 */
exports.parseFile = function(file, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  file = getAbsolute(file);
  var filename = path.basename(file, '.md');
  fs.readFile(file, 'utf8', function(err, contents) {
    if (err) {
      cb(err);
    } else {
      cb(null, exports.parse(contents, filename, options));
    }
  });
};

/**
 * parseFilesSync - Parse multiple markdown files
 *
 * If any file is relative, it will be resolve to an absolute path using the cwd
 *
 * @param {array} files - list of relative or absolute file paths
 * @param {object} options - parsing options
 * @param {function} cb - callback
 */
exports.parseFiles = function(files, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  async.map(files, function(file, next) {
    exports.parseFile(file, options, next);
  }, cb);
};

// TODO: there should be options for file encoding
// TODO: there should be a sting parsing option itself. Maybe people want to read markdown stuff from other sources (database, github, etc)
