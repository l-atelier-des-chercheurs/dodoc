/* VARIABLES */
var socket = io.connect();


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

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('listMediasOfOneType', onListMediasOfOneType);
socket.on('listPublications', onPubliCreated);
socket.on('publiCreated', onPubliCreated);
socket.on('displayMontage', onDisplayMontage);
socket.on('titleModified', onTitleModified);
socket.on('displayMediaData', onMediaData);

socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.

socket.on('mediaCreated', onMediaCreated);
socket.on('mediaUpdated', onMediaUpdated);
socket.on('mediaRemoved', onMediaRemoved);

socket.on('listOneMedia', onListOneMedia);

jQuery(document).ready(function($) {
	$(document).foundation();
	init();
});

function init(){

  // le drag and drop avec dragula se fait maintenant dans le fichier dom_autoscroller.js
  // en attendant de faire mieux

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

  $('body').on('click', '.js--delete-media-montage', function(){
  	var $elementToDel = $(this).parent("li.media");
  	$elementToDel.fadeOut( 600,function(){
  		$elementToDel.remove();
  		onMontageChanged();
  	});
  });



	$(".js--open_publicationspane").on( 'click', function(e) {
  	e.preventDefault();
  	$('body').attr( "data-publicationpane", $('body').attr('data-publicationPane') === 'open' ? '' : 'open');
  });

	// Au click sur un media
	$('body').on('click', '.medias-list .media', function(){
		$m = $(this);
		modals.bigMedia($m);
  });

  // Au click sur le bouton "submit" d'un popup de texte
  $('.js--submit-new-text').on('click',function(){
    modals.createTextMedia();
  });

  // si en arrivant sur la page, il y a un hash dans l'url
  // alors ouvrir la publication qui a ce nom directement
  var urlHash = window.location.hash;
  if( urlHash.length > 0){
    setTimeout(function() {
      $('.montage-list [data-publi=' + urlHash.substring(1) + ']').find('.js--edit_view').trigger( 'click');
    }, 250);


  }


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


}


function onListMediasOfOneType( mediasData) {
  var $getAllMediasFormatted = listMediasOfOneType( mediasData);
  var $mediaContainer = $(".mainContent .medias-list");

  $getAllMediasFormatted.each( function() {
    insertOrReplaceMedia( $(this), $mediaContainer);
  });
}

function onListOneMedia( mediasData) {
  console.log( "onListOneMedia");
  var $updatedMedia = listMediasOfOneType( mediasData);
  var $mediaContainer = $(".mainContent .medias-list");
  insertOrReplaceMedia( $updatedMedia, $mediaContainer);
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
function onMediaCreated( mediasData) {
  console.log( "onMediaCreated");

  var mediaData = getFirstMediaFromObj( mediasData);

  if( mediaData.slugFolderName !== currentFolder || mediaData.slugProjectName !== currentProject)
    return;

  var $updatedMedia = listMedia( mediaData);
  var $mediaContainer = $(".mainContent .medias-list");
  insertOrReplaceMedia( $updatedMedia, $mediaContainer);

}

function onMediaUpdated( mediasData) {
  console.log( "onMediaUpdated");
  onMediaCreated( mediasData);
}


function onMediaRemoved( mediaData){
  console.log( "onMediaRemoved");
  if( mediaData.slugFolderName !== currentFolder || mediaData.slugProjectName !== currentProject)
    return;
  removeMedia( $('.medias-list .media'), mediaData);
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


