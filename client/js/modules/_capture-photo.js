
var imageMode = (function() {

  var $preview = $(".preview_image");
  var isRunning = true;
  var $captureflash = $(".captureRight .flash");
  var $btn_deleteLastMedia = $preview.find(".js--delete-media-capture");

  var API = {
    init : function() {
      $(".photo-capture #capture-btn").off().on('click', _takePictures);
      isRunning = true;

      $btn_deleteLastMedia.hide().off().click(function(){
        var mediaToDelete = {
          "mediaName" : $(document).data('lastCapturedMediaName'),
          "mediaFolderPath" : $(document).data('lastCapturedMediaFolderPath'),
        }
        sendData.deleteMedia(mediaToDelete);
        backAnimation();
        _clearPreview();
      });
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
      _takePictures();
    },
  }

  function _takePictures() {

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
      alertify.error( dodoc.lang().videoStreamNotAvailable + '<br><em>' + JSON.stringify(err) + '</em>');
    });
  }

  function _clearPreview() {
    $preview.find('img.js--output').attr('src', '');
    $btn_deleteLastMedia.hide()
  }


  return API;
})();


