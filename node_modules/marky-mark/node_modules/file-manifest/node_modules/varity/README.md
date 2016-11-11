[![Build Status](https://travis-ci.org/tandrewnichols/varity.png)](https://travis-ci.org/tandrewnichols/varity) [![downloads](http://img.shields.io/npm/dm/varity.svg)](https://npmjs.org/package/varity) [![npm](http://img.shields.io/npm/v/varity.svg)](https://npmjs.org/package/varity)

# Varity

Javascript arity simplified.

## Why?

The ability to pass a variable number of parameters to functions is a nice feature of javascript, but it can sometimes lead to boilerplate code at the top of a method to determine which parameters you're actually working with. Something like

```javascript
function (url, params, options, callback) {
  if (typeof params === 'function') {
    callback = params, params = {}, options = {};
  } else if (typeof options === 'function') {
    callback = options, options = {};
  }
  // . . . now for actual function logic
}
```

Varity ("variable-arity") handles this for you. And it can do some other handy things to.

## Install

`npm install varity --save`

## Basic Use

When you `require('varity')`, you'll get a wrapper function back. This wrapper accepts a set of expectations and the function to wrap, then handles boilerplate arity shenanigans for you. If you tell varity you're expecting a string and a number, but only pass it a number, varity will fill in the string argument with `undefined`. No need to test `if (typeof options === 'function')`. There are several ways to tell varity what you're expecting.

### With types

```javascript
var $ = require('varity');
var wrapped = $(Array, Function, function(list, callback) {
  // list is guaranteed to be an array or undefined
  // callback will always be a function or undefined
});

// For example
wrapped([1, 2, 3]); // the function will be called with [1, 2, 3] and undefined

// or
wrapped(function() {}); // undefined, function() {}

// any additional params will also be passed on
wrapped([1, 2, 3], function() {}, { foo: 'bar' }) // [1, 2, 3], function() {}, { foo: 'bar' }

// in fact, varity is smart enough to handle this:
wrapped([1, 2, 3], { foo: 'bar' }) // [1, 2, 3], undefined, { foo: 'bar' }

// and even
wrapped({ foo: 'bar'}) // undefined, undefined, { foo: 'bar'}
```

You can pass any object type (use `null` for Null and `undefined` for Undefined - though there's not much value in expecting these in functions). You can also pass custom types.

```javascript
function Foo () {}
var wrapped = $(Foo, function(foo) {
  // We have a foo!
});
```

### With an array

```javascript
var wrapped = $(['String', 'Function'], function(name, callback) {
  // . . .
});
```

This let's you compile argument lists on the fly if necessary.

```javascript
var args = ['String'];
if (opts.async) {
  args.push('Function');
}

var wrapped = $.apply($, [args, function(path, cb){
  // Do neat stuff
}]);
```

### With a string

The first two methods are useful, but also lengthy. The real value in varity is in string abbreviations. To keep calls to varity short, all built in types have one character analogs that can be passed collectively as a single string:

```javascript
var wrapped = $('ssf', function(fname, lname, callback) {
  // . . . 
});
```

The following abbreviations are currently recognized by varity:

* s: String
* f: Function
* o: Object
* a: Array
* 1: Number
* b: Boolean
* r: RegExp
* d: Date
* N: NaN
* n: Null
* u: Undefined
* A: Arguments
* i: Infinity
* e: Error
* E: Element
* $: jQuery

Additionally, strings can have array wrappers (`[s]`) and ors (`|`). Any letter wrapped in `[]` tells varity to wrap the arg (if it matches that type) in an array. `|` says that either of two types are acceptable. These can also be combined.

```javascript
var wrapped = $('[s]', function(list) {
  // When called with a string, arguments will be an array with that string as the first and only item
});

var wrapped = $('1|b', function(isTruthy) {
  // Either a number or boolean can be passed
});

var wrapped = $('[s]|a', function(list) {
  // Either a string (which will be wrapped) or an array can be passed
});

var wrapped = $('[s]|[1]', function(list) {
  // Either a string or number can be passed, but in either case, it will be wrapped as an array
});
```

## Flags

Knowing that `options` will never be a function is nice, but you might still need to check for definedness before doing something with a parameter:

```javascript
var wrapped = $('af', function(list, cb) {
  cb(list.concat(['foo', 'bar']);
});

wrapped(function(newList) { /* . . . */ }); // Uh, oh. Cannot call method concat of undefined.
```

Thus, varity has some flags, indicated with symbols, that tell it to handle awkward conditions, such as the above, gracefully.

### Populate: +

Tells varity to return a default of the given type so that you don't have to worry about calling type specific methods.

```javascript
var wrapped = $('+a', function(list) {
  list.push('something'); // list will ALWAYS be an array
}
```

The built in defaults are as follows (though you can override them - more on that later).

* String

```javascript
''
```

* Function

```javascript
function(){}
```

* Object

```javascript
{}
```

* Array

```javascript
[]
```

* Number

```javascript
0
```

* Boolean

```javascript
false
```

* RegExp

```javascript
/.*/
```

* Date

```javascript
(function() {
  return new Date();
})()
```

* NaN

```javascript
NaN
```

* Null

```javascript
null
```

* Undefined

```javascript
undefined
```

* Arguments: 

```javascript
(function(){
  return arguments;
})(undefined)
```

* Infinity

```javascript
2/0 // because I like the number 2
```

* Error: 

```javascript
(function() {
  return new Error();
})()
```

* Element:

```javascript
(function() {
  if (typeof window !== 'undefined') {
    return window.document;
  } else {
    return '<div></div>';
  }
})()
```

* jQuery:

```javascript
(function() {
  if (typeof $ !== 'undefined') {
    return $(document);
  } else {
    return [];
  }
})()
```

### Optional: -

Normally, if you pass two of the same type next to each other, Varity will assign the first parameter that matches that type to the first argument and leave the second undefined.

```javascript
var wrapped = $('oo', function(options, data) {
  // If only one object is passed, it will be passed as "options" and "data" will be undefined
});
```

The `optional` flag reverses this behavior. (Alternatively, you could just reverse the parameters: `function(data, options)`.)

```javascript
var wrapped = $('-oo', function(options, data) {
  // Now if only one object is passed, it'll be set to "data", leaving "options" undefined.
});
```

You can also combine `populate` with `optional`:

```javascript
var wrapped = $('-+oo', function(obj1, obj2) {
  // If passed only {foo: 'bar'}, arguments will be {}, {foo: 'bar'}
});
```

### Non-empty: _

The non-empty flag tells varity to treat "empty" parameters as if they were undefined. This isn't that useful unless you change the defaults (more below). If you tell varity to populate a type with some other default and use the _ flag, varity will replace an empty type (e.g. `{}`, `[]`, `function() {}`, etc.) with the default of that type.

```javascript
$.populate('Object', {
  dataType: 'json',
  method: 'put'
});

var wrapped = $('s_o', function(url, opts) {
  // see below for more about populate
});
wrapped('something.com', {}); // Provides 'something.com' and { dataType: 'json', method: 'put' }
```

### Required: *

Marks a parameter as required. If that parameter is not passed, Varity will throw an exception.

```javascript
var wrapped = $('*so', function(name, options) {
  // . . .
});
wrapped({ async: true }); // throws
```

### Extend: &

For matching types, the actual argument will be extended with additional defaults. For objects, this means a deep object extend; for arrays, concat; for strings, joining with " "; and for functions, calling `_.compose` (with the default function coming first in the composition). This is an excellent way to handle option extension.

```javascript
$.extend('Object', { async: true }); // See "Helpers" below
var wrapped = $('&o', function(options) { });
wrapped({ path: '/foo/bar' }); // options will equal { async: true, path: '/foo/bar' }

$.extend('Array', [ 'Chuck' ]);
var wrapped = $('&a', function(ppl) { });
wrapped([ 'Sue', 'Douglas' ]); // ppl will equal [ 'Sue', 'Douglas', 'Chuck' ]

$.extend('String', 'Please try again.');
var wrapped = $('&s', function(message) { });
wrapped('We were unable to update your profile.'); // message will equal 'We were unable to update your profile. Please try again.'

$.extend('Function', function(name) { return 'My name is ' + name; });
var wrapped = $('&f', function(fn) { });
wrapped(function(message) { console.log(message); }); // when "fn" is called with "Tim", "My name is Tim" will be logged
```

## Helpers

Varity also a couple helper methods for changing options.

### varity.configure

Use `varity.configure` for one time, initial setup. All calls to `varity()` after that will use whatever options you pass. You can pass the following options to `varity.configure`:

* letters - add custom abbreviations or override default ones
* symbols - additional symbols and their corresponding functions
* defaults - override built in defaults or provide defaults for custom types
* populate - turn on `populate` for all types (with `true`) or a set of types (with an array) so that you don't have to use the `+` flag
 
```javascript
var $ = require('varity');
$.configure({
  letters: {
    '~': 'Foo',
    'a': 'Array',
    'g': 'Arguments' // If you don't like dealing with captials 
  },
  symbols: {
    '!': function(arg, context) {
      return !!arg;
    }
  },
  defaults: {
    'Object': {
      jsonp: true,
      method: 'get',
      data: {
        user: localStorage.get('user')
      }
    },
    'Foo': function() {
      return new Foo('my foo param');
    }
  },
  populate: true // Always populate ALL types

  /*
   * OR
   *
   * populate: ['Object', 'Array', 'Foo']
   *
   * to always populate ONLY these types
   */
});
```

Note that these options will be used for EVERY call to varity. If you need to undo these options, you can call `varity.reset()`, which will restore the defaults. However, any already wrapped functions will still have the custom options.

There are also simplified helpers that set one-time options:

### varity.letters

```javascript
$.letters('q', 'Quux');
```

### varity.symbols

```javascript
$.symbols('!', function(arg, context) {
  return !!arg;
});
```

### varity.defaults

```javascript
$.defaults('Array', [1, 2, 3]);
```

### varity.populate

```javascript
$.populate('Array', [1, 2, 3]);

// or

$.populate('Array');

// or

$.populate(true);
```

Unlike the others, which simply set the corresponding option, varity.populate both adds the type to the `populate` list _and_ calls $.defaults when called with two arguments (since, for a one-time option, it's essentially implied that the populating thing should be used). When called with only a type, that type is added to the `populate` list, but no additional default is set. When called with `true`, all types will be populated by default.

### varity.extend

```javascript
$.extend('Object', { async: true, path: '/foo/bar' });
```

## Custom Symbols

Each symbol corresponds to a function that receives the current argument and a context. The context looks like this:

```javascript
{
  symbols: ['-', '+'], // a list of symbols passed with this argument
  types: ['String'], // a list of types to match against
  wrapType: 'array' // indicates whether [] or | were used in the string
}
```

In addition, the varity object is passed as the `this` context, so you can access things like `this.args`, which has the full set of arguments passed to varity. You can create custom functionality by adding symbols and manipulating one or both of these parameters. Use this to whatever destructive ends you see fit. Note that symbol operations are called in the order in which they're passed, which _can_ make a difference. For instance, if you want to use `+` and `-` together, you should always pass `-` first, since, after `+` runs, the current argument will _never_ be undefined (well, unless the expected type is `undefined`). The example in the `configure` section above coerces results to booleans. You can take a look at the existing symbol operations to get an idea of how to use the context object.
