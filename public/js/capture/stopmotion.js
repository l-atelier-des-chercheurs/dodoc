// STOP MOTION
// Start Stop Motion
function startStopMotion(){
  countImage = 0;
  console.log('start stop-motion');
  $("#start-sm-btn").hide();
  $("#capture-sm-btn").show();
  $("#stop-sm-btn").hide();
  $('.js--delete-media-capture').hide();
  $('#camera-preview').hide();

  var iconeSM = '<div class="icone-stopmotion"><img src="/images/stopmotion.svg"></div>';
  var text = '<h4>Vous venez de créer un nouveau stop motion.</br>Cliquez que le <b>bouton d\'enregistrement</b> pour commencer à prendre des photos</h4>'
  var htmlToAdd = '<div class="instructions-stopmotion">'+iconeSM+text+'</div>';
  $('.screenshot').append(htmlToAdd);

  animateWindows();

  $(".screenshot").append("<div class='meta-stopmotion'><div class='delete-image js--delete_image'><img src='/images/clear.svg'></div><p class='count-image'></p></div>");
  $(".screenshot .meta-stopmotion").hide();

  var mediaData = {};
  mediaData.slugFolderName = currentFolder;
  mediaData.slugProjectName = currentProject;

  socket.emit( 'startStopMotion', mediaData);
}

function onStopMotionDirectoryCreated( newStopMotionData) {

  var folderCacheName = newStopMotionData.folderCacheName;
  var folderCachePath = newStopMotionData.folderCachePath;

  $("#stop-sm-btn").show();
  $('.screenshot .canvas-view').show();
  $('.screenshot .instructions-stopmotion').remove();
  $(".screenshot .meta-stopmotion").show();

  $("body").data( "smCacheName", folderCacheName);
  $("body").data( "smCachePath", folderCachePath);
  $("body").data( "smImageCount", 0);
}

function takeStopMotionPic() {

  var smCacheName = $("body").data( "smCacheName");
  var smCachePath = $("body").data( "smCachePath");
  var smImageCount = parseInt( $("body").data( "smImageCount")) + 1;

  var invisibleCanvas = document.createElement('canvas');
  invisibleCanvas.width = dodoc.captureVideoWidth;
  invisibleCanvas.height = dodoc.captureVideoHeight;
  var invisibleCtx = invisibleCanvas.getContext('2d');

  invisibleCtx.drawImage(video, 0, 0, invisibleCanvas.width, invisibleCanvas.height);
  var imageData = invisibleCanvas.toDataURL('image/png');

  var smImage =
  {
    "imageContent" : imageData,
    "folderCacheName" : smCacheName,
    "folderCachePath" : smCachePath,
    "imageCount" : smImageCount
  };

  socket.emit( 'addImageToStopMotion', smImage);

  $(".screenshot .count-image").html("<span>Image n° " + smImageCount + "</span>");
  $('body').addClass('takingstopmotion');
  $(".captureRight .flash").fadeIn(0, function(){
    $(this).fadeOut(500);
  });

  $('body').attr('data-justcaptured', 'yes');
  setTimeout( function() {
    $('body').attr('data-justcaptured', '');
  }, 600);

  $("body").data( "smImageCount", smImageCount);

}

function onNewStopmotionImage( smdata) {

  var imagePath = smdata.imageFullPath;
  imagePath = imagePath.substring( dodoc.contentDir.length);
  $(".preview_stopmotion").show().attr("src", imagePath);

/*
  $(document)
    .data('lastCapturedMediaName', mediaName)
    .data('lastCapturedMediaFolderPath', mediasFolderPath)
    ;
*/
}

function removeLastImageFromStopMotion() {

// MISSING
  var smCacheName = $("body").data( "smCacheName");
  var smCachePath = $("body").data( "smCachePath");
  var smImageCount = parseInt( $("body").data( "smImageCount"));
  socket.emit( 'deleteLastImageOfStopMotion', smImage);

}



function stopStopMotion( ) {

  var smCacheName = $("body").data( "smCacheName");
  var smCachePath = $("body").data( "smCachePath");
  var smImageCount = parseInt( $("body").data( "smImageCount")) + 1;

  $("#stop-sm-btn").hide();
  $("#capture-sm-btn").hide();
  countPress = 0;
  $('.screenshot .meta-stopmotion').remove();
  $(".preview_stopmotion").attr('src', '').hide();
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

  $('body').removeClass('takingstopmotion');


}

