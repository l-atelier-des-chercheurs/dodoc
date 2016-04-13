/* VARIABLES */
var socket = io.connect();

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listProjects', { "slugFolderName" : currentFolder});
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
socket.on('listAllProjectsOfOneFolder', onListAllProjectsOfOneFolder); // Liste tous les projets
socket.on('projectCreated', onProjectCreated); // Quand un dossier est crée !
socket.on('projectAlreadyExist', onProjectAlreadyExist); // Si le nom de dossier existe déjà.
socket.on('projectModified', onProjectModified); //Quand on reçoit les modification du projet
socket.on('projectRemoved', onProjectRemoved); // Quand le dossier a été supprimé sur le serveur

jQuery(document).ready(function($) {

	$(document).foundation();
	init();

});

function init(){



	submitProject($(".submit-new-project"), 'newProject'); //Envoie les données au serveur

	// Modifier les projets
	//Au click sur l'icone éditer
	$('body').on('click', '.js--edit-project-icon', function(){
		$thisProject = $(this).closest(".project");
		modals.editProjectPopup( $thisProject);
	});

	//remove modal modify folder when it's closing
	$(document).on('close.fndtn.reveal', '#modal-modify-project[data-reveal]', function () {
  	$("#modal-modify-project").empty();
	});

	//Au click sur le bouton supprimer le dossier
	$('body').on('click', '.js--deleteFolder', function(){
		$('#modal-delete-alert').foundation('reveal', 'open');
	});

	// Remove Folder
	removeProject();
}

// Envoie les données du dossier au serveur
function submitProject($button, send){
	$button.on('click', function(){
		var newProjectName = $('input.new-project').val();

		var jsonObj =
		{
		  "folder" : currentFolder,
		  "name": newProjectName,
		}

		if(imageData != null){

			console.log('Une image a été ajoutée');
			var f = imageData[0];
			var reader = new FileReader();
			reader.onload = function(evt){
				socket.emit(send, jsonObj);
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			socket.emit(send, jsonObj);
		}
		$('input.new-project').val('');
		$('#imageproject').val('');
	})
}

// Affiche le projet dès qu'il est crée
function onProjectCreated( projectData){

	$('input.new-project').val('');
	$('#modal-add-project').foundation('reveal', 'close');

  var $project = loadProject( projectData);
  insertOrReplaceProject( $project, $(".mainContent .project-list"));

}

// Affiche la liste des projets
function onListAllProjectsOfOneFolder( projectsData) {
  $.each( projectsData, function( index, projectData) {

    var $project = loadProject( projectData);
    insertOrReplaceProject( $project, $(".mainContent .project-list"));
  });
}

// On reçoit les mofication du projet
function onProjectModified(projectData){
  // only list projects that belong to this page (if another user loads another project page, for example)
  if( projectData.slugFolderName !== currentFolder)
    return;
  var $project = loadProject( projectData);
  insertOrReplaceProject( $project, $(".mainContent .project-list"));
}

//Suppression du dossier
function removeProject(){
	$('#modal-delete-alert button.oui').on('click', function(){
		console.log('oui ' + thisProjectName);
		console.log(thisProject);
		var projectToRemove =
		{
  		"name" : thisProjectName,
  		"folder" : currentFolder
		}
		socket.emit('removeProject', projectToRemove);

		$('#modal-delete-alert').foundation('reveal', 'close');
	});
	$('#modal-delete-alert button.annuler').on('click', function(){
		console.log('annuler');
		$('#modal-delete-alert').foundation('reveal', 'close');
		$(document).on('close.fndtn.reveal', '#modal-delete-alert[data-reveal]', function () {
	  	$('#modal-modify-folder').foundation('reveal', 'open');
		});
	});
}

// Si un projet existe déjà, affiche un message d'alerte
function onProjectAlreadyExist(data){
	alert("Le nom de projet " +data.name+ " existe déjà. Veuillez trouvez un autre nom.");
	$('.new-project').focus();
}

//Remove the folder from list
function onProjectRemoved( projectData){
  debugger;
  if( projectData.slugFolderName !== currentFolder)
    return;
  removeThisProject( $(".mainContent .project-list"), projectData.slugFolderName, projectData.slugProjectName);
}

