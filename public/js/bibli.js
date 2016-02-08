/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;
var sessionName ;
//get current project
var currentProject = app.projet;


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('displayNewImage', displayNewImage);

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){

}

function displayNewImage(image){
	
	$('.medias ul.medias-list')
 $('.mediaContainer').append("<li class='media images-bibli' id='"+ images.title+"' data-type='image'><div class='mediaContent'><img src='https://"+domainUrl + "/" +app.session +"/"+ app.projet+ "/"+ images.file + "' preload='none'></div><h3 class='mediaTitre'>" +time+ "</h3></li>");
}

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


