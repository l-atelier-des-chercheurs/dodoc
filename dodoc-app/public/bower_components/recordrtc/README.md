# [RecordRTC](https://github.com/muaz-khan/RecordRTC): [WebRTC](https://www.webrtc-experiment.com/) audio/video recording

[RecordRTC Documentation](http://RecordRTC.org/) / [RecordRTC Wiki Pages](https://github.com/muaz-khan/RecordRTC/wiki) / [RecordRTC Demo](https://www.webrtc-experiment.com/RecordRTC/) / [WebRTC Experiments](https://www.webrtc-experiment.com/)

[![npm](https://img.shields.io/npm/v/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![downloads](https://img.shields.io/npm/dm/recordrtc.svg)](https://npmjs.org/package/recordrtc) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RecordRTC.png?branch=master)](https://travis-ci.org/muaz-khan/RecordRTC)

> [RecordRTC](https://www.webrtc-experiment.com/RecordRTC/) is a JavaScript-based media-recording library for modern web-browsers (supporting WebRTC getUserMedia API). It is optimized for different devices and browsers to bring all client-side (pluginfree) recording solutions in single place.

<a href="https://www.youtube.com/watch?v=YrLzTgdJ-Kg"><img src="https://cdn.webrtc-experiment.com/images/RecordRTC-YouTube.png" alt="YouTube Video Tutorial for RecordRTC!" /></a>

# Check all releases:

* https://github.com/muaz-khan/RecordRTC/releases

Please check [dev](https://github.com/muaz-khan/RecordRTC/tree/master/dev) directory for development files.

1. [RecordRTC API Reference](http://RecordRTC.org/RecordRTC.html)
2. [MRecordRTC API Reference](http://RecordRTC.org/MRecordRTC.html)
3. [MediaStreamRecorder API Reference](http://RecordRTC.org/MediaStreamRecorder.html)
5. [StereoAudioRecorder API Reference](http://RecordRTC.org/StereoAudioRecorder.html)
6. [WhammyRecorder API Reference](http://RecordRTC.org/WhammyRecorder.html)
7. [Whammy API Reference](http://RecordRTC.org/Whammy.html)
8. [CanvasRecorder API Reference](http://RecordRTC.org/CanvasRecorder.html)
9. [GifRecorder API Reference](http://RecordRTC.org/GifRecorder.html)
10. [Global API Reference](http://RecordRTC.org/global.html)

## Browsers Support:

| Browser        | Support           | Features |
| ------------- |-------------|-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) | Audio+Video (Both local/remote) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) | Audio+Video (Both local/remote) |
| Opera | [Stable](http://www.opera.com/) / [NEXT](http://www.opera.com/computer/next)  | Audio/Video Separately |
| Android | [Chrome](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) / [Firefox](https://play.google.com/store/apps/details?id=org.mozilla.firefox) / [Opera](https://play.google.com/store/apps/details?id=com.opera.browser) | Audio/Video Separately |
| Microsoft Edge | [Normal Build](https://www.microsoft.com/en-us/windows/microsoft-edge) | Only Audio |

## How RecordRTC encodes wav/webm?

|Media File|Bitrate/Framerate|encoders|Framesize|additional info|
| ------------- |-------------|-------------|-------------|-------------|
|Audio File (WAV) | 1411 kbps | pcm_s16le |44100 Hz|stereo, s16|
|Video File (WebM)|60 kb/s | (whammy) vp8 codec yuv420p|--|SAR 1:1 DAR 4:3, 1k tbr, 1k tbn, 1k tbc (default)|

## RecordRTC Demos

1. [RecordRTC to Node.js](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-Nodejs)
2. [RecordRTC to PHP](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-PHP)
3. [RecordRTC to ASP.NET MVC](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-to-ASPNETMVC)
4. [RecordRTC & HTML-2-Canvas i.e. Canvas/HTML Recording!](https://github.com/muaz-khan/RecordRTC/tree/master/Canvas-Recording)
5. [MRecordRTC i.e. Multi-RecordRTC!](https://github.com/muaz-khan/RecordRTC/tree/master/MRecordRTC)
6. [RecordRTC on Ruby!](https://github.com/cbetta/record-rtc-experiment)
7. [RecordRTC over Socket.io](https://github.com/muaz-khan/RecordRTC/tree/master/RecordRTC-over-Socketio)
8. [ffmpeg-asm.js and RecordRTC! Audio/Video Merging & Transcoding!](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/ffmpeg)
9. [RecordRTC / PHP / FFmpeg](https://github.com/muaz-khan/RecordRTC/tree/master/PHP-and-FFmpeg)
10. [Record Audio and upload to Nodejs server](https://www.npmjs.org/package/record-audio)
11. [ConcatenateBlobs.js](https://github.com/muaz-khan/ConcatenateBlobs) - Concatenate multiple recordings in single Blob!
12. [Remote audio-stream recording](https://www.webrtc-experiment.com/demos/remote-stream-recording.html) or [a real p2p demo](https://www.webrtc-experiment.com/RTCMultiConnection/RecordRTC-and-RTCMultiConnection.html)
13. [Mp3 or Wav Recording](https://www.webrtc-experiment.com/RecordRTC/Record-Mp3-or-Wav.html)
14. [Record entire DIV including video, image, textarea, input, drag/move/resize, everything](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/)
15. [Record canvas 2D drawings, lines, shapes, texts, images, drag/resize/enlarge/move via a huge drawing tool!](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/record-canvas-drawings.html)
16. [Record Canvas2D Animation](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/Canvas-Animation-Recording.html)
17. [WebGL animation recording](https://www.webrtc-experiment.com/RecordRTC/webgl/)
18. [Plotly - WebGL animation recording](https://www.webrtc-experiment.com/RecordRTC/webgl/plotly.html)

You can also try a chrome extension for screen recording:

* https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp

# How to link?

## [NPM](https://www.npmjs.com/package/recordrtc) install

```
npm install recordrtc

# you can use with "require" (browserify/nodejs)
var RecordRTC = require('recordrtc');

var recorder = RecordRTC({}, {
    type: 'video',
    recorderType: RecordRTC.WhammyRecorder
});

console.log('\n--------\nRecordRTC\n--------\n');
console.log(recorder);

console.log('\n--------\nstartRecording\n--------\n');
recorder.startRecording();
console.log('\n--------\nprocess.exit()\n--------\n');

process.exit()
```

* https://tonicdev.com/npm/recordrtc

Here is how to use `require`:

```javascript
var RecordRTC = require('recordrtc');
var Whammy = RecordRTC.Whammy;
var WhammyRecorder = RecordRTC.WhammyRecorder;
var StereoAudioRecorder = RecordRTC.StereoAudioRecorder;
// and so on

var video = new Whammy.Video(100);
var recorder = new StereoAudioRecorder(stream, options);
```

```html
<!-- link npm package scripts -->
<script src="./node_modules/recordrtc/RecordRTC.js"></script>
```

There are some other NPM packages regarding RecordRTC:

* [https://www.npmjs.org/search?q=RecordRTC](https://www.npmjs.org/search?q=RecordRTC)

## [bower](http://bower.io) install

```
bower install recordrtc
```

```html
<!-- link bower package scripts -->
<script src="./bower_components/recordrtc/RecordRTC.js"></script>
```

## CDN

```html
<!-- CDN -->
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>

<!-- non-CDN -->
<script src="https://www.WebRTC-Experiment.com/RecordRTC.js"></script>
```

## Releases

You can even link specific [releases](https://github.com/muaz-khan/RecordRTC/releases):

```html
<!-- use 5.4.0 or any other version -->
<script src="https://github.com/muaz-khan/RecordRTC/releases/download/5.4.0/RecordRTC.js"></script>
```

## How to capture stream?

```html
<script src="https://cdn.webrtc-experiment.com/gumadapter.js"></script>

<script>
function successCallback(stream) {
    // RecordRTC usage goes here
}

function errorCallback(error) {
    // maybe another application is using the device
}

var mediaConstraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
</script>
```

## Record audio+video in Firefox

You'll be recording both audio/video in single WebM container. Though you can edit RecordRTC.js to record in mp4.

```javascript
var recordRTC;

function successCallback(stream) {
    // RecordRTC usage goes here

    var options = {
      mimeType: 'video/webm', // or video/mp4 or audio/ogg
      audioBitsPerSecond: 128000,
      videoBitsPerSecond: 128000,
      bitsPerSecond: 128000 // if this line is provided, skip above two
    };
    recordRTC = RecordRTC(stream, options);
    recordRTC.startRecording();
}

function errorCallback(error) {
    // maybe another application is using the device
}

var mediaConstraints = { video: true, audio: true };

navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);

btnStopRecording.onclick = function () {
    recordRTC.stopRecording(function (audioVideoWebMURL) {
        video.src = audioVideoWebMURL;

        var recordedBlob = recordRTC.getBlob();
        recordRTC.getDataURL(function(dataURL) { });
    });
};
```

Demo: [AudioVideo-on-Firefox.html](https://www.webrtc-experiment.com/RecordRTC/AudioVideo-on-Firefox.html)

## Record only Audio

```javascript
var recordRTC = RecordRTC(mediaStream);
recordRTC.startRecording();
recordRTC.stopRecording(function(audioURL) {
    audio.src = audioURL;

    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
```

## Echo Issues

Simply set `volume=0` or `muted=true` over `<audio>` or `<video>` element:

```javascript
videoElement.muted = true;
audioElement.muted = true;
```

Otherwise, you can pass some media constraints:

```javascript
function successCallback(stream) {
    // RecordRTC usage goes here
}

function errorCallback(error) {
    // maybe another application is using the device
}

var mediaConstraints = {
    audio: {
        mandatory: {
            echoCancellation: false,
            googAutoGainControl: false,
            googNoiseSuppression: false,
            googHighpassFilter: false
        },
        optional: [{
          googAudioMirroring: false
        }]
    },
};

navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
```

* [Constraints Reference](https://chromium.googlesource.com/external/webrtc/+/master/talk/app/webrtc/mediaconstraintsinterface.cc)

## Record Video

Everything is optional except `type:'video'`:

```javascript
var options = {
   type: 'video',
   frameInterval: 20 // minimum time between pushing frames to Whammy (in milliseconds)
};
var recordRTC = RecordRTC(mediaStream, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(videoURL) {
    video.src = videoURL;

    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
```

## Record animated GIF image

Everything is optional except `type:'gif'`:

```javascript
// you must "manually" link:
// https://cdn.webrtc-experiment.com/gif-recorder.js

var options = {
   type: 'gif',
   frameRate: 200,
   quality: 10
};
var recordRTC = RecordRTC(mediaStream || canvas || context, options);
recordRTC.startRecording();
recordRTC.stopRecording(function(gifURL) {
   mediaElement.src = gifURL;
});
```

## Record a Webpage

You can say it: "HTML/Canvas Recording using RecordRTC"!

```html
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
<script src="https://cdn.webrtc-experiment.com/screenshot.js"></script>

<div id="elementToShare" style="width:100%;height:100%;background:green;"></div>
<script>
var elementToShare = document.getElementById('elementToShare');
var recordRTC = RecordRTC(elementToShare, {
    type: 'canvas'
});
recordRTC.startRecording();
recordRTC.stopRecording(function(videoURL) {
    video.src = videoURL;

    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function(dataURL) { });
});
</script>
```

See a demo: [/Canvas-Recording/](https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/)

## Record `<canvas>`

You can even record Canvas2D drawings:

```html
<script src="https://cdn.webrtc-experiment.com/RecordRTC/Whammy.js"></script>
<script src="https://cdn.webrtc-experiment.com/RecordRTC/CanvasRecorder.js"></script>
<canvas></canvas>
<script>
var canvas = document.querySelector('canvas');
var recorder = new CanvasRecorder(window.canvasElementToBeRecorded, {
    disableLogs: false
});

// start recording <canvas> drawings
recorder.record();

// a few minutes later
recorder.stop(function(blob) {
    var url = URL.createObjectURL(blob);
    window.open(url);
});
</script>
```

Live Demo:

* https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/record-canvas-drawings.html

Watch a video: https://vimeo.com/152119435

# API Reference

## `initRecorder`

It is a function that can be used to initiate recorder however skip getting recording outputs. It will provide maximum accuracy in the outputs after using `startRecording` method. Here is how to use it:

```javascript
var audioRecorder = RecordRTC(mediaStream, {
  recorderType: StereoAudioRecorder
});

var videoRecorder = RecordRTC(mediaStream, {
  recorderType: WhammyRecorder
});

videoRecorder.initRecorder(function() {
  audioRecorder.initRecorder(function() {
    // Both recorders are ready to record things accurately
    videoRecorder.startRecording();
    audioRecorder.startRecording();
  });
});
```

After using `stopRecording`, you'll see that both WAV/WebM blobs are having following charachteristics:

1. Both are having same recording duration i.e. length
2. Video recorder is having no blank frames
3. Audio recorder is having no empty buffers

This method is really useful to sync audio/video outputs.

## `setRecordingDuration`

You can ask RecordRTC to auto stop recording after specific duration. It accepts one mandatory and one optional argument:

```javascript
recordRTC.setRecordingDuration(milliseconds, stoppedCallback);

// the easiest one:
recordRTC.setRecordingDuration(milliseconds).onRecordingStopped(stoppedCallback);
```

Try a simple demo; paste in the chrome console:

```javascript
navigator.mediaDevices.getUserMedia({
    video: true
}).then(function(stream) {
    var recordRTC = RecordRTC(stream, {
        recorderType: WhammyRecorder
    });

    // auto stop recording after 5 seconds
    recordRTC.setRecordingDuration(5 * 1000).onRecordingStopped(function(url) {
        console.debug('setRecordingDuration', url);
        window.open(url);
    })

    recordRTC.startRecording();
}).catch(function(error) {
    console.error(error);
});
```

## `clearRecordedData`

This method can be used to clear old recorded frames/buffers. Snippet:

```javascript
recorder.clearRecordedData();
```

## `recorderType`

If you're using `recorderType` then you don't need to use `type`. Second one will be redundant i.e. skipped.

You can force any Recorder by passing this object over RecordRTC constructor:

```javascript
var audioRecorder = RecordRTC(mediaStream, {
  recorderType: StereoAudioRecorder
})
```

It means that ALL_BROWSERS will be using [StereoAudioRecorder](http://RecordRTC.org/StereoAudioRecorder.html) i.e. WebAudio API for audio recording.

This feature brings remote audio recording support in Firefox, and local audio recording support in Microsoft Edge.

Note: Chrome `>=50` supports remote audio+video recording.

You can even force `WhammyRecorder` on Firefox however webp format isn't yet supported in standard Firefox builds. It simply means that, you're skipping MediaRecorder API in Firefox.

## `type`

If you are NOT using `recorderType` parameter then `type` parameter can be used to ask RecordRTC choose best recorder-type for recording.

```javascript
// if it is Firefox, then RecordRTC will be using MediaStreamRecorder.js
// if it is Chrome or Opera, then RecordRTC will be using WhammyRecorder.js
var recordVideo = RecordRTC(mediaStream, {
  type: 'video'
});

// if it is Firefox, then RecordRTC will be using MediaStreamRecorder.js
// if it is Chrome or Opera or Edge, then RecordRTC will be using StereoAudioRecorder.js
var recordVideo = RecordRTC(mediaStream, {
  type: 'audio'
});
```

## `frameInterval`

Set minimum interval (in milliseconds) between each time we push a frame to Whammy recorder.

```javascript
var whammyRecorder = RecordRTC(videoStream, {
  recorderType: WhammyRecorder,
  frameInterval: 1   // setTimeout interval
});
```

## `disableLogs`

You can disable all the RecordRTC logs by passing this Boolean:

```javascript
var recorder = RecordRTC(mediaStream, {
  disableLogs: true
});
```

## `numberOfAudioChannels`

You can force [StereoAudioRecorder](http://RecordRTC.org/StereoAudioRecorder.html) to record single-audio-channel only. It allows you reduce WAV file size to half.

```javascript
var audioRecorder = RecordRTC(audioStream, {
  recorderType: StereoAudioRecorder,
  numberOfAudioChannels: 1 // or leftChannel:true
});
```

**It will reduce WAV size to half!**

This feature is useful only in Chrome and Microsoft Edge (WAV-recorders). It can work in Firefox as well.

## How to set video width/height?

```javascript
var options = {
   type: 'video',
   video: {
      width: 320,
      height: 240
   },
   canvas: {
      width: 320,
      height: 240
   }
};

var recordVideo = RecordRTC(MediaStream, options);
```

## `pauseRecording`

RecordRTC pauses recording buffers/frames.

```javascript
recordRTC.pauseRecording();
```

## `resumeRecording`

If you're using "initRecorder" then it asks RecordRTC that now its time to record buffers/frames. Otherwise, it asks RecordRTC to not only initialize recorder but also record buffers/frames.

```javascript
recordRTC.resumeRecording();
```

## `getDataURL`

Optionally get "DataURL" object instead of "Blob".

```javascript
recordRTC.getDataURL(function(dataURL) {
   mediaElement.src = dataURL;
});
```

## `getBlob`

Get "Blob" object. A blob object looks similar to `input[type=file]`. Which means that you can append it to `FormData` and upload to server using XMLHttpRequest object. Even socket.io nowadays supports blob-transmission.

```javascript
blob = recordRTC.getBlob();
```

## `toURL`

A virtual URL. It can be used only inside the same browser. You can't share it. It is just providing a preview of the recording.

```javascript
window.open( recordRTC.toURL() );
```

## `save`

Invoke save-as dialog. You can pass "fileName" as well; though fileName argument is optional.

```javascript
recordRTC.save('File Name');
```

## `bufferSize`

Here is how to customize Buffer-Size for audio recording?

```javascript
// From the spec: This value controls how frequently the audioprocess event is
// dispatched and how many sample-frames need to be processed each call.
// Lower values for buffer size will result in a lower (better) latency.
// Higher values will be necessary to avoid audio breakup and glitches
// bug: how to minimize wav size?
// workaround? obviously ffmpeg!
// The size of the buffer (in sample-frames) which needs to
// be processed each time onprocessaudio is called.

// Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384).

var options = {
   bufferSize: 16384
};
var recordRTC = RecordRTC(audioStream, options);
```

Following values are allowed for buffer-size:

```javascript
// Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384)
```

If you passed invalid value then you'll get blank audio.

## `sampleRate`

Here is jow to customize Sample-Rate for audio recording?

```javascript
// The sample rate (in sample-frames per second) at which the
// AudioContext handles audio. It is assumed that all AudioNodes
// in the context run at this rate. In making this assumption,
// sample-rate converters or "varispeed" processors are not supported
// in real-time processing.
// The sampleRate parameter describes the sample-rate of the
// linear PCM audio data in the buffer in sample-frames per second.

// An implementation must support sample-rates in at least
// the range 22050 to 96000.

var options = {
   sampleRate: 96000
};
var recordRTC = RecordRTC(audioStream, options);
```

Values for sample-rate must be greater than or equal to 22050 and less than or equal to 96000.

If you passed invalid value then you'll get blank audio.

You can pass custom sample-rate values only on Mac (or additionally maybe on Windows 10).

## `mimeType`

This option allows you set MediaRecorder output format (currently works only in Firefox; Chrome support coming soon):

```javascript
var options = {
  mimeType 'video/webm', // or video/mp4 or audio/ogg
  bitsPerSecond: 128000
};
var recorder = RecordRTC(mediaStream, options);
```

Note: For chrome, it will simply auto-set `type:audio or video` parameters to keep supporting `StereoAudioRecorder.js` and `WhammyRecorder.js`.

That is, you can skip passing `type:audio` parameter when you're using `mimeType` parameter.

## `bitsPerSecond`

The chosen bitrate for the audio and video components of the media. If this is specified along with one or the other of the above properties, this will be used for the one that isn't specified.

```javascript
var options = {
  mimeType 'video/webm', // or video/mp4 or audio/ogg
  bitsPerSecond: 128000
};
var recorder = RecordRTC(mediaStream, options);
```

## `audioBitsPerSecond`

The chosen bitrate for the audio component of the media.

```javascript
var options = {
  mimeType 'audio/ogg',
  audioBitsPerSecond: 128000
};
var recorder = RecordRTC(mediaStream, options);
```

## `videoBitsPerSecond`

The chosen bitrate for the video component of the media.

```javascript
var options = {
  mimeType 'video/webm', // or video/mp4
  videoBitsPerSecond: 128000
};
var recorder = RecordRTC(mediaStream, options);
```

## `onAudioProcessStarted`

Note: "initRecorder" is preferred over this old hack. Both works similarly.

Useful to recover audio/video sync issues inside the browser:

```javascript
recordAudio = RecordRTC( stream, {
     onAudioProcessStarted: function( ) {
         recordVideo.startRecording();
     }
});

recordVideo = RecordRTC(stream, {
    type: 'video'
});

recordAudio.startRecording();
```

`onAudioProcessStarted` fixes shared/exclusive audio gap (a little bit). Because shared audio sometimes causes 100ms delay...
sometime about 400-to-500 ms delay.
Delay depends upon number of applications concurrently requesting same audio devices and CPU/Memory available.
Shared mode is the only mode currently available on 90% of windows systems especially on windows 7.

## `autoWriteToDisk`

Using `autoWriteToDisk`; you can suggest RecordRTC to auto-write to indexed-db as soon as you call `stopRecording` method.

```javascript
var recordRTC = RecordRTC(MediaStream, {
    autoWriteToDisk: true
});
```

`autoWriteToDisk` is helpful for single stream recording and writing to disk; however for `MRecordRTC`; `writeToDisk` is preferred one.

## `writeToDisk`

You can write recorded blob to disk using `writeToDisk` method:

```javascript
recordRTC.stopRecording();
recordRTC.writeToDisk();
```

## `getFromDisk`

You can get recorded blob from disk using `getFromDisk` method:

```javascript
// get all blobs from disk
RecordRTC.getFromDisk('all', function(dataURL, type) {
   type == 'audio'
   type == 'video'
   type == 'gif'
});

// or get just single blob
RecordRTC.getFromDisk('audio', function(dataURL) {
   // only audio blob is returned from disk!
});
```

For [MRecordRTC](https://RecordRTC.org/MRecordRTC.html); you can use word `MRecordRTC` instead of `RecordRTC`!

Another possible situation!

```javascript
var recordRTC = RecordRTC(mediaStream);
recordRTC.startRecording();
recordRTC.stopRecording(function(audioURL) {
   mediaElement.src = audioURL;
});

// "recordRTC" instance object to invoke "getFromDisk" method!
recordRTC.getFromDisk(function(dataURL) {
   // audio blob is automaticlaly returned from disk!
});
```

In the above example; you can see that `recordRTC` instance object is used instead of global `RecordRTC` object.

## Promises

```html
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>

<!-- link this file as well -->
<script src="/dev/RecordRTC.promises.js"></script>

<script>
// use "RecordRTCPromisesHandler" instead of "RecordRTC"
var recorder = new RecordRTCPromisesHandler(mediaStream, options);
recorder.startRecording().then(function() {

}).catch(function(error) {
    //
});

recorder.stopRecording().then(function(url) {
    var blob = recorder.blob;

    recorder.getDataURL().then(function(dataURL) {
        //
    }).catch(function(error) {})
}).catch(function(error) {
    //
});
</script>
```

## Credits

1. [Recorderjs](https://github.com/mattdiamond/Recorderjs) for audio recording
2. [whammy](https://github.com/antimatter15/whammy) for video recording
3. [jsGif](https://github.com/antimatter15/jsgif) for gif recording

## Spec & Reference

1. [Web Audio API](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html)
2. [MediaRecorder](https://wiki.mozilla.org/Gecko:MediaRecorder)
3. [Canvas2D](http://www.w3.org/html/wg/drafts/2dcontext/html5_canvas/)
4. [MediaStream Recording](https://dvcs.w3.org/hg/dap/raw-file/tip/media-stream-capture/MediaRecorder.html)
5. [Media Capture and Streams](http://www.w3.org/TR/mediacapture-streams/)

## Contribute in [RecordRTC.org](http://RecordRTC.org) domain

The domain www.RecordRTC.org is open-sourced here:

* https://github.com/muaz-khan/RecordRTC/tree/gh-pages

## Issues/Questions?

* Stackoverflow: http://stackoverflow.com/questions/tagged/recordrtc
* Github: https://github.com/muaz-khan/RecordRTC/issues
* Disqus: https://www.webrtc-experiment.com/RecordRTC/#ask
* Email: muazkh@gmail.com

## License

[RecordRTC.js](https://github.com/muaz-khan/RecordRTC) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com).
