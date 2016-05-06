
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
    var newMedia = makeOneMedia( mediaKey, mediaDatas);

    if( newMedia !== undefined)
      $allMedias = $allMedias.add( newMedia);
  });

  return $allMedias;
}

function listMedia( mediaData) {
  var newMedia = makeOneMedia( mediaKey, mediaData);
  if( newMedia !== undefined)
    return newMedia;
  return false;
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
    .attr( 'data-mediaName', mdata.mediaName)
    .attr( 'data-mediakey', mediaKey)
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

  var mediaFolderPath = mediaDatas.mediaFolderPath;
  var mediaFilenames = mediaDatas.files;

  var pathToFile = makeFullPathForProject( mediaFolderPath + '/' + mediaFilenames[0]);

	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem
    .find( 'img').attr('src', pathToFile)
    ;
	return mediaItem;
}

function showAnimation( mediaDatas) {

  var mediaFolderPath = mediaDatas.mediaFolderPath;
  var mediaFilenames = mediaDatas.files;

  var thumbFilename;
  var videoFilename;

  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1 || mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullPathForProject( mediaFolderPath + '/' + thumbFilename);
  var pathToVideoFile = makeFullPathForProject( mediaFolderPath + '/' + videoFilename);

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showVideo( mediaDatas) {

  var mediaFolderPath = mediaDatas.mediaFolderPath;
  var mediaFilenames = mediaDatas.files;

  var thumbFilename;
  var videoFilename;

  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1 || mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullPathForProject( mediaFolderPath + '/' + thumbFilename);
  var pathToVideoFile = makeFullPathForProject( mediaFolderPath + '/' + videoFilename);

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showAudio( mediaDatas) {
  var mediaFolderPath = mediaDatas.mediaFolderPath;
  var mediaFilenames = mediaDatas.files;

  var thumbFilename;
  var audioFilename;

  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "wav") !== false) {
      audioFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullPathForProject( mediaFolderPath + '/' + thumbFilename);
  var pathToAudioFile = makeFullPathForProject( mediaFolderPath + '/' + audioFilename);

	var mediaItem = $(".js--templates .media_audio").clone(false);

	mediaItem
    .find( 'source').attr( 'src', pathToAudioFile).end()
    .find( '.poster').attr( 'src', pathToThumb).end()
    ;

	return mediaItem;
}

function showText( mediaDatas) {

  var mediaTitle = mediaDatas.titleOfTextmedia;
  var mediaText = mediaDatas.textOfTextmedia;
  var titleOfTextmediaMd = mediaDatas.titleOfTextmediaMd;
  var textOfTextmediaMd = mediaDatas.textOfTextmediaMd;

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
    .fadeOut( 400, function() {
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
		.find('.js--publi_view')
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
  	  .on('click', '.js--submit-new-publi', function(e){
    		var publiName = $('.new-publi').val();
    		if( publiName.length > 0) {
      		publi.createNew( publiName);
          $("#modal-add-publi").foundation('reveal', 'close');
        }
    	})

  	  .on('click', '.montage-title .js--editerTitre', function(e){
    	  $montage = $(this).closest('.montage-edit');
    	  $currentTitle = $montage.find('[data-publi_title]').html();

    		$montage
    		  .find('.montage-title input')
    		    .val( $currentTitle)
            .show()
          .end()
          .find('.montage-title .title')
            .hide()
          .end()
          .find('.js--editerTitre')
            .hide()
          .end()
          .find('.js--validerTitre')
            .css('display', 'block')
          .end()
    		  ;
      })
  	  .on('click', '.montage-title .js--validerTitre', function(e){
    	  $montage = $(this).closest('.montage-edit');
    	  newTitle = $montage.find('.montage-title input').val();
    	  currentlyShownPubli = $montage.data('publishown');

    	  $montage
    		  .find('.montage-title input')
            .hide()
          .end()
          .find('.montage-title .title')
            .css('display', 'block')
          .end()
          .find('.js--editerTitre')
            .css('display', 'block')
          .end()
          .find('.js--validerTitre')
            .hide()
          .end()
          ;

        var publiData =
        {
          "slugPubliName" : currentlyShownPubli,
          "newPubliName" : newTitle
        };

        sendData.editPubliMeta( publiData);

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
            $(document).trigger( 'update_media_montage');
        	});
        }
      })
      ;

    // a drag and drop has succeeded, let's scan inner-montage to parse all medias
    // and send it to the right json
    $(document).on( 'update_media_montage', function() {

      var $montage = $('.montage-edit-container .montage-edit');
      var slugPubliName = $montage.data('publishown');
      var $montageMedias = $montage.find('.media');

      // listMediasPaths is a list of all the medias referenced by their json meta-file
      var listMediasPaths = [];
      $montageMedias.each(function() {
        $mma = $(this);
        var mediakey = $mma.data('mediakey');
        listMediasPaths.push( mediakey);
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
      publiJson.medias = listMediasPaths;

      // let's send it over to node so it is saved in the publication jsonfile
      sendData.editPubliMedias( publiJson);
    });

  },

  createNew : function( pname) {
    var publiJson =
    {
      "publiName" : pname
    }
    sendData.createNewPubli( publiJson);
  },

  openPubli : function( $thisPubli) {

    var $montageEditContainer = $('.montage-edit-container');

    // cloner un .montage-edit
    var $montageEdit = $(".js--templates .montage-edit").clone(false);
    var pdata = $thisPubli.data();

    $montageEdit
      .attr("data-publirequested", pdata.slugPubliName)
      ;

    var publiData =
    {
      "slugPubliName" : pdata.slugPubliName
    };

    // le placer dans .montage-edit-container
    $montageEditContainer
      .html( $montageEdit)
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

// update montage content with new meta (title and link)
function listMontagePubliMeta( whichPubli, pdata, $publiContent) {
  // make sure that publi is requested
  if( pdata.slugFolderName !== currentFolder || pdata.slugProjectName !== currentProject || pdata.slugPubliName !== whichPubli)
    return;

  var publiPath = makeFullPathForProject( dodoc.projectPublisFoldername + '/' + pdata.slugPubliName);

  $publiContent
    .find("[data-publi_title]")
      .html( pdata.name)
    .end()
    .find(".js--publi_view")
      .attr('href', publiPath)
    .end()
    ;
}

// update montage content with new medias
function listMontagePubliMedias( whichPubli, pdata, $publiContent) {
  // make sure that publi is requested
  if( pdata.slugFolderName !== currentFolder || pdata.slugProjectName !== currentProject || pdata.slugPubliName !== whichPubli)
    return;

  var $publiMedias = publi.makePubliMedias( pdata);

  $publiContent
    .find("[data-publi_medias]")
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

  createNewPubli : function( publiData) {
    publiData.slugFolderName = currentFolder;
    publiData.slugProjectName = currentProject;
  	socket.emit( 'createPubli', publiData);
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



// en cours : gestion des modals. Elles s'ouvrent avec un trigger sur $(document), qui passe les données à afficher dedans
var modals = {

  init : function() {
    modals.statusChangeAlertInit();
    modals.removeProjectInit();

  	$('body').on('click', '.js--add-project', function(){
  		modals.createProjectPopup();
  	});

  	$('body').on('click', '.js--edit-project', function(){
  		$thisProject = $(this).closest(".project");
  		modals.editProjectPopup( $thisProject);
  	});

  },

  createProjectPopup : function() {
    var $modal = $("#modal-add-project");
    $modal
      .empty()
      ;
    var $modalContent = $(".modal-add-project_content").clone(false);
    $modal
      .append( $modalContent.show())
      ;

  	var $filePicker = $modal.find('.js--modal_inputfile');
  	var $label = $filePicker.next().find('span');
  	var labelVal = $label.text();

  	$filePicker.on( 'change', function( e )
  	{
  		var fileName = '';
			fileName = e.target.value.split( '\\' ).pop();

			var fileData = e.originalEvent.target.files;

  		if( fileName ) {
  			$(this)
  			  .data('fileName', fileName)
  			  .data('fileData', fileData)
  			  ;
  			$label
			    .html( fileName)
          ;
  		} else
  			$(this)
  			  .data('fileName', '')
  			  .data('fileData', '')
  			  ;
  			$label.innerHTML = labelVal;
  	});


    $modal.find(".js--modal_submit").on('click', function(){
    	var newProjectName = $modal.find('.js--modal_name').val();
    	var fileData = $filePicker.data( "fileData");
    	//Images changed

    	if( fileData !== undefined && fileData !== null){
    		console.log('Une image a été ajoutée');
    		var f = fileData[0];
    		var reader = new FileReader();
    		reader.onload = function(evt){
    			var newProjectData =
    			{
     				"projectName" : newProjectName,
    				"imageData" : evt.target.result
    		  }
    		  sendData.createNewProject( newProjectData);
    		};
    		reader.readAsDataURL(f);
    	}
    	else{
    		console.log("Pas d'image chargé");
  			var newProjectData =
        {
     				"projectName" : newProjectName,
    		}
  		  sendData.createNewProject( newProjectData);
    	}
      $modal.foundation('reveal', 'close');
    });
  },

  editProjectPopup : function($project) {
    var $modal = $("#modal-modify-project");
    $modal
      .empty()
      ;

    var $modalContent = $(".modal-modify-project_content").clone(false);
    $modal
      .append( $modalContent.show())
      ;

    var pdata = $project.data();
    $modal
      .find(".js--modal_name")
        .attr( "value", pdata.projectName)
      .end()
      .find(".modify-project-statut option")
        .filter("[value='" + pdata.statut + "']")
          .attr('selected', '')
        .end()
      .end()
      ;

  	var $filePicker = $modal.find('.js--modal_inputfile');
  	var $label = $filePicker.next().find('span');
  	var labelVal = $label.text();

  	$filePicker.on( 'change', function( e )
  	{
  		var fileName = '';
			fileName = e.target.value.split( '\\' ).pop();

			var fileData = e.originalEvent.target.files;

  		if( fileName ) {
  			$(this)
  			  .data('fileName', fileName)
  			  .data('fileData', fileData)
  			  ;
  			$label
			    .html( fileName)
          ;
  		} else
  			$(this)
  			  .data('fileName', '')
  			  .data('fileData', '')
  			  ;
  			$label.innerHTML = labelVal;
  	});

  	var $deleteModal = $('#modal-deleteproject-alert');
  	$deleteModal.data('slugProjectName', pdata.slugProjectName)

  	//Au click sur le bouton supprimer le dossier
  	$modal.find('.js--deleteProject').on('click', function(){
  		$deleteModal.foundation('reveal', 'open');
  	});

  	$modal.find('.modify-project-statut').bind('change', function(){
    	$alertModal = $('#modal-statut-alert');
    	$statutField = $(this);
  		if( $statutField.val() === "terminé"){
  			$alertModal.foundation('reveal', 'open');
  			$alertModal.find('button.oui').on('click', function(){
  				$alertModal.foundation('reveal', 'close');
  				$modal.foundation('reveal', 'open');
  			});
  			$alertModal.find('button.annuler').on('click', function(){
  				console.log('non');
  				$statutField.val('en cours');
  				$alertModal.foundation('reveal', 'close');
  				$modal.foundation('reveal', 'open');
  			});
  		}
  	});

    $modal.find(".js--modal_submit").on('click', function(){
    	var newProjectName = $modal.find('.js--modal_name').val();
    	var newStatut = $modal.find('.modify-project-statut').val();
    	var fileData = $filePicker.data( "fileData");
    	//Images changed

    	if( fileData !== undefined && fileData !== null){
    		console.log('Une image a été ajoutée');
    		var f = fileData[0];
    		var reader = new FileReader();
    		reader.onload = function(evt){
      		var projectData =
    			{
     				"name" : newProjectName,
            "slugProjectName" : pdata.slugProjectName,
    				"statut" : newStatut,
    				"imageData" : evt.target.result
    		  }
    		  sendData.editProject( projectData);
    		};
    		reader.readAsDataURL(f);
    	}
    	else{
    		console.log("Pas d'image chargé");
    		var projectData =
        {
     				"name" : newProjectName,
            "slugProjectName" : pdata.slugProjectName,
    				"statut" : newStatut,
    		}
  		  sendData.editProject( projectData);
    	}
      $modal.foundation('reveal', 'close');
    });
  },

  bigMedia : function( $m) {

    var $modal = $('#modal-media-view');
    var mdata = $m.data();

    var mtype = mdata.type;
    var minfos = mdata.informations;
    var mname = mdata.medianame;
  	$modal.foundation('reveal', 'open');

  	switch( mtype){
  		case dodoc.projectPhotosFoldername:
	  		var imagePath = $m.find("img").attr("src");
				var $mediaItem = $(".js--templates .media-big_image").clone(false);

				$mediaItem
					.find( 'img')
					  .attr('src', imagePath)
					.end()
					;
				break;
			case dodoc.projectVideosFoldername:

	  		var thumbPath = $m.find("video").attr("poster");
				var videoPath = $m.find("source").attr("src");

				var $mediaItem = $(".js--templates .media-big_video").clone(false);

				$mediaItem
			    .find( 'video')
			      .attr( 'poster', thumbPath)
  			    .find( 'source')
  			      .attr( 'src', videoPath)
					;

				break;
			case dodoc.projectAnimationsFoldername:

	  		var thumbPath = $m.find("video").attr("poster");
				var videoPath = $m.find("source").attr("src");

				var $mediaItem = $(".js--templates .media-big_stopmotion").clone(false);

				$mediaItem
			    .find( 'video')
			      .attr( 'poster', thumbPath)
  			    .find( 'source')
  			      .attr( 'src', videoPath)
					;
				break;
			case dodoc.projectAudiosFoldername:

				var audioPath = $m.find("source").attr("src");
				var $mediaItem = $(".js--templates .media-big_audio").clone(false);

				$mediaItem
			    .find( 'source')
			      .attr( 'src', audioPath)
			    .end()
					;
				break;
			case dodoc.projectTextsFoldername:
				//console.log($(this).find('h3').html());
				var $mediaItem = $(".js--templates .media-big_text").clone(false);

				$mediaItem
					.find('.js--submit-new-text_title')
					  .val( mdata.titleOfTextmediaMd)
					.end()
					.find('.js--submit-new-text_text')
					  .val( mdata.textOfTextmediaMd)
					.end()
					;
				break;
  	}

		if( $m.hasClass('is--highlight')){
			$mediaItem.addClass('is--highlight');
		}

  	$mediaItem
  	  .attr( 'data-medianame', mname)
  	  .attr( 'data-mediatype', mtype)
  	  .find('.js--mediaInformations')
  	    .val( minfos)
      .end()

		$modal.find('.big-mediaContent').html( $mediaItem);

    //Envoie les titres et légendes au serveur
    $modal.find('.js--submit-add-media-data').on( 'click', function(){

      var editMediaData =
      {
        "mediaName" : mname,
        "mediaFolderPath" : mtype,
      };

  		var informations = $modal.find( '.js--mediaInformations').val();
      if( informations !== undefined && informations.length > 0)
        editMediaData.informations = informations;

      sendData.editMedia( editMediaData);

  		$modal.foundation('reveal', 'close');

    });

    // Ajoute ou enlève un highlight quand on clique sur "Highlight" dans la fenêtre modal
    $modal.find('.js--highlightMedia').on( 'click', function(){
  		// trigger a click on its js--flagMedia
      var editMediaData =
      {
        "mediaName" : mname,
        "mediaFolderPath" : mtype,
        "switchFav" : true
      };
      sendData.editMedia( editMediaData);

      $mediaItem.toggleClass( 'is--highlight');

    });

    $modal.find('.js--submit-view-text-modify').on( 'click', function(){

      var editMediaData =
      {
        "mediaName" : mname,
        "mediaFolderPath" : mtype,
      };

    	var titleOfTextmediaMd = $modal.find('.js--submit-new-text_title').val();
    	var textOfTextmediaMd =  $modal.find('.js--submit-new-text_text').val();

      if( titleOfTextmediaMd !== undefined && titleOfTextmediaMd.length > 0)
        editMediaData.titleOfTextmediaMd = titleOfTextmediaMd;

      if( textOfTextmediaMd !== undefined && textOfTextmediaMd.length > 0)
        editMediaData.textOfTextmediaMd = textOfTextmediaMd;

      sendData.editMedia( editMediaData);

      $modal.foundation('reveal', 'close');

    });


    $modal.find('.js--delete-media-bibli').on( 'click', function(){

      $alertModal = $('#modal-delete-alert-media');

    	$modal.foundation('reveal', 'close');
    	$alertModal.foundation('reveal', 'open');

      $alertModal.find('button.oui').on('click', function(){
        var mediaToDelete =
        {
          "mediaName" : mname,
          "mediaFolderPath" : mtype,
        }
        sendData.deleteMedia( mediaToDelete);
    		$alertModal.foundation('reveal', 'close');
    	});
    	$alertModal.find('button.annuler').on('click', function(){
    		$alertModal.foundation('reveal', 'close');
    		$modal.foundation('reveal', 'open');
    	});

    });

  },


  createTextMedia : function() {

    var $modal = $('#modal-add-text');
    var $titlef = $modal.find('.js--submit-new-text_title');
    var $textf = $modal.find('.js--submit-new-text_text');

    $('.js--submit-new-text').on('click',function(){

    	var textTitle = $titlef.val();
    	var textContent = $textf.val();

      var mediaData =
      {
        "mediaType" : "text",
        "mediaFolderPath" : dodoc.projectTextsFoldername,
        "title" : textTitle,
        "text" : textContent,
      }
      sendData.createNewMedia( mediaData);

      $modal.foundation('reveal', 'close');
      $titlef.val('');
      $textf.val('');

    });
  },

  importNewMedia : function() {

    var $modal = $('#modal-add-local');

  	var $filePicker = $modal.find('.js--modal_inputfile');
  	var $label = $filePicker.next().find('span');
  	var labelVal = $label.text();

  	$filePicker.on( 'change', function( e )
  	{
  		var fileName = '';
			fileName = e.target.value.split( '\\' ).pop();

			var fileData = e.originalEvent.target.files;

  		if( fileName ) {
  			$(this)
  			  .data('fileName', fileName)
  			  .data('fileData', fileData)
  			  ;
  			$label
			    .html( fileName)
          ;
  		} else {
  			$(this)
  			  .data('fileName', '')
  			  .data('fileData', '')
  			  ;
  			$label.html( labelVal);
  		}
  	});

    $modal.find('.js--modal_submit').on('click',function(){
    	var fileName = $filePicker.data( 'fileName');
    	var fileData = $filePicker.data( 'fileData');
    	//Images changed

    	if( fileData !== undefined && fileData !== null){
    		console.log('An image has been imported');
    		var f = fileData[0];
    		var reader = new FileReader();
    		reader.onload = function(evt){
      		// check type of content
      		console.log( fileName);
      		fileName = fileName.toLowerCase();

          if( fileName.indexOf( ".jpg") !== -1 || fileName.indexOf( ".jpeg") !== -1 || fileName.indexOf( ".png") !== -1) {
      			var mediaData =
      			{
              "mediaType" : "photo",
      				"mediaData" : evt.target.result
      		  }
      		} else if( fileName.indexOf( ".mp4") !== -1 ||  fileName.indexOf( ".webm")) {
      			var mediaData =
      			{
              "mediaType" : "video",
      				"mediaData" : evt.target.result
      		  }
      		}

      		if( mediaData !== undefined)
      		  sendData.createNewMedia( mediaData);

    		};
    		reader.readAsDataURL(f);
    	}

      // then remove $filePicker data fileName and fileData, and label
      $filePicker
			  .data('fileName', '')
			  .data('fileData', '')
			  ;
			$label.html( labelVal);
      $modal.foundation('reveal', 'close');
    });
  },

  statusChangeAlertInit : function() {
    // TODO
    $statusPopup = $('#modal-deletefolder-alert');
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
  },

  removeProjectInit : function() {
  	var $deleteModal = $('#modal-deleteproject-alert');
  	$deleteModal.find('button.oui').on('click', function(){
    	var slugProjectName = $deleteModal.data('slugProjectName');
    	var slugFolderName = currentFolder;
  		socket.emit('removeOneProject',
  		{
    		"slugFolderName" : slugFolderName,
    		"slugProjectName" : slugProjectName
      });
  		$deleteModal.foundation('reveal', 'close');
  	});
  	$deleteModal.find('button.annuler').on('click', function(){
  		console.log('annuler');
  		$deleteModal.foundation('reveal', 'close');
  		$(document).on('close.fndtn.reveal', '#modal-delete-alert[data-reveal]', function () {
  	  	$('#modal-modify-project').foundation('reveal', 'open');
  		});
  	});
  },
}

modals.init();



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