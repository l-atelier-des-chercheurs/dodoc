/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;
var sessionName ;
//get current project
var currentProject = app.projet;

// Variables pour la prise de médias
var streaming = false,
    video        = document.querySelector('#video'),
    canvas       = document.querySelector('#canvas'),
    photo        = document.querySelector('#photo'),
    startbutton  = document.querySelector('#capture-btn'),
    startsm  = document.querySelector('#start-sm-btn'),
    capturesm  = document.querySelector('#capture-sm-btn'),
    stopsm  = document.querySelector('#stop-sm-btn'),
    width = 480,
    height = 0;
var mediaStream = null;

//Event variables for recording
var isEventExecutedVideo = false;
var isEventExecutedVideoBtn = false;
var isEventExecutedAudio = false;
var isEventExecutedEqualizer = false;

// compteur de click
var countPress = 0;


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);


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
  photoDisplay();

  setTimeout(function(){
    $(".image-choice").fadeOut();
  }, 2000);

  $("#canvas-equalizer").hide();

	//on media changing
	changeMedia();
	displayVideoStream();

	//recording medias events
	//Mouse events
	$(".photo-capture #capture-btn").on('click', takePictures);
  $("#video-btn").on('click', function(){
    recordingVideo('click');
  });
  $("#start-sm-btn").on('click', startStopMotion);
  $("#capture-sm-btn").on('click', onStopMotionDirectory);
  $("#stop-sm-btn").on('click', stopStopMotion);

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
      isEventExecutedSM = false;
      if(code == 115 || code == 122){
        console.log(isEventExecutedSM);
        if(isEventExecutedSM == false){
          isEventExecutedSM = true;
          $("#stop-sm-btn").hide();
          $("#start-sm-btn").show();
          $("#capture-sm-btn").hide();
          $('.screenshot .meta-stopmotion').remove();
        }
      }
      if(code == 113) { //When Space is pressed
        countPress ++;
        if(countPress == 1){
          console.log("start a stopmotion");
          startStopMotion();
        }
        else{
          console.log("start taking pictures");
          onStopMotionDirectory();
        }
      }
    }
	});

  //redémarre le stop motion quand un autre média est choisi au milieu du stop motion
  var isEventExecutedSM = false;
  $("#stopmotion").click(function(){
    isEventExecutedSM = false;
    $(".btn-choice button").click(function(){
      if(isEventExecutedSM == false){
        isEventExecutedSM = true;
        $("#stop-sm-btn").hide();
        $("#start-sm-btn").show();
        $("#capture-sm-btn").hide();
        $('.screenshot .meta-stopmotion').remove();
      }
    });
  });

}

function changeMedia(){
  $(".btn-choice #photo").on("click", function(){ 
    photoDisplay();       
    $(".btn-choice button").removeClass('active');
    $(this).addClass("active"); 
  });
  $(".btn-choice #video-btn").on("click", function(){
    videoDisplay();
    $(".btn-choice button").removeClass('active');
    $(this).addClass("active"); 
  });
  $(".btn-choice #stopmotion").on("click", function(){
    stopMotionDisplay();
    $(".btn-choice button").removeClass('active');
    $(this).addClass("active");
  });
  $(".btn-choice #audio").on("click", function(){
    audioDisplay();
    $(".btn-choice button").removeClass('active');
    $(this).addClass("active");
  });
  
  //Animation back when changing media
  $(".btn-choice").on('click', backAnimation);
  
  $("body").keypress(function(e){
    var code = e.keyCode || e.which;
    var $activeButton = $(".btn-choice").find('.active');
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
  });
}
function photoDisplay(){
  $('.screenshot .canvas-view').show();
  $('.screenshot video').hide();
  $('.photo-capture').show();
  $('.video-capture').hide();
  $('.stopmotion-capture').hide();
  $('.audio-capture').hide();
  $(".son").css("display", "none");
  $('#video').show();
  $('#canvas-audio').hide();$("#canvas-equalizer").hide();
  $('.instructions-stopmotion').hide(); $(".meta-stopmotion").hide();
  $(".image-choice").fadeIn('slow', function(){
    $(this).fadeOut('slow');
  });
  $("body").attr("data-mode", "photo");
}
function videoDisplay(){
  $('.photo-capture').css('display', 'none');
  $('.video-capture').css('display','block');
  $('.stopmotion-capture').css('display','none');
  $('.audio-capture').css('display','none');
  $(".son").css("display", "none");
  $('#video').show();
  $('#canvas-audio').hide();$("#canvas-equalizer").hide();
  $('.instructions-stopmotion').hide(); $(".meta-stopmotion").hide();
  $(".video-choice").fadeIn('slow', function(){
    $(this).fadeOut('slow');
  });
  $("body").attr("data-mode", "video");
}
function stopMotionDisplay(){
  $('.screenshot .canvas-view').show();
  $('.screenshot #camera-preview').hide();
  $('.photo-capture').css('display', 'none');
  $('.video-capture').css('display','none');
  $('.stopmotion-capture').css('display','block');
  $('.audio-capture').css('display','none');
  $(".son").css("display", "none");
  $('#video').show();    
  $(".stopmotion-choice").fadeIn('slow', function(){
    $(this).fadeOut('slow');
  });
  $('#canvas-audio').hide(); $("#canvas-equalizer").hide();
  var canvas = document.querySelector('#canvas');
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)
  $("body").attr("data-mode", "stopmotion");
}
function audioDisplay(){
  $('.screenshot #camera-preview').hide();
  $('.photo-capture').css('display', 'none');
  $('.video-capture').css('display','none');
  $('.stopmotion-capture').css('display','none');
  $('.audio-capture').css('display','block');
  $('.screenshot #canvas').css('display', 'none');
  $('.captureRight .son').css('display', 'block');
  $('#video').hide();
  $('.instructions-stopmotion').hide(); $(".meta-stopmotion").hide();
  $('#canvas-audio').show();$("#canvas-equalizer").show();
  $(".audio-choice").fadeIn('slow', function(){
    $(this).fadeOut('slow');
  });
  $("body").attr("data-mode", "audio");
}

function displayVideoStream(){
  // Initialise getUserMedia
    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);
    navigator.getMedia(
      {
        video: true,
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

    video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        streaming = true;
      }
    }, false);
}

// Fonction qui prend les photos
function takePictures(){
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(video, 0, 0, width, height);
  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
  $(".captureRight .flash").fadeIn(0, function(){
    $(this).fadeOut(500);
  });
  console.log("Yeah you take a picture");
  submitData(data, 'imageCapture')
}

// Function qui enregistre de la vidéo
function recordingVideo(click){
  console.log('test');
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
    recordingFeedback();
  
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
          video: { width: 480, height: 360 },
          canvas: { width: 480, height: 360 },
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
    startVideoRecording.disabled = false;
    stopVideoRecording.disabled = true;
    startVideoRecording.style.display = "block";
    stopVideoRecording.style.display = "none";
    cameraPreview.style.display = "block";
    $(".recording-feedback").remove();
    // stop video recorder
    recordVideo.stopRecording(function() {
      // get video data-URL
      recordVideo.getDataURL(function(videoDataURL) {
        var files = {
          video: {
            type: recordVideo.getBlob().type || 'video/webm',
            dataURL: videoDataURL
          }
        };
        console.log(files);
        submitData(files,'videoRecorded')
        if (mediaStream) mediaStream.stop();
      });
      cameraPreview.src = '';
      cameraPreview.poster = 'https://localhost:8080/loading.gif';
      //saveFeedback("/images/icone-dodoc_video.png");
    });
  }

  // Display video when it's saved
  socket.on('showVideo', function(data) {
    var href = '/static/'+data.session+'/'+data.project+'/'+data.file;
    console.log('got file ' + href);
    cameraPreview.src = href;
    cameraPreview.play();
    cameraPreview.muted = false;
    cameraPreview.controls = true;
  });
}

// STOP MOTION
// Start Stop Motion
function startStopMotion(){
  countImage = 0;
  console.log('start stop-motion');
  $("#start-sm-btn").hide(); $("#capture-sm-btn").show(); $("#stop-sm-btn").hide();
  $('.screenshot .canvas-view').hide(); $('#camera-preview').hide();

  var iconeSM = '<div class="icone-stopmotion"><img src="/images/stopmotion.svg"></div>';
  var text = '<h4>Vous venez de créer un nouveau stop motion.</br>Cliquez que le <b>bouton d\'enregistrement</b> pour commencer à prendre des photos</h4>'
  var htmlToAdd = '<div class="instructions-stopmotion">'+iconeSM+text+'</div>';
  $('.screenshot').append(htmlToAdd);
  submitData(false, 'newStopMotion');
  $(".screenshot").append("<div class='meta-stopmotion'><div class='delete-image'><img src='/images/clear.svg'></div><p class='count-image'></p></div>");
  $(".screenshot .meta-stopmotion").hide();
}

// Quand le dossier du stop motion est crée
function onStopMotionDirectory(){
  var dir = "sessions/" + currentSession + "/"+ currentProject+"/01-stopmotion";
  $("#stop-sm-btn").show();
  $('.screenshot .canvas-view').show();
  $('.screenshot .instructions-stopmotion').remove(); 
  $(".screenshot .meta-stopmotion").show();   
  takepictureMotion(dir);
}

// fonction qui prend des photos pour le stop motion et qui les envoie au serveur
function takepictureMotion(dir) {
  countImage ++;
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(video, 0, 0, width, height);
  var data = canvas.toDataURL('image/png');
  photo.setAttribute('src', data);
  $(".meta-stopmotion .delete-image").off();
  $(".meta-stopmotion .delete-image").on('click', function(){
    removeImageMotion(data, dir);
  });
  socket.emit('imageMotion', {data: data, dir: dir, count: countImage});
  $(".screenshot .count-image").html("<span>Image n° " + countImage+"</span>");
}

function removeImageMotion(data, dir){
  if(countImage > 1){
    console.log("delete Image");
    socket.emit("deleteImageMotion", {data: data, name: app.session, dir: dir, count: countImage});
    countImage = countImage - 1;
    var context = canvas.getContext('2d');
    var imageObj = new Image();
    imageObj.onload = function() {
      context.drawImage(imageObj, 0, 0);
    };
    imageObj.src = "/" + currentSession +"/"+ currentProject+"/01-stopmotion/" + countImage + ".png";
    $(".screenshot .count-image").html("<span>Image n° " + countImage+"</span>");
  }
  else{
    startStopMotion();
  }
}

function stopStopMotion(){
  var dir = "sessions/" + currentSession + "/"+ currentProject+"/01-stopmotion";
  $("#stop-sm-btn").hide();
  $("#start-sm-btn").show();
  $("#capture-sm-btn").hide();
  countImage = 0;
  countPress = 0;
  $('.screenshot .meta-stopmotion').remove();
  //saveFeedback("/images/icone-dodoc_anim.png");

  socket.emit('stopmotionCapture', {session: currentSession, project: currentProject, dir: dir});
  socket.on('newStopMotionCreated', function(req){
    $('.screenshot .canvas-view').hide();
    $('#camera-preview').attr('src', '/' + currentSession + '/'+'/'+currentProject+'/'+req.fileName+'')
    $('#camera-preview').show();
  });
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}


function submitData(data, send){
	animateWindows();
	socket.emit(send, {data: data, session: currentSession, project:currentProject}); 
}

//animation des fenêtres à la capture
function animateWindows(){
	if(!$('.captureRight').hasClass('active')){
		$(".captureRight").css('display', 'block').addClass('active');
    $('.captureLeft').velocity({'left':'5%'}, 'slow');
    $('.captureRight').velocity({'left':'52%'}, 'slow');
	}
}

//fenêtre de preview retourne au center
function backAnimation(){
  if($(".captureRight").hasClass('active')){
    $('.captureLeft').velocity({'left':'27%'}, 'slow');
    $('.captureRight').removeClass('active').velocity({'left':'30%'}, 500,function(){
      $(this).fadeOut('slow');
    });
  }
}

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


