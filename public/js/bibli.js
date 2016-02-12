/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;
var sessionName ;
//get current project
var currentProject = app.projet;
var imageData = null;


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('displayNewImage', displayNewImage);
socket.on('displayNewVideo', displayNewVideo);
socket.on('displayNewStopMotion', displayNewStopMotion);
socket.on('displayNewAudio', displayNewAudio);
socket.on('displayNewText', displayNewText);
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
	bigMedia();
	uploadImage("#inputmedia");

	$validerBouton = $('.montage-title .js--validerTitre');
	$editerBouton = $('.montage-title .js--editerTitre');

	$validerBouton.on('click', function(){

		var oldTitle = $('.montage-title .title').html();
		var newTitle = $('.montage-title input').val();
		$('.montage-title input').hide();
		$('.montage-title .title').show().html(newTitle);
		$(this).hide();
		$editerBouton.css("display", "inline-block");

		socket.emit('titleChanged', {oldTitle: oldTitle, newTitle: newTitle, session: currentSession, project: currentProject});
	});

	$('.montage-title .js--editerTitre').on( 'click', function() {
		$('.montage-title input').show().val($('.montage-title .title').html());
		$('.montage-title .title').hide();
		$(this).hide();
		$validerBouton.css("display", "inline-block");
	});

	$('.submit-new-publi').on('click', function(){
		var publiName = $('.new-publi').val();
		socket.emit('createPubli', {name: publiName, session:currentSession, project: currentProject});
	});

	$('body').on('click', '.js--edit_view', function(e){
  	e.preventDefault();
		var namePubli = $(this).parent('.publi-folder').attr('data-publi');
		console.log(namePubli);
		$('.montage-edit').attr('data-publi', namePubli);
		socket.emit('displayThisMontage', {name:namePubli, session:currentSession, project: currentProject});
	});

	$('body').on('click', '.publi-close', function(){
		$('.montage-inner').empty();
		$('.montage-edit').hide();
	});


	$(".js--publications").on( 'click', function(e) {
  	e.preventDefault();
  	$('body').attr( "data-publicationpane", $('body').attr('data-publicationPane') === 'open' ? '' : 'open');
  });

  $('body').on('click', '.js--delete-media-montage', function(){
  	var $elementToDel = $(this).parent("li.media");
  	$elementToDel .fadeOut('slow',function(){
  		$elementToDel.remove();
  		onMontageChanged();
  	});
  });

  // Ajouter du texte dans la bibliotheque
  $('.js--submit-new-text').on('click',function(){
  	var textTitle = $(this).parent('form').find('.new-text').val();
  	var text = $(this).parent('form').find('textarea').val();
  	console.log('addText');
  	socket.emit('addText', {session: currentSession, project: currentProject, title: textTitle, text:text});
  });

  //Ajouter un fichier local dans la bibliothèque
  $('.js--submit-new-local').on('click', function(){
  	console.log('submit new local');
  	if(imageData != null){
			console.log('Une image a été ajoutée');
			var f = imageData[0];
			var reader = new FileReader();
			reader.onload = function(evt){
				socket.emit('newImageLocal', {session: currentSession, project: currentProject, data:evt.target.result});
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			$('#modal-add-local').foundation('reveal', 'close');
		}
  });
}

function displayNewImage(image){
	displayImage(currentSession, currentProject, image.title, image.file);
	$('#modal-add-local').foundation('reveal', 'close');
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

function displayNewText(text){
	$('input.new-text').val('');
	$('#modal-add-text textarea').val('');
	$('#modal-add-text').foundation('reveal', 'close');
	var mediaItem = $(".js--templates .media_text").clone(false);
	mediaItem.attr( 'id', text.id);
	mediaItem
		.find( 'p').html(text.textContent)
		.end()
		.find('h2').html(text.textTitle);

	//$(".medias-list li:first-child").after(mediaItem);
	//$(mediaItem).insertAfter(".medias-list li:first-child");
	$('.medias-list').prepend(mediaItem);
}


function onListMedias(array, json){
	$(".mediaContainer li").remove();
	var matchID = $(".mediaContainer .media").attr("id");

	array.sort(function(a, b){
    var keyA = new Date(a.id),
        keyB = new Date(b.id);
    // Compare the 2 dates
    if(keyA < keyB) return -1;
    if(keyA > keyB) return 1;
    return 0;
	});
	for (var i = 0; i < array.length; i++) {
  	var extension = array[i].extension;
  	var identifiant =  array[i].id;
		if(extension == ".jpg"){
			if(array[i].file != currentProject+'-thumb.jpg'){
				displayImage(currentSession, currentProject, identifiant, array[i].file);
			}
		}
		if(extension == ".webm"){
			displayVideo(currentSession, currentProject, identifiant, array[i].file);
		}
		if(extension == ".mp4"){
			displayStopMotion(currentSession, currentProject, identifiant, array[i].file);
		}
		if(extension == ".wav"){
			displayAudio(currentSession, currentProject, identifiant, array[i].file);
		}
		if(extension == ".txt"){
			socket.emit('readTxt', {session:currentSession, project:currentProject, file:array[i]});
			displayText(currentSession, currentProject, identifiant);
		}
	}
	//display text
	socket.on('txtRead', function(data){
		$("#"+data.obj.id)
			.find( '.mediaContent').html(data.content);
	});

}

function displayImage(session, project, id, file){
	var imagePath = "../"+ file;
	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem.attr( 'id', id);
	mediaItem.find( 'img').attr('src', imagePath);

	//$(".medias-list li:first-child").after(mediaItem);
	//$(mediaItem).insertAfter(".medias-list li:first-child");
	$('.medias-list').prepend(mediaItem);
}

function displayVideo(session, project, id, file){
	var thumbPath = '../'+id +'-thumb.png';
	var videoPath = '../' + file;

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

  //$(".medias-list li:first-child").after(mediaItem);
	$('ul.medias-list').prepend(mediaItem);
}

function displayStopMotion(session, project, id, file){

	console.log('display stop motion');
	var thumbPath = '../'+id +'-thumb.png';
	var videoPath = '../' + file;

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

  //$(".medias-list li:first-child").after(mediaItem);
	$('ul.medias-list').prepend(mediaItem);
}

function displayAudio(session, project, id, file){
	var audioPath = '../' + file;

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'source').attr( 'src', audioPath);

 // $(".medias-list li:first-child").after(mediaItem);
	$('ul.medias-list').prepend(mediaItem);
}

function displayText(session, project, id, title, content){
	var mediaItem = $(".js--templates .media_text").clone(false);
	mediaItem.attr( 'id', id);

	//$(".medias-list li:first-child").after(mediaItem);
	$('.medias-list').prepend(mediaItem);
}

function bigMedia(){
	// Au click sur un media
  $('body').on('click', '.medias-list .media', function(){
  	var typeMedia = $(this).attr("data-type");
  	$('#modal-media-view').foundation('reveal', 'open');
  	console.log(typeMedia);
  	switch(typeMedia){
  		case 'image':
	  		var imagePath = $(this).find("img").attr("src");
	  		var id = $(this).find("img").attr("id");
				var mediaItem = $(".js--templates .media-big_image").clone(false);
				mediaItem.attr( 'id', id);
				mediaItem.find( 'img').attr('src', imagePath);
				$('#modal-media-view .big-mediaContent').html(mediaItem);
				break;
			case 'video':
			case 'stopmotion':
	  		var id = $(this).find("img").attr("id");
	  		var thumbPath = $(this).find("video").attr("poster");
				var videoPath = $(this).find("source").attr("src");

				var mediaItem = $(".js--templates .media-big_video").clone(false);

				mediaItem
				  .attr( 'id', id)
			    .find( 'video').attr( 'poster', thumbPath)
			    .find( 'source').attr( 'src', videoPath);

				$('#modal-media-view .big-mediaContent').html(mediaItem);
				break;
			case 'audio':
				var id = $(this).find("img").attr("id");
				var audioPath = $(this).find("source").attr("src");

				var mediaItem = $(".js--templates .media-big_audio").clone(false);
				mediaItem
				  .attr( 'id', id)
			    .find( 'source').attr( 'src', audioPath);

				$('#modal-media-view .big-mediaContent').html(mediaItem);
				break;

  	}
  });
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
	.on('drop', function(el, target, source, sibling){
  	// si le drop a bien réussi
    if( target !== null) {
      $(el).removeClass("gu-transit");
      var deleteMedia = $(".js--templates .js--delete-media-montage").clone(false);
      $(el).append(deleteMedia);
  		onMontageChanged();
    }
	});
}

function onMontageChanged(){
	var montageContent = $(".inner-montage").html();
	var title = $('.montage-title h2').html();
	socket.emit("saveMontage", {html:montageContent, title: title, session:currentSession, projet:currentProject});
}

function onPubliCreated(data){

	var publiItem = $(".js--templates .publi-folder").clone(false);

	var publiLink = convertToSlug(data.name);
	var publiPath = '/'+currentSession+'/'+currentProject+'/publication/'+ publiLink;

	publiItem
		.attr('data-publi', publiLink)
		.find('h2').html(data.name).end()
		.find('.js--publi_view').attr('href', publiPath).end()
		.find('.js--edit_view').attr('href', '').end()
  ;

	$('.montage-list ul').prepend(publiItem);
	$('input.new-publi').val('');
	$('#modal-add-publi').foundation('reveal', 'close');

}

function onDisplayMontage(data){
	var publiName = convertToSlug(data.name);
	var publiPath = '/'+currentSession+'/'+currentProject+'/publication/'+publiName;
	$('.montage-edit[data-publi="'+publiName+'"]')
		.show()
		.find('.title').html(data.name)
		.end()
		.find('.js--publi_view').attr('href', publiPath);
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


