var dodoc = {
  "contentDir" : "sessions",
  "folderJSONfilename" : "dossier.json",
  "projectJSONfilename" : "projet.json",
  "publiJSONfilename" : "publi.json",

  "projectPublisFoldername" : "publications",
  "projectPhotosFoldername" : "01-photos",
  "projectAnimationsFoldername" : "02-animations",
  "projectVideosFoldername" : "03-videos",
  "projectAudiosFoldername" : "04-sons",
  "projectTextsFoldername" : "05-textes",

  "nameOfFolder" : "Dossier",
  "nameOfProject" : "Projet",
  "nameOfCapture" : "Prise de vue",
  "nameOfBibli" : "Bibliotheque de médias",
  "nameOfPubli" : "Publication",

  "jsonDateFormat" : "YYYYMMDD_HHmmss",
  "textEncoding" : "UTF-8",
  "textFieldSeparator" : "\n\n----\n\n",
  "deletedPrefix" : "x_",

  "_comment" : "// see http://regexr.com/3d4t8",
  "regexpMatchFolderNames" : "^([^.]+)$",
  "regexpMatchProjectPreviewNames" : "^(apercu|preview)",
  "regexpGetFileExtension" : "\\.[^.]*$",
  "regexpRemoveFileExtension" : "(.+?)(\\.[^.]*$|$)",

  "captureVideoWidth" : 640,
  "captureVideoHeight" : 480,
}

try {
  module.exports = dodoc;
} catch( err) {

}