/*************

  should rewrite each mode as a single var with functions...

  **************/

var videoMode = (function() {

  // private vars and functions
  var $preview = $(".preview_video");

  // Function qui enregistre de la vidéo
  function recordingVideo(){
    var startVideoRecording = document.getElementById('start-record-btn');
    var stopVideoRecording = document.getElementById('stop-record-btn');

    $("#start-record-btn").off().on('click', function(){
      console.log("you are using the mouse for recording");
      startVideo();
    });

    $("#stop-record-btn").off().on('click', function(){
      stopVideo();
    });

    function startVideo(){
      if( mediaJustCaptured())
        return;

      console.log('starting-video');
      backAnimation();
      recordingFeedback();


      $('body').attr('data-videorecording', 'yes');

      currentStream.startRecordCameraFeed();

      startVideoRecording.disabled = true;
      stopVideoRecording.disabled = false;
      startVideoRecording.style.display = "none";
      stopVideoRecording.style.display = "block";
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

      startVideoRecording.disabled = false;
      stopVideoRecording.disabled = true;
      startVideoRecording.style.display = "block";
      stopVideoRecording.style.display = "none";
      $('body').attr('data-videorecording', '');
      $(".recording-feedback").remove();
      // stop video recorder

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

  }


  // public functions
  return {

    init : function() {
      recordingVideo();
      $preview.find('.js--delete-media-capture').hide();
    },


    stop : function() {

    },

    showVideoPreview : function( pathToMediaFile) {
      $preview.find('video').attr('src', pathToMediaFile);
      $preview.find('.js--delete-media-capture').show();
    },


  }

})();



