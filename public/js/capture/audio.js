/*************

  should rewrite each mode as a single var with functions...

  **************/

var audioMode = (function() {

  var $preview = $(".preview_audio");
  var isRunning = false;
  var isRecording = false;

  //Variables
  var $startAudioRecording = $('#start-recording-btn');
  var $stopAudioRecording = $('#stop-recording-btn');

  function startRecordAudio(){

    if( mediaJustCaptured())
      return;

    backAnimation();
    isRecording = true;

    $('body').attr('data-audiorecording', 'yes');
    currentStream.startRecordAudioFeed();

    $startAudioRecording.attr('disabled', true).hide();
    $stopAudioRecording.attr('disabled', false).show();

    sarahCouleur = 'red';
  }

  function stopRecordAudio(){

    $startAudioRecording.attr('disabled', false).show();
    $stopAudioRecording.attr('disabled', true).hide();
    isRecording = false;

    var imageData = $("#canvas-audio")[0].toDataURL('image/png');
    photo.setAttribute('src', imageData);
    $('body').attr('data-audiorecording', '');

    // stop audio recorder
    currentStream.stopRecordAudioFeed().then(function(audioDataURL) {

      var mediaData =
      {
        "mediaType" : "audio",
        "mediaData" : audioDataURL,
        "audioScreenshot" : imageData
      };
      sendData.createNewMedia( mediaData);

      animateWindows();
      saveFeedback("/images/icone-dodoc_son.png");

    });

    sarahCouleur = 'gray';
    justCaptured();

  }

  return {
    init: function( stream) {
      isRunning = true;
      equalizer.start( $('#canvas-audio'), stream);
      $preview.find('.js--delete-media-capture').hide();
      //click events

      $startAudioRecording.off().on('click', this.startRecord);
      $stopAudioRecording.off().on('click', this.stopRecord);
    },

    startRecord: function() {
      equalizer.clearCanvas();
      startRecordAudio();
    },
    stopRecord: function() {
      stopRecordAudio();
      equalizer.clearCanvas();
    },

    stop: function() {
      isRunning = false;
      equalizer.stop();
    },

    showAudioPreview: function( pathToAudioFile, pathToEqualizerPreview) {
      $preview.find('audio.output').attr('src', pathToAudioFile);
      $preview.find('img.output').attr('src', pathToEqualizerPreview);
      $preview.find('.js--delete-media-capture').show();
    },

    isRunning: function() {
      return isRunning;
    },
    captureButtonPress: function() {
      if(!isRunning) return;
      if(isRecording) this.stopRecord();
      else this.startRecord();
    },

  }
})();




/*************
  LEGACY
  **************/

var sarahCouleur = "gray";


// CREATE A SOUND EQUALIZER
var equalizer = (function() {

  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback, element){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  // Global Variables for Audio
  var audioContext;
  var analyserNode;
  var javascriptNode;
  var sampleSize = 1024;  // number of samples to collect before analyzing
                          // decreasing this gives a faster sonogram, increasing it slows it down
  var amplitudeArray;     // array to hold frequency data
  var audioStream;
  var sourceNode;

  // Global Variables for Drawing
  var column = 0;
  var canvasWidth  = 720;
  var canvasHeight = 256;
  var ctx;

  function startEqualizer( stream){
    console.log( 'starting equalizer');
    // e.preventDefault();
    clearCanvas();
    // Initialise getUserMedia
    setupAudioNodes( stream);
  }

  function stopEqualizer(){
    if( javascriptNode !== undefined)
      javascriptNode.onaudioprocess = null;
    if(audioStream !== undefined)
      audioStream.stop();
    if(sourceNode !== undefined)
      sourceNode.disconnect();
  }

  function setupAudioNodes(stream) {
    // create the media stream from the audio input source (microphone)
    sourceNode = audioContext.createMediaStreamSource(stream);
    audioStream = stream;

    analyserNode   = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

    // Create the array for the data values
    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);

    // setup the event handler that is triggered every time enough samples have been collected
    // trigger the audio analysis and draw one column in the display based on the results
    javascriptNode.onaudioprocess = function () {

        amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteTimeDomainData(amplitudeArray);

        // draw one column of the display
        requestAnimFrame(drawTimeDomain);
    }

    // Now connect the nodes together
    // Do not connect source node to destination - to avoid feedback
    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
  }

  function onError(e) {
      console.log(e);
  }

  function drawTimeDomain() {
      var minValue = 9999999;
      var maxValue = 0;
      for (var i = 0; i < amplitudeArray.length; i++) {
          var value = amplitudeArray[i] / 256;
          if(value > maxValue) {
              maxValue = value;
          } else if(value < minValue) {
              minValue = value;
          }
      }

      var y_lo = canvasHeight - (canvasHeight * minValue) - 1;
      var y_hi = canvasHeight - (canvasHeight * maxValue) - 1;

      ctx.fillStyle = sarahCouleur;
      ctx.fillRect(column,y_lo, 1, y_hi - y_lo);

      // loop around the canvas when we reach the end
      column += 1;

      console.log( 'equalizer is running');

      if(column >= canvasWidth) {
          column = 0;
          clearCanvas();
      }
  }

  function clearCanvas() {
    column = 0;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = 'blue';
    var y = (canvasHeight / 2) + 0.5;
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth-1, y);
    ctx.stroke();
  }

  return {
    start : function($canvas, stream) {
      ctx = $canvas.get(0).getContext("2d");

      window.AudioContext = (function(){
          return  window.AudioContext || window.mozAudioContext;
      })();

      try {
          audioContext = new AudioContext();
      } catch(e) {
          console.log('Web Audio API is not supported in this browser');
      }
      startEqualizer( stream);

    },
    stop : function() {
      stopEqualizer();
    },
    clearCanvas : function() {
      clearCanvas();
    }
  }
})();
