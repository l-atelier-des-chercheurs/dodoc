Install version 1
-----------------

`npm install pointer-point@1.1.0`

Usage
-----

```html
<!DOCTYPE html>
<html>
<head>
    <title>Dom list test</title>
    <style type="text/css">
    div{
        background-color: #968096;
    }
    </style>
</head>
<body>
    <div>
    Some text
    </div>

    <script>
    var pointer = require('../index');
    var point = pointer(document.querySelector('div'));
    point.on('move', function(e){
        //Every movement is tracked.
        console.log('point.x '+point.x);
        console.log('point.y '+point.y);
        console.log('point.down '+point.down);
    });
    point.on('down', function(e){
        //Do something when the pointer is down.
    });
    point.on('up', function(e){
        //Do something when the pointer is up.
    });
    </script>
</body>
</html>
```

Constructor
-----------

### pointer(element|selector) -> point

Pass an element, or selector for an element, and get a point in return.

Methods
-------

### point.destroy

Use destroy to remove all tracking of the pointer. Useful if you don't need the reference to the element, or it's pointer anymore.

```javascript
point.destroy();
point = null;
//Garbage collection is coming up.
```

### point.on

Add events.

### point.off

Remove events.

Events
------

-	move
-	down
-	up
-	stroke

The `move` event is used for the whole viewport. Not just the element you choose. This is useful for when you still need to track events when the pointer leaves the element.

The `stroke` event is fired only when the mouse is down. On a touch interface `move`, and `stroke` are pretty much the same. `stroke` is also emitted for the whole viewport.

Properties
----------

### point.down

Is the pointer down?

### point.up

Is the pointer up?

### point.root

The element passed to the factory constructor.

### point.x

Read only x coordinate of the pointer.

### point.y

Read only y coordinate of the pointer.

### point.pos

An internal reference to the point position.

Caveats
-------

Internally pointer-point uses events to track pointer position so until the cursor is moved, or there is a touch there will be no x/y positions. This shouldn't be a problem in most situations.
