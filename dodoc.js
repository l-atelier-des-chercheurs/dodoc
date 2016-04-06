var dodoc = {};


// custom settings for dodoc
// from http://stackoverflow.com/a/5870544

// ou stocker les contenus
dodoc.contentDir = "sessions";

dodoc.folderJSONfilename = "dossier.json";
dodoc.projectJSONfilename = "projet.json";
dodoc.publiJSONfilename = "publi.json";

dodoc.nameOfFolder = "Dossier";
dodoc.nameOfProject = "Projet";
dodoc.nameOfCapture = "Prise de vue";
dodoc.nameOfBibli = "Bibliotheque de médias";
dodoc.nameOfPubli = "Publication";

  // previously /^\..*/
  // see http://regexr.com/3d4t8
dodoc.regexpMatchFolderNames = new RegExp(/^([^.]+)$/);
dodoc.regexpMatchProjectPreviewNames = new RegExp(/^(apercu|preview)/);

module.exports = dodoc;