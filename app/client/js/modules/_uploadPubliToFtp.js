var uploadPubliToFtp = (function() {
  var $uploadBtn = $('.js--uploadPubliToFtp');
  var $generatePDF = $('.js--generatePDF');

  var API = {
    init : function() {
      uploadThisPubliToFTP();
      sendThisPubliToPDF();
    },
    onPdfIsGenerated : function(file) { onPdfIsGenerated(file); },
    uploadThisPubliToFTP : function() { uploadThisPubliToFTP(); },
    onNoConnection : function() { onNoConnection(); },
    onWebConnection : function(webPubliFolderPath, arrayImages, date) { onWebConnection(webPubliFolderPath, arrayImages, date); },
    onPubiTransferred : function() { onPubiTransferred(); },
    onCannotConnectFtp : function() { onCannotConnectFtp(); },

  }

  function sendThisPubliToPDF() {
    //Generate pdf
    $generatePDF.on('click', function(){
      var currentUrl = window.location.href;
      var htmlNoScript =
      $('html')
        .find('script').remove().end()
        .find('.js--generatePDF').remove().end()
        .find('.js--uploadPubliToFtp').remove().end()
        .find('.js--editPubli').remove().end()
        .find('.button-wrapper').remove()
        ;

      var html = $('html').html();
      socket.emit('generatePDF', {html: html, url: currentUrl ,"slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});
      // animation on wait
      $('body').addClass('is--generating');
    });

  }

  function uploadThisPubliToFTP(){
    $uploadBtn.on('click', function (){
      $('body')
        .find('.js--uploadPubliToFtp').remove().end()
        .find('.js--generatePDF').remove().end()
        .find('.publi-btn').remove().end()
        ;

      String.prototype.replaceAll = function(target, replacement) {
        return this.split(target).join(replacement);
      };

      var publiHtml = $('body').html();
      var publiClean = publiHtml
        .replaceAll('/'+currentFolder+'/'+currentProject+'/01-photos', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/02-animations', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/03-videos', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/04-sons', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/05-textes', 'medias');

      var cssFile = '<link rel="stylesheet" href="./style.css"><link rel="stylesheet" href="./template.css">';
      var head = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta charset="utf-8"><meta name="apple-mobile-web-app-capable" content="yes"><title>Publication | '+currentPubli+'</title>'+cssFile+'</head>';
      var body = '<body class="publi"><div class="publi_container">';
      var footer = '</div><script src="../jquery.min.js"></script><script src="./script.js"></script></body></html>'

      var html = head + body + publiClean + footer;
      socket.emit('exportPubliToFtp', {"html": html, "currentTemplate": currentTemplate, "slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});
      $('body').addClass('is--generating');
    });
  }


  function onPdfIsGenerated(path){
    $('body').removeClass('is--generating');
    var modalData = {
      "path" : path,
    }
    modals.createModal('confirmPdfExported',modalData);
  }

  function onNoConnection(path){
    $('body').removeClass('is--generating');
    var modalData = {
      "path" : path,
    };
	  modals.createModal('exportWebNoConnexion',modalData);
  }

  function onWebConnection(webPubliFolderPath, arrayImages, date){
    console.log('web connect');
    $('body').removeClass('is--generating');
    // fill the form with previous settings

    var modalData = {};

    if(store.get('ftp') !== undefined){
      var ftpInfo = store.get('ftp');
      modalData = ftpInfo;
    }

    modalData.webPubliFolderPath = webPubliFolderPath;
    modalData.arrayImages = arrayImages;
    modalData.date = date;

	  modals.createModal('exportWebOnConnexion',modalData);
  }

  function onPubiTransferred(){
    alertify.log('publi transferred');
    $('body').removeClass('is--generating');
    location.reload();
  }

  function onCannotConnectFtp(){
    $('body').removeClass('is--generating');
    modals.createModal('exportWebBadFTP');
  }

  return API;
})();

uploadPubliToFtp.init();
