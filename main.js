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
var dodoc  = require('./dodoc');

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
		socket.on("displayProject", displayProject);

		// C A P T U R E     P A G E
		socket.on("imageCapture", onNewImage);
		socket.on("videoRecorded", onNewVideo);
		//STOP MOTION
		socket.on("newStopMotion", onNewStopMotion);
		socket.on("imageMotion", onNewImageMotion);
		socket.on("deleteImageMotion", deleteImageMotion);
		socket.on("stopmotionCapture", createStopMotion);
		// Audio
		socket.on("audioCapture", onNewAudioCapture);
		socket.on("deleteFile", deleteFile);

		// B I B L I        P A G E
		socket.on("listMedias", function(data){
			listMedias(data, socket);
		});
		socket.on("readTxt", readTxt);
		socket.on("listPubli", function(data){
			listPubli(data, socket);
		});
		socket.on("createPubli", newPublication);
		socket.on("displayThisMontage", displayMontage);
		socket.on("saveMontage", saveMontage);
		socket.on("titleChanged", onTitleChanged);
		socket.on("addText", onNewText);
		socket.on("modifyText", onModifiedText);
		socket.on("newImageLocal", onNewImage);
		socket.on("addMediaData", onMediaLegende);
		socket.on("highlightMedia", onHighLighMedia);
		socket.on("removeHighlight", onRemoveHighlight);
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
		function onModifyFolder( udpdatedFolderData){
  		dev.logfunction( "EVENT - onModifyFolder with packet " + JSON.stringify( udpdatedFolderData, null, 4));
      var eventAndContentJson = updateFolderDataJSON( udpdatedFolderData);
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

		function onNewProjectOld(project) {
  		dev.logfunction( "onNewProject");
			var projectName = project.name;
			var formatProjectName = convertToSlug(projectName);
			var projectPath = dodoc.contentDir + "/" + project.folder+"/"+formatProjectName;
			var currentDate = Date.now();

			// Vérifie si le projet existe déjà
			fs.access(projectPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> créer le dossier et le json
		    if (err) {
		    	console.log("projet crée");
		      fs.ensureDirSync(projectPath);
		      var jsonFile = projectPath + '/' + formatProjectName +'.json';
		      if(project.file){
		      	addImage(formatProjectName, projectPath, project.file);
		      	var objectJson = {"folder":project.folder, "name":projectName, "fileName":project.image, "created":currentDate, "modified":null,"statut":'en cours', "files": {"images":[], "videos":[], "stopmotion":[], "audio":[], "texte":[]}};
		      	var objectToSend = {folder: project.folder, name: projectName, format: formatProjectName, image:true, created: currentDate, modified:null, statut:"en cours"};
		      	writeJsonFile(jsonFile, objectJson, objectToSend, "projectCreated"); //write json File
		      }
		      else{
		      	var objectJson= {"folder":project.folder, "name":projectName, "fileName":false, "created":currentDate, "modified":null,"statut":'en cours', "files": {"images":[], "videos":[], "stopmotion":[], "audio":[], "texte":[]}};
		      	var objectToSend = {folder: project.folder, name: projectName, format: formatProjectName, image:false, created: currentDate, modified:null, statut:"en cours"};
		      	writeJsonFile(jsonFile, objectJson, objectToSend, "projectCreated"); //write json File
		      }
		    }
		    // S'il existe afficher un message d'erreur
		    else {
		      console.log("le dossier existe déjà !");
		      io.sockets.emit("folderAlreadyExist", {name: projectName, timestamp: currentDate });
		    }
			});

			//Change le nombre de projets dans le dossier parent
			changeJsonFile( dodoc.contentDir + "/" + project.folder+'/'+project.folder+'.json');
			function changeJsonFile(file){
				var jsonContent = fs.readFileSync(file,"UTF-8");
				var jsonObj = JSON.parse(jsonContent);
				jsonObj.nb_projets = jsonObj.nb_projets + 1;
				var jsonString = JSON.stringify(jsonObj, null, 4);
				fs.writeFileSync(file, jsonString);
				// io.sockets.emit("folderModified", {name: folder.name, created: jsonObj.created, modified:currentDate, statut:newStatut, nb_projets:0});
			}
		}

		// Modifier un projet
		function onModifyProject(project){
  		dev.logfunction( "onModifyProject");
			//console.log(project);
			var folder = project.folder;

			var oldProject = project.oldname;
			var oldFormatProjectName = convertToSlug(oldProject);
			var oldProjectPath = dodoc.contentDir + "/" + folder + '/' + oldFormatProjectName;

			var newProject = project.name;
			var newFormatProjectName = convertToSlug(newProject);
			var newProjectPath = dodoc.contentDir + "/" + folder + '/' + newFormatProjectName;

			var newStatut = project.statut;
			var currentDate = Date.now();
			var ifImage;

			// Vérifie si le dossier existe déjà
			fs.access(newProjectPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> change le nom du dossier et change le json
		    if (err) {
		    	console.log('oui');
		      fs.renameSync(oldProjectPath, newProjectPath); // renomme le dossier
		      fs.renameSync(newProjectPath + '/' + oldFormatProjectName + '.json', newProjectPath + '/' + newFormatProjectName + '.json'); //renomme le json
		      changeJsonFile(newProjectPath + '/' + newFormatProjectName + '.json');
		      // si une image est changée
					if(project.file){
						console.log('oui image');
						fs.stat(newProjectPath + '/' + oldFormatProjectName + '-thumb.jpg', function(err, stat) {
					    if(err == null) {
					      console.log('Supprime the old image');
					      //supprime l'ancienne l'image
	      				fs.unlink(newProjectPath + '/' + oldFormatProjectName + '-thumb.jpg', function(){
	      					addImage(newFormatProjectName, newProjectPath, project.file);
					      	ifImage = true;
					      	changeJsonFile(newProjectPath + '/' + newFormatProjectName + '.json');
	      				});
					    }
					    else{
					    	addImage(newFormatProjectName, newProjectPath, project.file);
				      	ifImage = true;
				      	changeJsonFile(newProjectPath + '/' + newFormatProjectName + '.json');
					    }
						});
		      }
		      else{
		      	//change le nom du thumbnail du projet
		      	fs.stat(newProjectPath + '/' + oldFormatProjectName + '-thumb.jpg', function(err, stat) {
					    if(err == null) {
					      console.log('le projet contient une image');
	      				fs.renameSync(newProjectPath + '/' + oldFormatProjectName + '-thumb.jpg', newProjectPath + '/' + newFormatProjectName + '-thumb.jpg'); //renomme l'image
					    }
						});
		      }
		    }
		    // S'il existe afficher un message d'erreur
		    else {
		    	if(oldFormatProjectName != newFormatProjectName){
		    		console.log("le dossier existe déjà !");
		      	io.sockets.emit("folderAlreadyExist", {name: newProject, timestamp: currentDate });
		    	}
		    	else{
		    		fs.renameSync(oldProjectPath, newProjectPath); // renomme le dossier
		      	fs.renameSync(newProjectPath + '/' + oldFormatProjectName + '.json', newProjectPath + '/' + newFormatProjectName + '.json'); //renomme le json
		      	changeJsonFile(newProjectPath + '/' + newFormatProjectName + '.json');
		      	if(project.file){
							console.log('oui image');
							fs.stat(newProjectPath + '/' + oldFormatProjectName + '-thumb.jpg', function(err, stat) {
						    if(err == null) {
						      console.log('le projet contient une image');
		      				//fs.unlink(newProjectPath + '/' + oldFormatProjectName + '-thumb.jpg'); //supprime l'ancienne l'image
						    }
							});
			      	addImage(newFormatProjectName, newProjectPath, project.file);
			      	ifImage = true;
			      	changeJsonFile(newProjectPath + '/' + newFormatProjectName + '.json');
			      }
		    	}
		    }
			});

			function changeJsonFile(file){
				var jsonContent = fs.readFileSync(file,"UTF-8");
				var jsonObj = JSON.parse(jsonContent);
				jsonObj.name = project.name;
				jsonObj.modified = currentDate;
				jsonObj.statut = newStatut;
				jsonObj.fileName = ifImage;
				var jsonString = JSON.stringify(jsonObj, null, 4);
				fs.writeFileSync(file, jsonString);
				console.log("Projet modifié");
				io.sockets.emit("projectModified", {name: project.name, created: jsonObj.created, modified:currentDate, statut:newStatut, nb_projets:jsonObj.nb_projets, image: ifImage});
			}

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
		function displayProject(data, socket){
  		dev.logfunction( "displayProject");



			var dir = dodoc.contentDir + "/" + data.folder+"/"+data.project;
			var dirPubli = dodoc.contentDir + "/" + data.folder+"/"+data.project+'/montage';
			var file = dir+"/"+data.project+'.json';
			var jsonObj;
			fs.readFile(file, 'utf8', function (err, data) {
			  if (err) console.log(err);
			  jsonObj = JSON.parse(data);
			  fs.readdir(dir, function(err, files) {
					var media = [];
					if (err) {console.log(err)};
					files.forEach(function(f) {
						media.push(f);
					});
					var lastMedia = media.slice(Math.max(media.length - 10, 1));
					fs.access(dirPubli, fs.F_OK, function(err) {
				    if (!err) {
						  fs.readdir(dirPubli, function(err, files) {
								var publiNames = [];
							  if (err) console.log(err);
					    	//console.log('Files: ' + typeof files);
					    	if( typeof files == "undefined")
					    	  return;
						    files.forEach(function(file) {
						    	console.log('Files: ' + file);
						    	if(file == ".DS_Store"){
					    			fs.unlink(dirPubli+'/'+file);
					    		}
					    		if(! /^\..*/.test(file)){
						  			var jsonFilePubli = dirPubli +'/' +file;
										var dataPubli = fs.readFileSync(jsonFilePubli,"UTF-8");
										var jsonObjPubli = JSON.parse(dataPubli);
										publiNames.push(jsonObjPubli.name)
						    	}
						    });
						    socket.emit('sendProjectData',{json:jsonObj , lastmedia:lastMedia, publiNames: publiNames, image:jsonObj.fileName});
							});
				    }
			    	else{
							socket.emit('sendProjectData',{json:jsonObj , lastmedia:lastMedia, publiNames: '', image:jsonObj.fileName});
						}
					});
				});
			});
		}
	// F I N     P R O J E T      P A G E

	// C A P T U R E      P A G E
		//ajoute les images au projet
		function onNewImage(image) {
  		dev.logfunction( "onNewImage");
			var dataImage = image.data;
			var folder = image.folder;
			var project = image.project;

			var imageBuffer = decodeBase64Image(dataImage);
			var currentDate = Date.now();
			var filePath = dodoc.contentDir + "/" + folder + '/' +project+"/"+ currentDate + '.jpg';
			console.log(filePath);
			fs.writeFile(filePath , imageBuffer.data, function(err) {
				if(err){
					console.log(err);
				}
				else{
					console.log("Image Ajoutée au projet");
					io.sockets.emit('mediaCreated', {file:currentDate + '.jpg'});
				}
			});

			var jsonFile = dodoc.contentDir + "/" + folder + '/'+ project+"/" +project+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);
			var jsonAdd = { "name" : currentDate};
			jsonObj["files"]["images"].push(jsonAdd);
			var objectToSend = {file: currentDate + ".jpg", extension:"jpg", folder:folder, projet:project, title: currentDate};
			writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewImage');
		}

		function onNewVideo(data){
  		dev.logfunction( "onNewVideo");
			var currentDate = Date.now();
		  var fileName = currentDate;
		  var folder = data.folder;
		  var project = data.project

		  var projectDirectory = dodoc.contentDir + "/" + folder + '/'+ project;

		  writeToDisk(data.data.video.dataURL, fileName + '.webm', folder, project);
		  io.sockets.emit('showVideo', {file: fileName + '.webm', folder:folder, project:project});
			io.sockets.emit('mediaCreated', {file:fileName + '.webm'});
		  //Write data to json
	    var jsonFile = dodoc.contentDir + "/" + folder + '/' +project + '/'+project+'.json';
			var jsonData = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(jsonData);
			var jsonAdd = { "name" : fileName};
			jsonObj["files"]["videos"].push(jsonAdd);
			var objectToSend = {file: fileName + ".webm", extension:"webm", folder:folder, project:project, title: fileName};
			writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewVideo');

	 		//Create thumbnails
	 		createThumnails(projectDirectory + "/" + fileName + ".webm", fileName, projectDirectory)
		}

		// Crée un nouveau dossier pour le stop motion
		function onNewStopMotion(data) {
  		dev.logfunction( "onNewStopMotion");
			var StopMotionDirectory = dodoc.contentDir + "/" + data.folder +'/'+ data.project+'/01-stopmotion';
			if(StopMotionDirectory){
				fs.removeSync(StopMotionDirectory);
			}
			fs.ensureDirSync(StopMotionDirectory);
			// io.sockets.emit('newStopMotionDirectory', StopMotionDirectory);
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

		//Transforme les images en vidéos.
		function createStopMotion(req){
  		dev.logfunction( "createStopMotion");
			var currentDate = Date.now();
			var fileName = currentDate;

			//SAVE VIDEO
			var videoPath = dodoc.contentDir + "/" + req.folder + '/' +req.project+'/'+ fileName + '.mp4';
			var projetDir = dodoc.contentDir + "/" + req.folder+"/"+req.project;
			//make sure you set the correct path to your video file
			var proc = new ffmpeg({ source: req.dir + '/%d.png'})
			  // using 12 fps
			  .withFpsInput(5)
			  .fps(5)
			  // setup event handlers
			  .on('end', function() {
			    console.log('file has been converted succesfully');
			    io.sockets.emit("newStopMotionCreated", {fileName:fileName + '.mp4', name:req.folder, projet:req.project, dir:req.dir });
			  	createThumnails(videoPath, fileName, projetDir)
			  })
			  .on('error', function(err) {
			    console.log('an error happened: ' + err.message);
			  })
			  // save to file
			  .save(videoPath);
			  io.sockets.emit('mediaCreated', {file:fileName + '.mp4'});

			var jsonFile = dodoc.contentDir + "/" + req.folder + '/'+req.project+"/"+req.project+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);
			var jsonAdd = { "name" : currentDate};
			jsonObj["files"]["stopmotion"].push(jsonAdd);
			var objectToSend = {file: fileName + ".mp4", extension:"mp4", name:req.folder, projet:req.project, title: fileName};
			writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewStopMotion');
		}

		// Audio
		function onNewAudioCapture(req){
  		dev.logfunction( "onNewAudioCapture");
			//write audio to disk
			var currentDate = Date.now();
			var fileName = currentDate;
	  	var fileWithExt = fileName + '.wav';
	  	var fileExtension = fileWithExt.split('.').pop(),
	      fileRootNameWithBase = './' + dodoc.contentDir + "/" + req.folder +'/'+ req.project +'/'+fileWithExt,
	      filePath = fileRootNameWithBase,
	      fileID = 2,
	      fileBuffer;

		    dataURL = req.data.audio.dataURL.split(',').pop();
		    fileBuffer = new Buffer(dataURL, 'base64');
		    fs.writeFileSync(filePath, fileBuffer);
		    io.sockets.emit('AudioFile', fileWithExt, req.folder, req.project);
		    io.sockets.emit('mediaCreated', {file:fileWithExt});

				//add data to json file
				var jsonFile = dodoc.contentDir + "/" + req.folder + '/'+ req.project+'/'+req.project+'.json';
				var data = fs.readFileSync(jsonFile,"UTF-8");
				var jsonObj = JSON.parse(data);
				var jsonAdd = { "name" : currentDate};
				jsonObj["files"]["audio"].push(jsonAdd);
				var objectToSend = {file: fileName + ".wav", extension:"wav", name:req.folder, projet:req.project,title: fileName};
				writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewAudio')
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
		function listMedias(media, socket){
  		dev.logfunction( "listMedias");
			//read json file to send data
			var jsonFile = dodoc.contentDir + "/" + media.folder + '/' + media.project +'/'+media.project+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);

			var dir = dodoc.contentDir + "/" + media.folder + '/' + media.project +'/';
			fs.readdir(dir, function(err, files) {
				var media = [];
				if (err) {console.log(err)};
				files.sort(function(a, b) {
	        return fs.statSync(dir + a).mtime.getTime() - fs.statSync(dir + b).mtime.getTime();
	      })
				.forEach(function(f) {
					//console.log(f);
					var extension = path.extname(f);
					var fileName = path.basename(f,extension);
					var obj = {
							id: fileName,
							extension: extension,
							file: f
						};
					media.push(obj)
				});
				socket.emit('listMedias', media, jsonObj);
			});
		}

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
		      	var objectToSend = {name: folderName, created: currentDate};
		      	writeJsonFile(publiPath, objectJson, objectToSend, "publiCreated"); //write json File
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

		function onModifiedText(text){
  		dev.logfunction( "onModifiedText");
			var txtFile = dodoc.contentDir + "/" + text.folder + '/'+ text.project+"/" +text.id+'.txt';
			console.log(text);
			fs.writeFile(txtFile, '### '+text.title+"\r\n"+text.text, function(err){
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

/*
			if(data.type == 'image'){
				for (var i = 0; i < jsonObj['files']['images'].length; i++){
				  // look for the entry with a matching `name` value
				  if (jsonObj['files']['images'][i].name == id){
				  	jsonObj['files']['images'][i]['title'] = data.title;
				  	jsonObj['files']['images'][i]['legende'] = data.legend;
				  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
				      if(err) {
				          console.log(err);
				      } else {
				          console.log("The caption was saved for id " + id + " with title " + data.title + " and caption " data.legend);
				          io.sockets.emit("displayMediaData", {id:id, title: data.title, legend: data.legend});
				      }
			    	});
				  }
				}
			}
			if(data.type == 'video'){
				for (var i = 0; i < jsonObj['files']['videos'].length; i++){
				  // look for the entry with a matching `name` value
				  if (jsonObj['files']['videos'][i].name == id){
				  	jsonObj['files']['videos'][i]['title'] = data.title;
				  	jsonObj['files']['videos'][i]['legende'] = data.legend;
				  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
				      if(err) {
				          console.log(err);
				      } else {
				          console.log("The caption was saved for id " + id + " with title " + data.title + " and caption " data.legend);
				          io.sockets.emit("displayMediaData", {id:id, title: data.title, legend: data.legend});
				      }
			    	});
				  }
				}
			}
			if(data.type == 'stopmotion'){
				for (var i = 0; i < jsonObj['files']['stopmotion'].length; i++){
				  // look for the entry with a matching `name` value
				  if (jsonObj['files']['stopmotion'][i].name == id){
				  	jsonObj['files']['stopmotion'][i]['title'] = data.title;
				  	jsonObj['files']['stopmotion'][i]['legende'] = data.legend;
				  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
				      if(err) {
				          console.log(err);
				      } else {
				          console.log("The caption was saved for id " + id + " with title " + data.title + " and caption " data.legend);
				          io.sockets.emit("displayMediaData", {id:id, title: data.title, legend: data.legend});
				      }
			    	});
				  }
				}
			}
			if(data.type == 'audio'){
				for (var i = 0; i < jsonObj['files']['audio'].length; i++){
				  // look for the entry with a matching `name` value
				  if (jsonObj['files']['audio'][i].name == id){
				  	jsonObj['files']['audio'][i]['title'] = data.title;
				  	jsonObj['files']['audio'][i]['legende'] = data.legend;
				  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
				      if(err) {
				          console.log(err);
				      } else {
				          console.log("The file was saved!");
				          io.sockets.emit("displayMediaData", {id:id, title: data.title, legend: data.legend});
				      }
			    	});
				  }
				}
			}
*/
		}

		function onHighLighMedia(data){
      dev.logfunction( "onHighLighMedia");
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

			if(data.type == 'text'){
				for (var i = 0; i < jsonObj['files']['texte'].length; i++){
				  if (jsonObj['files']['texte'][i].id == id){
				  	jsonObj['files']['texte'][i]['highlight'] = true;
				  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
				      if(err) {
				          console.log(err);
				      } else {
				        console.log("The file was saved!");
				        io.sockets.emit("addHighlight", {id:id, highlight:true});
				      }
			    	});
				  }
				}
			}
			else{
				for (var i = 0; i < jsonObj['files'][type].length; i++){
				  if (jsonObj['files'][type][i].name == id){
				  	jsonObj['files'][type][i]['highlight'] = true;
				  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
				      if(err) {
				          console.log(err);
				      } else {
				        console.log("The file was saved!");
				        io.sockets.emit("addHighlight", {id:id, highlight:true});
				      }
			    	});
				  }
				}
			}
		}

		function onRemoveHighlight(data){
      dev.logfunction( "onRemoveHighlight");
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

			if(data.type == 'text'){
				for (var i = 0; i < jsonObj['files']['texte'].length; i++){
				  if (jsonObj['files']['texte'][i].id == id){
				  	jsonObj['files']['texte'][i]['highlight'] = false;
				  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
				      if(err) {
				          console.log(err);
				      } else {
				        console.log("The file was saved!");
				        io.sockets.emit("addHighlight", {id:id, highlight:false});
				      }
			    	});
				  }
				}
			}
			else{
				for (var i = 0; i < jsonObj['files'][type].length; i++){
				  if (jsonObj['files'][type][i].name == id){
				  	jsonObj['files'][type][i]['highlight'] = false;
				  	fs.writeFile(jsonFile, JSON.stringify(jsonObj, null, 4), function(err) {
				      if(err) {
				        console.log(err);
				      } else {
				        console.log("The file was saved!");
				        io.sockets.emit("addHighlight", {id:id, highlight:false});
				      }
			    	});
				  }
				}
			}

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
      return moment().format('YYYYMMDD_HH:mm:ss');
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
		        "nb_projets" : 0
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
		        "nb_projets" : 0,
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

    // accepts a folderData with at least a .name value
    function updateFolderDataJSON( folderData) {
  		dev.logfunction( "COMMON — updateFolderDataJSON");

  		var isNameChanged = folderData.newName !== undefined;

			var folderName = folderData.name;
			var slugFolderName = folderData.folderNameSlug;
			var folderPath = getFullPath( slugFolderName);
      var currentDateString = getCurrentDate();

      if( isNameChanged) {
  			var newFolderName = folderData.newName;
      }

			var newStatut = folderData.statut;

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
//       writeJsonFile( folderJSONFile, currentDataJSON, "folderModified"); //write json File
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


    function getJsonFileOfProject( projectPath) {
      return projectPath + '/' + dodoc.projectJSONfilename;
    }

    function getProjectPath( slugFolderName, slugProjectName) {
      return getFullPath( slugFolderName + '/' + slugProjectName);
    }

    function getProjectDataJSON( slugFolderName, slugProjectName) {

      var projectPath = getProjectPath( slugFolderName, slugProjectName);
      var projectJSONFile = getJsonFileOfProject( projectPath);

			var projectData = fs.readFileSync( projectJSONFile,"UTF-8");
			var projectJSONdata = JSON.parse(projectData);

      projectJSONdata.folderName = slugFolderName;
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
      try{
			  fs.accessSync( projectPath, fs.F_OK);
		  } catch(err) {

				// S'il n'existe pas -> créer le dossier et le json
	    	console.log("New project created with name " + projectName + " and path " + projectPath);
	      fs.ensureDirSync(projectPath);//write new folder in folders
        var projectJSONFile = getJsonFileOfProject( projectPath);
	      var objectJson =
	        {
		        "name" : projectName,
		        "created" : currentDateString,
		        "modified" : currentDateString,
		        "statut" : "en cours",
		        "informations" : 0
		      };

        // retourner un JSON indiquant la réussite de l'appel
	      var newProjectCreated = jsonWriteToFile( projectJSONFile, objectJson, "create"); //write json File
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




/************

*************/


/* --- */

    function getProjectPreview( projectPath) {

      dev.log( "detecting preview");
      // looking for an image whose name starts with apercu or preview in this folder
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
  			fs.appendFile( jsonFile, jsonString, function(err) {
  	      if(err) {
  	        console.log(err);
  	        return false;
  	      }
  	      else {
  	        console.log("Success for event : " + sendEvent);
  	        return true;
  	      }
  	    });
	    }
	    else if( sendEvent === "update") {
        fs.writeFileSync(jsonFile, jsonString);
        return true;
  	  }
    }

		function addImage(parentName, parentPath, file){
	    var thumbName = parentName + "-thumb";
			var filePath = parentPath + "/" + thumbName + ".jpg";
			var imageBuffer = decodeBase64Image(file);
			fs.writeFile(filePath, imageBuffer.data, function (err) {
	    	console.info("write new file to " + filePath);
			});
		}

		function createThumnails(path, fileName, dir){
			var proc = ffmpeg(path)
			// setup event handlers
			.on('end', function(files) {
				console.log('screenshots were saved as ' + fileName + "-thumb.png");
			})
			.on('error', function(err) {
				console.log('an error happened: ' + err.message);
			})
			// take 2 screenshots at predefined timemarks
			.takeScreenshots({ count: 1, timemarks: [ '00:00:01'], filename: fileName + "-thumb.png"}, dir);
		}
	// F I N     C O M M O N      F U N C T I O N

	// H E L P E R S

		//Décode les images en base64
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