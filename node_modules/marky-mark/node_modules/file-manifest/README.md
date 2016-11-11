[![Build Status](https://travis-ci.org/mantacode/file-manifest.png)](https://travis-ci.org/mantacode/file-manifest) [![downloads](http://img.shields.io/npm/dm/file-manifest.svg)](https://npmjs.org/package/file-manifest) [![npm](http://img.shields.io/npm/v/file-manifest.svg)](https://npmjs.org/package/file-manifest) [![Code Climate](https://codeclimate.com/github/mantacode/file-manifest/badges/gpa.svg)](https://codeclimate.com/github/mantacode/file-manifest) [![Test Coverage](https://codeclimate.com/github/mantacode/file-manifest/badges/coverage.svg)](https://codeclimate.com/github/mantacode/file-manifest) [![dependencies](https://david-dm.org/mantacode/file-manifest.png)](https://david-dm.org/mantacode/file-manifest)

[![NPM info](https://nodei.co/npm/file-manifest.png?downloads=true)](https://nodei.co/npm/file-manifest.png?downloads=true)

# File-Manifest

Require all the files in a directory into a single object

## Installation

`npm install file-manifest --save`

## Usage

File-manifest recursively requires everything in a given directory (optionally filtered with globstar patterns) and packages it into a single object where the keys are (by default) camel-cased file names. Thus if you had a directory called `foo`, whose structure looked like this:

```
bar
baz
  quux
  some-long-name
```

You'd end up with an object that looked like this:

```javascript
{
  fooBar: // foo/bar's exports
  fooBazQuux: //foo/baz/quux's exports
  fooBazSomeLongName: // foo/baz/some-long-name's exports
}
```

This is useful (for example) in an express app to create a route manifest:

```javascript
var routes = require('file-manifest').generate('routes');

app.get('/', routes.home);
app.get('/users/:id', routes.profile);
// etc.
```

or a middleware manifest:

```javascript
var middleware = require('file-manifest').generate('middleware');

app.use(middleware.setOriginPolicy);
app.use(middleware.defaultLogger);
// etc.
```

or in a mongoose app to load all models:

```javascript
var models = require('file-manifest').generate('models');
module.exports = function(req, res, next) {
  req.models = models;
  next();
};
```

### Sync

As demonstrated above, just call `.generate` with a relative or absolute path.

```javascript
var manifest = require('file-manifest').generate('some/dir');
```

### Async

Just like sync, but accepts a callback. It is important that the first argument to this function start with `err` (more on this below).

```javascript
require('file-manifest').generate('some/dir', function(err, manifest) {
  // . . .
});
```

### With Patterns

Both sync and async versions accept a string pattern or list of string patterns to filter (see [minimatch](https://github.com/isaacs/minimatch) for more on globstar patterns).

```javascript
var manifest = require('file-manifest').generate('config', '**/*.json');

// or

require('file-manifest').generate('config', ['**/*.json', '**/*.yml'], function(err, manifest) {
  // . . .
});
```

### With a Custom Reduce

File-manifest also gives you the option to provide a custom reduce function. This let's you alter the behavior of `file-manifest` if simply requiring the files is insufficient (or you don't like camel-cased key names). This reduce function (as of v1.0.0) has the following signature - `(options, manifest, fileObj, [callback])` - where `options` is an object in the form:

```javascript
patterns: Array or String // Any matching patterns provided (or empty string if none)
dir: String // The directory to search
memo: Any // The starting value for the reduce function (defaults to {})
reducer: String or Function // The reduce function to call
require: String or Function // The function to get the current file (defaults to the build in require function)
namer: String or Function // The function to name the keys in the manifest
```

`manifest` is the results of the reduce process so far (often called "memo" for reasons that aren't really clear to me), `fileObj` is an object of file parts in the form:

```javascript
relativePath: String // The path of the file minus the original path (e.g. "foo/bar.js")
relativeName: String // Like relativePath but without the extension. This is the part used for naming the keys (e.g. "foo/bar")
fullPath: String // The full path of the file (e.g. "/dir/foo/bar.js")
basename: String // The result of path.basename(fullPath) (e.g. "bar.js")
name: String // Like basename but without the extension (e.g. "bar")
ext: String // The file extension (e.g. ".js")
```

The callback will, of course, only be available in async implementations. You should manipulate the manifest and then return it (sync) or call the callback with an optional error and the new manifest (async).

```javascript
var manifest = require('file-manifest').generate('keywords', function(options, manifest, file) {
  var name = file.relativeName.split('/').join('|');
  manifest[name] = require(file.fullPath);
  return manifest;
});
```

The sync implemenation uses `_.reduce` ([underscore](http://underscorejs.org/)), while the async version uses `async.reduce` ([async](https://github.com/caolan/async)), so see those for more information.

You might have noted that the same `generate` function can take a reduce function, a callback, or both. The way `file-manifest` distinguishes is by examining the last function to see if it's first parameter begins with `err`. That's why all async implementations should pass a callback that accepts a variable named `err` or `error`.

If you are still using `file-manifest@<1.x`, the custom reduce function should accept only `manifest`, `file`, and (optionally) `callback`. The `file` is the absolute file path. The context of the function (i.e. `this`) does have properties called `dir`, which is the originally passed in path, and patterns, which is the original patterns. This just means you need to do some of the manipulation yourself. For example, the above function would be:

```javascript
var manifest = require('file-manifest').generate('keywords', function(manifest, file) {
  var name = file.replace(this.dir + '/', '').replace(path.extname(file), '').split('/').join('|');
  manifest[name] = require(file);
  return manifest;
});
```

### With options

As of `file-manifest@1.0.0`, you can also pass an `options` object to file-manifest. The options object can have any of the following keys:

#### Patterns and Reducer

Same as the parameter counterparts above.

These can be passed as part of the object OR as separate parameters. If you're passing an options object, you should just add them to that. The separate parameters were only included to preserve (the appearance of) backward compatibility (v1.0.0 is not _really_ backward compatible, but it takes a lot less to convert an old implementation with these parameters preserved).

#### Memo

`memo` is the starting value for the reduce function. The default is `{}`, but it is sometimes useful to use `[]` or even something more complicated. Note, however, that the default reduce function expects an object, so if you want to do something different, you should supply a custom reducer. E.g.

```javascript
var manifest = require('file-manifest').generate('client/app/js', { memo: [], patterns: ['**/*.js'], reducer: function(options, manifest, file) {
  manifest.push(file.name);
  return manifest;
}});
```

#### Require and Namer

If you only want custom functionality for the way keys are generated or the way the file is read, you can also pass either (or both) of `namer` and `require`. The `namer` function should accept the options object and the same file object that `reduce` accepts and should return the key name. The `require` function should accept `options`, `fileObj`, and optionally `callback` and should return the corresponding value for the key (usually the exports or file contents) for sync implementations or call the callback with an optional error and the value for async implementations.

```javascript
var manifest = require('file-manifest').generate('partials', { namer: function(options, file) { return file.relativeName.split('/').join('-'); }, require: function(options, file, cb) {
  fs.readFile(file.fullPath, 'utf8', cb);
}});
```

Alternatively, since there are some common patterns, `namer` can be a string - one of `camelCase` (the default), `dash`, `slash`, `pipe`, `class`, `lower`, `upper`, `underscore` or `snake`, or `human`. The results for the file "foo/bar.js" for each would be:

```
camelCase: "fooBar",
dash: "foo-bar",
slash: "foo/bar",
pipe: "foo|bar",
class: "FooBar",
lower: "foobar",
upper: "FOOBAR",
underscore: "foo_bar",
snake: "foo_bar",
human: "Foo bar"
```

Similarly, the `require` option can be a string with either `require` or `readFile`. `require` will use node's `require` function (this is the default, so there's not much point in specifying this). `readFile` will use `readFileSync` (for sync implementations) or `readFile` (for async implementations).

So the previous call to `file-manifest` could be replaced with

```javascript
var manifest = require('file-manifest').generate('partials', { namer: 'dash', require: 'readFile' });
```
<br><br><br>
*Note: This _probably_ goes without saying, but "an optional error" (throughout) means that it may be `null` or `undefined`, not that it may be omitted.
