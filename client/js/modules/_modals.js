
// en cours : gestion des modals. Elles s'ouvrent avec un trigger sur $(document), qui passe les données à afficher dedans
var modals = (function() {

  var API = {

    init : function() {

      console.log('Modals.init()');
      	$('body')
      	  .on('click', '.js--openModal_addFolder', function(){
      		  modals.createModal('addFolder');
      	  })
        	.on('click', '.js--openModal_editFolder', function(){
        		var d = $(this).closest(".dossier").data();
        		modals.createModal('editFolder',d);
        	})
        	.on('click', '.js--openModal_addProject', function(){
        		modals.createModal('addProject');
        	})
        	.on('click', '.js--openModal_editProject', function(){
        		var pdata = $(this).closest(".project").data();
        		modals.createModal('editProject', pdata);
        	})
        	.on('click', '.js--openModal_createPublication', function(){
        		modals.createModal('addPubli');
        	})
        	.on('click', '.js--openModal_editPubli', function(){
        		var pdata = $(this).closest("[data-publidata]").data();
        		modals.createModal('editPubli', pdata);
        	})
        	.on('click', '.js--openModal_editMedia', function(){
          	if($('body').hasClass('publi')) return;
        		var mdata = $(this).data();
          mdata.nextm = $(this).next('.js--openModal_editMedia');
          mdata.prevm = $(this).prev('.js--openModal_editMedia');
        		modals.createModal('editMedia', mdata);
        	})
        	.on('click', '.js--addText', function(){
        		modals.createModal('addText');
        })
        .on('click', '.js--addLocalMedia', function(){
        		modals.createModal('addLocalMedia');
        })
        .on('click', '.js--openModal_moveContentFolder', function() {
        		modals.createModal('moveContentFolder');
        })
      	  .on('click', '.js--openModal_showQR', function(){
        		var completeURL = $(this).data('completeurl');
      		  modals.createModal('showQR', completeURL);
      	  })
        ;
    },

    createModal : function(typeOfModal, d) {

      console.log('Creating a new modal of type ' + typeOfModal + ' from data ', {d});

      var $modal = $('[data-modal-id="' + typeOfModal + '"]').empty().off();
      if($modal.length === 0) alertify.error('ERROR: modal is missing');
      var $modalContent = $modal.next().clone(false);
      $modal.append($modalContent.show());

      if(typeOfModal === 'addFolder') {
        $modal = _initAddFolderModal($modal);
      } else if(typeOfModal === 'editFolder') {
        $modal = _initEditFolderModal($modal, d);
      } else if(typeOfModal === 'addProject') {
        $modal = _initAddProjectModal($modal);
      } else if(typeOfModal === 'editProject') {
        $modal = _initEditProjectModal($modal, d);
      } else if(typeOfModal === 'addPubli') {
        $modal = _initAddPubliModal($modal);
      } else if(typeOfModal === 'editPubli') {
        $modal = _initEditPubliModal($modal, d);
      } else if(typeOfModal === 'editMedia') {
        $modal = _initEditMediaModal($modal, d);
      } else if(typeOfModal === 'addText') {
        $modal = _initAddTextModal($modal);
      } else if(typeOfModal === 'addLocalMedia') {
        $modal = _initAddLocalMediaModal($modal);
      } else if(typeOfModal === 'exportWebIsReady') {
        $modal = _initExportWebIsReady($modal, d);
      } else if(typeOfModal === 'uploadWebsiteViaFTP') {
        $modal = _initUploadWebsiteViaFTP($modal, d);
      } else if(typeOfModal === 'confirmPdfExported') {
        $modal = _initConfirmPDFModal($modal,d);
      } else if(typeOfModal === 'moveContentFolder') {
        $modal = _initMoveContentFolderModal($modal);
      } else if(typeOfModal === 'publiHasBeenSentToFtp') {
        $modal = _initPubliHasBeenSentToFTPModal($modal, d);
      } else if(typeOfModal === 'publiFailedToUpload') {
        $modal = _initPubliFailedToUpload($modal, d);
      } else if(typeOfModal === 'showQR') {
        $modal = _initShowQR($modal, d);
      }

      $modal.on('click', function(e) {
        if($(e.target).is($modal)) {
          $modal.trigger('close_that_modal');
        }
      });

      $modal.on('keyup', function(e) {
        if(event.which === 27) {
          $modal.trigger('close_that_modal');
        }
      });

      $modal.find('.js--close').on('click', function(e) {
        $modal.trigger('close_that_modal');
      });
      $modal.on('close_that_modal', function() {
        $modal.foundation('reveal', 'close');
        setTimeout(function() {
          $modal.empty();
          $modal.off()
        }, 500);
      });
      if($modalContent.attr('data-pressEnterToSubmit') !== undefined) {
        $modal.keyup(function(e) {
          var key = e.which;
          if (key == 13) {
            $modal.find('.js--valider').click();
          }
        });
      }
      $modal.foundation('reveal', 'open');
      setTimeout(function() {
        if(!Modernizr.touchevents)
          $modal.find('[autofocus]').eq(0).focus()
      }, 300);

    },
  }

  function _initAddFolderModal($m) {
    $m.find(".js--valider").on('click', function() {
      if(_checkAndHighlightEmptyRequiredFields($m)) return;
      var newFolderName = $m.find('input.js--data_folderName').val().trim();
      sendData.addFolder({ "name" : newFolderName });
      $m.trigger('close_that_modal');
    });
    return $m;
  }
  function _initEditFolderModal($m, d) {

    $m
      	.find('.modify-folder')
      	  .attr('value', d.nom)
        .end()
      	.find('.modify-statut')
      	  .find('option')
          .prop("checked", false)
          .end()
      	  .find('option[value="' + d.statut + '"]')
          .prop("checked", true)
      	  .end()
      .end()
      ;

    $m.find(".js--valider").on('click', function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;
      var newFolderName = $m.find('input.modify-folder').val();
      var newStatut = $m.find('select.modify-statut').val();

  		  sendData.editFolder({
        "name" : d.nom,
        "newName" : newFolderName,
        "slugFolderName" : d.slugFolderName,
        "statut" : newStatut
      });
      $m.trigger('close_that_modal');
    });

    $m.find(".js--deleteFolder").on("click", function() {
      if(window.confirm(dodoc.lang().modal.sureToRemoveFolder)) {
    		  sendData.removeOneFolder({
          "slugFolderName" : d.slugFolderName,
          "folderName" : d.nom,
        });
        $m.trigger('close_that_modal');
      }
    	});

    return $m;
  }

  function _initAddProjectModal($m) {

    	var $filePicker = $m.find('.js--modal_inputfile');
    	var $label = $filePicker.next().find('span');
    	var labelVal = $label.text();

    	$filePicker.on( 'change', function( e )
    	{
    		var fileName = '';
  			fileName = e.target.value.split('\\').pop();

  			var fileData = e.originalEvent.target.files;

    		if(fileName) {
    			$filePicker
    			  .data('fileName', fileName)
    			  .data('fileData', fileData)
    			  ;
    			$label
  			    .html( fileName)
            ;
    		} else
    			$filePicker
    			  .data('fileName', '')
    			  .data('fileData', '')
    			  ;
    			$label.innerHTML = labelVal;
    	});


    $m.find(".js--valider").on('click', function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;
      	var newProjectName = $m.find('.js--modal_name').val();
      	var fileData = $filePicker.data( "fileData");
      	//Images changed

  			var newProjectData = {
 				"projectName" : newProjectName
 			}

      	if( fileData !== undefined && fileData !== null){
      		console.log('Une image a été ajoutée');
      		var f = fileData[0];
      		var reader = new FileReader();
      		reader.onload = function(evt){
          newProjectData.imageData = evt.target.result;
      		  sendData.createNewProject(newProjectData);
          $m.trigger('close_that_modal');
      		};
      		reader.readAsDataURL(f);
      	} else {
    		  sendData.createNewProject(newProjectData);
        $m.trigger('close_that_modal');
      	}
    });
    return $m;
  }

  function _initEditProjectModal($m, pdata) {

    $m
      .find(".js--modal_name")
        .attr( "value", pdata.projectName)
      .end()
      .find(".modify-project-statut option")
        .filter("[value='" + pdata.statut + "']")
          .attr('selected', '')
        .end()
      .end()
      ;

    	var $filePicker = $m.find('.js--modal_inputfile');
    	var $label = $filePicker.next().find('span');
    	var labelVal = $label.text();

    	$filePicker.on( 'change', function(e) {
    		var fileName = '';
  			fileName = e.target.value.split('\\').pop();

  			var fileData = e.originalEvent.target.files;

    		if(fileName) {
    			$filePicker
    			  .data('fileName', fileName)
    			  .data('fileData', fileData)
    			  ;
    			$label
  			    .html( fileName)
            ;
    		} else
    			$filePicker
    			  .data('fileName', '')
    			  .data('fileData', '')
    			  ;
    			$label.innerHTML = labelVal;
    	});

    	$m.find('.js--deleteProject').on('click', function(){
      if(window.confirm(dodoc.lang().modal.sureToRemoveProject)) {
    		  sendData.removeOneProject({
        		"slugProjectName" : pdata.slugProjectName
        });
        $m.trigger('close_that_modal');
      }
    	});

    // remettre le statut
    $m.find(".js--valider").on('click', function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;
      	var newProjectName = $m.find('.js--modal_name').val();
      	var newStatut = $m.find('.modify-project-statut').val();

    		var projectData = {
 				"name" : newProjectName,
        "slugProjectName" : pdata.slugProjectName,
  				"statut" : newStatut,
    		}
      	var fileData = $filePicker.data( "fileData");
      	if( fileData !== undefined && fileData !== null){
      		console.log('Une image a été ajoutée');
      		var f = fileData[0];
      		var reader = new FileReader();
      		reader.onload = function(evt){
        		projectData.imageData = evt.target.result;
      		  sendData.editProject(projectData);
      		};
      		reader.readAsDataURL(f);
      	} else {
    		  sendData.editProject( projectData);
    		}
      $m.trigger('close_that_modal');
    });
    return $m;
  }

  function _initShowQR($m, url) {
    var canvas = $m
      .find('.js--qr')[0];

    var qr = new QRious({
      element: canvas,
      value: url,
      background: 'transparent',
      size: 500
    });

    return $m;
  }

  function _initEditMediaModal($m, mdata) {

    var $navNextMedia = $m.find('.js--big-mediaNav-next');
    var $navPrevMedia = $m.find('.js--big-mediaNav-prev');

    var $modalContent = $m.find('.big-mediaContent');

    // arrow logic
    _setBigmediaArrow($m, mdata.nextm, $navNextMedia);
    _setBigmediaArrow($m, mdata.prevm, $navPrevMedia);

    var mtype = mdata.type;
    var minfos = mdata.informations;
    var mname = mdata.medianame;
    var mfullsizeimagesrc = mdata.imagesrc_fullsize;
    var mpathOfMedia = mdata.pathofmedia;

    switch( mtype){
    		case dodoc.settings().projectPhotosFoldername:
  				var $mediaItem = $(".js--templates .media-big_image").clone(false);
  				$mediaItem
  					.find('img')
  					  .attr('src', mfullsizeimagesrc)
  					.end()
          .find('.js--downloadThisMedia')
            .attr('href', mfullsizeimagesrc)
          .end()
  					;
  				break;
  			case dodoc.settings().projectVideosFoldername:
  				var videoPath = mdata.videosource;
  				var $mediaItem = $(".js--templates .media-big_video").clone(false);
  				$mediaItem
  			    .find('video')
  			      .attr('poster', mfullsizeimagesrc)
  			      .attr('preload', 'auto')
    			    .find('source')
    			      .attr('src', videoPath)
    			    .end()
    			  .end()
          .find('.js--downloadThisMedia')
            .attr('href', videoPath)
          .end()
  					;
  				break;
  			case dodoc.settings().projectAnimationsFoldername:
  				var videoPath = mdata.stopmotionsource;
  				var $mediaItem = $(".js--templates .media-big_stopmotion").clone(false);
  				$mediaItem
  			    .find('video')
  			      .attr('poster', mfullsizeimagesrc)
  			      .attr('preload', 'auto')
    			    .find('source')
    			      .attr('src', videoPath)
            .end()
          .end()
          .find('.js--downloadThisMedia')
            .attr('href', videoPath)
          .end()
  					;
  				break;
  			case dodoc.settings().projectAudiosFoldername:
  				var audioPath = mdata.audiosource;
  				var $mediaItem = $(".js--templates .media-big_audio").clone(false);
  				$mediaItem
  					.find('img')
  					  .attr('src', mfullsizeimagesrc)
  					.end()
  			    .find('audio')
  			      .attr('src', audioPath)
  			    .end()
          .find('.js--downloadThisMedia')
            .attr('href', audioPath)
          .end()
  					;
  				break;
  			case dodoc.settings().projectTextsFoldername:
  				var $mediaItem = $(".js--templates .media-big_text").clone(false);

  				$mediaItem
  					.find('.js--textField')
  					  .val( mdata.originalText)
  					.end()
          .find('.js--downloadThisMedia')
            .attr('href', mdata.textFilePath)
          .end()
  					;
  				break;
    	}

  		if(mdata.fav)
  			$mediaItem.addClass('is--highlight');

    var mediaFilenameWhenDownload = mpathOfMedia.split("/").pop();;

    	$mediaItem
    	  .attr( 'data-medianame', mname)
    	  .attr( 'data-mediatype', mtype)
    	  .find('.js--mediaInformations')
    	    .val( minfos)
      .end()
      .find('.js--mediaFullPath')
        .text(mpathOfMedia)
      .end()
      .find('.js--downloadThisMedia')
        .attr('title', mpathOfMedia)
        .attr('download', mediaFilenameWhenDownload)
      .end()
      ;

    //Envoie les titres et légendes au serveur
    $mediaItem.find('.js--valider').on( 'click', function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;

      // if its not a text media
      if(mtype !== dodoc.settings().projectTextsFoldername) {
        var editMediaData = {
          "mediaName" : mname,
          "mediaFolderPath" : mtype,
        };
      		var informations = $m.find( '.js--mediaInformations').val();
        if(informations !== undefined)
          editMediaData.informations = informations;
        sendData.editMedia( editMediaData);
      		$m.trigger('close_that_modal');
      		$m.empty();

    		} else {
    		// if it is a pure text media
        var editMediaData = {
          "mediaName" : mname,
          "mediaFolderPath" : mtype,
        };
        	var textOfTextmedia =  $m.find('.js--textField').val();
        if( textOfTextmedia !== undefined)
          editMediaData.textOfTextmedia = textOfTextmedia;

        sendData.editMedia( editMediaData);
        $m.trigger('close_that_modal');
      		$m.empty();
    		}
    });

    // Ajoute ou enlève un highlight quand on clique sur "Highlight" dans la fenêtre modal
    $mediaItem.find('.js--highlightMedia').on('click', function(){
      var editMediaData = {
        "mediaName" : mname,
        "mediaFolderPath" : mtype,
        "switchFav" : true
      };
      sendData.editMedia(editMediaData);
      $mediaItem.toggleClass('is--highlight');
    });


    $mediaItem.find('.js--delete-media-bibli').on( 'click', function(){
      if(window.confirm(dodoc.lang().modal.sureToRemoveMedia)) {
        var mediaToDelete = {
          "mediaName" : mname,
          "mediaFolderPath" : mtype,
        }
        sendData.deleteMedia( mediaToDelete);
        	$m.trigger('close_that_modal');
      }
    });

    $modalContent.html($mediaItem);
    return $m;
  }

  function _initAddPubliModal($m) {
    $m.find(".js--valider").on('click', function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;
      	var newPubliName = $m.find('.js--modal_name').val();
      	var newPubliTemplate = $m.find('.js--modal_template:checked').val();
  		  sendData.createNewPubli({
      		"publiName" : newPubliName,
      		"template" : newPubliTemplate
    		});
      $m.trigger('close_that_modal');
    });
    return $m;
  }
  function _initEditPubliModal($m, d) {
    $m
      .find(".js--modal_name")
        .attr( "value", d.name)
      .end()
      .find(".js--modal_template")
        .prop("checked", false)
        .filter("[value='" + d.template + "']")
          .prop("checked", true)
        .end()
      .end()
      ;

    $m.find(".js--valider").on('click', function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;
      	var newName = $m.find('.js--modal_name').val();
      	var newTemplate = $m.find('.js--modal_template:checked').val();
    		var publiData = {
        "name" : newName,
        "slugPubliName" : d.publishown,
        "template" : newTemplate,
        "slugProjectName" : d.slugProjectName
    		};
  		  sendData.editPubliMeta( publiData);
      $m.trigger('close_that_modal');
    });
    return $m;
  }

  function _initAddTextModal($m) {
    $m.find('.js--valider').on('click',function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;
      	var textContent = $m.find('.js--textField').val();
      var mediaData = {
        "mediaType" : "text",
        "mediaFolderPath" : dodoc.settings().projectTextsFoldername,
        "text" : textContent,
      };
      sendData.createNewMedia(mediaData);
      $m.trigger('close_that_modal');
    });
    return $m;
  }

  function _initAddLocalMediaModal($m) {
    	var $filePicker = $m.find('.js--modal_inputfile');
    	var $label = $filePicker.next().find('span');
    	var labelVal = $label.text();
    	var files;

    	$filePicker.on( 'change', function(e) {
  			files = e.originalEvent.target.files;

      var fileNames = [];
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        fileNames.push(file.name);
      }

    		if(fileNames.length > 0) {
    			$label.html(fileNames.join(', '));
    		} else {
    			$label.innerHTML = labelVal;
    		}
    	});

    $m.find('.js--valider').on('click',function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;

      function readAndPreview(file) {
        // Make sure `file.name` matches our extensions criteria
        var reader = new FileReader();

        reader.addEventListener("load", function () {
          console.log('file.name ' + file.name);
          var fileName = file.name;

        		fileName = fileName.toLowerCase();
        		var mediaData;
          if(fileName.indexOf( ".jpg") !== -1 || fileName.indexOf( ".jpeg") !== -1 || fileName.indexOf( ".png") !== -1) {
        			mediaData = {
              "mediaType" : "photo",
        				"mediaData" : this.result
        		  };
        		} else if(fileName.indexOf( ".mp4") !== -1 ||  fileName.indexOf( ".webm") !== -1) {
        			mediaData = {
              "mediaType" : "video",
              "mediaData" : {
                "videoData" : this.result,
              }
        		  }
        		} else if(fileName.indexOf( ".mp3") !== -1 ||  fileName.indexOf( ".m4a") !== -1 ||  fileName.indexOf( ".wav") !== -1) {
        			mediaData = {
              "mediaType" : "audio",
              "mediaData" : {
                "audioData" : this.result,
              }
        		  }
          }
        		if(mediaData !== undefined) {
          		console.log('Now sending file calle ' + fileName + ' with type ' + mediaData.mediaType);
        		  sendData.createNewMedia(mediaData);
          }

        }, false);

        reader.readAsDataURL(file);
      }

      if (files) {
        [].forEach.call(files, readAndPreview);
      }

      $m.trigger('close_that_modal');
    	});
    return $m;
  }

  function _initExportWebIsReady($m,d) {
    var zipURL = d.publicationsFolderRelativePath + '.zip';
    $m
      .find('.js--exportedWebsiteZIPURL')
        .attr('href', zipURL)
        .attr('download', d.slugPubliName)
      .end()
      ;

/*
      .find('.js--publiFilesSavedAtPath')
        .attr('href', d.pathToWebsiteFolder)
        .html(d.pathToWebsiteFolder);
*/

    if(d.is_internetConnected) {
      $m.find('.js--has_noInternet').remove();
    } else {
      $m.find('.js--has_internet').remove();
    }

    if($m.find('.js--uploadViaFTP').length > 0) {
      $m.find('.js--uploadViaFTP').on('click', function(){

        var modalData = {};

        if(store.get('ftp') !== undefined){
          var ftpInfo = store.get('ftp');
          modalData = ftpInfo;
        }
        modalData.pathToWebsiteFolder = d.pathToWebsiteFolder;
        modalData.dateOfExport = d.dateOfExport;
        modalData.slugPubliName = d.slugPubliName;
      	  modals.createModal('uploadWebsiteViaFTP',modalData);

        $m.trigger('close_that_modal');

      });
    }

    return $m;
  }

  function _initUploadWebsiteViaFTP($m,d) {

    $m.find('input.host').val(d.host);
    $m.find('input.user').val(d.user);
    $m.find('input.pass').val(d.pass);
    $m.find('input.baseURL').val( d.baseURL);
    $m.find('input.folder').val(d.sousDossierFtp);

    $m.find('.js--valider').on('click', function(){
      if(_checkAndHighlightEmptyRequiredFields($m)) return;
      var host = $m.find('input.host').val();
      var user = $m.find('input.user').val();
      var pass = $m.find('input.pass').val();
      var baseURL = $m.find('input.baseURL').val();
      var sousDossierFtp = $m.find('input.folder').val();

      store.set('ftp', {
        host: host,
        user: user,
        pass: pass,
        baseURL: baseURL,
        sousDossierFtp: sousDossierFtp
      });

//       socket.emit('ftpSettings', {host,user,pass,baseURL,sousDossierFtp, "slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli, 'webPubliFolderPath': d.webPubliFolderPath });

      socket.emit('uploadViaFTP', {
        FTPsettings:
        {
          host: host,
          user: user,
          pass: pass,
          baseURL: baseURL
        },
        sousDossierFtp: sousDossierFtp,
        pathToWebsiteFolder: d.pathToWebsiteFolder,
        slugPubliName: d.slugPubliName,
        dateOfExport: d.dateOfExport
      });

      $('body').addClass('is--generating');
      $m.trigger('close_that_modal');
    });
    return $m;
  }
  function _initPubliHasBeenSentToFTPModal($m, d) {
    $m
      .find('.js--urlToPubli')
        .html(d.urlToPubli)
        .attr('href', d.urlToPubli)
        ;
    return $m;
  }

  function _initPubliFailedToUpload($m, d) {
    $m
      .find('.js--ftpFailReason')
        .html(d.reason)
        ;
    return $m;
  }

  function _initConfirmPDFModal($m, d) {
    $m
      .find('[data-set_href_as_PDF_URL]')
        .attr('href', d.pdfURL)
      .end()
      .find('[data-set_download_as_publication_name]')
        .attr('download', d.slugPubliName)
      .end()
      .find('[data-open_in_native_app]')
        .attr('data-fullPath', d.pdfPath)
      .end()
      ;
    return $m;
  }
  function _initMoveContentFolderModal($m) {
    $m.find('.js--valider').on('click', function(){
      socket.emit('removeUserDirPath');
    });
    return $m;
  }

  function _setBigmediaArrow($m, $upcomingMedia, $navUpcomingMedia) {
    if($upcomingMedia.length) {
      $navUpcomingMedia
        .removeClass('is--disabled')
        .off()
        .on('click', function() {
        		$m.empty();
          $upcomingMedia.click();
        })
        ;
    } else {
      $navUpcomingMedia
        .addClass('is--disabled')
        .off()
        ;
    }
  }
  function _checkAndHighlightEmptyRequiredFields($m) {
    let emptyReqFields = _getEmptyRequiredFields($m);
    if(emptyReqFields.length > 0) {
      emptyReqFields[0].focus();
      alertify.error(dodoc.lang().modal.someFieldsAreEmptyFillThem);
      return true;
    } else {
      return false;
    }
  }
  function _getEmptyRequiredFields($m) {
    let emptyReqFields = [];
    const className = 'is--empty';
    $m[0].querySelectorAll(':required')
      .forEach(function(el) {
        if(!el.value) {
          el.classList.add(className);
          emptyReqFields.push(el);
        } else {
          if (el.classList)
            el.classList.remove(className);
          else
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
      });
    return emptyReqFields;
  }

  return API;
})();

modals.init();
