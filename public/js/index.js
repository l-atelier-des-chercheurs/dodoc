/* VARIABLES */
var socket = io.connect();


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
socket.on('listOneFolder', onListOneFolder); // Liste tous les dossiers
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
		var folderNameSlug = $('#modal-modify-folder').data( "folderNameSlug");

		socket.emit( 'editFolder',
		  {
  		  "name" : oldFolderName,
  		  "newName" : newFolderName,
  		  "folderNameSlug" : folderNameSlug,
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
  	$('#modal-delete-alert').attr('data-foldertodelete', $('#modal-modify-folder').data('folderNameSlug'));
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
  return insertOrReplaceFolder( folderData.folderNameSlug, $folderContent);
}

function insertOrReplaceFolder( folderNameSlug, $folderContent) {
  // folder slug
  var $existingFolder = $(".dossier-list .dossier").filter( "[data-foldernameslug=" + folderNameSlug + "]");
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

function onListAllProjectsOfOneFolder(data){
  data.forEach( loadProject);
  return;
}

function loadProject( pdata) {

	var projectPath = '/' + pdata.slugFolderName + '/' + pdata.slugProjectName;
	var $folder = $(".dossier-list .dossier[data-folderNameSlug=" + pdata.slugFolderName + "]");

	var newSnippetProjet = $(".js--templates > .projetSnippet").clone(false);

	if( pdata.projectPreviewName === false){
  	newSnippetProjet.find( '.vignette-visuel img').remove();
	}

	newSnippetProjet
    .find( '.project-link').attr('href', projectPath).end()
    .find( 'h3').text( pdata.name).end()
    .find( '.vignette-visuel img')
      .attr( 'src', projectPath + "/" + pdata.projectPreviewName)
      .attr( 'alt', pdata.name)
    ;

	$folder.find(".projet-list").prepend(newSnippetProjet);
	return;
}

// Fonction qui affiche les dossiers HTML
function makeFolderContent( projectData){

	var name = projectData.name;
	var folderNameSlug = projectData.folderNameSlug;
	var created = projectData.created;
	var modified = projectData.modified;
	var statut = projectData.statut;
	var nb_projets = projectData.nb_projets;

	var projetName = nb_projets > 1 ? 'projets' : 'projet';
	var newFolder = $(".js--templates > .dossier").clone(false);

  // customisation du projet
	newFolder
	  .attr( 'data-nom', name)
	  .attr( 'data-folderNameSlug', folderNameSlug)
	  .attr( 'data-modifiedtimestamp', transformDatetoTimestamp( modified))
	  .attr( 'data-statut', statut)
	  .find( '.statut-type').text( statut).end()
	  .find( '.folder-link')
	    .attr('href', '/' + folderNameSlug)
	    .attr('title', name)
	  .end()

	  .find( '.title').text( name).end()
	  .find( '.create-date').text( transformDatetoString( created)).end()
	  .find( '.modify-date').text( modified !== false ? transformDatetoString( modified) : '').end()
	  .find( '.nb-projets')
	    .find( '.nb-projets-intitule').text( projetName).end()
	    .find( '.nb-projets-count').text( nb_projets).end()
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
  var folderNameSlug = $thisFolder.attr('data-foldernameslug');
	var folderStatut = $thisFolder.attr("data-statut");

	debugger;

  $('#modal-modify-folder')
  	.find('.modify-folder')
  	  .attr('value', folderName)
    .end()
  	.find('.modify-statut')
  	  .find('option')
  	    .removeAttr('checked')
      .end()
  	  .find('option[value="' + folderStatut + '"]')
  	    .attr('checked', '')
  	  .end()
    .end()
    .data(
      {
        "folderName" : folderName,
        "folderNameSlug" : folderNameSlug,
        "folderStatut" : folderStatut,
      }
    )
  ;
// 	$("#container.row #modal-modify-folder").append(newContentToAdd);
	modifyStatut();
}

function modifyStatut(){
	$('#modal-modify-folder .modify-statut').bind('change', function(){
		if($(this).val() == "terminé"){
			$('#modal-statut-alert').foundation('reveal', 'open');
			$('#modal-statut-alert button.oui').on('click', function(){
				console.log('oui ');
				$('#modal-statut-alert').foundation('reveal', 'close');
				$("#modal-modify-folder").foundation('reveal', 'open');
			});
			$('#modal-statut-alert button.annuler').on('click', function(){
				console.log('non');
				$('#modal-modify-folder .modify-statut').val('en cours');
				$('#modal-statut-alert').foundation('reveal', 'close');
				$("#modal-modify-folder").foundation('reveal', 'open');
			});
			$(document).on('closed.fndtn.reveal', '#modal-statut-alert[data-reveal]', function () {
	  		$("#modal-modify-folder").foundation('reveal', 'open');
			});
		}
	});
}


// Quand le dossier est modifié
function onFolderModified(data){

/*
	var name = data.name;
	var statut = data.statut;
	var modified = transformDatetoString(data.modified);
	var created = $thisEl.find('.create-date').html();
	var nbProj = $thisEl.find('.numero-projet').html();
	$('#modal-modify-folder').foundation('reveal', 'close');

	if(statut == "terminé"){
		$thisEl.find('.edit-icon').remove();
	}
*/

  // MISSING - not ideal, should display a notice saying that the folder has been updated and replace it instead
	location.reload();
	// $thisEl.remove();
	// displayFolder(name, created, modified, statut, nbProj)
	// $thisEl.find('h2').html(name);
	// $thisEl.find('.statut-type').html(" "+statut);
	// $thisEl.find('.modify-date').html(modified);
	// $thisEl.find('.folder-link').attr('href', '/'+convertToSlug(name));
}

//Suppression du dossier
function removeFolder(){
	$('#modal-delete-alert button.oui').on('click', function(){
  	var slugFolderName = $(this).parents( '#modal-delete-alert').attr('data-foldertodelete');
		console.log('oui ' + folderToDelete);
		socket.emit('removeFolder', { "slugFolderName" : slugFolderName});
		$('#modal-delete-alert').foundation('reveal', 'close');
	});
	$('#modal-delete-alert button.annuler').on('click', function(){
		console.log('annuler');
		$('#modal-delete-alert').foundation('reveal', 'close');
		$("#modal-modify-folder").foundation('reveal', 'open');
	});
	$(document).on('closed.fndtn.reveal', '#modal-delete-alert[data-reveal]', function () {
		$("#modal-modify-folder").foundation('reveal', 'open');
	});
}

//Remove the folder from list
function onFolderRemoved(){
	thisFolder.remove();
	location.reload();
}
