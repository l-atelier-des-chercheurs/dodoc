/*************

  should rewrite each mode as a single var with functions...

  **************/

var imageMode = (function() {

  var $preview = $(".preview_image");

  // Fonction qui prend les photos
  function takePictures() {

    if( mediaJustCaptured())
      return;

    var videoFrame = currentStream.getVideoFrame();

    var invisibleCanvas = document.createElement('canvas');
    invisibleCanvas.width = videoFrame.width;
    invisibleCanvas.height = videoFrame.height;
    var invisibleCtx = invisibleCanvas.getContext('2d');

    debugger;
    invisibleCtx.drawImage( videoFrame.feed, 0, 0, invisibleCanvas.width, invisibleCanvas.height);
    var imageData = invisibleCanvas.toDataURL('image/png');

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
    $preview.attr('src', '');

    justCaptured();
    saveFeedback("/images/icone-dodoc_image.png");
  }


  return {
    init : function() {
      $(".photo-capture #capture-btn").off().on('click', takePictures);
      $preview.find('.js--delete-media-capture').hide();
      $preview.attr('src', '');
    },
    showImagePreview : function( pathToMediaFile) {
      $preview.find('.output').attr("src", pathToMediaFile);
      $preview.find('.js--delete-media-capture').show();
    },
  }

})();


