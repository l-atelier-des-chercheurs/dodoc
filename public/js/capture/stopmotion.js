
var stopMotionMode = (function() {

  var isRunning = false;
  var isRecording = false;

  var $preview = $(".preview_stopmotion");
  var $previewOutput = $preview.find(".output_container");
  var $startsm = $("#start-sm-btn");
  var $capturesm = $("#capture-sm-btn");
  var $previzsm = $preview.find(".js--previz-stopmotion");
  var $finishsm = $preview.find(".js--finish-stopmotion");
  var $backToAnimation = $preview.find(".js--delete-media-capture-stopmotion");
  
  var $lastStopmotionImage = $(".video-view .js--lastStopmotionImage");
  var $lastStopmotionImageSlider = $(".video-view .js--lastImageOpacity");

  var $previewContainer = $preview.find('.preview_stopmotion--container');
  var $timeline = $preview.find('.preview_stopmotion--timeline');

  function startStopMotion(){

    if( mediaJustCaptured())
      return;

    console.log('start stop-motion');

    $startsm.hide();
    $capturesm.show();

    $preview.find('.preview_stopmotion--container').empty();
    $preview.find('.preview_stopmotion--timeline').empty();
    $lastStopmotionImage.attr('src', '');
    $("body").data("smCacheName", "");
    $("body").data("smCachePath", "");
    $preview.find('.output').attr('src', '');
    $previewOutput.hide();

    justCaptured();
    animateWindows();

    isRecording = true;

    var mediaData = {};
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;

    // get a first image to send with project data
    currentStream.getStaticImageFromVideo().then(function(imageData) {  
      mediaData.imageContent = imageData;
      socket.emit( 'startStopMotion', mediaData);
    }, function(err) {
      console.log('err ' + err);
    });
  }

  function takeStopMotionPic() {

    if(mediaJustCaptured())
      return;

    isRecording = true;

    var smCacheName = $("body").data("smCacheName");
    var smCachePath = $("body").data("smCachePath");
    var imageData = currentStream.getStaticImageFromVideo();

    currentStream.getStaticImageFromVideo().then(function(imageData) {  

      var smImage =
      {
        "imageContent" : imageData,
        "folderCacheName" : smCacheName,
        "folderCachePath" : smCachePath
      };
  
      socket.emit( 'addImageToStopMotion', smImage);
  
      $('body').addClass('takingstopmotion');
      $(".captureRight .flash").fadeIn(0, function(){
        $(this).fadeOut(500);
      });
  
      justCaptured();
      animateWindows();
  
    }, function(err) {
      console.log('err ' + err);
    });

  }

  function removeImageFromStopMotion( imagePath) {
    var mediaToDelete =
    {
      "pathToStopmotionImage" : imagePath,
    }
    socket.emit( 'deleteLastImageOfStopMotion', mediaToDelete);

  }


  function previzStopMotion( ) {

    var smCacheName = $("body").data( "smCacheName");
    var smCachePath = $("body").data( "smCachePath");
    var frameRate = $preview.find('.preview_stopmotion--frameRate input').val();

    var mediaData =
    {
      "stopMotionCacheFolder" : smCacheName,
      "mediaType" : "animation",
      "frameRate" : frameRate
    }
    // send instruction to finish stopmotion
    sendData.createNewMedia( mediaData);

    $previewOutput.show();

  }

  function finishStopmotion( ) {
    isRecording = false;
    saveFeedback("/images/icone-dodoc_anim.png");

    $startsm.show();
    $capturesm.hide();

    backAnimation();
    stopMotionMode.init();

  }


  return {

    init : function() {
      isRunning = true;
      $startsm.off().on('click', startStopMotion);
      $capturesm.off().on('click', takeStopMotionPic);
      $previzsm.off().on('click', previzStopMotion);
      $finishsm.off().on('click', finishStopmotion);
      $preview.show();
      $preview.find('.output').attr('src', '');
      $previewOutput.hide();

      $lastStopmotionImageSlider.bind("change", function() {
        $lastStopmotionImage.css("opacity", $lastStopmotionImageSlider.val());
      });
      
      if(isRecording) {
        animateWindows();
      }
    },

    stop : function() {
      isRunning = false;
      $preview.find('.output').attr('src', '');
    },

    onNewStopmotionImage : function( smdata) {


      var imagePath = smdata.imageFullPath.substring( dodoc.contentDir.length);

      /********* LARGE PREVIEW ***************/
      var $newPreview = $('.js--templates .stopmotion_lastImagePreview').clone( false);
      /********* SMALL PREVIEW ***************/
      var $newSmallPreview = $('.js--templates .stopmotion_lastImageSmallPreview').clone( false);

      // delete last stopmotion image
      $newPreview.on('click', '.js--delete-sm-lastimage', function(){
        removeImageFromStopMotion( imagePath);
        $newPreview.fadeOut(600, function() { $(this).remove(); });
        $newSmallPreview.fadeOut(600, function() { $(this).remove(); });
      });
      $newSmallPreview.on('click', function() {
        $previewContainer.find('.stopmotion_lastImagePreview.is--active').removeClass('is--active');
        $timeline.find('.stopmotion_lastImageSmallPreview.is--active').removeClass('is--active');

        $newPreview.addClass('is--active');
        $newSmallPreview.addClass('is--active');
      });

      $previewContainer.find('.stopmotion_lastImagePreview.is--active').removeClass('is--active');
      $timeline.find('.stopmotion_lastImageSmallPreview.is--active').removeClass('is--active');

      $newPreview.addClass('is--active').find('img').attr("src", imagePath);
      $newSmallPreview.addClass('is--active').find('img').attr("src", imagePath);
      $lastStopmotionImage.attr("src", imagePath);

      $previewContainer.append( $newPreview);
      $timeline.append( $newSmallPreview);

    },

    onStopMotionDirectoryCreated : function( newStopMotionData) {

      var folderCacheName = newStopMotionData.folderCacheName;
      var folderCachePath = newStopMotionData.folderCachePath;

      $("body").data( "smCacheName", folderCacheName);
      $("body").data( "smCachePath", folderCachePath);
    },

    showStopMotionPreview : function( pathToMediaFile) {
      // to prevent cache from being used, we add a unix timestamp at the end of the filename
      $preview.find('.output').attr( 'src', pathToMediaFile + '?' + moment().format('x'));

      $backToAnimation.off().on('click', function() {
        var mediaToDelete =
        {
          "mediaName" : $(document).data('lastCapturedMediaName'),
          "mediaFolderPath" : $(document).data('lastCapturedMediaFolderPath'),
        }
        sendData.deleteStopmotion( mediaToDelete);
        $previewOutput.hide();
        $preview.find('.output').attr('src', '');
      });
    },

    isRunning: function() {
      return isRunning;
    },
    captureButtonPress: function() {
      if(!isRunning) return;
      if(isRecording) takeStopMotionPic();
      else startStopMotion();
    },
  }

})();






