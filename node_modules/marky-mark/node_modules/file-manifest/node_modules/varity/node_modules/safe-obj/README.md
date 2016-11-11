[![Build Status](https://travis-ci.org/mantacode/safe-obj.png)](https://travis-ci.org/mantacode/safe-obj) [![downloads](http://img.shields.io/npm/dm/safe-obj.svg)](https://npmjs.org/package/safe-obj) [![npm](http://img.shields.io/npm/v/safe-obj.svg)](https://npmjs.org/package/safe-obj) [![Test Coverage](https://codeclimate.com/github/mantacode/safe-obj/badges/coverage.svg)](https://codeclimate.com/github/mantacode/safe-obj) [![Code Climate](https://codeclimate.com/github/mantacode/safe-obj/badges/gpa.svg)](https://codeclimate.com/github/mantacode/safe-obj) [![dependencies](https://david-dm.org/mantacode/safe-obj.png)](https://david-dm.org/mantacode/safe-obj)

[![NPM info](https://nodei.co/npm/safe-obj.png?downloads=true)](https://nodei.co/npm/safe-obj.png?downloads=true)

# Safe-obj

Underscore helpers to make object accessors safe

I came (partly) from a Perl background where you could say `$obj->{thing}->{another_thing}->{more_things}`, and it would not blow up even if $obj was totally empty. Similarly, you could say `$obj->{thing}->{foo} = 'bar'`, even if $obj had no property called 'thing'. I don't miss everything about Perl, but I do miss that. In javascript, you'd have to say:

```javascript
if (obj && obj.thing && obj.thing.another_thing && obj.thing.another_thing.more_things) {
  // I want to die a little bit
}
```

So this module is basically auto-vivification for javascript.

## Install

`npm install safe-obj --save`

## Usage

### Server

As of v1.0.0, this module works with both lodash and underscore, though it requires using `_.safe(obj, path)` with lodash since `_(obj).safe(path)` triggers lodash's chaining.

`safe-obj` exports an object that can be mixed into underscore/lodash like this:

```javascript
_.mixin(require('safe-obj'));
```

that let's you access object properties with wild abandon.

### Client

Additionally, as of v1.0.0, it works on the client side. If `window._` is defined (i.e. lodash or underscore has been loaded), `_.safe` will add an `_safe` property to it, which you can mix in with `_.mixin(_._safe)`.

On the client, just include the script after underscore or lodash:

```html
<script src="/underscore.js"></script>
<script src="path/to/safe-obj/dist/safe.js"></script>
```

and then mix it in:

```html
<script>
  (function() {
    _.mixin(_._safe);
  })();
</script>
```

## API

### Safe

Let's you access object properties (and array indices too!) regardless of whether they exist. If, at any point, a property returns `undefined` (where calling another object accessor would blow up), `safe` immediately just returns `undefined` (or a default, if you provide one).

```javascript
var obj = {}

// returns undefined
var innerProp = _(obj).safe('foo.bar.baz.0.hello.world'); 

// returns [] - useful if you want to call array methods but don't want to check the type
var anotherProp = _(obj).safe('a.brave.new.world', []); 
```

### Expand

Let's you assign to any arbitrarily deep and non-existent property on an object. Any non-existent properties are expanded into objects.

```javascript
var obj = {}

_(obj).expand('foo.bar.baz', 'hello world');

// obj now equals: {
//   foo: {
//     bar: {
//       baz: 'hello world'
//     }
//   }
// }
```

Expand is likely to be finnicky (at the moment) with expanding arrays. It's untested, and my guess is that it will create object properties with numbers. Something like

```javascript
property: {
  0: {
    // more stuff
  }
}
```

I'd like to make that work more as expected in a future release, but for now, don't expect it to work.

### Ensure

Sets a path to a given value unless that path already has a value. Also allows an optional list of "disallowed" values.

```javascript
var obj = {
  foo: {
    bar: 'baz'
  }
};

// This will have no effect on obj since 'foo.bar' already has a value
_(obj).ensure('foo.bar', 'a default value');

obj = {
  foo: {}
};

// This will set obj.foo equal to { bar: 'a default value' }
_(obj).ensure('foo.bar', 'a default value');

obj = {
  foo: {
    bar: 'nope'
  }
};

// This says don't allow 'nope' as a value of foo.bar, thus it will use the default
_(obj).ensure('foo.bar', [ 'nope' ], 'a default value');
```

### AllOf

Uses `safe` to return `true` if all the paths exist in the object or `false` if any is missing.

```javascript
var obj = {
  foo: {
    bar: 'baz'
  }
};

_(obj).allOf('foo.bar', 'hello.world'); // returns false

// or
// _(obj).allOf(['foo.bar', 'hello.world']);
```

### AnyOf

Like `allOf` but returns `true` if any of the paths exist.

```javascript
var obj = {
  foo: {
    bar: 'baz'
  }
};

_(obj).anyOf('foo.bar', 'hello.world'); // returns true
```

### NoneOf

Like `allOf` and `anyOf` but only returns true when none of the paths exist.

```javascript
var obj = {
  foo: {
    bar: 'baz'
  }
};

_(obj).noneOf('foo.bar', 'hello.world'); // returns false
```
