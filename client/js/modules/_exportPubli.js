var exportPubli = (function() {
  var $makeWebsite = $('.js--makeWebsite');
  var $makePDF = $('.js--makePDF');

  var API = {
    init : function() {
      makeWebsiteFromThisPubli();
      makePDFFromThisPubli();
    },

    onPubliPDFIsGenerated   : function(pdfInfos) { onPubliPDFIsGenerated(pdfInfos); },
    onNoConnection          : function() { onNoConnection(); },
    onWebsiteReady          : function(d) { onWebsiteReady(d); },
    onPubliTransferred      : function(d) { onPubliTransferred(d); },
    onFailedToTransferPubli : function() { onFailedToTransferPubli(); },
  }

  function _cleanUpPubli($content) {
    return $content
      .find('.js--makeWebsite').remove().end()
      .find('.js--makePDF').remove().end()
      .find('.publi-btn').remove().end()
      .find('.module_infos').remove().end()
      .find('script').remove().end()
      .find('.m_modal-content').remove().end()
      .find('.m_modal').remove().end()
      .find('#templateCss').remove().end()
      .html()
      ;
  }

  function makePDFFromThisPubli() {
    //Generate pdf
    $makePDF.on('click', function(){

      var currentUrl = window.location.href;

      socket.emit('makePDF', {
        url: currentUrl ,
        slugFolderName: currentFolder,
        slugProjectName: currentProject,
        slugPubliName: currentPubli
      });

      // animation on wait
      $('body').addClass('is--generating');

    });

  }

  function makeWebsiteFromThisPubli(){
    $makeWebsite.on('click', function () {
      String.prototype.replaceAll = function(target, replacement) {
        return this.split(target).join(replacement);
      };

      var bodyHTML = $('body').clone()
        .find('#tempateCss')
          .remove()
        .end();

      var publiHtml = _cleanUpPubli(bodyHTML);

      var newPubliContent = publiHtml
        .replaceAll('/'+currentFolder+'/'+currentProject+'/01-photos', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/02-animations', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/03-videos', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/04-sons', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/05-textes', 'medias')

        ;

      var cssFile = '';
      var html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <meta charset="utf-8">
            <meta name="apple-mobile-web-app-capable" content="yes">
            <title>Publication | ${currentPubli}</title>
            <link rel="stylesheet" href="./style.min.css">
            <link rel="stylesheet" href="./template.css">
          </head>
          <body class="publi">
            <div class="publi_container">
              ${newPubliContent}
            </div>
          </body>
        </html>`;

      socket.emit('makeWebsite', { "html": html, "currentTemplate": currentTemplate, "slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});

      $('body').addClass('is--generating');
    });
  }


  function onPubliPDFIsGenerated(pdfInfos){
    $('body').removeClass('is--generating');
    modals.createModal('confirmPdfExported',pdfInfos);
  }

  function onWebsiteReady(d){
    $('body').removeClass('is--generating');
	  modals.createModal('exportWebIsReady', d);
  }

  function onPubliTransferred(d){
    modals.createModal('publiHasBeenSentToFtp', d);
    $('body').removeClass('is--generating');
  }

  function onFailedToTransferPubli(d) {
    modals.createModal('publiFailedToUpload', d);
    $('body').removeClass('is--generating');
  }


  return API;
})()

exportPubli.init();