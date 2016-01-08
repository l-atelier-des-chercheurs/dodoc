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
	      fs.ensureDirSync(folderPath);
	      writeJsonFile(formatFolderName);
	    } 
	    // S'il existe afficher un message d'erreur
	    else {
	      console.log("le dossier existe déjà !");
	      io.sockets.emit("folderAlreadyExist", {name: folderName, timestamp: currentDate });
	    }
		});

		function writeJsonFile(fichier){
	  	var jsonFile = 'sessions/' + fichier + '/' +fichier+'.json';
	  	console.log(jsonFile);
			var objectJson = {"name":folderName, "created":currentDate, "modified":null, statut:'en cours', nb_projets:0};
			var jsonString = JSON.stringify(objectJson);
			fs.appendFile(jsonFile, jsonString, function(err) {
	      if(err) {
	          console.log(err);
	      } 
	      else {
	        console.log("Le dossier été crée!");
	        io.sockets.emit("folderCreated", {name: folderName, created: currentDate, modified:null, statut:"en cours", nb_projets:0 });
	      }
	    });
	  }
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
			  	var jsonFile = dir + file + '/' +file+'.json';
					var data = fs.readFileSync(jsonFile,"UTF-8");
					var jsonObj = JSON.parse(data);
			  	io.sockets.emit('listFolder', {name:jsonObj.name, created:jsonObj.created, modified:jsonObj.modified, statut:jsonObj.statut, nb_projets:jsonObj.nb_projets});
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
	      //writeJsonFile(formatFolderName);
	      changeJsonFile(newFolderPath + '/' + newFormatFolderName + '.json');
	    } 
	    // S'il existe afficher un message d'erreur
	    else {
	      console.log("le dossier existe déjà !");
	      io.sockets.emit("folderAlreadyExist", {name: newFolder, timestamp: currentDate });
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
			io.sockets.emit("folderModified", {name: folder.name, created: jsonObj.created, modified:currentDate, statut:newStatut, nb_projets:0});
		}

	}

	// Supprimer un dossier
	function onRemoveFolder(folder){
		console.log(folder);
		var folderName = convertToSlug(folder.name);
		var folderPath = 'sessions/'+folderName;
		rmDir(folderPath);
	}

	// F I N     I N D E X    P A G E

	// - - - 

	// H E L P E R S 
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