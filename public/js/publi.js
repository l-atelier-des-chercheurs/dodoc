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
});


function onListOnePubliMetaAndMedias( psdata) {
  console.log( "onListOnePubliMetaAndMedias");
  updateMontagePubliMeta( psdata);
  updateMontagePubliMedias( psdata);
}
function onPubliMetaUpdated( psdata) {
  console.log( "onPubliMetaUpdated");
  // re-list all publis
  onListOneProjectPublis( psdata);
  // update meta of montage
  updateMontagePubliMeta( psdata);
}
function onPubliMediasUpdated( psdata) {
  console.log( "onPubliMetaUpdated");
  // update medias of montage if necessary
  updateMontagePubliMedias( psdata);
}


// ----------------------------------------------


function updateMontagePubliMeta( psdata) {
  var $publiContent = $('.publi-container');

  $.each( psdata, function( slugPubliName, pdata) {
    listMontagePubliMeta( currentPubli, pdata, $publiContent);
  });
}
function updateMontagePubliMedias( psdata) {
  var $publiContent = $('.publi-container');

  $.each( psdata, function( slugPubliName, pdata) {
    listMontagePubliMedias( currentPubli, pdata, $publiContent);
  });
}


