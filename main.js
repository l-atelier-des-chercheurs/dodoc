var fs = require('fs-extra'),
	glob = require("glob"),
	path = require("path"),
	gm = require('gm'),
  mm = require('marky-mark'),
	moment = require( "moment" ),
	exec = require('child_process').exec,
// 	phantom = require('phantom'),
	ffmpeg = require('fluent-ffmpeg'),
	sprintf = require("sprintf-js").sprintf,
	vsprintf = require("sprintf-js").vsprintf,
	flags = require('flags'),
  merge = require('merge')
;

var dodoc  = require('./public/dodoc.js');

module.exports = function(app, io){

  // VARIABLES
  flags.defineBoolean('debug');
  flags.parse();
  var isDebugMode = flags.get('debug');
  if( isDebugMode) {
    console.log( 'Debug mode is Enabled');
    console.log( '---');
  }

  var dev = {
    log : function( term) {
      if( isDebugMode)
        console.log( "- " + term);
    },
    logfunction : function( term) {
      if( isDebugMode)
        console.info( "~" + term)
    }
  };

	console.log("main module initialized");

	io.on("connection", function(socket){
		// I N D E X    P A G E
		socket.on("listFolders", onListFolders);
		socket.on("newFolder", onNewFolder);
		socket.on("modifyFolder", onModifyFolder);
		socket.on("removeFolder", onRemoveFolder);

		// F O L D E R     P A G E
		socket.on("listProjects", onListProjects);
		socket.on("newProject", onNewProject);
		socket.on("modifyProject", onModifyProject);
		socket.on("removeOneProject", onRemoveOneProject);

		// P R O J E T      P A G E
		socket.on("listProject", onListProject);

		// C A P T U R E     P A G E
    socket.on("newMedia", onNewMedia);

		//STOP MOTION
		socket.on("startStopMotion", onStartStopMotion);
		socket.on("addImageToStopMotion", onAddImageToStopMotion);
		socket.on("deleteImageMotion", deleteImageMotion);

		// B I B L I        P A G E
		socket.on("listMedias", onListOneProjectMedias);
		socket.on("listOneMedia", onListOneMedia);

		socket.on("listPublis", onListOneProjectPublis);
		socket.on("newPubli", onNewPubli);
		socket.on("editPubli", onEditPubli);

		socket.on("editMediaMeta", onEditMediaMeta);
		socket.on("deleteMedia", onDeleteMedia);

		// P U B L I      P A G E
		socket.on("displayPubli", displayPubli);
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
    var eventAndContentJson = createNewFolder( folderData);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
	}

	// List all folders async (event = listOneFolder)
	// then list all projects of one folder (event =
	function onListFolders(socket){
		dev.logfunction( "EVENT - listFolder");

		fs.readdir( dodoc.contentDir, function (err, folders) {

      if (err) return console.log(err);
	    dev.log( "Number of folders in " + dodoc.contentDir + " = " + folders.length + ". Folders are " + folders);

		  folders.forEach( function( slugFolderName) {
		    if( new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugFolderName)){
          var eventAndContentJson = listOneFolder( slugFolderName);
          dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
          io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
          // parser les projets du folder
          listAllProjectsOfOneFolder( slugFolderName);
		  	}
		  });
		});
	}

	// Liste les dossiers déjà existant
  function listAllProjectsOfOneFolder( slugFolderName) {
		dev.logfunction( "EVENT — listAllProjectsOfOneFolder");
		var folderPath = getFullPath( slugFolderName);

    // list all projects
		fs.readdir( folderPath, function (err, projects) {

      if (err) return console.log(err);

	    dev.log( "- number of files and folders in " + folderPath + " = " + projects.length + ". They are " + projects);
	    var projectsProcessed = 0;
	    var allProjectsData = [];
		  projects.forEach( function( slugProjectName) {
		    if( new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugProjectName) && slugProjectName.indexOf( dodoc.deletedProjectFolderPrefix)){
          dev.log( "- - is folder : " + slugProjectName);
          var projectData = getProjectDataJSON( slugFolderName, slugProjectName);
          dev.log( "- - - projectJSON : " + JSON.stringify( projectData));
          allProjectsData.push( projectData);
        }

        projectsProcessed++;
        if( projectsProcessed === projects.length && allProjectsData.length > 0) {
          dev.log( "- - - - all Project JSON have been processed.");
          var eventAndContentJson = eventAndContent( "listAllProjectsOfOneFolder", allProjectsData);
          console.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
          io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
        }

      });
	  });
  }


	// Modifier un dossier
	function onModifyFolder( updatedFolderData){
		dev.logfunction( "EVENT - onModifyFolder with packet " + JSON.stringify( updatedFolderData, null, 4));
    var eventAndContentJson = updateFolderDataJSON( updatedFolderData);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
	}

	// Supprimer un dossier
	function onRemoveFolder(folder){
		dev.logfunction( "EVENT - onRemoveFolder");
		var slugFolderName = convertToSlug( folder.name);
    var eventAndContentJson = removeFolderNamed( slugFolderName);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
	}


// P R O J E T S     P A G E
	// Liste les projets existants

	function onListProjects( dataFolder, socket) {
		dev.logfunction( "listProjects");
    listAllProjectsOfOneFolder( dataFolder.slugFolderName);
	}

  function onNewProject( projectData) {
		dev.logfunction( "onNewProject");
    var eventAndContentJson = createNewProject( projectData);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
  }

	// Modifier un projet
	function onModifyProject( updatedProjectData) {
		dev.logfunction( "EVENT - onModifyProject with packet " + JSON.stringify( updatedProjectData, null, 4));
    var eventAndContentJson = updateProjectDataJSON( updatedProjectData);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
	}

	// Supprimer un dossier
	function onRemoveOneProject( projectData){
		dev.logfunction( "EVENT - onRemoveProject");
		var slugFolderName = projectData.slugFolderName;
		var slugProjectName = projectData.slugProjectName;
    var eventAndContentJson = removeOneProject( slugFolderName, slugProjectName);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
	}

	function removeOneProject( slugFolderName, slugProjectName) {
		dev.logfunction( "COMMON - onRemoveProject _ slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);

    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var projectPathToDeleted = getProjectPath( slugFolderName, dodoc.deletedProjectFolderPrefix + slugProjectName);
		fs.renameSync( projectPath, projectPathToDeleted);

    var projectData =
    {
      "slugFolderName" : slugFolderName,
      "slugProjectName" : slugProjectName,
    }

    return eventAndContent( "projectRemoved", projectData);
	}

// F I N     P R O J E T S     P A G E

// P R O J E T      P A G E
	function onListProject( projectData, socket){
		dev.logfunction( "onListProject");
		var slugFolderName = projectData.slugFolderName;
		var slugProjectName = projectData.slugProjectName;
    var eventAndContentJson = listOneProject( slugFolderName, slugProjectName);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
  }

  function onListOneProjectMedias( projectData, socket) {
		dev.logfunction( "listOneProjectMedias");
		var slugFolderName = projectData.slugFolderName;
		var slugProjectName = projectData.slugProjectName;
  	listAllMedias( slugFolderName, slugProjectName).then(function( mediaFolderContent) {
      var eventAndContentJson = eventAndContent( "listMediasOfOneType", mediaFolderContent);
      dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
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
    console.log( 'mediaFolderPath : ' + mediaFolderPath);

    listOneMedia( slugFolderName, slugProjectName, mediaFolderPath, mediaName).then(function( oneMediaData) {
      var eventAndContentJson = eventAndContent( "listOneMedia", oneMediaData);
      dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    }, function(error) {
      console.error("Failed to listOneMedia! Error: ", error);
    });
  }


// F I N     P R O J E T      P A G E

// C A P T U R E      P A G E

	function onNewMedia( mediaData) {
		dev.logfunction( "EVENT - onNewMedia : " + mediaData);
  	createNewMedia( mediaData).then(function( mediaMetaData) {
    	listOneMedia( mediaMetaData.slugFolderName, mediaMetaData.slugProjectName, mediaMetaData.mediaFolderPath, mediaMetaData.mediaName).then(function( oneMediaData) {
        var eventAndContentJson = eventAndContent( "mediaCreated", oneMediaData);
        dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
        io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
      }, function(error) {
        console.error("Failed to listOneMedia from create! Error: ", error);
      });
    }, function(error) {
      console.error("Failed to createNewMedia! Error: ", error);
    });
	}


	function onEditMediaMeta( editMediaData, socket) {
		dev.logfunction( "EVENT - onEditMediaMeta");
  	editMediaMeta( editMediaData).then(function( mediaMetaData) {
    	listOneMedia( mediaMetaData.slugFolderName, mediaMetaData.slugProjectName, mediaMetaData.mediaFolderPath, mediaMetaData.mediaName).then(function( oneMediaData) {
        var eventAndContentJson = eventAndContent( "mediaUpdated", oneMediaData);
        dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
        io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
      }, function(error) {
        console.error("Failed to listOneMedia from create! Error: ", error);
      });

    }, function(error) {
      console.error("Failed to edit media! Error: ", error);
    });
	}


	function onStartStopMotion( mediaData) {
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

		io.sockets.emit('stopMotionDirectoryCreated', newStopMotionData);
	}
	function onAddImageToStopMotion( imageData) {

		dev.logfunction( "onAddImageToStopMotion");

		var imageContent = imageData.imageContent;
		var imageFolder = imageData.folderCacheName;
		var folderPath = imageData.folderCachePath;
		var imageCount = imageData.imageCount;

		var imageBuffer = decodeBase64Image( imageContent);
		imagePath = folderPath + '/' + imageCount + '.png';
		fs.writeFile( imagePath, imageBuffer.data, function(err) {
			if(err){
				console.log(err);
			}
		});
  }

	// Ajoute des images au dossier du stop motion
	function onNewImageMotion(req) {
		dev.logfunction( "onNewImageMotion");
		var imageBuffer = decodeBase64Image(req.data);
		filename = req.dir + '/' + req.count + '.png';
		fs.writeFile(filename , imageBuffer.data, function(err) {
			if(err){
				console.log(err);
			}
		});
	}

	// Supprime une image du Stop Motion
	function deleteImageMotion(req){
		dev.logfunction( "deleteImageMotion");
		filename = req.dir + '/' + req.count + '.png';
		fs.unlinkSync(filename, function (err) {
	  if (err) console.log(err);
	  	console.log('successfully deleted ' + filename);
		});
	}

	// Delete File
	function onDeleteMedia( mediaData) {
		dev.logfunction( "onDeleteMedia");

		var slugFolderName = mediaData.slugFolderName;
		var slugProjectName = mediaData.slugProjectName;
		var mediaFolder = mediaData.mediaFolderPath;
		var mediaName = mediaData.mediaName;

  	deleteOneMedia( slugFolderName, slugProjectName, mediaFolder, mediaName).then(function( mediaMetaData) {
      var eventAndContentJson = eventAndContent( "mediaRemoved", mediaMetaData);
      dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    }, function(error) {
      console.error("Failed to remove one media! Error: ", error);
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
            var deletedFilePath = pathToMediaFolder + '/' + dodoc.deletedProjectFolderPrefix + filename;
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
        }
        resolve( mediaMetaData);
      } catch( err) {
        reject( err);
      }
    });
	}

// F I N     C A P T U R E    P A G E

// B I B L I    P A G E


  function onListOneProjectPublis( publiMetaData, socket) {
		dev.logfunction( "onListOneProjectPublis");
		var slugFolderName = publiMetaData.slugFolderName;
		var slugProjectName = publiMetaData.slugProjectName;
		var publiName = publiMetaData.publiName;
  	listPublis( slugFolderName, slugProjectName, publiName).then(function( publiProjectContent) {
      var eventAndContentJson = eventAndContent( "listPublications", publiProjectContent);
      dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    }, function(error) {
      console.error("Failed to list all publis! Error: ", error);
    });
  }


  function onNewPubli( publiData) {
		dev.logfunction( "onNewPubli");
  	createNewPubli( publiData).then(function( publiMetaData) {
  		var slugFolderName = publiMetaData.slugFolderName;
  		var slugProjectName = publiMetaData.slugProjectName;
  		var publiName = publiMetaData.publiName;

    	listPublis( slugFolderName, slugProjectName, publiName).then(function( publiProjectContent) {
        var eventAndContentJson = eventAndContent( "publiCreated", publiProjectContent);
        dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
        io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
      }, function(error) {
        console.error("Failed to listPublis from create! Error: ", error);
      });
    }, function(error) {
      console.error("Failed to create New Publi! Error: ", error);
    });
  }

  function onEditPubli( publiData) {
		dev.logfunction( "onEditPubli");
    editThisPubli( publiData).then(function( publiMetaData) {
  		var slugFolderName = publiMetaData.slugFolderName;
  		var slugProjectName = publiMetaData.slugProjectName;
  		var slugPubliName = publiMetaData.slugPubliName;

    	listPublis( slugFolderName, slugProjectName, slugPubliName).then(function( publiProjectContent) {
        var eventAndContentJson = eventAndContent( "publiUpdated", publiProjectContent);
        dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson, null, 4));
        io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
      }, function(error) {
        console.error("Failed to listPublis from create! Error: ", error);
      });
    }, function(error) {
      console.error("Failed to create New Publi! Error: ", error);
    });

  }


// F I N    B I B L I    P A G E

// P U B L I     P A G E
	function displayPubli(data){
    dev.logfunction( "displayPubli");
		var file = dodoc.contentDir + "/" + data.folder+"/"+data.project+'/montage/'+data.publi+'.json';
		fs.readFile(file, 'utf8', function (err, data) {
		  if (err) console.log(err);
		  var jsonObj = JSON.parse(data);
		  io.sockets.emit('sendPubliData', {name:jsonObj.name, html:jsonObj.html});
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

                                Functions that should call a socket.emit should call
                                eventAndContent() as return functions, for example :

                                  return eventAndContent( "folderCreated", objectJson);

                                See onNewFolder() and createNewFolder() for working examples.

****************************************************************************/


  function getFullPath( path) {
    return dodoc.contentDir + "/" + path;
  }
  function getCurrentDate() {
    return moment().format( dodoc.jsonDateFormat);
  }
  function eventAndContent( sendEvent, objectJson) {
    var eventContentJSON =
    {
      "socketevent" : sendEvent,
      "content" : objectJson
    };
    return eventContentJSON;
  }



/************

FOLDER METHODS

*************/

  function getJsonFileOfFolder( folderPath) {
    return folderPath + '/' + dodoc.folderJSONfilename;
  }

  function createNewFolder( folderData) {
		dev.logfunction( "COMMON — createNewFolder");

		var folderName = folderData.name;
		var slugFolderName = convertToSlug(folderName);
		var folderPath = getFullPath( slugFolderName);
		var currentDateString = getCurrentDate();

		// Vérifie si le dossier existe déjà
    try{
		  fs.accessSync( folderPath, fs.F_OK);
	  } catch(err) {

			// S'il n'existe pas -> créer le dossier et le json
    	console.log("New folder created with name " + folderName + " and path " + folderPath);
      fs.ensureDirSync(folderPath);//write new folder in folders
      var folderJSONFile = getJsonFileOfFolder( folderPath);
      var objectJson =
        {
	        "name" : folderName,
	        "created" : currentDateString,
	        "modified" : currentDateString,
	        "statut" : "en cours",
	      };

      // retourner un JSON indiquant la réussite de l'appel
      var newFolderCreated = jsonWriteToFile( folderJSONFile, objectJson, "create"); //write json File
      return eventAndContent( "folderCreated", objectJson);
		}

    // otherwise, the folder and associated json already exists --> return an error event
    console.log("WARNING - the following folder name already exists: " + slugFolderName);

    var objectJson = {
      "name": folderName,
      "timestamp": currentDateString
    };
    return eventAndContent( "folderAlreadyExist", objectJson);

  }

	function removeFolderNamed( slugFolderName) {
		dev.logfunction( "COMMON — removeFolderNamed");
		var folderPath = getFullPath( slugFolderName);
		rmDir(folderPath);
    var folderJson =
    {
      "name" : slugFolderName
    };
    return eventAndContent( "folderRemoved", folderJson);
	}

  function getFolderDataJSON( slugFolderName) {
		dev.logfunction( "COMMON — getFolderDataJSON");

    var folderPath = getFullPath( slugFolderName);
  	var folderJSONFile = getJsonFileOfFolder( folderPath);

    try {
			fs.accessSync(folderJSONFile, fs.F_OK);
	  } catch(err) {
			// If dodoc.folderJSONfilename (default is dossier.json) doesn't exist, create it. The folder has probably been created by the filesystem so let's make a placeholder JSON
			// check that that folder has a name that is already a slug
			if( slugFolderName !== convertToSlug( slugFolderName)) {
				// if it doesn't rename it
				var oldFolderPath = getFullPath( slugFolderName);
				var newFolderPath = getFullPath( convertToSlug( slugFolderName));
        fs.renameSync( oldFolderPath, newFolderPath);
        // get folderJSONFile again with the new path
        folderJSONFile = getJsonFileOfFolder( newFolderPath);
			}

  		var currentDateString = getCurrentDate();

      // if not, then
    	console.log("WARNING : " + dodoc.folderJSONfilename + " for folder " + slugFolderName + " is missing and will be created.");
      var objectJson =
        {
	        "name" : slugFolderName,
	        "created" : currentDateString,
	        "modified" : currentDateString,
	        "statut" : "en cours",
	        "informations" : "",
	      };
      var newFolderCreated = jsonWriteToFile( folderJSONFile, objectJson, "create"); //write json File
    	return objectJson;
    }

		var folderData = fs.readFileSync( folderJSONFile,dodoc.textEncoding);
		var folderJSONdata = JSON.parse(folderData);
		folderJSONdata.folderNameSlug = slugFolderName;
    return folderJSONdata;
  }

  // accepts a folderData with at least a "name" and a "folderNameSlug"
  function updateFolderDataJSON( folderData) {
		dev.logfunction( "COMMON — updateFolderDataJSON");

		var isNameChanged = folderData.newName !== undefined;

		var slugFolderName = folderData.folderNameSlug;
		var folderPath = getFullPath( slugFolderName);
    var currentDateString = getCurrentDate();
    var newStatut = folderData.statut;

    // récupérer les infos sur le folder
    var currentDataJSON = getFolderDataJSON( slugFolderName);

    // éditer le JSON récupéré
    if( isNameChanged)
      currentDataJSON.name = folderData.newName;
    if( newStatut !== undefined)
      currentDataJSON.statut = newStatut;

    currentDataJSON.modified = currentDateString;

    // envoyer les changements dans le JSON du folder
    var folderJSONFile = getJsonFileOfFolder( folderPath);
    var folderUpdatedStatus = jsonWriteToFile( folderJSONFile, currentDataJSON, "update"); //write json File
    return eventAndContent( "folderModified", currentDataJSON);


    // is the folder name changed ? we need to check whether the slug needs to change too
    // for now, let's not change the folder name (because multi-user connection would mean one user would crash the other's media capture and navigation
    if( isNameChanged && slugFolderName !== newSlugFolderName) {
		  //console.log( "The folder named " + slugFolderName + " has been renamed to " + newSlugFolderName + ".");
    }

/*
    // regarder si on a affaire à un renommage

              		    	if(oldFormatFolderName != newFormatFolderName){
              		    		console.log("le dossier existe déjà !");
              		      	io.sockets.emit("folderAlreadyExist", {name: newFolder, timestamp: currentDate });
              		    	}
              		    	else{
              		    		fs.renameSync(oldFolderPath, newFolderPath); // renomme le dossier
              		      	fs.renameSync(newFolderPath + '/' + oldFormatFolderName + '.json', newFolderPath + '/' + newFormatFolderName + '.json'); //renomme le json
              		      	changeJsonFile(newFolderPath + '/' + newFormatFolderName + '.json');
              		    	}
              		    }
              			});

              			function updateJSONFile(file){
                  		dev.logfunction( "changeJsonFile");
              				var jsonContent = fs.readFileSync(file,dodoc.textEncoding);
              				var jsonObj = JSON.parse(jsonContent);
              				jsonObj.name = folder.name;
              				jsonObj.modified = currentDate;
              				jsonObj.statut = newStatut;
              				var jsonString = JSON.stringify(jsonObj, null, 4);
              				fs.writeFileSync(file, jsonString);
              				console.log("Dossier modifié");
              				io.sockets.emit("folderModified", {name: folder.name, created: jsonObj.created, modified:currentDate, statut:newStatut, nb_projets:jsonObj.nb_projets});
              			}


    // renommer le dossier, si besoin

    fs.renameSync( folderPath, newFolderPath); // renomme le dossier
*/

  }

  function listOneFolder( slugFolderName) {
		dev.logfunction( "COMMON — listOneFolder for folder slug-named " + slugFolderName);
  	var folderJSON = getFolderDataJSON( slugFolderName);
    return eventAndContent( "listOneFolder", folderJSON);
  }

/************

PROJECT METHODS

*************/

  function getProjectPath( slugFolderName, slugProjectName) {
    return getFullPath( slugFolderName + '/' + slugProjectName);
  }

  function getJsonFileOfProject( projectPath) {
    console.log( 'projectPath : ' + projectPath + ' dodoc.projectJSONfilename : ' + dodoc.projectJSONfilename);
    return projectPath + '/' + dodoc.projectJSONfilename;
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

  function getProjectDataJSON( slugFolderName, slugProjectName) {

    console.log( "slugFolderName : " + slugFolderName + " slugProjectName : " + slugProjectName);

    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var projectJSONFile = getJsonFileOfProject( projectPath);

		var projectData = fs.readFileSync( projectJSONFile, dodoc.textEncoding);
		var projectJSONdata = JSON.parse(projectData);

    projectJSONdata.slugFolderName = slugFolderName;
    projectJSONdata.slugProjectName = slugProjectName;
    projectJSONdata.projectPreviewName = getProjectPreview( projectPath);

    return projectJSONdata;
  }

  function createNewProject( projectData) {
		dev.logfunction( "COMMON — createNewProject");

		var projectName = projectData.name;
		var slugProjectName = convertToSlug( projectName);
		var slugFolderName = projectData.folder;

    var projectPath = getProjectPath( slugFolderName, slugProjectName);

		var currentDateString = getCurrentDate();

		// Vérifie si le projet existe déjà
    try {
		  fs.accessSync( projectPath, fs.F_OK);
	  } catch(err) {

			// S'il n'existe pas -> créer le dossier du projet et le json
    	console.log("New project created with name " + projectName + " and path " + projectPath);
      fs.ensureDirSync(projectPath);//new project

      var mediaFolders = getAllMediasFoldersPathAsArray();
      mediaFolders.forEach( function( mediaFolder) {
	      fs.ensureDirSync( projectPath + '/' + mediaFolder);//write new folder in folders
      });
      var publiFolder = getPubliPathOfProject();
      fs.ensureDirSync( projectPath + '/' + publiFolder);//write new folder in folders
      var projectJSONFile = getJsonFileOfProject( projectPath);
      var newProjectData =
        {
	        "name" : projectName,
	        "created" : currentDateString,
	        "modified" : currentDateString,
	        "statut" : "en cours",
	        "informations" : 0
	      };

      // retourner un JSON indiquant la réussite de l'appel
      var newProjectCreated = jsonWriteToFile( projectJSONFile, newProjectData, "create"); //write json File
      newProjectData.slugProjectName = slugProjectName;
      newProjectData.slugFolderName = slugFolderName;
      return eventAndContent( "projectCreated", newProjectData);
		}

    // otherwise, the folder and associated json already exists --> return an error event
    console.log("WARNING - the following project name already exists: " + slugProjectName);

    var newProjectData = {
      "slugFolderName": slugFolderName,
      "slugProjectName": slugProjectName,
      "projectName" : projectName,
      "timestamp": currentDateString
    };
    return eventAndContent( "projectAlreadyExist", newProjectData);
  }

  function getProjectPreview( projectPath) {

    dev.log( "detecting preview");
    // looking for an image whose name starts with apercu or preview in the project folder
    var filesInProjectFolder = fs.readdirSync( projectPath);
    var previewName = false;

    dev.log( "- match apercu/preview in array : " + filesInProjectFolder);
    filesInProjectFolder.forEach( function( filename) {
      if( new RegExp( dodoc.regexpMatchProjectPreviewNames, 'i').test(filename)) {
        previewName = filename;
        dev.log( "- - match preview called " + previewName);
      }
    });
    dev.log( "- final filename ? " + previewName);
    return previewName;

  }

  // accepts a folderData with at least a "foldername", a "slugFolderName", a "projectname" and a "slugProjectName"
  function updateProjectDataJSON( projectData) {
		dev.logfunction( "COMMON — updateProjectDataJSON : " + JSON.stringify( projectData, null, 4));


		var projectName = projectData.name;

		var slugProjectName = projectData.slugProjectName;
		var slugFolderName = projectData.slugFolderName;
		var projectPath = getProjectPath( slugFolderName, slugProjectName);

    var currentDateString = getCurrentDate();

    // récupérer les infos sur le project
    var currentDataJSON = getProjectDataJSON( slugFolderName, slugProjectName);

    if( projectData.imageData !== undefined) {
      addImage( "apercu", projectPath, projectData.imageData);
    }

    // éditer le JSON récupéré
    currentDataJSON.name = projectData.name;
    if( projectData.statut !== undefined)
      currentDataJSON.statut = projectData.statut;

    currentDataJSON.modified = currentDateString;

    // envoyer les changements dans le JSON du folder
    var projectJSONFile = getJsonFileOfProject( projectPath);
    var projectUpdatedStatus = jsonWriteToFile( projectJSONFile, currentDataJSON, "update"); //write json File
    return eventAndContent( "projectModified", currentDataJSON);

  }

  function listOneProject( slugFolderName, slugProjectName) {
    var projectData = getProjectDataJSON( slugFolderName, slugProjectName);
    return eventAndContent( "listOneProject", projectData);
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

  function findFirstJSONFilenameNotTaken( fileName, path) {
    var newFileName = fileName;
    var fileext = '.json';
    try {
      var index = 0;
      var newPathToFile = path + '/' + newFileName;
      while( !fs.accessSync( newPathToFile + fileext, fs.F_OK)){
        dev.log("- - following path is already taken : " + newPathToFile);
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
  		  mediaFolderContent.push( listMediasOfOneType( slugFolderName, slugProjectName, mediasFolderPath));
      });
      resolve( mediaFolderContent);
    });
  }

  function listOneMedia( slugFolderName, slugProjectName, singleMediaFolderPath, mediaName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — listOneMedia : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " singleMediaFolderPath = " + singleMediaFolderPath + " mediaName = " + mediaName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var mediaFolderContent = [];
  	  mediaFolderContent.push( listMediasOfOneType( slugFolderName, slugProjectName, singleMediaFolderPath, mediaName));
      resolve( mediaFolderContent);
    });
  }

  function listMediasOfOneType( slugFolderName, slugProjectName, mediasFolderPath, mediaName) {
		dev.logfunction( "COMMON — listMediasOfOneType");

    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var mediasPath = projectPath + '/' + mediasFolderPath;
    var lookingForSpecificJson = mediaName !== undefined ? true : false;

    var filesInMediaFolder = fs.readdirSync( mediasPath);
    var foldersMediasMeta = [];
    var foldersMediasFiles = [];

//     dev.log( "- looking for files in " + mediasPath);

    filesInMediaFolder.forEach( function( filename) {
      if( !new RegExp( dodoc.regexpMatchFolderNames, 'i').test( filename) && filename !== ".DS_Store") {
        var fileExtension = new RegExp( dodoc.regexpGetFileExtension, 'i').exec( filename);
//         dev.log( "- - fileEXTENSION of " + filename + " is " + fileExtension);
//         dev.log( "- - Is file a deleted file ? " + new RegExp( '^' + dodoc.deletedProjectFolderPrefix).test( filename));
        // match only json that are not deleted (prefixed with a custom prefix
        if( fileExtension == ".json" && !new RegExp( '^' + dodoc.deletedProjectFolderPrefix).test( filename)) {
          if( !lookingForSpecificJson)
  				  foldersMediasMeta.push( filename);
  				else if( filename == mediaName + ".json") {
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
    console.log( "- foldersMediasMeta : " + JSON.stringify( foldersMediasMeta, null, 4));

    for (var i=0; i<foldersMediasMeta.length; i++) {
      var mediaMetaFilename = foldersMediasMeta[i];
      var fileNameWithoutExtension = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( mediaMetaFilename)[1];
//       dev.log( "- looking for medias filenames that start with " + fileNameWithoutExtension);
      for (var j=0; j< foldersMediasFiles.length; j++) {
        var mediaFilename = foldersMediasFiles[j];
//         dev.log( "- comparing to " + mediaFilename);
        if ( mediaFilename.indexOf( fileNameWithoutExtension) !== -1) {
          if( !folderMediaMetaAndFileName.hasOwnProperty( mediaMetaFilename)) {
            folderMediaMetaAndFileName[mediaMetaFilename] = new Object();
            // read JSON file and add the content to the folder
            var mediaMetaData = getMediaDataJSON( projectPath, mediasFolderPath, fileNameWithoutExtension);
            mediaMetaData.mediaFolderPath = mediasFolderPath;
            mediaMetaData.mediaName = fileNameWithoutExtension;
            mediaMetaData.slugFolderName = slugFolderName;
            mediaMetaData.slugProjectName = slugProjectName;

            // if the file is a text, then also add the content of the TXT in the answer
            if( new RegExp( dodoc.regexpGetFileExtension, 'i').exec( mediaFilename) == '.md') {
              mediaMetaData = merge( mediaMetaData, getTextMediaContentToJsonObj( projectPath + '/' + mediasFolderPath + '/' + mediaFilename));
            }
            folderMediaMetaAndFileName[mediaMetaFilename] = mediaMetaData;
          }
          if( !folderMediaMetaAndFileName[mediaMetaFilename].hasOwnProperty( "files")) {
            folderMediaMetaAndFileName[mediaMetaFilename]["files"] = new Array();
          }
          folderMediaMetaAndFileName[mediaMetaFilename]["files"].push( mediaFilename);

        }
      }
    }
    return folderMediaMetaAndFileName;

  }


  function getMediaDataJSON( projectPath, mediaFolderPath, mediaName) {
		dev.logfunction( "COMMON — getMediaDataJSON : projectPath = " + projectPath + " mediaFolderPath = " + mediaFolderPath + " mediaName = " + mediaName);

    var mediaJSONFilepath = getPathToMedia( projectPath, mediaFolderPath, mediaName) + '.json';
		var mediaData = fs.readFileSync( mediaJSONFilepath, dodoc.textEncoding);
		var mediaMetaData = JSON.parse( mediaData);

    return mediaMetaData;
  }

  function createNewMedia( newMediaData) {

    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON - createNewMedia : " + newMediaData);

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
          newFileName = findFirstJSONFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.jpg';
          var dataMedia = newMediaData.mediaData;
          var imageBuffer = decodeBase64Image( dataMedia);

          console.log("promise before");

          fs.writeFileSync( pathToFile + fileExtension, imageBuffer.data);

					console.log("Image added at path " + pathToFile);

          mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension, newFileName);
          mediaMetaData.slugFolderName = slugFolderName;
          mediaMetaData.slugProjectName = slugProjectName;
          mediaMetaData.mediaFolderPath = mediaFolder;

      		resolve( mediaMetaData);

          break;
        case 'video':
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;

          newFileName = findFirstJSONFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;
          fileExtension = '.webm';

          var dataMedia = newMediaData.mediaData;
          writeToDisk2( pathToFile, fileExtension, dataMedia);

          mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension, newFileName);
          mediaMetaData.slugFolderName = slugFolderName;
          mediaMetaData.slugProjectName = slugProjectName;
          mediaMetaData.mediaFolderPath = mediaFolder;

          createThumbnails( pathToFile + fileExtension, newFileName, mediaPath)
            .then(function( mediaFolderContent) {
              resolve( mediaMetaData);
            }, function(error) {
              console.error("Failed to make a thumbnail one media! Error: ", error);
              resolve( mediaMetaData);
            });

          break;
        case 'animation':
          // get the path to the mediaFolder
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;

          // get the path to the cache folder and the mp4 (it's the same without the extension)
          // WARNING : animation doesn't use newFileName, it already has a filename to use (generated at the beginning of a stopmotion capture)
          newFileName = newMediaData.stopMotionCacheFolder;
          pathToFile = mediaPath + '/' + newFileName;
          fileExtension = '.mp4';


          // ask ffmpeg to make a video from the cache images
          var proc = new ffmpeg({ "source" : pathToFile + '/%d.png'})
            // using 12 fps
            .withFpsInput(4)
            .fps(4)
            // setup event handlers
            .on('end', function() {
              console.log('file has been converted succesfully');

              mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension, newFileName);
              mediaMetaData.slugFolderName = slugFolderName;
              mediaMetaData.slugProjectName = slugProjectName;
              mediaMetaData.mediaFolderPath = mediaFolder;

              createThumbnails( pathToFile + fileExtension, newFileName, mediaPath)
                .then(function( mediaFolderContent) {
                  resolve( mediaMetaData);
                }, function(error) {
                  console.error("Failed to make a thumbnail one media! Error: ", error);
                  resolve( mediaMetaData);
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
          newFileName = findFirstJSONFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.wav';
          var dataMedia = newMediaData.mediaData.split(',').pop();
          var imageBuffer = new Buffer( dataMedia, 'base64');

          fs.writeFileSync( pathToFile + fileExtension, imageBuffer);

          mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension, newFileName);
          mediaMetaData.slugFolderName = slugFolderName;
          mediaMetaData.slugProjectName = slugProjectName;
          mediaMetaData.mediaFolderPath = mediaFolder;

      		resolve( mediaMetaData);

          break;
        case 'text':
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;
          newFileName = findFirstJSONFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.md';
          var dataTitle = newMediaData.title;
          var dataText = newMediaData.text;

          var textContent = makeTextMedia( dataTitle, dataText);
          console.log( "Creating a new text media at path " + pathToFile + fileExtension + " with content \n" + textContent);

          fs.writeFileSync( pathToFile + fileExtension, textContent);

          mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension, newFileName);
          mediaMetaData.contentOfText = textContent;
          mediaMetaData.slugFolderName = slugFolderName;
          mediaMetaData.slugProjectName = slugProjectName;
          mediaMetaData.mediaFolderPath = mediaFolder;

      		resolve( mediaMetaData);

          break;
      // end of switch
      }
    // end of promise
    });
  }

  function makeTextMedia( dataTitle, dataText) {
    return dataTitle + dodoc.textFieldSeparator + dataText;
  }


  function createMediaJSON( newMediaType, pathToFile, fileExtension, fileName) {
    var mediaMetaData = {};
    mediaMetaData['created'] = getCurrentDate();
    mediaMetaData['modified'] = getCurrentDate();
    mediaMetaData['informations'] = '';
    mediaMetaData['type'] = newMediaType;
    mediaMetaData['fav'] = false;

    // generate a json file next to the file
    var pathToJSONFile = pathToFile + '.json';
		var status = jsonWriteToFile( pathToJSONFile, mediaMetaData, "update");

    // only add to the response JSON
    // no need for this in the JSON file since it is recreated on send
    mediaMetaData.mediaName = fileName;

		return mediaMetaData;
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
      var mediaMetaData = getMediaDataJSON( projectPath, mediaFolderPath, mediaName);

      // switch the fav state
      if( editMediaData.switchFav !== undefined)
        mediaMetaData.fav = !mediaMetaData.fav;

      if( editMediaData.informations !== undefined)
        mediaMetaData.informations = editMediaData.informations;

      // if this is a text media, also update its content
      mediaMetaData.modified = getCurrentDate();

  		var status = jsonWriteToFile( mediaFilepath + '.json', mediaMetaData, "update");

      if( mediaFolderPath === dodoc.projectTextsFoldername && editMediaData.titleOfTextmediaMd !== undefined && editMediaData.textOfTextmediaMd) {
        var contentOfText = updateTextMediaContent( mediaFilepath + '.md', editMediaData.titleOfTextmediaMd, editMediaData.textOfTextmediaMd);
        mediaMetaData.contentOfText = contentOfText;
        mediaMetaData = merge( mediaMetaData, getTextMediaContentToJsonObj( mediaFilepath + '.md'));
      }

      // for updating the result
      mediaMetaData.mediaName = mediaName;
      mediaMetaData.mediaFolderPath = mediaFolderPath;
  		mediaMetaData.slugFolderName = slugFolderName;
  		mediaMetaData.slugProjectName = slugProjectName;

      resolve( mediaMetaData);

    });
  }

  function updateTextMediaContent( pathToTextMedia, titleOfTextmediaMd, textOfTextmediaMd) {
    var contentOfText = makeTextMedia( titleOfTextmediaMd, textOfTextmediaMd);
    fs.writeFileSync( pathToTextMedia, contentOfText);
    return contentOfText;
  }

  function getTextMediaContentToJsonObj( pathToTextMedia) {
    var mediaMetaData = {};
    var contentOfMediaText = fs.readFileSync( pathToTextMedia, dodoc.textEncoding);
    var textContent = contentOfMediaText.split( dodoc.textFieldSeparator);
    mediaMetaData.titleOfTextmedia = mm.parse( textContent[0]).content;
    mediaMetaData.textOfTextmedia = mm.parse( textContent[1]).content;
    mediaMetaData.titleOfTextmediaMd = mm.parse( textContent[0]).markdown;
    mediaMetaData.textOfTextmediaMd = mm.parse( textContent[1]).markdown;
    return mediaMetaData;
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

  function getPubliDataJSON( slugFolderName, slugProjectName, pslug) {
    var pathToPubli = getPathToPubli( slugFolderName, slugProjectName, pslug);
    var publiJSONFilepath = pathToPubli + '.json';
		var publiData = fs.readFileSync( publiJSONFilepath, dodoc.textEncoding);
		var publiMetaData = JSON.parse( publiData);
    return publiMetaData;
  }


  function createNewPubli( publiData) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — createNewPubli : " + JSON.stringify(publiData, null, 4));

  		var currentDateString = getCurrentDate();

  		var pname = publiData.name;
  		var pslug = convertToSlug( pname);

  		var slugFolderName = publiData.slugFolderName;
  		var slugProjectName = publiData.slugProjectName;

      var pathToThisPubliFolder = getPathToPubli( slugFolderName, slugProjectName);
      var newFileName = findFirstJSONFilenameNotTaken( pslug, pathToThisPubliFolder);

      var pathToThisPubli = getPathToPubli( slugFolderName, slugProjectName, newFileName) + '.json';

    	console.log("New publi created with name " + pname + " and path " + pathToThisPubli);

      var newPubliData =
        {
	        "name" : pname,
	        "created" : currentDateString,
	        "modified" : currentDateString,
	        "informations" : "",
	        "medias" : [{}],
	      };

      // retourner un JSON indiquant la réussite de l'appel
      var newPubliCreated = jsonWriteToFile( pathToThisPubli, newPubliData, "create"); //write json File

      newPubliData.slugProjectName = slugProjectName;
      newPubliData.slugFolderName = slugFolderName;
      newPubliData.publiName = newFileName;

      resolve( newPubliData);
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
  //         dev.log( "- - fileEXTENSION of " + filename + " is " + fileExtension);
  //         dev.log( "- - Is file a deleted file ? " + new RegExp( '^' + dodoc.deletedProjectFolderPrefix).test( filename));
          // match only json that are not deleted (prefixed with a custom prefix
          if( fileExtension == ".json" && !new RegExp( '^' + dodoc.deletedProjectFolderPrefix).test( filename)) {
            if( !lookingForSpecificJson)
    				  foldersPublisMeta.push( filename);
    				else if( filename == thisPubliName + ".json") {
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
        var publiName = new RegExp( dodoc.regexpRemoveFileExtension, 'i').exec( publiFilename)[1];

        if( !folderPubliMeta.hasOwnProperty( publiName)) {
          folderPubliMeta[publiName] = new Object();
          // read JSON file and add the content to the folder
          var publiMetaData = getPubliDataJSON( slugFolderName, slugProjectName, publiName);
          publiMetaData.publiName = publiName;
          publiMetaData.slugFolderName = slugFolderName;
          publiMetaData.slugProjectName = slugProjectName;
          publiMetaData.pathToPubli = getPathToPubli( slugFolderName, slugProjectName, publiName);

          folderPubliMeta[publiName] = publiMetaData;
        }
      }
      resolve( folderPubliMeta);
    });
  }


  function editThisPubli( updatedPubliData) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — editThisPubli : publiData = " + JSON.stringify( updatedPubliData, null, 4));

      var slugFolderName = updatedPubliData.slugFolderName;
      var slugProjectName = updatedPubliData.slugProjectName;
      var slugPubliName = updatedPubliData.slugPubliName;
      var pathToPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName);
      var publiJSONFilepath = pathToPubli + '.json';


      // get and parse publi json data
      var publiMetaData = getPubliDataJSON( slugFolderName, slugProjectName, slugPubliName);

      // update modified date
      publiMetaData.modified = getCurrentDate();

      // update title if updatedPubliData has newPubliName
      if( updatedPubliData.newPubliName !== undefined)
        publiMetaData.name = newPubliName;

      // update medias if updatedPubliData has medias
      if( updatedPubliData.medias !== undefined)
        publiMetaData.medias = updatedPubliData.medias;

  		var status = jsonWriteToFile( publiJSONFilepath, publiMetaData, "update");

      publiMetaData.slugPubliName = slugPubliName;
      publiMetaData.slugFolderName = slugFolderName;
      publiMetaData.slugProjectName = slugProjectName;
      publiMetaData.pathToPubli = getPathToPubli( slugFolderName, slugProjectName, slugPubliName);

      resolve( publiMetaData);
    });
  }



/************

*************/



	function writeToDisk(dataURL, fileName, folder, projet) {
    var fileExtension = fileName.split('.').pop(),
        fileRootNameWithBase = './' + dodoc.contentDir + "/" + folder + '/' + projet + '/' + fileName,
        filePath = fileRootNameWithBase,
        fileID = 2,
        fileBuffer;

    // @todo return the new filename to client
    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer(dataURL, 'base64');
    fs.writeFileSync(filePath, fileBuffer);
	}

	function writeToDisk2( filePath, fileExtension, dataURL) {
    var fileRootNameWithBase = './' + filePath,
        filePath = fileRootNameWithBase,
        fileID = 2,
        fileBuffer;

    // @todo return the new filename to client
    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    dataURL = dataURL.split(',').pop();
    fileBuffer = new Buffer(dataURL, 'base64');
    fs.writeFileSync(filePath + fileExtension, fileBuffer);
	}


  // new write json function that writes in json and returns true or false depending on success
  function jsonWriteToFile( jsonFile, objectJson, sendEvent) {
		var jsonString = JSON.stringify( objectJson, null, 4);
		if( sendEvent === "create") {
  		try {
  			fs.appendFileSync( jsonFile, jsonString);
        console.log("Success for event : " + sendEvent);
        return true;
  		} catch(err) {
        console.log(err);
        return false;
      }
    }
    else if( sendEvent === "update") {
      console.log("Success for event : " + sendEvent);
      fs.writeFileSync(jsonFile, jsonString);
      return true;
	  }
  }

	function addImage( imageNameSlug, parentPath, imageData){
		var filePath = parentPath + "/" + imageNameSlug + ".jpg";
		var imageBuffer = decodeBase64Image( imageData);
		fs.writeFile(filePath, imageBuffer.data, function (err) {
    	console.info("write new file to " + filePath);
		});
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

	//Décode les images en base64
	// http://stackoverflow.com/a/20272545
	function decodeBase64Image(dataString) {
		var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};

		if (matches.length !== 3) {
			return new Error('Invalid input string');
		}

		response.type = matches[1];
		response.data = new Buffer(matches[2], 'base64');

		return response;
	}

	function convertToSlug(Text){
	  // converti le texte en minuscule
		var s = Text.toLowerCase();
		// remplace les a accentué
		s = s.replace(/[àâäáã]/g, 'a');
		// remplace les e accentué
		s = s.replace(/[èêëé]/g, 'e');
		// remplace les i accentué
		s = s.replace(/[ìîïí]/g, 'i');
		// remplace les u accentué
		s = s.replace(/[ùûüú]/g, 'u');
		// remplace les o accentué
		s = s.replace(/[òôöó]/g, 'o');
		// remplace le c cédille
		s = s.replace(/[ç]/g, 'c');
		// remplace le ene tilde espagnol
		s = s.replace(/[ñ]/g, 'n');
		// remplace tous les caractères qui ne sont pas alphanumérique en tiret
		s = s.replace(/\W/g, '-');
		// remplace les double tirets en tiret unique
		s = s.replace(/\-+/g, '-');
		// renvoi le texte modifié
		return s;
	}

	// Remove all files and directory
	rmDir = function(dirPath, removeSelf) {
      if (removeSelf === undefined)
        removeSelf = true;
      try { var files = fs.readdirSync(dirPath); }
      catch(e) { return; }
      if (files.length > 0)
        for (var i = 0; i < files.length; i++) {
          var filePath = dirPath + '/' + files[i];
          if (fs.statSync(filePath).isFile())
            fs.unlinkSync(filePath);
          else
            rmDir(filePath);
        }
      if (removeSelf)
        fs.rmdirSync(dirPath);
    };
}