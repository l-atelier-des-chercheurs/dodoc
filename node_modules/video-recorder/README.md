# video-recorder

Experimental browser module for recording contents of a `<video>` tag by taking dataURI snapshots of it.

Written as a CommonJS module, so it works out of the box with browserify. If using with AMD or as standalone use `video-recorder.bundle.js` file instead.

Tested primarily in Chrome.

## demo

See the demo here: http://projects.joreteg.com/video-recorder/

## why?

You can use it to record and play back video at approximately 10fps in chrome. I was largely curious how well it would work. Turns out it's not too shabby.

The data is stored in an array as Base64 encoded PNGs using dataURIs: https://developer.mozilla.org/en-US/docs/data_URIs. This could be uploaded to a server and stitched into a video file using something like ffmpeg.

But it can also just be played back to the user using: https://github.com/HenrikJoreteg/fauxplay (as seen in the demo).

Obviously, there's no sound being recorded, but it could be interesting to mix this with screen capture support for in-browser screencast recordings.

## installing

```
npm install video-recorder
```

## example

```html
<video id="video"></video>
<img id="demo">
<div>
  <button id="record">Record</button>
  <button id="play">Play</button>
  <button id="reset">Reset recording</button>
</div>

<!-- some packages for getting and attaching user media -->
<script src="node_modules/getusermedia/getusermedia.bundle.js"></script>
<script src="node_modules/attachmediastream/attachmediastream.bundle.js"></script>
<!-- a package for playing back the recording -->
<script src="node_modules/fauxplay/fauxplay.bundle.js"></script>

<script src="video-recorder.bundle.js"></script>
<script>
  var image = document.getElementById('demo');
  var video = document.getElementById('video');
  var record = document.getElementById('record');
  var play = document.getElementById('play');
  var reset = document.getElementById('reset');
  var recorder;

  getUserMedia(function (err, stream) {
    if (err) return console.log(err);

    attachMediaStream(stream, video, {muted: true});

    recorder = window.recorder = new VideoRecorder(video);
  });

  record.addEventListener('click', function () {
    if (recorder.running) {
      recorder.stop();
      this.innerHTML = 'Record';
    } else {
      recorder.record();
      this.innerHTML = 'Pause';
    }
  });

  play.addEventListener('click', function () {
    fauxplay(recorder.data, image, {loop: true, duration: recorder.runningTime})
  });

  reset.addEventListener('click', function () {
    recorder.stop();
    recorder.reset();
  });
</script>
```

## license

MIT

## credits

If you like this follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter <3. This is a small part of my larger, grander project efforts related to webrtc: http://simplewebrtc.com
