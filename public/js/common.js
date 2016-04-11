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
