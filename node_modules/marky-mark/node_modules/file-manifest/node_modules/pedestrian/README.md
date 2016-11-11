[![Build Status](https://travis-ci.org/mantacode/pedestrian.png)](https://travis-ci.org/mantacode/pedestrian) [![downloads](http://img.shields.io/npm/dm/pedestrian.svg)](https://npmjs.org/package/pedestrian) [![npm](http://img.shields.io/npm/v/pedestrian.svg)](https://npmjs.org/package/pedestrian) [![Code Climate](https://codeclimate.com/github/mantacode/pedestrian/badges/gpa.svg)](https://codeclimate.com/github/mantacode/pedestrian) [![Test Coverage](https://codeclimate.com/github/mantacode/pedestrian/badges/coverage.svg)](https://codeclimate.com/github/mantacode/pedestrian) [![dependencies](https://david-dm.org/mantacode/pedestrian.png)](https://david-dm.org/mantacode/pedestrian)

[![NPM info](https://nodei.co/npm/pedestrian.png?downloads=true)](https://nodei.co/npm/pedestrian.png?downloads=true)

# Pedestrian

A recursive file walker for node.js

## Installation

`npm install pedestrian --save`

## Usage

`pedestrian` can be used either synchronously or asynchronously, depending on whether you pass it a callback.

### Sync

```javascript
var files = pedestrian.walk(path.resolve('lib'));
```

### Async

```javascript
pedestrian.walk(path.resolve('lib'), function(err, files) {

});
```

Both the sync and async versions will also work (as of v0.0.5) with relatives paths. The files that it gives back will still be absolute paths, however.

### Filtering

You can also filter out files by passing a globstar pattern or array of patterns (works with either sync and async).

```javascript
var files = pedestrian.walk(path.resolve('config'), '**/*.json');

pedestrian.walk(path.resolve('routes'), ['**/*.js', '!badFile.js'], function (err, files) {

});
```

See [minimatch](https://github.com/isaacs/minimatch) for more on the kinds of patterns you can use.
