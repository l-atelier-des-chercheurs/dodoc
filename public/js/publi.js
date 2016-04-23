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
socket.on('publiMediasAndMediasUpdated', onPubliMediasAndMediasUpdated);


jQuery(document).ready(function($) {
});


function onListOnePubliMetaAndMedias( publisData) {
  console.log( "onListOnePubliMetaAndMedias");

  $.each( publisData, function( slugPubliName, publiData) {
    var $publiMedias = publi.makePubliMedias( publiData);
    $('.publi-content').html( $publiMedias);
  });
}


function onListOnePubliMetaAndMedias( psdata) {
  console.log( "onListOnePubliMetaAndMedias");

  // check if a publi content was requested (not ideal, we could use a session tag in the json to check but also not ideal).
  var $publiContent = $('.publi-container');

  // there will only be one but let's use similar code to
  $.each( psdata, function( slugPubliName, pdata) {
    listPubliContent( currentPubli, pdata, $publiContent);
  });
}

function onPubliMediasAndMediasUpdated( psdata) {
  console.log( "onPubliMediasAndMediasUpdated");

  // check if a publi content was requested (not ideal, we could use a session tag in the json to check but also not ideal).
  var $publiContent = $('.publi-container');

  $.each( psdata, function( slugPubliName, pdata) {
    listPubliContent( currentPubli, pdata, $publiContent);
  });
}

