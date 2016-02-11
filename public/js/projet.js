/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;
//get current project
var currentProject = app.projet;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('sendProjectData', sendProjectData);


jQuery(document).ready(function($) {
	init();


	$('body').on('click', '.js--edit-project-icon', function(){
		thisProject = $(this).parents(".project");
		modifyProject($(this));
	});

});

function init(){

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
	  .find( '.project-link').attr( 'href', '/'+currentSession+'/'+formatName).end()
	  .find( '.button-wrapper_capture').attr( 'href', '/'+currentSession+'/'+formatName+'/capture').end()
	  .find( '.button-wrapper_bibli').attr( 'href', '/'+currentSession+'/'+formatName+'/bibliotheque').end()
	  .find( '.button-wrapper_publi').attr( 'href', '/'+currentSession+'/'+formatName+'/bibliotheque/panneau-de-publications').end()

		.find( '.js--publi_view', publiPath).attr('href', publiPath).end()
	;

	var $allMedias = $();

	for (var i = 0; i < lastMedias.length; i++) {
  	var extension = lastMedias[i].split('.').pop();
  	var identifiant =  lastMedias[i].replace("." + extension, "");
    var fileName = lastMedias[i];

		if(extension == "jpg"){
			$allMedias = $allMedias.add( displayImage(currentSession, currentProject, identifiant, fileName));
		}
		if(extension == "webm"){
			$allMedias = $allMedias.add( displayVideo(currentSession, currentProject, identifiant, fileName));
		}
		if(extension == "mp4"){
			$allMedias = $allMedias.add( displayVideo(currentSession, currentProject, identifiant, fileName));
		}
		if(extension == "wav"){
			$allMedias = $allMedias.add( displayAudio(currentSession, currentProject, identifiant, fileName));
		}
	}

	projectClone.find( '.last-medias').append( $allMedias);

	var $allPublis = $();

	for (var i = 0; i < arrayPubli.length; i++) {
		var publiPath = '/'+currentSession+'/'+currentProject+'/publication/'+ convertToSlug(arrayPubli[i]);
		var editPath = '/'+currentSession+'/'+currentProject+'/bibliotheque/panneau-de-publications#'+ convertToSlug(arrayPubli[i]);

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
	thisProjectName = $this.parents(".project").find('h2').text();

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

  // c'est pas top la variable globale. Par exemple, si on va éditer un autre projet alors que ce paquet n'est pas arrivé, $thisEl ne sera plus le bon
 	var parent = $thisEl;

	// il faudrait envoyer un ID du post avec la requête, puis matcher le projet qui correspond à la réception. Un ID qui ne peut pas changer. On a ça dans le JSON ?
/*
	$(".project .title").filter( function() {
  	debugger;
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
		$thisEl.find('.image-wrapper img').attr('src', '/'+currentSession+'/'+convertToSlug(name)+'/'+convertToSlug(name)+'-thumb.jpg?modified='+data.modified);
	} else {
		$thisEl.find('.image-wrapper img').attr('src', '');
	}
}

//Suppression du dossier
function removeFolder(){
	$('#modal-delete-alert button.oui').on('click', function(){
		console.log('oui ' + thisProjectName);
		console.log(thisProject);
		socket.emit('removeProject', {name: thisProjectName, session: currentSession});
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


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('displayProject', {session: currentSession, project: currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};