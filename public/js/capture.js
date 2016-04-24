

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
//   createEqualizer();

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

    var mediaToDelete =
    {
      "mediaName" : $(document).data('lastCapturedMediaName'),
      "mediaFolderPath" : $(document).data('lastCapturedMediaFolderPath'),
    }
    sendData.deleteMedia( mediaToDelete);

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
  $(document)
    .data('currentMode', 'photo')

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
  $(document)
    .data('currentMode', 'video')

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
  $(document)
    .data('currentMode', 'animation')


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
  $(document)
    .data('currentMode', 'audio')

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




function onMediaCreated( mediasData){

  var mediaData = getFirstMediaFromObj( mediasData);

  debugger;

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

  var cameraPreview = document.getElementById('camera-preview');

  $(document)
    .data('lastCapturedMediaName', mediaName)
    .data('lastCapturedMediaFolderPath', mediasFolderPath)
    ;

  if( newMediaType === 'photo') {
    $(".preview_image").attr("src", pathToMediaFile + '.jpg');
    animateWindows();
  }
  else if( newMediaType === 'video') {
    cameraPreview.src = pathToMediaFile + '.webm';
    cameraPreview.play();
    cameraPreview.muted = false;
    cameraPreview.controls = true;
    $('.video-capture').fadeIn(1000);
    animateWindows();
  }
  else if( newMediaType === 'animation') {
    cameraPreview.src = pathToMediaFile + '.mp4';
    cameraPreview.play();
    cameraPreview.muted = false;
    cameraPreview.controls = true;
    $('#camera-preview').show();
    $('.screenshot .canvas-view').hide();
    animateWindows();
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
