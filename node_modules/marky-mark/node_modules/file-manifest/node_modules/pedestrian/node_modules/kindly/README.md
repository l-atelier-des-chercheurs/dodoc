[![Build Status](https://travis-ci.org/mantacode/kindly.png)](https://travis-ci.org/mantacode/kindly) [![downloads](http://img.shields.io/npm/dm/kindly.svg)](https://npmjs.org/package/kindly) [![npm](http://img.shields.io/npm/v/kindly.svg)](https://npmjs.org/package/kindly) [![Code Climate](https://codeclimate.com/github/mantacode/kindly/badges/gpa.svg)](https://codeclimate.com/github/mantacode/kindly) [![Test Coverage](https://codeclimate.com/github/mantacode/kindly/badges/coverage.svg)](https://codeclimate.com/github/mantacode/kindly) [![dependencies](https://david-dm.org/mantacode/kindly.png)](https://david-dm.org/mantacode/kindly)

[![NPM info](https://nodei.co/npm/kindly.png?downloads=true)](https://nodei.co/npm/kindly.png?downloads=true)

# Kindly

### Purpose

Kindly is a (very) thin wrapper around fs.readdir that groups files by type. That seems like a small thing, but it's really useful for requiring all the files in a single directory.

### Installation

`npm install kindly --save`

`var kindly = require('kindly');`

### API

Kindly has only one method, `get`, which works synchronously or asynchronously depending on whether you give it a callback.

Synchronously:

```javascript
var descriptors = kindly.get('/dir');
```

Asynchronously:

```javascript
kindly.get('/dir', function(err, descriptors) {

});
```

In either case, descriptors will be an object in this form:

```javascript
{
  files: [],
  directories: [],
  other: []
}
```

All file and directory names are prefaced with the path you pass to kindly. Thus, if you use something like

```javascript
var kindly = require('kindly');
var path = require('path');

kindly.get(path.resolve('lib'), function(err, descriptors) {

});
```

all of your descriptors will be fully qualified paths which can be used from any directory.

That's it folks!
<br><br><br><br><br><br><br><br>
Seriously, are you still reading this?
