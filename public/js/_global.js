/* VARIABLES */
var socket = io.connect();

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
  var $allMedias = $();
  var lastMedias = mediasData;
  $.each( lastMedias, function( index, mediaTypeContent) {
    $.each( mediaTypeContent, function( metaJsonName, mediaDatas) {
      var pathMediaFolder = mediaDatas.pathMediaFolder;
      var mediaName = new RegExp(dodoc.regexpRemoveFileExtension).exec( metaJsonName)[1];
      var newMedia = makeOneMedia( pathMediaFolder, mediaName, mediaDatas);
      $allMedias = $allMedias.add( newMedia);
    });
  });

  return $allMedias;
}

function makeOneMedia( pathMediaFolder, mediaName, mediaDatas) {

  var $currentMedia = '';
  var mediaFilenames = mediaDatas.files;

  if( pathMediaFolder === dodoc.projectPhotosFoldername)
    $currentMedia = showImage( pathMediaFolder, mediaName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectAnimationsFoldername)
    $currentMedia = showAnimation( pathMediaFolder, mediaName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectVideosFoldername)
    $currentMedia = showVideo( pathMediaFolder, mediaName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectAudiosFoldername)
    $currentMedia = showAudio( pathMediaFolder, mediaName, mediaFilenames);

  if( pathMediaFolder === dodoc.projectTextsFoldername)
    $currentMedia = showText( pathMediaFolder, mediaName, mediaFilenames, mediaDatas);

  var pathToMeta = makeFullMediaPath( pathMediaFolder + '/' + mediaName);

  $currentMedia
    .attr( 'data-mediaName', mediaName)
    .attr( 'data-pathToMeta', pathToMeta)
    .attr( 'data-mediatype', pathMediaFolder)
    .attr( 'data-type', pathMediaFolder)
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

function showImage( pathMediaFolder, mediaName, mediaFilenames) {

  var pathToFile = makeFullMediaPath( pathMediaFolder + '/' + mediaFilenames[0]);

	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem
    .find( 'img').attr('src', pathToFile)
    ;
	return mediaItem;
}

function showAnimation( pathMediaFolder, mediaName, mediaFilenames) {

  var thumbFilename;
  var videoFilename;
  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1 || mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullMediaPath( pathMediaFolder + '/' + thumbFilename);
  var pathToVideoFile = makeFullMediaPath( pathMediaFolder + '/' + videoFilename);

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showVideo( pathMediaFolder, mediaName, mediaFilenames) {

  var thumbFilename;
  var videoFilename;

  $.each( mediaFilenames, function( key, mediaFilename) {
    if( mediaFilename.indexOf( "jpg") !== -1 || mediaFilename.indexOf( "png") !== -1) {
      thumbFilename = mediaFilename;
    } else if ( mediaFilename.indexOf( "mp4") !== false ||  mediaFilename.indexOf( "webm") !== false) {
      videoFilename = mediaFilename;
    }
  });

  var pathToThumb = makeFullMediaPath( pathMediaFolder + '/' + thumbFilename);
  var pathToVideoFile = makeFullMediaPath( pathMediaFolder + '/' + videoFilename);

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
    .find( 'video').attr( 'poster', pathToThumb).end()
    .find( 'source').attr( 'src', pathToVideoFile).end()
  ;

	return mediaItem;
}

function showAudio( pathMediaFolder, mediaName, mediaFilenames) {
  var pathToFile = makeFullMediaPath( pathMediaFolder + '/' + mediaFilenames[0]);

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
    .find( 'source').attr( 'src', pathToFile)
    ;
	return mediaItem;
}

function showText( pathMediaFolder, mediaName, mediaFilenames, mediaDatas) {

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

function removeThisProject( $container, slugFolderName, slugProjectName) {
  var $items = $container.find(".project");
  debugger;

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


function createNewMedia( mediaData){
  mediaData.slugFolderName = currentFolder;
  mediaData.slugProjectName = currentProject;
	socket.emit( 'newMedia', mediaData);
}
function editMedia( mediaData){
  mediaData.slugFolderName = currentFolder;
  mediaData.slugProjectName = currentProject;
	socket.emit( 'editMediaMeta', mediaData);
}
function listOneMedia( mediaData) {
  mediaData.slugFolderName = currentFolder;
  mediaData.slugProjectName = currentProject;
	socket.emit( 'listOneMedia', mediaData);
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

    var imageData;
    $modal.find('#imageProject').bind('change', function(e) {
    	imageData = e.originalEvent.target.files;
    });

  	var $deleteModal = $('#modal-deleteproject-alert');
  	$deleteModal.data('slugProjectName', pdata.slugProjectName)

  	//Au click sur le bouton supprimer le dossier
  	$modal.find('.js--deleteProject').on('click', function(){
    	debugger;
  		$deleteModal.foundation('reveal', 'open');
  	});

    $modal.find(".submit-modify-project").on('click', function(){
    	var newProjectName = $modal.find('.modify-project-name').val();
    	var newStatut = $modal.find('.modify-project-statut').val();
    	//Images changed
    	debugger;
    	if( imageData !== undefined && imageData !== null){
    		console.log('Une image a été ajoutée');
    		var f = imageData[0];
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
/*
  	var typeMedia = $(this).attr("data-type");
  	var mediaTitle = $(this).attr("data-title");
	  var mediaLegende = $(this).attr("data-legende");
		var medianame = $(this).attr("data-medianame");
*/
  	$modal.foundation('reveal', 'open');


    debugger;

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
/*
				var title = $m.find('h3').html();
				var texte = $m.find('p').html();
*/
				debugger;

				$mediaItem
					.find('.view-text-title-modify')
					  .val( mdata.titleOfTextmediaMd)
					.end()
					.find('.view-text-modify')
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

  		var informations = $modal.find( '.js--mediaInformations').val();
      var editMediaData =
      {
        "mediaName" : mname,
        "mediaFolderPath" : mtype,
      };

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
    	debugger;
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
