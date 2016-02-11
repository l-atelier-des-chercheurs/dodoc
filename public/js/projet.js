/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;
//get current project
var currentProject = app.projet;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('sendProjectData', sendProjectData);


jQuery(document).ready(function($) {

	init();
});

function init(){


}

function sendProjectData(data){
	var name = data.json.name;
	var statut = data.json.statut;
	var created = transformDatetoString(data.json.created);
	var modified = transformDatetoString(data.json.created);
	var array = data.lastmedia;
	var arrayPubli = data.publiNames;

	$('h1.project').html(name);
	$('.statut').html('<span>statut</span><span class="statut-type"> '+statut+'</span>');
	$('.created').html('<span>crée le </span><span class="create-date">'+created+'</span>');
	if(modified != null){
		$('.modified').html('<span>modifié le </span><span class="modify-date">'+modified+'</span>');
	}

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

	for (var i = 0; i < arrayPubli.length; i++) {
		console.log(arrayPubli[i]);
		var publiPath = '/'+currentSession+'/'+currentProject+'/publication/'+ convertToSlug(arrayPubli[i]);
		var publiPath = '/'+currentSession+'/'+currentProject+'/bibliotheque?mode=publi&publi='+ convertToSlug(arrayPubli[i]);

    debugger;
		var publiItem = $(".js--templates .publi-folder").clone(false);
		publiItem
			.find( 'h2').html(arrayPubli[i]).end()
			.find( '.js--edit_view', publiPath).attr('href', publiPath).end()
			.find( '.js--publi_view', publiPath).attr('href', publiPath).end()
		;

		$('.list-publi ul').prepend(publiItem);
	}
}

function displayImage(session, project, id, file){
	var imagePath = "/" +session +"/"+ project+ "/"+ file;
	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem.attr( 'id', id);
	mediaItem.find( 'img').attr('src', imagePath);

	$('.last-medias ul').prepend(mediaItem);
}

function displayVideo(session, project, id, file){
	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	$('.last-medias ul').prepend(mediaItem);
}

function displayStopMotion(session, project, id, file){

	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	$('.last-medias ul').prepend(mediaItem);
}

function displayAudio(session, project, id, file){
	var audioPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'source').attr( 'src', audioPath);

	$('.last-medias ul').prepend(mediaItem);
}

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('displayProject', {session: currentSession, project: currentProject});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};