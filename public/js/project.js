
var thisProjectName;
var thisProject;
var imageData = null;
var $thisEl;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('listOneProject', onListOneProject);
socket.on('listMediasOfOneType', onListMediasOfOneType);
socket.on('listProjectPubli', onListProjectPubli);
socket.on('projectModified', onProjectModified); //Quand on reçoit les modification du projet
socket.on('projectRemoved', onProjectRemoved);

jQuery(document).ready(function($) {
	$(document).foundation();
	init();

});

function init(){
	$('body').on('click', '.js--edit-project-icon', function(){
		$thisProject = $(this).closest(".project");
		modals.editProjectPopup( $thisProject);
	});
}


function onListOneProject( projectData){
  // only list projects that belong to this page (if another user loads another project page, for example)
  if( projectData.slugFolderName !== currentFolder || projectData.slugProjectName !== currentProject)
    return;
  var $project = loadProject( projectData);
  insertOrReplaceProject( $project, $(".mainContent .project-list"));
	socket.emit( 'listMedias', projectData);
}

// COMMON WITH PROJECT.JS

function onListMediasOfOneType( mediasData) {

  var $getAllMediasFormatted = listMediasOfOneType( mediasData)
  var $mediaContainer = $("#container .project .last-medias");
  $getAllMediasFormatted.each( function() {
    insertOrReplaceMedia( $(this), $mediaContainer);
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


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listProject', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};