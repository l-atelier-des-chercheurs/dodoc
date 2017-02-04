var videoMode = (function() {

  // private vars and functions
  var $preview = $(".preview_video");
  var isRunning = false;
  var isRecording = false;

  // Function qui enregistre de la vidéo
  var $startVideoRecording = $('#start-record-btn');
  var $stopVideoRecording = $('#stop-record-btn');
  var $enableAudioInVideo = $(".video-capture .js--enableAudioInVideo");
  var $btn_deleteLastMedia = $preview.find(".js--delete-media-capture");


  // public functions
  var API = {
    init : function() {
      isRunning = true;
      _clearPreview();
      $startVideoRecording.off().on('click', this.startRecord);
      $stopVideoRecording.off().on('click', this.stopRecord);

      $btn_deleteLastMedia.hide().off().click(function(){
        var mediaToDelete = {
          "mediaName" : $(document).data('lastCapturedMediaName'),
          "mediaFolderPath" : $(document).data('lastCapturedMediaFolderPath'),
        }
        sendData.deleteMedia(mediaToDelete);
        backAnimation();
        _clearPreview();
      });
    },

    startRecord : function() {
      _startRecordVideo();
    },
    stopRecord: function() {
      _stopRecordVideo();
    },

    stop : function() {
      _clearPreview();
      isRunning = false;
    },

    showVideoPreview : function( pathToMediaFile) {
      $preview.find('video').attr('src', pathToMediaFile);
      $preview.find('.js--delete-media-capture').show();
    },

    isRunning: function() {
      return isRunning;
    },
    isRecording: function() {
      return isRecording;
    },
    captureButtonPress: function() {
      if(!isRunning) return;
      if(isRecording) _stopRecordVideo();
      else _startRecordVideo();
    }
  }

  function _startRecordVideo(){

    if( mediaJustCaptured())
      return;

    _clearPreview();

    var withAudio = $enableAudioInVideo.is(':checked')

    currentStream.startRecordCameraFeed(withAudio)
    .then(function() {
      backAnimation();
      recordingFeedback();

      $('body').attr('data-videorecording', 'yes');
      isRecording = true;

      $startVideoRecording.attr('disabled', true).hide();
      $stopVideoRecording.attr('disabled', false).show();

    }, function(err) {
      console.log('err ' + err);
      alertify.error( dodoc.lang().videoStreamNotAvailable + '<br><em>' + JSON.stringify(err) + '</em>');
    });
  }

  function recordingFeedback(){
    var htmlToAppend = "<div class='recording-feedback'><div class='record-feedback'></div><div class='time-feedback'>[REC] <time>00:00:00</time></div></div>";
    $(".video-view").append(htmlToAppend);
    var counter_text = $(".time-feedback time")[0];
    var seconds = 0, minutes = 0, hours = 0, t;
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

  function _stopRecordVideo(){

    $startVideoRecording.attr('disabled', false).show();
    $stopVideoRecording.attr('disabled', true).hide();

    $('body').attr('data-videorecording', '');
    isRecording = false;
    $(".recording-feedback").remove();

    currentStream.stopRecordCameraFeed().then(function(videoDataURL) {
      var mediaData = {
        "mediaType" : "video",
        "mediaData" : {
          "videoData" : videoDataURL,
        }
      };
      // send instruction to record video
      sendData.createNewMedia( mediaData);
      $preview.find('video').src = '';
      saveFeedback("/images/i_icone-dodoc_video.svg");
    }, function() {
      console.log("Failed stopping the recording of a video.");
    });

    justCaptured();

  }

  function _clearPreview() {
    $preview.find('video').attr('src', '');
    $preview.find('.js--delete-media-capture').hide();
  }


  return API;

})();



