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

	fillPopOver( newContentToAdd, $this, 300, 200, closeAddProjectFunction);
}