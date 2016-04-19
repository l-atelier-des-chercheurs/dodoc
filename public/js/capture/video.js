function displayVideoStream(){
  // Initialise getUserMedia
  navigator.getUserMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);


  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
    return;
  }

  // List cameras and microphones.
  var mediaDevices = [];
  navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      devices.forEach(function(device) {
//         console.log(device.kind + ": " + device.label + " id = " + device.deviceId);
        if(device.kind === 'videoinput') {
          console.log(device.label);
          mediaDevices.push(device);
        }
      });
    })
    .then(function(){
      var deviceChoiceId;
      if(mediaDevices.length < 2){
        deviceChoiceId = mediaDevices[0].deviceId;
        //$('.container-inner').prepend("<h2>"+mediaDevices[0].label+"</h2>");
      }
      else{
        deviceChoiceId = mediaDevices[1].deviceId;
        //$('.container-inner').prepend("<h2>"+mediaDevices[1].label+"</h2>");
      }

      navigator.getUserMedia(
        {
          //video: {deviceId: deviceChoiceId ? {exact: deviceChoiceId} : undefined},
          video: {
            optional: [{sourceId: deviceChoiceId}]
          },
          audio: false
        },
        function (stream) {
          if (navigator.mozGetUserMedia) {
            video.mozSrcObject = stream;
          } else {
            var vendorURL = window.URL || window.webkitURL;
            video.src = vendorURL.createObjectURL(stream);
          }
          video.play();
        },
        function(err) {
          alert(JSON.stringify(error));
        }
      );
    })
    .catch(function(err) {
      console.log(err.name + ": " + error.message);
    });



    // navigator.getUserMedia(
    //   {
    //     video: true ,
    //     audio: false
    //   },
    //   function (stream) {
    //     if (navigator.mozGetUserMedia) {
    //       video.mozSrcObject = stream;
    //     } else {
    //       var vendorURL = window.URL || window.webkitURL;
    //       video.src = vendorURL.createObjectURL(stream);
    //     }
    //     video.play();
    //   },
    //   function(err) {
    //     alert(JSON.stringify(error));
    //   }
    // );

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        streaming = true;
        // respect the ratio set in dodoc.js
        var videoRatio = dodoc.captureVideoHeight/dodoc.captureVideoWidth;
        var containerWidth = $(".video-view").width();
        var videoHeight = containerWidth * videoRatio;
        $(video).css( "height", videoHeight);
      }
    }, false);
}

// Function qui enregistre de la vidéo
function recordingVideo(click){
  var startVideoRecording = document.getElementById('start-record-btn');
  var stopVideoRecording = document.getElementById('stop-record-btn');
  var cameraPreview = document.getElementById('camera-preview');

  //click events
  if(click == "click"){
    $("#start-record-btn").off().on('click', function(){
      console.log("you are using the mouse for recording");
      startVideo();
      $(".btn-choice").click(function(e){
        isEventExecutedVideo = false;
        stopVideoOnChange(e, isEventExecutedVideo);
      });
    });

    $("#stop-record-btn").off().on('click', function(){
      stopVideo();
    });
  }

  //Keyboard events (makey mkaey)
  if(countPress == 1){
    startVideo();
    console.log("recording video");
    $("body").unbind("keypress.key115");
    $("body").bind("keypress.key115", function(e){
      var code = e.keyCode || e.which;
      if(code == 115 || code == 122){
        isEventExecutedVideo = false;
        stopVideoOnChange(e, isEventExecutedVideo);
      }
    });
  }

  if(countPress > 1){
    stopVideo();
    countPress = 0;
    console.log("stop recording video");
  }

  function startVideo(){
    console.log('starting-video');
    backAnimation();
    $('#camera-preview').hide();
    $('.screenshot .canvas-view').hide();
    $(canvas).hide();
    recordingFeedback();

    $('body').attr('data-videorecording', 'yes');

    // Initialise getUserMedia
    navigator.getMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.getMedia(
      {
        video: true,
        audio: false
      },
      function (stream) {
        // get user media pour le son
        mediaStream = stream;
        recordVideo = RecordRTC(stream, {
          type: 'video',
          video: { width: dodoc.captureVideoWidth, height: dodoc.captureVideoHeight },
          canvas: { width: dodoc.captureVideoWidth, height: dodoc.captureVideoHeight },
        });
        recordVideo.startRecording();
        cameraPreview.src = window.URL.createObjectURL(stream);
        cameraPreview.play();
        cameraPreview.muted = true;
        cameraPreview.controls = true;
      },
      function(error) {
        alert(JSON.stringify(error));
      }
    );

    startVideoRecording.disabled = true;
    stopVideoRecording.disabled = false;
    startVideoRecording.style.display = "none";
    stopVideoRecording.style.display = "block";
  }

  function stopVideoOnChange(e) {
    if(isEventExecutedVideo == false){
      isEventExecutedVideo = true;
      console.log('your video was not saved');
      recordVideo.stopRecording();
      e.preventDefault();
      startVideoRecording.style.display = "block";
      stopVideoRecording.style.display = "none";
      startVideoRecording.disabled = false;
      stopVideoRecording.disabled = true;
      $(".recording-feedback").remove();
      countPress = 0;
      $('body').attr('data-videorecording', '');
    }
  }

  function recordingFeedback(){
    var htmlToAppend = "<div class='recording-feedback'><div class='record-feedback'></div><div class='time-feedback'>[REC] <time>00:00:00</time></div></div>";
    $(".video-view").append(htmlToAppend);
    var counter_text = $(".time-feedback time")[0];
    var seconds = 0, minutes = 0, hours = 0,
    t;
    timer();

    function add() {
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
          minutes = 0;
          hours++;
        }
      }
      counter_text.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);

      timer();
    }

    function timer() {
      t = setTimeout(add, 1000);
    }
  }

  function stopVideo(){
    $('.video-capture').hide();
    startVideoRecording.disabled = false;
    stopVideoRecording.disabled = true;
    startVideoRecording.style.display = "block";
    stopVideoRecording.style.display = "none";
    cameraPreview.style.display = "block";
    $('body').attr('data-videorecording', '');
    $(".recording-feedback").remove();
    // stop video recorder
    recordVideo.stopRecording(function() {
      // get video data-URL
      recordVideo.getDataURL(function(videoDataURL) {

//             type: recordVideo.getBlob().type || 'video/webm',
        var mediaData =
        {
          "mediaType" : "video",
          "mediaData" : videoDataURL
        };
        // send instruction to record video
        sendData.createNewMedia( mediaData);

        if (mediaStream) mediaStream.stop();
      });
      cameraPreview.src = '';
      cameraPreview.poster = 'https://localhost:8080/loading.gif';
      saveFeedback("/images/icone-dodoc_video.png");
    });
  }

}
