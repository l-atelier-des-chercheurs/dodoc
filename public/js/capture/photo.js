/*************

  should rewrite each mode as a single var with functions...

  **************/

var imageMode = (function() {

  var $preview = $(".preview_image");

  // Fonction qui prend les photos
  function takePictures() {

    var invisibleCanvas = document.createElement('canvas');
    invisibleCanvas.width = dodoc.captureVideoWidth;
    invisibleCanvas.height = dodoc.captureVideoHeight;
    var invisibleCtx = invisibleCanvas.getContext('2d');

    invisibleCtx.drawImage( currentStream.getVideoFrame(), 0, 0, invisibleCanvas.width, invisibleCanvas.height);
    var imageData = invisibleCanvas.toDataURL('image/png');

    $(".captureRight .flash").fadeIn(0, function(){
      $(this).fadeOut(500);
    });
    console.log("Yeah you take a picture");

    // passer le body en "data-justcaptured=yes" pendant un temps
    $('body').attr('data-justcaptured', 'yes');
    setTimeout( function() {
      $('body').attr('data-justcaptured', '');
    }, 600);

    var mediaData =
    {
      "mediaType" : "photo",
      "mediaData" : imageData
    }
    // send instruction to record photo
    sendData.createNewMedia( mediaData);
    $preview.attr('src', '');
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


