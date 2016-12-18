/* VARIABLES */
var socket = io.connect();
var currentTemplate;

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

socket.on('publiPDFIsGenerated', onPubliPDFIsGenerated);
socket.on('noConnection', onNoConnection);
socket.on('webConnectionFound', onWebConnection);
socket.on('publiTransferred', onPubliTransferred);
socket.on('cannotConnectFtp', onCannotConnectFtp);



function onListOnePubliMetaAndMedias( psdata) {
  console.log( "onListOnePubliMetaAndMedias");
  $.each( psdata, function( slugPubliName, pdata) {
    currentTemplate = pdata.template;
  });
  updateMontagePubliMeta( psdata);
  updateMontagePubliMedias( psdata);
}
function onPubliMetaUpdated( psdata) {
  console.log( "onPubliMetaUpdated");
  $.each( psdata, function( slugPubliName, pdata) {
    currentTemplate = pdata.template;
  });
  // update meta of montage
  updateMontagePubliMeta( psdata);
}
function onPubliMediasUpdated( psdata) {
  console.log( "onPubliMediasUpdated");
  // update medias of montage if necessary
  updateMontagePubliMedias( psdata);
}
function onPubliPDFIsGenerated(d) {
  uploadPubliToFtp.onPubliPDFIsGenerated(d);
}
function onPubliTransferred(d) {
  uploadPubliToFtp.onPubliTransferred(d);
}
function onNoConnection(d) {
  uploadPubliToFtp.onNoConnection(d);
}
function onWebConnection(webPubliFolderPath, arrayImages, date) {
  uploadPubliToFtp.onWebConnection(webPubliFolderPath, arrayImages, date);
}
function onCannotConnectFtp() {
  uploadPubliToFtp.onCannotConnectFtp();
}


