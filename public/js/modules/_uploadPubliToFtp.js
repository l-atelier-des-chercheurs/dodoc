var uploadPubliToFtp = (function() {

  var $uploadBtn = $('.js--uploadPubliToFtp');
/*
  socket.on('noConnection', onNoConnection);
  socket.on('pubiTransferred', onPubliTransferred);
*/

  String.prototype.replaceAll = function(target, replacement) {
    return this.split(target).join(replacement);
  };

  function init() {
    console.log('init upload ftp');
    // Valider et exporter vers un ftp
    $uploadBtn.on('click', function (){
      var publiHtml = $('.template_container').html();
      var publiClean = publiHtml
        .replaceAll('/'+currentFolder+'/'+currentProject+'/01-photos', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/02-animations', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/03-videos', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/04-sons', 'medias')
        .replaceAll('/'+currentFolder+'/'+currentProject+'/05-textes', 'medias');

      var cssFile = '<link rel="stylesheet" href="./style.css">';
      var head = '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="apple-mobile-web-app-capable" content="yes"><title>Publication | '+currentPubli+'</title>'+cssFile+'</head>';
      var body = '<body class="publi"><div class="template_container" data-template="unecolonne">';
      var footer = '</div><script src="./script.min.js"></script></body></html>'

      var html = head +body + publiClean + footer;
      socket.emit('exportPubliToFtp', {"html": html ,"slugFolderName": currentFolder, "slugProjectName": currentProject, "slugPubliName": currentPubli});
      $(this).attr('disable', 'disable')
      .css({'background-color':'#A6A6A6', 'cursor':'default'})
      .find('svg circle').css('fill', '#A6A6A6');
    });

  }

  function onNoConnection(){
    alert('Vous n\'êtes pas connecté à internet, vous ne pouvez pas envoyer cette publication au serveur. Connectez-vous et cliquez sur le bouton à nouveau');
    enableButton();
  }

  function onPubliTransferred(adress){
    console.log(adress);
    alert('Votre publication a été envoyé à l’adresse suivante : '+adress);
    enableButton();
  }


  // ----------------------------------------------

  function enableButton(){
    $('body.publi .js--uploadPubliToFtp').removeAttr('disable')
    .css({'background-color':'#48C2B5', 'cursor':'pointer'})
    .find('svg circle').css('fill', '#48C2B5');
  }

  return {
    init : function() {
      init();
    },

  }
})();
