/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;

var thisProjectName;
var thisProject;
var imageData = null;
var $thisEl;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('listProject', onListProject); // Liste tous les projets
socket.on('projectCreated', onProjectCreated); // Quand un dossier est crée !
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.
socket.on('projectModified', onProjectModified); //Quand on reçoit les modification du projet
socket.on('folderRemoved', onFolderRemoved); // Quand le dossier a été supprimé sur le serveur

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
	$('body').on('click', '.edit-icon', function(){
		thisProject = $(this).parent();
		modifyProject($(this));
	});

	//remove modal modify folder when it's closing
	$(document).on('close.fndtn.reveal', '#modal-modify-project[data-reveal]', function () {
  	$("#modal-modify-project").empty();
	});

	//Au click sur le bouton supprimer le dossier
	$('body').on('click', '.delete-project-button', function(){
		$('#modal-delete-alert').foundation('reveal', 'open');
	});

	// Remove Folder
	removeFolder();
}

// Envoie les données du dossier au serveur
function submitProject($button, send){
	$button.on('click', function(){
		var newProjectName = $('input.new-project').val();
		if(imageData != null){
			console.log('Une image a été ajoutée');
			var f = imageData[0];
			var reader = new FileReader();
			reader.onload = function(evt){
				socket.emit(send, {session: currentSession, name: newProjectName, file:evt.target.result, image:true});
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			socket.emit(send, {session: currentSession, name: newProjectName});
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
	displayFolder(folderName, createdDate, modifiedDate, image, statut);
}

// Affiche la liste des projets
function onListProject(data){
	var folderName = data.name;
	var createdDate = transformDatetoString(data.created);
	var image = data.image;
	var statut = data.statut;
	if(data.modified!= null){var modifiedDate = transformDatetoString(data.modified);}
	else{var modifiedDate = data.modified;}
	displayFolder(folderName, createdDate, modifiedDate, image, statut);
}

// Fonction qui affichent les projets HTML
function displayFolder(name, created, modified, image, statut){
	var formatName = convertToSlug(name);
	var contentHTML = '<a href="" title="'+name+'"><div class="content small-12 columns"><h2>'+name+'</h2></div></a>';
	var statutHTML= '<div class="statut small-6 columns"><span>statut</span><span class="statut-type"> '+statut+'</span></div>';
	console.log(image);
	if(image == false){
		var imageHTML = '<div class="image-wrapper small-6 columns"><img src="" alt=""></div>';
	}
	else{
		var imageHTML = '<div class="image-wrapper small-6 columns"><img src="/'+currentSession+'/'+formatName+'/'+formatName+'-thumb.jpg" alt="'+name+'"></div>'
	}
	var createdHTML= '<div class="created small-6 columns"><span>crée le </span><span class="create-date">'+created+'</span></div>';
	if(modified!= null){
		var modifiedHTML= '<div class="modified small-6 columns"><span>modifié le </span><span class="modify-date">'+modified+'</span></div>';
	}
	else{
		var modifiedHTML= '<div class="modified small-6 columns"></div>';
	}
	if(statut == "terminé"){
		var editIcon='' ;
	}
	else{
		var editIcon = '<a href="#" class="edit-icon btn icon" data-reveal-id="modal-modify-project"><img src="/images/pen.svg" alt="edit icon"></a>';
	}
	var metaDataHTML = '<div class="meta-data row">'+statutHTML+createdHTML+modifiedHTML+'</div>';
	var folderHTML = '<li class="project small-12 columns" data-statut="'+statut+'">'+editIcon+'<div class="left-content small-6 columns">'+contentHTML+ metaDataHTML+'</div>'+imageHTML+'</li>';
	$("#container .project-list").prepend(folderHTML);
}

function modifyProject($this){
	$("#container.row #modal-modify-project").empty();
	thisProjectName = $this.parent().find('h2').text();
	var statut = $this.parent().attr("data-statut");
	var inputNameHtml = "<input type='text' class='modify-project' value='"+thisProjectName+"'></input>";
	if(statut == 'en cours'){
		var statutHtml = "<select class='modify-statut 'name='statut'><option value='"+statut+"' selected>"+statut+"</option><option value='terminé'>terminé</option></select>";
	}
	else{
		var statutHtml = "<select class='modify-statut' name='statut'><option value='"+statut+"' selected>"+statut+"</option><option value='en cours'>en cours</option></select>";
	}
	var inputFile = "<input type='file' id='imageproject' accept='image/*' placeholder='Associer une image'></input>";
	var submitBtnHtml = "<input type='submit' class='submit-modify-project' value='Valider'></input>";
	var deleteHtml = "<div class='delete-project-button'><img src='/images/clear.svg' class='delete-btn btn icon'><span>Supprimer ce dossier</span></div>";
	var closebtn = '<a class="close-reveal-modal" aria-label="Close">&#215</a>'
	var newContentToAdd = "<h3 id='modalTitle' class='popoverTitle'>Modifier le dossier</h3><form onsubmit='return false;' class='modify-folder-form'>"+inputNameHtml+statutHtml+inputFile+submitBtnHtml+deleteHtml+"</form><a class='close-reveal-modal' aria-label='Close') &#215;</a></div>";
	$("#container.row #modal-modify-project").append(newContentToAdd);
	modifyStatut();
	submitModifyFolder($(".submit-modify-project"), 'modifyProject', thisProjectName, statut);

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
function submitModifyFolder($button, send, oldName, oldStatut){
	$button.on('click', function(){
		var newProjectName = $('input.modify-project').val();
		var newStatut = $('select.modify-statut').val();
		var oldProjectName = oldName;
		var oldProjectStatut = oldStatut;
		//Images changed
		if(imageData != null){
			console.log('Une image a été ajoutée');
			var f = imageData[0];
			var reader = new FileReader();
			reader.onload = function(evt){
				socket.emit(send, {name: newProjectName, session:currentSession, statut:newStatut, oldname: oldProjectName, oldStatut:oldProjectStatut, file:evt.target.result});
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			socket.emit(send, {name: newProjectName, session:currentSession, statut:newStatut, oldname: oldProjectName, oldStatut:oldProjectStatut});
		}

		// socket.emit(send, {name: newProjectName, session:currentSession, statut:newStatut, oldname: oldProjectName, oldStatut:oldProjectStatut});
	})
}

// On reçoit les mofication du projet
function onProjectModified(data){
	var name = data.name;
	var statut = data.statut;
	var modified = transformDatetoString(data.modified);
	var parent = $thisEl;
	$('#modal-modify-project').foundation('reveal', 'close');

	if(statut == "terminé"){
		$thisEl.find('.edit-icon').remove();
	}
	
	$thisEl.find('h2').html(name);
	$thisEl.find('.statut-type').html(" "+statut);
	$thisEl.find('.modify-date').html(modified);
	if(data.image == true){
		$thisEl.find('.image-wrapper img').attr('src', '/'+currentSession+'/'+convertToSlug(name)+'/'+convertToSlug(name)+'-thumb.jpg?modified='+data.modified);
	}
}

//Suppression du dossier
function removeFolder(){
	$('#modal-delete-alert button.oui').on('click', function(){
		console.log('oui ' + thisProjectName);
		console.log(thisProject);
		socket.emit('removeFolder', {name: thisProjectName});
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

// Si un fichier existe déjà, affiche un message d'alerte
function onFolderAlreadyExist(data){
	alert("Le nom de dossier " +data.name+ " existe déjà. Veuillez trouvez un autre nom.");
	$('.new-project').focus();
}

//Remove the folder from list
function onFolderRemoved(){
	thisProject.remove();
}


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listProject', {session: currentSession});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};
