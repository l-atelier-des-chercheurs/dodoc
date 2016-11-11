# source-map-to-comment [![Build Status](https://travis-ci.org/sindresorhus/source-map-to-comment.svg?branch=master)](https://travis-ci.org/sindresorhus/source-map-to-comment)

> Convert a Source Map object to a comment


## Install

```
$ npm install --save source-map-to-comment
```


## Usage

```js
const sourceMapToComment = require('source-map-to-comment');
const sourceMap = getSourceMapFromSomething();

sourceMapToComment(sourceMap);
//=> '//# sourceMappingURL=data:application/json;base64,eyJ2Z...'

sourceMapToComment(sourceMap, {type: 'css'});
//=> '/*# sourceMappingURL=data:application/json;base64,eyJ2Z... */'
```


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
