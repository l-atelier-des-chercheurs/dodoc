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
	var image = data.json.image;
	var created = transformDatetoString(data.json.created);
	var modified = transformDatetoString(data.json.created);
	var lastMedias = data.lastmedia;
	var arrayPubli = data.publiNames;

	var formatName = convertToSlug(name);

	var projectClone = $(".js--templates > .project").clone(false);
	projectClone
		.find( '.title').html( name).end()
	  .attr( 'data-statut', statut)
	  .find( '.statut-type').text( statut).end()


	  .find( '.image-wrapper img').attr('src', image === true ? '/'+currentSession+'/'+formatName+'/'+formatName+'-thumb.jpg' : '').attr('alt', name).end()
	  .find( '.create-date').text( created).end()
	  .find( '.modify-date').text( modified !== null ? modified : '').end()
	  .find( '.title').text( name).end()
	  .find( '.project-link').attr( 'href', '/'+currentSession+'/'+formatName).end()
	  .find( '.button-wrapper_capture').attr( 'href', '/'+currentSession+'/'+formatName+'/capture').end()
	  .find( '.button-wrapper_bibli').attr( 'href', '/'+currentSession+'/'+formatName+'/bibliotheque').end()
	  .find( '.button-wrapper_publi').attr( 'href', '/'+currentSession+'/'+formatName+'/bibliotheque#publi').end()

		.find( '.js--publi_view', publiPath).attr('href', publiPath).end()
	;

	var allMedias = $();

	for (var i = 0; i < lastMedias.length; i++) {
  	var extension = lastMedias[i].split('.').pop();
  	var identifiant =  lastMedias[i].replace("." + extension, "");
    var fileName = lastMedias[i];

		if(extension == "jpg"){
			allMedias = allMedias.add( displayImage(currentSession, currentProject, identifiant, fileName));
		}
		if(extension == "webm"){
			allMedias = allMedias.add( displayVideo(currentSession, currentProject, identifiant, fileName));
		}
		if(extension == "mp4"){
			allMedias = allMedias.add( displayVideo(currentSession, currentProject, identifiant, fileName));
		}
		if(extension == "wav"){
			allMedias = allMedias.add( displayAudio(currentSession, currentProject, identifiant, fileName));
		}
	}
	
	projectClone.find( '.last-medias').append( allMedias);
	for (var i = 0; i < arrayPubli.length; i++) {
		var publiPath = '/'+currentSession+'/'+currentProject+'/publication/'+ convertToSlug(arrayPubli[i]);
		var publiPath = '/'+currentSession+'/'+currentProject+'/bibliotheque?mode=publi&publi='+ convertToSlug(arrayPubli[i]);

		var publiItem = $(".js--templates > .publi-folder").clone(false);
		publiItem
			.find( 'h2').html(arrayPubli[i]).end()
			.find( '.js--edit_view', publiPath).attr('href', publiPath).end()
			.find( '.js--publi_view', publiPath).attr('href', publiPath).end()
		;
		projectClone.prepend(publiItem);
	}

	projectClone.appendTo('.project-list');

}

function displayImage(session, project, id, file){
	var imagePath = "/" +session +"/"+ project+ "/"+ file;
	var mediaItem = $(".js--templates .media_image").clone(false);
	mediaItem.attr( 'id', id);
	mediaItem.find( 'img').attr('src', imagePath);

	return mediaItem;
}

function displayVideo(session, project, id, file){
	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_video").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	return mediaItem;
}

function displayStopMotion(session, project, id, file){

	var thumbPath = '/'+session + '/'+ project+ '/'+id +'-thumb.png';
	var videoPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_stopmotion").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'video').attr( 'poster', thumbPath)
    .find( 'source').attr( 'src', videoPath);

	return mediaItem;
}

function displayAudio(session, project, id, file){
	var audioPath = '/'+session +'/'+ project+ '/' + file;

	var mediaItem = $(".js--templates .media_audio").clone(false);
	mediaItem
	  .attr( 'id', id)
    .find( 'source').attr( 'src', audioPath);

	return mediaItem;
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