/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentFolder = app.folder;
var sessionName;

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
	// Create new project
	uploadImage("#imageproject");
	submitProject($(".submit-new-project"), 'newProject'); //Envoie les données au serveur

	// Modifier les projets
	//Au click sur l'icone éditer
	$('body').on('click', '.js--edit-project-icon', function(){
		thisProject = $(this).parents(".project");
		modifyProject($(this));
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
function onProjectCreated(data){

	var folderName = data.name;
	var createdDate = transformDatetoString(data.created);
	var statut = data.statut;
	var image = data.image;
	if(data.modified!= null){var modifiedDate = transformDatetoString(data.modified);}
	else{var modifiedDate = data.modified;}
	$('input.new-project').val('');
	$('#modal-add-project').foundation('reveal', 'close');
	displayProject(folderName, createdDate, modifiedDate, image, statut);
}

// Affiche la liste des projets
function onListAllProjectsOfOneFolder(data){
  data.forEach( loadProject);
  return;
}


// COMMON WITH PROJECT.JS
function loadProject( projectData) {

	var projectName = projectData.name;
	var slugProjectName = projectData.slugProjectName;

	var createdDate = transformDatetoString( projectData.created);
	var modifiedDate = transformDatetoString( projectData.modified);
	var statut = projectData.statut;

  var imageSrc;
  if( projectData.projectPreviewName !== undefined && projectData.projectPreviewName !== false)
  	imageSrc = projectData.projectPreviewName;

	displayProject( projectName, slugProjectName, createdDate, modifiedDate, statut, imageSrc);

	return;
}


function 	displayProject( name, projectNameSlug, created, modified, statut, imageSrc) {

	var $newProject = $(".js--templates > .project").clone(false);
	var path = './' + projectNameSlug;

  if( modified === null)
    $newProject.find('.modify-date').remove();
	if( imageSrc === undefined)
  	$newProject.find( '.image-wrapper img').remove();

  imageSrc = "./" + path + "/" + imageSrc;

  // customisation du projet
	$newProject
	  .attr( 'data-statut', statut)
	  .find( '.statut-type').text( statut).end()
	  .find( '.image-wrapper img').attr('src', imageSrc).attr('alt', name).end()
	  .find( '.create-date').text( created).end()
	  .find( '.modify-date').text( modified).end()
	  .find( '.title').text( name).end()
	  .find( '.project-link').attr( 'href', path).end()
	  .find( '.button-wrapper_capture').attr( 'href', path + '/capture').end()
	  .find( '.button-wrapper_bibli').attr( 'href',  path + '/bibliotheque/medias').end()
	  .find( '.button-wrapper_publi').attr( 'href', path + '/bibliotheque/panneau-de-publications').end()
	  .data( 'projectNameSlug', projectNameSlug)
  ;
	$("#container .project-list").prepend( $newProject);
}

function modifyProject($this){

	$("#container.row #modal-modify-project").empty();
	thisProjectName = $this.closest(".project").find('h2').text();
	thisProjectNameSlug = $this.closest(".project").data("projectNameSlug");

	var statut = $this.parent().attr("data-statut");
	var inputNameHtml = "<input type='text' autofocus class='modify-project' value='"+thisProjectName+"'></input>";
	if(statut == 'en cours'){
		var statutHtml = "<select class='modify-statut 'name='statut'><option value='"+statut+"' selected>"+statut+"</option><option value='terminé'>terminé</option></select>";
	}
	else{
		var statutHtml = "<select class='modify-statut' name='statut'><option value='"+statut+"' selected>"+statut+"</option><option value='en cours'>en cours</option></select>";
	}
	var inputFile = '<input type="file" name="" id="imageproject" accept="image/*"class="inputfile inputfile-6"  placeholder="Associer une image"></input><label for="imageproject"><strong><svg xmlns="" width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg> sélectionnez une image…</strong></label>'
	;

	var submitBtnHtml = "<input type='submit' class='submit-modify-project' value='Valider'></input>";

  var deleteHtml = '<a href="#" title="Dodoc" class="button-wrapper_deleteFolder js--deleteFolder button-wrapper button-wrapper_collapsed "><div class="btn icon"><svg xmlns:i="&amp;ns_ai;" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" id="Layer_1" x="0px" y="0px" width="64px" height="64px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" inkscape:version="0.91 r13725" sodipodi:docname="clear.svg">    <circle cx="31.767" cy="31.93" r="30.749001" id="circle7" style="fill:#ffd42a"></circle><g id="g3377" transform="translate(-4.9758512,-0.31324879)"><g id="g3373"><rect id="rect3364" height="7.1459312" width="35.722656" transform="matrix(0.70710678,-0.70710678,0.70710678,0.70710678,0,0)" y="45.207573" x="-14.679629" style="fill:#ff2a2a"></rect><rect x="30.919212" y="-6.7546654" transform="matrix(0.70710678,0.70710678,-0.70710678,0.70710678,0,0)" width="35.722656" height="7.1459312" id="rect11" style="fill:#ff2a2a"></rect></g></g>  </svg></div><span>Supprimer</span></a>';

	var closebtn = '<a class="close-reveal-modal" aria-label="Close">&#215</a>'
	var newContentToAdd = "<h3 id='modalTitle' class='popoverTitle'>Modifier le projet</h3><form onsubmit='return false;' class='modify-folder-form'>"+inputNameHtml+statutHtml+inputFile+submitBtnHtml+deleteHtml+"</form><a class='close-reveal-modal' aria-label='Close') &#215;</a></div>";
	$("#container.row #modal-modify-project").append(newContentToAdd);
	modifyStatut();
	submitModifyProject($(".submit-modify-project"), 'modifyProject', thisProjectNameSlug, statut);



	$thisEl = $this.parent();
}

function modifyStatut(){
	$('#modal-modify-project .modify-statut').bind('change', function(){
		if($(this).val() == "terminé"){
			$('#modal-statut-alert').foundation('reveal', 'open');
			$('#modal-statut-alert button.oui').on('click', function(){
				console.log('oui ');
				$('#modal-statut-alert').foundation('reveal', 'close');
				$("#modal-modify-project").foundation('reveal', 'open');
			});
			$('#modal-statut-alert button.annuler').on('click', function(){
				console.log('non');
				$('#modal-modify-project .modify-statut').val('en cours');
				$('#modal-statut-alert').foundation('reveal', 'close');
				$("#modal-modify-project").foundation('reveal', 'open');
			});
			$(document).on('closed.fndtn.reveal', '#modal-statut-alert[data-reveal]', function () {
	  		$("#modal-modify-project").foundation('reveal', 'open');
			});
		}
	});
}

// Envoie les données du projet au serveur
function submitModifyProject($button, send, projectNameSlug){
	$button.on('click', function(){
		var newProjectName = $('input.modify-project').val();
		var newStatut = $('select.modify-statut').val();

		//Images changed
		if(imageData != null){
			console.log('Une image a été ajoutée');
			var f = imageData[0];
			var reader = new FileReader();
			reader.onload = function(evt){
  			socket.emit(send,
        {
     				"name" : newProjectName,
    				"slugFolderName" : currentFolder,
            "slugProjectName" : projectNameSlug,
    				"statut" : newStatut,
  			});
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			socket.emit(send,
      {
   				"name" : newProjectName,
  				"slugFolderName" :currentFolder,
  				"slugProjectName" : projectNameSlug,
  				"statut" :newStatut,
			});
		}

		//socket.emit(send, {name: newProjectName, session:currentFolder, statut:newStatut, oldname: oldProjectName, oldStatut:oldProjectStatut});
	})
}

// On reçoit les mofication du projet
function onProjectModified(data){

	var name = data.name;
	var statut = data.statut;
	var modified = transformDatetoString(data.modified);
	var created = $thisEl.find('.create-date').html();

  // c'est pas top la variable globale. Par exemple, si on va éditer un autre projet alors que ce paquet n'est pas arrivé, $thisEl ne sera plus le bon
 	//var parent = $thisEl;

	// il faudrait envoyer un ID du post avec la requête, puis matcher le projet qui correspond à la réception. Un ID qui ne peut pas changer. On a ça dans le JSON ?
/*
	$(".project .title").filter( function() {
    return $(this).text() === name;
  });
*/


	$('#modal-modify-project').foundation('reveal', 'close');

	if(statut === "terminé"){
		$thisEl.find('.js--edit-project-icon').remove();
	}

	// C'est pas propre mais ça marche en attendant de refaire correctement les pages
	location.reload();

	//$thisEl.remove();
	//displayFolder(name, created, modified, data.image, statut)
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
function onProjectRemoved(){
	thisProject.remove();
}


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listProjects', { "slugFolderName" : currentFolder});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};
