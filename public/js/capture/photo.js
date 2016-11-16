
var imageMode = (function() {

  var $preview = $(".preview_image");
  var isRunning = true;

  function takePictures() {

    if( mediaJustCaptured())
      return;

    currentStream.getStaticImageFromVideo().then(function(imageData) {
      $(".captureRight .flash").fadeIn(0, function(){
        $(this).fadeOut(500);
      });
      console.log("Yeah you take a picture");


      var mediaData =
      {
        "mediaType" : "photo",
        "mediaData" : imageData
      }
      // send instruction to record photo
      sendData.createNewMedia( mediaData);

      $preview.find('img.js--output').attr('src', '');

      justCaptured();
      saveFeedback("/images/icone-dodoc_image.png");
    }, function(err) {
      console.log('err ' + err);
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


