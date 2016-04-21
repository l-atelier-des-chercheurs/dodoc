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
socket.on('publiUpdated', onPubliUpdated);

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
  var $publiLibrary = $(".mainContent .montage-list ul");
  var $montage = $('.montage-edit-container .montage-edit');

  // also, check which publi is currently opened.
  var $publiContent = $('.montage-edit-container .montage-edit');
  var publiCurrentlyShown;
  if( $publiContent.length !== 0)
    publiCurrentlyShown = $publiContent.data('publishown');

  // insert or replace publi in the list of publications
  $getAllPublisFormatted.each( function() {
    $thisPubliItem = $(this);
    insertOrReplacePubli( $thisPubliItem, $publiLibrary);
    // if the currently parsed publi is currently being edited
    if( publiCurrentlyShown !== undefined && publiCurrentlyShown === $thisPubliItem.data('publislug')) {
      // let's compare its content to the content gotten

      // if different lets update
      var $publiMedias = publi.updateMontageContent( $thisPubliItem.data('medias'));
      var $innerMontage = $montage.find('.inner-montage');
      $innerMontage.html( $publiMedias);
    }
  });

}

function onPubliCreated(publisData){
  console.log( "onPubliCreated");
  onListPublications( publisData);
}

function onPubliUpdated( publisData) {
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
  		  $('.montage-edit-container')
  		    .empty()
  		    .hide()
  		    ;
  	  })

      .on('click', '.js--delete-media-montage', function(){
      	var $elementToDel = $(this).parent("li.media");

      	// check if media is in the montage
      	if( $elementToDel.closest('.montage-edit').length > 0) {
        	$elementToDel.fadeOut( 600,function(){
        		$elementToDel.remove();
            $(document).trigger( 'drop_succeeded');
        	});
        }
      })
      ;

    // a drag and drop has succeeded, let's scan inner-montage to parse all medias
    // and send it to the right json
    $(document).on( 'drop_succeeded', function() {

      var $montage = $('.montage-edit-container .montage-edit');
      var slugPubliName = $montage.data('publishown');

      var $montageMedias = $montage.find('.media');


      var listMediasPaths = [];
      $montageMedias.each(function() {
        $mma = $(this);
        var mediaPathForPubli = $mma.data('pathforpubli');
        listMediasPaths.push( mediaPathForPubli);
      });

      // listMediasPaths is a list of all the medias referenced by their json meta-file

      var publiJson =
      {
        "slugPubliName" : slugPubliName
      }
      publiJson['medias'] = listMediasPaths;

      // let's send it over to node so it is saved in the publication jsonfile
      sendData.editThisPubli( publiJson);
    });

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
    var publiMediaFromLib = publi.updateMontageContent( pdata.medias);

    $montageEdit
      .attr("data-publishown", pdata.publislug)
      .find(".title")
        .html( pdata.publiname)
      .end()
      .find(".js--publi_view")
        .attr('href', pdata.linkToPubli)
      .end()
      .find('.inner-montage')
        .html( publiMediaFromLib)
      .end()
      ;


    // le placer dans .montage-edit-container
    $('.montage-edit-container')
      .html( $montageEdit)
      .show()
      ;

    $(document).trigger('restart_dragula');

  },

  updateMontageContent : function( listOfMediasToAdd) {

    var $lib = $(".mainContent .medias-list");
    var $montage = $('.montage-edit-container .montage-edit');

    var $publiMedias = $();

    $.each( listOfMediasToAdd, function( i, media) {

      // let's find the item with pathforpubli="01-photos/20160419_224310.json" in lib
      var $mediaFromLib = $lib
        .find('.media')
          .filter("[data-pathforpubli='" + media + "']")
            .clone(true)
        ;

/*
      // let's find the item with pathforpubli="01-photos/20160419_224310.json" in montage
      var $mediaFromMontage = $montage
        .find('.media')
          .filter("[data-pathforpubli='" + media + "']")
        ;
*/

      $publiMedias = $publiMedias.add( $mediaFromLib);
    });

    return $publiMedias;
  },

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


