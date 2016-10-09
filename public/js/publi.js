/* VARIABLES */
var socket = io.connect();

// need to make it a module
// var uploadToFtp = require("modules/_uploadToFtp.js");

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit( 'listOnePubliMetaAndMedias', { "slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('listOnePubliMetaAndMedias', onListOnePubliMetaAndMedias);
socket.on('publiMetaUpdated', onPubliMetaUpdated);
socket.on('publiMediasUpdated', onPubliMediasUpdated);


jQuery(document).ready(function($) {

//   uploadToFtp.init();

});

function onListOnePubliMetaAndMedias( psdata) {
  console.log( "onListOnePubliMetaAndMedias");
  updateMontagePubliMeta( psdata);
  updateMontagePubliMedias( psdata);  
}
function onPubliMetaUpdated( psdata) {
  console.log( "onPubliMetaUpdated");
  // update meta of montage
  updateMontagePubliMeta( psdata);
}
function onPubliMediasUpdated( psdata) {
  console.log( "onPubliMediasUpdated");
  // update medias of montage if necessary
  updateMontagePubliMedias( psdata);
}



