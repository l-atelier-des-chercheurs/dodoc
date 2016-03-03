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
	$('body').on('click', '.edit-icon', function(){
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

function sortFolder(){
	arrayFolder.sort(function(a, b){
		return b.modified - a.modified;
	})
	console.log(arrayFolder);
}

function onListChildren(data){
	var parentName = data.parentName;
	var childrenName = data.childrenName;
	var image = data.childrenImage;
	console.log(image);
	var $parent = $("li.dossier[data-name="+parentName+"]");
	if(image == true){
		var liToAdd = "<li class=''><a href='/"+parentName+'/'+convertToSlug(childrenName)+"'><h3>"+childrenName+"</h3><div class='vignette-visuel'><img src='/"+parentName+"/"+convertToSlug(childrenName)+"/"+convertToSlug(childrenName)+"-thumb.jpg' alt='"+childrenName+"'></div></a></li>";
	}
	else{
		var liToAdd = "<li class=''><a href='/"+parentName+'/'+convertToSlug(childrenName)+"'><h3>"+childrenName+"</h3></a></li>";
	}
	$parent.find(".projet-list").append(liToAdd);
}

// Fonction qui affiche les dossiers HTML
function displayFolder(name, created, modified, statut, projets){
	var formatName = convertToSlug(name);
	var contentHTML = '<div class="content"><a href="/'+formatName+'" title="'+name+'" class="folder-link"><h2>'+name+'</h2></a><ul class="projet-list"></ul></div>';

	// si un projet, singulier
	var projetName = projets > 1 ? 'projets' : 'projet';

	var nbProjetHTML = '<div class="nb-projets small-6 columns"><span class="numero-projet">'+projets+'</span><span> '+projetName+'</span></div>';
	var statutHTML= '<div class="statut small-6 columns"><span>statut</span><span class="statut-type"> '+statut+'</span></div>';
	var createdHTML= '<div class="created small-6 columns"><span>crée le </span><span class="create-date">'+created+'</span></div>';
	if(modified!= null){
		var modifiedHTML= '<div class="modified small-6 columns"><span>modifié le </span><span class="modify-date">'+modified+'</span></div>';
	}
	else{
		var modifiedHTML= '<div class="modified small-6 columns"></div>';
	}
	var metaDataHTML = '<div class="meta-data row">'+nbProjetHTML+statutHTML+createdHTML+modifiedHTML+'</div>';
	if(statut == "terminé"){
		var editIcon='' ;
	}
	else{
		var editIcon = '<a href="#" class="edit-icon btn icon" data-reveal-id="modal-modify-folder"><img src="/images/pen.svg" alt="edit icon"></a>';
	}
	var folderHTML = '<li class="dossier small-6 medium-4 large-4 columns" data-statut="'+statut+'" data-name="'+formatName+'" data-nom="' + name + '"><div class="dossier-inside">'+editIcon+contentHTML+metaDataHTML+'</div></li>';
	$("#container .dossier-list").prepend(folderHTML);
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
		$(document).on('close.fndtn.reveal', '#modal-delete-alert[data-reveal]', function () {
	  	$('#modal-modify-folder').foundation('reveal', 'open');
		});
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