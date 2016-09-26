"use strict";

var fs = require('fs-extra'),
	glob = require('glob'),
	path = require('path'),
	gm = require('gm'),
  mm = require('marky-mark'),
	moment = require('moment'),
	exec = require('child_process').exec,
// 	phantom = require('phantom'),
	ffmpeg = require('fluent-ffmpeg'),
	sprintf = require('sprintf-js').sprintf,
	vsprintf = require('sprintf-js').vsprintf,
	flags = require('flags'),
  merge = require('merge'),
  gutil = require('gulp-util'),
  parsedown = require('woods-parsedown'),
  slugg = require('slugg'),
  gm = require('gm').subClass({imageMagick: true})
;

var dodoc  = require('./public/dodoc.js');

module.exports = function(app, io){

  // VARIABLES
  flags.defineBoolean('debug');
  flags.defineBoolean('verbose');
  flags.parse();

  var dev = (function() {
    var isDebugMode = flags.get('debug');
    var isVerbose = flags.get('verbose');

    return {
      init : function() {
        if(isDebugMode) {
          console.log('Debug mode is Enabled');
          console.log('---');
          dev.log('all functions are prepended with ~ ');
          dev.logpackets('(dev mode) green for sent packets');
          if(isVerbose) {
            dev.logverbose('(dev and verbose) gray for regular parsing data');
          }
        }
      },
      log : function(term) {
        if( isDebugMode)
          console.log(gutil.colors.blue('- ' + term));
      },
      logverbose : function(term) {
        if( isDebugMode && isVerbose)
          console.log(gutil.colors.gray('- ' + term));
      },
      logpackets : function(term) {
        if( isDebugMode)
          console.log(gutil.colors.green('- ' + term));
      },
      logfunction : function(term) {
        if( isDebugMode)
          console.info(gutil.colors.magenta('~ ' + term))
      }
    }
  })();
  dev.init();

	console.log("main module initialized");

	io.on("connection", function(socket){
		// I N D E X    P A G E
		socket.on( 'listFolders', function (data){ onListFolders( socket); });
		socket.on("newFolder", onNewFolder);
		socket.on("editFolder", onEditFolder);
		socket.on("removeFolder", onRemoveFolder);

		// F O L D E R     P A G E
		socket.on("listProjects", function (data){ onListProjects( socket, data); });
		socket.on("newProject", onNewProject);
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

		socket.on( 'listOnePubliMetaAndMedias', onListOnePubliMetaAndMedias);
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
	function onNewFolder( folderData) {
		dev.logfunction( "EVENT - onNewFolder");
		createNewFolder( folderData).then( function( newpdata) {
      sendEventWithContent( 'folderCreated', newpdata);
    }, function(errorpdata) {
      console.error("Failed to create a new folder! Error: ", errorpdata);
      sendEventWithContent( 'folderAlreadyExist', errorpdata);
    });
	}

	function onListFolders( socket){
		dev.logfunction( "EVENT - onListFolders");
    listAllFolders().then(function( allFoldersData) {
      sendEventWithContent( 'listAllFolders', allFoldersData, socket);
      // also list projects !
      allFoldersData.forEach( function( fdata) {
        onListProjects( socket, fdata);
      });
    }, function(error) {
      console.error("Failed to list folders! Error: ", error);
    });
	}

	// Modifier un dossier
	function onEditFolder( updatedFolderData){
		dev.logfunction( "EVENT - onEditFolder with packet " + JSON.stringify( updatedFolderData, null, 4));
    updateFolderMeta( updatedFolderData).then(function( currentDataJSON) {
      sendEventWithContent( 'folderModified', currentDataJSON);
    }, function(error) {
      console.error("Failed to update a folder! Error: ", error);
    });
	}

	// Supprimer un dossier
	function onRemoveFolder( fdata){
		dev.logfunction( "EVENT - onRemoveFolder");
    removeFolderNamed( fdata.slugFolderName).then(function( removedFolderData) {
      sendEventWithContent( 'folderRemoved', removedFolderData);
    }, function(error) {
      console.error("Failed to remove a folder! Error: ", error);
    });
	}


// P R O J E T S     P A G E
	// Liste les projets existants

	function onListProjects( socket, dataFolder) {
		dev.logfunction( "EVENT - onListProjects");
    listAllProjectsOfOneFolder( dataFolder.slugFolderName).then(function( allProjectsData) {
      sendEventWithContent( 'listAllProjectsOfOneFolder', allProjectsData, socket);
    }, function(error) {
      console.error("Failed to list projects! Error: ", error);
    });
	}

  function onNewProject( projectData) {
		dev.logfunction( "EVENT - onNewProject");
		createNewProject( projectData).then( function( newpdata) {
      sendEventWithContent( 'projectCreated', newpdata);
    }, function(error) {
      console.error("Failed to create a new project! Error: ", error);
    });
  }

	// Modifier un projet
	function onEditProject( pdata) {
		dev.logfunction( "EVENT - onEditProject with packet " + JSON.stringify( pdata, null, 4));

		updateProjectMeta( pdata).then( function( newpdata) {
      sendEventWithContent( 'projectModified', newpdata);
    }, function(error) {
      console.error("Failed to update a project! Error: ", error);
    });
	}

	// Supprimer un dossier
	function onRemoveOneProject( pdata){
		dev.logfunction( "EVENT - onRemoveProject");
    removeOneProject( pdata.slugFolderName, pdata.slugProjectName).then( function( rpdata) {
      sendEventWithContent( 'projectRemoved', rpdata);
    }, function(error) {
      console.error("Failed to remove the project called " + pdata.slugProjectName + "! Error: ", error);
    });
	}

// F I N     P R O J E T S     P A G E

// P R O J E T      P A G E
	function onListProject( pdata, socket) {
		dev.logfunction( "EVENT - onListProject");
    var npdata = listOneProject( pdata.slugFolderName, pdata.slugProjectName);
    sendEventWithContent( 'listOneProject', npdata);
  }

  function onListOneProjectMedias( pdata, socket) {
		dev.logfunction( "EVENT - listOneProjectMedias");
  	listAllMedias( pdata.slugFolderName, pdata.slugProjectName).then(function( mediaFolderContent) {
      sendEventWithContent( 'listAllMedias', mediaFolderContent, socket);
    }, function(error) {
      console.error("Failed to list one media! Error: ", error);
    });
  }


  function onListOneMedia( projectData, socket) {
		dev.logfunction( "EVENT - onListOneMedia with packet " + JSON.stringify( projectData, null, 4));
		var slugFolderName = projectData.slugFolderName;
		var slugProjectName = projectData.slugProjectName;
		var mediaName = projectData.mediaName;
    var mediaFolderPath = getMediaFolderPathByType( projectData.type);
    listOneMedia( slugFolderName, slugProjectName, mediaFolderPath, mediaName).then(function( oneMediaData) {
      sendEventWithContent( 'listOneMedia', oneMediaData, socket);
    }, function(error) {
      console.error("Failed to listOneMedia! Error: ", error);
    });
  }


// F I N     P R O J E T      P A G E

// C A P T U R E      P A G E

	function onNewMedia( mediaData) {
		dev.logfunction( "EVENT - onNewMedia : " + JSON.stringify( mediaData, null, 4));
    	createNewMedia( mediaData).then(function( mediaMetaData) {
      	listOneMedia( mediaMetaData.slugFolderName, mediaMetaData.slugProjectName, mediaMetaData.mediaFolderPath, mediaMetaData.mediaName).then(function( oneMediaData) {
        for(var prop in oneMediaData) {
          oneMediaData[prop]["author"] = mediaData.author;
        }
        sendEventWithContent( 'mediaCreated', oneMediaData);
      }, function(error) {
        console.error("Failed to listOneMedia from create! Error: ", error);
      });
    }, function(error) {
      console.error("Failed to createNewMedia! Error: ", error);
    });
	}


	function onEditMediaMeta( editMediaData) {
		dev.logfunction( "EVENT - onEditMediaMeta");
  	editMediaMeta( editMediaData).then(function( mediaMetaData) {
    	listOneMedia( mediaMetaData.slugFolderName, mediaMetaData.slugProjectName, mediaMetaData.mediaFolderPath, mediaMetaData.mediaName).then(function( oneMediaData) {
        sendEventWithContent( 'mediaUpdated', oneMediaData);
      }, function(error) {
        console.error("Failed to listOneMedia from create! Error: ", error);
      });

    }, function(error) {
      console.error("Failed to edit media! Error: ", error);
    });
	}


	function onStartStopMotion( socket, mediaData) {
		dev.logfunction( "EVENT - onStartStopMotion");

		var folderCacheName = getCurrentDate();

		var slugFolderName = mediaData.slugFolderName;
		var slugProjectName = mediaData.slugProjectName;
		var mediaFolder = getAnimationPathOfProject();
		var folderCachePath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder + '/' + folderCacheName;
		fs.removeSync( folderCachePath);
		fs.ensureDirSync( folderCachePath);
		var newStopMotionData =
		{
			"folderCacheName" : folderCacheName,
			"folderCachePath" : folderCachePath
		}
    sendEventWithContent( 'stopMotionDirectoryCreated', newStopMotionData, socket);

    if( mediaData.imageContent !== undefined) {
      // also add the linked image as first image to the stopmotion
      var imageData =
      {
        "imageContent" : mediaData.imageContent,
        "folderCacheName" : folderCacheName,
        "folderCachePath" : folderCachePath,
        "imageCount" : 0
      };
      onAddImageToStopMotion( socket, imageData);
    }
	}

	function onAddImageToStopMotion( socket, imageData) {
		dev.logfunction( "EVENT - onAddImageToStopMotion");

		var imageBuffer = decodeBase64Image( imageData.imageContent);
		var imageFullPath = imageData.folderCachePath + '/' + imageData.imageCount + '.png';

		var mediaData =
  		{
    		"imageFullPath" : imageFullPath,
    		"imageCount" : imageData.imageCount
  		};

		fs.writeFile( imageFullPath, imageBuffer.data, function(err) {
      if (err) console.log( err);
      sendEventWithContent( 'newStopmotionImage', mediaData, socket);
		});
  }


  function onDeleteLastImageOfStopMotion( socket, idata) {
		dev.logfunction( "EVENT - onDeleteLastImageOfStopMotion : " + JSON.stringify( idata, null, 4));

    var fullPathToStopmotionImage = getFullPath( idata.pathToStopmotionImage);

    fs.exists( fullPathToStopmotionImage, function(exists) {
      if(exists) {
        console.log( '--> Will remove last stop-motion image.');
        fs.unlink( fullPathToStopmotionImage);
      } else {
        console.log( gutil.colors.red('--> Couldn\'t find the last stop-motion image, so couldn\'t delete it.'));
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

  	deleteOneMedia( slugFolderName, slugProjectName, mediaFolder, mediaName).then(function( mediaMetaData) {
      sendEventWithContent( 'mediaRemoved', mediaMetaData);
    }, function(error) {
      console.error("Failed to remove one media! Error: ", error);
    });
	}

// F I N     C A P T U R E    P A G E

// B I B L I    P A G E


  function onListOneProjectPublis( publiMetaData, socket) {
		dev.logfunction( "EVENT - onListOneProjectPublis");
		var slugFolderName = publiMetaData.slugFolderName;
		var slugProjectName = publiMetaData.slugProjectName;

    	listPublis( slugFolderName, slugProjectName).then(function( publiProjectContent) {
      sendEventWithContent( 'listOneProjectPublis', publiProjectContent, socket);
    }, function(error) {
      console.error("Failed to list all publis! Error: ", error);
    });
  }


  function onCreatePubli( publiData) {
		dev.logfunction( "EVENT - onCreatePubli");

  	createPubli( publiData).then(function( publiMetaData) {
    	listPublis( publiMetaData.slugFolderName, publiMetaData.slugProjectName, publiMetaData.slugPubliName).then(function( publiProjectContent) {
        sendEventWithContent( 'publiCreated', publiProjectContent);
      }, function(error) {
        console.error("Failed to listPublis from create! Error: ", error);
      });

    }, function(error) {
      console.error("Failed to create New Publi! Error: ", error);
    });
  }

  function onEditMetaPubli( publiData) {
		dev.logfunction( "EVENT - onEditMetaPubli");

		editThisPubli( publiData).then(function( publiMetaData) {
  		var slugFolderName = publiMetaData.slugFolderName;
  		var slugProjectName = publiMetaData.slugProjectName;
  		var slugPubliName = publiMetaData.slugPubliName;

    	listPublis( slugFolderName, slugProjectName, slugPubliName).then(function( publiProjectContent) {
        sendEventWithContent( 'publiMetaUpdated', publiProjectContent);
      }, function(error) {
        console.error("Failed to listPublis from create! Error: ", error);
      });

    }, function(error) {
      console.error("Failed to create New Publi! Error: ", error);
    });

  }

  function onEditMediasPubli( publiData) {
		dev.logfunction( "EVENT - onEditMediasPubli");

		editThisPubli( publiData).then(function( publiMetaData) {
    		var slugFolderName = publiMetaData.slugFolderName;
    		var slugProjectName = publiMetaData.slugProjectName;
    		var slugPubliName = publiMetaData.slugPubliName;

      	listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName).then(function( publiMedias) {
        sendEventWithContent( 'publiMediasUpdated', publiMedias);
      }, function(error) {
        console.error("Failed to list publi media! Error: ", error);
      });
    }, function(error) {
      console.error("Failed to edit this publi! Error: ", error);
    });

  }

// F I N    B I B L I    P A G E

// P U B L I     P A G E
	function onListOnePubliMetaAndMedias( publiData) {
    dev.logfunction( "EVENT - onListOnePubliMetaAndMedias : " + JSON.stringify( publiData, null, 4));
		var slugFolderName = publiData.slugFolderName;
		var slugProjectName = publiData.slugProjectName;
		var slugPubliName = publiData.slugPubliName;

  	  listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName).then(function( publiMedias) {
      sendEventWithContent( 'listOnePubliMetaAndMedias', publiMedias);
    }, function(error) {
      console.error("Failed to list one media! Error: ", error);
    });

	}
// F I N     P U B L I     P A G E

// - - -

/***************************************************************************
                                  C O M M O N      F U N C T I O N

                                all functions for specific dodoc purpose
                                - list all folders and send them over
                                - list all projects and send them over
                                - find the folder of a project from its path
                                - update folder data
                                - etc.

                                Functions sould return only their content with Promise.

                                See onNewFolder() and createNewFolder() for working examples.

****************************************************************************/


	function parseData(d) {
    	var parsed = parsedown(d);
    // the fav field is a boolean, so let's convert it
    	if( parsed.hasOwnProperty('fav'))
    	  parsed.fav = (parsed.fav === 'true');
		return parsed;
	}
	function storeData( mpath, d, e) {
    return new Promise(function(resolve, reject) {
      dev.logverbose('Will store data');
      var textd = textifyObj(d);
      if( e === "create") {
        fs.appendFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(parseData(textd));
        });
      }
		  if( e === "update") {
        fs.writeFile( mpath, textd, function(err) {
        if (err) reject( err);
          resolve(parseData(textd));
        });
      }
    });
	}

  function textifyObj( obj) {
    var str = '';
    dev.logverbose( '1. will prepare string for storage');
    for (var prop in obj) {
      var value = obj[prop];
      dev.logverbose('2. value ? ' + value);
      // if value is a string, it's all good
      // but if it's an array (like it is for medias in publications) we'll need to make it into a string
      if( typeof value === 'array') {
        value = value.join(', ');
      }
      // check if value contains a delimiter
      if( typeof value === 'string' && value.indexOf('\n----\n') >= 0) {
        dev.logverbose( '2. WARNING : found a delimiter in string, replacing it with a backslash');
        // prepend with a space to neutralize it
        value = value.replace('\n----\n', '\n ----\n');
      }
      if( typeof value === 'object') {
        // loop for each item in object
        var objstr = '\n\n';

        for (var index in value) {
          var thisItem = value[index];
          objstr += '-\n';
          // loop for each prop for each object
          for (var itemProp in thisItem) {
            objstr += itemProp + ': ' + thisItem[itemProp] + '\n';
          }
        }
        value = objstr;
      }
      str += prop + ': ' + value + dodoc.textFieldSeparator;
    }
    dev.logverbose( '3. textified object : ' + str);
    return str;
  }

  function getFullPath( path) {
    return dodoc.contentDir + "/" + path;
  }
  function getCurrentDate() {
    return moment().format( dodoc.metaDateFormat);
  }
  function eventAndContent( sendEvent, objectJson) {
    var eventContentJSON =
    {
      "socketevent" : sendEvent,
      "content" : objectJson
    };
    return eventContentJSON;
  }
  function sendEventWithContent( sendEvent, objectContent, socket) {
    var eventAndContentJson = eventAndContent( sendEvent, objectContent);
    dev.logpackets("eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    if( socket === undefined)
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    else
      socket.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
  }


/************

FOLDER METHODS

*************/

  function getMetaFileOfFolder( folderPath) {
    return folderPath + '/' + dodoc.folderMetafilename + dodoc.metaFileext;
  }

  function createNewFolder( folderData) {
    return new Promise(function(resolve, reject) {
    	dev.logfunction( "COMMON — createNewFolder");

    	var folderName = folderData.name;
    	var slugFolderName = slugg(folderName);
    	var folderPath = getFullPath( slugFolderName);
    	var currentDateString = getCurrentDate();

  	  fs.access( folderPath, fs.F_OK, function( err) {
    	  // if there's nothing at path
        if ( err) {
        	console.log("New folder created with name " + folderName + " and path " + folderPath);
          fs.ensureDirSync(folderPath);//write new folder in folders
          var fmeta =
            {
              "name" : folderName,
              "created" : currentDateString,
              "modified" : currentDateString,
              "statut" : "en cours",
            };
          storeData( getMetaFileOfFolder( folderPath), fmeta, "create").then(function( meta) {
            resolve( meta);
          });

        } else {
          // if there's already something at path
          console.log("WARNING - the following folder name already exists: " + slugFolderName);
          var objectJson = {
            "name": folderName,
            "timestamp": currentDateString
          };
          reject( objectJson);
        }
  	  });

    });
  }

	function listAllFolders() {
    return new Promise(function(resolve, reject) {
  		fs.readdir( dodoc.contentDir, function (err, filenames) {
        if (err) return console.log( 'Couldn\'t read content dir : ' + err);

        var folders = filenames.filter( function(slugFolderName){ return new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugFolderName); });
  	    dev.logverbose( "Number of folders in " + dodoc.contentDir + " = " + folders.length + ". Folders are " + folders);

  	    var foldersProcessed = 0;
  	    var allFoldersData = [];
  		  folders.forEach( function( slugFolderName) {

  		    if( new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugFolderName)
  		    && slugFolderName.indexOf( dodoc.deletedPrefix)){
          	var fmeta = getFolderMeta( slugFolderName);
          	fmeta.slugFolderName = slugFolderName;
            allFoldersData.push( fmeta);
          }

          foldersProcessed++;
          if( foldersProcessed === folders.length && allFoldersData.length > 0) {
            dev.logverbose( "- - - - all folders JSON have been processed.");
            resolve( allFoldersData);
          }
  		  });
  		});
    });
	}

	function removeFolderNamed( slugFolderName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — removeFolderNamed : " + JSON.stringify(slugFolderName, null, 4));
  		var folderPath = getFullPath( slugFolderName);
  		var deletedFolderPath = getFullPath( dodoc.deletedPrefix + slugFolderName);

      fs.rename( folderPath, deletedFolderPath, function(err) {
        if (err) reject( err);
        var removedFolderData = { "slugFolderName" : slugFolderName };
        resolve( removedFolderData);
      });
    });
	}

  function listAllProjectsOfOneFolder( slugFolderName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "EVENT — listAllProjectsOfOneFolder : " + slugFolderName);
  		var folderPath = getFullPath( slugFolderName);

      // list all projects
  		fs.readdir( folderPath, function (err, projects) {

        if (err) reject( err);
        if (projects === undefined) reject( 'no projet in this folder');
  	    dev.logverbose( "- number of files and folders in " + folderPath + " = " + projects.length + ". They are " + projects);
  	    var projectsProcessed = 0;
  	    var allProjectsData = [];
  		  projects.forEach( function( slugProjectName) {
  		    if( new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugProjectName)
  		    && slugProjectName.indexOf( dodoc.deletedPrefix)){
            var pdata = getProjectMeta( slugFolderName, slugProjectName);
            var projectPath = getProjectPath( slugFolderName, slugProjectName);
            pdata.slugFolderName = slugFolderName;
            pdata.slugProjectName = slugProjectName;
            pdata.projectPreviewName = getProjectPreview( projectPath);
            allProjectsData.push( pdata);
          }

          projectsProcessed++;
          if( projectsProcessed === projects.length && allProjectsData.length > 0) {
            dev.logverbose( "- - - - all Project JSON have been processed.");
            resolve( allProjectsData);
          }
        });
  	  });
    });
  }


  function getFolderMeta( slugFolderName) {
		dev.logfunction( "COMMON — getFolderMeta");

    var folderPath = getFullPath( slugFolderName);
  	var folderMetaFile = getMetaFileOfFolder( folderPath);

		var folderData = fs.readFileSync( folderMetaFile,dodoc.textEncoding);
		var folderMetadata = parseData( folderData);

    return folderMetadata;
  }

  // accepts a folderData with at least a "name" and a "slugFolderName"
  function updateFolderMeta( folderData) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — updateFolderMeta");

  		var isNameChanged = folderData.newName !== undefined;
  		var slugFolderName = folderData.slugFolderName;
  		var folderPath = getFullPath( slugFolderName);
      var currentDateString = getCurrentDate();
      var newStatut = folderData.statut;

      // récupérer les infos sur le folder
      var fmeta = getFolderMeta( slugFolderName);

      // éditer les métas récupéré
      if( isNameChanged)
        fmeta.name = folderData.newName;
      if( newStatut !== undefined)
        fmeta.statut = newStatut;

      fmeta.modified = currentDateString;

      // envoyer les changements dans le JSON du folder
      storeData( getMetaFileOfFolder( folderPath), fmeta, "update").then(function( ufmeta) {
        ufmeta.slugFolderName = slugFolderName;
        resolve( ufmeta);
      });
    });
  }

/************

PROJECT METHODS

*************/


  function getProjectPath( slugFolderName, slugProjectName) {
    return getFullPath( slugFolderName + '/' + slugProjectName);
  }

  function getMetaFileOfProject( projectPath) {
//     dev.log( 'projectPath : ' + projectPath + ' expecting filename : ' + dodoc.projectMetafilename + dodoc.metaFileext);
    return projectPath + '/' + dodoc.projectMetafilename + dodoc.metaFileext;
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

  function getAllMediasFoldersPathAsArray() {
    var mediasFolders = [];
    mediasFolders.push( getPhotoPathOfProject());
    mediasFolders.push( getAnimationPathOfProject());
    mediasFolders.push( getVideoPathOfProject());
    mediasFolders.push( getAudioPathOfProject());
    mediasFolders.push( getTextPathOfProject());
    return mediasFolders;
  }
  function getPubliPathOfProject() {
    return dodoc.projectPublisFoldername;
  }

  function getProjectMeta( slugFolderName, slugProjectName) {

//    dev.log( "getProjectMeta with slugFolderName : " + slugFolderName + " slugProjectName : " + slugProjectName);
    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var projectJSONFile = getMetaFileOfProject( projectPath);

		var projectData = fs.readFileSync( projectJSONFile, dodoc.textEncoding);
		var projectJSONdata = parseData(projectData);

    return projectJSONdata;
  }

  function createNewProject( projectData) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — createNewProject");

  		var projectName = projectData.projectName;
  		var slugProjectName = slugg( projectName);
  		var slugFolderName = projectData.slugFolderName;

  		var currentDateString = getCurrentDate();
  		var pathToFolder = getFullPath( slugFolderName);

  		// Vérifie si le projet existe déjà, change son slug si besoin
  		slugProjectName = findFirstFilenameNotTaken( slugProjectName, pathToFolder, '');
      var projectPath = getProjectPath( slugFolderName, slugProjectName);

    	console.log("New project created with name " + projectName + " and path " + projectPath);
      fs.ensureDirSync(projectPath);//new project

      if( projectData.imageData !== undefined) {
        addProjectImage( "apercu", projectPath, projectData.imageData);
      }

      var mediaFolders = getAllMediasFoldersPathAsArray();
      mediaFolders.forEach( function( mediaFolder) {
        fs.ensureDirSync( projectPath + '/' + mediaFolder);//write new folder in folders
      });
      var publiFolder = getPubliPathOfProject();
      fs.ensureDirSync( projectPath + '/' + publiFolder);//write new folder in folders

      var pmeta =
        {
          "name" : projectName,
          "created" : currentDateString,
          "modified" : currentDateString,
          "statut" : "en cours",
          "informations" : 0
        };

      storeData( getMetaFileOfProject( projectPath), pmeta, "create").then(function( meta) {
        var updatedpmeta = getProjectMeta( slugFolderName, slugProjectName);
        updatedpmeta.slugFolderName = slugFolderName;
        updatedpmeta.slugProjectName = slugProjectName;
        updatedpmeta.projectPreviewName = getProjectPreview( projectPath);
        resolve( updatedpmeta);
      });


    });
  }

  function getProjectPreview( projectPath) {

    dev.logverbose( "detecting preview");
    // looking for an image whose name starts with apercu or preview in the project folder
    var filesInProjectFolder = fs.readdirSync( projectPath);
    var previewName = false;

    dev.logverbose( "- match apercu/preview in array : " + filesInProjectFolder);
    filesInProjectFolder.forEach( function( filename) {
      if( new RegExp( dodoc.regexpMatchProjectPreviewNames, 'i').test(filename)) {
        previewName = filename;
        dev.logverbose( "- - match preview called " + previewName);
      }
    });
    dev.logverbose( "- final filename ? " + previewName);
    return previewName;

  }

  // accepts a folderData with at least a "foldername", a "slugFolderName", a "projectname" and a "slugProjectName"
  function updateProjectMeta( pdata) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — updateProjectMeta : " + JSON.stringify( pdata, null, 4));

  		var projectName = pdata.name;

  		var slugProjectName = pdata.slugProjectName;
  		var slugFolderName = pdata.slugFolderName;
  		var projectPath = getProjectPath( slugFolderName, slugProjectName);

      var currentDateString = getCurrentDate();

      if( pdata.imageData !== undefined) {
        addProjectImage( "apercu", projectPath, pdata.imageData);
      }

      // récupérer les infos sur le project
      var currentpdata = getProjectMeta( slugFolderName, slugProjectName);

      // éditer le JSON récupéré
      currentpdata.name = pdata.name;
      if( pdata.statut !== undefined)
        currentpdata.statut = pdata.statut;
      currentpdata.modified = currentDateString;

      storeData( getMetaFileOfProject( projectPath), currentpdata, 'update').then(function( meta) {
        var updatedpmeta = getProjectMeta( slugFolderName, slugProjectName);
        updatedpmeta.slugFolderName = slugFolderName;
        updatedpmeta.slugProjectName = slugProjectName;
        updatedpmeta.projectPreviewName = getProjectPreview( projectPath);
        resolve( updatedpmeta);
      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t update project meta.'));
        reject( 'Couldn\'t update project meta');
      });
    });
  }

  function listOneProject( slugFolderName, slugProjectName) {
    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var pdata = getProjectMeta( slugFolderName, slugProjectName);
    pdata.slugFolderName = slugFolderName;
    pdata.slugProjectName = slugProjectName;
    pdata.projectPreviewName = getProjectPreview( projectPath);
    return pdata;
  }

	function removeOneProject( slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON - onRemoveProject _ slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);

      var projectPath = getProjectPath( slugFolderName, slugProjectName);
      var projectPathToDeleted = getProjectPath( slugFolderName, dodoc.deletedPrefix + slugProjectName);
  		fs.rename( projectPath, projectPathToDeleted, function(err) {
        if (err) reject(err);
        var projectData =
        {
          "slugFolderName" : slugFolderName,
          "slugProjectName" : slugProjectName,
        }
        resolve( projectData);
  		});
    });
	}



/************

MEDIA METHODS

*************/

  function getPathToMedia( projectPath, mediasFolderPath, mediaName) {
    return projectPath + '/' + mediasFolderPath + '/' + mediaName;
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

  function findFirstFilenameNotTaken( fileName, path, fileext) {
    fileext = typeof fileext !== 'undefined' ?  fileext : dodoc.metaFileext;

    try {
      var newFileName = fileName;
      var index = 0;
      var newPathToFile = path + '/' + newFileName;
      while( !fs.accessSync( newPathToFile + fileext, fs.F_OK)){
        dev.logverbose("- - following path is already taken : " + newPathToFile);
        index++;
        newFileName = fileName + "-" + index;
        newPathToFile = path + '/' + newFileName;
      }
	  } catch( err) {}

    console.log( "- - this filename is not taken : " + newFileName);
    return newFileName;
  }

  function listAllMedias( slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — listAllMedias : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var mediasFoldersPath = getAllMediasFoldersPathAsArray();

      var mediasProcessed = 0;
      var mediaFolderContent = [];
  	  mediasFoldersPath.forEach( function( mediasFolderPath) {
  		  mediaFolderContent = merge( mediaFolderContent, listMediasOfOneType( slugFolderName, slugProjectName, mediasFolderPath));
      });
      resolve( mediaFolderContent);
    });
  }

  function listOneMedia( slugFolderName, slugProjectName, singleMediaFolderPath, mediaName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — listOneMedia : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " singleMediaFolderPath = " + singleMediaFolderPath + " mediaName = " + mediaName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var mediaFolderContent = [];
		  mediaFolderContent = merge( mediaFolderContent, listMediasOfOneType( slugFolderName, slugProjectName, singleMediaFolderPath, mediaName));
      resolve( mediaFolderContent);
    });
  }

  function listMediasOfOneType( slugFolderName, slugProjectName, mediasFolderPath, mediaName) {
		dev.logfunction( "COMMON — listMediasOfOneType with");

    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var mediasPath = projectPath + '/' + mediasFolderPath;
    var lookingForSpecificJson = mediaName !== undefined ? true : false;

    var filesInMediaFolder = fs.readdirSync( mediasPath);
    var foldersMediasMeta = [];
    var foldersMediasFiles = [];

//     dev.log( "- looking for files in " + mediasPath);

    filesInMediaFolder.forEach( function( filename) {
      if( !new RegExp( dodoc.regexpMatchFolderNames, 'i').test( filename) && filename !== ".DS_Store") {
        var fileExtension = new RegExp( dodoc.regexpGetFileExtension, 'i').exec( filename)[0];
//         dev.log( "- - fileEXTENSION of " + filename + " is " + fileExtension);
//         dev.log( "- - Is file a deleted file ? " + new RegExp( '^' + dodoc.deletedPrefix).test( filename));
        // match only json that are not deleted (prefixed with a custom prefix
        if( fileExtension === dodoc.metaFileext && !new RegExp( '^' + dodoc.deletedPrefix).test( filename)) {
          if( !lookingForSpecificJson)
  				  foldersMediasMeta.push( filename);
  				else if( filename == mediaName + dodoc.metaFileext) {
  				  foldersMediasMeta.push( filename);
  				  return;
  				}
			  }
			  else {
				  foldersMediasFiles.push( filename);
			  }
      }
    });

    // in foldersMediasMeta, there should always be at least another file with the same name.
    // Let's add them inside our json reference file
    var folderMediaMetaAndFileName = new Object();
    dev.logverbose( "- foldersMediasMeta : " + JSON.stringify( foldersMediasMeta, null, 4));

    for( var mediaMetaFilename of foldersMediasMeta) {
      var metaFileNameWithoutExtension = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( mediaMetaFilename)[1];
//       dev.log( "- looking for medias filenames that start with " + metaFileNameWithoutExtension);
      for( var mediaFilename of foldersMediasFiles) {
//         dev.log( "- comparing to " + mediaFilename);
        // check if both mediaFilename and metaFileNameWithoutExtension have a dash in them or not
        // only match XXX.txt with XXX.jpg, and -1.txt with -1.jpg
        if( (mediaFilename.indexOf('-') === -1) !== (metaFileNameWithoutExtension.indexOf('-') === -1))
          continue;

        // if this media filename corresponds to the meta filename
        if (mediaFilename.indexOf(metaFileNameWithoutExtension) !== -1 ) {
          var mediaObjKey = mediasFolderPath + '/' + mediaMetaFilename;
          // if we don't have an obj with this key
          if( !folderMediaMetaAndFileName.hasOwnProperty( mediaObjKey)) {
            // let's make one
            folderMediaMetaAndFileName[mediaObjKey] = new Object();
            // read JSON file and add the content to the folder
            var mdata = getMediaMeta( projectPath, mediasFolderPath, metaFileNameWithoutExtension);
            mdata.mediaFolderPath = mediasFolderPath;
            mdata.mediaName = metaFileNameWithoutExtension;
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;

            // if the file is a text, then also add the content of the TXT in the answer
            if( new RegExp( dodoc.regexpGetFileExtension, 'i').exec( mediaFilename)[0] === '.md') {
              var textMediaData = readTextMedia(projectPath + '/' + mediasFolderPath + '/' + mediaFilename);
              mdata.textMediaContent = textMediaData;
            }

            folderMediaMetaAndFileName[mediaObjKey] = mdata;
          }

          // otherwise if we have already initialized that key, but we don't have a files property
          if( !folderMediaMetaAndFileName[mediaObjKey].hasOwnProperty( "files")) {
            folderMediaMetaAndFileName[mediaObjKey]["files"] = new Array();
          }

          // then, let's add this file to the list of files for that json
          folderMediaMetaAndFileName[mediaObjKey]["files"].push( mediaFilename);

        }
      }
    }
    return folderMediaMetaAndFileName;

  }

  function readTextMedia(textMediaPath) {
    var textMediaData = fs.readFileSync(textMediaPath, dodoc.textEncoding);
    textMediaData = parseData(textMediaData);
    // we should get a title and text field, let's parse them in markdown and add title_md and text_md fields
    textMediaData.title_md = mm.parse(textMediaData.title).content;
    textMediaData.text_md = mm.parse(textMediaData.text).content;
    return textMediaData;
  }


  function getMediaMeta( projectPath, mediaFolderPath, mediaName) {
		dev.logfunction( "COMMON — getMediaMeta : projectPath = " + projectPath + " mediaFolderPath = " + mediaFolderPath + " mediaName = " + mediaName);

    var mediaJSONFilepath = getPathToMedia(projectPath, mediaFolderPath, mediaName) + dodoc.metaFileext;
		var mediaData = fs.readFileSync(mediaJSONFilepath, dodoc.textEncoding);
		var mediaMetaData = parseData(mediaData);

    return mediaMetaData;
  }

  function createNewMedia( newMediaData) {

    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON - createNewMedia " + newMediaData.mediaType + " in project " + newMediaData.slugProjectName);

			var slugFolderName = newMediaData.slugFolderName;
			var slugProjectName = newMediaData.slugProjectName;
			var newFileName = getCurrentDate();
			var newMediaType = newMediaData.mediaType;

			var mediaFolder = '';
			var pathToFile = '';
			var fileExtension;

    	var mediaFolder = getMediaFolderPathByType( newMediaType);

      switch (newMediaType) {
        case 'photo':
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;
          newFileName = findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.png';
          var imageBuffer = decodeBase64Image( newMediaData.mediaData);

          fs.writeFile( pathToFile + fileExtension, imageBuffer.data, function(err) {
            if (err) reject( err);
            console.log("Image added at path " + pathToFile);

            gm( pathToFile + fileExtension)
              .resize( dodoc.mediaThumbWidth, dodoc.mediaThumbHeight)
              .write( pathToFile + dodoc.thumbSuffix + fileExtension, function (err) {
                if( err)
                  console.log( gutil.colors.red('--> Failed to make a thumbnail for a photo! Error: ', err));
                createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
                  mdata.slugFolderName = slugFolderName;
                  mdata['slugProjectName'] = slugProjectName;
                  mdata['mediaFolderPath'] = mediaFolder;
              		console.log( 'just created a photo, its meta is ' + JSON.stringify( mdata, null, 4));
                  resolve( mdata);
                }, function() {
                  reject( 'failed to create meta for photo');
                });

            });
      		});

          break;
        case 'video':
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;

          newFileName = findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;
          fileExtension = dodoc.videoext;

          writeVideoToDisk( pathToFile, fileExtension, newMediaData.mediaData)
          .then(function() {
            console.error("Saved a video.");
            createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
              mdata.slugFolderName = slugFolderName;
              mdata.slugProjectName = slugProjectName;
              mdata.mediaFolderPath = mediaFolder;

              createThumbnails( pathToFile + fileExtension, newFileName, mediaPath).then(function( mediaFolderContent) {
                resolve( mdata);
              }, function(error) {
                console.log( gutil.colors.red('--> Failed to make a thumbnail one media! Error: ', error));
                resolve( mdata);
              });
            }, function() {
              reject( 'failed to create meta for video');
            });

          }, function(error) {
            console.error("Failed to save video! Error: ", error);
            reject();
          });

          break;
        case 'animation':
          // get the path to the mediaFolder
      			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;

          // get the path to the cache folder and the mp4 (it's the same without the extension)
          // WARNING : animation doesn't use newFileName, it already has a filename to use (generated at the beginning of a stopmotion capture)
          newFileName = newMediaData.stopMotionCacheFolder;
          pathToFile = mediaPath + '/' + newFileName;
          fileExtension = dodoc.stopMotionext;

          // ask ffmpeg to make a video from the cache images
          var proc = new ffmpeg({ "source" : pathToFile + '/%d.png'})
            // using 12 fps
            .withFpsInput(4)
            .fps(4)
            .withVideoCodec('libx264')
            .addOptions(['-vb 8000k', '-f mp4'])
            // setup event handlers
            .on('end', function() {
              console.log('file has been converted succesfully');

              createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
                mdata.slugFolderName = slugFolderName;
                mdata.slugProjectName = slugProjectName;
                mdata.mediaFolderPath = mediaFolder;
                createThumbnails( pathToFile + fileExtension, newFileName, mediaPath).then(function( mediaFolderContent) {
                  resolve( mdata);
                }, function(error) {
                  console.error("Failed to make a thumbnail one media! Error: ", error);
                  resolve( mdata);
                });
              }, function() {
                reject( 'failed to create meta for stopmotion');
              });

            })
            .on('error', function(err) {
              console.log('an error happened: ' + err.message);
          		reject( "couldn't create a stopmotion animation");
            })
            // save to file
            .save( pathToFile + fileExtension);
          break;
        case 'audio':
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;
          newFileName = findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.wav';
          var dataMedia = newMediaData.mediaData.split(',').pop();
          var audioBuffer = new Buffer( dataMedia, 'base64');
          fs.writeFileSync( pathToFile + fileExtension, audioBuffer);

          var imgExtension = '.png';
          var imageBuffer = decodeBase64Image( newMediaData.audioScreenshot);
          fs.writeFileSync( pathToFile + imgExtension, imageBuffer.data);

          createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
            mdata.slugFolderName = slugFolderName;
            mdata.slugProjectName = slugProjectName;
            mdata.mediaFolderPath = mediaFolder;
            resolve( mdata);
          }, function() {
            reject( 'failed to create meta for audio');
          });

          break;
        case 'text':
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;
          newFileName = findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.md';
          var dataTitle = newMediaData.title;
          var dataText = newMediaData.text;
          console.log( "Creating a new text media at path " + pathToFile + fileExtension + " with title : " + dataTitle + " and text : " + dataText);

          var mediaData = {
            "title" : dataTitle,
            "text" : dataText
          };
          storeData(pathToFile + fileExtension, mediaData, "create").then(function( meta) {
            createMediaMeta( newMediaType, pathToFile, newFileName).then( function( mdata) {
              var textMediaData = readTextMedia(pathToFile + fileExtension);
              mdata.textMediaContent = textMediaData;
              mdata.slugFolderName = slugFolderName;
              mdata.slugProjectName = slugProjectName;
              mdata.mediaFolderPath = mediaFolder;
              resolve( mdata);
            }, function(err) {
              reject( 'failed to create meta for text media : ' + err);
            });
          }, function(err) {
            reject( 'failed to create textfile for text media : ' + err);
          });

          break;
      // end of switch
      }
    // end of promise
    });
  }


  function createMediaMeta( newMediaType, pathToFile, fileName) {
    return new Promise(function(resolve, reject) {
      var mdata =
        {
          "created" : getCurrentDate(),
          "modified" : getCurrentDate(),
          "informations" : "",
          "type" : newMediaType,
          "fav" : false
        };
      storeData( pathToFile + dodoc.metaFileext, mdata, 'update').then(function( meta) {
        meta.mediaName = fileName;
        console.log( "New media meta file created at path " + pathToFile + dodoc.metaFileext);
        resolve( meta);
      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t create media meta.'));
        reject( 'Couldn\'t create media meta');
      });
    });
  }


  function editMediaMeta( editMediaData) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON - editMediaMeta : " + JSON.stringify(editMediaData, null, 4));

			var slugFolderName = editMediaData.slugFolderName;
			var slugProjectName = editMediaData.slugProjectName;
			var mediaFolderPath = editMediaData.mediaFolderPath;
			var mediaName = editMediaData.mediaName;

      // get the path to the media JSON and its content
      var projectPath = getProjectPath( slugFolderName, slugProjectName);
      var mediaFilepath = getPathToMedia( projectPath, mediaFolderPath, mediaName);
      var mediaMetaData = getMediaMeta( projectPath, mediaFolderPath, mediaName);

      // switch the fav state
      if( editMediaData.switchFav !== undefined)
        mediaMetaData.fav = !mediaMetaData.fav;

      if( editMediaData.informations !== undefined)
        mediaMetaData.informations = editMediaData.informations;

      // if this is a text media, also update its content
      mediaMetaData.modified = getCurrentDate();

      storeData( mediaFilepath + dodoc.metaFileext, mediaMetaData, 'update').then(function( mdata) {
        dev.log('stored meta');
        // if media is a text, let's add the text content to the obj for convenience client-side
        if( mediaFolderPath === dodoc.projectTextsFoldername && editMediaData.titleOfTextmedia !== undefined && editMediaData.textOfTextmedia !== undefined) {

          var mediaFilepathWithExt = mediaFilepath + '.md';
          var mediaData = {
            "title" : editMediaData.titleOfTextmedia,
            "text" : editMediaData.textOfTextmedia
          };
          dev.log('now storing text media');
          storeData( mediaFilepathWithExt, mediaData, 'update').then(function(mediaData) {
            dev.log('just stored text media');
            var textMediaData = readTextMedia(mediaFilepathWithExt);
            mdata.textMediaContent = textMediaData;
            mdata.mediaName = mediaName;
            mdata.mediaFolderPath = mediaFolderPath;
        		mdata.slugFolderName = slugFolderName;
        		mdata.slugProjectName = slugProjectName;
            resolve( mdata);
          }, function(err) {
            console.log( gutil.colors.red('--> Couldn\'t update text media : ' + err));
            reject( 'Couldn\'t update text media');
          });
        } else {
          dev.log('not a text media');
          // for updating the result
          mdata.mediaName = mediaName;
          mdata.mediaFolderPath = mediaFolderPath;
      		mdata.slugFolderName = slugFolderName;
      		mdata.slugProjectName = slugProjectName;
          resolve( mdata);
        }

      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t update media meta.'));
        reject( 'Couldn\'t update media meta');
      });
    });
  }

	function deleteOneMedia( slugFolderName, slugProjectName, mediaFolder, mediaName) {
    return new Promise(function(resolve, reject) {
  		var pathToMediaFolder = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;
      // find in path

      try {
        var filesInMediaFolder = fs.readdirSync( pathToMediaFolder);
        filesInMediaFolder.forEach( function( filename) {
          var fileNameWithoutExtension = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( filename)[1];
          if( fileNameWithoutExtension === mediaName) {
            var filePath = pathToMediaFolder + '/' + filename;
            var deletedFilePath = pathToMediaFolder + '/' + dodoc.deletedPrefix + filename;
            fs.renameSync( filePath, deletedFilePath);
            console.log( "A file will be deleted (actually, renamed but hidden from dodoc) : \n - " + filePath + "\n - " + deletedFilePath);
          }
        });
        var mediaMetaData =
        {
          "slugFolderName" : slugFolderName,
          "slugProjectName" : slugProjectName,
          "mediaFolder" : mediaFolder,
          "mediaName" : mediaName,
          "mediaKey" : mediaFolder + '/' + mediaName + dodoc.metaFileext
        }
        resolve( mediaMetaData);
      } catch( err) {
        reject( err);
      }
    });
	}


/************

PUBLIS METHODS

*************/

  // if two args, then get path to publi folder
  // if three args, then get path to one publi
  function getPathToPubli( slugFolderName, slugProjectName, pslug) {
    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var pathToPubli = projectPath + '/' + getPubliPathOfProject();
    if( pslug !== undefined)
      pathToPubli = pathToPubli + '/' + pslug;
    return pathToPubli;
  }

  function getPubliMeta( slugFolderName, slugProjectName, pslug) {
    var pathToPubli = getPathToPubli( slugFolderName, slugProjectName, pslug);
    var publiJSONFilepath = pathToPubli + dodoc.metaFileext;
		var publiData = fs.readFileSync( publiJSONFilepath, dodoc.textEncoding);
		var publiMetaData = parseData( publiData);
    return publiMetaData;
  }


  function createPubli( publiData) {
    return new Promise(function(resolve, reject) {
    		dev.logfunction( "COMMON — createPubli : " + JSON.stringify(publiData, null, 4));

    		var currentDateString = getCurrentDate();

    		var pname = publiData.publiName;
    		var pslug = slugg( pname);

    		var slugFolderName = publiData.slugFolderName;
    		var slugProjectName = publiData.slugProjectName;

      var pathToThisPubliFolder = getPathToPubli( slugFolderName, slugProjectName);
      pslug = findFirstFilenameNotTaken( pslug, pathToThisPubliFolder);

      var pathToThisPubli = getPathToPubli( slugFolderName, slugProjectName, pslug) + dodoc.metaFileext;

     	console.log("New publi created with name " + pname + " and path " + pathToThisPubli);

      var newPubliData =
      {
        "name" : pname,
        "created" : currentDateString,
        "modified" : currentDateString,
        "informations" : "",
        "medias" : [{}],
      };

      storeData( pathToThisPubli, newPubliData, 'create').then(function( newPubliData) {
        newPubliData.slugProjectName = slugProjectName;
        newPubliData.slugFolderName = slugFolderName;
        newPubliData.slugPubliName = pslug;
        resolve( newPubliData);
      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t create publi file.'));
        reject( 'Couldn\'t create publi');
      });

    });
  }


  // listing all publis of a project if no publisName is mentioned
  // otherwise return that publis data
  // returns a JSON array of json with filenames as keys
  function listPublis( slugFolderName, slugProjectName, thisPubliName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — listPublis : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " publiName (can be undefined) = " + thisPubliName);

      // lister toutes les publis issues du dossier publi
      var pathToPubliFolder = getPathToPubli( slugFolderName, slugProjectName);
      var lookingForSpecificJson = thisPubliName !== undefined ? true : false;
      var filesInPubliFolder = fs.readdirSync( pathToPubliFolder);

  //     dev.log( "- looking for files in " + publisPath);
      var foldersPublisMeta = [];
      filesInPubliFolder.forEach( function( filename) {
        if( !new RegExp( dodoc.regexpMatchFolderNames, 'i').test( filename) && filename !== ".DS_Store") {
          var fileExtension = new RegExp( dodoc.regexpGetFileExtension, 'i').exec( filename);
          if( fileExtension == dodoc.metaFileext && !new RegExp( '^' + dodoc.deletedPrefix).test( filename)) {
            if( !lookingForSpecificJson)
    				  foldersPublisMeta.push( filename);
    				else if( filename == thisPubliName + dodoc.metaFileext) {
    				  foldersPublisMeta.push( filename);
    				  return;
    				}
  			  }
        }
      });


      var folderPubliMeta = new Object();
      console.log( "- foldersPublisMeta : " + JSON.stringify( foldersPublisMeta, null, 4));
      for (var i=0; i<foldersPublisMeta.length; i++) {
        var publiFilename = foldersPublisMeta[i];
        var slugPubliName = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( publiFilename)[1];

        if( !folderPubliMeta.hasOwnProperty( slugPubliName)) {
          folderPubliMeta[slugPubliName] = new Object();
          // read meta file and add the content to the folder
          var publiMetaData = getPubliMeta( slugFolderName, slugProjectName, slugPubliName);
          publiMetaData.slugPubliName = slugPubliName;
          publiMetaData.slugFolderName = slugFolderName;
          publiMetaData.slugProjectName = slugProjectName;
          publiMetaData.pathToPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName);

          folderPubliMeta[slugPubliName] = publiMetaData;
        }
      }
      resolve( folderPubliMeta);
    });
  }


  function editThisPubli( pdata) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — editThisPubli : publiData = " + JSON.stringify( pdata, null, 4));

      var pathToPubli = getPathToPubli( pdata.slugFolderName, pdata.slugProjectName, pdata.slugPubliName);
      var publiMetaFilepath = pathToPubli + dodoc.metaFileext;

      // get and parse publi json data
      var publiMetaData = getPubliMeta( pdata.slugFolderName, pdata.slugProjectName, pdata.slugPubliName);

      // update modified date
      publiMetaData.modified = getCurrentDate();

      // update title if pdata has newPubliName
      if( pdata.newPubliName !== undefined)
        publiMetaData.name = pdata.newPubliName;

      // update medias if pdata has medias
      if( pdata.medias !== undefined)
        publiMetaData.medias = pdata.medias;

      storeData( publiMetaFilepath, publiMetaData, 'update').then(function( publiMetaData) {
        publiMetaData.slugPubliName = pdata.slugPubliName;
        publiMetaData.slugFolderName = pdata.slugFolderName;
        publiMetaData.slugProjectName = pdata.slugProjectName;
        resolve( publiMetaData);
      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t update publi file.'));
        reject( 'Couldn\'t update publi');
      });
    });
  }



  function listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — listMediaAndMetaFromOnePubli : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " publiName = " + slugPubliName);

      var publiContent = getPubliMeta( slugFolderName, slugProjectName, slugPubliName);
    	listAllMedias( slugFolderName, slugProjectName).then(function( mediaFolderContent) {
      filterMediasFromList( publiContent, mediaFolderContent).then(function( publiMedias) {

        	publiContent.medias = publiMedias;
        	publiContent.slugFolderName = slugFolderName;
        	publiContent.slugProjectName = slugProjectName;
        	publiContent.slugPubliName = slugPubliName;
        	publiContent.pathToPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName);

        	// make an array that looks like listPublis
          var folderPubliMeta = {};
          folderPubliMeta[slugPubliName] = publiContent;
          resolve( folderPubliMeta);
        }, function(error) {
          console.error("Failed to filter medias for a publi! Error: ", error);
          reject( 'fail');
        });
      }, function(error) {
        console.error("Failed to list one media! Error: ", error);
        reject( 'fail');
      });
    });
  }

  function filterMediasFromList( publiContent, mediaFolderContent) {
    return new Promise(function(resolve, reject) {
  		  dev.logfunction( "COMMON — filterMediasFromList : publiContent = " + JSON.stringify(publiContent, null, 4) + " mediaFolderContent = " + JSON.stringify(mediaFolderContent, null, 4));
      var publiMedias = [];
      for( var item of publiContent.medias) {
        dev.logverbose('item : ' + item.name);
        if( mediaFolderContent.hasOwnProperty( item.name) === true) {
          // and copy it to an empty obj
          var mediaitem = {};
          mediaitem[item.name] = mediaFolderContent[item.name];
          publiMedias.push( mediaitem);
        }
      }
      resolve( publiMedias);
    });
  }




/************

*************/


	function writeVideoToDisk( pathToFile, fileExtension, dataURL) {
    return new Promise(function(resolve, reject) {

      dataURL = dataURL.split(',').pop();
      dev.logverbose( 'Will save the video at path : ' + pathToFile + fileExtension);

      var fileBuffer = new Buffer(dataURL, 'base64');
    		fs.writeFile( pathToFile + fileExtension, fileBuffer, function(err) {
          if (err) reject( err);
          resolve();
    		});
    });
	}



	function addProjectImage( imageNameSlug, parentPath, imageData){
		var filePath = parentPath + "/" + imageNameSlug + ".png";
		var imageBuffer = decodeBase64Image( imageData);
		fs.writeFileSync(filePath, imageBuffer.data);
  	console.info("write new file to " + filePath);
	}

	function createThumbnails( videoPath, videoFilename, pathToMediaFolder){
    return new Promise(function(resolve, reject) {
  		var proc = ffmpeg( videoPath)
  		// setup event handlers
  		.on('end', function(files) {
  			console.log('screenshot was saved');
  			resolve();
  		})
  		.on('error', function(err) {
  			console.log('an error happened: ' + err.message);
  			reject();
  		})
  		// take 2 screenshots at predefined timemarks
  		.takeScreenshots({ count: 1, timemarks: [ '00:00:00'], "filename" : videoFilename + ".png"}, pathToMediaFolder);
    });
	}
// F I N     C O M M O N      F U N C T I O N

// H E L P E R S

	// Décode les images en base64
	// http://stackoverflow.com/a/20272545
	function decodeBase64Image(dataString) {

  	dev.logverbose("Decoding base 64 image");

		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

		if (matches.length !== 3) {
			return new Error('Invalid input string');
		}

		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');

		return response;
	}
}