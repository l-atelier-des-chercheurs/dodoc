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
socket.on('listMedias', onListMedias);

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){

}

function displayNewImage(image){
	displayImage(currentSession, currentProject, image.title, image.file);
}

function onListMedias(array, json){
	$(".mediaContainer li").remove();
	var matchID = $(".mediaContainer .media").attr("id");
	for (var i = 0; i < array.length; i++) {
  	var extension = array[i].split('.').pop();
  	var identifiant =  array[i].replace("." + extension, "");
		if(extension == "jpg"){
			displayImage(currentSession, currentProject, identifiant, array[i]);
		}
		if(extension == "webm"){
			$('.mediaContainer').append("<li class='media videos-bibli' id='"+ identifiant+"' data-type='video'><div class='mediaContent'><video preload='none' controls poster='https://"+domainUrl + "/"+app.session + "/"+ app.projet+ "/"+identifiant +"-thumb.png'><source src='https://"+domainUrl + "/"+app.session +"/"+ app.projet+ "/" + array[i] + "'></video></div></li>");
		}
		if(extension == "mp4"){
			$('.mediaContainer').append("<li class='media stopmotion-bibli' id='"+ identifiant+"' data-type='stopmotion'><div class='mediaContent'><video preload='none' controls poster='https://"+domainUrl + "/"+app.session +"/"+ app.projet+ "/"+identifiant +"-thumb.png'><source src='https://"+domainUrl + "/"+app.session +"/"+ app.projet+ "/" + array[i] + "'></video></div></li>");
		}
		if(extension == "wav"){
			$('.mediaContainer').append("<li class='media sons-bibli' id='"+ identifiant+"' data-type='son'><div class='mediaContent'><audio src='https://"+domainUrl + "/"+app.session +"/"+ app.projet+ "/" + array[i] + "' preload='none' controls></div></li>");
		}
	}

	$(".media").on("mouseenter", function(){
		$(this).css("cursor", 'pointer');
	});

}

function displayImage(session, project, id, file){
	var imagePath = "/" +session +"/"+ project+ "/"+ file; 
	var divMedia = '<div class="mediaContent"><img src="'+imagePath+'" preload="none"></div>';
	var htmlToAdd = '<li class="media images-bibli" id="'+id+'" data-type="image">'+divMedia+'</li>';
	$('.medias ul.medias-list').prepend(htmlToAdd);
}

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listMedias', {session: currentSession, project: currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


