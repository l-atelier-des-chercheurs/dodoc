/* VARIABLES */
var socket = io.connect();


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('displayPubli', {session: currentFolder, project: currentProject, publi: currentPubli});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('sendPubliData', sendPubliData);


jQuery(document).ready(function($) {

	init();
});

function init(){


}

function sendPubliData(data){
	$('.publi-title').html(data.name);
	$('.publi-content').html(data.html);
}
