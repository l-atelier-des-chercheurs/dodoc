

// if there’s not webrtc here (thanks Apple)
if(typeof navigator.getUserMedia !== 'function') {
  alert(dodoc.lang().browserCantUserWebRTC);
}

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

  // detect if iOS device

  setTimeout(function(){
    $(".image-choice").fadeOut();
  }, 2000);

	//Quand on change de media
  // au click
  $('.js--modeSelector').on('click', function(){
    var newMode = $(this).attr('data-mediatype');
    changeMediaMode(newMode);
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
  fullscreen();
}

function changeMediaMode( newMode) {

  if(mediaJustCaptured())
    return;

  if(stopMotionMode.isRecording()) {
    alertify
      .closeLogOnClick(true)
      .delay(4000)
      .error(dodoc.lang().aStopmotionIsRecordingFinishItFirst)
      ;
    return;
  }
  // check if a video is recording
  if(videoMode.isRecording()) {
    alertify
      .closeLogOnClick(true)
      .delay(4000)
      .error(dodoc.lang().aVideoIsRecordingFinishItFirst)
      ;
    return;
  }

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

  $('.js--videoContainer').show();
  $('#canvas-audio').hide();
  $(".image-choice").show();
  $("body").attr("data-mode", "photo");

  currentStream.startCameraFeed().then( function() {
    $(".image-choice").fadeOut('slow');
    imageMode.init();

  }, function(err) {
    alertify.error("Failed to start camera feed for photo mode: " + err);
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

  $('.js--videoContainer').show();
  $('#canvas-audio').hide();
  $(".video-choice").show();
  $("body").attr("data-mode", "video");

  currentStream.startCameraFeed().then( function() {
    $(".video-choice").fadeOut('slow');
    videoMode.init();
  }, function(err) {
    alertify.error( "Failed to start camera feed for video mode: " + err);
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

  $('.js--videoContainer').show();
  $(".stopmotion-choice").show();
  $('#canvas-audio').hide();
  $("body").attr("data-mode", "stopmotion");


  currentStream.startCameraFeed().then( function() {
    $(".stopmotion-choice").fadeOut('slow');
    stopMotionMode.init();
  }, function(err) {
    alertify.error( "Failed to start camera feed for stopmotion mode: " + err);
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

  $('.js--videoContainer').hide();
  $('#canvas-audio').show();

  $(".audio-choice").show();
  $("body").attr("data-mode", "audio");

  currentStream.startAudioFeed().then( function( stream) {

    $(".audio-choice").fadeOut('slow');
    audioMode.init( stream);

  }, function(err) {
    alertify.error( "Failed to start audio feed for audio mode: " + err);
  });
}

var currentStream = (function(context) {
  // using https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
  // to select audio/video source
  var $settingsPane = $('.feedSettings');
  var $settingsButton = $('.js--settings');

  var videoElement = document.querySelector('.js--videoContainer .js--videoFeed');
  var videoResolutionIndicator = document.querySelector('.js--currentStreamResolution');
  var videoStream, audioStream;

  var audioInputSelect = document.querySelector('.js--audioSource');
  var audioOutputSelect = document.querySelector('.js--audioOutput');
  var videoSelect = document.querySelector('.js--videoSource');
  var selectors = [audioInputSelect, audioOutputSelect, videoSelect];

  var videoResSwitches = document.querySelector('.js--resolutionSelector').videoRes;

  var customVideoResInput = document.querySelector('.js--customVideoResInput');
  var customVideoResSwitches = document.querySelectorAll('.js--inputCustomVideoRes');
  var setCustomVideoRes = document.querySelector('.js--setCustomVideoRes');

  var recordVideoFeed;
  var recordAudioFeed;

  var userSelectedVideoDevice = 'selectedVideoDeviceId';
  var userSelectedAudioDevice = 'selectedAudioDeviceId';
  var userSelectedRes = 'selectedVideoRes';

  var currentFeedsSource = {};

  var API = {
    init                    : function() { return init(); },
    getStaticImageFromVideo : function() { return getStaticImageFromVideo(); },
    startCameraFeed         : function() { return startCameraFeed(); },
    startRecordCameraFeed   : function(withAudio) { return startRecordCameraFeed(withAudio); },
    stopRecordCameraFeed    : function() { return stopRecordCameraFeed(); },
    startAudioFeed          : function() { return startAudioFeed(); },
    startRecordAudioFeed    : function() { return startRecordAudioFeed(); },
    stopRecordAudioFeed     : function() { return stopRecordAudioFeed(); }
  };

  function init() {
    return new Promise(function(resolve, reject) {
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

      videoElement.addEventListener('resize', updateVideoSize);

      $(setCustomVideoRes).on('click', function(){

        $(customVideoResSwitches).each(function() {
          var typeOfValueChanged = $(this).attr('name');
          var newValue = $(this).val();
          $(customVideoResInput).attr(typeOfValueChanged, newValue);
        })
        if( $(customVideoResInput).attr('data-width').length > 0 && $(customVideoResInput).attr('data-height').length > 0 ) {
          $(customVideoResInput).removeAttr('disabled');
          customVideoResInput.checked = true;
          $(videoResSwitches).trigger('change');
        }
        return false;
      });

      _setVideoResFromLocalstorage();

      if( store.get(userSelectedVideoDevice) === undefined)
        $(document).trigger('open_settings_pane');

      navigator.mediaDevices.enumerateDevices()
      .then(function(deviceInfos) {
        _gotDevices(deviceInfos);
        _setSources();
        audioInputSelect.onchange = _setSources;
        audioOutputSelect.onchange = _changeAudioDestination;
        videoSelect.onchange = _setSources;
        $(videoResSwitches).change(_setSources);
        resolve();
      }, function(err) {
        reject("Failed to init stream : " + err);
      });
    });
  }
  function getStaticImageFromVideo() {
    return new Promise(function(resolve, reject) {
      var invisibleCanvas = document.createElement('canvas');
      invisibleCanvas.width = videoElement.videoWidth;
      invisibleCanvas.height = videoElement.videoHeight;
      var invisibleCtx = invisibleCanvas.getContext('2d');
      invisibleCtx.drawImage( videoElement, 0, 0, invisibleCanvas.width, invisibleCanvas.height);
      var imageData = invisibleCanvas.toDataURL('image/png');
      if(imageData === "data:,")
        reject(dodoc.videoStreamNotAvailable);
      resolve(imageData);
    });
  }
  function _stopAllFeeds() {
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
  }
  function startCameraFeed() {
    return new Promise(function(resolve, reject) {
      _stopAllFeeds();
      _getCameraFeed()
        .then(function(stream) {
          videoStream = stream;
          videoElement.srcObject = stream;
          resolve();
        }, function(err) {
          alertify.error( "Failed to start camera feed: " + err);
          reject();
        });
    });
  }
  function startRecordCameraFeed(withAudio) {
    return new Promise(function(resolve, reject) {
      withAudio = withAudio !== undefined ? withAudio : false;
      _getCameraFeed(withAudio)
      .then(function(stream) {
        var requestedVideoRes = _getVideoResFromRadio();
        recordVideoFeed = RecordRTC(stream, {
          recorderType: MediaStreamRecorder,
          type: 'video',
          canvas: { width: requestedVideoRes.width, height: requestedVideoRes.height },
        });
        recordVideoFeed.startRecording();
        resolve();
      }, function(err) {
        alertify.error( "Failed to record camera feed: " + err);
        reject();
      });
      ;
    });
  }
  function stopRecordCameraFeed() {
    return new Promise(function(resolve, reject) {
      if( recordVideoFeed !== undefined) {
        recordVideoFeed.stopRecording(function() {
          recordVideoFeed.getDataURL(function(videoDataURL) {
            resolve( videoDataURL);
          });
        });
      }
    });
  }
  function startAudioFeed() {
    return new Promise(function(resolve, reject) {
      _stopAllFeeds();
      _getAudioFeed()
      .then( function( stream) {
        audioStream = stream;
        resolve( stream);
      }, function(err) {
        console.log( "Failed to get audio feed:" + err);
        reject(err);
      })
      ;
    });
  }
  function startRecordAudioFeed() {
    return new Promise(function(resolve, reject) {
      _getAudioFeed()
        .then( function( stream) {
          recordAudioFeed = RecordRTC(stream, {
            type: 'audio'
          });
          recordAudioFeed.startRecording();
          resolve();
        }, function(err) {
          alertify.error( "Failed to start camera feed for audio: " + err);
          reject();
        })
        ;
    });
  }
  function stopRecordAudioFeed() {
    return new Promise(function(resolve, reject) {
      if( recordAudioFeed !== undefined) {
        recordAudioFeed.stopRecording(function(url) {
          recordAudioFeed.getDataURL(function(audioDataURL) {
            resolve( audioDataURL);
          });
        });
      }
    });
  }




  function _gotDevices(deviceInfos) {
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

  function _getVideoResFromRadio() {
    for (index=0; index < videoResSwitches.length; index++) {
      if (videoResSwitches[index].checked) {
        return videoResSwitches[index].dataset;
      }
    }
  }
  function _setVideoResFromLocalstorage() {
    var getPreviousSessionRes = store.get(userSelectedRes);
    if(getPreviousSessionRes !== undefined) {
      console.log('The following resolution for video was used last time, it is: ' + getPreviousSessionRes.width+'×'+getPreviousSessionRes.height);
      for (index=0; index < videoResSwitches.length; index++) {
        if( getPreviousSessionRes.width === videoResSwitches[index].dataset.width && getPreviousSessionRes.height === videoResSwitches[index].dataset.height) {
          videoResSwitches[index].checked = true;
          return;
        } else {
          videoResSwitches[index].checked = false;
        }
      }
      // if no existing radio dataset were found, this means we probably have a custom value on our hand
      $(customVideoResSwitches).filter('[name="data-width"]').val(getPreviousSessionRes.width);
      $(customVideoResSwitches).filter('[name="data-height"]').val(getPreviousSessionRes.height);
      customVideoResInput.checked = true;
      $(setCustomVideoRes).trigger("click");

    }
  }


  // Attach audio output device to video element using device/sink ID.
  function _attachSinkId(element, sinkId) {
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
        alertify.error(errorMessage);
        // Jump back to first output device in the list as it's the default.
        audioOutputSelect.selectedIndex = 0;
      });
    } else {
      alertify.error('Your browser does not support output device selection.');
    }
  }

  function _changeAudioDestination() {
    var audioDestination = audioOutputSelect.value;
    _attachSinkId(videoElement, audioDestination);
  }

  function _setSources() {

    console.log( '1. Setting new sources for audio and video feeds');
    var audioSource = audioInputSelect.value;
    var videoSource = videoSelect.value;

    // set source in localstorage for next time
    store.set(userSelectedVideoDevice, videoSource);
    store.set(userSelectedAudioDevice, audioSource);

    var requestedVideoRes = _getVideoResFromRadio();
    store.set(userSelectedRes, requestedVideoRes);

    if( requestedVideoRes !== undefined)
      console.log( '2. Trying to use the following resolution: ' + requestedVideoRes.width+'×'+requestedVideoRes.height);
    else
      console.log( '2. No resolution set');

    if( audioSource !== undefined) {
      currentFeedsSource.audio = {
        optional: [ audioSource ? {sourceId: audioSource} : undefined ]
      }
    }

    if( videoSource !== undefined) {
      currentFeedsSource.video = {
        optional: [{sourceId: videoSource}]
      }
    }

    if( requestedVideoRes !== undefined) {
      currentFeedsSource.video.mandatory = {
          minWidth: requestedVideoRes.width,
          maxWidth: requestedVideoRes.width,
          minHeight: requestedVideoRes.height,
          maxHeight: requestedVideoRes.height
        }

    }

    // restart the mode (should be cleaner)
    $('.js--modeSelector').filter('.is--active').trigger('click');

  }

  function _getCameraFeed(withAudio) {
    return new Promise(function(resolve, reject) {
      console.log( "Getting camera feed");
      if( currentFeedsSource === undefined || currentFeedsSource.video === undefined) {
        reject("Camera not yet ready");
      }
      navigator.getUserMedia(
        {
          video: currentFeedsSource.video,
          audio: withAudio
        },
        function (stream) {
          resolve(stream);
        },
        function(err) {
          $(document).trigger('open_settings_pane');
          for (index=0; index < videoResSwitches.length; index++) {
            videoResSwitches[index].checked = false;
          }
          alertify.error(dodoc.lang().videoStreamCouldntBeStartedTryChangingRes);
        }
      );
    });
  }

  function updateVideoSize() {
    if( videoElement === undefined)
      return;
    videoResolutionIndicator.innerHTML = dodoc.lang().currentVideoResolutionIs+' '+videoElement.videoWidth + '×' + videoElement.videoHeight;
  }

  function _getAudioFeed() {
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
          alertify.error( dodoc.lang().audioStreamCouldntBeStarted + '\n\n error: ' + JSON.stringify(err));
        }
      );
    });
  }

  return API;
})();



// EVENT: a new media has been created
function onMediaCreated(mediasData){
  var mediaData = getFirstMediaFromObj( mediasData);
  if( mediaData.slugFolderName !== currentFolder || mediaData.slugProjectName !== currentProject)
    return;
  var currentMode = $(document).data('currentMode');
  if( mediaData.type !== currentMode)
    return;
  if(mediaData.author !== sessionId)
    return;

  var newMediaType = mediaData.type;
  var mediaName = mediaData.mediaName;


  var projectPath = getProjectPath( currentFolder, currentProject);
  var mediasFolderPath = getMediaFolderPathByType( newMediaType);

//   var pathToMediaFile = '/' + getPathToMediaFile( projectPath, mediasFolderPath, mediaName);
  var mediasFilesPath = getMediaFiles(mediaData);

  var cameraPreview = document.getElementById('video-stream');

  $(document)
    .data('lastCapturedMediaName', mediaName)
    .data('lastCapturedMediaFolderPath', mediasFolderPath)
    ;

  if( newMediaType === 'photo') {
    imageMode.showImagePreview(mediasFilesPath.img_large);
    animateWindows();
  }
  else if( newMediaType === 'video') {
    videoMode.showVideoPreview(mediasFilesPath.video);
    animateWindows();
  }
  else if( newMediaType === 'animation') {
    stopMotionMode.showStopMotionPreview(mediasFilesPath.video);
    animateWindows();
  }
  else if( newMediaType === 'audio') {
    audioMode.showAudioPreview( mediasFilesPath.audio, mediasFilesPath.img_large);
    animateWindows();
  }

}

//animation des fenêtres à la capture
function animateWindows(){
  $(document).trigger('close_settings_pane');
	$('body').attr('data-state', 'expanded');
}

//fenêtre de preview retourne au center
function backAnimation(){
	$('body').attr('data-state', '');
}

function justCaptured() {
  // passer le body en "data-justcaptured=yes" pendant un temps
  $('body').attr('data-justcaptured', 'yes');
  setTimeout( function() {
    $('body').attr('data-justcaptured', '');
  }, 600);
}

function mediaJustCaptured() {
  return $('body').attr('data-justcaptured') === 'yes';
}


function saveFeedback(icone){

  var $iconeFeedback = $("<div class='icone-feedback'><img src='"+icone+"'></div>");
  $("body").append( $iconeFeedback );
  setTimeout(function(){
    $iconeFeedback.fadeIn('slow').animate({"top":"25px", "left":$(window).width() - 50, "width":"20px"},
    {
      duration: 1000,
      complete: function() {
        $(this).fadeOut('slow', function(){
          $(this).remove();
          $(".count-add-media.plus-media").fadeIn('slow', function(){
            $(this).fadeOut('slow');
          });
        });
      }
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



