

/* VARIABLES */
var socket = io.connect();



/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


// Variables pour la prise de médias
var streaming = false,
//     canvas       = document.querySelector('#canvas'),
    photo        = document.querySelector('#photo'),
    startbutton  = document.querySelector('#capture-btn'),
    width = dodoc.captureVideoWidth,
    height = dodoc.captureVideoHeight;
var mediaStream = null;

//Event variables for recording
var isEventExecutedVideo = false;
var isEventExecutedVideoBtn = false;
var isEventExecutedAudio = false;
var isEventExecutedEqualizer = false;

//compteur d'image pour le stop motion
var countImage = 0;
//compteur de clicks pour le stopmotion
var countPress = 0;
//compteur de click général
var countClick = 0;
//compteur pour l'equalizer
var countEqualizer = 0;

var sarahCouleur = "gray";


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('mediaCreated', onMediaCreated);
socket.on('stopMotionDirectoryCreated', function(d) { stopMotionMode.onStopMotionDirectoryCreated( d); });
socket.on('newStopmotionImage', function(d) { stopMotionMode.onNewStopmotionImage( d); });

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){

  setTimeout(function(){
    $(".image-choice").fadeOut();
  }, 2000);


	//Quand on change de media
  // au click
  $('.js--modeSelector').on('click', function(){
    var newMode = $(this).attr('data-mediatype');
    $('.js--modeSelector').removeClass('is--active');
    $(this).addClass('is--active');
    changeMediaMode( newMode);
    backAnimation();
  });
  $('.js--modeSelector[data-mediatype="photo"]').trigger( 'click');

  // delete file
  $('body').on('click', '.js--delete-media-capture', function(){
    var mediaToDelete =
    {
      "mediaName" : $(document).data('lastCapturedMediaName'),
      "mediaFolderPath" : $(document).data('lastCapturedMediaFolderPath'),
    }
    sendData.deleteMedia( mediaToDelete);
    backAnimation();

  });


  fullscreen();

}

function changeMediaMode( newMode) {

  console.log('A new mode has been selected : ' + newMode);
  switch( newMode){
    case 'photo':
      photoDisplay();
      break;
    case 'video':
      videoDisplay();
      break;
    case 'stopmotion':
      stopMotionDisplay();
      break;
    case 'audio':
      audioDisplay();
      break;
  }

}


// REMOVED
// should reimplement better
function changeMediaBoitier(e){
  var code = e.keyCode || e.which;
  var $activeButton = $(".btn-choice").find('.active');
  var thisId;

/*
  if($('body').hasClass('takingstopmotion') && (code == 115 || code == 122)){
    if(code == 115){
      var $nextButton = $activeButton.next();
      thisId = $nextButton.attr('id');
    }

    if(code == 122){
      var $prevButton = $activeButton.prev();
      thisId = $prevButton.attr('id');
    }
    $('#modal-change-alert').foundation('reveal', 'open');
    $('#modal-change-alert .supprimer-stop-motion').attr('data-choice', thisId);
  }

  else{
*/
    if(code == 115) { // Z keypress
      var $nextButton = $activeButton.next();
      $activeButton.removeClass('active');
      if ($nextButton.length){
        $nextButton.addClass('active');
      }
      else{
        $nextButton = $(".btn-choice button").first().addClass('active');
      }
    }
    if(code == 122) { // S keypress
      var $prevButton = $activeButton.prev();
      $activeButton.removeClass('active');
      if ($prevButton.length){
        $prevButton.addClass('active');
      }
      else{
        $prevButton = $(".btn-choice button").last().addClass('active');
        $activeButton.removeClass('active');
      }
    }
    if(code == 115 || code == 122){
      if($('.screenshot .count-image')){
        $('.screenshot .count-image').remove();
      }
      backAnimation();

      if($("#photo").hasClass('active')){
        photoDisplay();
      }
      if($("#video-btn").hasClass('active')){
        videoDisplay();
      }
      if($("#stopmotion").hasClass('active')){
        stopMotionDisplay();
      }
      if($("#audio").hasClass('active')){
        audioDisplay();
      }
    }
//   }
}




function photoDisplay(){
  $(document)
    .data('currentMode', 'photo')

  $(".preview_image").show();
  $(".preview_video").hide();
  $(".preview_stopmotion").hide();
  $(".preview_audio").hide();

  $('.photo-capture').fadeIn(1000);
  $('.video-capture').hide();
  $('.stopmotion-capture').hide();
  $('.audio-capture').hide();

  $('#video').show();
  $('#canvas-audio').hide();
  $(".image-choice").show();
  $("body").attr("data-mode", "photo");

  currentStream.stopAllFeeds();
  currentStream.startCameraFeed().then( function() {
    $(".image-choice").fadeOut('slow');
    imageMode.init();

  }, function() {
    console.log( "Failed to start camera feed for photo");
  });
}
function videoDisplay(){
  $(document)
    .data('currentMode', 'video')

  $(".preview_image").hide();
  $(".preview_video").show();
  $(".preview_stopmotion").hide();
  $(".preview_audio").hide();

  $('.stopmotion-capture').css('display','none');
  $('.video-capture').fadeIn(1000);
  $('.audio-capture').css('display','none');
  $('.photo-capture').css('display', 'none');

  $('#video').show();
  $('#canvas-audio').hide();
  $(".video-choice").show();
  $("body").attr("data-mode", "video");

  currentStream.stopAllFeeds();
  currentStream.startCameraFeed().then( function() {

    $(".video-choice").fadeOut('slow');
    videoMode.init();

  }, function() {
    console.log( "Failed to start camera feed for video");
  });

}
function stopMotionDisplay(){
  $(document)
    .data('currentMode', 'animation')

  $(".preview_image").hide();
  $(".preview_video").hide();
  $(".preview_stopmotion").hide();
  $(".preview_audio").hide();

  $('.photo-capture').css('display', 'none');
  $('.video-capture').css('display','none');
  $('.stopmotion-capture').fadeIn(2000);
  $('.audio-capture').css('display','none');

  $('#video').show();
  $(".stopmotion-choice").show();
  $('#canvas-audio').hide();
  $("body").attr("data-mode", "stopmotion");


  currentStream.stopAllFeeds();
  currentStream.startCameraFeed().then( function() {

    $(".stopmotion-choice").fadeOut('slow');
    stopMotionMode.init();

  }, function() {
    console.log( "Failed to start camera feed for stop-motion");
  });
}
function audioDisplay(){
  $(document)
    .data('currentMode', 'audio')

  $(".preview_image").hide();
  $(".preview_video").hide();
  $(".preview_stopmotion").hide();
  $(".preview_audio").show();

  $('.photo-capture').css('display', 'none');
  $('.video-capture').css('display','none');
  $('.stopmotion-capture').css('display','none');
  $('.audio-capture').fadeIn(2000);

  $('#video').hide();
  $('#canvas-audio').show();

  $(".audio-choice").show();
  $("body").attr("data-mode", "audio");

  currentStream.stopAllFeeds();
  currentStream.startAudioFeed().then( function( stream) {

    $(".audio-choice").fadeOut('slow');
    audioMode.init( stream);

  }, function() {
    console.log( "Failed to start audio feed for audio");
  });
}

var currentStream = (function() {

  // déclaration des variables privées ici
  var videoFeed_preview = $("#video").get(0);

  var videoStream, audioStream;

  var recordVideoFeed;
  var recordAudioFeed;

  // get camera feed (private)
  function getCameraFeed() {
    return new Promise(function(resolve, reject) {
      console.log( "Getting camera feed");
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
          console.log("Media devices : ");
          devices.forEach(function(device) {
            console.log( " " + device.kind + " = " + device.label + " id = " + device.deviceId);
            if(device.kind === 'videoinput') {
              mediaDevices.push(device);
            }
          });
        })
        .then(function(){
          var deviceChoiceId;
          if( mediaDevices.length === 0) {
            reject( 'No videoinput found.');
          } else
          if(mediaDevices.length < 2) {
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
              resolve( stream);
            },
            function(err) {
              alert(JSON.stringify(err));
            }
          );
        })
        .catch(function(err) {
          console.log(err.name + ": " + err.message);
        })
        ;

  /*
      navigator.getUserMedia(
        {
          video: true ,
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
  */
    });
  }

  function getAudioFeed() {
    return new Promise(function(resolve, reject) {

      console.log( "Getting audio feed");
      navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        console.log("enumerateDevices() not supported.");
        return;
      }

      // List cameras and microphones.
      var mediaDevices = [];
      navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
          console.log("Media devices : ");
          devices.forEach(function(device) {
            console.log( " " + device.kind + " = " + device.label + " id = " + device.deviceId);
            if(device.kind === 'audioinput') {
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
              video: false,
              audio: true
            },
            function (stream) {
              resolve( stream);
            },
            function(err) {
              alert(JSON.stringify(error));
            }
          );
        })
        .catch(function(err) {
          reject(err.name + ": " + error.message);
        })
        ;

    });
  }

  // déclaration des fonctions accessibles de l'extérieur ici
  return {

    getVideoFrame : function() {
      return videoFeed_preview;
    },

    stopAllFeeds : function() {
      if( !videoFeed_preview.paused)
        videoFeed_preview.pause();

      if(videoStream) videoStream.stop();
      if(audioStream) audioStream.stop();

      audioMode.stop();

    },

    startCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        getCameraFeed()
          .then( function( stream) {

            videoStream = stream;

            if (navigator.mozGetUserMedia) {
              videoFeed_preview.mozSrcObject = stream;
            } else {
              var vendorURL = window.URL || window.webkitURL;
              videoFeed_preview.src = vendorURL.createObjectURL(stream);
            }
            videoFeed_preview.play();
            resolve();
          }, function() {
            console.log( " failed to get camera feed");
            reject();
          })
          ;
      });
    },

    startRecordCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        getCameraFeed()
          .then( function( stream) {
            recordVideoFeed = RecordRTC(stream, {
              type: 'video',
              video: { width: dodoc.captureVideoWidth, height: dodoc.captureVideoHeight },
              canvas: { width: dodoc.captureVideoWidth, height: dodoc.captureVideoHeight },
            });
            recordVideoFeed.startRecording();
            resolve();
          }, function() {
            console.log( " failed to get camera feed");
            reject();
          });
          ;
      });
    },

    stopRecordCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        if( recordVideoFeed !== undefined) {
          recordVideoFeed.stopRecording(function() {
            recordVideoFeed.getDataURL(function(videoDataURL) {
              resolve( videoDataURL);
            });
          });
        }
      });
    },

    getAudioStream : function() {
      return ;
    },

    startAudioFeed : function() {
      return new Promise(function(resolve, reject) {
        getAudioFeed()
          .then( function( stream) {
            audioStream = stream;
            resolve( stream);
          }, function() {
            console.log( " failed to get audio feed");
            reject();
          })
          ;
      });
    },

    startRecordAudioFeed : function() {
      return new Promise(function(resolve, reject) {
        getAudioFeed()
          .then( function( stream) {
            recordAudioFeed = RecordRTC(stream, {
              type: 'audio'
            });
            recordAudioFeed.startRecording();
            resolve();
          }, function() {
            console.log( " failed to start audio recording");
            reject();
          })
          ;
      });
    },

    stopRecordAudioFeed : function() {
      return new Promise(function(resolve, reject) {
        if( recordAudioFeed !== undefined) {
          recordAudioFeed.stopRecording(function(url) {
            recordAudioFeed.getDataURL(function(audioDataURL) {
      //             type: recordVideo.getBlob().type || 'video/webm',
              // send instruction to record video
              resolve( audioDataURL);
            });
          });
        }
      });
    },

  }








})();




function onMediaCreated( mediasData){

  var mediaData = getFirstMediaFromObj( mediasData);

  // check if media created belongs to the same project
  if( mediaData.slugFolderName !== currentFolder || mediaData.slugProjectName !== currentProject)
    return;

  // check if media created is of the same type as the current mode (otherwise this probably means that someone else is also capturing at the same time
  var currentMode = $(document).data('currentMode');
  if( mediaData.type !== currentMode)
    return;

  // ideally, we should also check the user who created that media and check it against a client variable, however I like the idea that another user can also see what the other is doing
  var newMediaType = mediaData.type;
  var mediaName = mediaData.mediaName;

  var projectPath = getProjectPath( currentFolder, currentProject);
  var mediasFolderPath = getMediaFolderPathByType( newMediaType);

  var pathToMediaFile = '/' + getPathToMediaFile( projectPath, mediasFolderPath, mediaName);

  var cameraPreview = document.getElementById('video-stream');

  $(document)
    .data('lastCapturedMediaName', mediaName)
    .data('lastCapturedMediaFolderPath', mediasFolderPath)
    ;

  if( newMediaType === 'photo') {
    imageMode.showImagePreview( pathToMediaFile + '.jpg');
    animateWindows();
  }
  else if( newMediaType === 'video') {
    videoMode.showVideoPreview( pathToMediaFile + '.webm');
    animateWindows();
  }
  else if( newMediaType === 'animation') {
    stopMotionMode.showStopMotionPreview( pathToMediaFile + '.mp4');
    animateWindows();
  }
  else if( newMediaType === 'audio') {
    audioMode.showAudioPreview( pathToMediaFile + '.wav', pathToMediaFile + '.png');
    animateWindows();
  }

}


//animation des fenêtres à la capture
function animateWindows(){
	if(!$('.captureRight').hasClass('active')){
		$(".captureRight").css('display', 'block').addClass('active');
    $('.captureLeft').velocity({'left':'5%'}, 'slow');
    $('.captureRight').velocity({'left':'57%'}, 'slow');
	}
}

//fenêtre de preview retourne au center
function backAnimation(){
  if($(".captureRight").hasClass('active')){
    $('.captureLeft').velocity({'left':'25%'}, 'slow');
    $('.captureRight').removeClass('active').velocity({'left':'25%'}, 500,function(){
//       $(this).fadeOut('slow');
    });
  }
}

function saveFeedback(icone){

  var $iconeFeedback = $("<div class='icone-feedback'><img src='"+icone+"'></div>");
  $("body").append( $iconeFeedback );
  setTimeout(function(){
    $iconeFeedback.fadeIn('slow').velocity({"top":"25px", "left":$(window).width() - 50, "width":"20px"},1000, "ease", function(){
      $(this).fadeOut('slow', function(){
        $(this).remove();
        $(".count-add-media.plus-media").fadeIn('slow', function(){
          $(this).fadeOut('slow');
        });
      });
    });
  }, 500);
}

function fullscreen(){
  var target = $('.captureLeft')[0]; // Get DOM element from jQuery collection
  $('.js--goFullscreen').on('click', function(){
    if (screenfull.enabled) {
      screenfull.request(target);
    }
  });
  $('.js--leaveFullscreen').on('click', function(){
    screenfull.exit();
  });

  if (screenfull.enabled) {
      document.addEventListener(screenfull.raw.fullscreenchange, function () {
          if( screenfull.isFullscreen)
            $('body').addClass('is--fullscreen');
          else
            $('body').removeClass('is--fullscreen');
      });
  }
}



