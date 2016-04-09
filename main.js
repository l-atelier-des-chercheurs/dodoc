var fs = require('fs-extra'),
	glob = require("glob"),
	path = require("path"),
	gm = require('gm'),
	markdown = require( "markdown" ).markdown,
	moment = require( "moment" ),
	exec = require('child_process').exec,
	phantom = require('phantom'),
	ffmpeg = require('fluent-ffmpeg'),
	sprintf = require("sprintf-js").sprintf,
	vsprintf = require("sprintf-js").vsprintf,
	flags = require('flags')
;
var dodoc  = require('./public/dodoc');

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
		socket.on("removeProject", onRemoveProject);

		// P R O J E T      P A G E
		socket.on("listProject", onListProject);

		// C A P T U R E     P A G E
/*
		socket.on("newImage", onNewImage);
		socket.on("newVideo", onNewVideo);
*/
    socket.on("newMedia", onNewMedia);
		//STOP MOTION
		socket.on("startStopMotion", onStartStopMotion);
		socket.on("addImageToStopMotion", onAddImageToStopMotion);
// 		socket.on("finishStopMotion", onNewMedia); // the finishing event of a stopMotion calls newMedia

		socket.on("deleteImageMotion", deleteImageMotion);
		// Audio
// 		socket.on("audioCapture", onNewAudioCapture);
		socket.on("deleteFile", deleteFile);

		// B I B L I        P A G E
		socket.on("listMedias", onListOneProjectMedias);
		socket.on("listOneMedia", onListOneMedia);

// 		socket.on("readTxt", readTxt);

		socket.on("listPubli", function(data){
			listPubli(data, socket);
		});
		socket.on("createPubli", newPublication);
		socket.on("displayThisMontage", displayMontage);
		socket.on("saveMontage", saveMontage);
		socket.on("titleChanged", onTitleChanged);
// 		socket.on("addText", onNewText);
		socket.on("modifyText", onModifiedText);
// 		socket.on("newImageLocal", onNewImage);
		socket.on("addMediaData", onMediaLegende);

		socket.on("editMedia", onEditMedia);

		socket.on("deleteFileBibli", onDeleteFileBibli);

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
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
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
		    if( dodoc.regexpMatchFolderNames.test( slugFolderName)){
          var eventAndContentJson = listOneFolder( slugFolderName);
          dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
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

        dev.log("- - processing " + slugProjectName);
        dev.log( "is folder ? " + dodoc.regexpMatchFolderNames.test( slugProjectName));

		    if( dodoc.regexpMatchFolderNames.test( slugProjectName)){
          dev.log( "- - is folder : " + slugProjectName);

          var projectData = getProjectDataJSON( slugFolderName, slugProjectName);
          dev.log( "- - - projectJSON : " + JSON.stringify( projectData));
          allProjectsData.push( projectData);

        }

        projectsProcessed++;
        if( projectsProcessed === projects.length && allProjectsData.length > 0) {
          dev.log( "- - - - all Project JSON have been processed.");
          var eventAndContentJson = eventAndContent( "listAllProjectsOfOneFolder", allProjectsData);
          console.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
          io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
        }

      });
	  });
  }


	// Modifier un dossier
	function onModifyFolder( updatedFolderData){
		dev.logfunction( "EVENT - onModifyFolder with packet " + JSON.stringify( updatedFolderData, null, 4));
    var eventAndContentJson = updateFolderDataJSON( updatedFolderData);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
	}

	// Supprimer un dossier
	function onRemoveFolder(folder){
		dev.logfunction( "EVENT - onRemoveFolder");
		var slugFolderName = convertToSlug( folder.name);
    var eventAndContentJson = removeFolderNamed( slugFolderName);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
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
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
  }

	// Modifier un projet
	function onModifyProject( updatedProjectData) {
		dev.logfunction( "EVENT - onModifyProject with packet " + JSON.stringify( updatedProjectData, null, 4));
    var eventAndContentJson = updateProjectDataJSON( updatedProjectData);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
	}

	// Supprimer un dossier
	function onRemoveProject(project){
		dev.logfunction( "onRemoveProject");
		console.log(project);
		var folder = project.folder;
		var projectName = convertToSlug(project.name);
		var projectPath = dodoc.contentDir + "/" +folder + '/' + projectName;
		rmDir(projectPath);
		io.sockets.emit('folderRemoved');
	}

// F I N     P R O J E T S     P A G E

// P R O J E T      P A G E
	function onListProject( projectData, socket){
		dev.logfunction( "onListProject");
		var slugFolderName = projectData.slugFolderName;
		var slugProjectName = projectData.slugProjectName;
    var eventAndContentJson = listOneProject( slugFolderName, slugProjectName);
    dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
    io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);

    onListOneProjectMedias( projectData, socket);
    onListOneProjectPublis( projectData, socket);
  }

  function onListOneProjectMedias( projectData, socket) {
		dev.logfunction( "listOneProjectMedias");
		var slugFolderName = projectData.slugFolderName;
		var slugProjectName = projectData.slugProjectName;

  	listAllMedias( slugFolderName, slugProjectName).then(function( mediaFolderContent) {
      var eventAndContentJson = eventAndContent( "listMediasOfOneType", mediaFolderContent);
      dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    }, function(error) {
      console.error("Failed to createNewMedia! Error: ", error);
    });
  }


  function onListOneMedia( projectData, socket) {

		var slugFolderName = projectData.slugFolderName;
		var slugProjectName = projectData.slugProjectName;
		var mediaFolderPath = projectData.mediaFolderPath;
		var specificMediaJsonName = projectData.specificMediaJsonName;

    listOneMedia( slugFolderName, slugProjectName, mediaFolderPath, specificMediaJsonName).then(function( oneMediaData) {
      var eventAndContentJson = eventAndContent( "listOneMedia", oneMediaData);
      dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    }, function(error) {
      console.error("Failed to createNewMedia! Error: ", error);
    });
  }


  function onListOneProjectPublis( projectData, socket) {

  }

// F I N     P R O J E T      P A G E

// C A P T U R E      P A G E

	function onNewMedia( mediaData) {
		dev.logfunction( "EVENT - onNewMedia : " + mediaData);
  	createNewMedia( mediaData).then(function( mediaMetaData) {
      var eventAndContentJson = eventAndContent( "mediaCreated", mediaMetaData);
      dev.log( "eventAndContentJson " + JSON.stringify( eventAndContentJson), null, 4);
      io.sockets.emit( eventAndContentJson["socketevent"], eventAndContentJson["content"]);
    }, function(error) {
      console.error("Failed to createNewMedia! Error: ", error);
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

		io.sockets.emit('stopMotionDirectyCreated', newStopMotionData);
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
	function onDeleteFileBibli(req){
		dev.logfunction( "onDeleteFileBibli");
		var fileToDelete = dodoc.contentDir + "/" + req.folder +'/'+req.project+'/'+req.file;
		var extension = req.file.split('.').pop();
		var identifiant =  req.id;
		var thumbToDelete = dodoc.contentDir + "/" + req.folder +'/'+req.project+'/'+identifiant + '-thumb.png';
		console.log('delete file', fileToDelete);
		fs.unlink(fileToDelete, function(err){
			if(err) return console.log(err);
			else{
				io.sockets.emit("bibliFileDeleted", {id:req.id, type:req.type, })
			}
		});
		fs.access(thumbToDelete, fs.F_OK, function(err) {
	    if (!err) {
	    	console.log('thumb deleted');
	      fs.unlink(thumbToDelete);
	    } else {
	        // It isn't accessible
	    }
		});
	}
// F I N     C A P T U R E    P A G E

// B I B L I    P A G E


/*
	function readTxt(txt){
		dev.logfunction( "readTxt");
		var dir = dodoc.contentDir + "/" + txt.folder + '/' + txt.project +'/';
		fs.readFile(dir + txt.file.file, 'utf8', function(err, data) {
		  if (err)
		    console.log( err);
		  else
			  io.sockets.emit('txtRead', {obj:txt.file, content: markdown.toHTML(data)});
		});
	}
*/


	function onEditMedia( editMediaData, socket) {
		dev.logfunction( "EVENT - onEditMedia");
  	editMedia( editMediaData).then(function( mediaMetaData) {
    	onListOneMedia( mediaMetaData, socket)
    }, function(error) {
      console.error("Failed to edit media! Error: ", error);
    });
	}




	function listPubli(data, socket){
		dev.logfunction( "listPubli");
		var dir = dodoc.contentDir + "/" + data.folder+"/"+data.project+'/montage';
		// Vérifie si le dossier existe déjà
		fs.access(dir, fs.F_OK, function(err) {
	    if (err) { }
	    // S'il existe
	    else {
		    fs.readdir(dir, function(err, files) {
				  if (err) console.log(err);
			    files.forEach(function(file) {
			    	//console.log('Files: ' + file);
			    	if(file == ".DS_Store"){
		    			fs.unlink(dir+'/'+file);
		    		}
		    		if(! /^\..*/.test(file)){
			  			var jsonFile = dir +'/' +file;
							var data = fs.readFileSync(jsonFile,"UTF-8");
							var jsonObj = JSON.parse(data);
							socket.emit('listPublications', {name:jsonObj.name, created:jsonObj.created});
			    	}
			    });
				});
	    }
		});
	}


	function newPublication(publi){
		dev.logfunction( "newPublication");
		var folderName = publi.name;
		var formatFolderName = convertToSlug(folderName);
		var montagePath = dodoc.contentDir + "/" + publi.folder+'/'+publi.project+'/montage';
		var publiPath = dodoc.contentDir + "/" + publi.folder+'/'+publi.project+'/montage/' + formatFolderName + '.json';
		var currentDate = Date.now();

		// Vérifie si le dossier existe déjà
		fs.access(montagePath, fs.F_OK, function(err) {
			// S'il n'existe pas -> créer le dossier et le json
	    if (err) {
	      fs.ensureDirSync(montagePath,function(){
	      	console.log("dossier montage crée");
					createPubliJson();
	      });

	    }
	    // S'il existe
	    else {
	      console.log("le dossier existe déjà !");
	      createPubliJson();
	    }
		});

		function createPubliJson(){
			fs.access(publiPath, fs.F_OK, function(err) {
				// Si le nom de la publication n'existe pas déjà
				if(err){
					var objectJson = {"name":folderName, "created":currentDate, "html":"none"};
	      	writeJsonFile(publiPath, objectJson, "publiCreated"); //write json File
				}
				// S'il existe envoyer une erreur
				else{
					io.sockets.emit("folderAlreadyExist", {name: folderName, timestamp: currentDate });
				}
			});
		}
	}

	function displayMontage(data){
		dev.logfunction( "displayMontage");
		var file = dodoc.contentDir + "/" + data.folder+"/"+data.project+'/montage/'+data.name+'.json';
		console.log(file);
		fs.readFile(file, 'utf8', function (err, data) {
		  if (err) console.log(err);
		  var jsonObj = JSON.parse(data);
		  io.sockets.emit('displayMontage', {name:jsonObj.name, html:jsonObj.html});
		});
	}

	function saveMontage(req){
		dev.logfunction( "saveMontage");
		var dir = dodoc.contentDir + "/" + req.folder + "/" + req.projet;
		var montageDir = dir + '/montage';
		var htmlFile = montageDir + '/' + convertToSlug(req.title) + '.json';
		changeJsonFile(htmlFile);

		function changeJsonFile(file){
			var jsonContent = fs.readFileSync(file,"UTF-8");
			var jsonObj = JSON.parse(jsonContent);
			jsonObj.html = req.html;
			var jsonString = JSON.stringify(jsonObj, null, 4);
			fs.writeFileSync(file, jsonString);
			console.log("HTML enregistré");
		}
	}

	function onTitleChanged(data){
		dev.logfunction( "onTitleChanged");
		var oldName = data.oldTitle;
		var oldFilePath = dodoc.contentDir + "/" + data.folder+'/'+data.project+'/montage/'+convertToSlug(oldName)+'.json';

		var newName = data.newTitle;
		var newFilePath = dodoc.contentDir + "/" + data.folder+'/'+data.project+'/montage/'+convertToSlug(newName)+'.json';

		// Vérifie si le dossier existe déjà
		fs.access(newFilePath, fs.F_OK, function(err) {
			// S'il n'existe pas -> change le nom du json
	    if (err) {
	      fs.renameSync(oldFilePath, newFilePath); // renomme le fichier
	      changeJsonFile(newFilePath);
	    }
	    // S'il existe afficher un message d'erreur
	    else {
	    	if(convertToSlug(oldName) != convertToSlug(newName)){
	    		console.log("le dossier existe déjà !");
	      	io.sockets.emit("folderAlreadyExist", {name: newName });
	    	}
	    	else{
	    		fs.renameSync(oldFilePath, newFilePath); // renomme le dossier
	      	changeJsonFile(newFilePath);
	    	}
	    }
		});

		function changeJsonFile(file){
			var jsonContent = fs.readFileSync(file,"UTF-8");
			var jsonObj = JSON.parse(jsonContent);
			jsonObj.name = newName;
			var jsonString = JSON.stringify(jsonObj, null, 4);
			fs.writeFileSync(file, jsonString);
			console.log("Titre Publication modifié");
			io.sockets.emit("titleModified", {name: newName, old:oldName});
		}
	}

/*
	function onNewText(text){
		dev.logfunction( "onNewText");
		var currentDate = Date.now();
		var jsonFile = dodoc.contentDir + "/" + text.folder + '/'+ text.project+"/" +text.project+'.json';
		var txtFile = dodoc.contentDir + "/" + text.folder + '/'+ text.project+"/" +currentDate+'.txt';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);
		var jsonAdd = { "id" : currentDate, "titre":text.title};
		jsonObj["files"]["texte"].push(jsonAdd);
    fs.writeFile(txtFile, '### '+text.title+"\r\n"+text.text, function(err){
    	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
	      if(err) {
	          console.log(err);
	      } else {
	          console.log("The file was saved!");
	          io.sockets.emit("displayNewText", {id:currentDate, textTitle: text.title, textContent: text.text});
	      }
    	});
    });
	}
*/

	function onModifiedText(text){
		dev.logfunction( "onModifiedText");
		var txtFile = dodoc.contentDir + "/" + text.folder + '/'+ text.project+"/" +text.id+'.txt';
		console.log(text);
// 		fs.writeFile(txtFile, '### '+text.title+"\r\n"+text.text, function(err){
		fs.writeFile(txtFile, text.text, function(err){
			if(err) {
        console.log(err);
      } else {
        console.log("The file was saved!");
        io.sockets.emit("displayModifiedText", {id:text.id, textTitle: text.title, textContent: text.text});
      }
    });
	}

	function onNewImageLocal(image){

	}

	function onMediaLegende(data){
    dev.logfunction( "onMediaLegende");
		var jsonFile = dodoc.contentDir + "/" + data.folder + '/'+ data.project+"/" +data.project+'.json';
		var jsonData = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(jsonData);
		var id = data.id;
		var type;
		if(data.type == 'image'){
			type = 'images';
		}
		if(data.type == 'video'){
			type = 'videos';
		}
		if(data.type == 'audio'){
			type = 'audio';
		}
		if(data.type == 'stopmotion'){
			type = 'stopmotion';
		}

    dev.log( "Start of loop to add or edit media title/caption.");
		dev.log( "ID of media = " + id + " and type of media is " + type);
		dev.log( "Number of entries to parse : " + jsonObj['files'][type].length);

		for (var i = 0; i < jsonObj['files'][type].length; i++){
			console.log( "+ for loop to find " + id + ". current name is " + jsonObj['files'][type][i].name);
		  if (jsonObj['files'][type][i].name == id){
			  console.log( "+++ found the name");
		  	jsonObj['files'][type][i]['title'] = data.title;
		  	jsonObj['files'][type][i]['legende'] = data.legend;
		  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
		      if(err) {
		          console.log(err);
		          return false;
		      } else {
		          console.log("The caption was saved for id " + id + " with type " + type + " with title " + data.title + " and caption " + data.legend);
		          io.sockets.emit("displayMediaData", {id:id, title: data.title, legend: data.legend});
		          return true;
		      }
	    	});
		  }
	  }

	  console.log( "Not found any json name to save to…");
	  return false;

	}



	// Delete File
	function deleteFile(req){
    dev.logfunction( "deleteFile");
		var fileToDelete = dodoc.contentDir + "/" + req.folder +'/'+req.project+'/'+req.file;
		var extension = req.file.split('.').pop();
		var identifiant =  req.file.replace("." + extension, "");
		var thumbToDelete = dodoc.contentDir + "/" + req.folder +'/'+req.project+'/'+identifiant + '-thumb.png';
		console.log('delete file', thumbToDelete);
		fs.unlink(fileToDelete);
		fs.access(thumbToDelete, fs.F_OK, function(err) {
	    if (!err) {
	    	console.log('thumb deleted');
	      fs.unlink(thumbToDelete);
	    } else {
	        // It isn't accessible
	    }
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

		var folderData = fs.readFileSync( folderJSONFile,"UTF-8");
		var folderJSONdata = JSON.parse(folderData);
		folderJSONdata.folderNameSlug = slugFolderName;
    return folderJSONdata;
  }

  // accepts a folderData with at least a "name" and a "folderNameSlug"
  function updateFolderDataJSON( folderData) {
		dev.logfunction( "COMMON — updateFolderDataJSON");

		var isNameChanged = folderData.newName !== undefined;

		var folderName = folderData.name;
		var slugFolderName = folderData.folderNameSlug;
		var folderPath = getFullPath( slugFolderName);
    var currentDateString = getCurrentDate();
    var newStatut = folderData.statut;

    if( isNameChanged) {
			var newFolderName = folderData.newName;
    }

    // récupérer les infos sur le folder
    var currentDataJSON = getFolderDataJSON( slugFolderName);

    // éditer le JSON récupéré
    if( newFolderName !== undefined)
      currentDataJSON.name = newFolderName;
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
              				var jsonContent = fs.readFileSync(file,"UTF-8");
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

    var projectPath = getProjectPath( slugFolderName, slugProjectName);
    var projectJSONFile = getJsonFileOfProject( projectPath);

		var projectData = fs.readFileSync( projectJSONFile,"UTF-8");
		var projectJSONdata = JSON.parse(projectData);

    projectJSONdata.folderName = slugFolderName;
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
      return eventAndContent( "projectCreated", newProjectData);
		}

    // otherwise, the folder and associated json already exists --> return an error event
    console.log("WARNING - the following folder name already exists: " + slugFolderName);

    var objectJson = {
      "name": folderName,
      "timestamp": currentDateString
    };
    return eventAndContent( "projectAlreadyExist", objectJson);
  }

  function getProjectPreview( projectPath) {

    dev.log( "detecting preview");
    // looking for an image whose name starts with apercu or preview in the project folder
    var filesInProjectFolder = fs.readdirSync( projectPath);
    var previewName = false;

    dev.log( "- match apercu/preview in array : " + filesInProjectFolder);
    filesInProjectFolder.forEach( function( filename) {
      if( dodoc.regexpMatchProjectPreviewNames.test(filename)) {
        previewName = filename;
        dev.log( "- - match preview called " + previewName);
      }
    });
    dev.log( "- final filename ? " + previewName);
    return previewName;

  }

  // accepts a folderData with at least a "foldername", a "folderNameSlug", a "projectname" and a "projectNameSlug"
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

  function getJsonFileOfMedia( projectPath, mediasFolderPath, mediaMetaFilename) {
    return projectPath + '/' + mediasFolderPath + '/' + mediaMetaFilename;
  }

  function findFirstFilenameNotTaken( fileName, mediaPath) {
    var newFileName = fileName;
    try {
      var index = 0;
      var newPathToFile = mediaPath + '/' + newFileName;
      while( !fs.accessSync( newPathToFile + ".json", fs.F_OK)){
        dev.log("- - following path is already taken : " + newPathToFile);
        index++;
        newFileName = fileName + "-" + index;
        newPathToFile = mediaPath + '/' + newFileName;
      }
	  } catch( err) {}

    console.log( "- - this filename is not taken : " + newFileName);
    return newFileName;
  }

  function listAllMedias( slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — listAllMedias : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var projectPath = getProjectPath( slugFolderName, slugProjectName);
      var mediasFoldersPath = getAllMediasFoldersPathAsArray();

      var mediasProcessed = 0;
      var mediaFolderContent = [];
  	  mediasFoldersPath.forEach( function( mediasFolderPath) {
  		  mediaFolderContent.push( onListMediasOfOneType( projectPath, mediasFolderPath));
      });
      resolve( mediaFolderContent);
    });
  }

  function listOneMedia( slugFolderName, slugProjectName, singleMediaFolderPath, specificMediaJsonName) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON — listOneMedia : slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName + " specificMediaJsonName = " + specificMediaJsonName);
      // lister tous les contenus issues des dossiers commencant par 01, 02, 03, 04
      var projectPath = getProjectPath( slugFolderName, slugProjectName);
      var mediaFolderContent = [];
  	  mediaFolderContent.push( onListMediasOfOneType( projectPath, singleMediaFolderPath, specificMediaJsonName));
      resolve( mediaFolderContent);
    });
  }

  function onListMediasOfOneType( projectPath, mediasFolderPath, specificMediaJsonName) {
    var mediasPath = projectPath + '/' + mediasFolderPath;
    var lookingForSpecificJson = specificMediaJsonName !== undefined ? true : false;

    var filesInMediaFolder = fs.readdirSync( mediasPath);
    var foldersMediasMeta = [];
    var foldersMediasFiles = [];
    filesInMediaFolder.forEach( function( filename) {
      if( !dodoc.regexpMatchFolderNames.test( filename) && filename !== ".DS_Store") {
        var fileExtension = dodoc.regexpGetFileExtension.exec( filename);
//             dev.log( "fileEXTENSION of " + filename + " is " + fileExtension);
        if( fileExtension == ".json") {
          if( !lookingForSpecificJson)
  				  foldersMediasMeta.push( filename);
  				else if( filename == specificMediaJsonName)
  				  foldersMediasMeta.push( filename);
			  }
			  else {
				  foldersMediasFiles.push( filename);
			  }
      }
    });

    // in foldersMediasMeta, there should always be at least another file with the same name.
    // Let's add them inside our json reference file
    var folderMediaMetaAndFileName = new Object();

    for (var i=0; i<foldersMediasMeta.length; i++) {
      var mediaMetaFilename = foldersMediasMeta[i];
      var fileNameWithoutExtension = dodoc.regexpRemoveFileExtension.exec( mediaMetaFilename)[1];
      dev.log( "- looking for medias filenames that start with " + fileNameWithoutExtension);
      for (var j=0; j< foldersMediasFiles.length; j++) {
        var mediaFilename = foldersMediasFiles[j];
        dev.log( "- comparing to " + mediaFilename);
        if ( mediaFilename.indexOf( fileNameWithoutExtension) !== -1) {
          if( !folderMediaMetaAndFileName.hasOwnProperty( mediaMetaFilename)) {
            folderMediaMetaAndFileName[mediaMetaFilename] = new Object();
            // read JSON file and add the content to the folder
            var mediaJsonData = getMediaDataJSON( projectPath, mediasFolderPath, mediaMetaFilename);

            // if the file is a text, then also add the content of the TXT in the answer
            if( dodoc.regexpGetFileExtension.exec( mediaFilename) == '.txt') {
              var contentOfMediaText = fs.readFileSync( projectPath + '/' + mediasFolderPath + '/' + mediaFilename);
              console.log( "markdown : " + markdown.toHTML( contentOfMediaText));
              mediaJsonData.contentOfText = markdown.toHTML( contentOfMediaText);
              console.log( "mediaJsonData.contentOfText " + mediaJsonData.contentOfText);
            }

            folderMediaMetaAndFileName[mediaMetaFilename] = mediaJsonData;
          }
          if( !folderMediaMetaAndFileName[mediaMetaFilename].hasOwnProperty( "files")) {
            folderMediaMetaAndFileName[mediaMetaFilename]["files"] = new Array();
          }
          folderMediaMetaAndFileName[mediaMetaFilename]["files"].push( mediaFilename);

        }
      }
    }

    var mediaFolderContent = new Object();
    mediaFolderContent[mediasFolderPath] = new Object();
    mediaFolderContent[mediasFolderPath] = folderMediaMetaAndFileName;

    return mediaFolderContent;
  }


  function getMediaDataJSON( projectPath, mediaFolderPath, mediaMetaFilename) {
		dev.logfunction( "COMMON — getMediaDataJSON : projectPath = " + projectPath + " mediaFolderPath = " + mediaFolderPath + " mediaMetaFilename = " + mediaMetaFilename);

    var mediaJSONFilepath = getJsonFileOfMedia( projectPath, mediaFolderPath, mediaMetaFilename);
		var mediaData = fs.readFileSync( mediaJSONFilepath, "UTF-8");
    dev.log( "mediaData : " + mediaData);
		var mediaDataJson = JSON.parse( mediaData);
    dev.log( "mediaDataJson : " + mediaDataJson );

    return mediaDataJson;
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

      switch (newMediaType) {
        case 'photo':
    			mediaFolder = getPhotoPathOfProject();
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;
          newFileName = findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.jpg';
          var dataMedia = newMediaData.mediaData;
          var imageBuffer = decodeBase64Image( dataMedia);

          console.log("promise before");

          fs.writeFileSync( pathToFile + fileExtension, imageBuffer.data);

					console.log("Image added at path " + pathToFile);

          mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension);
      		resolve( mediaMetaData);

          break;
        case 'video':
    			mediaFolder = getVideoPathOfProject();
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;

          newFileName = findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;
          fileExtension = '.webm';

          var dataMedia = newMediaData.mediaData;
          writeToDisk2( pathToFile, fileExtension, dataMedia);
    	 		createThumnails( pathToFile + fileExtension, newFileName, mediaPath);

          mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension);
      		resolve( mediaMetaData);

          break;
        case 'animation':
          mediaFolder = getAnimationPathOfProject();

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
            .withFpsInput(2)
            .fps(2)
            // setup event handlers
            .on('end', function() {
              console.log('file has been converted succesfully');

              createThumnails( pathToFile + fileExtension, newFileName, mediaPath);

              mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension);
          		resolve( mediaMetaData);

            })
            .on('error', function(err) {
              console.log('an error happened: ' + err.message);
          		reject( "couldn't create a stopmotion animation");
            })
            // save to file
            .save( pathToFile + fileExtension);

          break;
        case 'audio':
          mediaFolder = getAudioPathOfProject();

    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;
          newFileName = findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.wav';
          var dataMedia = newMediaData.mediaData.split(',').pop();
          var imageBuffer = new Buffer( dataMedia, 'base64');

          fs.writeFileSync( pathToFile + fileExtension, imageBuffer);

          mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension);
      		resolve( mediaMetaData);

          break;
        case 'text':
          mediaFolder = getTextPathOfProject();
    			var mediaPath = getProjectPath( slugFolderName, slugProjectName) + '/' + mediaFolder;
          newFileName = findFirstFilenameNotTaken( newFileName, mediaPath);
          pathToFile = mediaPath + '/' + newFileName;

          fileExtension = '.txt';
          var dataTitle = newMediaData.title;
          var dataText = newMediaData.text;

          var textContent = dataText;

          fs.writeFileSync( pathToFile + fileExtension, textContent);

          mediaMetaData = createMediaJSON( newMediaType, pathToFile, fileExtension);
          mediaMetaData.contentOfText = textContent;
      		resolve( mediaMetaData);

          break;
      // end of switch
      }

      reject( "failed creating a new media");

    // end of promise
    });
  }


  function createMediaJSON( newMediaType, pathToFile, fileExtension) {
    var mediaMetaData = {};
    mediaMetaData['created'] = getCurrentDate();
    mediaMetaData['modified'] = getCurrentDate();
    mediaMetaData['informations'] = '';
    mediaMetaData['type'] = newMediaType;
    mediaMetaData['pathToFile'] = pathToFile + fileExtension;
    mediaMetaData['fav'] = false;

    // generate a json file next to the file
    var pathToJSONFile = pathToFile + '.json';
		var status = jsonWriteToFile( pathToJSONFile, mediaMetaData, "update");

		return mediaMetaData;
  }


  function editMedia( editMediaData) {
    return new Promise(function(resolve, reject) {
  		dev.logfunction( "COMMON - editMedia : " + editMediaData);

			var slugFolderName = editMediaData.slugFolderName;
			var slugProjectName = editMediaData.slugProjectName;
			var mediaFolderPath = editMediaData.mediaFolderPath;
			var mediaMetaFilename = editMediaData.specificMediaJsonName;

      // get the path to the media JSON and its content
      var projectPath = getProjectPath( slugFolderName, slugProjectName);
      var mediaJsonData = getMediaDataJSON( projectPath, mediaFolderPath, mediaMetaFilename);
      var mediaJSONFilepath = getJsonFileOfMedia( projectPath, mediaFolderPath, mediaMetaFilename);


      // switch the fav state
      if( editMediaData.switchFav !== undefined)
        mediaJsonData.fav = !mediaJsonData.fav;

  		var status = jsonWriteToFile( mediaJSONFilepath, mediaJsonData, "update");

      resolve( editMediaData);

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

	function writeIntoJsonFile(jsonFile, objectJson, objectToSend, send){
		var jsonString = JSON.stringify(objectJson, null, 4);
		fs.writeFile(jsonFile, jsonString, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
          io.sockets.emit(send, objectToSend);
      }
    });
	}

  // old write json function that sends sockets.emit (see jsonWriteToFile)
	function writeJsonFile(jsonFile, objectJson, send){
		var jsonString = JSON.stringify(objectJson, null, 4);
		if( send === "folderCreated") {
			fs.appendFile(jsonFile, jsonString, function(err) {
	      if(err) {
	        console.log(err);
	      }
	      else {
	        console.log("Success for event : " + send);
	      	io.sockets.emit(send, objectJson);
	      }
	    });
    }
    else if( send === "folderModified") {
      fs.writeFileSync(jsonFile, jsonString);
      io.sockets.emit(send, objectJson);
	  }
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

	function createThumnails(path, fileName, dir){
		var proc = ffmpeg(path)
		// setup event handlers
		.on('end', function(files) {
			console.log('screenshots were saved');
		})
		.on('error', function(err) {
			console.log('an error happened: ' + err.message);
		})
		// take 2 screenshots at predefined timemarks
		.takeScreenshots({ count: 1, timemarks: [ '00:00:01'], "filename" : fileName + ".png"}, dir);
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