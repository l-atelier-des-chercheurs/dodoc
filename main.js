var fs = require('fs-extra'),
	glob = require("glob"),
	path = require("path"),
	gm = require('gm'),
	markdown = require( "markdown" ).markdown,
	exec = require('child_process').exec,
	phantom = require('phantom'),
	ffmpeg = require('fluent-ffmpeg'),
	sprintf = require("sprintf-js").sprintf,
	vsprintf = require("sprintf-js").vsprintf;


module.exports = function(app, io){

	console.log("main module initialized");

	// VARIABLES
	var sessions_p = "sessions/";
	var session_list = [];

	io.on("connection", function(socket){

		// I N D E X    P A G E 
		listFolder();
		socket.on("newFolder", onNewFolder);
		socket.on("modifyFolder", onModifyFolder);
		socket.on("removeFolder", onRemoveFolder);

		// P R O J E T S     P A G E
		socket.on("listProject", listProject);
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
		socket.on("listMedias", listMedias);
		socket.on("listPubli", listPubli);
		socket.on("createPubli", newPublication);
		socket.on("displayThisMontage", displayMontage);
		socket.on("saveMontage", saveMontage);
		socket.on("titleChanged", onTitleChanged);

		// P U B L I      P A G E 
		socket.on("displayPubli", displayPubli);


	});


// ------------- F U N C T I O N S -------------------

	// I N D E X     P A G E 

		// Créer un nouveau dossier 
		function onNewFolder(folder) {
			var folderName = folder.name;
			var formatFolderName = convertToSlug(folderName);
			var folderPath = 'sessions/'+formatFolderName;
			var currentDate = Date.now();

			// Vérifie si le dossier existe déjà
			fs.access(folderPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> créer le dossier et le json
		    if (err) {
		    	console.log("dossier crée");
		      fs.ensureDirSync(folderPath);//write new folder in sessions
		      
		      var jsonFile = 'sessions/' + formatFolderName + '/' +formatFolderName+'.json';
		      var objectJson = {"name":folderName, "created":currentDate, "modified":null, "statut":'en cours', "nb_projets":0};
		      var objectToSend = {name: folderName, created: currentDate, modified:null, statut:"en cours", nb_projets:0 };
		      writeJsonFile(jsonFile, objectJson, objectToSend, "folderCreated"); //write json File
		    } 
		    // S'il existe afficher un message d'erreur
		    else {
		      console.log("le dossier existe déjà !");
		      io.sockets.emit("folderAlreadyExist", {name: folderName, timestamp: currentDate });
		    }
			});
		}

		// Liste les dossiers déjà existant
		function listFolder(){
			var dir = "sessions/";
			fs.readdir(dir, function (err, files) {
				if(dir == ".DS_Store"){
			   	fs.unlink(dir);
			  }
				if (err) {
		      console.log('Error: ', err);
		      return;
		    }
			  files.forEach( function (file) {
			  	if(file == ".DS_Store"){
			    	fs.unlink(dir+file);
			    }
			    if(! /^\..*/.test(file)){
			    	// Folder data
				  	var jsonFile = dir + file + '/' +file+'.json';
						var data = fs.readFileSync(jsonFile,"UTF-8");
						var jsonObj = JSON.parse(data);
						io.sockets.emit('listFolder', {name:jsonObj.name, created:jsonObj.created, modified:jsonObj.modified, statut:jsonObj.statut, nb_projets:jsonObj.nb_projets});
						// read all projects into folders
						var projectDir = dir + file;
						fs.readdirSync(projectDir).filter(function(project){
							if(fs.statSync(path.join(projectDir, project)).isDirectory()){
								// console.log(project);
								if(! /^\..*/.test(project)){
									var jsonFileProj = projectDir +'/'+ project + '/' +project+'.json';
									var dataProj = fs.readFileSync(jsonFileProj,"UTF-8");
									var jsonObjProj = JSON.parse(dataProj);
									io.sockets.emit('listChildren', {parentName:convertToSlug(jsonObj.name), childrenName:jsonObjProj.name, childrenImage:jsonObjProj.fileName});
						  		
						  	}
							}
				  	});
			  	}

			  });
			});
		}

		// Modifier un dossier
		function onModifyFolder(folder){
			var oldFolder = folder.oldname;
			var oldFormatFolderName = convertToSlug(oldFolder);
			var oldFolderPath = 'sessions/'+oldFormatFolderName;
			
			var newFolder = folder.name;
			var newFormatFolderName = convertToSlug(newFolder);
			var newFolderPath = 'sessions/'+newFormatFolderName;
			console.log(newFolderPath);

			var newStatut = folder.statut;
			
			var currentDate = Date.now();

			// Vérifie si le dossier existe déjà
			fs.access(newFolderPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> change le nom du dossier et change le json
		    if (err) {
		      fs.renameSync(oldFolderPath, newFolderPath); // renomme le dossier
		      fs.renameSync(newFolderPath + '/' + oldFormatFolderName + '.json', newFolderPath + '/' + newFormatFolderName + '.json'); //renomme le json
		      changeJsonFile(newFolderPath + '/' + newFormatFolderName + '.json');
		    } 
		    // S'il existe afficher un message d'erreur
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
			var folderPath = 'sessions/'+folderName;
			rmDir(folderPath);
			io.sockets.emit('folderRemoved');
		}

	// F I N     I N D E X    P A G E

	// P R O J E T S     P A G E
		// Liste les projets existants
		function listProject(session){
			var dir = "sessions/"+session.session+"/";
			var sessionName;
			fs.readFile(dir + session.session+'.json', 'utf8', function (err, data) {
			  if (err) console.log(err);
			  var JsonObjParent = JSON.parse(data);
			  sessionName = JsonObjParent.name;
				fs.readdirSync(dir).filter(function(file) {
					if(fs.statSync(path.join(dir, file)).isDirectory()){
						if(! /^\..*/.test(file)){
							var jsonFile = dir + file + '/' +file+'.json';
							var data = fs.readFileSync(jsonFile,"UTF-8");
							var jsonObj = JSON.parse(data);
							//console.log(sessionName);
					    io.sockets.emit('listProject', {name:jsonObj.name, sessionName: sessionName, created:jsonObj.created, modified:jsonObj.modified, statut:jsonObj.statut, image:jsonObj.fileName});
				  	}
					}
		  	});
			});
		}
		
		function onNewProject(project) {
			var projectName = project.name;
			var formatProjectName = convertToSlug(projectName);
			var projectPath = 'sessions/'+project.session+"/"+formatProjectName;
			var currentDate = Date.now();

			// Vérifie si le projet existe déjà
			fs.access(projectPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> créer le dossier et le json
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
		    // S'il existe afficher un message d'erreur
		    else {
		      console.log("le dossier existe déjà !");
		      io.sockets.emit("folderAlreadyExist", {name: projectName, timestamp: currentDate });
		    }
			});

			//Change le nombre de projets dans le dossier parent
			changeJsonFile('sessions/'+project.session+'/'+project.session+'.json');
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
			var oldProjectPath = 'sessions/'+ session + '/' + oldFormatProjectName;
			
			var newProject = project.name;
			var newFormatProjectName = convertToSlug(newProject);
			var newProjectPath = 'sessions/'+ session + '/' + newFormatProjectName;

			var newStatut = project.statut;
			var currentDate = Date.now();
			var ifImage;

			// Vérifie si le dossier existe déjà
			fs.access(newProjectPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> change le nom du dossier et change le json
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
		    // S'il existe afficher un message d'erreur
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
			var projectPath = 'sessions/'+session + '/' + projectName;
			rmDir(projectPath);
			io.sockets.emit('folderRemoved');
		}

	// F I N     P R O J E T S     P A G E

	// P R O J E T      P A G E
		function displayProject(data){
			var dir = "sessions/"+data.session+"/"+data.project;
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
					console.log(jsonObj, lastMedia);

					io.sockets.emit('sendProjectData',{json:jsonObj , lastmedia:lastMedia });
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
			var filePath = 'sessions/' + session + '/' +project+"/"+ currentDate + '.jpg';
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
			
			var jsonFile = 'sessions/' + session + '/'+ project+"/" +project+'.json';
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
		  
		  var projectDirectory = 'sessions/' + session + '/'+ project;

		  writeToDisk(data.data.video.dataURL, fileName + '.webm', session, project);
		  io.sockets.emit('showVideo', {file: fileName + '.webm', session:session, project:project});
			io.sockets.emit('mediaCreated', {file:fileName + '.webm'});	    
		  //Write data to json
	    var jsonFile = 'sessions/' + session + '/' +project + '/'+project+'.json';
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
			var StopMotionDirectory = 'sessions/' + data.session +'/'+ data.project+'/01-stopmotion';
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
			var videoPath = 'sessions/' + req.session + '/' +req.project+'/'+ fileName + '.mp4';
			var projetDir = 'sessions/' + req.session+"/"+req.project;
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

			var jsonFile = 'sessions/' + req.session + '/'+req.project+"/"+req.project+'.json';
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
	      fileRootNameWithBase = './sessions/' + req.session +'/'+ req.project +'/'+fileWithExt,
	      filePath = fileRootNameWithBase,
	      fileID = 2,
	      fileBuffer;

		    dataURL = req.data.audio.dataURL.split(',').pop();
		    fileBuffer = new Buffer(dataURL, 'base64');
		    fs.writeFileSync(filePath, fileBuffer);
		    io.sockets.emit('AudioFile', fileWithExt, req.session, req.project);
		    io.sockets.emit('mediaCreated', {file:fileWithExt});

				//add data to json file
				var jsonFile = 'sessions/' + req.session + '/'+ req.project+'/'+req.project+'.json';
				var data = fs.readFileSync(jsonFile,"UTF-8");
				var jsonObj = JSON.parse(data);
				var jsonAdd = { "name" : currentDate};
				jsonObj["files"]["audio"].push(jsonAdd);
				var objectToSend = {file: fileName + ".wav", extension:"wav", name:req.session, projet:req.project,title: fileName};
				writeIntoJsonFile(jsonFile, jsonObj, objectToSend, 'displayNewAudio')
		}

		// Delete File
		function deleteFile(req){
			var fileToDelete = 'sessions/' + req.session +'/'+req.project+'/'+req.file;
			var extension = req.file.split('.').pop();
  		var identifiant =  req.file.replace("." + extension, "");			
  		var thumbToDelete = 'sessions/' + req.session +'/'+req.project+'/'+identifiant + '-thumb.png';
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
	// F I N     C A P T U R E    P A G E 

	// B I B L I    P A G E 
		function listMedias(media){
			//read json file to send data
			var jsonFile = 'sessions/' + media.session + '/' + media.project +'/'+media.project+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);

			var dir = "sessions/" + media.session + '/' + media.project +'/';
			//console.log(dir);
			fs.readdir(dir, function(err, files) {
				var media = [];
				if (err) {console.log(err)};
				files.forEach(function(f) {
					media.push(f);
				});
				io.sockets.emit('listMedias', media, jsonObj);
			});
		}

		function listPubli(data){
			var dir = "sessions/"+data.session+"/"+data.project+'/montage';
			// Vérifie si le dossier existe déjà
			fs.access(dir, fs.F_OK, function(err) {
		    if (err) { }
		    // S'il existe 
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
								io.sockets.emit('listPublications', {name:jsonObj.name, created:jsonObj.created});
				    	}
				    });
					});
		    }
			});
		}

		function newPublication(publi){
			var folderName = publi.name;
			var formatFolderName = convertToSlug(folderName);
			var montagePath = 'sessions/'+publi.session+'/'+publi.project+'/montage';
			var publiPath = 'sessions/'+publi.session+'/'+publi.project+'/montage/' + formatFolderName + '.json';
			var currentDate = Date.now();

			// Vérifie si le dossier existe déjà
			fs.access(montagePath, fs.F_OK, function(err) {
				// S'il n'existe pas -> créer le dossier et le json
		    if (err) {
		      fs.ensureDirSync(montagePath,function(){
		      	console.log("dossier montage crée");
						createPubliJson();
		      });

		    } 
		    // S'il existe 
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
			var file = "sessions/"+data.session+"/"+data.project+'/montage/'+data.name+'.json';
			console.log(file);
			fs.readFile(file, 'utf8', function (err, data) {
			  if (err) console.log(err);
			  var jsonObj = JSON.parse(data);
			  io.sockets.emit('displayMontage', {name:jsonObj.name, html:jsonObj.html});
			});
		}

		function saveMontage(req){
			var dir = 'sessions/'+ req.session + "/" + req.projet;
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
			var oldFilePath = 'sessions/'+data.session+'/'+data.project+'/montage/'+convertToSlug(oldName)+'.json';
			
			var newName = data.newTitle;
			var newFilePath = 'sessions/'+data.session+'/'+data.project+'/montage/'+convertToSlug(newName)+'.json';

			// Vérifie si le dossier existe déjà
			fs.access(newFilePath, fs.F_OK, function(err) {
				// S'il n'existe pas -> change le nom du json
		    if (err) {
		      fs.renameSync(oldFilePath, newFilePath); // renomme le fichier
		      changeJsonFile(newFilePath);
		    } 
		    // S'il existe afficher un message d'erreur
		    else {
		    	if(convertToSlug(oldName) != convertToSlug(newName)){
		    		console.log("le dossier existe déjà !");
		      	io.sockets.emit("folderAlreadyExist", {name: newName, timestamp: currentDate });
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

	// F I N    B I B L I    P A G E 

	// P U B L I     P A G E 
		function displayPubli(data){
			var file = "sessions/"+data.session+"/"+data.project+'/montage/'+data.publi+'.json';
			fs.readFile(file, 'utf8', function (err, data) {
			  if (err) console.log(err);
			  var jsonObj = JSON.parse(data);
			  io.sockets.emit('sendPubliData', {name:jsonObj.name, html:jsonObj.html});
			});
		}
	// F I N     P U B L I     P A G E 

	// - - - 

	// C O M M O N      F U N C T I O N
		function writeToDisk(dataURL, fileName, session, projet) {
	    var fileExtension = fileName.split('.').pop(),
	        fileRootNameWithBase = './sessions/' + session + '/' + projet + '/' + fileName,
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

		function writeJsonFile(jsonFile, objectJson, objectToSend, send){
			var jsonString = JSON.stringify(objectJson, null, 4);
			fs.appendFile(jsonFile, jsonString, function(err) {
	      if(err) {
	          console.log(err);
	      } 
	      else {
	        console.log("Le dossier été crée!");
	      	io.sockets.emit(send, objectToSend);
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