
window.sessionId = '';


if (window.navigator.userAgent.indexOf('Chrome') > -1) {
  window.socket = io.connect({ transports: ['websocket','polling'] });
} else {
  // non-chrome browser are not very good at websocket so far (mid 2017), we better use polling
  window.socket = io.connect({ transports: ['polling','websocket'] });
}

// context vars sent by Node via router.js to footer.jade namespaced with app
var currentFolder = app.currentFolder;
var currentProject = app.currentProject;
var currentPubli = app.currentPubli;

// binding an event to all packets to log some events
// see http://stackoverflow.com/a/33960032
var onevent = socket.onevent;
socket.onevent = function (packet) {
  var args = packet.data || [];
  onevent.call (this, packet);    // original call
  packet.data = ["*"].concat(args);
  onevent.call(this, packet);      // additional call to catch-all
};
socket.on("*",function(event,d) {
  // only log the following events
  var logs = [];
  switch(event) {
    case "alertUsers":
      let msgContent = typeof d === 'object' && d.hasOwnProperty('content') ? d.content : d;
      let author = typeof d === 'object' && d.hasOwnProperty('author') ? d.author : false;
      if(author !== false && author === window.sessionId) {
        logs.push(msgContent);
      } else if(author === false) {
        logs.push(msgContent);
      }
      break;
    case "mediaCreated":
      for(md in d) {
        var thisMedia = d[md];
        var pathToProjectWhoGotANewMedia = '/'+thisMedia.slugFolderName+'/'+thisMedia.slugProjectName;
        logs.push(
          dodoc.lang().modal.newMediaCreatedAtPath+
            '<a href="'+pathToProjectWhoGotANewMedia+'">'+
              pathToProjectWhoGotANewMedia+
            '</a>'
          );
      }
      break;
    case "folderCreated":
      var pathToFolder = '/'+d.slugFolderName;
      logs.push(dodoc.lang().modal.newFolderCreatedWithName+'<em>'+d.name+'</em>'+dodoc.lang().modal.atPath+'<em>'+pathToFolder+'</em>');
      break;
    case "folderRemoved":
      logs.push(dodoc.lang().modal.folderRemovedWithName+'<em>'+d.folderName+'</em>');
      break;
    case "projectCreated":
      var pathToProject = '/'+d.slugFolderName+'/'+d.slugProjectName;
      logs.push(dodoc.lang().modal.newProjectCreatedWithName+'<em>'+d.name+'</em>'+dodoc.lang().modal.atPath+'<em>'+pathToProject+'</em>');
      break;
    case "projectRemoved":
      var pathToProject = '/'+d.slugFolderName+'/'+d.slugProjectName;
      logs.push(dodoc.lang().modal.projectRemovedWithName+'<em>'+d.name+'</em>');
      break;
    case "publiRemoved":
      logs.push(dodoc.lang().modal.publiRemovedWithName+'<em>'+d.slugPubliName+'</em>');
      break;
  }

  for(log in logs) {
    alertify
      .closeLogOnClick(true)
      .delay(4000)
      .log(logs[log])
      ;
  }
});

$('body').on('click', '.js--openInBrowser', function(e) {
  console.log('Opening new link in browser');
  var $target = $(e.target);
  var thisHREF = $target.attr('href');
  if(thisHREF !== undefined && require('electron') !== undefined) {
    var shell = require('electron').shell;
    event.preventDefault();
    shell.openExternal(thisHREF);
  }
});

$('body').on('click', '[data-open_in_native_app]', function(e) {
  console.log('Opening in native app if available');
  var $target = $(e.target);
  var thisHREF = $target.attr('data-fullPath');
  if(thisHREF !== undefined && require('electron') !== undefined) {
    var shell = require('electron').shell;
    event.preventDefault();
    shell.openItem(thisHREF);
  }
});

$('body').on('click', '.js--enableLogToFile', function() {
	socket.emit('enableLogToFile');
});

$('body').on('click', '.js--openThisPathInFinder', function() {
  if(require('electron') !== undefined) {
    var shell = require('electron').shell;
    event.preventDefault();
    var thisPath = $(this).attr('href');
    shell.showItemInFolder(thisPath);
  }
});

function loadProjectSnippet(pd) {
	var pathToProject = '/' + pd.slugFolderName + '/' + pd.slugProjectName;
	var $newSnippetProjet = $(".js--templates > .projetSnippet").clone(false);
	if( pd.projectPreviewName === false) {
    	$newSnippetProjet.find('.vignette-visuel img').remove();
	}
	$newSnippetProjet
    .find('[data-link_to_project]').attr('href', pathToProject).end()
    .find( 'h3').text( pd.name).end()
    .find( '.vignette-visuel img')
      .attr( 'src', pathToProject + "/" + pd.projectPreviewName)
      .attr( 'alt', pd.name)
    ;
	return $newSnippetProjet;
}

function loadProject(pd) {

	var $newProject = $(".js--templates > .project").clone(false);
	var pathToProject = '/' + pd.slugFolderName + '/' + pd.slugProjectName;

  var imageSrc = '';
  if(pd.projectPreviewName !== undefined && pd.projectPreviewName !== false)
    	imageSrc = pathToProject + "/" + pd.projectPreviewName + '?' + pd.modified;

  if( pd.modified === null)
    $newProject.find('.modify-date').remove();

  // customisation du projet
	$newProject
	  .attr( 'data-projectname', pd.slugProjectName)
	  .attr( 'data-statut', pd.statut)
	  .data( 'slugProjectName', pd.slugProjectName)
	  .data( 'projectName', pd.name)
    	.data( 'mtimestamp', transformDatetoTimestamp(pd.created))
    	.data( 'ctimestamp', transformDatetoTimestamp(pd.modified))
	  .find( '.statut-type').text( pd.statut).end()
	  .find( '.image-wrapper')
	    .css('background-image', 'url(' + imageSrc + ')')
	    .attr('alt', pd.name)
	  .end()
	  .find( '.create-date').text( transformDatetoString(pd.created)).end()
	  .find( '.modify-date').text( transformDatetoString(pd.modified)).end()
	  .find( '.title').text( pd.name).end()
	  .find( '.project-link').attr( 'href', pathToProject).end()
	  .find( '.button-wrapper_capture').attr( 'href', pathToProject + '/capture').end()
	  .find( '.button-wrapper_bibli').attr( 'href',  pathToProject + '/bibliotheque/medias').end()
	  .find( '.button-wrapper_publi').attr( 'href', pathToProject + '/bibliotheque/panneau-de-publications').end()
  ;

	return $newProject;
}


function listAllMedias( mediasData) {
//   console.log( 'listAllMedias');

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


// fonction qui réunit les fonctionnalités d'un média (que ce soit une vidéo, une image, un son, etc.
// pas de fichier .js sur la page publi, ne s'applique pas
function mediaInit( $m) {
  if( $('body').hasClass('publi') || Modernizr.touchevents) return;

  if($m.find('video').length > 0) {
    var $v = $m.find('video');
    $m.hover(function() {
      if( $v.length > 0 && $v.get(0).paused) {
        $v
          .removeAttr('controls')
          .get(0)
            .play()
          ;
      }
    }, function() {
      if( $v.length > 0 && !$v.get(0).paused) {
        $v
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
//   console.log( "makeOneMedia");

  if( mdata.slugFolderName !== currentFolder || mdata.slugProjectName !== currentProject)
    return;

  var mediaFilename;

  var $currentMedia = '';
  switch(mdata.mediaFolderPath) {
    case dodoc.settings().projectPhotosFoldername:
      $currentMedia = showImage(mdata);
      mediaFilename = getMediaFiles(mdata).img_large;
      break;
    case dodoc.settings().projectAnimationsFoldername:
      $currentMedia = showAnimation(mdata);
      mediaFilename = getMediaFiles(mdata).video;
      break;
    case dodoc.settings().projectVideosFoldername:
      $currentMedia = showVideo(mdata);
      mediaFilename = getMediaFiles(mdata).video;
      break;
    case dodoc.settings().projectAudiosFoldername:
      $currentMedia = showAudio(mdata);
      mediaFilename = getMediaFiles(mdata).audio;
      break;
    case dodoc.settings().projectTextsFoldername:
      $currentMedia = showText( mdata);
      mediaFilename = getMediaFiles(mdata).md;
      break;
  }

  $currentMedia
    .attr( 'data-mediakey', mediaKey)
    .attr( 'data-mediaName', mdata.mediaName)
    .attr( 'data-mediatype', mdata.mediaFolderPath)
    .attr( 'data-type', mdata.mediaFolderPath)
    	.attr( 'data-informations', mdata.informations)
    	.attr( 'data-mediafilename', mediaFilename)
    	.attr( 'data-fav', mdata.fav)
    	.addClass( mdata.fav ? 'is--highlight' : '')
    	.find( '.mediaData--informations')
    	  .html( mdata.informations.replace(/(\r\n|\n|\r)/gm, "<br>"))
      .end()
    	.data( 'mtimestamp', transformDatetoTimestamp( mdata.modified))
    	.data( 'ctimestamp', transformDatetoTimestamp( mdata.created))
    ;

  if(!mdata.informations) {
    $currentMedia.find('.mediaData').remove();
  }

  if(mdata.fav === "true") {
    $currentMedia.addClass('is--highlight');
  }

  return $currentMedia;
}

function makeFullPathForProject( path) {
  return '/' + currentFolder + '/' + currentProject + '/' + path;
}

function showImage( mediaDatas) {

  var mediasFilesPath = getMediaFiles(mediaDatas);
	var mediaItem = $(".js--templates .media_image").clone(false);

  	mediaItem
      .data('imagesrc_fullsize', mediasFilesPath.img_large)
      .find( 'img')
        .attr('src', mediasFilesPath.img_thumb !== undefined ? mediasFilesPath.img_thumb:mediasFilesPath.img_large)
      .end()
      ;

	return mediaItem;
}

function showAnimation( mediaDatas) {
  var mediasFilesPath = getMediaFiles(mediaDatas);
	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
    .data('imagesrc_fullsize', mediasFilesPath.img_large)
    .data('stopmotionsource', mediasFilesPath.video)
    .find( 'video')
      .attr( 'poster', mediasFilesPath.img_large)
    .end()
    .find( 'source')
      .attr( 'src', mediasFilesPath.video)
    .end()
  ;
	return mediaItem;
}

function showVideo( mediaDatas) {
  var mediasFilesPath = getMediaFiles(mediaDatas);
	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
    .data('imagesrc_fullsize', mediasFilesPath.img_large)
    .data('videosource', mediasFilesPath.video)
    .find( 'video')
      .attr( 'poster', mediasFilesPath.img_large)
    .end()
    .find( 'source')
      .attr( 'src', mediasFilesPath.video)
    .end()
  ;

	return mediaItem;
}

function showAudio( mediaDatas) {

  var mediasFilesPath = getMediaFiles(mediaDatas);
	var mediaItem = $(".js--templates .media_audio").clone(false);

	mediaItem
    .data('imagesrc_fullsize', mediasFilesPath.img_large)
    .data('audiosource', mediasFilesPath.audio)
    .find('source')
      .attr( 'src', mediasFilesPath.audio)
    .end()
    .find('.poster')
      .attr('src', mediasFilesPath.img_large)
    .end()
  ;

	return mediaItem;
}

function showText( mediaDatas) {

  var mediasFilesPath = getMediaFiles(mediaDatas);
  var parsedText = mediaDatas.textMediaContent.text_md;
  var originalText = mediaDatas.textMediaContent.text;

	var mediaItem = $(".js--templates .media_text").clone(false);
	mediaItem
    .data( 'textFilePath', mediasFilesPath.md)
    .data( 'originalText', originalText)
	  .find( '.mediaContent--textOfTextmedia')
	    .html(parsedText)
    .end()
    ;
	return mediaItem;

}


function getMediaFiles(mediaDatas) {
  var mediaFolderPath = mediaDatas.mediaFolderPath;
  var mediaFilenames = mediaDatas.files;
  var mediaImages = {};
  $.each( mediaFilenames, function( key, mediaFilename) {
    // if media is either a jpg or a png
    if(mediaFilename.toLowerCase().match(".jpg") || mediaFilename.toLowerCase().match(".jpeg") || mediaFilename.toLowerCase().match(".png")) {
      // if its name is made of the thumb suffix, its a thumb
      if(mediaFilename.toLowerCase().match(dodoc.settings().thumbSuffix)) {
        mediaImages.img_thumb = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
      } else {
      // otherwise its probably the large image (original or optimized version)
        mediaImages.img_large = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
      }
    } else if(mediaFilename.toLowerCase().match(".mp4") ||  mediaFilename.toLowerCase().match(".webm")) {
      mediaImages.video = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
    } else if(mediaFilename.toLowerCase().match(".wav") || mediaFilename.toLowerCase().match(".mp3")) {
      mediaImages.audio = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
    } else if(mediaFilename.toLowerCase().match(".md")) {
      mediaImages.md = makeFullPathForProject( mediaFolderPath + '/' + mediaFilename);
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
    .filter("[data-medianame='" + mediaData.mediaName + "']")
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
    .filter(function() { return $(this).data('slugFolderName') === slugFolderName })
    ;

  $itemToRemove
    .fadeOut( 400, function() {
      $(this).remove();
    })
    ;
}

function removeThisPubli( $container, slugPubliName) {
  var $items = $container.find(".publi-folder");

  var $itemToRemove = $items
    .filter(function() { return $(this).data('slugPubliName') === slugPubliName })
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
  var publiPath = makeFullPathForProject( dodoc.settings().projectPublisFoldername + '/' + publiData.slugPubliName);
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
    .find(".js--removePubli")
      .on('click', function() {
        if(window.confirm(dodoc.lang().modal.sureToRemovePubli)) {
      		  sendData.removeOnePubli({
          		"slugPubliName" : publiData.slugPubliName
          });
        }
        return false;
      })
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

  var publiPath = makeFullPathForProject( dodoc.settings().projectPublisFoldername + '/' + pdata.slugPubliName);

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

  // load the css file corresponding to this
  var publiTemplateCSSPath = '/' + dodoc.settings().publicationTemplateDirname + '/' + pdata.template + '/' + 'template.css';
  $('.publi_container,.montage_publi_container').find('#templateCss').attr('href', publiTemplateCSSPath);

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

  addFolder : function(d) {
    socket.emit('addFolder', d);
  },
  editFolder : function(d) {
    socket.emit('editFolder',d);
  },
  removeOneFolder : function(d) {
    	socket.emit('removeOneFolder', d);
  },

  createNewProject : function(d) {
    d.slugFolderName = currentFolder;
    	socket.emit('addProject', d);
  },
  editProject : function(d) {
    d.slugFolderName = currentFolder;
    	socket.emit('editProject', d);
  },
  removeOneProject : function(d) {
    d.slugFolderName = currentFolder;
    	socket.emit('removeOneProject', d);
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
  editPubli : function(publiData) {
    publiData.slugFolderName = currentFolder;
    publiData.slugProjectName = currentProject;
    	socket.emit( 'editPubli', publiData);
  },
  removeOnePubli : function(publiData) {
    publiData.slugFolderName = currentFolder;
    publiData.slugProjectName = currentProject;
    	socket.emit('removeOnePubli', publiData);
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
  return dodoc.settings().projectPhotosFoldername;
}
function getAnimationPathOfProject() {
  return dodoc.settings().projectAnimationsFoldername;
}
function getVideoPathOfProject() {
  return dodoc.settings().projectVideosFoldername;
}
function getAudioPathOfProject() {
  return dodoc.settings().projectAudiosFoldername;
}
function getTextPathOfProject() {
  return dodoc.settings().projectTextsFoldername;
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