/* VARIABLES */
var socket = io.connect();


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log( 'Connected ' + sessionId);
	socket.emit( 'listOneProjectMedias', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
	socket.emit( 'listOneProjectPublis', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('listAllMedias', onListAllMedias);

socket.on('listOneProjectPublis', onListOneProjectPublis);

socket.on('mediaCreated', onMediaCreated);
socket.on('mediaUpdated', onMediaUpdated);
socket.on('mediaRemoved', onMediaRemoved);

socket.on('publiCreated', onPubliCreated);
socket.on('publiMetaUpdated', onPubliMetaUpdated);

socket.on('listOnePubliMetaAndMedias', onListOnePubliMetaAndMedias);
socket.on('publiMediasAndMediasUpdated', onPubliMediasAndMediasUpdated);


jQuery(document).ready(function($) {
	$(document).foundation();
	init();
});

function init(){

  // le drag and drop avec dragula se fait maintenant dans le fichier dom_autoscroller.js
  // en attendant de faire mieux
  publi.init();

	$(".js--open_publicationspane").on( 'click', function(e) {
  	e.preventDefault();
  	$('body').attr( "data-publicationpane", $('body').attr('data-publicationPane') === 'open' ? '' : 'open');
  });
	// Au click sur un media
	$('body').on('click', '.medias-list .media', function(){
		$m = $(this);
		modals.bigMedia($m);
  });
  // Au click sur le bouton "submit" d'un popup de texte
  $('.js--submit-new-text').on('click',function(){
    modals.createTextMedia();
  });

  // si en arrivant sur la page, il y a un hash dans l'url
  // alors ouvrir la publication qui a ce nom directement
  var urlHash = window.location.hash;
  if( urlHash.length > 0){
    setTimeout(function() {
      $('.montage-list [data-publi=' + urlHash.substring(1) + ']').find('.js--edit_view').trigger( 'click');
    }, 250);
  }

 // Ajoute ou enlève un highlight quand on clique sur le drapeau dans les médias
  $('body').on('click', '.js--flagMedia', function(e){
  	e.stopPropagation();
		var $thisMedia = $(this).closest(".media");
		var medianame = $thisMedia.attr("data-medianame");
		var mediaFolderPath = $thisMedia.attr("data-mediatype");
    var editMediaData =
    {
      "mediaName" : medianame,
      "mediaFolderPath" : mediaFolderPath,
      "switchFav" : true
    };
    sendData.editMedia( editMediaData);
  });

}

function onListAllMedias( mediasData) {

  var $getAllMediasFormatted = listAllMedias( mediasData);
  var $mediaContainer = $(".mainContent .medias-list");

  $getAllMediasFormatted.each( function() {
    insertOrReplaceMedia( $(this), $mediaContainer);
  });
}


/**********************************************************************
              MEDIA CREATED OR UPDATED
**********************************************************************/

// returns when a text content has been added
function onMediaCreated( mediasData) {
  console.log( "onMediaCreated");
  onListAllMedias( mediasData);
}

function onMediaUpdated( mediasData) {
  console.log( "onMediaUpdated");
  onListAllMedias( mediasData);
}


function onMediaRemoved( mediaData){
  console.log( "onMediaRemoved");
  if( mediaData.slugFolderName !== currentFolder || mediaData.slugProjectName !== currentProject)
    return;
  removeMedia( $('.medias-list .media'), mediaData);
}

/**********************************************************************
              PUBLIS
**********************************************************************/

function onListOneProjectPublis( publisData) {
  // get the data
  var $getAllPublisFormatted = listPublis( publisData);
  var $publiLibrary = $(".mainContent .montage-list ul");
  var $montage = $('.montage-edit-container .montage-edit');

  // insert or replace publi in the list of publications
  $getAllPublisFormatted.each( function() {
    $thisPubliItem = $(this);
    insertOrReplacePubli( $thisPubliItem, $publiLibrary);
  });
}

function onPubliCreated(publisData){
  console.log( "onPubliCreated");
  onListOneProjectPublis( publisData);
}

function onPubliMetaUpdated( publisData) {
  console.log( "onPubliMetaUpdated");
  onListOneProjectPublis( publisData);
}


function onListOnePubliMetaAndMedias( psdata) {
  console.log( "onListOnePubliMetaAndMedias");

  // check if a publi content was requested (not ideal, we could use a session tag in the json to check but also not ideal).
  var $publiContent = $('.montage-edit-container .montage-edit');
  var publiRequested = $publiContent.data('publirequested');

  if( publiRequested === '')
    return;

  // there will only be one but let's use similar code to
  $.each( psdata, function( slugPubliName, pdata) {
    listPubliContent( publiRequested, pdata, $publiContent);

    $publiContent.data('publishown', publiRequested);
    $publiContent.data('publirequested', '');

    $(document).trigger('restart_dragula');

  });
}

function onPubliMediasAndMediasUpdated( psdata) {
  console.log( "onPubliMediasAndMediasUpdated");

  debugger;

  // check if a publi content was requested (not ideal, we could use a session tag in the json to check but also not ideal).
  var $publiContent = $('.montage-edit-container .montage-edit');
  var publiShown = $publiContent.data('publishown');

  $.each( psdata, function( slugPubliName, pdata) {
    listPubliContent( publiShown, pdata, $publiContent);
  });
}

