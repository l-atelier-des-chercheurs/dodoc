# photograb

Simple API for capturing frames from a video element in a dataURI with the proper scaling applied.

This module works well with browserify. If you want to use it by itself or with AMD use the `photograb.bundle.js` file instead.

## what is it?

Photograb simply takes a canvas tag and returns a dataURI (suitable as a `src` attribute of an `<img>`) with the given options.

## installing

```
npm install photograb
```

## example


```js
var getUserMedia = require('getusermedia');
var attachMediaStream = require('attachmediastream');
var photograb = require('photograb');

var videoEl = document.getElementById('localVideo');
var containerEl = document.getElementById('imgContainer');

// get media
getUserMedia(function (err, stream) {
    if (stream) {
        // attach it to our element
        attachMediaStream(stream, videoEl, {muted: true});
    }
});

// click handler for clicking on the video
function capture() {
    // create an image element
    var image = document.createElement('img');
    // set the source to dataURI from photograb
    image.src = photograb(videoEl);
    // set it as the contents of our container
    containerEl.innerHTML = image.outerHTML;
    return false;
}

// register our handler
videoEl.addEventListener('click', capture, false);

```

## options

No options are necessary. 

But you can pass the following as part of the options object:

`width` - will return an image of that width, if passed by itself, it will scale proportionately.

`height` - will return an image of that height, if passed by itself, it will scale proportionately.

** note if you pass both a height/width it will skew image.

## license

MIT

## credits

Like this? Follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter and check out all the similar modules in http://simplewebrtc.com.
