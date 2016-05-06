var lang = 'fr';


if( lang === 'fr') {
  var localize = {
    "lang" : {
      "folder" : "Dossier",
      "project" : "Projet",
      "projects" : "Projets",
      "capture" : "Prise de vue",
      "bibli" : "Bibliotheque de médias",
      "publi" : "Publication",

      "photo" : "photo",
      "video" : "video",
      "stopmotion" : "animation",
      "audio" : "son",

      "yes" : "oui",
      "cancel" : "annuler",

      "lastMediasAdded" : "Derniers médias ajoutés",
      "listOfPublications" : "Liste des publications",
      "createPublication" : "Créer une nouvelle publication",

      "quickAccess" : "Accès rapide",
      "createdOn" : "créé le",
      "modifiedOn" : "modifié le",
      "status" : "état",

      "modal" : {
        "sureRemoveMedia" : "Êtes-vous sûr de vouloir supprimer ce média ?",
        "addText" : "Ajouter du texte",
        "importAMedia" : "Importer un média",
        "importAFile" : "Importer un fichier depuis l'ordinateur",
        "acceptedFormats" : "Les formats acceptés sont le .jpg et le .mp4.",


      },

      "button" : {


      }


    }
  };
} else if( lang === 'en') {
  var localize = {
    "lang" : {
      "folder" : "Folder",
      "project" : "Project",
      "projects" : "Projects",
      "capture" : "Media capture",
      "bibli" : "Media library",
      "publi" : "Publication",

      "lastMediasAdded" : "Last medias added",
      "listOfPublications" : "List of publications",

    }
  };
}

var settings = {
  "contentDir" : "sessions",
  "metaFileext" : ".txt",
  "folderMetafilename" : "dossier",
  "projectMetafilename" : "projet",

  "projectPublisFoldername" : "publications",
  "projectPhotosFoldername" : "01-photos",
  "projectAnimationsFoldername" : "02-animations",
  "projectVideosFoldername" : "03-videos",
  "projectAudiosFoldername" : "04-sons",
  "projectTextsFoldername" : "05-textes",

  "metaDateFormat" : "YYYYMMDD_HHmmss",
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
};

// should work in ES6
var dodoc = Object.assign( localize, settings);

try {
  module.exports = dodoc;
} catch( err) {

}