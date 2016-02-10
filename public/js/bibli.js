/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;
var sessionName ;
//get current project
var currentProject = app.projet;


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('displayNewImage', displayNewImage);
socket.on('displayNewVideo', displayNewVideo);
socket.on('displayNewStopMotion', displayNewStopMotion);
socket.on('displayNewAudio', displayNewAudio);
socket.on('listMedias', onListMedias);
socket.on('listPublications', onPubliCreated);
socket.on('publiCreated', onPubliCreated);
socket.on('displayMontage', onDisplayMontage);
socket.on('titleModified', onTitleModified);
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){
	dragAndDrop();
	$('.montage-title .publi-btn').on('click', function(){
		var oldTitle = $('.montage-title h2').html();
		var newTitle = $('.montage-title input').val();
		$('.montage-title input').hide();
		$('.montage-title h2').show().html(newTitle);
		$(this).hide();
		$('.montage-title .edit-btn').show();
		socket.emit('titleChanged', {oldTitle: oldTitle, newTitle: newTitle, session: currentSession, project: currentProject});
	});

	$('.montage-title .edit-btn').on('click', function(){
		$('.montage-title input').show().val($('.montage-title h2').html());
		$('.montage-title h2').hide();
		$(this).hide();
		$('.montage-title .publi-btn').show()
	});

	$('.submit-new-publi').on('click', function(){
		var publiName = $('.new-publi').val();
		socket.emit('createPubli', {name: publiName, session:currentSession, project: currentProject});
	});

	$('body').on('click', '.publi-folder a', function(){
		var namePubli = $(this).parent('.publi-folder').attr('data-publi');
		$('.montage-edit').attr('data-publi', namePubli);
		console.log(namePubli);
		socket.emit('displayThisMontage', {name:namePubli, session:currentSession, project: currentProject});
	});

	$('body').on('click', '.edit-publi-btn', function(){
		var namePubli = $(this).parent('.publi-folder').attr('data-publi');
		console.log(namePubli);
		$('.montage-edit').attr('data-publi', namePubli);
		socket.emit('displayThisMontage', {name:namePubli, session:currentSession, project: currentProject});
	});

	$('body').on('click', '.publi-close', function(){
		$('.montage-inner').empty();
		$('.montage-edit').hide();
	});

}

function displayNewImage(image){
	displayImage(currentSession, currentProject, image.title, image.file);
}

function displayNewVideo(video){
	displayVideo(currentSession, currentProject, video.title, video.file);
}

function displayNewStopMotion(video){
	displayStopMotion(currentSession, currentProject, video.title, video.file);
}

function displayNewAudio(audio){
	displayAudio(currentSession, currentProject, audio.title, audio.file);
}


function onListMedias(array, json){
	$(".mediaContainer li").remove();
	var matchID = $(".mediaContainer .media").attr("id");
	for (var i = 0; i < array.length; i++) {
  	var extension = array[i].split('.').pop();
  	var identifiant =  array[i].replace("." + extension, "");
		if(extension == "jpg"){
			displayImage(currentSession, currentProject, identifiant, array[i]);
		}
		if(extension == "webm"){
			displayVideo(currentSession, currentProject, identifiant, array[i]);
		}
		if(extension == "mp4"){
			displayVideo(currentSession, currentProject, identifiant, array[i]);
		}
		if(extension == "wav"){
			displayAudio(currentSession, currentProject, identifiant, array[i]);
		}
	}

	$(".media").on("mouseenter", function(){
		$(this).css("cursor", 'pointer');
	});

}

function displayImage(session, project, id, file){
	var imagePath = "/" +session +"/"+ project+ "/"+ file;
	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem.attr( 'id', id);
	mediaItem.find( 'img').attr('src', imagePath);

	$('.medias-list').prepend(mediaItem);
}

function displayVideo(session, project, id, file){
	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	$('.medias ul.medias-list').prepend(mediaItem);
}

function displayStopMotion(session, project, id, file){

	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	$('.medias ul.medias-list').prepend(mediaItem);
}

function displayAudio(session, project, id, file){
	var audioPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'source').attr( 'src', audioPath);

	$('.medias ul.medias-list').prepend(mediaItem);
}

function dragAndDrop(){
  var left = document.querySelector('.medias-list');
  var right = document.querySelector('.inner-montage');
	dragula([left, right], {
	  copy: function (el, source) {
	    return source === left;
	  },
	  accepts: function (el, target) {
      return target === right;
	  }
	})
	.on('dragend', function(el){
		onMontageChanged();
	});
}

function onMontageChanged(){
	var montageContent = $(".inner-montage").html();
	var title = $('.montage-title h2').html();
	socket.emit("saveMontage", {html:montageContent, title: title, session:currentSession, projet:currentProject});
}

function onPubliCreated(data){
	var publiItem = $(".js--templates .publi-folder").clone(false);
	publiItem
		.attr('data-publi', convertToSlug(data.name))
		.find('h2').html(data.name);

	$('#modal-add-publi').foundation('reveal', 'close');
	$('.montage-list ul').prepend(publiItem);

	var viewButton = $('.edit-view-btn a');
	var publiLink= $('.publi-folder').attr('data-publi');
	var publiPath = '/'+currentSession+'/'+currentProject+'/publication/'+ publiLink;
	viewButton	
		.attr('href', publiPath);
}

function onDisplayMontage(data){
	var publiName = convertToSlug(data.name);
	$('.montage-edit[data-publi="'+publiName+'"]')
		.show()
		.find('h2').html(data.name);
	if(data.html != 'none'){
		$('.montage-edit[data-publi="'+publiName+'"]').find('.inner-montage').html(data.html);
	}
	else{
		$('.montage-edit[data-publi="'+publiName+'"]').find('.inner-montage').html('');
	}
	
}

function onTitleModified(data){
	console.log($('.publi-folder[data-publi="'+convertToSlug(data.old)+'"]').find('h2'));
	$('.publi-folder[data-publi="'+convertToSlug(data.old)+'"]').find('h2').html(data.name);
	$('.publi-folder[data-publi="'+convertToSlug(data.old)+'"]').attr('data-publi', convertToSlug(data.name));
}

// Si un fichier existe déjà, affiche un message d'alerte
function onFolderAlreadyExist(data){
	alert("La publication " +data.name+ " existe déjà. Veuillez trouvez un autre nom.");
	$('.new-publi').focus();
}

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listMedias', {session: currentSession, project: currentProject});
	socket.emit('listPubli', {session: currentSession, project: currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


