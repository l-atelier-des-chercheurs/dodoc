module.exports = exportFTP;

var JSFtp = require("jsftp"),
		fs = require('fs-extra'),
		parsedown = require('woods-parsedown');
 
// var ftp = new JSFtp({
//   host: "ftp.sarahgarcin.com",
//   port: 21, // defaults to 21 
//   user: "sarahgar", // defaults to "anonymous" 
//   pass: "saracroche28" // defaults to "@anonymous" 
// });


function exportFTP(data) {
	console.log(data);
	var slugFolderName = data.slugFolderName;
	var slugProjectName = data.slugProjectName;
	var slugPubliName = data.slugPubliName;

	var publiPath = "sessions/"+ slugFolderName + "/" + slugProjectName + "/publications/";
	var folderPath = publiPath + slugPubliName;
	
	if (!fs.existsSync(folderPath)){
	    fs.mkdirSync(folderPath);
	}

	listMediaAndMetaFromOnePubli( slugFolderName, slugProjectName, slugPubliName).then(function( publiMedias) {
		console.log(publiMedias);
  }, function(error) {
    console.error("Failed to list one media! Error: ", error);
  });


	// var dataPubli = fs.readFileSync(publiPath + data.slugPubliName + '.txt', "utf8")
	// var parsed = parsedown(dataPubli);
	// var images = parsed.medias;

	// for(var i = 0; i<images.length; i++){
	// 	var imagePath = images[i].name; 
	// 	fs.createReadStream('test.log').pipe(fs.createWriteStream('newLog.log'));
	// }


	// var head = '<!DOCTYPE html><html><head><link rel="stylesheet" h<meta name="viewport" content="width=device-width,initial-scale=1.0"><meta name="apple-mobile-web-app-capable" content="yes"><link rel="stylesheet" href="/css/style.css"><title>Publication | hel</title></head><body>';
	// var footer = '</body>';
	// var total = head + data.html + footer;
	// fs.writeFile('test.html', total, function (err) {
	//   if (err) return console.log(err);
	//   console.log('html was saved');
	// });
	// console.log('TEST export FTP');
	
	// ftp.put('./sessions/demo/dossier.txt', './dodoc-test/dossier.txt', function(hadError) {
 //  if (!hadError)
 //    console.log("File transferred successfully!");
	// });
}


