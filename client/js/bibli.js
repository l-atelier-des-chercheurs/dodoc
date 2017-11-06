
/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log( 'Connected ' + sessionId);
	socket.emit( 'listOneProjectMedias', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
	socket.emit( 'listOneProjectPublis', { "slugFolderName" : currentFolder, "slugProjectName" : currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('listAllMedias', onListAllMedias);

socket.on('listOneProjectPublis', onListOneProjectPublis);

socket.on('mediaCreated', onMediaCreated);
socket.on('mediaUpdated', onMediaUpdated);
socket.on('mediaRemoved', onMediaRemoved);

socket.on('publiCreated', onPubliCreated);

socket.on('listOnePubliMetaAndMedias', onListOnePubliMetaAndMedias);
socket.on('publiMetaUpdated', onPubliMetaUpdated);
socket.on('publiMediasUpdated', onPubliMediasUpdated);


jQuery(document).ready(function($) {
	$(document).foundation();
	init();
});

var publi = {
  init : function( mediaData) {
    	$('body')
      	.on('click', '.js--edit_view', function(e){
        	e.preventDefault();
      		var $thisPubli = $(this).closest('.publi-folder');
        publi.openPubli( $thisPubli);
      	})
      	.on('click', '.js--backButton', function(){
    		  $('[data-publidata]')
    		    .empty()
    		    .hide()
    		    ;
    	  })
      .on('click', '.js--delete-media-montage', function(e){
        e.preventDefault();
        	var $elementToDel = $(this).parent("li.media");
        	// check if media is in the montage
        	if( $elementToDel.closest('[data-publidata]').length > 0) {
          	$elementToDel.fadeOut( 600,function(){
          		$elementToDel.remove();
              $(document).trigger( 'update_media_montage');
          	});
        }
        return false;
      })
      ;

    // a drag and drop has succeeded, let's scan publi_medias to parse all medias
    // and send it to the right json
    $(document).on('update_media_montage', function() {

      var $montage = $('[data-publidata]');
      var slugPubliName = $montage.data('publishown');
      var $montageMedias = $montage.find('.media');

      // listMediasPaths is a list of all the medias referenced by their json meta-file
      var listMediasItems = [];
      $montageMedias.each(function() {
        $mma = $(this);
        var mediakey = $mma.data('mediakey');
        var mediaJson = {
          "name" : mediakey
        };
        listMediasItems.push( mediaJson);
      });

      var publiJson = new Object();
      publiJson.slugPubliName = slugPubliName;
      publiJson.medias = listMediasItems;

      // let's send it over to node so it is saved in the publication jsonfile
      sendData.editPubliMedias( publiJson);
    });

  },

  openPubli : function( $thisPubli) {

    var $montageContainer = $('[data-publidata]');

    // cloner un .montage-edit
    var $montage = $(".js--templates .montage_publi").clone(false);
    var pdata = $thisPubli.data();

    $montageContainer
      .attr("data-publishown", pdata.slugPubliName)
      .data("publishown", pdata.slugPubliName)
      ;

    var publiData =
    {
      "slugPubliName" : pdata.slugPubliName
    };

    // le placer dans .montage-edit-container
    $montageContainer
      .html( $montage)
      .show()
      ;

    // demander à récupérer les médias en full de la publi
    sendData.listOnePubliMetaAndMedias( publiData);

    $(document).trigger('restart_dragula');
  },

  makePubliMedias : function( listOfMediasToAdd) {
    // publi medias are listed in an array (to respect order and make sure that 2 medias with same keys aren't removed)
    // so we need to listAllMedias one by one
    var $medias = $();
    for( media of listOfMediasToAdd.medias) {
      $medias = $medias.add( listAllMedias(media));
    }
    return $medias;
  }

}

function init(){

  // le drag and drop avec dragula se fait maintenant dans le fichier dom_autoscroller.js
  // en attendant de faire mieux
  publi.init();

	$(".js--open_publicationspane").on( 'click', function(e) {
    	e.preventDefault();
    	$('body').attr( "data-publicationpane", $('body').attr('data-publicationPane') === 'open' ? '' : 'open');
  });

  // si en arrivant sur la page, il y a un hash dans l'url
  // alors ouvrir la publication qui a ce nom directement
  var urlHash = window.location.hash.substring(1);
  if( urlHash.length > 0){
    setTimeout(function() {
      $('.montage-list')
        .find('.publi-folder')
          .filter(function() {
            return $(this).data('slugPubliName') === urlHash;
          })
            .find('.js--edit_view')
              .trigger( 'click')
      ;
    }, 550);
  }

 // Ajoute ou enlève un highlight quand on clique sur le drapeau dans les médias
  $('body').on('click', '.js--highlightMedia', function(e){
    	e.stopPropagation();
		var $thisMedia = $(this).closest(".media");
		var medianame = $thisMedia.attr("data-medianame");
		var mediaFolderPath = $thisMedia.attr("data-mediatype");
    var editMediaData = {
      "mediaName" : medianame,
      "mediaFolderPath" : mediaFolderPath,
      "switchFav" : true
    };
    sendData.editMedia( editMediaData);
  });
}


function onListAllMedias( mediasData) {
  console.log( "onListAllMedias");
  var $getAllMediasFormatted = listAllMedias( mediasData);
  var $mediaContainer = $(".mainContent .medias-list");

  $getAllMediasFormatted.each( function() {
    insertOrReplaceMedia( $(this), $mediaContainer);
  });
}


/**********************************************************************
              MEDIA CREATED OR UPDATED
**********************************************************************/

// returns when a text content has been added
function onMediaCreated( mediasData) {
  console.log( "onMediaCreated");
  var $getAllMediasFormatted = listAllMedias( mediasData);
  var $mediaContainer = $(".mainContent .medias-list");

  $getAllMediasFormatted.each( function() {
    var $m = $(this);
    $m.attr('data-oninsert', 'slideFromTop');
    insertOrReplaceMedia( $m, $mediaContainer);
  });
}

function onMediaUpdated( mediasData) {
  console.log( "onMediaUpdated");
  var $getAllMediasFormatted = listAllMedias( mediasData);
  var $mediaContainer = $(".mainContent .medias-list");

  $getAllMediasFormatted.each( function() {
    var $m = $(this);
    $m.attr('data-oninsert', 'blink');
    insertOrReplaceMedia( $m, $mediaContainer);
  });

  // if the publi pane is open, there's a chance we juste updated a media that's also in the publi !
  // if publi pane is open, let's ask for a new publimedias list
  askToUpdateCurrentPubli();

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

function onListOneProjectPublis( publisData) {
  // get the data
  var $getAllPublisFormatted = listPublis( publisData);
  var $publiLibrary = $(".mainContent .montage-list ul");

  // insert or replace publi in the list of publications
  $getAllPublisFormatted.each( function() {
    $thisPubliItem = $(this);
    insertOrReplacePubli( $thisPubliItem, $publiLibrary);
  });
}

function onPubliCreated(publisData){
  console.log( "onPubliCreated");
  onListOneProjectPublis( publisData);
}

function onPubliMetaUpdated( psdata) {
  console.log( "onPubliMetaUpdated");
  // re-list all publis
  onListOneProjectPublis( psdata);
  // update meta of montage
  updateMontagePubliMeta( psdata);
}
function onPubliMediasUpdated( psdata) {
  console.log( "onPubliMediasUpdated");
  // update medias of montage if necessary
  updateMontagePubliMedias( psdata);
}

function askToUpdateCurrentPubli() {
  var $publiContent = $('[data-publidata]');
  // if publi pane isn't visible with a publi inside
  if( $publiContent.length === 0) return;

  var publiShown = $publiContent.data('publishown');
  if( publiShown !== undefined && publiShown !== '') {
    var publiData =
    {
      "slugPubliName" : publiShown
    };
    sendData.listOnePubliMetaAndMedias( publiData);
  }

}


// list content of a publi
function onListOnePubliMetaAndMedias( psdata) {
  console.log( "onListOnePubliMetaAndMedias");

  var $publiContent = $('[data-publidata]');

  // if publi pane isn't visible with a publi inside
  if( $publiContent.length === 0) return;

  updateMontagePubliMeta( psdata);
  updateMontagePubliMedias( psdata);

}
