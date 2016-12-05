"use strict";

var fs = require('fs-extra');
var path = require('path');

var dodoc = require('./dodoc');
var dodocAPI = require('./bin/dodoc-api');
var dodocFolder = require('./bin/dodoc-folder');
var dodocProject = require('./bin/dodoc-project');
var dodocMedia = require('./bin/dodoc-media');
var dodocPubli = require('./bin/dodoc-publi');

var exportPubliToFtp = require('./bin/upload-to-ftp.js');

try { var exportConfig  = require('./ftp-config.js'); }
catch( err) { console.log('No ftp config files have been found'); }

module.exports = function(app, io){

  console.log("Main module initialized");

  io.on("connection", function(socket){

    var onevent = socket.onevent;
    socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call (this, packet);    // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet);      // additional call to catch-all
    };
    socket.on("*",function(event,data) {
      dev.log('RECEIVED EVENT : ' + event);
    });

    // I N D E X    P A G E
    socket.on( 'listFolders', function (data){ onListFolders(socket); });
    socket.on( 'addFolder', function (data){ onNewFolder(socket,data); });
    socket.on( 'editFolder', onEditFolder);
    socket.on( 'removeOneFolder', onRemoveOneFolder);

    // F O L D E R     P A G E
    socket.on("listProjects", function (data){ onListProjects( socket, data); });
    socket.on("addProject", onNewProject);
    socket.on("editProject", onEditProject);
    socket.on("removeOneProject", onRemoveOneProject);

    // P R O J E T      P A G E
    socket.on("listProject", onListProject);

    // C A P T U R E     P A G E
    socket.on("newMedia", onNewMedia);

    //STOP MOTION
    socket.on( "startStopMotion", function (data){ onStartStopMotion( socket, data); });
    socket.on( "addImageToStopMotion", function (data){ onAddImageToStopMotion( socket, data); });
    socket.on( 'deleteLastImageOfStopMotion', function (data){ onDeleteLastImageOfStopMotion(socket, data); });

    // B I B L I        P A G E
    socket.on( 'listOneProjectMedias', onListOneProjectMedias);
    socket.on( 'listOneProjectPublis', onListOneProjectPublis);

    socket.on( 'createPubli', onCreatePubli);
    socket.on( 'editMetaPubli', onEditMetaPubli);
    socket.on( 'editMediasPubli', onEditMediasPubli);

    socket.on("editMediaMeta", onEditMediaMeta);
    socket.on("deleteMedia", onDeleteMedia);
    socket.on("deleteStopmotion", onDeleteStopmotion);

		socket.on( 'listOnePubliMetaAndMedias', onListOnePubliMetaAndMedias);

    socket.on( 'exportPubliToFtp', function (data){ onExportPubliToFtp( socket, data); });
	});

  /***************************************************************************

                                                E V E N T S

                                  All those functions are triggered by events.
                                  They send their content over to COMMON functions
                                  and then use io.sockets.emit to send content
                                  to the client. The content transits by json objects
                                  These functions should be as concise as possible.

  ****************************************************************************/

// I N D E X     P A G E

  // Create a new folder
  function onNewFolder(socket, folderData) {
    dev.logfunction( "EVENT - onNewFolder with packet " + JSON.stringify( folderData, null, 4));
    dodocFolder.createNewFolder( folderData).then(function( newpdata) {
      dodocAPI.sendEventWithContent('folderCreated', newpdata, io);
    }, function(error) {
      dev.error("Failed to create a new folder! Error: " + error);
      dodocAPI.sendEventWithContent( 'folderAlreadyExist', error, io, socket);
    });
  }

  function onListFolders(socket){
    dev.logfunction( "EVENT - onListFolders");
    dodocFolder.listAllFolders().then(function( allFoldersData) {
      dodocAPI.sendEventWithContent( 'listAllFolders', allFoldersData, io, socket);
      // also list projects if there are folders
      if(allFoldersData !== undefined) {
        allFoldersData.forEach( function( fdata) {
          onListProjects(socket, fdata);
        });
      }
    }, function(error) {
      dev.error("Failed to list folders! Error: " + error);
    });
  }

  // Modifier un dossier
  function onEditFolder(updatedFolderData){
    dev.logfunction( "EVENT - onEditFolder with packet " + JSON.stringify( updatedFolderData, null, 4));
    dodocFolder.updateFolderMeta( updatedFolderData).then(function(fdata) {
      dodocAPI.sendEventWithContent( 'folderModified', fdata, io);
      onListProjects('', fdata);
    }, function(error) {
      dev.error("Failed to update a folder! Error: " + error);
    });
  }

  // Supprimer un dossier
  function onRemoveOneFolder( fdata){
    dev.logfunction( "EVENT - onRemoveOneFolder");
    dodocFolder.removeFolderNamed( fdata.slugFolderName).then(function( removedFolderData) {
      dodocAPI.sendEventWithContent( 'folderRemoved', removedFolderData, io);
    }, function(error) {
      dev.error("Failed to remove a folder! Error: " + error);
    });
  }


// P R O J E T S     P A G E
// Liste les projets existants

  function onListProjects( socket, dataFolder) {
    dev.logfunction( "EVENT - onListProjects");
    dodocFolder.listAllProjectsOfOneFolder(dataFolder.slugFolderName).then(function( allProjectsData) {
      dodocAPI.sendEventWithContent( 'listAllProjectsOfOneFolder', allProjectsData, io, socket);
    }, function(error) {
      dev.error("Failed to list projects! Error: " + error);
    });
  }

  function onNewProject(projectData) {
    dev.logfunction( "EVENT - onNewProject");
    dodocProject.createNewProject(projectData).then( function( newpdata) {
      dodocAPI.sendEventWithContent( 'projectCreated', newpdata, io);
    }, function(error) {
      dev.error("Failed to create a new project! Error: " + error);
    });
  }

  // Modifier un projet
  function onEditProject( pdata) {
    dev.logfunction( "EVENT - onEditProject with packet " + JSON.stringify( pdata, null, 4));
    dodocProject.updateProjectMeta( pdata).then( function( newpdata) {
      dodocAPI.sendEventWithContent( 'projectModified', newpdata, io);
    }, function(error) {
      dev.error("Failed to update a project! Error: " + error);
    });
  }

  // Supprimer un dossier
  function onRemoveOneProject( pdata){
    dev.logfunction( "EVENT - onRemoveProject");
    dodocProject.removeOneProject( pdata.slugFolderName, pdata.slugProjectName).then( function( rpdata) {
      dodocAPI.sendEventWithContent( 'projectRemoved', rpdata, io);
    }, function(error) {
      dev.error("Failed to remove the project called " + pdata.slugProjectName + "! Error: " + error);
    });
  }


// F I N     P R O J E T S     P A G E

// P R O J E T      P A G E
  function onListProject( pdata, socket) {
    dev.logfunction( "EVENT - onListProject");
    dodocProject.listOneProject( pdata.slugFolderName, pdata.slugProjectName).then(function(npdata) {
      dodocAPI.sendEventWithContent( 'listOneProject', npdata, io);
    }, function(error) {
      dev.error("Failed to list one project! Error: " + error);
    });
  }

  function onListOneProjectMedias( pdata, socket) {
    dev.logfunction( "EVENT - listOneProjectMedias");
    dodocMedia.listAllMedias( pdata.slugFolderName, pdata.slugProjectName).then(function( mediaFolderContent) {
      dodocAPI.sendEventWithContent( 'listAllMedias', mediaFolderContent, io, socket);
    }, function(error) {
      dev.error("Failed to list one media! Error: " + error);
    });
  }

// F I N     P R O J E T      P A G E

// C A P T U R E      P A G E

  function onNewMedia( mediaData) {
    dev.logfunction( "EVENT - onNewMedia : " + JSON.stringify( mediaData, null, 4));
    dodocMedia.createNewMedia(mediaData).then(function( mediaMetaData) {
      dodocMedia.listOneMedia(mediaMetaData.slugFolderName, mediaMetaData.slugProjectName, mediaMetaData.mediaFolderPath, mediaMetaData.mediaName).then(function( oneMediaData) {
        for(var prop in oneMediaData) {
          oneMediaData[prop]["author"] = mediaData.author;
        }
        dodocAPI.sendEventWithContent( 'mediaCreated', oneMediaData, io);
      }, function(error) {
        dev.error("Failed to listOneMedia from create! Error: " + error);
      });
    }, function(error) {
      dev.error("Failed to createNewMedia! Error: " + error);
    });
  }


  function onEditMediaMeta( editMediaData) {
    dev.logfunction( "EVENT - onEditMediaMeta");
    dodocMedia.editMediaMeta( editMediaData).then(function( mediaMetaData) {
      dodocMedia.listOneMedia( mediaMetaData.slugFolderName, mediaMetaData.slugProjectName, mediaMetaData.mediaFolderPath, mediaMetaData.mediaName).then(function( oneMediaData) {
        dodocAPI.sendEventWithContent( 'mediaUpdated', oneMediaData, io);
      }, function(error) {
        dev.error("Failed to listOneMedia from create! Error: " + error);
      });

    }, function(error) {
      dev.error("Failed to edit media! Error: " + error);
    });
  }


  function onStartStopMotion( socket, mediaData) {
    dev.logfunction( "EVENT - onStartStopMotion");

    var folderCacheName = dodocAPI.getCurrentDate();

    var slugFolderName = mediaData.slugFolderName;
    var slugProjectName = mediaData.slugProjectName;
    var mediaFolder = dodocMedia.getAnimationPathOfProject();
    var folderCachePath = path.join( dodocAPI.getProjectPath( slugFolderName, slugProjectName), mediaFolder, folderCacheName);
    var relativeCachePath = path.join('/', slugFolderName, slugProjectName, mediaFolder, folderCacheName);

    fs.removeSync( folderCachePath);
    fs.ensureDirSync( folderCachePath);
    var newStopMotionData =
    {
      "folderCacheName" : folderCacheName,
      "folderCachePath" : folderCachePath,
      "relativeCachePath" : relativeCachePath
    }
    dodocAPI.sendEventWithContent( 'stopMotionDirectoryCreated', newStopMotionData, io, socket);

    if( mediaData.imageContent !== undefined) {
      // also add the linked image as first image to the stopmotion
      var imageData =
      {
        "imageContent" : mediaData.imageContent,
        "folderCachePath" : folderCachePath,
      };
      onAddImageToStopMotion(socket, imageData);
    }
  }

  function onAddImageToStopMotion( socket, imageData) {
    dev.logfunction( "EVENT - onAddImageToStopMotion : " + JSON.stringify( imageData, null, 4));

    var newFileName = dodocAPI.getCurrentDate('x');
    newFileName = dodocAPI.findFirstFilenameNotTaken(newFileName, imageData.folderCachePath, '.jpeg');

    // cache image path without ext
    var pathToFile = path.join(imageData.folderCachePath, newFileName);

    var imageBuffer = dodocAPI.decodeBase64Image( imageData.imageContent);
    dev.logverbose('Will store this photo at path: ' + pathToFile);

    dodocMedia.makeImageFromData(imageBuffer.data, pathToFile)
    .then(function(imagePath) {
    		var mediaData = {};
    		mediaData.newImageName = newFileName+'.jpeg';
      dodocAPI.sendEventWithContent('newStopmotionImage', mediaData, io, socket);
    });
  }


  function onDeleteLastImageOfStopMotion( socket, idata) {
    dev.logfunction( "EVENT - onDeleteLastImageOfStopMotion : " + JSON.stringify( idata, null, 4));
    var fullPathToStopmotionImage = dodocAPI.getFolderPath(idata.pathToStopmotionImage);
    fs.exists( fullPathToStopmotionImage, function(exists) {
      if(exists) {
        console.log( '--> Will remove last stop-motion image.');
        fs.unlink(fullPathToStopmotionImage);
      } else {
        dev.error('--> Couldn\'t find the last stop-motion image, so couldn\'t delete it.');
      }
    });
  }


  // Delete File
  function onDeleteMedia( mediaData) {
    dev.logfunction( "EVENT - onDeleteMedia");
    var slugFolderName = mediaData.slugFolderName;
    var slugProjectName = mediaData.slugProjectName;
    var mediaFolder = mediaData.mediaFolderPath;
    var mediaName = mediaData.mediaName;

    dodocMedia.deleteOneMedia( slugFolderName, slugProjectName, mediaFolder, mediaName).then(function( mediaMetaData) {
      dodocAPI.sendEventWithContent( 'mediaRemoved', mediaMetaData, io);
    }, function(error) {
      dev.error("Failed to remove one media! Error: " + error);
    });
  }

  function onDeleteStopmotion( mediaData) {
    dev.logfunction( "EVENT - onDeleteStopmotion");
    var slugFolderName = mediaData.slugFolderName;
    var slugProjectName = mediaData.slugProjectName;
    var mediaFolder = mediaData.mediaFolderPath;
    var mediaName = mediaData.mediaName;

    var pathToMediaFolder = path.join( dodocAPI.getProjectPath( slugFolderName, slugProjectName), mediaFolder);

    try {
      var filesInMediaFolder = fs.readdirSync( pathToMediaFolder);
      filesInMediaFolder.forEach( function( filename) {
        var fileNameWithoutExtension = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( filename)[1];
        // only remove files with extension, not folder (in case a user wants to continue her stopmotion)
        if( new RegExp( dodoc.regexpGetFileExtension, 'i').exec( filename) === null) {
          return;
        }

        if( fileNameWithoutExtension === mediaName) {
          var filePath = path.join( pathToMediaFolder, filename);
          fs.unlinkSync( filePath);
        }
      });
    } catch( err) {
    }
  }

// F I N     C A P T U R E    P A G E

// B I B L I    P A G E

  function onListOneProjectPublis( publiMetaData, socket) {
    dev.logfunction( "EVENT - onListOneProjectPublis");
    var slugFolderName = publiMetaData.slugFolderName;
    var slugProjectName = publiMetaData.slugProjectName;

    dodocPubli.listPublis( slugFolderName, slugProjectName).then(function( publiProjectContent) {
      dodocAPI.sendEventWithContent( 'listOneProjectPublis', publiProjectContent, io, socket);
    }, function(error) {
      dev.error("Failed to list all publis! Error: " + error);
    });
  }


  function onCreatePubli( publiData) {
    dev.logfunction( "EVENT - onCreatePubli");

    dodocPubli.createPubli( publiData).then(function( publiMetaData) {
      dodocPubli.listPublis( publiMetaData.slugFolderName, publiMetaData.slugProjectName, publiMetaData.slugPubliName).then(function( publiProjectContent) {
        dodocAPI.sendEventWithContent( 'publiCreated', publiProjectContent, io);
      }, function(error) {
        dev.error("Failed to listPublis from create! Error: " + error);
      });

    }, function(error) {
      dev.error("Failed to create New Publi! Error: " + error);
    });
  }

  function onEditMetaPubli( publiData) {
    dev.logfunction( "EVENT - onEditMetaPubli");

    dodocPubli.editThisPubli(publiData).then(function( publiMetaData) {
      var slugFolderName = publiMetaData.slugFolderName;
      var slugProjectName = publiMetaData.slugProjectName;
      var slugPubliName = publiMetaData.slugPubliName;

      dodocPubli.listPublis(slugFolderName, slugProjectName, slugPubliName).then(function( publiProjectContent) {
        dodocAPI.sendEventWithContent( 'publiMetaUpdated', publiProjectContent, io);
      }, function(error) {
        dev.error("Failed to listPublis from create! Error: " + error);
      });
    }, function(error) {
      dev.error("Failed to edit Publi! Error: " + error);
    });

  }

  function onEditMediasPubli( publiData) {
    dev.logfunction( "EVENT - onEditMediasPubli");

    dodocPubli.editThisPubli( publiData).then(function( publiMetaData) {
      var slugFolderName = publiMetaData.slugFolderName;
      var slugProjectName = publiMetaData.slugProjectName;
      var slugPubliName = publiMetaData.slugPubliName;

      dodocPubli.listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName).then(function( publiMedias) {
        dodocAPI.sendEventWithContent( 'publiMediasUpdated', publiMedias, io);
      }, function(error) {
        dev.error("Failed to list publi media! Error: " + error);
      });
    }, function(error) {
      dev.error("Failed to edit this publi! Error: " + error);
    });

  }

// F I N    B I B L I    P A G E

// P U B L I     P A G E
  function onListOnePubliMetaAndMedias( publiData) {
    dev.logfunction( "EVENT - onListOnePubliMetaAndMedias : " + JSON.stringify( publiData, null, 4));
    var slugFolderName = publiData.slugFolderName;
    var slugProjectName = publiData.slugProjectName;
    var slugPubliName = publiData.slugPubliName;

    dodocPubli.listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName).then(function( publiMedias) {
      dodocAPI.sendEventWithContent( 'listOnePubliMetaAndMedias', publiMedias, io);
    }, function(error) {
      dev.error("Failed to list one media! Error: " + error);
    });
  }

  function onExportPubliToFtp(socket, publiData) {
    exportPubliToFtp.exportPubliToFtp( socket, publiData);
  }

// F I N     P U B L I     P A G E
}