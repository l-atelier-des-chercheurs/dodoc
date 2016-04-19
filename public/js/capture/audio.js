//Capture le flux audio
function audioCapture(code){
  //Variables
  var mediaStream = null;

  var startRecordingBtn = document.getElementById('start-recording-btn');
  var stopRecordingBtn = document.getElementById('stop-recording-btn');
  var cameraPreview = document.getElementById('son');

  //click events
  if(code == "click"){
    $("#start-recording-btn").off();
    $("#start-recording-btn").on('click', function(){
      console.log("you are using the mouse for recording audio");
      startRecordAudio();
      isEventExecutedVideo = false;
      $(".btn-choice").click(function(e){
        isEventExecutedVideo = false;
        stopAudioOnChange(e, isEventExecutedVideo);
      });
    });

    $("#stop-recording-btn").off();
    $("#stop-recording-btn").on('click', function(){
      stopRecordAudio();
      console.log("stop recording audio");
    });
  }

  //keyboard events
  if(countPress == 1){
    startRecordAudio();
    console.log("recording audio");
    isEventExecutedAudio = false;
    $("body").unbind("keypress.key115");
    $("body").bind("keypress.key115", function(e){
      var code = e.keyCode || e.which;
      if(code == 115 || code == 122){
        isEventExecutedVideo = false;
        stopAudioOnChange(e, isEventExecutedVideo);
      }
    });
  }

  if(countPress > 1){
    stopRecordAudio();
    console.log("stop recording audio");
    countPress = 0;
  }


  function stopAudioOnChange(e){
    if(isEventExecutedVideo == false){
      isEventExecutedVideo = true;
      console.log("Audio File was not saved");
      recordAudio.stopRecording();
      startRecordingBtn.style.display = "block";
      stopRecordingBtn.style.display = "none";
      startRecordingBtn.disabled = false;
      stopRecordingBtn.disabled = true;
      countPress = 0;
      sarahCouleur = "gray";
    }
  }

  function startRecordAudio(){
    backAnimation();

    // Initialise getUserMedia
    navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getMedia(
      {
        "video" : false,
        "audio" : true
      },
      function (stream) {
        // get user media pour le son
        mediaStream = stream;
        recordAudio = RecordRTC(stream, {
          "type" : 'audio'
        });
        recordAudio.startRecording();
        cameraPreview.src = window.URL.createObjectURL(stream);
        cameraPreview.play();
        cameraPreview.muted = false;
        cameraPreview.controls = true;
      },
      function(error) {
        alert(JSON.stringify(error));
      }
    );
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
    cameraPreview.style.display = "block";
    sarahCouleur = "gray";

    //display equalizer image
    var canvas = document.querySelector('#canvas-equalizer');
    var canvasAudio = document.querySelector('#canvas-audio');
    var context = canvas.getContext('2d');
    var widthAudio = canvas.width;
    var heightAudio = canvas.height;
    context.clearRect(0, 0, widthAudio, heightAudio);
    context.drawImage(canvasAudio, 0, 0, widthAudio, heightAudio);
    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
    $('#canvas-equalizer').show();

    // stop audio recorder
    recordAudio.stopRecording(function(url) {
      // get audio data-URL
      recordAudio.getDataURL(function(audioDataURL) {
/*
        var files = {
            audio: {
              type: recordAudio.getBlob().type || 'audio/wav',
              dataURL: audioDataURL
            }
        };
*/

        var mediaData =
        {
          "mediaType" : "audio",
          "mediaData" : audioDataURL
        };

        //socket.emit('audio', {files: files, id: sessionId, name: currentFolder});
        animateWindows();

        // send instruction to finish audio recording
        sendData.createNewMedia( mediaData);

        saveFeedback("/images/icone-dodoc_son.png");
        if (mediaStream) mediaStream.stop();
      });
    });
  }
}



// CREATE A SOUND EQUALIZER
function createEqualizer(event){
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
  //var javascriptNode;
  var sampleSize = 1024;  // number of samples to collect before analyzing
                          // decreasing this gives a faster sonogram, increasing it slows it down
  var amplitudeArray;     // array to hold frequency data
  var audioStream;

  // Global Variables for Drawing
  var column = 0;
  var canvasWidth  = 620;
  var canvasHeight = 256;
  var ctx;

  ctx = $("#canvas-audio").get()[0].getContext("2d");

  try {
      audioContext = new AudioContext();
  } catch(e) {
      console.log('Web Audio API is not supported in this browser');
  }

  startEqualizer();

  function startEqualizer(){
    // e.preventDefault();
    clearCanvas();
    // Initialise getUserMedia
    navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getMedia(
      {
        video: false,
        audio: true
      },
      setupAudioNodes,
      function(err) {
        alert(JSON.stringify(error));
      }
    );
  }

  function stopEqualizer(e){
    e.preventDefault();
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
