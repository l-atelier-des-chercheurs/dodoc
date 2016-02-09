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

		// C A P T U R E     P A G E
		socket.on("imageCapture", onNewImage);
		socket.on("videoRecorded", onNewVideo);
		
		// B I B L I        P A G E 
		socket.on("listMedias", listMedias);


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
						fs.readdirSync(projectDir).filter(function(project) {
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
				var jsonString = JSON.stringify(jsonObj);
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
			  if (err) throw err;
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
				var jsonString = JSON.stringify(jsonObj);
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
				var jsonString = JSON.stringify(jsonObj);
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
				}
			});
			
			var jsonFile = 'sessions/' + session + '/'+ project+"/" +project+'.json';
			var data = fs.readFileSync(jsonFile,"UTF-8");
			var jsonObj = JSON.parse(data);
			var jsonAdd = { "name" : currentDate};
			jsonObj["files"]["images"].push(jsonAdd);
			fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
	      if(err) {
	          console.log(err);
	      } else {
	          console.log("The file was saved!");
	      }
	    });
	    io.sockets.emit("displayNewImage", {file: currentDate + ".jpg", extension:"jpg", session:session, projet:project, title: currentDate});
		}

		function onNewVideo(data){
			//console.log(data.data);
			var currentDate = Date.now();
		  var fileName = currentDate;
		  var session = data.session;
		  var project = data.project
		  
		  var projectDirectory = 'sessions/' + session + '/'+ project;

		  writeToDisk(data.data.video.dataURL, fileName + '.webm', session, project);
		  io.sockets.emit('showVideo', {file: fileName + '.webm', session:session, project:project});
		    
		    //Write data to json
		  //   var jsonFile = 'sessions/' + data.name + '/' +data.projet + '/'+data.projet +'.json';
				// var jsonData = fs.readFileSync(jsonFile,"UTF-8");
				// var jsonObj = JSON.parse(jsonData);
				// var jsonAdd = { "name" : fileName};
				// jsonObj["files"]["videos"].push(jsonAdd);
				// fs.writeFile(jsonFile, JSON.stringify(jsonObj), function(err) {
		  //     if(err) {
		  //         console.log(err);
		  //     } else {
		  //         console.log("The file was saved!");
		  //     }
		  //   });
		 	// 	var proc = ffmpeg(projetDirectory + "/" + fileName + ".webm")
			 //  // set the size of your thumbnails
			 //  //.size('150x100')
			 //  // setup event handlers
			 //  .on('end', function(files) {
			 //    console.log('screenshots were saved as ' + files);
			 //  })
			 //  .on('error', function(err) {
			 //    console.log('an error happened: ' + err.message);
			 //  })
			 //  // take 2 screenshots at predefined timemarks
			 //  .takeScreenshots({ count: 1, timemarks: [ '00:00:01'], filename: fileName + "-thumb.png"}, projetDirectory);
			  
			 //  io.sockets.emit("displayNewVideo", {file: fileName + ".webm", extension:"webm", name:data.name, projet:data.projet, title: fileName});
		}
	// F I N     C A P T U R E    P A G E 

	// B I B L I    P A G E 
	function listMedias(media){
		console.log(media.project);
		//read json file to send data
		var jsonFile = 'sessions/' + media.session + '/' + media.project +'/'+media.project+'.json';
		var data = fs.readFileSync(jsonFile,"UTF-8");
		var jsonObj = JSON.parse(data);

		var dir = "sessions/" + media.session + '/' + media.project +'/';
		console.log(dir);
		fs.readdir(dir, function(err, files) {
			var media = [];
			if (err) {console.log(err)};
			files.forEach(function(f) {
				media.push(f);
			});
			io.sockets.emit('listMedias', media, jsonObj);
		});
	}
	// F I N    B I B L I    P A G E 

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

		function writeJsonFile(jsonFile, objectJson, objectToSend, send){
			var jsonString = JSON.stringify(objectJson);
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
	    return Text
	    .toLowerCase()
	    .replace(/ /g,'-')
	    .replace(/[^\w-]+/g,'')
	    ;
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