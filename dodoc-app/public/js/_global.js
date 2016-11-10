
var sessionId;
// context vars sent by Node via router.js to footer.jade namespaced with app
var currentFolder = app.currentFolder;
var currentProject = app.currentProject;
var currentPubli = app.currentPubli;

/* fonction accessible depuis l'extérieur :
    - listAllMedias
    - loadProject

*/


function loadProject( projectData) {

	var projectName = projectData.name;
	var slugProjectName = projectData.slugProjectName;
	var slugFolderName = projectData.slugFolderName;

  var createdDate = projectData.created;
  var modifiedDate = projectData.modified;

	var createdDateUser = transformDatetoString( createdDate);
	var modifiedDateUser = transformDatetoString( modifiedDate);

	var statut = projectData.statut;

	var $newProject = $(".js--templates > .project").clone(false);
	var path = '/' + slugFolderName + '/' + slugProjectName;

  var imageSrc = '';
  if( projectData.projectPreviewName !== undefined && projectData.projectPreviewName !== false)
  	imageSrc = path + "/" + projectData.projectPreviewName + '?' + modifiedDate;

  if( modifiedDate === null)
    $newProject.find('.modify-date').remove();


  // customisation du projet
	$newProject
	  .attr( 'data-projectname', slugProjectName)
	  .attr( 'data-statut', statut)
	  .data( 'slugProjectName', slugProjectName)
	  .data( 'projectName', projectName)
  	.data( 'mtimestamp', transformDatetoTimestamp( createdDate))
  	.data( 'ctimestamp', transformDatetoTimestamp( modifiedDate))
	  .find( '.statut-type').text( statut).end()
	  .find( '.image-wrapper')
	    .css('background-image', 'url(' + imageSrc + ')')
	    .attr('alt', projectName)
	  .end()
	  .find( '.create-date').text( createdDateUser).end()
	  .find( '.modify-date').text( modifiedDateUser).end()
	  .find( '.title').text( projectName).end()
	  .find( '.project-link').attr( 'href', path).end()
	  .find( '.button-wrapper_capture').attr( 'href', path + '/capture').end()
	  .find( '.button-wrapper_bibli').attr( 'href',  path + '/bibliotheque/medias').end()
	  .find( '.button-wrapper_publi').attr( 'href', path + '/bibliotheque/panneau-de-publications').end()
  ;
	return $newProject;
}


function listAllMedias( mediasData) {
  console.log( 'listAllMedias');

  var $allMedias = $();
  var lastMedias = mediasData;

  $.each( lastMedias, function( mediaKey, mediaDatas) {
    var $newMedia = makeOneMedia( mediaKey, mediaDatas);
    mediaInit( $newMedia);

    if( $newMedia !== undefined)
      $allMedias = $allMedias.add( $newMedia);
  });

  return $allMedias;
}

function listMedia( mediaData) {
  var $newMedia = makeOneMedia( mediaKey, mediaData);
  if( $newMedia !== undefined)
    return $newMedia;
  return false;
}


// fonction qui réunit les fonctionnalités d'un média (que ce soit une vidéo, une image, un son, etc.

function mediaInit( $m) {
  var $v = $m.find('video');

  if( $('body').hasClass('publi')) {

    // special template "grille", "marseille" et "numok" (à compartimenter plus proprement)
    if( $m.data('informations').length > 0) {
      var $button = $('<button class="showCaption">t</button>');
      $m.find('.mediaContent').prepend($button);
      $button.on('click', function() { $(this).toggleClass('is--clicked');});
    }

    if( $('.publi_container .template_container').data("template") === "numok") {
      if( $v.length > 0) {
        $v
          .attr('loop', true)
          .removeAttr('controls')
          .get(0)
            .play()
          ;
      }
    }

  }

  if( $('.publi_container > .template_container').data("template") !== "numok") {
    $m.hover(function() {
      if( $v.length > 0) {
        $v
          .attr('loop', true)
          .removeAttr('controls')
          .get(0)
            .play()
          ;
      }
    }, function() {
      if( $v.length > 0) {
        $v
          .removeAttr('loop')
          .attr('controls', true)
          .get(0)
            .pause()
          ;
        $v.get(0).currentTime = 0;
      }
    });
  }
}


function makeOneMedia( mediaKey, mdata) {
  console.log( "makeOneMedia");

  if( mdata.slugFolderName !== currentFolder || mdata.slugProjectName !== currentProject)
    return;

  var $currentMedia = '';
  if( mdata.mediaFolderPath === dodoc.projectPhotosFoldername)
    $currentMedia = showImage( mdata);

  if( mdata.mediaFolderPath === dodoc.projectAnimationsFoldername)
    $currentMedia = showAnimation( mdata);

  if( mdata.mediaFolderPath === dodoc.projectVideosFoldername)
    $currentMedia = showVideo( mdata);

  if( mdata.mediaFolderPath === dodoc.projectAudiosFoldername)
    $currentMedia = showAudio( mdata);

  if( mdata.mediaFolderPath === dodoc.projectTextsFoldername)
    $currentMedia = showText( mdata);


  $currentMedia
    .attr( 'data-mediakey', mediaKey)
    .attr( 'data-mediaName', mdata.mediaName)
    .attr( 'data-mediatype', mdata.mediaFolderPath)
    .attr( 'data-type', mdata.mediaFolderPath)
  	.attr( 'data-informations', mdata.informations)
  	.addClass( mdata.fav ? 'is--highlight' : '')
  	.find( '.mediaData--informations')
  	  .html( mdata.informations)
    .end()
  	.data( 'mtimestamp', transformDatetoTimestamp( mdata.modified))
  	.data( 'ctimestamp', transformDatetoTimestamp( mdata.created))
    ;

  if( mdata.title === undefined && mdata.informations === undefined) {
    $currentMedia.find('.mediaData').remove();
  }

  if( mdata.fav === "true") {
    $currentMedia.addClass('is--highlight');
  }

  return $currentMedia;
}

function makeFullPathForProject( path) {
  return '/' + currentFolder + '/' + currentProject + '/' + path;
}

function showImage( mediaDatas) {

  var imagesPath = getMediaFiles(mediaDatas);

	var mediaItem = $(".js--templates .media_image").clone(false);

  	mediaItem
      .data('imagesrc_fullsize', imagesPath.img_large)
      .find( 'img')
        .attr('src', imagesPath.img_thumb !== undefined ? imagesPath.img_thumb:imagesPath.img_large)
      .end()
      ;

	return mediaItem;
}


function showAnimation( mediaDatas) {

  var imagesPath = getMediaFiles(mediaDatas);

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
    .data('imagesrc_fullsize', imagesPath.img_large)
    .find( 'video')
      .attr( 'poster', imagesPath.img_large)
    .end()
    .find( 'source')
      .attr( 'src', imagesPath.video)
    .end()
  ;

	return mediaItem;
}

function showVideo( mediaDatas) {
  var imagesPath = getMediaFiles(mediaDatas);
	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
    .data('imagesrc_fullsize', imagesPath.img_large)
    .find( 'video')
      .attr( 'poster', imagesPath.img_large)
    .end()
    .find( 'source')
      .attr( 'src', imagesPath.video)
    .end()
  ;

	return mediaItem;
}

function showAudio( mediaDatas) {

  var imagesPath = getMediaFiles(mediaDatas);
	var mediaItem = $(".js--templates .media_audio").clone(false);

	mediaItem
    .data('imagesrc_fullsize', imagesPath.img_large)
    .find('source')
      .attr( 'src', imagesPath.audio)
    .end()
    .find('.poster')
      .attr('src', imagesPath.img_large)
    .end()
  ;

	return mediaItem;
}

function showText( mediaDatas) {

  var mediaTitle = mediaDatas.textMediaContent.title_md;
  var mediaText = mediaDatas.textMediaContent.text_md;
  var titleOfTextmediaMd = mediaDatas.textMediaContent.title;
  var textOfTextmediaMd = mediaDatas.textMediaContent.text;

	var mediaItem = $(".js--templates .media_text").clone(false);
	mediaItem
	  .find( '.mediaContent--titleOfTextmedia')
	    .html( mediaTitle)
    .end()
    .data( 'titleOfTextmediaMd', titleOfTextmediaMd)
	  .find( '.mediaContent--textOfTextmedia')
	    .html( mediaText)
    .end()
    .data( 'textOfTextmediaMd', textOfTextmediaMd)
    ;
	return mediaItem;

}


function getMediaFiles(mediaDatas) {
  var mediaFolderPath = mediaDatas.mediaFolderPath;
  var mediaFilenames = mediaDatas.files;
  var mediaImages = {};
  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( ".jpg") !== -1 || mediaFilename.indexOf( ".png") !== -1) {
      if( mediaFilename.indexOf( dodoc.thumbSuffix) !== -1) {
        mediaImages.img_thumb = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
      } else {
        mediaImages.img_large = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
      }
    } else if( mediaFilename.indexOf( ".mp4") !== -1 ||  mediaFilename.indexOf( ".webm") !== -1) {
      mediaImages.video = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
    } else if ( mediaFilename.indexOf( ".wav") !== -1) {
      mediaImages.audio = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
    }
  });
  return mediaImages;
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////// PROJECT

function insertOrReplaceProject( $item, $container) {

  var $items = $container.find(".project");
  var itemName = $item.data( "projectname");
  var $existingItem = $items.filter( "[data-projectname='" + itemName + "']");
  if( $existingItem.length == 1) {
    $existingItem.replaceWith( $item);
    return "updated";
  }

  if( $items.length > 0) {
    var mediaMTime = parseInt( $item.data("ctimestamp"));
    if( mediaMTime !== false) {
      var $eles;
      $items.each( function( index) {
        if( mediaMTime > parseInt( $(this).data("ctimestamp"))) {
          $eles = $(this);
          return false;
        }
      });
      if( $eles !== undefined)
        $item.insertBefore( $eles);
      else
        $container.append( $item);
    }
  } else {
    $container.append( $item);
  }
  return "inserted";
}

function removeMedia( $medias, mediaData) {

  var $mediaToRemove = $medias
    .filter("[data-mediakey='" + mediaData.mediaKey + "']")
    ;

  $mediaToRemove
    .fadeOut( 200, function() {
      $(this).remove();
    })
    ;

}

function removeThisProject( $container, slugProjectName) {
  var $items = $container.find(".project");
  var $itemToRemove = $items
    .filter("[data-projectname='" + slugProjectName + "']")
    ;
  $itemToRemove
    .fadeOut( 400, function() {
      $(this).remove();
    })
    ;
}
function removeThisFolder( $container, slugFolderName) {
  var $items = $container.find(".dossier");

  var $itemToRemove = $items
    .filter("[data-slugfoldername='" + slugFolderName + "']")
    ;
  $itemToRemove
    .fadeOut( 400, function() {
      $(this).remove();
    })
    ;
}

function insertOrReplaceMedia( $mediaItem, $mediaContainer) {

  var $mediaItems = $mediaContainer.find(".media");
  var mediaName = $mediaItem.data( "medianame");
  var $existingMedia = $mediaItems.filter( "[data-medianame='" + mediaName + "']");

  if( $existingMedia.length >= 1) {
    $existingMedia.replaceWith( $mediaItem);
    return "updated";
  }
  // trouver où l'insérer en fonction de la date de modification
  if( $mediaItems.length > 0) {
    var mediaMTime = parseInt( $mediaItem.data("ctimestamp"));
    if( mediaMTime !== false) {
      var $eles;
      $mediaItems.each( function( index) {
        if( mediaMTime > parseInt( $(this).data("ctimestamp"))) {
          $eles = $(this);
          return false;
        }
      });
      if( $eles !== undefined)
        $mediaItem.insertBefore( $eles);
      else
        $mediaContainer.append( $mediaItem);
    }
  } else {
    $mediaContainer.append( $mediaItem);
  }
  return "inserted";
}


function listPublis( publisData) {
  console.log( "listPublis");

  var $allPublis = $();
  var lastPublis = publisData;

  $.each( lastPublis, function( publiSlug, publiContent) {

    var newPubli = makeOnePubli( publiContent);
    if( newPubli !== undefined)
      $allPublis = $allPublis.add( newPubli);
  });

  return $allPublis;
}

function makeOnePubli( publiData) {

  if( publiData.slugFolderName !== currentFolder || publiData.slugProjectName !== currentProject)
    return;

	var $publiItem = $(".js--templates .publi-folder").clone(false);
  var publiPath = makeFullPathForProject( dodoc.projectPublisFoldername + '/' + publiData.slugPubliName);
  var editPubliPath = makeFullPathForProject( 'bibliotheque/panneau-de-publications#' + publiData.slugPubliName);

	$publiItem
		.data( 'publiName', publiData.name)
		.data( 'slugPubliName', publiData.slugPubliName)
    	.data( 'mtimestamp', transformDatetoTimestamp( publiData.modified))
    	.data( 'ctimestamp', transformDatetoTimestamp( publiData.created))
    	.data( 'medias', publiData.medias)
    	.data( 'linkToPubli', publiPath)
		.find('h2')
		  .html( publiData.name)
		.end()
		.find('.js--publiLink')
		  .attr('href', publiPath)
		.end()
		.find('.js--edit_view')
		  .attr('href', editPubliPath)
		.end()
    ;

  return $publiItem;
}


function insertOrReplacePubli( $publiItem, $publiContainer) {

  var $publiItems = $publiContainer.find(".publi-folder");

  var publiName = $publiItem.data( "slugPubliName");
  var $existingPubli = $publiItems.filter(function() {
    return $(this).data("slugPubliName") === publiName
  });

  if( $existingPubli.length >= 1) {
    $existingPubli.replaceWith( $publiItem);
    return "updated";
  }
  // trouver où l'insérer en fonction de la date de modification
  if( $publiItems.length > 0) {
    var publiMTime = parseInt( $publiItem.data("ctimestamp"));
    if( publiMTime !== false) {
      var $eles;
      $publiItems.each( function( index) {
        if( publiMTime > parseInt( $(this).data("ctimestamp"))) {
          $eles = $(this);
          return false;
        }
      });
      if( $eles !== undefined)
        $publiItem.insertBefore( $eles);
      else
        $publiContainer.append( $publiItem);
    }
  } else {
    $publiContainer.append( $publiItem);
  }
  return "inserted";
}


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
    .on('click', '.js--delete-media-montage', function(){
    	var $elementToDel = $(this).parent("li.media");

    	// check if media is in the montage
    	if( $elementToDel.closest('[data-publidata]').length > 0) {
      	$elementToDel.fadeOut( 600,function(){
      		$elementToDel.remove();
          $(document).trigger( 'update_media_montage');
      	});
      }
    })
    ;

    // a drag and drop has succeeded, let's scan publi_medias to parse all medias
    // and send it to the right json
    $(document).on( 'update_media_montage', function() {

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

      // check if there is two times the same
/*
      if( anyDuplicates( listMediasPaths)) {
        alert( "Ce média existe déjà dans la publication ! Veuillez le supprimer.");
        return false;
      }
*/

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


function updateMontagePubliMeta( psdata) {

  $.each( psdata, function( slugPubliName, pdata) {
    var $publiContent = $('[data-publidata]');
    var publiShown = $publiContent.data('publishown');

    if( pdata.slugFolderName !== currentFolder || pdata.slugProjectName !== currentProject || pdata.slugPubliName !== publiShown)
      return;

    listMontagePubliMeta( $publiContent, pdata);
  });
}

function updateMontagePubliMedias( psdata) {
  $.each( psdata, function( slugPubliName, pdata) {
    var $publiContent = $('[data-publidata]');
    var publiShown = $publiContent.data('publishown');
    if( pdata.slugFolderName !== currentFolder || pdata.slugProjectName !== currentProject || pdata.slugPubliName !== publiShown)
      return;

    listMontagePubliMedias( $publiContent, pdata);
  });
}


// update montage content with new meta (title and link)
function listMontagePubliMeta( $publiContent, pdata) {
  console.log('listMontagePubliMeta');

  var publiPath = makeFullPathForProject( dodoc.projectPublisFoldername + '/' + pdata.slugPubliName);

  $publiContent
    .find(".js--publiTitle")
      .html( pdata.name)
    .end()
    .find(".js--publiLink")
      .attr('href', publiPath)
    .end()
    .data("name", pdata.name)
    .data("template", pdata.template)
    ;

  $publiContent.find('.template_container').attr("data-template", pdata.template);
}

// update montage content with new medias
function listMontagePubliMedias( $publiContent, pdata) {
  console.log('listMontagePubliMedias');
  var $publiMedias = publi.makePubliMedias( pdata);

  $publiContent
    .find(".publi_medias")
      .html( $publiMedias)
    .end()
    ;
}

var sendData = {


  createNewProject : function( pdata) {
    pdata.slugFolderName = currentFolder;
  	socket.emit( 'newProject', pdata);
  },
  editProject : function( pdata) {
    pdata.slugFolderName = currentFolder;
  	socket.emit( 'editProject', pdata);
  },

  createNewMedia : function( mediaData) {
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;
    mediaData.author = sessionId;
  	socket.emit( 'newMedia', mediaData);
  },
  editMedia : function( mediaData) {
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;
  	socket.emit( 'editMediaMeta', mediaData);
  },
  deleteMedia : function( mediaData) {
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;
  	socket.emit( 'deleteMedia', mediaData);
  },

  deleteStopmotion : function( mediaData) {
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;
  	socket.emit( 'deleteStopmotion', mediaData);
  },

  createNewPubli : function( publiData) {
    publiData.slugFolderName = currentFolder;
    publiData.slugProjectName = currentProject;
  	socket.emit( 'createPubli', publiData);
  },
  editPubli : function( publiData) {
    publiData.slugFolderName = currentFolder;
    publiData.slugProjectName = currentProject;
  	socket.emit( 'editPubli', publiData);
  },

  listOnePubliMetaAndMedias : function( publiData) {
    publiData.slugFolderName = currentFolder;
    publiData.slugProjectName = currentProject;
  	socket.emit( 'listOnePubliMetaAndMedias', publiData);
  },
  editPubliMeta : function( publiData) {
    publiData.slugFolderName = currentFolder;
    publiData.slugProjectName = currentProject;
  	socket.emit( 'editMetaPubli', publiData);
  },
  editPubliMedias : function( publiData) {
    publiData.slugFolderName = currentFolder;
    publiData.slugProjectName = currentProject;
    	socket.emit( 'editMediasPubli', publiData);
  },

}


function getPathToMedia( projectPath, mediasFolderPath, mediaName) {
  return projectPath + '/' + mediasFolderPath + '/' + mediaName;
}
function getProjectPath( slugFolderName, slugProjectName) {
  return slugFolderName + '/' + slugProjectName;
}
function getMediaFolderPathByType( mediaType) {
  if( mediaType == 'photo')
    return getPhotoPathOfProject();
  if( mediaType == 'video')
    return getVideoPathOfProject();
  if( mediaType == 'animation')
    return getAnimationPathOfProject();
  if( mediaType == 'audio')
    return getAudioPathOfProject();
  if( mediaType == 'text')
    return getTextPathOfProject();
}
function getPhotoPathOfProject() {
  return dodoc.projectPhotosFoldername;
}
function getAnimationPathOfProject() {
  return dodoc.projectAnimationsFoldername;
}
function getVideoPathOfProject() {
  return dodoc.projectVideosFoldername;
}
function getAudioPathOfProject() {
  return dodoc.projectAudiosFoldername;
}
function getTextPathOfProject() {
  return dodoc.projectTextsFoldername;
}

function getPathToMediaFile( projectPath, mediasFolderPath, mediaName) {
  return projectPath + '/' + mediasFolderPath + '/' + mediaName;
}


function getFirstMediaFromObj( mediasData) {
  var mediaData;
  $.each( mediasData, function( mjson, mdata) {
    mediaData = mdata;
    return false;
  });
  return mediaData;
}