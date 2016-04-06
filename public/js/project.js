/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentFolder = app.folder;
//get current project
var currentProject = app.project;

var thisProjectName;
var thisProject;
var imageData = null;
var $thisEl;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('sendProjectData', sendProjectData);
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.
socket.on('projectModified', onProjectModified); //Quand on reçoit les modification du projet
socket.on('folderRemoved', onFolderRemoved); // Quand le dossier a été supprimé sur le serveur


jQuery(document).ready(function($) {
	$(document).foundation();
	init();

});

function init(){
	uploadImage("#imageproject");

	$('body').on('click', '.js--edit-project-icon', function(){
		thisProject = $(this).parents(".project");
		modifyProject($(this));
	});

	//Au click sur le bouton supprimer le dossier
	$('body').on('click', '.js--deleteFolder', function(){
		$('#modal-delete-alert').foundation('reveal', 'open');
	});

	// Remove Folder
	removeFolder();
}

function sendProjectData(data){
	var name = data.json.name;
	var statut = data.json.statut;
	var image = data.image;
	var created = transformDatetoString(data.json.created);
	var modified = transformDatetoString(data.json.created);
	var lastMedias = data.lastmedia;
	var arrayPubli = data.publiNames;

	var formatName = convertToSlug(name);

	var projectClone = $(".js--templates > .project").clone(false);
	projectClone
		.find( '.title').html( name).end()
	  .attr( 'data-statut', statut)
	  .find( '.title').unwrap().end()
	  .find( '.statut-type').text( statut).end()
	  .find( '.image-wrapper img').attr('src', image === true ? './'+formatName+'-thumb.jpg' : '').attr('alt', name).end()
	  .find( '.create-date').text( created).end()
	  .find( '.modify-date').text( modified !== null ? modified : '').end()
	  .find( '.title').text( name).end()
	  .find( '.project-link').attr( 'href', '/'+currentFolder+'/'+formatName).end()
	  .find( '.button-wrapper_capture').attr( 'href', '/'+currentFolder+'/'+formatName+'/capture').end()
	  .find( '.button-wrapper_bibli').attr( 'href', '/'+currentFolder+'/'+formatName+'/bibliotheque/medias').end()
	  .find( '.button-wrapper_publi').attr( 'href', '/'+currentFolder+'/'+formatName+'/bibliotheque/panneau-de-publications').end()

		.find( '.js--publi_view', publiPath).attr('href', publiPath).end()
	;

	var $allMedias = $();

	for (var i = 0; i < lastMedias.length; i++) {
  	var extension = lastMedias[i].split('.').pop();
  	var identifiant =  lastMedias[i].replace("." + extension, "");
    var fileName = lastMedias[i];

		if(extension == "jpg"){
			$allMedias = $allMedias.add( displayImage(currentFolder, currentProject, identifiant, fileName));
		}
		if(extension == "webm"){
			$allMedias = $allMedias.add( displayVideo(currentFolder, currentProject, identifiant, fileName));
		}
		if(extension == "mp4"){
			$allMedias = $allMedias.add( displayVideo(currentFolder, currentProject, identifiant, fileName));
		}
		if(extension == "wav"){
			$allMedias = $allMedias.add( displayAudio(currentFolder, currentProject, identifiant, fileName));
		}
	}

	projectClone.find( '.last-medias').append( $allMedias);

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

function displayImage(session, project, id, file){
	var imagePath = "/" +session +"/"+ project+ "/"+ file;
	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem.attr( 'id', id);
	mediaItem.find( 'img').attr('src', imagePath);

	return mediaItem;
}

function displayVideo(session, project, id, file){
	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	return mediaItem;
}

function displayStopMotion(session, project, id, file){

	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	return mediaItem;
}

function displayAudio(session, project, id, file){
	var audioPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'source').attr( 'src', audioPath);

	return mediaItem;
}

function modifyProject($this){
	$("#container.row #modal-modify-project").empty();
	thisProjectName = $this.parents('.project').find('.project-inside').find('h2').text();

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
	var deleteHtml = '<a href="#" title="Dodoc" class="button-wrapper_deleteFolder js--deleteFolder button-wrapper button-wrapper_collapsed "><div class="btn icon"><svg xmlns:i="&amp;ns_ai;" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" id="Layer_1" x="0px" y="0px" width="64px" height="64px" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" inkscape:version="0.91 r13725" sodipodi:docname="clear.svg">    <circle cx="31.767" cy="31.93" r="30.749001" id="circle7" style="fill:#ffd42a"></circle><g id="g3377" transform="translate(-4.9758512,-0.31324879)"><g id="g3373"><rect id="rect3364" height="7.1459312" width="35.722656" transform="matrix(0.70710678,-0.70710678,0.70710678,0.70710678,0,0)" y="45.207573" x="-14.679629" style="fill:#ff2a2a"></rect><rect x="30.919212" y="-6.7546654" transform="matrix(0.70710678,0.70710678,-0.70710678,0.70710678,0,0)" width="35.722656" height="7.1459312" id="rect11" style="fill:#ff2a2a"></rect></g></g>  </svg></div><span>Supprimer</span></a>';
	var closebtn = '<a class="close-reveal-modal" aria-label="Close">&#215</a>'
	var newContentToAdd = "<h3 id='modalTitle' class='popoverTitle'>Modifier le projet</h3><form onsubmit='return false;' class='modify-folder-form'>"+inputNameHtml+statutHtml+inputFile+submitBtnHtml+deleteHtml+"</form><a class='close-reveal-modal' aria-label='Close') &#215;</a></div>";
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
				socket.emit(send, {name: newProjectName, session:currentFolder, statut:newStatut, oldname: oldProjectName, oldStatut:oldProjectStatut, file:evt.target.result});
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			socket.emit(send, {name: newProjectName, session:currentFolder, statut:newStatut, oldname: oldProjectName, oldStatut:oldProjectStatut});
		}

		// socket.emit(send, {name: newProjectName, session:currentFolder, statut:newStatut, oldname: oldProjectName, oldStatut:oldProjectStatut});
	})
}

// On reçoit les mofication du projet
function onProjectModified(data){
	var name = data.name;
	var statut = data.statut;
	var modified = transformDatetoString(data.modified);

  // c'est pas top la variable globale. Par exemple, si on va éditer un autre projet alors que ce paquet n'est pas arrivé, $thisEl ne sera plus le bon
 	var parent = $thisEl;

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

	$thisEl
	  .find('h2').text(name).end()
	  .find('.statut-type').attr("data-statut", statut).html(" "+statut).end()
	  .find('.modify-date').html(modified).end();

	if(data.image == true){
		$thisEl.find('.image-wrapper img').attr('src', '/'+currentFolder+'/'+convertToSlug(name)+'/'+convertToSlug(name)+'-thumb.jpg?modified='+data.modified);
	} else {
		$thisEl.find('.image-wrapper img').attr('src', '');
	}
}

//Suppression du dossier
function removeFolder(){
	$('#modal-delete-alert button.oui').on('click', function(){
		console.log('oui ' + thisProjectName);
		console.log(thisProject);
		socket.emit('removeProject', {name: thisProjectName, session: currentFolder});
		$('#modal-delete-alert').foundation('reveal', 'close');
		window.location.replace('/'+currentFolder);
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
	socket.emit('displayProject', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};