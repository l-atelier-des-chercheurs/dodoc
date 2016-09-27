/*************

  should rewrite each mode as a single var with functions...

  **************/

var videoMode = (function() {

  // private vars and functions
  var $preview = $(".preview_video");
  var isRunning = false;
  var isRecording = false;

  // Function qui enregistre de la vidéo
  var $startVideoRecording = $('#start-record-btn');
  var $stopVideoRecording = $('#stop-record-btn');

  function startVideo(){

    if( mediaJustCaptured())
      return;

    backAnimation();
    recordingFeedback();

    $('body').attr('data-videorecording', 'yes');
    isRecording = true;

    currentStream.startRecordCameraFeed();

    $startVideoRecording.attr('disabled', true).hide();
    $stopVideoRecording.attr('disabled', false).show();

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

  function stopRecordVideo(){

    $startVideoRecording.attr('disabled', false).show();
    $stopVideoRecording.attr('disabled', true).hide();

    $('body').attr('data-videorecording', '');
    isRecording = false;
    $(".recording-feedback").remove();

    currentStream.stopRecordCameraFeed().then(function( videoDataURL) {
      var mediaData =
      {
        "mediaType" : "video",
        "mediaData" : videoDataURL
      };
      // send instruction to record video
      sendData.createNewMedia( mediaData);
      $preview.find('video').src = '';
      $preview.find('video').poster = 'https://localhost:8080/loading.gif';
      saveFeedback("/images/icone-dodoc_video.png");
    }, function() {
      console.log("Failed stopping the recording of a video.");
    });

    justCaptured();

  }


  // public functions
  return {

    init : function() {
      isRunning = true;
      $preview.find('.js--delete-media-capture').hide();
      $startVideoRecording.off().on('click', this.startRecord);
      $stopVideoRecording.off().on('click', this.stopRecord);
    },

    startRecord : function() {
      startVideo();
    },
    stopRecord: function() {
      stopRecordVideo();
    },

    stop : function() {
      isRunning = false;
    },

    showVideoPreview : function( pathToMediaFile) {
      $preview.find('video').attr('src', pathToMediaFile);
      $preview.find('.js--delete-media-capture').show();
    },

    isRunning: function() {
      return isRunning;
    },
    captureButtonPress: function() {
      if(!isRunning) return;
      if(isRecording) stopRecordVideo();
      else startVideo();
    }

  }

})();



