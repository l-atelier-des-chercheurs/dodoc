/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;

var thisProjectName;
var thisProject;
var imageData = null;
var imageName;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){
	// Create new project
	uploadImage($("#imageproject"));
	submitProject($(".submit-new-project"), 'newProject'); //Envoie les données au serveur
}

// Envoie les données du dossier au serveur
function submitProject($button, send){
	$button.on('click', function(){
		var newProjectName = $('input.new-project').val();
		if(imageData != null){
			console.log('Une image a été ajoutée');
			var f = imageData[0];
			var reader = new FileReader();
			reader.onload = function(evt){
				socket.emit(send, {session: currentSession, name: newProjectName, file:evt.target.result, imageName:imageName});
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			socket.emit(send, {session: currentSession, name: newProjectName});
		}
		$('input.new-project').val('');
		$('#imageproject').val('');
	})
}

// Helpers
function uploadImage($button){
	$button.bind('change', function(e){
  	imageData = e.originalEvent.target.files;
  	//change the label of the button in the name of the image
  	imageName = this.files[0].name;
	  var dflt = $(this).attr("placeholder");
	  if($(this).val()!=""){
	    $(this).next().text(imageName);
	  } else {
	    $(this).next().text(dflt);
	  }
	});
}


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};
