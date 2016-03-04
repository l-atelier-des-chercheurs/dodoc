/* VARIABLES */
var socket = io.connect();

var $thisEl;
var thisFolderName;
var thisFolder;


/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('folderCreated', onFolderCreated); // Quand un dossier est crée !
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.
socket.on('listFolder', onListFolder); // Liste tous les dossiers
socket.on('listChildren', onListChildren); // Liste tous les enfants des dossiers
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
	submitFolder($(".submit-new-folder"), 'newFolder'); //Envoie les données au serveur

	// Remove Folder
	removeFolder();

  // ANIMER LA NAVBAR

  scrollY = window.pageYOffset;
  openCloseMenu( scrollY);

	$(window).on('scroll', function () {
    var scrollY = window.pageYOffset;
    openCloseMenu( scrollY);
  });

	//MODIFIER LES DOSSIERS
	//Au clic sur l'icone éditer
	$('body').on('click', '.js--edit-project-icon', function(){
		thisFolder = $(this).parent();
		modifyFolder($(this));
	});

	//remove modal modify folder when it closing
	$(document).on('close.fndtn.reveal', '#modal-modify-folder[data-reveal]', function () {
	//   	$("#modal-modify-folder").empty();
	});

	//Au click sur le bouton supprimer le dossier
	$('body').on('click', '.js--deleteFolder', function(){
  	$('#modal-delete-alert').attr('data-foldertodelete', $(this).parents('#modal-modify-folder').attr('data-nom'));
		$('#modal-delete-alert').foundation('reveal', 'open');
	});
}

// Envoie les données du dossier au serveur
function submitFolder($button, send){
	$button.on('click', function(){
		var newFolderName = $('input.new-folder').val();
		socket.emit(send, {name: newFolderName});
	})
}

// Affiche le fichier dès qu'il est crée
function onFolderCreated(data){
	var folderName = data.name;
	var createdDate = transformDatetoString(data.created);
	if(data.modified!= null){var modifiedDate = transformDatetoString(data.modified);}
	else{var modifiedDate = data.modified;}
	var statut = data.statut;
	var nb_projets = data.nb_projets;
	$('input.new-folder').val('');
	$('#modal-add-folder').foundation('reveal', 'close');
	//closePopover(closeAddProjectFunction); // Close pop up

	displayFolder(folderName, createdDate, modifiedDate, statut, nb_projets);
}

// Si un fichier existe déjà, affiche un message d'alerte
function onFolderAlreadyExist(data){
	alert("Le nom de dossier " +data.name+ " existe déjà. Veuillez trouvez un autre nom.");
	$('.new-folder').focus();
}

// Liste les dossiers
function onListFolder(data){
	var folderName = data.name;
	var createdDate = transformDatetoString(data.created);
	if(data.modified!= null){var modifiedDate = transformDatetoString(data.modified);}
	else{var modifiedDate = data.modified;}
	var statut = data.statut;
	var nb_projets = data.nb_projets;
	displayFolder(folderName, createdDate, modifiedDate, statut, nb_projets);
}

function onListChildren(data){
	var parentName = data.parentName;
	var childrenName = data.childrenName;
	var image = data.childrenImage;
	var $parent = $("li.dossier[data-name="+parentName+"]");
	var newSnippetProjet = $(".js--templates > .projetSnippet").clone(false);

	if(image != true){
  	newSnippetProjet.find( '.vignette-visuel img').remove();
	}

  // customisation du projet
	newSnippetProjet
    .find( '.project-link').attr('href', '/' + parentName + '/' + convertToSlug(childrenName)).end()
    .find( 'h3').text( childrenName).end()
    .find( '.vignette-visuel img').attr( 'src', "/"+parentName+"/"+convertToSlug(childrenName)+"/"+convertToSlug(childrenName)+"-thumb.jpg").attr( 'alt', childrenName);
  ;
	$parent.find(".projet-list").append(newSnippetProjet);
}

// Fonction qui affiche les dossiers HTML
function displayFolder(name, created, modified, statut, projets){
	var formatName = convertToSlug(name);
	var projetName = projets > 1 ? 'projets' : 'projet';

	var newFolder = $(".js--templates > .dossier").clone(false);

  // customisation du projet
	newFolder
	  .attr( 'data-nom', name)
	  .attr( 'data-name', formatName)
	  .attr( 'data-statut', statut)
	  .find( '.statut-type').text( statut).end()
	  .find( '.folder-link')
	    .attr('href', '/' + formatName)
	    .attr('title', name)
	  .end()

	  .find( '.title').text( name).end()
	  .find( '.create-date').text( created).end()
	  .find( '.modify-date').text( modified !== null ? modified : '').end()
	  .find( '.nb-projets')
	    .find( '.nb-projets-intitule').text( projetName).end()
	    .find( '.nb-projets-count').text( projets).end()
    .end()
  ;

  if( modified === null)
    newFolder.find('.modified').remove();

  if( statut == "terminé")
    newFolder.find( '.js--edit-project-icon').remove();

	$("#container .dossier-list").prepend(newFolder);
}

function modifyFolder($this){
// 	$("#container.row #modal-modify-folder").empty();

	var thisFolderName = $this.parents('.dossier').attr('data-nom');
	var statut = $this.parents(".dossier").attr("data-statut");

  $('#modal-modify-folder')
    .attr('data-nom', thisFolderName)
  	.find('.modify-folder')
  	  .attr('value', thisFolderName)
    .end()
  	.find('.modify-statut')
  	  .find('option')
  	    .removeAttr('checked')
      .end()
  	  .find('option[value="' + statut + '"]')
  	    .attr('checked', '')
  	  .end()
    .end()
  ;

// 	$("#container.row #modal-modify-folder").append(newContentToAdd);
	modifyStatut();
	submitModifyFolder($(".submit-modify-folder"), 'modifyFolder', thisFolderName, statut);
	$thisEl = $this.parent();
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

// Envoie les données du dossier au serveur
function submitModifyFolder($button, send, oldName, oldStatut){
	$button.on('click', function(){
		var newFolderName = $('input.modify-folder').val();
		var newStatut = $('select.modify-statut').val();
		var oldFolderName = oldName;
		var oldFolderStatut = oldStatut;
		socket.emit(send, {name: newFolderName, statut:newStatut, oldname: oldFolderName, oldStatut:oldFolderStatut});
	})
}

// Quand le dossier est modifié
function onFolderModified(data){
	var name = data.name;
	var statut = data.statut;
	var modified = transformDatetoString(data.modified);
	var created = $thisEl.find('.create-date').html();;
	var nbProj = $thisEl.find('.numero-projet').html();
	$('#modal-modify-folder').foundation('reveal', 'close');

	if(statut == "terminé"){
		$thisEl.find('.edit-icon').remove();
	}
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
  	var folderToDelete = $(this).parents( '#modal-delete-alert').attr('data-foldertodelete');
		console.log('oui ' + folderToDelete);
		socket.emit('removeFolder', {name: folderToDelete});
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

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};