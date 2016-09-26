

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




/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('mediaCreated', onMediaCreated);
socket.on('stopMotionDirectoryCreated', function(d) { stopMotionMode.onStopMotionDirectoryCreated(d); });
socket.on('newStopmotionImage', function(d) { stopMotionMode.onNewStopmotionImage(d); });

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
    changeMediaMode( newMode);
  });

  /******************************************************/
  boitierExterne.init();

  currentStream.init()
    .then( function() {
      // detect last selected mode
      var lastMode = store.get('lastMode');
      if(lastMode === undefined){ lastMode = 'photo'; }
      $('.js--modeSelector[data-mediatype="' + lastMode + '"]').trigger( 'click');

    }, function(err) {
      console.log("failed to init : " + err);
    });

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

  if( mediaJustCaptured())
    return;

  $('.js--modeSelector')
    .removeClass('is--active')
    .filter(function(){
      return $(this).attr('data-mediatype') == newMode;
    })
      .addClass('is--active')
    .end()
  ;

  backAnimation();

  console.log('A new mode has been selected : ' + newMode);
  store.set('lastMode', newMode);

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

  currentStream.startCameraFeed().then( function() {
    $(".image-choice").fadeOut('slow');
    imageMode.init();

  }, function(err) {
    console.log( "Failed to start camera feed for photo : " + err);
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

  currentStream.startAudioFeed().then( function( stream) {

    $(".audio-choice").fadeOut('slow');
    audioMode.init( stream);

  }, function(err) {
    console.log( "Failed to start audio feed for audio : " + err);
  });
}

var currentStream = (function(context) {
  // using https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
  // to select audio/video source
  var $settingsPane = $('.feedSettings');
  var $settingsButton = $('.js--settings');

  var videoElement = document.querySelector('#video');
  var videoStream, audioStream;

  var audioInputSelect = document.querySelector('.js--audioSource');
  var audioOutputSelect = document.querySelector('.js--audioOutput');
  var videoSelect = document.querySelector('.js--videoSource');
  var selectors = [audioInputSelect, audioOutputSelect, videoSelect];

  var videoResSwitches = document.querySelector('.js--resolutionSelector').videoRes;

  var recordVideoFeed;
  var recordAudioFeed;

  var userSelectedVideoDevice = 'selectedVideoDeviceId';
  var userSelectedAudioDevice = 'selectedAudioDeviceId';
  var userSelectedRes = 'selectedVideoRes';

  var currentFeedsSource;


  function gotDevices(deviceInfos) {
    // Handles being called several times to update labels. Preserve values.
    var values = selectors.map(function(select) {
      return select.value;
    });
    selectors.forEach(function(select) {
      while (select.firstChild) {
        select.removeChild(select.firstChild);
      }
    });
    var previousVideoDeviceId = store.get(userSelectedVideoDevice);
    var previousAudioDeviceId = store.get(userSelectedAudioDevice);

    for (var i = 0; i !== deviceInfos.length; ++i) {
      var deviceInfo = deviceInfos[i];
      var deviceId = deviceInfo.deviceId;
      var option = document.createElement('option');
      option.value = deviceId;
      if( deviceId === previousVideoDeviceId || deviceId === previousAudioDeviceId)
        option.selected = true;
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label || 'microphone ' + (audioInputSelect.length + 1);
        audioInputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'audiooutput') {
        option.text = deviceInfo.label || 'speaker ' + (audioOutputSelect.length + 1);
        audioOutputSelect.appendChild(option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
        videoSelect.appendChild(option);
      } else {
        console.log('Some other kind of source/device: ', deviceInfo);
      }
    }
    selectors.forEach(function(select, selectorIndex) {
      if (Array.prototype.slice.call(select.childNodes).some(function(n) {
        return n.value === values[selectorIndex];
      })) {
        select.value = values[selectorIndex];
      }
    });

  }
  function errorCallback(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  function getVideoResFromRadio() {
    for (index=0; index < videoResSwitches.length; index++) {
      if (videoResSwitches[index].checked) {
        return videoResSwitches[index].dataset;
      }
    }
  }
  function setVideoResFromLocalstorage() {
    console.log( userSelectedRes);
    var getPreviousSessionRes = store.get(userSelectedRes);
    if(getPreviousSessionRes !== undefined) {
      for (index=0; index < videoResSwitches.length; index++) {
        if( getPreviousSessionRes.width === videoResSwitches[index].dataset.width && getPreviousSessionRes.height === videoResSwitches[index].dataset.height) {
          videoResSwitches[index].checked = true;
        } else {
          videoResSwitches[index].checked = false;
        }
      }
    }
  }

  // Attach audio output device to video element using device/sink ID.
  function attachSinkId(element, sinkId) {
    if (typeof element.sinkId !== 'undefined') {
      element.setSinkId(sinkId)
      .then(function() {
        console.log('Success, audio output device attached: ' + sinkId);
      })
      .catch(function(error) {
        var errorMessage = error;
        if (error.name === 'SecurityError') {
          errorMessage = 'You need to use HTTPS for selecting audio output ' +
              'device: ' + error;
        }
        console.error(errorMessage);
        // Jump back to first output device in the list as it's the default.
        audioOutputSelect.selectedIndex = 0;
      });
    } else {
      console.warn('Browser does not support output device selection.');
    }
  }

  function changeAudioDestination() {
    var audioDestination = audioOutputSelect.value;
    attachSinkId(videoElement, audioDestination);
  }

  function setSources() {

    console.log( 'setting new sources for audio and video feeds');
    var audioSource = audioInputSelect.value;
    var videoSource = videoSelect.value;

    // set source in localstorage for next time
    store.set(userSelectedVideoDevice, videoSource);
    store.set(userSelectedAudioDevice, audioSource);

    var requestedVideoRes = getVideoResFromRadio();
    store.set(userSelectedRes, requestedVideoRes);

    currentFeedsSource = {
      audio: {
        optional: [ audioSource ? {sourceId: audioSource} : undefined ],
      },
      video: {
        optional: [ videoSource ? {sourceId: videoSource} : undefined],
        mandatory: {
          minWidth: requestedVideoRes.width,
          minHeight: requestedVideoRes.height
        }
      }
    };

    // restart the mode (should be cleaner)
    $('.js--modeSelector').filter('.is--active').trigger('click');

  }

  function getCameraFeed() {
    return new Promise(function(resolve, reject) {
      console.log( "Getting camera feed");

      if( currentFeedsSource === undefined || currentFeedsSource.video === undefined) {
        reject("Camera not yet ready");
      }
      navigator.getUserMedia(
        {
          video: currentFeedsSource.video,
          audio: false
        },
        function (stream) {
          resolve( stream);
        },
        function(err) {
          alert( dodoc.lang.videoStreamCouldntBeStartedTryChangingRes + '\n\n error: ' + JSON.stringify(err));
        }
      );
    });
  }

  function getAudioFeed() {
    return new Promise(function(resolve, reject) {

      if( currentFeedsSource === undefined || currentFeedsSource.audio === undefined) {
        reject("audio devices not yet ready");
      }

      console.log( "Getting audio feed");

      navigator.getUserMedia(
        {
          video: false,
          audio: currentFeedsSource.audio
        },
        function (stream) {
          resolve(stream);
        },
        function(err) {
          alert( dodoc.lang.audioStreamCouldntBeStarted + '\n\n error: ' + JSON.stringify(err));
        }
      );
    });
  }

  // déclaration des fonctions accessibles de l'extérieur ici
  return {

    init : function() {

      $settingsButton.click(function() {
        $(document).trigger('toggle_settings_pane');
      });

      $(document)
        .on( 'toggle_settings_pane', function() {
          $settingsPane.toggleClass('is--open');
        })
        .on( 'open_settings_pane', function() {
          $settingsPane.addClass('is--open');
        })
        .on( 'close_settings_pane', function() {
          $settingsPane.removeClass('is--open');
        })
        ;

      setVideoResFromLocalstorage();

      if( store.get(userSelectedVideoDevice) === undefined)
        $(document).trigger('open_settings_pane');

      return new Promise(function(resolve, reject) {
        navigator.mediaDevices.enumerateDevices()
          .then(function(deviceInfos) {
            gotDevices(deviceInfos);
            setSources();
            audioInputSelect.onchange = setSources;
            audioOutputSelect.onchange = changeAudioDestination;
            videoSelect.onchange = setSources;
            $(videoResSwitches).change(setSources);
            resolve();
          }, function(err) {
            reject("Failed to init stream : " + err);
          });
      });
    },

    getVideoFrame : function() {
      return videoElement;
    },

    getStaticImageFromVideo : function() {
      var videoFrame = currentStream.getVideoFrame();

      var invisibleCanvas = document.createElement('canvas');
      invisibleCanvas.width = videoFrame.videoWidth;
      invisibleCanvas.height = videoFrame.videoHeight;
      var invisibleCtx = invisibleCanvas.getContext('2d');
      invisibleCtx.drawImage( videoFrame, 0, 0, invisibleCanvas.width, invisibleCanvas.height);

      return imageData = invisibleCanvas.toDataURL('image/png');
    },

    stopAllFeeds : function() {
      if( !videoElement.paused)
        videoElement.pause();

      if(videoStream) videoStream.getTracks().forEach(function(track) {
        track.stop();
      });
      if(audioStream) audioStream.getTracks().forEach(function(track) {
        track.stop();
      });

      imageMode.stop();
      videoMode.stop();
      stopMotionMode.stop();
      audioMode.stop();
    },

    startCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        currentStream.stopAllFeeds();
        getCameraFeed()
          .then( function( stream) {
            videoStream = stream;
            if (navigator.mozGetUserMedia) {
              videoElement.mozSrcObject = stream;
            } else {
              var vendorURL = window.URL || window.webkitURL;
              videoElement.src = vendorURL.createObjectURL(stream);
            }
            videoElement.play();
            resolve();
          }, function(err) {
            console.log( " failed to start camera feed: " + err);
            reject();
          });
      });
    },

    startRecordCameraFeed : function() {
      return new Promise(function(resolve, reject) {
        getCameraFeed()
          .then( function( stream) {
            var requestedVideoRes = getVideoResFromRadio();
            recordVideoFeed = RecordRTC(stream, {
              type: 'video',
              canvas: { width: requestedVideoRes.width, height: requestedVideoRes.height },
            });
            recordVideoFeed.startRecording();
            resolve();
          }, function(err) {
            console.log( " failed to start camera feed: " + err);
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
        currentStream.stopAllFeeds();
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



// EVENT: a new media has been created (could be one from the current client or one from another user
function onMediaCreated( mediasData){

  var mediaData = getFirstMediaFromObj( mediasData);

  // check if media created belongs to the same project
  if( mediaData.slugFolderName !== currentFolder || mediaData.slugProjectName !== currentProject)
    return;

  // check if media created is of the same type as the current mode (otherwise this probably means that someone else is also capturing at the same time
  var currentMode = $(document).data('currentMode');
  if( mediaData.type !== currentMode)
    return;

  // check if the media was created by the current user
  if(mediaData.author !== sessionId)
    return;

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
    imageMode.showImagePreview( pathToMediaFile + '.png');
    animateWindows();
  }
  else if( newMediaType === 'video') {
    videoMode.showVideoPreview( pathToMediaFile + dodoc.videoext);
    animateWindows();
  }
  else if( newMediaType === 'animation') {
    stopMotionMode.showStopMotionPreview( pathToMediaFile + dodoc.stopMotionext);
    animateWindows();
  }
  else if( newMediaType === 'audio') {
    audioMode.showAudioPreview( pathToMediaFile + '.wav', pathToMediaFile + '.png');
    animateWindows();
  }

}


//animation des fenêtres à la capture
function animateWindows(){
  $(document).trigger('close_settings_pane');
	$('body').attr('data-state', 'expanded');
/*
	if(!$('.captureRight').hasClass('active')){
		$(".captureRight").css('display', 'block').addClass('active');
    $('.captureLeft').velocity({'left':'5%'}, 'slow');
    $('.captureRight').velocity({'left':'57%'}, 'slow');
	}
*/
}

//fenêtre de preview retourne au center
function backAnimation(){
	$('body').attr('data-state', '');
/*
  if($(".captureRight").hasClass('active')){
    $('.captureLeft').velocity({'left':'25%'}, 'slow');
    $('.captureRight').removeClass('active').velocity({'left':'25%'}, 500,function(){
//       $(this).fadeOut('slow');
    });
  }
*/
}

function justCaptured() {
  // passer le body en "data-justcaptured=yes" pendant un temps
  $('body').attr('data-justcaptured', 'yes');
  setTimeout( function() {
    $('body').attr('data-justcaptured', '');
  }, 100);
}

function mediaJustCaptured() {
  return $('body').attr('data-justcaptured') === 'yes';
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



