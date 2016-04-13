
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
    video        = document.querySelector('#video'),
    canvas       = document.querySelector('#canvas'),
    photo        = document.querySelector('#photo'),
    startbutton  = document.querySelector('#capture-btn'),
    startsm  = document.querySelector('#start-sm-btn'),
    capturesm  = document.querySelector('#capture-sm-btn'),
    stopsm  = document.querySelector('#stop-sm-btn'),
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
socket.on('stopMotionDirectoryCreated', onStopMotionDirectoryCreated);

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){
	//initial setup
	$("#photo").addClass('active');
  $(".choices").hide();
  $(".image-choice").show();
  $("body").attr("data-mode", "photo");
  $(".photo-capture ").hide();
  photoDisplay();

  setTimeout(function(){
    $(".image-choice").fadeOut();
  }, 2000);

  $("#canvas-equalizer").hide();

	//Quand on change de media
    // au click
    $('.btn-choice button').on('click', function(){
      changeMediaClick($(this));
    });
    // au boîtier avec les boutons
    $("body").keypress(function(e){
      changeMediaBoitier(e);
    });


	displayVideoStream();

	//recording medias events
	//Mouse events
	$(".photo-capture #capture-btn").on('click', takePictures);
  $("#video-btn").on('click', function(){
    recordingVideo('click');
  });
  $("#start-sm-btn").on('click', startStopMotion);
  $("#capture-sm-btn").on('click', takeStopMotionPic);
  $("#stop-sm-btn").on('click', stopStopMotion);

  $("#audio").on('click', function(e){
    audioCapture("click");
  });
  //initiate Equalizer at the beginning
  createEqualizer();

	// Keypressed (makey-makey) event
  $("body").keypress(function(e){
	  var code = e.keyCode || e.which;
	  if($("#photo").hasClass('active')){
	    if(code == 113) { //When Q is pressed
	      takePictures();
	      console.log("taking a picture");
	    }
	  }
    if($("#video-btn").hasClass('active')){
      if(code == 113) {//When Q is pressed
        countPress ++;
        recordingVideo();
      }
    }
    if($("#stopmotion").hasClass('active')){
      //redémarre le stop motion quand un autre média est choisi au milieu du stop motion
      if(code == 113) { //When Q is pressed
        countPress ++;
        if(countPress == 1){
          console.log("start a stopmotion");
          startStopMotion();
        }
        else{
          console.log("start taking pictures");
          takeStopMotionPic();
        }
      }
    }

    if($("#audio").hasClass('active')){
      if(code == 113) {
        countPress ++;
        countEqualizer ++;
        audioCapture(code);
      }
    }
	});

  //redémarre le stop motion quand un autre média est choisi au milieu du stop motion
  // var isEventExecutedSM = false;
  // $("#stopmotion").click(function(){
  //   isEventExecutedSM = false;
  //   $(".btn-choice button").click(function(){
  //     // $('#modal-change-alert').foundation('reveal', 'open');
  //     if(isEventExecutedSM == false){
  //       isEventExecutedSM = true;
  //       $("#stop-sm-btn").hide();
  //       $("#start-sm-btn").show();
  //       $("#capture-sm-btn").hide();
  //       $('.screenshot .meta-stopmotion').remove();
  //     }
  //   });
  // });

  // delete file
  $('body').on('click', '.js--delete-media-capture', function(){
    var fileToDelete = $('.screenshot').attr('data-file');
    socket.emit("deleteFile", { "slugFolderName" : currentFolder, "slugProjectName" : currentProject, "file" : fileToDelete});
    backAnimation();
    e.stopPropagation;
  });

  fullscreen();

  // Events sur la fenêtre modal d'alerte de changement de mode stop motion
  $('#modal-change-alert button.ok').on('click', function(){
    $("#stop-sm-btn").show();
    $("#start-sm-btn").hide(); $("#capture-sm-btn").show();
    $(".screenshot .meta-stopmotion").remove();
    $(".screenshot").append("<div class='meta-stopmotion'><div class='delete-image'><img src='/images/clear.svg'></div><p class='count-image'></p></div>");
    $(".screenshot .meta-stopmotion").show();
    $(".screenshot .count-image").html("<span>Image n° " + countImage+"</span>");
  });

  $('#modal-change-alert .supprimer-stop-motion').on('click', function(){
    var thisId = $(this).attr('data-choice');
    countPress = 0;
    $("#stop-sm-btn").hide();
    $("#start-sm-btn").show();
    $("#capture-sm-btn").hide();
    $('.screenshot .meta-stopmotion').remove();
    $('#modal-change-alert').foundation('reveal', 'close');
    $(".btn-choice button").removeClass('active');
    $('#'+thisId).addClass('active');
    $('body').removeClass('takingstopmotion');

    switch(thisId){
      case 'photo':
        photoDisplay();
        break;
      case 'video-btn':
        videoDisplay();
        break;
      case 'stopmotion':
        stopMotionDisplay();
        break;
      case 'audio':
        audioDisplay();
        break;
    }
    backAnimation();
  });
}

function changeMediaClick($this){
  var thisId = $this.attr('id');

  if($('body').hasClass('takingstopmotion')){
    $('#modal-change-alert').foundation('reveal', 'open');
    $('#modal-change-alert .supprimer-stop-motion').attr('data-choice', thisId);
  }

  else{
     console.log('you can change mode');
    $(".btn-choice button").removeClass('active');
    $this.addClass('active');
    $('body').removeClass('takingstopmotion');

    switch(thisId){
      case 'photo':
        photoDisplay();
        break;
      case 'video-btn':
        videoDisplay();
        break;
      case 'stopmotion':
        stopMotionDisplay();
        break;
      case 'audio':
        audioDisplay();
        break;
    }
    backAnimation();
  }
}

function changeMediaBoitier(e){
  var code = e.keyCode || e.which;
  var $activeButton = $(".btn-choice").find('.active');
  var thisId;

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
  }
}

function photoDisplay(){
  $(".preview_image").show();
  $('.screenshot .canvas-view').hide();
  $('.screenshot video').hide();
  $('.js--delete-media-capture').show();
  // setTimeout(function(){
  $('.photo-capture').fadeIn(2000);
  // },1000);
  $('.video-capture').hide();
  $('.stopmotion-capture').hide();
  $('.audio-capture').hide();
  $(".son").css("display", "none");
  $('#video').show();
  $('#canvas-audio').hide();$("#canvas-equalizer").hide();
  $('.instructions-stopmotion').hide(); $(".meta-stopmotion").hide();
  $(".image-choice").fadeIn( 100, function(){
    $(this).delay(600).fadeOut('slow');
  });
  $("body").attr("data-mode", "photo");
}
function videoDisplay(){
  $(".preview_image").hide();
  $('.screenshot .canvas-view').show();
  $('.photo-capture').css('display', 'none');
  $('.js--delete-media-capture').show();
  //setTimeout(function(){
    $('.video-capture').fadeIn(2000);
  //},1000);
  $('.stopmotion-capture').css('display','none');
  $('.audio-capture').css('display','none');
  $(".son").css("display", "none");
  $('#video').show();
  $('#canvas-audio').hide();$("#canvas-equalizer").hide();
  $('.instructions-stopmotion').hide(); $(".meta-stopmotion").hide();
  $(".video-choice").fadeIn( 100, function(){
    $(this).delay(600).fadeOut('slow');
  });
  $("body").attr("data-mode", "video");
}
function stopMotionDisplay(){
  $('.screenshot .canvas-view').show();
  $('.preview_image').hide();
  $('.screenshot #camera-preview').hide();
  $('.photo-capture').css('display', 'none');
  $('.video-capture').css('display','none');
  //setTimeout(function(){
    $('.stopmotion-capture').fadeIn(2000);
  //}, 1000);
  $('.audio-capture').css('display','none');
  $(".son").css("display", "none");
  $('#video').show();
  $(".stopmotion-choice").fadeIn( 100, function(){
    $(this).delay(600).fadeOut('slow');
  });
  $('#canvas-audio').hide(); $("#canvas-equalizer").hide();
  var canvas = document.querySelector('#canvas');
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
  $("body").attr("data-mode", "stopmotion");
}
function audioDisplay(){
  $('.screenshot #camera-preview').hide();
  $('.preview_image').hide();
  $('.js--delete-media-capture').show();
  $('.photo-capture').css('display', 'none');
  $('.video-capture').css('display','none');
  $('.stopmotion-capture').css('display','none');
  //setTimeout(function(){
    $('.audio-capture').fadeIn(2000);
  //}, 1000);
  $('.screenshot #canvas').css('display', 'none');
  $('.captureRight .son').css('display', 'block');
  $('#video').hide();
  $('.instructions-stopmotion').hide(); $(".meta-stopmotion").hide();
  $('#canvas-audio').show();$("#canvas-equalizer").show();
  $(".audio-choice").fadeIn( 100, function(){
    $(this).delay(600).fadeOut('slow');
  });
  $("body").attr("data-mode", "audio");
}

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

// Fonction qui prend les photos
function takePictures(){

  var invisibleCanvas = document.createElement('canvas');
  invisibleCanvas.width = dodoc.captureVideoWidth;
  invisibleCanvas.height = dodoc.captureVideoHeight;
  var invisibleCtx = invisibleCanvas.getContext('2d');

  invisibleCtx.drawImage(video, 0, 0, invisibleCanvas.width, invisibleCanvas.height);
  var imageData = invisibleCanvas.toDataURL('image/png');

  $(".captureRight .flash").fadeIn(0, function(){
    $(this).fadeOut(500);
  });
  console.log("Yeah you take a picture");

  // passer le body en "data-justcaptured=yes" pendant un temps
  $('body').attr('data-justcaptured', 'yes');
  setTimeout( function() {
    $('body').attr('data-justcaptured', '');
  }, 600);

  var mediaData =
  {
    "mediaType" : "photo",
    "mediaData" : imageData
  }
	animateWindows();
  createNewMedia( mediaData);
  saveFeedback("/images/icone-dodoc_image.png");
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
        animateWindows();
        createNewMedia( mediaData);

        if (mediaStream) mediaStream.stop();
      });
      cameraPreview.src = '';
      cameraPreview.poster = 'https://localhost:8080/loading.gif';
      saveFeedback("/images/icone-dodoc_video.png");
    });
  }

}

// STOP MOTION
// Start Stop Motion
function startStopMotion(){
  countImage = 0;
  console.log('start stop-motion');
  $("#start-sm-btn").hide();
  $("#capture-sm-btn").show();
  $("#stop-sm-btn").hide();
  $('.js--delete-media-capture').hide();
  $('#camera-preview').hide();

  var iconeSM = '<div class="icone-stopmotion"><img src="/images/stopmotion.svg"></div>';
  var text = '<h4>Vous venez de créer un nouveau stop motion.</br>Cliquez que le <b>bouton d\'enregistrement</b> pour commencer à prendre des photos</h4>'
  var htmlToAdd = '<div class="instructions-stopmotion">'+iconeSM+text+'</div>';
  $('.screenshot').append(htmlToAdd);

  animateWindows();

  $(".screenshot").append("<div class='meta-stopmotion'><div class='delete-image'><img src='/images/clear.svg'></div><p class='count-image'></p></div>");
  $(".screenshot .meta-stopmotion").hide();

  var mediaData = {};
  mediaData.slugFolderName = currentFolder;
  mediaData.slugProjectName = currentProject;

  socket.emit( 'startStopMotion', mediaData);
}

function onStopMotionDirectoryCreated( newStopMotionData) {

  var folderCacheName = newStopMotionData.folderCacheName;
  var folderCachePath = newStopMotionData.folderCachePath;

  $("#stop-sm-btn").show();
  $('.screenshot .canvas-view').show();
  $('.screenshot .instructions-stopmotion').remove();
  $(".screenshot .meta-stopmotion").show();

  $("body").data( "smCacheName", folderCacheName);
  $("body").data( "smCachePath", folderCachePath);
  $("body").data( "smImageCount", 0);
}

function takeStopMotionPic() {

  var smCacheName = $("body").data( "smCacheName");
  var smCachePath = $("body").data( "smCachePath");
  var smImageCount = parseInt( $("body").data( "smImageCount")) + 1;

  var invisibleCanvas = document.createElement('canvas');
  invisibleCanvas.width = dodoc.captureVideoWidth;
  invisibleCanvas.height = dodoc.captureVideoHeight;
  var invisibleCtx = invisibleCanvas.getContext('2d');

  invisibleCtx.drawImage(video, 0, 0, invisibleCanvas.width, invisibleCanvas.height);
  var imageData = invisibleCanvas.toDataURL('image/png');

  var factor = video.getBoundingClientRect().width / $(".screenshot")[0].getBoundingClientRect().width;;
  canvas.width = video.getBoundingClientRect().width / factor;
  canvas.height = video.getBoundingClientRect().height / factor;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  var data = canvas.toDataURL('image/png');

  photo.setAttribute('src', data);
  $(".meta-stopmotion .delete-image").off();
/*
  $(".meta-stopmotion .delete-image").on('click', function(){
    removeImageMotion(data, folderCache);
  });
*/

  var smImage =
  {
    "imageContent" : imageData,
    "folderCacheName" : smCacheName,
    "folderCachePath" : smCachePath,
    "imageCount" : smImageCount
  };

  socket.emit( 'addImageToStopMotion', smImage);

  $(".screenshot .count-image").html("<span>Image n° " + smImageCount + "</span>");
  $('body').addClass('takingstopmotion');
  $(".captureRight .flash").fadeIn(0, function(){
    $(this).fadeOut(500);
  });

  $('body').attr('data-justcaptured', 'yes');
  setTimeout( function() {
    $('body').attr('data-justcaptured', '');
  }, 600);

  $("body").data( "smImageCount", smImageCount);

}

function removeLastImageFromStopMotion() {

// MISSING

}
/*
function removeImageMotion(data, dir){
  if(countImage > 1){
    console.log("delete Image");
    socket.emit("deleteImageMotion", {data: data, name: currentFolder, dir: dir, count: countImage});
    countImage = countImage - 1;
    var context = canvas.getContext('2d');
    var imageObj = new Image();
    imageObj.onload = function() {
      context.drawImage(imageObj, 0, 0);
    };
    imageObj.src = "/" + currentFolder +"/"+ currentProject+"/01-stopmotion/" + countImage + ".png";
    $(".screenshot .count-image").html("<span>Image n° " + countImage+"</span>");
  }
  else{
    startStopMotion();
  }
}
*/

function stopStopMotion( ) {

  var smCacheName = $("body").data( "smCacheName");
  var smCachePath = $("body").data( "smCachePath");
  var smImageCount = parseInt( $("body").data( "smImageCount")) + 1;

  $("#stop-sm-btn").hide();
  $("#capture-sm-btn").hide();
  countPress = 0;
  $('.screenshot .meta-stopmotion').remove();
  saveFeedback("/images/icone-dodoc_anim.png");

  var mediaData =
  {
    "stopMotionCacheFolder" : smCacheName,
    "mediaType" : "animation"
  }

	animateWindows();
  createNewMedia( mediaData);

  $("#start-sm-btn").show();
  $('.js--delete-media-capture').show();
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  $('body').removeClass('takingstopmotion');


}

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
        createNewMedia( mediaData);
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

function onMediaCreated( newMediasData){

/*   $('.screenshot').attr('data-file', newMediaData.file); */

  var newMediaData = getFirstMediaFromObj( newMediasData);

  var newMediaType = newMediaData.type;
  // remove /sessions from the filePath

  var projectPath = getProjectPath( currentFolder, currentProject);
  var mediasFolderPath = getMediaFolderPathByType( newMediaType);
  var mediaName = newMediaData.mediaName;

  var pathToMediaFile = '/' + getPathToMediaFile( projectPath, mediasFolderPath, mediaName);

  var cameraPreview = document.getElementById('camera-preview');
//   var pathToFile = makeFullMediaPath( pathMediaFolder + '/' + mediaFilenames[0]);


  if( newMediaType === 'photo') {
    $(".preview_image").attr("src", pathToMediaFile + '.jpg');
  }
  else if( newMediaType === 'video') {
    cameraPreview.src = pathToMediaFile + '.webm';
    cameraPreview.play();
    cameraPreview.muted = false;
    cameraPreview.controls = true;
    $('.video-capture').fadeIn(1000);
  }
  else if( newMediaType === 'animation') {
    cameraPreview.src = pathToMediaFile + '.mp4';
    cameraPreview.play();
    cameraPreview.muted = false;
    cameraPreview.controls = true;
    $('#camera-preview').show();
    $('.screenshot .canvas-view').hide();
  }
  else if( newMediaType === 'audio') {


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
      $(this).fadeOut('slow');
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
