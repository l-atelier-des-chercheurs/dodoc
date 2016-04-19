
var sessionId;
//get current session
var currentFolder = app.folder;
//get current project
var currentProject = app.project;


/* fonction accessible depuis l'extérieur :
    - listMediasOfOneType
    - loadProject

*/




// COMMON WITH PROJECT.JS
function loadProject( projectData) {

	var projectName = projectData.name;
	var slugProjectName = projectData.slugProjectName;
	var slugFolderName = projectData.slugFolderName;

  var createdDate = projectData.created;
  var modifiedDate = projectData.modified;

	var createdDateUser = transformDatetoString( createdDate);
	var modifiedDateUser = transformDatetoString( modifiedDate);

	var statut = projectData.statut;
  var imageSrc;
  if( projectData.projectPreviewName !== undefined && projectData.projectPreviewName !== false)
  	imageSrc = projectData.projectPreviewName;

	var $newProject = $(".js--templates > .project").clone(false);
	var path = '/' + slugFolderName + '/' + slugProjectName;

  if( modifiedDate === null)
    $newProject.find('.modify-date').remove();
	if( imageSrc === undefined)
  	$newProject.find( '.image-wrapper img').remove();

  var imageSrc = path + "/" + imageSrc + '?' + modifiedDate;

  // customisation du projet
	$newProject
	  .attr( 'data-projectname', slugProjectName)
	  .attr( 'data-statut', statut)
	  .data( 'slugProjectName', slugProjectName)
	  .data( 'projectName', projectName)
  	.data( 'mtimestamp', transformDatetoTimestamp( createdDate))
  	.data( 'ctimestamp', transformDatetoTimestamp( modifiedDate))
	  .find( '.statut-type').text( statut).end()
	  .find( '.image-wrapper img').attr('src', imageSrc).attr('alt', projectName).end()
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


function listMediasOfOneType( mediasData) {
  console.log( "listMediasOfOneType");

  var $allMedias = $();
  var lastMedias = mediasData;

  $.each( lastMedias, function( index, mediaTypeContent) {
    $.each( mediaTypeContent, function( metaJsonName, mediaDatas) {
      var mediaFolderPath = mediaDatas.mediaFolderPath;
      var mediaName = new RegExp(dodoc.regexpRemoveFileExtension).exec( metaJsonName)[1];
      var newMedia = makeOneMedia( mediaFolderPath, mediaName, mediaDatas);
      if( newMedia !== undefined)
        $allMedias = $allMedias.add( newMedia);
    });
  });

  return $allMedias;
}


function listMedia( mediaData) {

  var mediaFolderPath = mediaData.mediaFolderPath;
  var mediaName = mediaData.mediaName;
  var newMedia = makeOneMedia( mediaFolderPath, mediaName, mediaData);
  if( newMedia !== undefined)
    return newMedia;
  return false;
}


function makeOneMedia( mediaFolderPath, mediaName, mediaDatas) {
  console.log( "makeOneMedia");

  if( mediaDatas.slugFolderName !== currentFolder || mediaDatas.slugProjectName !== currentProject)
    return;

  var $currentMedia = '';
  var mediaFilenames = mediaDatas.files;

  if( mediaFolderPath === dodoc.projectPhotosFoldername)
    $currentMedia = showImage( mediaFolderPath, mediaName, mediaFilenames);

  if( mediaFolderPath === dodoc.projectAnimationsFoldername)
    $currentMedia = showAnimation( mediaFolderPath, mediaName, mediaFilenames);

  if( mediaFolderPath === dodoc.projectVideosFoldername)
    $currentMedia = showVideo( mediaFolderPath, mediaName, mediaFilenames);

  if( mediaFolderPath === dodoc.projectAudiosFoldername)
    $currentMedia = showAudio( mediaFolderPath, mediaName, mediaFilenames);

  if( mediaFolderPath === dodoc.projectTextsFoldername)
    $currentMedia = showText( mediaFolderPath, mediaName, mediaFilenames, mediaDatas);

  var pathToMeta = makeFullMediaPath( mediaFolderPath + '/' + mediaName);

  $currentMedia
    .attr( 'data-mediaName', mediaName)
    .attr( 'data-pathToMeta', pathToMeta)
    .attr( 'data-mediatype', mediaFolderPath)
    .attr( 'data-type', mediaFolderPath)
  	.attr( 'data-informations', mediaDatas.informations)
  	.addClass( mediaDatas.fav ? 'is--highlight' : '')
  	.find( '.mediaData--informations')
  	  .html( mediaDatas.informations)
    .end()
  	.data( 'mtimestamp', transformDatetoTimestamp( mediaDatas.modified))
  	.data( 'ctimestamp', transformDatetoTimestamp( mediaDatas.created))
    ;

  if( mediaDatas.title === undefined && mediaDatas.informations === undefined) {
    $currentMedia.find('.mediaData').remove();
  }

  if( mediaDatas.fav === "true") {
    $currentMedia.addClass('is--highlight');
  }

  return $currentMedia;
}

function makeFullMediaPath( pathToMediaFolderAndMedia) {
  return '/' + currentFolder + '/' + currentProject + '/' + pathToMediaFolderAndMedia;
}

function showImage( mediaFolderPath, mediaName, mediaFilenames) {

  var pathToFile = makeFullMediaPath( mediaFolderPath + '/' + mediaFilenames[0]);

	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem
    .find( 'img').attr('src', pathToFile)
    ;
	return mediaItem;
}

function showAnimation( mediaFolderPath, mediaName, mediaFilenames) {

  var thumbFilename;
  var videoFilename;
  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1 || mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullMediaPath( mediaFolderPath + '/' + thumbFilename);
  var pathToVideoFile = makeFullMediaPath( mediaFolderPath + '/' + videoFilename);

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showVideo( mediaFolderPath, mediaName, mediaFilenames) {

  var thumbFilename;
  var videoFilename;

  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1 || mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullMediaPath( mediaFolderPath + '/' + thumbFilename);
  var pathToVideoFile = makeFullMediaPath( mediaFolderPath + '/' + videoFilename);

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showAudio( mediaFolderPath, mediaName, mediaFilenames) {
  var pathToFile = makeFullMediaPath( mediaFolderPath + '/' + mediaFilenames[0]);

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
    .find( 'source').attr( 'src', pathToFile)
    ;
	return mediaItem;
}

function showText( mediaFolderPath, mediaName, mediaFilenames, mediaDatas) {

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
    .filter("[data-mediatype='" + mediaData.mediaFolder + "']")
    .filter("[data-medianame='" + mediaData.mediaName + "']")
    ;

  $mediaToRemove
    .fadeOut( 400, function() {
      $(this).remove();
    })
    ;

}

function removeThisProject( $container, slugFolderName, slugProjectName) {
  var $items = $container.find(".project");
  var $projectToRemove = $items
    .filter("[data-projectname='" + slugProjectName + "']")
    ;

  $projectToRemove
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


var sendData = {

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

  listOneMedia : function( mediaData) {
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;
  	socket.emit( 'listOneMedia', mediaData);
  },

  deleteMedia : function( mediaData) {
    mediaData.slugFolderName = currentFolder;
    mediaData.slugProjectName = currentProject;
  	socket.emit( 'deleteMedia', mediaData);
  },
}



// en cours : gestion des modals. Elles s'ouvrent avec un trigger sur $(document), qui passe les données à afficher dedans
var modals = {

  init : function() {
    modals.statusChangeAlertInit();
    modals.removeProjectInit();
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
      .find(".modify-project-name")
        .attr( "value", pdata.projectName)
      .end()
      .find(".modify-project-statut option")
        .filter("[value='" + pdata.statut + "']")
          .attr('selected', '')
        .end()
      .end()
      ;

  	var $deleteModal = $('#modal-deleteproject-alert');
  	$deleteModal.data('slugProjectName', pdata.slugProjectName)

  	//Au click sur le bouton supprimer le dossier
  	$modal.find('.js--deleteProject').on('click', function(){
  		$deleteModal.foundation('reveal', 'open');
  	});

  	var imageFilename;
  	var $label = $modal.find('.inputfile').next().find('span');
  	var labelVal = $label.text();

  	$modal.find('.inputfile').on( 'change', function( e )
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

    $modal.find(".submit-modify-project").on('click', function(){
    	var newProjectName = $modal.find('.modify-project-name').val();
    	var newStatut = $modal.find('.modify-project-statut').val();
    	var fileData = $modal.find(".inputfile").data( "fileData");
    	//Images changed

    	if( fileData !== undefined && fileData !== null){
    		console.log('Une image a été ajoutée');
    		var f = fileData[0];
    		var reader = new FileReader();
    		reader.onload = function(evt){
    			socket.emit( 'modifyProject',
    			{
     				"name" : newProjectName,
    				"slugFolderName" : currentFolder,
            "slugProjectName" : pdata.slugProjectName,
    				"statut" : newStatut,
    				"imageData" : evt.target.result
    		  });
    		};
    		reader.readAsDataURL(f);
    	}
    	else{
    		console.log("Pas d'image chargé");
    		socket.emit( 'modifyProject',
        {
     				"name" : newProjectName,
    				"slugFolderName" : currentFolder,
            "slugProjectName" : pdata.slugProjectName,
    				"statut" : newStatut,
    		});
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

      editMedia( editMediaData);

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
      editMedia( editMediaData);

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

      editMedia( editMediaData);

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

  	var textTitle = $titlef.val();
  	var textContent = $textf.val();

  	console.log('addText');

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
  },


  removeFolderInit : function() {
    $removeProjectPopup = $('#modal-deletefolder-alert');
  	$removeProjectPopup.find('rbutton.oui').on('click', function(){
  		console.log('oui ' + thisProjectName);
  		socket.emit('removeFolder', {name: thisProjectName, session: currentFolder});
  		$('#modal-delete-alert').foundation('reveal', 'close');
  		window.location.replace('/'+currentFolder);
  	});
  	$('#modal-delete-alert button.annuler').on('click', function(){
  		console.log('annuler');
  		$('#modal-delete-alert').foundation('reveal', 'close');
  		$(document).on('close.fndtn.reveal', '#modal-delete-alert[data-reveal]', function () {
  	  	$('#modal-modify-folder').foundation('reveal', 'open');
  		});
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
  var mediaByJson = mediasData[0];
  var mediaData;
  for(var key in mediaByJson) {
      if(mediaByJson.hasOwnProperty(key)) {
          mediaData = mediaByJson[key];
          break;
      }
  }
  return mediaData;
}