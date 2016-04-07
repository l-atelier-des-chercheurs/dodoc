/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentFolder = app.folder;
//get current project
var currentProject = app.project;
var imageData = null;


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('displayNewImage', displayNewImage);
socket.on('displayNewVideo', displayNewVideo);
socket.on('displayNewStopMotion', displayNewStopMotion);
socket.on('displayNewAudio', displayNewAudio);
socket.on('displayNewText', displayNewText);
socket.on('displayModifiedText', displayModifiedText);
socket.on('listMediasOfOneType', onListMediasOfOneType); // dans common. Appel ensuite listOneMedia
socket.on('listPublications', onPubliCreated);
socket.on('publiCreated', onPubliCreated);
socket.on('displayMontage', onDisplayMontage);
socket.on('titleModified', onTitleModified);
socket.on('displayMediaData', onMediaData);
socket.on('addHighlight', onHighlight);
socket.on('bibliFileDeleted', onFileDeleted)
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.

socket.on('newMediaUpload', function(data){
	var extension = data.ext;
	var fileName = data.fileName;
	var identifiant = data.id;
	if(extension == ".jpg" || extension == ".gif" || extension == ".png"){
		displayImage(currentFolder, currentProject, identifiant, fileName, extension);
	}
	if(extension == ".webm" || extension == ".ogg" || extension == ".mov"){
		displayVideo(currentFolder, currentProject, identifiant, fileName);
	}
	if(extension == ".mp4"){
		displayStopMotion(currentFolder, currentProject, identifiant, fileName);
	}
	if(extension == ".wav" || extension == ".mp3" || extension == ".amr" || extension == ".m4a"){
		displayAudio(currentFolder, currentProject, identifiant, fileName);
	}
});

jQuery(document).ready(function($) {
	$(document).foundation();
	init();
});

function init(){

  // le drag and drop avec dragula se fait maintenant dans le fichier dom_autoscroller.js
  // en attendant de faire mieux

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
		$editerBouton.css("display", "block");

		socket.emit('titleChanged', {oldTitle: oldTitle, newTitle: newTitle, session: currentFolder, project: currentProject});
	});

	$('.montage-title .js--editerTitre').on( 'click', function() {
		$('.montage-title input').show().val($('.montage-title .title').html());
		$('.montage-title .title').hide();
		$(this).hide();
		$validerBouton.css("display", "block");
	});

	$('.submit-new-publi').on('click', function(){
		var publiName = $('.new-publi').val();
		socket.emit('createPubli', {name: publiName, session:currentFolder, project: currentProject});
	});

	$('body').on('click', '.js--edit_view', function(e){
  	e.preventDefault();
		var namePubli = $(this).closest('.publi-folder').attr('data-publi');
		console.log(namePubli);
		$('.montage-edit').attr('data-publi', namePubli);
		socket.emit('displayThisMontage', {name:namePubli, session:currentFolder, project: currentProject});
	});

	$('body').on('click', '.js--backButton', function(){
		$('.montage-inner').empty();
		$('.montage-edit').hide();
	});


	$(".js--publications").on( 'click', function(e) {
  	e.preventDefault();
  	$('body').attr( "data-publicationpane", $('body').attr('data-publicationPane') === 'open' ? '' : 'open');
  });

  $('body').on('click', '.js--delete-media-montage', function(){
  	var $elementToDel = $(this).parent("li.media");
  	$elementToDel.fadeOut( 600,function(){
  		$elementToDel.remove();
  		onMontageChanged();
  	});
  });

  // Ajouter du texte dans la bibliotheque
  $('.js--submit-new-text').on('click',function(){
  	var textTitle = $(this).parent('form').find('.new-text').val();
  	var text = $(this).parent('form').find('textarea').val();
  	console.log('addText');
  	socket.emit('addText', {session: currentFolder, project: currentProject, title: textTitle, text:text});
  });

  //Ajouter un fichier local dans la bibliothèque
  // $('.js--submit-new-local').on('click', function(){
  // 	console.log('submit new local');
  // 	if(imageData != null){
		// 	console.log('Une image a été ajoutée');
		// 	var f = imageData[0];
		// 	var reader = new FileReader();
		// 	reader.onload = function(evt){
		// 		socket.emit('newImageLocal', {session: currentFolder, project: currentProject, data:evt.target.result});
		// 	};
		// 	reader.readAsDataURL(f);
		// }
		// else{
		// 	console.log("Pas d'image chargé");
		// 	$('#modal-add-local').foundation('reveal', 'close');
		// }
  // });

  // si en arrivant sur la page, il y a un hash dans l'url
  // alors ouvrir la publication qui a ce nom directement
  var urlHash = window.location.hash;
  if( urlHash.length > 0){
    setTimeout(function() {
      $('.montage-list [data-publi=' + urlHash.substring(1) + ']').find('.js--edit_view').trigger( 'click');
    }, 250);


  }

  //Submit new text modified
  $('body').on('click', '.js--submit-view-text-modify', function(){
  	var textTitle = $(this).parent('form').find('.view-text-title-modify').val();
  	var text = $(this).parent('form').find('.view-text-modify').val();
  	var id = $(this).parents('.media-big_text').attr('data-id');

  	socket.emit('modifyText', {session: currentFolder, project: currentProject, title: textTitle, text:text, id:id});
  });

  //Envoie les titres et légendes au serveur
  $('body').on('click', '.js--submit-add-media-data', function(){
  	var mediaTitle = $(this).parent('form').find('.add-media-title').val();
  	var mediaLegende = $(this).parent('form').find('.add-media-legend').val();
  	var id = $(this).parents('.media-big').attr('id');
  	var type = $(this).parents('.media-big').attr('data-type');
    socket.emit('addMediaData', {session: currentFolder, project: currentProject, title: mediaTitle, legend:mediaLegende, id:id, type:type});
  });

  // Ajoute ou enlève un highlight quand on clique sur "Highlight" dans la fenêtre modal
  $('body').on('click', '.js--highlightMedia', function(){
		var id = $(this).parents('.media-big').attr('id');
		var type = $(this).parents('.media-big').attr('data-type');
		//console.log(type);
		if($(this).parents('.media-big').hasClass('is--highlight')){
			console.log('remove highlight');
			socket.emit('removeHighlight', {session: currentFolder, project: currentProject, id:id, type:type});
		}
		else{
			console.log('add highlight');
			socket.emit('highlightMedia', {session: currentFolder, project: currentProject, id:id, type:type});
		}

  });

 // Ajoute ou enlève un highlight quand on clique sur le drapeau dans les médias
  $('body').on('click', '.js--flagMedia', function(e){
  	e.stopPropagation();
		var id = $(this).parents('li').attr('id');
		var type = $(this).parents('li').attr('data-type');
		//console.log(type);
		if($(this).parents('li').hasClass('is--highlight')){
			console.log('remove highlight');
			socket.emit('removeHighlight', {session: currentFolder, project: currentProject, id:id, type:type});
		}
		else{
			console.log('add highlight - flag');
			socket.emit('highlightMedia', {session: currentFolder, project: currentProject, id:id, type:type});
		}

  });

/*
  // Affiche les drapeaux au survol
  $('body').on('mouseenter', 'li.media',function() {
  	$(this).find('.js--flagMedia').show();
  });

   $('body').on('mouseleave', 'li.media',function() {
  	$(this).find('.js--flagMedia').hide();
  });
*/



  // Supprime un fichier de la bibli de médias
  $('body').on('click', '.js--delete-media-bibli', function(){
  	$('#modal-delete-alert-media').foundation('reveal', 'open');
  	var id = $(this).parents('.media-big').attr('id');
  	var type = $(this).parents('.media-big').attr('data-type');
  	var fileToDelete ;
  	if(type == 'image'){
			fileToDelete = id + '.jpg';
  	}
  	if(type == 'video'){
			fileToDelete = id + '.webm';
  	}
  	if(type == 'stopmotion'){
			fileToDelete = id + '.mp4';
  	}
  	if(type == 'audio'){
			fileToDelete = id + '.wav';
  	}
  	if(type == 'text'){
			fileToDelete = id + '.txt';
  	}
  	console.log(id);
  	$('#modal-delete-alert-media')
  		.attr('data-id', id)
  		.attr('data-type', type)
  		.attr('data-filetodelete', fileToDelete);
  });

  //Au clic sur OUI -> remove media au clic sur non annule
  removeMedia();

}

function removeMedia(){
	$('#modal-delete-alert-media button.oui').on('click', function(){
		var fileToDelete = $(this).parents('#modal-delete-alert-media ').attr('data-filetodelete');
  	var id = $(this).parents('#modal-delete-alert-media ').attr('data-id');
  	var type = $(this).parents('#modal-delete-alert-media ').attr('data-type');
		console.log(fileToDelete);
		socket.emit("deleteFileBibli", {session:currentFolder, project:currentProject, file:fileToDelete, id:id, type:type});
		$('#modal-delete-alert-media').foundation('reveal', 'close');
	});
	$('#modal-delete-alert-media button.annuler').on('click', function(){
		console.log('annuler');
		$('#modal-delete-alert-media').foundation('reveal', 'close');
		$("#modal-media-view").foundation('reveal', 'open');
	});
}

function displayNewImage(image){
	displayImage(currentFolder, currentProject, image.title, image.file);
	$('#modal-add-local').foundation('reveal', 'close');
}

function displayNewVideo(video){
	displayVideo(currentFolder, currentProject, video.title, video.file);
}

function displayNewStopMotion(video){
	displayStopMotion(currentFolder, currentProject, video.title, video.file);
}

function displayNewAudio(audio){
	displayAudio(currentFolder, currentProject, audio.title, audio.file);
}

function displayNewText(text){
	$('input.new-text').val('');
	$('#modal-add-text textarea').val('');
	$('#modal-add-text').foundation('reveal', 'close');
	var mediaItem = $(".js--templates .media_text").clone(false);
	mediaItem.attr( 'id', text.id);
	mediaItem
		.find( 'p')
		  .html(text.textContent)
		.end()
		.find('h3')
		  .html(text.textTitle)
  ;

	//$(".medias-list li:first-child").after(mediaItem);
	//$(mediaItem).insertAfter(".medias-list li:first-child");
	$('.medias-list').prepend(mediaItem);
}

function displayModifiedText(text){
	$('#modal-media-view').foundation('reveal', 'close');
	var mediaItem = $("#"+text.id);
		mediaItem
		.find( 'p')
		  .html(text.textContent)
		.end()
		.find('h3')
		  .html(text.textTitle)
  ;
}


function onListMedias(array, json){
	$(".mediaContainer li").remove();
	var matchID = $(".mediaContainer .media").attr("id");


	for (var i = 0; i < array.length; i++) {
  	var extension = array[i].extension;
  	var identifiant =  array[i].id;
  	//console.log(extension);
		if(extension == ".jpg" || extension == ".gif" || extension == ".png"){
			if(array[i].file != currentProject+'-thumb.jpg'){
				displayImage(currentFolder, currentProject, identifiant, array[i].file, extension);
			}
		}
		if(extension == ".webm" || extension == ".ogg" || extension == ".mov"){
			displayVideo(currentFolder, currentProject, identifiant, array[i].file);
		}
		if(extension == ".mp4"){
			displayStopMotion(currentFolder, currentProject, identifiant, array[i].file);
		}
		if(extension == ".wav" || extension == ".mp3" || extension == ".amr" || extension == ".m4a"){
			displayAudio(currentFolder, currentProject, identifiant, array[i].file);
		}
		if(extension == ".txt"){
			socket.emit('readTxt', {session:currentFolder, project:currentProject, file:array[i]});
			displayText(currentFolder, currentProject, identifiant);
		}
	}


	//afficher les titre et légendes des images
	for (var i = 0; i < json['files']['images'].length; i++){
	  var title = json['files']['images'][i]['title'];
	  var legende = json['files']['images'][i]['legende'];
	  $('#'+json['files']['images'][i].name)
	    .attr('data-i', i)
	  	.attr('data-title', title)
	  	.attr('data-legende', legende)
	  	.find('.mediaData .mediaData--titre').html(title)
			.end()
			.find('.mediaData .mediaData--legende').html(legende);



/*
    if( title === undefined && legende === undefined) {
  	  $('#'+json['files']['images'][i].name)
  	    .find('.mediaData')
  	      .remove()
  	  ;
    }
*/

		if(json['files']['images'][i].highlight == true){
			$('#'+json['files']['images'][i].name).addClass('is--highlight');
		}

	}
	for (var i = 0; i < json['files']['videos'].length; i++){
	  var title = json['files']['videos'][i]['title'];
	  var legende = json['files']['videos'][i]['legende'];
	  $('#'+json['files']['videos'][i].name)
	  	.attr('data-title', title)
	  	.attr('data-legende', legende)
	  	.find('.mediaData .mediaData--titre').html(title)
			.end()
			.find('.mediaData .mediaData--legende').html(legende);

    // if( title === undefined && legende === undefined) {
  	 //  $('#'+json['files']['videos'][i].name)
  	 //    .find('.mediaData')
  	 //      .remove()
  	 //  ;
    // }

		if(json['files']['videos'][i].highlight == true){
			$('#'+json['files']['videos'][i].name).addClass('is--highlight');
		}
	}
	for (var i = 0; i < json['files']['stopmotion'].length; i++){
	  var title = json['files']['stopmotion'][i]['title'];
	  var legende = json['files']['stopmotion'][i]['legende'];
	  $('#'+json['files']['stopmotion'][i].name)
	  	.attr('data-title', title)
	  	.attr('data-legende', legende)
	  	.find('.mediaData .mediaData--titre').html(title)
			.end()
			.find('.mediaData .mediaData--legende').html(legende);

    // if( title === undefined && legende === undefined) {
  	 //  $('#'+json['files']['stopmotion'][i].name)
  	 //    .find('.mediaData')
  	 //      .remove()
  	 //  ;
    // }

		if(json['files']['stopmotion'][i].highlight == true){
			$('#'+json['files']['stopmotion'][i].name).addClass('is--highlight');
		}
	}
	for (var i = 0; i < json['files']['audio'].length; i++){
	  var title = json['files']['audio'][i]['title'];
	  var legende = json['files']['audio'][i]['legende'];
	  $('#'+json['files']['audio'][i].name)
	  	.attr('data-title', title)
	  	.attr('data-legende', legende)
	  	.find('.mediaData .mediaData--titre').html(title)
			.end()
			.find('.mediaData .mediaData--legende').html(legende);

    // if( title === undefined && legende === undefined) {
  	 //  $('#'+json['files']['audio'][i].id)
  	 //    .find('.mediaData')
  	 //      .remove()
  	 //  ;
    // }

		if(json['files']['audio'][i].highlight == true){
			$('#'+json['files']['audio'][i].name).addClass('is--highlight');
		}
	}

	for (var i = 0; i < json['files']['texte'].length; i++){
	  var title = json['files']['texte'][i]['title'];
	  var legende = json['files']['texte'][i]['legende'];
	  $('#'+json['files']['texte'][i].id)
	  	.attr('data-title', title)
	  	.attr('data-legende', legende)
	  	.find('.mediaData .mediaData--titre').html(title)
			.end()
			.find('.mediaData .mediaData--legende').html(legende);

    // if( title === undefined && legende === undefined) {
  	 //  $('#'+json['files']['texte'][i].id)
  	 //    .find('.mediaData')
  	 //      .remove()
  	 //  ;
    // }

		if(json['files']['texte'][i].highlight == true){
			$('#'+json['files']['texte'][i].id).addClass('is--highlight');
		}
	}



	//display text
	socket.on('txtRead', function(data){
		$("#"+data.obj.id)
			.find( '.mediaContent').html(data.content);
	});

}

function displayImage(session, project, id, file, extension){
	var imagePath = "../"+ file;
	var mediaItem = $(".js--templates .media_image").clone(false);
	console.log(file, id  + extension);
	//if(file != id + extension){
		console.log(file);
		mediaItem
	    .attr( 'id', id)
	    .attr( 'data-mediatype', 'image')
		  .find( '.mediaContent img')
		    .attr('src', imagePath)
	    .end()
	  ;
	  $('.medias-list').prepend(mediaItem);
	//}
}

function displayVideo(session, project, id, file){
	var thumbPath = '../'+id +'-thumb.png';
	var videoPath = '../' + file;

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
	  .attr( 'id', id)
    .attr( 'data-mediatype', 'video')
    .find( 'video')
      .attr( 'poster', thumbPath)
    .end()
    .find( 'source')
      .attr( 'src', videoPath)
    .end()
  ;

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
    .attr( 'data-mediatype', 'stopmotion')
    .find( 'video')
      .attr( 'poster', thumbPath)
    .end()
    .find( 'source')
      .attr( 'src', videoPath)
    .end()
  ;

  //$(".medias-list li:first-child").after(mediaItem);
	$('ul.medias-list').prepend(mediaItem);
}

function displayAudio(session, project, id, file){
	var audioPath = '../' + file;

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
	  .attr( 'id', id)
    .attr( 'data-mediatype', 'audio')
    .find( 'source')
      .attr( 'src', audioPath)
    .end()
  ;

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
  	var mediaTitle = $(this).attr("data-title");
	  var mediaLegende = $(this).attr("data-legende");
  	$('#modal-media-view').foundation('reveal', 'open');
  	//console.log(typeMedia);
  	switch(typeMedia){
  		case 'image':
	  		var imagePath = $(this).find("img").attr("src");
	  		var id = $(this).attr("id");
				var mediaItem = $(".js--templates .media-big_image").clone(false);
				if($(this).hasClass('is--highlight')){
					mediaItem.addClass('is--highlight');
				}
				mediaItem.attr( 'id', id);
				mediaItem
					.find( 'img').attr('src', imagePath)
					.end()
					.find('.add-media-title').val(mediaTitle)
					.end()
					.find('.add-media-legend').val(mediaLegende)
					;
				$('#modal-media-view .big-mediaContent').html(mediaItem);
				break;
			case 'video':
				var id = $(this).attr("id");
	  		var thumbPath = $(this).find("video").attr("poster");
				var videoPath = $(this).find("source").attr("src");

				var mediaItem = $(".js--templates .media-big_video").clone(false);
				if($(this).hasClass('is--highlight')){
					mediaItem.addClass('is--highlight');
				}
				mediaItem
				  .attr( 'id', id)
				  .find('.add-media-title').val(mediaTitle)
					.end()
					.find('.add-media-legend').val(mediaLegende)
					.end()
			    .find( 'video').attr( 'poster', thumbPath)
			    .find( 'source').attr( 'src', videoPath)
					;

				$('#modal-media-view .big-mediaContent').html(mediaItem);
				break;
			case 'stopmotion':
	  		var id = $(this).attr("id");
	  		var thumbPath = $(this).find("video").attr("poster");
				var videoPath = $(this).find("source").attr("src");

				var mediaItem = $(".js--templates .media-big_stopmotion").clone(false);

				if($(this).hasClass('is--highlight')){
					mediaItem.addClass('is--highlight');
				}
				mediaItem
				  .attr( 'id', id)
				  .find('.add-media-title').val(mediaTitle)
					.end()
					.find('.add-media-legend').val(mediaLegende)
					.end()
			    .find( 'video').attr( 'poster', thumbPath)
			    .find( 'source').attr( 'src', videoPath)
			    .end()
					;

				$('#modal-media-view .big-mediaContent').html(mediaItem);
				break;
			case 'audio':
				var id = $(this).attr("id");
				var audioPath = $(this).find("source").attr("src");

				var mediaItem = $(".js--templates .media-big_audio").clone(false);
				if($(this).hasClass('is--highlight')){
					mediaItem.addClass('is--highlight');
				}
				mediaItem
				  .attr( 'id', id)
			    .find( 'source').attr( 'src', audioPath)
			    .end()
					.find('.add-media-title').val(mediaTitle)
					.end()
					.find('.add-media-legend').val(mediaLegende)
					;

				$('#modal-media-view .big-mediaContent').html(mediaItem);
				break;
			case 'text':
				//console.log($(this).find('h3').html());
				var mediaItem = $(".js--templates .media-big_text").clone(false);
				var title = $(this).find('h3').html();
				var texte = $(this).find('p').html();
				var id = $(this).attr('id');
				if($(this).hasClass('is--highlight')){
					mediaItem.addClass('is--highlight');
				}
				mediaItem
					.find('.view-text-title-modify').val(title)
					.end()
					.find('.view-text-modify').val(texte)
					.end()
					.attr('id', id)
					.attr('data-id', id)
					.end()
					.find('.view-text-title-modify').val(mediaTitle)
					.end()
					.find('.view-text-modify').val(mediaLegende)
					;

				$('#modal-media-view .big-mediaContent').html(mediaItem);
				break;

  	}
  });
}

function onMediaData(data){
	$('#modal-media-view').foundation('reveal', 'close');
	$("#"+data.id)
		.attr('data-title', data.title)
		.attr('data-legende', data.legend)
		.find('.mediaData--titre').html(data.title)
		.end()
		.find('.mediaData--legende').html(data.legend);
}

function onHighlight(data){
	//$('#modal-media-view').foundation('reveal', 'close');
	if(data.highlight == true){
		$("#"+data.id)
			.addClass('is--highlight');
		$('.js--highlightMedia').css({
			"background-color": "#48C2B5",
			"color": "#FFF",
			"border": "none"
		});
	}
	else{
		$("#"+data.id)
			.removeClass('is--highlight');
		$('.js--highlightMedia').css({
			"background-color": "#FFF",
			"color": "#48C2B5",
			"border": "1px solid #48C2B5"
		});
	}
}

function onFileDeleted(data){
	$('#modal-media-view').foundation('reveal', 'close');
	$("#"+data.id).remove();
}

function onMontageChanged(){
	var montageContent = $(".inner-montage").html();
	var title = $('.montage-title h2').html();
	socket.emit("saveMontage", {html:montageContent, title: title, session:currentFolder, projet:currentProject});
}

function onPubliCreated(data){

	var publiItem = $(".js--templates .publi-folder").clone(false);

	var publiLink = convertToSlug(data.name);
	var publiPath = '/'+currentFolder+'/'+currentProject+'/publication/'+ publiLink;

	publiItem
		.attr('data-publi', publiLink)
		.find('h2').html(data.name).end()
		.find('.js--publi_view').attr('href', publiPath).end()
  ;

	$('.montage-list ul').prepend(publiItem);
	$('input.new-publi').val('');
	$('#modal-add-publi').foundation('reveal', 'close');

}

function onDisplayMontage(data){
	var publiName = convertToSlug(data.name);
	var publiPath = '/'+currentFolder+'/'+currentProject+'/publication/'+publiName;
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
	socket.emit('listMedias', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
	socket.emit('listPubli', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

