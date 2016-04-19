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

  $(".screenshot").append("<div class='meta-stopmotion'><div class='delete-image'><img src='/images/clear.svg'></div><p class='count-image'></p></div>");
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

  var factor = video.getBoundingClientRect().width / $(".screenshot")[0].getBoundingClientRect().width;;
  canvas.width = video.getBoundingClientRect().width / factor;
  canvas.height = video.getBoundingClientRect().height / factor;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  var data = canvas.toDataURL('image/png');

  photo.setAttribute('src', data);
  $(".meta-stopmotion .delete-image").off();
/*
  $(".meta-stopmotion .delete-image").on('click', function(){
    removeImageMotion(data, folderCache);
  });
*/

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

function removeLastImageFromStopMotion() {

// MISSING

}
/*
function removeImageMotion(data, dir){
  if(countImage > 1){
    console.log("delete Image");
    socket.emit("deleteImageMotion", {data: data, name: currentFolder, dir: dir, count: countImage});
    countImage = countImage - 1;
    var context = canvas.getContext('2d');
    var imageObj = new Image();
    imageObj.onload = function() {
      context.drawImage(imageObj, 0, 0);
    };
    imageObj.src = "/" + currentFolder +"/"+ currentProject+"/01-stopmotion/" + countImage + ".png";
    $(".screenshot .count-image").html("<span>Image n° " + countImage+"</span>");
  }
  else{
    startStopMotion();
  }
}
*/

function stopStopMotion( ) {

  var smCacheName = $("body").data( "smCacheName");
  var smCachePath = $("body").data( "smCachePath");
  var smImageCount = parseInt( $("body").data( "smImageCount")) + 1;

  $("#stop-sm-btn").hide();
  $("#capture-sm-btn").hide();
  countPress = 0;
  $('.screenshot .meta-stopmotion').remove();
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
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  $('body').removeClass('takingstopmotion');


}

