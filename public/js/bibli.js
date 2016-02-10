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
	dragAndDrop();
	$('.montage-title .publi-btn').on('click', function(){
		var oldTitle = $('.montage-title h2').html();
		var newTitle = $('.montage-title input').val();
		$('.montage-title input').hide();
		$('.montage-title h2').show().html(newTitle);
		onMontageChanged(oldTitle, newTitle);
	});

	$('.montage-title .edit-btn').on('click', function(){
		$('.montage-title input').show().val($('.montage-title h2').html());
		$('.montage-title h2').hide();
	});

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
	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem.attr( 'id', id);
	mediaItem.find( 'img').attr('src', imagePath);

	$('.medias-list').prepend(mediaItem);
}

function displayVideo(session, project, id, file){
	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	$('.medias ul.medias-list').prepend(mediaItem);
}

function displayStopMotion(session, project, id, file){

	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	$('.medias ul.medias-list').prepend(mediaItem);
}

function displayAudio(session, project, id, file){
	var audioPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'source').attr( 'src', audioPath);

	$('.medias ul.medias-list').prepend(mediaItem);
}

function dragAndDrop(){
  var left = document.querySelector('.medias-list');
  var right = document.querySelector('.inner-montage');
	dragula([left, right], {
	  copy: function (el, source) {
	    return source === left;
	  },
	  accepts: function (el, target) {
      return target === right;
	  }
	})
	.on('dragend', function(el){
		console.log(el);
		onMontageChanged();
	});
}

function onMontageChanged(oldTitle, newTitle){
	var montageContent = $(".inner-montage").html();
	var newTitle = $('.montage-title h2').html();
	console.log(oldTitle, newTitle);
	socket.emit("saveMontage", {html:montageContent, session:currentSession, projet:currentProject, oldTitle:oldTitle, newTitle: newTitle});
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


