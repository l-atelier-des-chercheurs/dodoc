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
socket.on('displayNewVideo', displayNewVideo);
socket.on('displayNewStopMotion', displayNewStopMotion);
socket.on('displayNewAudio', displayNewAudio);
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

function displayNewVideo(video){
	displayVideo(currentSession, currentProject, video.title, video.file);
}

function displayNewStopMotion(video){
	displayStopMotion(currentSession, currentProject, video.title, video.file);
}

function displayNewAudio(audio){
	displayAudio(currentSession, currentProject, audio.title, audio.file);
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
			displayVideo(currentSession, currentProject, identifiant, array[i]);
		}
		if(extension == "mp4"){
			displayVideo(currentSession, currentProject, identifiant, array[i]);
		}
		if(extension == "wav"){
			displayAudio(currentSession, currentProject, identifiant, array[i]);
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

function displayVideo(session, project, id, file){
	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;
	var video = '<video preload="none" controls poster="'+thumbPath+'"><source src="'+videoPath+'"></video>';
	var divMedia = '<div class="mediaContent">'+video+'</div>';
	var htmlToAdd = '<li class="media videos-bibli" id="'+id+'" data-type="video">'+divMedia+'</li>';
	$('.medias ul.medias-list').prepend(htmlToAdd);
}

function displayStopMotion(session, project, id, file){
	console.log('display stop mo');
	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;
	var video = '<video preload="none" controls poster="'+thumbPath+'"><source src="'+videoPath+'"></video>';
	var divMedia = '<div class="mediaContent">'+video+'</div>';
	var htmlToAdd = '<li class="media stopmotion-bibli" id="'+id+'" data-type="stopmotion">'+divMedia+'</li>';
	$('.medias ul.medias-list').prepend(htmlToAdd);
}

function displayAudio(session, project, id, file){
	var audioPath = '/'+session +'/'+ project+ '/' + file;
	var audio = '<audio preload="none" controls><source src="'+audioPath+'"></audio>';
	var divMedia = '<div class="mediaContent">'+audio+'</div>';
	var htmlToAdd = '<li class="media sons-bibli" id="'+id+'" data-type="son">'+divMedia+'</li>';
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


