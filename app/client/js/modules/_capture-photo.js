
var imageMode = (function() {

  var $preview = $(".preview_image");
  var isRunning = true;
  var $captureflash = $(".captureRight .flash");

  function takePictures() {

    if( mediaJustCaptured())
      return;

    currentStream.getStaticImageFromVideo().then(function(imageData) {
      $captureflash.fadeIn(0);
      var mediaData =
      {
        "mediaType" : "photo",
        "mediaData" : imageData
      }
      // send instruction to record photo
      sendData.createNewMedia( mediaData);

      $preview.find('img.js--output').attr('src', '');

      justCaptured();
      saveFeedback("/images/i_icone-dodoc_image.svg");
    }, function(err) {
      console.log('err ' + err);
      alertify.error( dodoc.lang.videoStreamNotAvailable + '<br><em>' + JSON.stringify(err) + '</em>');
    });
  }


  return {
    init : function() {
      $(".photo-capture #capture-btn").off().on('click', takePictures);
      $preview.find('.js--delete-media-capture').hide();
      $preview.find('img.js--output').attr('src', '');
      isRunning = true;
    },

    stop: function() {
      isRunning = false;
    },
    showImagePreview : function( pathToMediaFile) {
      $preview.find('img.js--output').attr("src", pathToMediaFile);
      $preview.find('.js--delete-media-capture').show();
      $captureflash.fadeOut(200);
    },

    isRunning: function() {
      return isRunning;
    },
    // function that takes a picture if the mode is enabled
    captureButtonPress: function() {
      if(!isRunning) return;
      takePictures();
    },
  }
})();


