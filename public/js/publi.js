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

  // Valider et exporter vers un ftp 
  $('body.publi .js--validerTitre').on('click', function (){
    var publiHtml = $('html').html();
    socket.emit('exportFtp', {"html": publiHtml ,"slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});
  });

  // Selection des templates 
  $(".templateSelector a").on('click',function(){
    var template = $(this).attr('class');
    $(this).parents('body.publi').attr("data-template", template);
    if($('body.publi').attr('data-template') == 'bordel'){
      randomPosition();
    }
    else{
      $("body.publi .media").each(function(){
        $(this).css({
          "left": 0
        });
      });
    }
  });



}


function onListOnePubliMetaAndMedias( psdata) {
  console.log( "onListOnePubliMetaAndMedias");
  updateMontagePubliMeta( psdata);
  updateMontagePubliMedias( psdata);
  if($('body.publi').attr('data-template') == 'bordel'){
    randomPosition();
  }
  
}
function onPubliMetaUpdated( psdata) {
  console.log( "onPubliMetaUpdated");
  // re-list all publis
  onListOneProjectPublis( psdata);
  // update meta of montage
  updateMontagePubliMeta( psdata);
  if($('body.publi').attr('data-template') == 'bordel'){
    randomPosition();
  }
}
function onPubliMediasUpdated( psdata) {
  console.log( "onPubliMetaUpdated");
  // update medias of montage if necessary
  updateMontagePubliMedias( psdata);
  if($('body.publi').attr('data-template') == 'bordel'){
    randomPosition();
  }
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

function randomPosition(){
  var count = 0;
  // random positionning for bordel templates
  $("body.publi[data-template='bordel'] .media").each(function(){
      var randomCol = Math.floor(Math.random() * 7);
      var randomLeft = (randomCol * 100) / 12;
      var height = $(this).find(".mediaContent").height();
      count = count +100;
      $(this).css({
        "left": randomLeft + '%',
      });
  });
}


