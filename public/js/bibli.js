
/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
/*
socket.on('displayNewImage', displayNewImage);
socket.on('displayNewVideo', displayNewVideo);
socket.on('displayNewStopMotion', displayNewStopMotion);
socket.on('displayNewAudio', displayNewAudio);
socket.on('displayNewText', displayNewText);
socket.on('displayModifiedText', displayModifiedText);
*/
socket.on('listMediasOfOneType', onListMediasOfOneType);
socket.on('listPublications', onPubliCreated);
socket.on('publiCreated', onPubliCreated);
socket.on('displayMontage', onDisplayMontage);
socket.on('titleModified', onTitleModified);
socket.on('displayMediaData', onMediaData);

socket.on('bibliFileDeleted', onFileDeleted);
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.

socket.on('mediaCreated', onMediaCreated);
socket.on('mediaUpdated', onMediaUpdated);

socket.on('listOneMedia', onListOneMedia);


// socket.on('newMediaUpload', onNewMediaUpload);

/*
function onNewMediaUpload(data){
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
*/

jQuery(document).ready(function($) {
	$(document).foundation();
	init();
});

function init(){

  // le drag and drop avec dragula se fait maintenant dans le fichier dom_autoscroller.js
  // en attendant de faire mieux

	bigMedia();

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

    var $modal = $(this).closest('#modal-add-text');
  	var textTitle = $modal.find('.js--submit-new-text_title').val();
  	var textContent = $modal.find('.js--submit-new-text_text').val();

  	console.log('addText');

    var mediaData =
    {
      "mediaType" : "text",
      "title" : textTitle,
      "text" : textContent,
    }
    createNewMedia( mediaData);

  });

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


 // Ajoute ou enlève un highlight quand on clique sur le drapeau dans les médias
  $('body').on('click', '.js--flagMedia', function(e){
  	e.stopPropagation();

		var $thisMedia = $(this).closest(".media");
		var medianame = $thisMedia.attr("data-medianame");
		var mediaFolderPath = $thisMedia.attr("data-mediatype");

    var editMediaData =
    {
      "mediaName" : medianame,
      "mediaFolderPath" : mediaFolderPath,
      "switchFav" : true
    };
    editMedia( editMediaData);
  });

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


function onListMediasOfOneType( mediasData) {
  var $getAllMediasFormatted = listMediasOfOneType( mediasData);
  var $mediaContainer = $(".mainContent .medias-list");

  $getAllMediasFormatted.each( function() {
    insertOrReplaceMedia( $(this), $mediaContainer);
  });
}

function onListOneMedia( mediasData) {
  var $updatedMedia = listMediasOfOneType( mediasData);
  var $mediaContainer = $(".mainContent .medias-list");
  insertOrReplaceMedia( $updatedMedia, $mediaContainer);
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

function bigMedia(){
	// Au click sur un media

	$('body').on('click', '.medias-list .media', function(){
		$m = $(this);
		modals.bigMedia($m);
  });

}

function onMediaData(data){
	$("#"+data.id)
		.attr('data-title', data.title)
		.attr('data-legende', data.legend)
		.find('.mediaData--titre').html(data.title)
		.end()
		.find('.mediaData--legende').html(data.legend);
}

/**********************************************************************
              MEDIA CREATED OR UPDATED
**********************************************************************/

// returns when a text content has been added
function onMediaCreated( mediaData) {

  // check if it's a text. If it is, we just need to close the popup if its being edited
  if( mediaData.type == 'text') {

    // check if theres a popup thats open
    var $textModalThatsOpen = $("#modal-add-text.open");

    if( $textModalThatsOpen.length > 0) {
    	var textTitle = $textModalThatsOpen.find('.js--submit-new-text_title').val();
    	var textContent = $textModalThatsOpen.find('.js--submit-new-text_text').val();

      // does the mediaData correspond to the bigmedia ?
      var simulateStoredInfos = textTitle + dodoc.textFieldSeparator + textContent;

      if( mediaData.contentOfText === simulateStoredInfos)
        // close that popup
        $textModalThatsOpen.foundation('reveal', 'close');

    //     var contentOfPopup =
    }

  }
  listOneMedia( mediaData);
}

function onMediaUpdated( mediaData) {
  listOneMedia( mediaData);
}

function onFileDeleted(data){
	$('#modal-media-view').foundation('reveal', 'close');
	$("#"+data.id).remove();
}

/********************************************************************************************
                            publis
********************************************************************************************/

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


