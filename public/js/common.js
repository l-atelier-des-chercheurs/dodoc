function transformDatetoString( date){
  if( date == undefined)
    return false;

  var getMomentObject = moment( date, 'YYYYMMDD_HH:mm:ss');
  var formatDate = getMomentObject.format('Do MMMM YYYY');
	return formatDate;
}

function transformDatetoTimestamp( date) {
  if( date == undefined)
    return false;
  var getMomentObject = moment( date, 'YYYYMMDD_HH:mm:ss');
  var formatDate = getMomentObject.format('X');
	return formatDate;
}

function convertToSlug(Text){

  if( Text === undefined)
    return false;

  // converti le texte en minuscule
	var s = Text.toLowerCase();
	// remplace les a accentué
	s = s.replace(/[àâäáã]/g, 'a');
	// remplace les e accentué
	s = s.replace(/[èêëé]/g, 'e');
	// remplace les i accentué
	s = s.replace(/[ìîïí]/g, 'i');
	// remplace les u accentué
	s = s.replace(/[ùûüú]/g, 'u');
	// remplace les o accentué
	s = s.replace(/[òôöó]/g, 'o');
	// remplace le c cédille
	s = s.replace(/[ç]/g, 'c');
	// remplace le ene tilde espagnol
	s = s.replace(/[ñ]/g, 'n');
	// remplace tous les caractères qui ne sont pas alphanumérique en tiret
	s = s.replace(/\W/g, '-');
	// remplace les double tirets en tiret unique
	s = s.replace(/\-+/g, '-');
	// renvoi le texte modifié
	return s;
}

function uploadImage($button){

	$('body').bind('change', $button, function(e){
		imageData = e.originalEvent.target.files;

  	// //change the label of the button in the name of the image
  	// console.log(this.files);
  	// imageName = this.files[0].name;
	  // var dflt = $(this).attr("placeholder");
	  // if($(this).val()!=""){
	  //   $(this).next().text(imageName);
	  // } else {
	  //   $(this).next().text(dflt);
	  // }
	});
}