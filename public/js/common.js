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
  return Text
  .toLowerCase()
  .replace(/ /g,'-')
  .replace(/[^\w-]+/g,'')
  ;
}

function uploadImage($button){
	$('body').bind('change', $button, function(e){
  	imageData = e.originalEvent.target.files;
  	console.log(imageData);
  	//change the label of the button in the name of the image
  	imageName = this.files[0].name;
	  var dflt = $(this).attr("placeholder");
	  if($(this).val()!=""){
	    $(this).next().text(imageName);
	  } else {
	    $(this).next().text(dflt);
	  }
	});
}