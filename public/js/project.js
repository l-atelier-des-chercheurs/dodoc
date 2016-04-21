
/* VARIABLES */
var socket = io.connect();

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
socket.on('listMediasOfOneType', onListMediasOfOneType);
// socket.on('listProjectPubli', onListProjectPubli);
socket.on('listPublications', onListPublications);

socket.on('projectModified', onProjectModified); //Quand on reçoit les modification du projet
socket.on('projectRemoved', onProjectRemoved);

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
	socket.emit( 'listMedias', projectData);
	socket.emit( 'listPublis', projectData);
}

// COMMON WITH PROJECT.JS

function onListMediasOfOneType( mediasData) {

  var $getAllMediasFormatted = listMediasOfOneType( mediasData)
  var $mediaContainer = $("#container .project .last-medias");
  $getAllMediasFormatted.each( function() {
    insertOrReplaceMedia( $(this), $mediaContainer);
  });
}

function onListPublications( publisData) {
  // get the data
  var $getAllPublisFormatted = listPublis( publisData);
  var $publiLibrary = $(".mainContent .montage-list .list-publi");

  $getAllPublisFormatted.each( function() {
    $thisPubliItem = $(this);
    insertOrReplacePubli( $thisPubliItem, $publiLibrary);
  });
}


function onListProjectPubli( publisData) {
	var $allPublis = $();

	for (var i = 0; i < arrayPubli.length; i++) {
		var publiPath = '/'+currentFolder+'/'+currentProject+'/publication/'+ convertToSlug(arrayPubli[i]);
		var editPath = '/'+currentFolder+'/'+currentProject+'/bibliotheque/panneau-de-publications#'+ convertToSlug(arrayPubli[i]);

		var publiItem = $(".js--templates > .publi-folder").clone(false);
		publiItem
			.find( 'h2').html(arrayPubli[i]).end()
			.find( '.js--edit_view', publiPath).attr('href', editPath).end()
			.find( '.js--publi_view', publiPath).attr('href', publiPath).end()
		;

		$allPublis = $allPublis.add(publiItem);

	}

  projectClone.find( '.list-publi').append( $allPublis);
	projectClone.appendTo('.project-list');

}


// Envoie les données du projet au serveur

// On reçoit les mofication du projet
function onProjectModified( projectData){
  onListOneProject( projectData);
}

//Suppression du dossier

// Si un fichier existe déjà, affiche un message d'alerte
function onProjectAlreadyExist(data){
	alert("Le nom de projet " + data.name + " existe déjà. Veuillez trouvez un autre nom.");
	$('.new-project').focus();
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


  var mediaData = getFirstMediaFromObj( mediasData);

  if( mediaData.slugFolderName !== currentFolder || mediaData.slugProjectName !== currentProject)
    return;

  var $updatedMedia = listMedia( mediaData);
  debugger;
  var $mediaContainer = $(".mainContent .last-medias");
  insertOrReplaceMedia( $updatedMedia, $mediaContainer);

}

function onMediaUpdated( mediasData) {
  console.log( "onMediaUpdated");
  onMediaCreated( mediasData);
}


