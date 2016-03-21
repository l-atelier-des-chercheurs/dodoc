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

function convertToSlug(Text){
  // return Text
  // .toLowerCase()
  // .replace(/ /g,'-')
  // .replace(/[^\w-]+/g,'')
  // ;
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