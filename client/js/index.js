/* VARIABLES */


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listFolders');
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('folderCreated', onFolderCreated); // Quand un dossier est crée
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.
socket.on('listAllFolders', onListAllFolders); // Liste tous les dossiers
socket.on('listAllProjectsOfOneFolder', onListAllProjectsOfOneFolder); // Liste tous les enfants des dossiers
socket.on('folderModified', onFolderModified);
socket.on('folderRemoved', onFolderRemoved);


jQuery(document).ready(function($) {
	$(document).foundation();
});

// Show created folders
function onFolderCreated(d){
  onListOneFolder(d);
}

// Si un fichier existe déjà, affiche un message d'alerte
function onFolderAlreadyExist(data){
	alertify.error(dodoc.lang().thisFolderNameIsAlreadyTaken+'<em>'+data.name+'</em>'+'<br>'+dodoc.lang().pleaseUseAnother);
}

// Liste les dossiers
function onListOneFolder( folderData){
	var $folderContent = makeFolderContent( folderData);
  return insertOrReplaceFolder( folderData.slugFolderName, $folderContent);
}

function onListAllFolders( foldersData) {
  if(!foldersData) return;
  $.each( foldersData, function( index, fdata) {
  	var $folderContent = makeFolderContent( fdata);
    return insertOrReplaceFolder( fdata.slugFolderName, $folderContent);
  });
}

function insertOrReplaceFolder( slugFolderName, $folderContent) {
  // folder slug
  var $existingFolder = $(".dossier-list .dossier").filter(function() { return $(this).data('slugFolderName') === slugFolderName });
  if( $existingFolder.length == 1) {
    $existingFolder.replaceWith($folderContent);
    return "updated";
  }

  // trouver où l'insérer en fonction de la date de modification
  if( $(".dossier-list .dossier").length > 0) {
    var folderTimestamp = parseInt( $folderContent.data("mtimestamp"));
    if( folderTimestamp !== false) {

      var $eles;
      $(".dossier-list .dossier").each(function(index) {
        if( folderTimestamp > parseInt( $(this).data("mtimestamp"))) {
          $eles = $(this);
          return false;
        }
      });

      if( $eles !== undefined)
        $folderContent.insertBefore( $eles);
      else
        $(".dossier-list").append( $folderContent);
    }
  } else {
    $(".dossier-list").append( $folderContent);
  }
  return "inserted";

}

function onListAllProjectsOfOneFolder(fdata){

  var $newSnippetProjet = $('');
  $.each(fdata, function(index, pd) {
    $newSnippetProjet = $newSnippetProjet.add(loadProjectSnippet(pd));
  });
  var $folder = $(".dossier-list .dossier").filter(function() { return $(this).data('slugFolderName') === fdata[0].slugFolderName });
  $folder.find(".projet-list").prepend($newSnippetProjet);
  return;
}


// Fonction qui affiche les dossiers HTML
function makeFolderContent( projectData){

	var name = projectData.name;
	var slugFolderName = projectData.slugFolderName;
	var created = projectData.created;
	var modified = projectData.modified;
	var statut = projectData.statut;

	var newFolder = $(".js--templates > .dossier").clone(false);

  // customisation du projet
	newFolder
	  .data({
  	    "nom" : name,
  	    "slugFolderName" : slugFolderName,
  	    "modifiedtimestamp" : transformDatetoTimestamp(modified),
  	    "data-statut" : statut,
    })
	  .find( '.statut-type').text( statut).end()
	  .find( '.folder-link')
	    .attr('href', '/' + slugFolderName)
	    .attr('title', name)
	  .end()

	  .find( '.title').text( name).end()
	  .find( '.create-date').text( transformDatetoString( created)).end()
	  .find( '.modify-date').text( modified !== false ? transformDatetoString( modified) : '').end()
	  .find( '.nb-projets')
	    .find( '.nb-projets-intitule').text( dodoc.lang().projects).end()
    .end()
  ;

  if( modified === null)
    newFolder.find('.modified').remove();

/*
  if( statut == "terminé")
    newFolder.find( '.js--openModal_editFolder').remove();
*/

  newFolder.data("mtimestamp", transformDatetoTimestamp( modified));

  return newFolder;
}


// Quand le dossier est modifié
function onFolderModified(folderData){
	var $folderContent = makeFolderContent( folderData);
  return insertOrReplaceFolder( folderData.slugFolderName, $folderContent);
}


//Remove the folder from list
function onFolderRemoved( removedFolderData){
  removeThisFolder( $(".mainContent .dossier-list"), removedFolderData.slugFolderName);
}
