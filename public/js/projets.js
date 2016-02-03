/* VARIABLES */
var socket = io.connect();

var sessionId;
//get current session
var currentSession = app.session;

var thisProjectName;
var thisProject;
var imageData = null;
var imageName;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('listProject', onListProject); // Liste tous les projets
socket.on('projectCreated', onProjectCreated); // Quand un dossier est crée !
socket.on('folderAlreadyExist', onFolderAlreadyExist); // Si le nom de dossier existe déjà.

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});

function init(){
	// Create new project
	uploadImage($("#imageproject"));
	submitProject($(".submit-new-project"), 'newProject'); //Envoie les données au serveur
}

// Envoie les données du dossier au serveur
function submitProject($button, send){
	$button.on('click', function(){
		var newProjectName = $('input.new-project').val();
		if(imageData != null){
			console.log('Une image a été ajoutée');
			var f = imageData[0];
			var reader = new FileReader();
			reader.onload = function(evt){
				socket.emit(send, {session: currentSession, name: newProjectName, file:evt.target.result, imageName:imageName});
			};
			reader.readAsDataURL(f);
		}
		else{
			console.log("Pas d'image chargé");
			socket.emit(send, {session: currentSession, name: newProjectName});
		}
		$('input.new-project').val('');
		$('#imageproject').val('');
	})
}

// Affiche le projet dès qu'il est crée
function onProjectCreated(data){
	console.log(data);
	var folderName = data.name;
	var createdDate = transformDatetoString(data.created);
	var statut = data.statut;
	var image = data.image;
	if(data.modified!= null){var modifiedDate = transformDatetoString(data.modified);}
	else{var modifiedDate = data.modified;}
	$('input.new-project').val('');
	$('#modal-add-project').foundation('reveal', 'close');

	displayFolder(folderName, createdDate, modifiedDate, image, statut);
}

// Affiche la liste des projets
function onListProject(data){
	var folderName = data.name;
	var createdDate = transformDatetoString(data.created);
	var image = data.image;
	var statut = data.statut;
	if(data.modified!= null){var modifiedDate = transformDatetoString(data.modified);}
	else{var modifiedDate = data.modified;}

	displayFolder(folderName, createdDate, modifiedDate, image, statut);
}

// Fonction qui affichent les projets HTML
function displayFolder(name, created, modified, image, statut){
	console.log(statut);
	var formatName = convertToSlug(name);
	var contentHTML = '<a href="" title="'+name+'"><div class="content small-12 columns"><h2>'+name+'</h2></div></a>';
	var statutHTML= '<div class="statut small-6 columns"><span>statut</span><span class="statut-type"> '+statut+'</span></div>';
	if(image == "none"){
		var imageHTML = "";
	}
	else{
		var imageHTML = '<div class="image-wrapper small-6 columns"><img src="/'+currentSession+'/'+formatName+'/'+formatName+'-thumb.jpg" alt="'+name+'"></div>'
	}
	var createdHTML= '<div class="created small-6 columns"><span>crée le </span><span class="create-date">'+created+'</span></div>';
	if(modified!= null){
		var modifiedHTML= '<div class="modified small-6 columns"><span>modifié le </span><span class="modify-date">'+modified+'</span></div>';
	}
	else{
		var modifiedHTML= '<div class="modified small-6 columns"></div>';
	}
	if(statut == "terminé"){
		var editIcon='' ;
	}
	else{
		var editIcon = '<a href="#" class="edit-icon btn icon" data-reveal-id="modal-modify-project"><img src="/images/pen.svg" alt="edit icon"></a>';
	}
	var metaDataHTML = '<div class="meta-data row">'+statutHTML+createdHTML+modifiedHTML+'</div>';
	var folderHTML = '<li class="project small-12 columns" data-statut="'+statut+'">'+editIcon+'<div class="left-content small-6 columns">'+contentHTML+ metaDataHTML+'</div>'+imageHTML+'</li>';
	$("#container .project-list").prepend(folderHTML);
}


// Si un fichier existe déjà, affiche un message d'alerte
function onFolderAlreadyExist(data){
	alert("Le nom de dossier " +data.name+ " existe déjà. Veuillez trouvez un autre nom.");
	$('.new-project').focus();
}


/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listProject', {session: currentSession});
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};
