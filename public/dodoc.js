var dodoc = {};

// custom settings for dodoc as globals accessible server-side and client-side
// from http://stackoverflow.com/a/5870544

// ou stocker les contenus
dodoc.contentDir = "sessions";

dodoc.folderJSONfilename = "dossier.json";
dodoc.projectJSONfilename = "projet.json";
dodoc.publiJSONfilename = "publi.json";

dodoc.projectPublisFoldername = "publications";
dodoc.projectPhotosFoldername = "01-photos";
dodoc.projectAnimationsFoldername = "02-animations";
dodoc.projectVideosFoldername = "03-videos";
dodoc.projectAudiosFoldername = "04-sons";
dodoc.projectTextsFoldername = "05-textes";

dodoc.nameOfFolder = "Dossier";
dodoc.nameOfProject = "Projet";
dodoc.nameOfCapture = "Prise de vue";
dodoc.nameOfBibli = "Bibliotheque de médias";
dodoc.nameOfPubli = "Publication";

dodoc.jsonDateFormat = 'YYYYMMDD_HHmmss';
dodoc.textEncoding = 'UTF-8';

dodoc.textFieldSeparator = '\n' + '\n' + '----' + '\n' + '\n';
  // previously /^\..*/
  // see http://regexr.com/3d4t8
dodoc.regexpMatchFolderNames = new RegExp(/^([^.]+)$/);
dodoc.regexpMatchProjectPreviewNames = new RegExp(/^(apercu|preview)/);
dodoc.regexpGetFileExtension = new RegExp(/\.[^.]*$/);
dodoc.regexpRemoveFileExtension = new RegExp(/(.+?)(\.[^.]*$|$)/);

try {
  module.exports = dodoc;
} catch( err) {

}


