var socket = io.connect();

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

jQuery(document).ready(function($) {

	init();
});

function init(){
	//Au click sur "Ajouter un nouveau dossier"
	$('.add-folder-wrapper').on('click',function(){
		createFolder($(this));
	});
}

//Ouverture du pop up et création d'un nouveau dossier
function createFolder($this){
	var newContentToAdd = "<h3 class='popoverTitle'>Nouveau dossier</h3><form onsubmit='return false;' class='add-folder-form'><input type='text' class='new-folder' placeholder='Nom'></input><input type='submit' class='submit-new-folder'></input></form>";
	var closeAddProjectFunction = function() {
	};

	fillPopOver(newContentToAdd, $this, 300, 200, closeAddProjectFunction); //ouverture du pop up
	submitFolder($(".submit-new-folder"), 'newFolder'); //Envoie les données au serveur
}

// Envoie les données du dossier au serveur
function submitFolder($button, send){
	$button.on('click', function(){
		var newFolderName = $('input.new-folder').val();

		socket.emit(send, {name: newFolderName});
	})
}

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};