/* VARIABLES */
var socket = io.connect();
var closeAddProjectFunction = function() {
};

var $thisEl;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('folderCreated', onFolderCreated); // Quand un dossier est crée !
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.
socket.on('listFolder', onListFolder); // List tous les dossiers
socket.on('folderModified', onFolderModified);


jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){

	//Au click "Ajouter un nouveau dossier" -> pop-up
	$('body').on('click', '.add-folder-wrapper', function(){

	});

	// Submit Folder
	// Create new folder
	submitFolder($(".submit-new-folder"), 'newFolder'); //Envoie les données au serveur

	//Au clic sur l'icone éditer
	$('body').on('click', '.edit-icon', function(){
		modifyFolder($(this));
	});
	//remove modal modify folder when it closing
	$(document).on('close.fndtn.reveal', '#modal-modify-folder[data-reveal]', function () {
  	$("#modal-modify-folder").empty();
	});
	//Bouton supprimer le dossier
	$('body').on('click', '.delete-folder-button', function(){
		removeFolder($(this));
	});
}

// Envoie les données du dossier au serveur
function submitFolder($button, send){
	$button.on('click', function(){
		var newFolderName = $('input.new-folder').val();
		console.log('send submit');
		socket.emit(send, {name: newFolderName});
		$('input.new-folder').val('');
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

// Fonction qui affichent les dossiers HTML
function displayFolder(name, created, modified, statut, projets){
	var contentHTML = '<div class="content"><h2>'+name+'</h2><ul class="projet-list row"></ul></div>';
	var nbProjetHTML = '<div class="nb-projets small-6 columns"><span class="numero-projet">'+projets+'</span><span> projet</span></div>';
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
	var folderHTML = '<li class="dossier small-4 columns" data-statut="'+statut+'">'+editIcon+contentHTML+metaDataHTML+'</li>';
	$("#container .dossier-list").prepend(folderHTML);
}

function modifyFolder($this){
	var folderName = $this.parent().find('h2').text();
	var statut = $this.parent().attr("data-statut");
	var inputNameHtml = "<input type='text' class='modify-folder' value='"+folderName+"'></input>";
	if(statut == 'en cours'){
		var statutHtml = "<select class='modify-statut 'name='statut'><option value='"+statut+"' selected>"+statut+"</option><option value='terminé'>terminé</option></select>";
	}
	else{
		var statutHtml = "<select class='modify-statut' name='statut'><option value='"+statut+"' selected>"+statut+"</option><option value='en cours'>en cours</option></select>";
	}
	var submitBtnHtml = "<input type='submit' class='submit-modify-folder' value='Valider'></input>";
	var deleteHtml = "<div class='delete-folder-button'><img src='/images/clear.svg' class='delete-btn btn icon'><span>Supprimer ce dossier</span></div>";
	// var modalDiv = '<div id="modal-modify-folder" class="reveal-modal" data-reveal aria-labelledby="modalTitle" aria-hidden="true" role="dialog">';
	var newContentToAdd = "<h3 id='modalTitle' class='popoverTitle'>Modifier le dossier</h3><form onsubmit='return false;' class='modify-folder-form'>"+inputNameHtml+statutHtml+submitBtnHtml+deleteHtml+"</form><a class='close-reveal-modal' aria-label='Close') &#215;</a></div>";
	$("#container.row #modal-modify-folder").append(newContentToAdd);
	//fillPopOver(newContentToAdd, $this, 300, 300, closeAddProjectFunction); //ouverture du pop up

	$('.modify-statut').bind('change', function(){
		if($(this).val() == "terminé"){
			$('#modal-statut-alert').foundation('reveal', 'open');
			$(document).on('closed.fndtn.reveal', '#modal-statut-alert[data-reveal]', function () {
				console.log('test');
    		$("#modal-modify-folder").foundation('reveal', 'open');
			});
			//fillPopOver("attention", $(this), 300, 300, closeAddProjectFunction); //ouverture du pop up
		}
	});

	submitModifyFolder($(".submit-modify-folder"), 'modifyFolder', folderName, statut);
	$thisEl = $this.parent();
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
	var parent = $thisEl;
	$('#modal-modify-folder').foundation('reveal', 'close');

	if(statut == "terminé"){
		$thisEl.find('.edit-icon').remove();
	}
	
	$thisEl.find('h2').html(name);
	$thisEl.find('.statut-type').html(" "+statut);
	$thisEl.find('.modify-date').html(modified);
}

// Supprimer le dossier
function removeFolder($this){
	var folderName = $this.parent().find('input.modify-folder').val();
	$('#modal-delete-alert').foundation('reveal', 'open');
	$('#modal-delete-alert button.oui').on('click', function(){
		console.log('oui');
		socket.emit('removeFolder', {name: folderName});
		$('#modal-delete-alert').foundation('reveal', 'close');
	});
	$('#modal-delete-alert button.annuler').on('click', function(){
		console.log('annuler');
		$('#modal-delete-alert').foundation('reveal', 'close');
		$(document).on('close.fndtn.reveal', '#modal-delete-alert[data-reveal]', function () {
	  	$('#modal-modify-folder').foundation('reveal', 'open');
		});
	});

	//socket.emit('removeFolder', {name: folderName});
}

/* HELPERS */
function transformDatetoString(date){
	var date = new Date(date);
	var day = date.getDate();
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	if(month<10){month = "0"+month;}
	if(day<10){day = "0"+day;}
	var formatDate = day + "/" + month + "/" + year;
	return formatDate;
}

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};