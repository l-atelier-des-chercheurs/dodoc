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
			console.log(folder);
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
			fs.readdirSync(dir).filter(function(file) {
				if(fs.statSync(path.join(dir, file)).isDirectory()){
					console.log(file);
					if(! /^\..*/.test(file)){
						var jsonFile = dir + file + '/' +file+'.json';
						var data = fs.readFileSync(jsonFile,"UTF-8");
						var jsonObj = JSON.parse(data);
				    io.sockets.emit('listProject', {name:jsonObj.name, created:jsonObj.created, modified:jsonObj.modified, statut:jsonObj.statut, image:jsonObj.fileName});
			  	}
				}
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
		      	var objectJson = {"session":project.session, "name":projectName, "fileName":project.imageName, "created":currentDate, "modified":null,"statut":'en cours', "files": {"images":[], "videos":[], "stopmotion":[], "audio":[], "texte":[]}};
		      	var objectToSend = {session: project.session, name: projectName, format: formatProjectName, imageName:project.imageName, created: currentDate, modified:null, statut:"en cours"};
		      	writeJsonFile(jsonFile, objectJson, objectToSend, "projectCreated"); //write json File
		      }
		      else{
		      	var objectJson= {"session":project.session, "name":projectName, "fileName":"none", "created":currentDate, "modified":null,"statut":'en cours', "files": {"images":[], "videos":[], "stopmotion":[], "audio":[], "texte":[]}};
		      	var objectToSend = {session: project.session, name: projectName, format: formatProjectName, imageName:"none", created: currentDate, modified:null, statut:"en cours"};
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
			console.log(project);
			var session = project.session;

			var oldProject = project.oldname;
			var oldFormatProjectName = convertToSlug(oldProject);
			var oldProjectPath = 'sessions/'+ session + '/' + oldFormatProjectName;
			
			var newProject = project.name;
			var newFormatProjectName = convertToSlug(newProject);
			var newProjectPath = 'sessions/'+ session + '/' + newFormatProjectName;
			console.log(newProjectPath);

			var newStatut = project.statut;
			var currentDate = Date.now();

			// Vérifie si le dossier existe déjà
			fs.access(newProjectPath, fs.F_OK, function(err) {
				// S'il n'existe pas -> change le nom du dossier et change le json
		    if (err) {
		      fs.renameSync(oldProjectPath, newProjectPath); // renomme le dossier
		      fs.renameSync(newProjectPath + '/' + oldFormatProjectName + '.json', newProjectPath + '/' + newFormatProjectName + '.json'); //renomme le json
		      changeJsonFile(newProjectPath + '/' + newFormatProjectName + '.json');
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
		    	}
		    }
			});

			function changeJsonFile(file){
				var jsonContent = fs.readFileSync(file,"UTF-8");
				var jsonObj = JSON.parse(jsonContent);
				jsonObj.name = project.name;
				jsonObj.modified = currentDate;
				jsonObj.statut = newStatut;
				var jsonString = JSON.stringify(jsonObj);
				fs.writeFileSync(file, jsonString);
				console.log("Projet modifié");
				io.sockets.emit("projectModified", {name: project.name, created: jsonObj.created, modified:currentDate, statut:newStatut, nb_projets:jsonObj.nb_projets});
			}

		}

	// F I N     P R O J E T S     P A G E

	// - - - 

	// C O M M O N      F U N C T I O N
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