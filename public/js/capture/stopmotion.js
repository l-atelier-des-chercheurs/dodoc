/*************

  should rewrite each mode as a single var with functions...

  **************/

var stopMotionMode = (function() {

  var $preview = $(".preview_stopmotion");

  function startStopMotion(){
    countImage = 0;
    console.log('start stop-motion');
    $("#start-sm-btn").hide();
    $("#capture-sm-btn").show();
    $("#stop-sm-btn").hide();
    $('.js--delete-media-capture').hide();
    $('#video-stream').hide();

    animateWindows();

    var mediaData = {};
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;

    socket.emit( 'startStopMotion', mediaData);
  }

  function takeStopMotionPic() {

    var smCacheName = $("body").data( "smCacheName");
    var smCachePath = $("body").data( "smCachePath");
    var smImageCount = parseInt( $("body").data( "smImageCount")) + 1;

    var invisibleCanvas = document.createElement('canvas');
    invisibleCanvas.width = dodoc.captureVideoWidth;
    invisibleCanvas.height = dodoc.captureVideoHeight;
    var invisibleCtx = invisibleCanvas.getContext('2d');

    invisibleCtx.drawImage( currentStream.getVideoFrame(), 0, 0, invisibleCanvas.width, invisibleCanvas.height);
    var imageData = invisibleCanvas.toDataURL('image/png');

    var smImage =
    {
      "imageContent" : imageData,
      "folderCacheName" : smCacheName,
      "folderCachePath" : smCachePath,
      "imageCount" : smImageCount
    };

    socket.emit( 'addImageToStopMotion', smImage);

    $('body').addClass('takingstopmotion');
    $(".captureRight .flash").fadeIn(0, function(){
      $(this).fadeOut(500);
    });

    $('body').attr('data-justcaptured', 'yes');
    setTimeout( function() {
      $('body').attr('data-justcaptured', '');
    }, 600);

    $('body').data( "smImageCount", smImageCount);

  }

  function removeImageFromStopMotion( imagePath) {

  // MISSING
    var mediaToDelete =
    {
      "pathToStopmotionImage" : imagePath,
    }
    socket.emit( 'deleteLastImageOfStopMotion', mediaToDelete);

    var smImageCount = parseInt( $("body").data( "smImageCount")) - 1;
    $('body').data( "smImageCount", smImageCount);



  }


  function stopStopMotion( ) {

    var smCacheName = $("body").data( "smCacheName");
    var smCachePath = $("body").data( "smCachePath");

    $("#stop-sm-btn").hide();
    $("#capture-sm-btn").hide();

    $preview.find('.preview_stopmotion--container').remove();

    saveFeedback("/images/icone-dodoc_anim.png");

    var mediaData =
    {
      "stopMotionCacheFolder" : smCacheName,
      "mediaType" : "animation"
    }

    // send instruction to finish stopmotion
    sendData.createNewMedia( mediaData);

    $("#start-sm-btn").show();
    $('.js--delete-media-capture').show();

  }


  return {

    init : function() {
      $("#capture-sm-btn").off().on('click', takeStopMotionPic);
      $("#stop-sm-btn").off().on('click', stopStopMotion);
      $preview.show();
      startStopMotion();
    },

    stop : function() {

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
      newPreview.find('.image_count').html('<span>Image n° "' + smdata.imageCount + '"</span>');

      $preview.find('.preview_stopmotion--container').append( newPreview);

    },

    onStopMotionDirectoryCreated : function( newStopMotionData) {

      var folderCacheName = newStopMotionData.folderCacheName;
      var folderCachePath = newStopMotionData.folderCachePath;

      $("#stop-sm-btn").show();

      $("body").data( "smCacheName", folderCacheName);
      $("body").data( "smCachePath", folderCachePath);
      $("body").data( "smImageCount", 0);
    },

  }

})();






