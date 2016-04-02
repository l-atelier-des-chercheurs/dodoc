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

module.exports = function(app, io){

	console.log("main module initialized");


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
        console.log( term);
    }
  };


	// ou stocker les contenus
	var contentDir = "sessions/";
	var session_list = [];

  // previously /^\..*/
  // see http://regexr.com/3d4t8
	var regexpMatchFolderNames = new RegExp(/^([^.]+)$/igm);
  var regexpMatchProjectPreviewNames = new RegExp(/^(apercu|preview)/igm);


	io.on("connection", function(socket){
		// I N D E X    P A G E
		listFolder(socket);
		socket.on("newFolder", onNewFolder);
		socket.on("modifyFolder", onModifyFolder);
		socket.on("removeFolder", onRemoveFolder);

		// P R O J E T S     P A G E
		socket.on("listProject", function (data){
			listProject(data, socket);
		});
		socket.on("newProject", onNewProject);
		socket.on("modifyProject", onModifyProject);
		socket.on("removeProject", onRemoveProject);

		// P R O J E T      P A G E
		socket.on("displayProject", function(data){
			displayProject(data, socket);

		});

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


// ------------- F U N C T I O N S -------------------

	// I N D E X     P A G E

		// Create a new folder
		function onNewFolder( folder) {

			var folderName = folder.name;
			var slugFolderName = convertToSlug(folderName);
			var folderPath = getFullPath( slugFolderName);
			var currentDateString = getCurrentDate();

			// Vérifie si le dossier existe déjà
			fs.access(folderPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> créer le dossier et le json
		    if (err) {

		    	console.log("New folder created with name " + slugFolderName);
		      fs.ensureDirSync(folderPath);//write new folder in sessions

		      var folderJSONFile = getJsonFileOfFolder( slugFolderName);

		      var objectJson =
	        {
		        "name" : folderName,
		        "created" : currentDateString,
		        "modified" : null,
		        "statut" : 'en cours',
		        "nb_projets" : 0
		      };
		      writeJsonFile( folderJSONFile, objectJson, "folderCreated"); //write json File
		    }
		    // S'il existe afficher un message d'erreur
		    else {
		      console.log("The following folder name already exists:" + slugFolderName);
		      io.sockets.emit("folderAlreadyExist", { "name": folderName, "timestamp": currentDateString });
		    }
			});
		}

		// Liste les dossiers déjà existant
		function listFolder(socket){

			fs.readdir( contentDir, function (err, folders) {

        if (err) return console.log(err);

// 		    dev.log( "Number of folders in " + contentDir + " = " + folders.length);
			  folders
  			  .forEach( function( folderName) {

//             dev.log( "- folderName = " + folderName);
  			    if( regexpMatchFolderNames.test( folderName)){
//               dev.log( "--- Has passed check : " + folderName);

  			    	var folderJSON = getFolderDataJSON( folderName);
  						socket.emit('listOneFolder', folderJSON);

              var folderPath = getFullPath( folderName);


              // list all projects
  						fs.readdir( folderPath, function (err, projects) {

                if (err) return console.log(err);

//         		    dev.log( "Number of folders in " + folderPath + " = " + projects.length);
        			  projects.forEach( function( projectName) {

//                  dev.log( "- projectName = " + projectName);
        			    if( regexpMatchFolderNames.test( projectName)){
                    dev.log( "--- Has passed check : " + projectName);
                    var folderPath = folderName + "/" + projectName;

                    var projectJSON = getProjectDataJSON( folderPath);
                    projectJSON.folderName = folderJSON.name;
                    projectJSON.projectPreviewName = getProjectPreview( folderPath);

                    dev.log( "projectJSON " + JSON.stringify( projectJSON));

                    socket.emit( 'listProjects', projectJSON);
                  }
                });
  					  });
  						// fs.readdirSync(projectDir).filter(function(project){
  						// 	if(fs.statSync(path.join(projectDir, project)).isDirectory()){
  						// 		if(! /^\..*/.test(project)){
  						// 			var jsonFileProj = projectDir +'/'+ project + '/' +project+'.json';
  						// 			var dataProj = fs.readFileSync(jsonFileProj,"UTF-8");
  						// 			var jsonObjProj = JSON.parse(dataProj);
  						// 			socket.emit('listChildren', {parentName:convertToSlug(jsonObj.name), childrenName:jsonObjProj.name, childrenImage:jsonObjProj.fileName});

  						//   	}
  						// 	}
  				  // 	});
  			  	}

  			  });
			});
		}

		// Modifier un dossier
		function onModifyFolder(folder){
			var oldFolder = folder.oldname;
			var oldFormatFolderName = convertToSlug(oldFolder);
			var oldFolderPath = contentDir +oldFormatFolderName;

			var newFolder = folder.name;
			var newFormatFolderName = convertToSlug(newFolder);
			var newFolderPath = contentDir +newFormatFolderName;
			console.log(newFolderPath);

			var newStatut = folder.statut;

			var currentDate = Date.now();

			// Vérifie si le dossier existe déjà
			fs.access(newFolderPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> change le nom du dossier et change le json
		    if (err) {
		      fs.renameSync(oldFolderPath, newFolderPath); // renomme le dossier
		      fs.renameSync(newFolderPath + '/' + oldFormatFolderName + '.json', newFolderPath + '/' + newFormatFolderName + '.json'); //renomme le json
		      changeJsonFile(newFolderPath + '/' + newFormatFolderName + '.json');
		    }
		    // S'il existe afficher un message d'erreur
		    else {
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

			function changeJsonFile(file){
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

		}

		// Supprimer un dossier
		function onRemoveFolder(folder){
			var folderName = convertToSlug(folder.name);
			var folderPath = contentDir + folderName;
			rmDir(folderPath);
			io.sockets.emit('folderRemoved');
		}

	// F I N     I N D E X    P A G E

	// P R O J E T S     P A G E
		// Liste les projets existants
		function listProject(session, socket){
			//console.log(socket);
			var dir = +session.session+"/";
			var sessionName;
			fs.readdir(dir, function (err, files) {
		  	if (err) {
		      console.log('Error: ', err);
		      return;
		    }
			  files.sort(function(a, b) {
	        return fs.statSync(dir + a).mtime.getTime() - fs.statSync(dir + b).mtime.getTime();
	      })
			  .forEach( function (file) {
			  	//console.log(file);
			  	if(fs.statSync(path.join(dir, file)).isDirectory()){
						if(! /^\..*/.test(file)){
							var jsonFile = dir + file + '/' +file+'.json';
							var data = fs.readFileSync(jsonFile,"UTF-8");
							var jsonObj = JSON.parse(data);
					    socket.emit('listProject', {name:jsonObj.name, sessionName: sessionName, created:jsonObj.created, modified:jsonObj.modified, statut:jsonObj.statut, image:jsonObj.fileName});
				  	}
					}
			  });
		  });
			// fs.readFile(dir + session.session+'.json', 'utf8', function (err, data) {
			//   if (err) console.log(err); return;
   //      if( data !== undefined) {
  	// 		  var JsonObjParent = JSON.parse(data);
  	// 		  sessionName = JsonObjParent.name;
  				// fs.readdirSync(dir).filter(function(file) {
  				// 	if(fs.statSync(path.join(dir, file)).isDirectory()){
  				// 		if(! /^\..*/.test(file)){
  				// 			var jsonFile = dir + file + '/' +file+'.json';
  				// 			var data = fs.readFileSync(jsonFile,"UTF-8");
  				// 			var jsonObj = JSON.parse(data);
  				// 	    socket.emit('listProject', {name:jsonObj.name, sessionName: sessionName, created:jsonObj.created, modified:jsonObj.modified, statut:jsonObj.statut, image:jsonObj.fileName});
  				//   	}
  				// 	}
  		  // 	});
  	// 	  }
			// });
		}

		function onNewProject(project) {
			var projectName = project.name;
			var formatProjectName = convertToSlug(projectName);
			var projectPath = contentDir + project.session+"/"+formatProjectName;
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
		      	var objectJson = {"session":project.session, "name":projectName, "fileName":project.image, "created":currentDate, "modified":null,"statut":'en cours', "files": {"images":[], "videos":[], "stopmotion":[], "audio":[], "texte":[]}};
		      	var objectToSend = {session: project.session, name: projectName, format: formatProjectName, image:true, created: currentDate, modified:null, statut:"en cours"};
		      	writeJsonFile(jsonFile, objectJson, objectToSend, "projectCreated"); //write json File
		      }
		      else{
		      	var objectJson= {"session":project.session, "name":projectName, "fileName":false, "created":currentDate, "modified":null,"statut":'en cours', "files": {"images":[], "videos":[], "stopmotion":[], "audio":[], "texte":[]}};
		      	var objectToSend = {session: project.session, name: projectName, format: formatProjectName, image:false, created: currentDate, modified:null, statut:"en cours"};
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
			changeJsonFile( contentDir +project.session+'/'+project.session+'.json');
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
			//console.log(project);
			var session = project.session;

			var oldProject = project.oldname;
			var oldFormatProjectName = convertToSlug(oldProject);
			var oldProjectPath = contentDir + session + '/' + oldFormatProjectName;

			var newProject = project.name;
			var newFormatProjectName = convertToSlug(newProject);
			var newProjectPath = contentDir + session + '/' + newFormatProjectName;

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
			console.log(project);
			var session = project.session;
			var projectName = convertToSlug(project.name);
			var projectPath = contentDir +session + '/' + projectName;
			rmDir(projectPath);
			io.sockets.emit('folderRemoved');
		}

	// F I N     P R O J E T S     P A G E

	// P R O J E T      P A G E
		function displayProject(data, socket){
			var dir = contentDir + data.session+"/"+data.project;
			var dirPubli = contentDir + data.session+"/"+data.project+'/montage';
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
			var dataImage = image.data;
			var session = image.session;
			var project = image.project;

			var imageBuffer = decodeBase64Image(dataImage);
			var currentDate = Date.now();
			var filePath = contentDir + session + '/' +project+"/"+ currentDate + '.jpg';
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

			var jsonFile = contentDir + session + '/'+ project+"/" +project+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);
			var jsonAdd = { "name" : currentDate};
			jsonObj["files"]["images"].push(jsonAdd);
			var objectToSend = {file: currentDate + ".jpg", extension:"jpg", session:session, projet:project, title: currentDate};
			writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewImage');
		}

		function onNewVideo(data){
			var currentDate = Date.now();
		  var fileName = currentDate;
		  var session = data.session;
		  var project = data.project

		  var projectDirectory = contentDir + session + '/'+ project;

		  writeToDisk(data.data.video.dataURL, fileName + '.webm', session, project);
		  io.sockets.emit('showVideo', {file: fileName + '.webm', session:session, project:project});
			io.sockets.emit('mediaCreated', {file:fileName + '.webm'});
		  //Write data to json
	    var jsonFile = contentDir + session + '/' +project + '/'+project+'.json';
			var jsonData = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(jsonData);
			var jsonAdd = { "name" : fileName};
			jsonObj["files"]["videos"].push(jsonAdd);
			var objectToSend = {file: fileName + ".webm", extension:"webm", session:session, project:project, title: fileName};
			writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewVideo');

	 		//Create thumbnails
	 		createThumnails(projectDirectory + "/" + fileName + ".webm", fileName, projectDirectory)
		}

		// Crée un nouveau dossier pour le stop motion
		function onNewStopMotion(data) {
			var StopMotionDirectory = contentDir + data.session +'/'+ data.project+'/01-stopmotion';
			if(StopMotionDirectory){
				fs.removeSync(StopMotionDirectory);
			}
			fs.ensureDirSync(StopMotionDirectory);
			// io.sockets.emit('newStopMotionDirectory', StopMotionDirectory);
		}

		// Ajoute des images au dossier du stop motion
		function onNewImageMotion(req) {
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
			filename = req.dir + '/' + req.count + '.png';
			fs.unlinkSync(filename, function (err) {
		  if (err) console.log(err);
		  	console.log('successfully deleted ' + filename);
			});
		}

		//Transforme les images en vidéos.
		function createStopMotion(req){
			var currentDate = Date.now();
			var fileName = currentDate;

			//SAVE VIDEO
			var videoPath = contentDir + req.session + '/' +req.project+'/'+ fileName + '.mp4';
			var projetDir = contentDir + req.session+"/"+req.project;
			//make sure you set the correct path to your video file
			var proc = new ffmpeg({ source: req.dir + '/%d.png'})
			  // using 12 fps
			  .withFpsInput(5)
			  .fps(5)
			  // setup event handlers
			  .on('end', function() {
			    console.log('file has been converted succesfully');
			    io.sockets.emit("newStopMotionCreated", {fileName:fileName + '.mp4', name:req.session, projet:req.project, dir:req.dir });
			  	createThumnails(videoPath, fileName, projetDir)
			  })
			  .on('error', function(err) {
			    console.log('an error happened: ' + err.message);
			  })
			  // save to file
			  .save(videoPath);
			  io.sockets.emit('mediaCreated', {file:fileName + '.mp4'});

			var jsonFile = contentDir + req.session + '/'+req.project+"/"+req.project+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);
			var jsonAdd = { "name" : currentDate};
			jsonObj["files"]["stopmotion"].push(jsonAdd);
			var objectToSend = {file: fileName + ".mp4", extension:"mp4", name:req.session, projet:req.project, title: fileName};
			writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewStopMotion');
		}

		// Audio
		function onNewAudioCapture(req){
			//write audio to disk
			var currentDate = Date.now();
			var fileName = currentDate;
	  	var fileWithExt = fileName + '.wav';
	  	var fileExtension = fileWithExt.split('.').pop(),
	      fileRootNameWithBase = './' + contentDir + req.session +'/'+ req.project +'/'+fileWithExt,
	      filePath = fileRootNameWithBase,
	      fileID = 2,
	      fileBuffer;

		    dataURL = req.data.audio.dataURL.split(',').pop();
		    fileBuffer = new Buffer(dataURL, 'base64');
		    fs.writeFileSync(filePath, fileBuffer);
		    io.sockets.emit('AudioFile', fileWithExt, req.session, req.project);
		    io.sockets.emit('mediaCreated', {file:fileWithExt});

				//add data to json file
				var jsonFile = contentDir + req.session + '/'+ req.project+'/'+req.project+'.json';
				var data = fs.readFileSync(jsonFile,"UTF-8");
				var jsonObj = JSON.parse(data);
				var jsonAdd = { "name" : currentDate};
				jsonObj["files"]["audio"].push(jsonAdd);
				var objectToSend = {file: fileName + ".wav", extension:"wav", name:req.session, projet:req.project,title: fileName};
				writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewAudio')
		}

		// Delete File
		function onDeleteFileBibli(req){
			var fileToDelete = contentDir + req.session +'/'+req.project+'/'+req.file;
			var extension = req.file.split('.').pop();
  		var identifiant =  req.id;
  		var thumbToDelete = contentDir + req.session +'/'+req.project+'/'+identifiant + '-thumb.png';
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
			//read json file to send data
			var jsonFile = contentDir + media.session + '/' + media.project +'/'+media.project+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);

			var dir = contentDir + media.session + '/' + media.project +'/';
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
			var dir = contentDir + txt.session + '/' + txt.project +'/';
			fs.readFile(dir + txt.file.file, 'utf8', function(err, data) {
			  if (err)
			    console.log( err);
			  else
  			  io.sockets.emit('txtRead', {obj:txt.file, content: markdown.toHTML(data)});
			});
		}

		function listPubli(data, socket){
			var dir = contentDir + data.session+"/"+data.project+'/montage';
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
			var folderName = publi.name;
			var formatFolderName = convertToSlug(folderName);
			var montagePath = contentDir + publi.session+'/'+publi.project+'/montage';
			var publiPath = contentDir + publi.session+'/'+publi.project+'/montage/' + formatFolderName + '.json';
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
			var file = contentDir + data.session+"/"+data.project+'/montage/'+data.name+'.json';
			console.log(file);
			fs.readFile(file, 'utf8', function (err, data) {
			  if (err) console.log(err);
			  var jsonObj = JSON.parse(data);
			  io.sockets.emit('displayMontage', {name:jsonObj.name, html:jsonObj.html});
			});
		}

		function saveMontage(req){
			var dir = contentDir + req.session + "/" + req.projet;
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
			var oldName = data.oldTitle;
			var oldFilePath = contentDir + data.session+'/'+data.project+'/montage/'+convertToSlug(oldName)+'.json';

			var newName = data.newTitle;
			var newFilePath = contentDir + data.session+'/'+data.project+'/montage/'+convertToSlug(newName)+'.json';

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
			var currentDate = Date.now();
			var jsonFile = contentDir + text.session + '/'+ text.project+"/" +text.project+'.json';
			var txtFile = contentDir + text.session + '/'+ text.project+"/" +currentDate+'.txt';
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
			var txtFile = contentDir + text.session + '/'+ text.project+"/" +text.id+'.txt';
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

      console.log( "--- onMediaLegende");

			var jsonFile = contentDir + data.session + '/'+ data.project+"/" +data.project+'.json';
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

      console.log( "Start of loop to add or edit media title/caption.");
			console.log( "ID of media = " + id + " and type of media is " + type);
			console.log( "Number of entries to parse : " + jsonObj['files'][type].length);

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
			var jsonFile = contentDir + data.session + '/'+ data.project+"/" +data.project+'.json';
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
			var jsonFile = contentDir + data.session + '/'+ data.project+"/" +data.project+'.json';
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
			var fileToDelete = contentDir + req.session +'/'+req.project+'/'+req.file;
			var extension = req.file.split('.').pop();
  		var identifiant =  req.file.replace("." + extension, "");
  		var thumbToDelete = contentDir + req.session +'/'+req.project+'/'+identifiant + '-thumb.png';
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
			var file = contentDir + data.session+"/"+data.project+'/montage/'+data.publi+'.json';
			fs.readFile(file, 'utf8', function (err, data) {
			  if (err) console.log(err);
			  var jsonObj = JSON.parse(data);
			  io.sockets.emit('sendPubliData', {name:jsonObj.name, html:jsonObj.html});
			});
		}
	// F I N     P U B L I     P A G E

	// - - -

	// C O M M O N      F U N C T I O N

    function getFullPath( path) {
      return contentDir + path;
    }
    function getJsonFileOfFolder( folderPath) {
      return getFullPath( folderPath) + '/dossier.json';
    }
    function getCurrentDate() {
      return moment().format('YYYYMMDD_HH:mm:ss');
    }

    function getFolderDataJSON( folderName) {

    	var folderJSONFile = getJsonFileOfFolder( folderName);

			var folderData = fs.readFileSync( folderJSONFile,"UTF-8");
			var folderJSONdata = JSON.parse(folderData);

      return {
			  "name" : folderJSONdata.name,
			  "created" : folderJSONdata.created,
			  "modified" : folderJSONdata.modified,
			  "statut" : folderJSONdata.statut,
			  "nb_projets" : folderJSONdata.nb_projets
			};
    }

    function getJsonFileOfProject( projectPath) {
      return getFullPath( projectPath) + '/projet.json';
    }

    function getProjectDataJSON( projectPath) {

      var projectJSONFile = getJsonFileOfProject( projectPath);

			var projectData = fs.readFileSync( projectJSONFile,"UTF-8");
			var projectJSONdata = JSON.parse(projectData);

      return {
			  "projectName" : projectJSONdata.name,
			};
    }

    function getProjectPreview( projectPath) {

      var projectFullPath = getFullPath( projectPath);
      dev.log( "1. Detecting preview");

      // looking for an image whose name starts with apercu or preview in this folder
      var filesInProjectFolder = fs.readdirSync( projectFullPath);
      var previewName = false;

      filesInProjectFolder.forEach( function( filename) {
        if( regexpMatchProjectPreviewNames.test(filename)) {
          previewName = filename;
          dev.log( "- 3. match preview called " + previewName);
        }
      });
      dev.log( "- 4. filename ? " + previewName);
      return previewName;

    }


		function writeToDisk(dataURL, fileName, session, projet) {
	    var fileExtension = fileName.split('.').pop(),
	        fileRootNameWithBase = './' + contentDir + session + '/' + projet + '/' + fileName,
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

		function writeJsonFile(jsonFile, objectJson, send){
			var jsonString = JSON.stringify(objectJson, null, 4);
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