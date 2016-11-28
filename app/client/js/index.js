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
	init();
});

function openCloseMenu( scrollY) {
  if( scrollY < 20) {
    $(".navbar-container").addClass("is--opened");
  } else {
    $(".navbar-container").removeClass("is--opened");
  }
}


function init(){

	// Submit Folder
	// Create new folder
	$('body').on('click', '.js--submit-new-folder', function(){
		var newFolderName = $('input.new-folder').val();
		socket.emit( 'newFolder', { "name" : newFolderName });
  });

	$(".submit-modify-folder").on('click', function(){
		var newFolderName = $('input.modify-folder').val();
		var newStatut = $('select.modify-statut').val();
		var oldFolderName = $('#modal-modify-folder').data( "folderName");
		var oldFolderStatut = $('#modal-modify-folder').data( "folderStatut");
		var slugFolderName = $('#modal-modify-folder').data( "slugFolderName");

		socket.emit( 'editFolder', {
  		  "name" : oldFolderName,
  		  "newName" : newFolderName,
  		  "slugFolderName" : slugFolderName,
  		  "statut" : newStatut
  		});
	});

	// Remove Folder
	removeFolder();

  // ANIMER LA NAVBAR

  scrollY = window.pageYOffset;
  // openCloseMenu( scrollY);

	$(window).on('scroll', function () {
    var scrollY = window.pageYOffset;
    // openCloseMenu( scrollY);
  });

	//MODIFIER LES DOSSIERS
	//Au clic sur l'icone éditer
	$('body').on('click', '.js--edit-folder', function(){
		thisFolder = $(this).parent();
		editFolder( $(this));
	});


	//remove modal modify folder when it closing
	$(document).on('close.fndtn.reveal', '#modal-modify-folder[data-reveal]', function () {
	//   	$("#modal-modify-folder").empty();
	});

	//Au click sur le bouton supprimer le dossier
	$('body').on('click', '.js--deleteFolder', function(){
  	$('#modal-delete-alert').attr('data-foldertodelete', $('#modal-modify-folder').data('slugFolderName'));
		$('#modal-delete-alert').foundation('reveal', 'open');
	});
}

// Affiche le fichier dès qu'il est crée
function onFolderCreated(data){

	location.reload();
/*
	$('input.new-folder').val('');
	$('#modal-add-folder').foundation('reveal', 'close');
	return onListOneFolder( data);
*/
}

// Si un fichier existe déjà, affiche un message d'alerte
function onFolderAlreadyExist(data){
	alert("Le nom de dossier " +data.name+ " existe déjà. Veuillez trouvez un autre nom.");
	$('.new-folder').focus();
}

// Liste les dossiers
function onListOneFolder( folderData){
	var $folderContent = makeFolderContent( folderData);
  return insertOrReplaceFolder( folderData.slugFolderName, $folderContent);
}

function onListAllFolders( foldersData) {
  $.each( foldersData, function( index, fdata) {
  	var $folderContent = makeFolderContent( fdata);
    return insertOrReplaceFolder( fdata.slugFolderName, $folderContent);
  });
}

function insertOrReplaceFolder( slugFolderName, $folderContent) {
  // folder slug
  var $existingFolder = $(".dossier-list .dossier").filter( "[data-slugFolderName=" + slugFolderName + "]");
  if( $existingFolder.length == 1) {
    $existingFolder.replaceWith( $folderContent);
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
  var $folder = $(".dossier-list .dossier[data-slugFolderName=" + fdata[0].slugFolderName + "]");
//   $folder.find( '.nb-projets-count').html(function(i, val) { return +val+1 });
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
	  .attr( 'data-nom', name)
	  .attr( 'data-slugFolderName', slugFolderName)
	  .attr( 'data-modifiedtimestamp', transformDatetoTimestamp( modified))
	  .attr( 'data-statut', statut)
	  .find( '.statut-type').text( statut).end()
	  .find( '.folder-link')
	    .attr('href', '/' + slugFolderName)
	    .attr('title', name)
	  .end()

	  .find( '.title').text( name).end()
	  .find( '.create-date').text( transformDatetoString( created)).end()
	  .find( '.modify-date').text( modified !== false ? transformDatetoString( modified) : '').end()
	  .find( '.nb-projets')
	    .find( '.nb-projets-intitule').text( dodoc.lang.projects).end()
    .end()
  ;

  if( modified === null)
    newFolder.find('.modified').remove();

  if( statut == "terminé")
    newFolder.find( '.js--edit-folder').remove();

  newFolder.data("mtimestamp", transformDatetoTimestamp( modified));

  return newFolder;
}

function editFolder($this){
// 	$("#container.row #modal-modify-folder").empty();

  var $thisFolder = $this.closest('.dossier');

	var folderName = $thisFolder.attr('data-nom');
  var slugFolderName = $thisFolder.attr('data-slugFolderName');
	var folderStatut = $thisFolder.attr("data-statut");

  $('#modal-modify-folder')
  	.find('.modify-folder')
  	  .attr('value', folderName)
    .end()
  	.find('.modify-statut')
  	  .find('option')
      .prop("checked", false)
      .end()
  	  .find('option[value="' + folderStatut + '"]')
      .prop("checked", true)
  	  .end()
    .end()
    .data(
      {
        "folderName" : folderName,
        "slugFolderName" : slugFolderName,
        "folderStatut" : folderStatut,
      }
    )
  ;
// 	$("#container.row #modal-modify-folder").append(newContentToAdd);
	modifyStatut();
}

function modifyStatut(){
	$('#modal-modify-folder .modify-statut').bind('change', function(){
		if($(this).val() === "terminé"){
			$('#modal-statut-alert').foundation('reveal', 'open');
			$('#modal-statut-alert button.oui').on('click', function(){
				console.log('oui ');
				$('#modal-statut-alert').foundation('reveal', 'close');
			});
			$('#modal-statut-alert button.annuler').on('click', function(){
				$('#modal-modify-folder .modify-statut').val('en cours');
				$('#modal-statut-alert').foundation('reveal', 'close');
			});
		}
	});
}


// Quand le dossier est modifié
function onFolderModified(data){
  // MISSING - not ideal, should display a notice saying that the folder has been updated and replace it instead
	location.reload();
}

//Suppression du dossier
function removeFolder(){

	$('#modal-delete-alert button.oui').on('click', function(){

    	var slugFolderNameOfFolderToDelete = $(this).parents( '#modal-delete-alert').attr('data-foldertodelete');
		console.log('delete ' + slugFolderNameOfFolderToDelete);
		socket.emit('removeFolder', { "slugFolderName" : slugFolderNameOfFolderToDelete});

		$('#modal-delete-alert').foundation('reveal', 'close');
		$("#modal-modify-folder").foundation('reveal', 'close');
		$(".reveal-modal-bg").remove();

	});

	$('#modal-delete-alert button.annuler').on('click', function(){

		console.log('annuler');
		$('#modal-delete-alert').foundation('reveal', 'close');

	});
/*
	$(document).on('closed.fndtn.reveal', '#modal-delete-alert[data-reveal]', function () {
		$("#modal-modify-folder").foundation('reveal', 'open');
	});
*/
}

//Remove the folder from list
function onFolderRemoved( removedFolderData){
  removeThisFolder( $(".mainContent .dossier-list"), removedFolderData.slugFolderName);
}
