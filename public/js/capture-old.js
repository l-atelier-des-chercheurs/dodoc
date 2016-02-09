jQuery(document).ready(function($) {

	var serverBaseUrl = document.domain;
  var host = window.location.host;
	var socket = io.connect();
	var sessionId = '';
  //compteur d'image pour le stop motion
  var countImage = 0;
  //compteur de clicks pour le stopmotion
  var countPress = 0;
  //compteur de click général
  var countClick = 0;
  //compteur pour l'equalizer
  var countEqualizer = 0;
  // var recordAudio;
  // var recordVideo;
  var isEventExecutedVideo = false;
  var isEventExecutedVideoBtn = false;
  var isEventExecutedAudio = false;
  var isEventExecutedEqualizer = false;

  var fadeInModeTimer = 00;
  var fadeOutModeTimer = 1600;
  var sarahCouleur = "gray";


	/**
	* Events
	*/
	/* sockets */
	socket.on('connect', onSocketConnect);
	socket.on('error', onSocketError);

  // fonctions
  events();
  main();


	/**
	* handlers
	*/
	/* sockets */

	function onSocketConnect() {
		sessionId = socket.io.engine.id;
		console.log('Connected ' + sessionId);
		socket.emit('newUser', {id: sessionId, name: app.session, projet:app.projet});
	};
	
  function onSocketError(reason) {
	 console.log('Unable to connect to server', reason);
	};

  function events(){
    $("#photo").addClass('active');
    $(".choices").hide();
    $(".image-choice").show();
    $("body").attr("data-mode", "photo");


    setTimeout(function(){
      $(".image-choice").fadeOut(fadeOutModeTimer);
    }, 2000);

    $("#canvas-equalizer").hide()
    setTimeout(function(){
      $(".choice .image-choice").fadeIn(1000, function(){
        $(this).fadeOut(1000);
      });
    }, 1000);
    
    changeMedia();

    //Keypress for powermate
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
      $(".btn-choice").on('click', backAnimation);
      $("body").keypress(function(e){
        var code = e.keyCode || e.which;
        var $activeButton = $(".btn-choice").find('.active');
          if(code == 115) { //remplacer 155 par 115 
            var $nextButton = $activeButton.next();
            $activeButton.removeClass('active');
            if ($nextButton.length){
              $nextButton.addClass('active');
            }
            else{
              $nextButton = $(".btn-choice button").first().addClass('active');
            }
          }
          if(code == 122) { //remplacer 98 par 122 
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
            $(".form-meta.active").slideUp( "slow" ); 
            $(".form-meta").removeClass('active');
            if($('.screenshot .count-image')){
              $('.screenshot .count-image').remove();
            }
            backAnimation();
            countPress = 0;

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
        // }
      });
    }
    function photoDisplay(){
      $('.screenshot .canvas-view').show();
      $('.screenshot video').hide();
      $('.photo-capture').css('display', 'block');
      $('.video-capture').css('display','none');
      $('.stopmotion-capture').css('display','none');
      $('.audio-capture').css('display','none');
      $(".son").css("display", "none");
      $('#video').show();
      $('#canvas-audio').hide();$("#canvas-equalizer").hide();
      $('.instructions-stopmotion').hide(); $(".meta-stopmotion").hide();
      $(".image-choice").fadeIn(fadeInModeTimer, function(){
        $(this).fadeOut(fadeOutModeTimer);
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
      $(".video-choice").fadeIn(fadeInModeTimer, function(){
        $(this).fadeOut(fadeOutModeTimer);
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
      $(".stopmotion-choice").fadeIn(fadeInModeTimer, function(){
        $(this).fadeOut(fadeOutModeTimer);
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
      $(".audio-choice").fadeIn(fadeInModeTimer, function(){
        $(this).fadeOut(fadeOutModeTimer);
      });
      $("body").attr("data-mode", "audio");
    }
    $(".clear").off();
    $(".clear").on("click", function(e){
      console.log('File was delete');
      socket.emit("deleteFile", {name:app.session});
      backAnimation();
      deleteFeedback();
      e.stopPropagation;
    });
  }

  // Prend des photos et des stop motion
  function main(){
    //définition des variables pour la photo et le stop motion
    var streaming = false,
        video        = document.querySelector('#video'),
        canvas       = document.querySelector('#canvas'),
        photo        = document.querySelector('#photo'),
        startbutton  = document.querySelector('#capture-btn'),
        startsm  = document.querySelector('#start-sm-btn'),
        capturesm  = document.querySelector('#capture-sm-btn'),
        stopsm  = document.querySelector('#stop-sm'),
        width = 640,
        height = 0;

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

      //init events
      initEvents();

    function initEvents() {
      //Mouse function
      $(".photo-capture #capture-btn").on('click', takepicture);
      $("#start-sm-btn").on('click', startStopMotion);
      $("#capture-sm-btn").on('click', onStopMotionDirectory);
      $("#stop-sm").on('click', stopStopMotion);

      //redémarre le stop motion quand un autre média est choisi au milieu du stop motion
      var isEventExecutedSM = false;
      $("#stopmotion").click(function(){
        isEventExecutedSM = false;
        $(".btn-choice button").click(function(){
          if(isEventExecutedSM == false){
            isEventExecutedSM = true;
            $("#stop-sm").hide();
            $("#start-sm-btn").show();
            $("#capture-sm-btn").hide();
            $('.screenshot .meta-stopmotion').remove();
          }
        });
      });

      $("#video-btn").on('click', function(){
        audioVideo("click");
      });
      $("#audio").on('click', function(e){
        audioCapture("click");
      });

      //initiate Equalizer at the beginning
      createEqualizer();

      //Powermate function
      $("body").keypress(function(e){
        // variable to check if event is already executed
        // Taking pictures
        var code = e.keyCode || e.which;
        if($("#photo").hasClass('active')){
          if(code == 113) { //When Space is pressed
            takepicture();
            console.log("taking a picture");
          }
        }
        if($("#video-btn").hasClass('active')){
          if(code == 113) {
            countPress ++;
            audioVideo();
          }
        }
        // Taking StopMotion
        if($("#stopmotion").hasClass('active')){
          //redémarre le stop motion quand un autre média est choisi au milieu du stop motion
          isEventExecutedSM = false;
          if(code == 115 || code == 122){
            console.log(isEventExecutedSM);
            if(isEventExecutedSM == false){
              isEventExecutedSM = true;
              $("#stop-sm").hide();
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
        if($("#audio").hasClass('active')){
          if(code == 113) {
            countPress ++;
            countEqualizer ++;
            audioCapture(code);
          }
        }
      });
      
      // fonction qui prend des photos et qui les envoie au serveur
      function takepicture() {
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(video, 0, 0, width, height);
        var data = canvas.toDataURL('image/png');
        photo.setAttribute('src', data);
        animateWindows(data, "imageCapture");
        $(".captureRight .flash").fadeIn(0, function(){
          $(this).fadeOut(500);
        });
        saveFeedback("/images/icone-dodoc_image.png");
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
          if(countImage > 1){
            socket.emit("deleteImageMotion", {data: data, id: sessionId, name: app.session, dir: dir, count: countImage});
            countImage = countImage - 1;
            var context = canvas.getContext('2d');
            var imageObj = new Image();
            imageObj.onload = function() {
              context.drawImage(imageObj, 0, 0);
            };
            imageObj.src = "https://" + host + "/" + app.session +"/"+ app.projet+"/01-stopmotion/" + countImage + ".png";
            $(".screenshot .count-image").text("Picture " + countImage);
          }
          else{
            startStopMotion();
          }
        });
        socket.emit('imageMotion', {data: data, id: sessionId, name: app.session, projet:app.projet, dir: dir, count: countImage});
        $(".screenshot .count-image").text("Picture " + countImage);
      }

      // Crée un nouveau stop motion + ajoute des images dedans + transforme le stop motion en vidéo
      function startStopMotion(){
        countImage = 0;
        $("#start-sm-btn").hide(); $("#capture-sm-btn").show(); $("#stop-sm").hide();
        $('.screenshot .canvas-view').hide(); $('#camera-preview').hide();
        if($(".form-meta").hasClass('active')){
          $(".form-meta.active").hide().removeClass('active');
        }
        $(".captureRight").css('display', 'block').addClass('active');
        $('.screenshot').append('<div class="instructions-stopmotion"><div class="icone-stopmotion"><img src="/images/stopmotion.svg"></div><h4>You have created a new stop motion.</br> Click on the <b>record button</b> to start taking pictures</h4></div>');
        $('.captureLeft').velocity({'left':'26%'}, 'slow');
        $('.captureRight').velocity({'left':'52%'}, 'slow');
        socket.emit('newStopMotion', {id: sessionId, name: app.session, projet:app.projet});
        $(".screenshot").append("<div class='meta-stopmotion'><div class='delete-image'><img src='/images/clear.svg'></div><p class='count-image'></p></div>");
        $(".screenshot .meta-stopmotion").hide();
      }
             
      function onStopMotionDirectory(){
        var dir = "sessions/" + app.session + "/"+app.projet+"/01-stopmotion";
        $("#stop-sm").show();
        $('.screenshot .canvas-view').show();
        $('.screenshot .instructions-stopmotion').remove(); 
        $(".screenshot .meta-stopmotion").show();   
        takepictureMotion(dir);
      }

      function stopStopMotion(){
        var dir = "sessions/" + app.session + "/"+ app.projet+"/01-stopmotion";
        $("#stop-sm").hide();
        $("#start-sm-btn").show();
        $("#capture-sm-btn").hide();
        countImage = 0;
        countPress = 0;
        $('.screenshot .meta-stopmotion').remove();
        saveFeedback("/images/icone-dodoc_anim.png");
        //socket.emit('StopMotion', {id: sessionId, name: app.session, dir: dir});
        socket.emit('stopmotionCapture', {id: sessionId, name: app.session, projet: app.projet, dir: dir});
        socket.on('newStopMotionCreated', function(req){
          $('.screenshot .canvas-view').hide();
          $('#camera-preview').attr('src', 'https://'+host+'/' + app.session + '/'+'/'+app.projet+'/'+req.fileName+'')
          $('#camera-preview').show();
          $(".form-meta").slideDown( "slow" ).addClass('active'); 
        });
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      }
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

      //powermate events
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

      socket.on('AudioFile', function(fileName, sessionName, projetName) {
        href = 'https://'+ host +'/static/' + sessionName + '/' + projetName + '/' + fileName;
        console.log('got file ' + href);
        cameraPreview.src = href;
        cameraPreview.play();
        cameraPreview.muted = false;
        cameraPreview.controls = true;
      });

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
            video: false,
            audio: true
          },
          function (stream) {
            // get user media pour le son
            mediaStream = stream;
            recordAudio = RecordRTC(stream, {
              type: 'audio'
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
            var files = {
                audio: {
                    type: recordAudio.getBlob().type || 'audio/wav',
                    dataURL: audioDataURL
                }
            };
            //socket.emit('audio', {files: files, id: sessionId, name: app.session});
            console.log("Audio is recording url " + url);
            animateWindows(files, "audioCapture");
            saveFeedback("/images/icone-dodoc_son.png");
            if (mediaStream) mediaStream.stop();
          });
        });
      }
    }
  
    //Capture le flux audio et video
    function audioVideo(click){
      //Variables
      // you can set it equal to "false" to record only audio
      var recordVideoSeparately = !!navigator.webkitGetUserMedia;
      if (!!navigator.webkitGetUserMedia && !recordVideoSeparately) {
          var cameraPreview = document.getElementById('camera-preview');
          cameraPreview.parentNode.innerHTML = '<audio id="camera-preview" controls style="border: 1px solid rgb(15, 158, 238); width: 94%;"></audio> ';
      }

      var mediaStream = null;

      var startVideoRecording = document.getElementById('start-record-btn');
      var stopVideoRecording = document.getElementById('stop-record-btn');
      var cameraPreview = document.getElementById('camera-preview');

      //click events
      if(click == "click"){
        $("#start-record-btn").off();
        $("#start-record-btn").on('click', function(){
          console.log("you are using the mouse for recording");
          startVideo();
          $(".btn-choice").click(function(e){
            isEventExecutedVideo = false;
            stopVideoOnChange(e, isEventExecutedVideo);
          });
        });

        $("#stop-record-btn").off();
        $("#stop-record-btn").on('click', function(){
          stopVideo();
        });
      }


      //Powermate events
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

      socket.on('merged', function(fileName, sessionName, projetName) {
        href = 'https://localhost:8080/static/' + sessionName + '/' + projetName + '/' + fileName;
        console.log('got file ' + href);
        cameraPreview.src = href;
        cameraPreview.play();
        cameraPreview.muted = false;
        cameraPreview.controls = true;
      });

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

      function startVideo(){
        backAnimation();
        if($(".form-meta").hasClass('active')){
          $(".form-meta.active").hide(function(){ 
            $(".form-meta").removeClass('active');
          });
        }
        $('#camera-preview').hide();
        $('.screenshot .canvas-view').hide();
        recordingFeedback();
        // $(".captureRight").css('display', 'block').addClass('active');
        // $('.captureLeft').velocity({'left':'26%'}, 'slow');
        // $('.captureRight').velocity({'left':'52%'}, 'slow');
        // $('.captureRight').append('<div class="record-button-animated"><div class="outter"></div><div class="inner"></div>')

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
              type: 'video'
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

      function recordingFeedback(){
        $(".video-view").append("<div class='recording-feedback'><div class='record-feedback'></div><div class='time-feedback'>[REC] <time>00:00:00</time></div></div>");
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
        $(".captureRight").css('display', 'block').addClass('active');
        $('.captureLeft').velocity({'left':'26%'}, 'slow');
        $('.captureRight').velocity({'left':'52%'}, 'slow');
        //$('.captureRight .record-button-animated').remove();
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
            socket.emit('audioVideo', {files: files, id: sessionId, name: app.session, projet:app.projet});
            if (mediaStream) mediaStream.stop();
          });
          cameraPreview.src = '';
          cameraPreview.poster = 'https://localhost:8080/loading.gif';
          $(".form-meta").show(); 
          $(".form-meta").addClass('active');
          saveFeedback("/images/icone-dodoc_video.png");
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

  }  

  //fenêtre de preview retourne au center
  function backAnimation(){
    if($(".captureRight").hasClass('active')){
      $('.form-meta.active').hide();
      $('.captureLeft').velocity({'left':'50%'}, 'slow');
      $('.captureRight').removeClass('active').velocity({'left':'30%'}, 500,function(){
        $(this).fadeOut('slow');
      });
    }
  }

  //animation des fenêtres à la capture
  function animateWindows(data, capture){
    if(!$('.captureRight').hasClass('active')){
      $(".captureRight").css('display', 'block').addClass('active');
      $(".form-meta").show().addClass('active');
      $('.left').velocity({'left':'26%'}, 'slow');
      $('.right').velocity({'left':'52%'}, 'slow');
      $('.captureLeft').velocity({'left':'26%'}, 'slow');
      $('.captureRight').velocity({'left':'52%'}, 'slow', function(){
        socket.emit(capture, {data: data, id: sessionId, name: app.session, projet:app.projet});  
      });
    }
    else{
      //console.log('right NOT class active')
      socket.emit(capture, {data: data, id: sessionId, name: app.session, projet:app.projet});
    }
  }

  function saveFeedback(icone){
    
    var $iconeFeedback = $("<div class='icone-feedback'><img src='"+icone+"'></div>");
    $("body").append( $iconeFeedback );

    $iconeFeedback.fadeIn('slow').velocity({"top":"25px", "left":"95.6%", "width":"20px"},"slow", "ease", function(){
      $(this).fadeOut('slow', function(){
        $(this).remove();
        $(".count-add-media.plus-media").fadeIn('slow', function(){
          $(this).fadeOut('slow');
        });
      });
    });
  }

  function deleteFeedback(){
    $(".count-add-media.moins-media").fadeIn('slow', function(){
      $(this).fadeOut('slow');
    });
  }

  function timestampToDate(timestamp){
    date = new Date(timestamp * 1000),
    datevalues = [
       date.getFullYear(),
       date.getMonth()+1,
       date.getDate(),
       date.getHours(),
       date.getMinutes(),
       date.getSeconds(),
    ];
    console.log(datevalues);
  }


  
});