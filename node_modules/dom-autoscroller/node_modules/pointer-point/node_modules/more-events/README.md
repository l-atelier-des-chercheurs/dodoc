more-events
===========

Install
-------

`npm install more-events`

It's
----

Another event emitter with the usual methods.

-	on
-	off
-	one
-	emit

Listeners are emitted backwards so don't expect the order of emits to play nice.

Set the context if you want.
----------------------------

```javascript
var Emitter = require('more-events').Emitter;
function MyClass(){
    this.emitter = new Emitter(this /*A different context for listeners*/);
}
```

Otherwise the emitter uses it's own context.

emitter.dispose()
-----------------

Destroy the object when you don't need it any more. Good for memory management.

Why?
----

Because I can, and because I need a really light emitter I can depend on.
