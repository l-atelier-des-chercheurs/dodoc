
var stopMotionMode = (function() {

  var isRunning = false;
  var isRecording = false;

  var $preview = $(".preview_stopmotion");
  var $startsm = $("#start-sm-btn");
  var $capturesm = $("#capture-sm-btn");
  var $finishsm = $(".js--finish-stopmotion");

  function startStopMotion(){

    if( mediaJustCaptured())
      return;

    console.log('start stop-motion');

    $startsm.hide();
    $capturesm.show();

    $preview.find('.js--delete-media-capture').hide();

    $preview.find('.output').attr('src', '');
    animateWindows();

    isRecording = true;

    var mediaData = {};
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;

    // get a first image to send with project data
    var imageData = currentStream.getStaticImageFromVideo();
    mediaData.imageContent = imageData;

    socket.emit( 'startStopMotion', mediaData);
  }

  function takeStopMotionPic() {

    if( mediaJustCaptured())
      return;

    isRecording = true;

    var smCacheName = $("body").data( "smCacheName");
    var smCachePath = $("body").data( "smCachePath");
    var imageData = currentStream.getStaticImageFromVideo();

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

  }

  function removeImageFromStopMotion( imagePath) {

  // MISSING
    var mediaToDelete =
    {
      "pathToStopmotionImage" : imagePath,
    }
    socket.emit( 'deleteLastImageOfStopMotion', mediaToDelete);

  }


  function stopStopMotion( ) {

    isRecording = false;

    var smCacheName = $("body").data( "smCacheName");
    var smCachePath = $("body").data( "smCachePath");

    $capturesm.hide();

    $preview.find('.preview_stopmotion--container').empty();

    saveFeedback("/images/icone-dodoc_anim.png");

    var mediaData =
    {
      "stopMotionCacheFolder" : smCacheName,
      "mediaType" : "animation"
    }

    // send instruction to finish stopmotion
    sendData.createNewMedia( mediaData);

    $startsm.show();

  }


  return {

    init : function() {
      isRunning = true;
      $startsm.off().on('click', startStopMotion);
      $capturesm.off().on('click', takeStopMotionPic);
      $finishsm.off().on('click', stopStopMotion);
      $preview.show();
      $preview.find('.output').attr('src', '');
      $preview.find('.js--delete-media-capture').hide();

      if(isRecording)
        animateWindows();
    },

    stop : function() {
      isRunning = false;
      $preview.find('.output').attr('src', '');
    },

    onNewStopmotionImage : function( smdata) {

      var imagePath = smdata.imageFullPath.substring( dodoc.contentDir.length);

      // create a new lastImage preview
      var newPreview = $('.js--templates .stopmotion_lastImagePreview').clone( false);

      // delete last stopmotion image
      newPreview.on('click', '.js--delete-sm-lastimage', function(){
        removeImageFromStopMotion( imagePath);
        $(this).closest('.stopmotion_lastImagePreview').fadeOut(600, function() { $(this).remove(); });
      });

      newPreview.find('img').attr("src", imagePath);
      $preview.find('.preview_stopmotion--container').append( newPreview);

    },

    onStopMotionDirectoryCreated : function( newStopMotionData) {

      var folderCacheName = newStopMotionData.folderCacheName;
      var folderCachePath = newStopMotionData.folderCachePath;

      $("body").data( "smCacheName", folderCacheName);
      $("body").data( "smCachePath", folderCachePath);
    },

    showStopMotionPreview : function( pathToMediaFile) {
      $preview.find('.output').attr( 'src', pathToMediaFile);
      $preview.find('.js--delete-media-capture').show();
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






