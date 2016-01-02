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


	});


// ------------- F U N C T I O N S -------------------

	// I N D E X     P A G E 

	// Créer un nouveau dossier 
	function onNewFolder(folder) {
		var folderName = folder.name;
		var formatFolderName = folderName.replace(/ /g,"_");
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

	// F I N     I N D E X    P A G E

	// - - - 
}