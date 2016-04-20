/* VARIABLES */
var socket = io.connect();


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listMedias', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
	socket.emit('listPublis', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('listMediasOfOneType', onListMediasOfOneType);

socket.on('listPublications', onListPublications);
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

  publi.init();

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
    sendData.editMedia( editMediaData);
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

/**********************************************************************
              PUBLIS
**********************************************************************/

function onListPublications( publisData) {
  // get the data
  var $getAllPublisFormatted = listPublis( publisData);
  var $publiContainer = $(".mainContent .montage-list ul");
  debugger;
  $getAllPublisFormatted.each( function() {
    insertOrReplacePubli( $(this), $publiContainer);
  });
}

function onPubliCreated(publisData){
  console.log( "onPubliCreated");
  onListPublications( publisData);
}


var publi = {

  init : function( mediaData) {

  	$('body')
  	  .on('click', '.js--submit-new-publi', function(e){
    		var publiName = $('.new-publi').val();
    		if( publiName.length > 0) {
      		publi.createNew( publiName);
          $("#modal-add-publi").foundation('reveal', 'close');
        }
    	})

  	  .on('click', '.montage-title .js--editerTitre', function(e){
    		$('.montage-title input').show().val($('.montage-title .title').html());
    		$('.montage-title .title').hide();
    		$(this).hide();
    		$('.montage-title .js--validerTitre').css("display", "block");
      })
  	  .on('click', '.montage-title .js--validerTitre', function(e){
    		var oldTitle = $('.montage-title .title').html();
    		var newTitle = $('.montage-title input').val();
    		$('.montage-title input').hide();
    		$('.montage-title .title').show().html(newTitle);
    		$(this).hide();
    		$editerBouton.css("display", "block");
    		// send new title with publi name
      })

    	.on('click', '.js--edit_view', function(e){
      	e.preventDefault();
    		var $thisPubli = $(this).closest('.publi-folder');
        publi.openPubli( $thisPubli);
    	})

    	.on('click', '.js--backButton', function(){
  		  $('.montage-inner').empty();
        $('.montage-edit').hide();
  	  })

      .on('click', '.js--delete-media-montage', function(){
      	var $elementToDel = $(this).parent("li.media");
      	$elementToDel.fadeOut( 600,function(){
      		$elementToDel.remove();
      		onMontageChanged();
      	});
      })
      ;


  },

  createNew : function( pname) {
    var publiJson =
    {
      "name" : pname
    }
    sendData.createNewPubli( publiJson);
  },

  openPubli : function( $thisPubli) {

    // cloner un .montage-edit
    var $montageEdit = $(".js--templates .montage-edit").clone(false);

    var pdata = $thisPubli.data();

    debugger;

    $montageEdit
      .find(".title")
        .html( pdata.publiName)
      .end()
      .find(".js--publi_view")
        .attr('href', '')
      .end()
      ;

    if(data.html != 'none')
		  $('.montage-edit[data-publi="'+publiName+'"]').find('.inner-montage').html(data.html);

    // le placer dans .montage-edit-container

  },

  savePubliContent : function( newPubliContent) {


  },

}




function onMontageChanged(){
	var montageContent = $(".inner-montage").html();
	var title = $('.montage-title h2').html();
	socket.emit("saveMontage", {html:montageContent, title: title, session:currentFolder, projet:currentProject});
}

function onDisplayMontage(data){
	var publiName = convertToSlug(data.name);
	var publiPath = '/'+currentFolder+'/'+currentProject+'/publication/'+publiName;
	$('.montage-edit')
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


