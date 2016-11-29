/* VARIABLES */
var socket = io.connect();

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
  init();
});

function init(){
  // Save files for web
  uploadPubliToFtp.init();

  //Generate pdf
  $('.js--generatePDF').on('click', function(){
    var currentUrl = window.location.href;
    console.log(currentUrl);
    socket.emit('generatePDF', {url: currentUrl ,"slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});
  });

}

function onListOnePubliMetaAndMedias( psdata) {
  $('.publi_container').append('<p>YUP YUP </p>');
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



