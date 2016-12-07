/* VARIABLES */
var socket = io.connect();
var publiTemplate;

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

socket.on('pdfIsGenerated', onPdfIsGenerated);
socket.on('noConnection', onNoConnection);
socket.on('webConnectionFound', onWebConnection);


jQuery(document).ready(function($) {
  init();
});

function init(){

  //Generate pdf
  $('.js--generatePDF').on('click', function(){
    var currentUrl = window.location.href;
    var htmlNoScript = 
    $('html')
    .find('script').remove()
    .end()
    .find('.js--generatePDF').remove()
    .end()
    .find('.js--uploadPubliToFtp').remove()
    .end()
    .find('.js--editPubli').remove()
    .end()
    .find('.button-wrapper').remove();

    var html = $('html').html(); 
    socket.emit('generatePDF', {html: html, url: currentUrl ,"slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});
    // animation on wait
    $('body').addClass('generating');
  });

}

function onPdfIsGenerated(file){
  $('body').removeClass('generating');
  $('#modal-confirm-pdf .pdfPath').html(file);
  $('#modal-confirm-pdf').foundation('reveal', 'open');
  $(document).on('close.fndtn.reveal', '#modal-confirm-pdf[data-reveal]', function () {
    location.reload();
  });

}

function onListOnePubliMetaAndMedias( psdata) {
  console.log( "onListOnePubliMetaAndMedias");
  $.each( psdata, function( slugPubliName, pdata) {
    publiTemplate = pdata.template;
    // Save files for web
    uploadPubliToFTP(publiTemplate);
  });
  updateMontagePubliMeta( psdata);
  updateMontagePubliMedias( psdata);
}
function onPubliMetaUpdated( psdata) {
  console.log( "onPubliMetaUpdated");
  $.each( psdata, function( slugPubliName, pdata) {
    publiTemplate = pdata.template;
  });
  // update meta of montage
  updateMontagePubliMeta( psdata);
}
function onPubliMediasUpdated( psdata) {
  console.log( "onPubliMediasUpdated");
  // update medias of montage if necessary
  updateMontagePubliMedias( psdata);
}

function uploadPubliToFTP(publiTemplate){
  var $uploadBtn = $('.js--uploadPubliToFtp');
  console.log('init upload ftp', publiTemplate);
    // Valider et exporter vers un ftp
  $uploadBtn.on('click', function (){
    $('body')
    .find('.js--uploadPubliToFtp').remove()
    .end()
    .find('.js--generatePDF').remove()
    .end()
    .find('.publi-btn').remove()
    ;

    var publiHtml = $('body').html();
    var publiClean = publiHtml
      .replaceAll('/'+currentFolder+'/'+currentProject+'/01-photos', 'medias')
      .replaceAll('/'+currentFolder+'/'+currentProject+'/02-animations', 'medias')
      .replaceAll('/'+currentFolder+'/'+currentProject+'/03-videos', 'medias')
      .replaceAll('/'+currentFolder+'/'+currentProject+'/04-sons', 'medias')
      .replaceAll('/'+currentFolder+'/'+currentProject+'/05-textes', 'medias');

    var cssFile = '<link rel="stylesheet" href="./style.css"><link rel="stylesheet" href="./template.css">';
    var head = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="apple-mobile-web-app-capable" content="yes"><title>Publication | '+currentPubli+'</title>'+cssFile+'</head>';
    var body = '<body class="publi"><div class="publi_container">';
    var footer = '</div><script src="../jquery.min.js"></script><script src="./script.js"></script></body></html>'

    var html = head +body + publiClean + footer;
    socket.emit('exportPubliToFtp', {"html": html, "currentTemplate": publiTemplate, "slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});
    $('body').addClass('generating');
  });
}

function onNoConnection(path){
  $('body').removeClass('generating');
  $('#modal-no-connexion .path').html(path);
  $('#modal-no-connexion').foundation('reveal', 'open');
  $(document).on('close.fndtn.reveal', '#modal-no-connexion[data-reveal]', function () {
    location.reload();
  });
}

function onWebConnection(){
  $('body').removeClass('generating');
  $('#modal-connexion').foundation('reveal', 'open');
  $('body').on('click', '.js--submit-ftp-settings', function(){
    // var newFolderName = $('input.new-folder').val();
    // socket.emit( 'newFolder', { "name" : newFolderName });
  });
}



