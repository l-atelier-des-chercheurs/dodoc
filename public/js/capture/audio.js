/*************

  should rewrite each mode as a single var with functions...

  **************/

var audioMode = (function() {

  var eq;

  return {
    init : function( stream) {
      audioCapture();
      eq = new equalizer( $('#canvas-audio'), stream);
    },

    stop : function() {
      if( eq !== undefined) {
        eq.stopEqualizer();
      }
    },
  }
})();




/*************
  LEGACY
  **************/

//Capture le flux audio
function audioCapture(){
  //Variables
  var mediaStream = null;

  var startRecordingBtn = document.getElementById('start-recording-btn');
  var stopRecordingBtn = document.getElementById('stop-recording-btn');

  //click events
  $("#start-recording-btn").off();
  $("#start-recording-btn").on('click', function(){
    console.log("you are using the mouse for recording audio");
    startRecordAudio();
    isEventExecutedVideo = false;
  });

  $("#stop-recording-btn").off();
  $("#stop-recording-btn").on('click', function(){
    stopRecordAudio();
    console.log("stop recording audio");
  });


  function startRecordAudio(){
    backAnimation();

    currentStream.startRecordAudioFeed();

    startRecordingBtn.disabled = true;
    stopRecordingBtn.disabled = false;
    startRecordingBtn.style.display = "none";
    stopRecordingBtn.style.display = "block";

    sarahCouleur = "red";
  }

  function stopRecordAudio(){
    startRecordingBtn.disabled = false;
    stopRecordingBtn.disabled = true;
    startRecordingBtn.style.display = "block";
    stopRecordingBtn.style.display = "none";
    sarahCouleur = "gray";

    var imageData = $("#canvas-audio")[0].toDataURL('image/png');
    photo.setAttribute('src', imageData);

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
  }
}



// CREATE A SOUND EQUALIZER
function equalizer( $canvas, stream) {
  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback, element){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  window.AudioContext = (function(){
      return  window.AudioContext || window.mozAudioContext;
  })();

  // Global Variables for Audio
  var audioContext;
  var analyserNode;
  var javascriptNode;
  var sampleSize = 1024;  // number of samples to collect before analyzing
                          // decreasing this gives a faster sonogram, increasing it slows it down
  var amplitudeArray;     // array to hold frequency data
  var audioStream;

  // Global Variables for Drawing
  var column = 0;
  var canvasWidth  = 620;
  var canvasHeight = 256;
  var ctx;

  ctx = $canvas.get(0).getContext("2d");

  try {
      audioContext = new AudioContext();
  } catch(e) {
      console.log('Web Audio API is not supported in this browser');
  }

  startEqualizer( stream);

  function startEqualizer( stream){
    // e.preventDefault();
    clearCanvas();
    // Initialise getUserMedia
    setupAudioNodes( stream);
  }

  this.stopEqualizer = function(){
    javascriptNode.onaudioprocess = null;
    if(audioStream) audioStream.stop();
    if(sourceNode)  sourceNode.disconnect();
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

}
