
/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listProject', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


var thisProjectName;
var thisProject;
var imageData = null;
var $thisEl;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('listOneProject', onListOneProject);
socket.on('listAllMedias', onListAllMedias);
socket.on('listOneProjectPublis', onListOneProjectPublis);

socket.on('projectModified', onProjectModified); //Quand on reçoit les modification du projet
socket.on('projectRemoved', onProjectRemoved);

socket.on('publiCreated', onPubliCreated);
socket.on('publiRemoved', onPubliRemoved);

socket.on('mediaCreated', onMediaCreated);
socket.on('mediaUpdated', onMediaUpdated);
socket.on('mediaRemoved', onMediaRemoved);


jQuery(document).ready(function($) {
	$(document).foundation();

});

function onListOneProject( projectData){
  // only list projects that belong to this page (if another user loads another project page, for example)
  if( projectData.slugFolderName !== currentFolder || projectData.slugProjectName !== currentProject)
    return;

  var $project = loadProject( projectData);
  insertOrReplaceProject( $project, $(".mainContent .project-list"));
	socket.emit( 'listOneProjectMedias', projectData);
	socket.emit( 'listOneProjectPublis', projectData);
}

// COMMON WITH PROJECT.JS

function onListAllMedias( mediasData) {

  var $getAllMediasFormatted = listAllMedias( mediasData)
  var $mediaContainer = $("#container .project .last-medias");
  $getAllMediasFormatted.each( function() {
    insertOrReplaceMedia( $(this), $mediaContainer);
  });
}


function onPubliCreated(publisData){
  console.log( "onPubliCreated");
  onListOneProjectPublis( publisData);
}

function onPubliRemoved(publisData) {
  console.log( "onPubliRemoved");
  onRemoveOnePublis( publisData);
}


function onListOneProjectPublis( publisData) {
  // get the data
  var $getAllPublisFormatted = listPublis( publisData);
  var $publiLibrary = $(".mainContent .montage-list .list-publi");

  $getAllPublisFormatted.each( function() {
    $thisPubliItem = $(this);
    insertOrReplacePubli( $thisPubliItem, $publiLibrary);
  });
}

function onRemoveOnePublis(publisData) {
  removeThisPubli( $(".mainContent .montage-list ul"), publisData.slugPubliName);
}

// Envoie les données du projet au serveur

// On reçoit les mofication du projet
function onProjectModified( projectData){
  onListOneProject( projectData);
}


//Remove the project from list
function onProjectRemoved( projectData){
  if( projectData.slugFolderName !== currentFolder || projectData.slugProjectName !== currentProject)
    return;
	window.location.replace('/'+currentFolder);
}

function onMediaRemoved( mediaData){
  console.log( "onMediaRemoved");
  if( mediaData.slugFolderName !== currentFolder || mediaData.slugProjectName !== currentProject)
    return;
  removeMedia( $('.last-medias .media'), mediaData);
}

// returns when a text content has been added
function onMediaCreated( mediasData) {
  console.log( "onMediaCreated");
  var $getAllMediasFormatted = listAllMedias(mediasData);
  var $mediaContainer = $(".mainContent .last-medias");

  $getAllMediasFormatted.each( function() {
    var $m = $(this);
    $m.attr('data-oninsert', 'slideFromTop');
    insertOrReplaceMedia( $m, $mediaContainer);
  });
}


function onMediaUpdated( mediasData) {
  var $getAllMediasFormatted = listAllMedias( mediasData);
  var $mediaContainer = $(".mainContent .last-medias");

  $getAllMediasFormatted.each( function() {
    var $m = $(this);
    $m.attr('data-oninsert', 'blink');
    insertOrReplaceMedia( $m, $mediaContainer);
  });

}

function onListAllMedias( mediasData) {
  var $getAllMediasFormatted = listAllMedias( mediasData);
  var $mediaContainer = $(".mainContent .last-medias");

  $getAllMediasFormatted.each( function() {
    insertOrReplaceMedia( $(this), $mediaContainer);
  });
}



