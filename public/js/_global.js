
/* fonction accessible à l'extérieur :
    - listMediasOfOneType


*/

function listMediasOfOneType( mediasData) {
  var $allMedias = $();
  var lastMedias = mediasData;
  $.each( lastMedias, function( pathToTypeMediaFolder, mediaJsonNames) {
    console.log( pathToTypeMediaFolder);
    console.log( mediaJsonNames);

    // récupérer toutes les infos des JSON
    var getAllJsonNames = Object.getOwnPropertyNames( mediaJsonNames);
    var pathMediaFolder = pathToTypeMediaFolder;

    $.each( getAllJsonNames, function( key, metaJsonName) {

      var thisMediaJsonValues = mediaJsonNames[metaJsonName];
      var mediaFilenames = thisMediaJsonValues.files;

      // penser au cas de figure ou deux files sont trouvés (vidéo)

      // penser au cas de figure ou un texte est trouvé
      var newMedia = listOneMedia( pathMediaFolder, metaJsonName, mediaFilenames);
      $allMedias = $allMedias.add( newMedia);
    });
  });

  return $allMedias;
}

function listOneMedia( pathMediaFolder, metaJsonName, mediaFilenames) {

  var $currentMedia = '';

  if( pathMediaFolder === dodoc.projectPhotosFoldername)
    $currentMedia = showImage( pathMediaFolder, metaJsonName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectAnimationsFoldername)
    $currentMedia = showAnimation( pathMediaFolder, metaJsonName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectVideosFoldername)
    $currentMedia = showVideo( pathMediaFolder, metaJsonName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectAudiosFoldername)
    $currentMedia = showAudio( pathMediaFolder, metaJsonName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectTextsFoldername)
    $currentMedia = showText( pathMediaFolder, metaJsonName, mediaFilenames);

  return $currentMedia;
}

function showImage( pathMediaFolder, metaJsonName, mediaFilenames) {

  var pathToFile = pathMediaFolder + '/' + mediaFilenames[0];

	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem
	  .attr( 'data-metaJsonName', metaJsonName)
	  .attr( 'data-mediatype', pathMediaFolder)
    .find( 'img').attr('src', pathToFile)
    ;
	return mediaItem;
}

function showAnimation( pathMediaFolder, metaJsonName, mediaFilenames) {

  var videoFilename;
  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = pathMediaFolder + '/' + thumbFilename;
  var pathToVideoFile = pathMediaFolder + '/' + videoFilename;

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
	  .attr( 'data-metaJsonName', metaJsonName)
	  .attr( 'data-mediatype', pathMediaFolder)
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}
function showVideo( pathMediaFolder, metaJsonName, mediaFilenames) {

  var thumbFilename;
  var videoFilename;

  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = pathMediaFolder + '/' + thumbFilename;
  var pathToVideoFile = pathMediaFolder + '/' + videoFilename;

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
	  .attr( 'data-metaJsonName', metaJsonName)
	  .attr( 'data-mediatype', pathMediaFolder)
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showAudio( pathMediaFolder, metaJsonName, mediaFilenames) {
  var pathToFile = pathMediaFolder + '/' + mediaFilenames[0];

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
	  .attr( 'data-metaJsonName', metaJsonName)
	  .attr( 'data-mediatype', pathMediaFolder)
    .find( 'source').attr( 'src', pathToFile)
    ;
	return mediaItem;
}