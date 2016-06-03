// set lang here
var lang = 'fr';



// localize strings
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
      "ok" : "ok",
      "cancel" : "annuler",
      "name" : "Nom",
      "remove" : "Supprimer",
      "edit" : "Modifier",
      "accept" : "Valider",

      "lastMediasAdded" : "Derniers médias ajoutés",
      "listOfPublications" : "Liste des publications",
      "createPublication" : "Créer une nouvelle publication",

      "quickAccess" : "Accès rapide",
      "createdOn" : "créé le",
      "modifiedOn" : "modifié le",
      "status" : "état",
      "settings" : "Paramètres",

      "editTitle" : "Éditer le titre",
      "createText" : "Créer du texte",
      "importMedia" : "Importer un média",
      "back" : "retour",
      "fullscreen" : "Plein écran",
      "quitFullscreen" : "Quitter le plein écran",
      "removeThisImage" : "Supprimer cette image",
      "removeThisMedia" : "Supprimer ce média",
      "finishStopmotion" : "Finaliser l’animation",
      "addToFav" : "Mettre en favoris",

      "createNewStopmotion" : "Vous allez créer un nouveau stop motion.</br>Cliquez sur le <b>bouton d\’enregistrement</b> pour commencer à prendre des photos.",
      "changingMediaWhileStopmotion" : "Attention, vous devez valider votre stop-motion pour l’enregistrer.",
      "continueStopmotion" : "Continuer le stop motion",
      "removeStopmotion" : "Supprimer le stop motion",

      "chooseCameraResolution" : "Sélectionnez la résolution de votre caméra",

      "removeProject" : "Supprimer le projet",
      "createFolder" : "Créer un dossier",
      "createProject" : "Créer un projet",
      "show" : "afficher",

      "audioInputSource" : "source audio&nbsp;:",
      "audioOutputDestination" : "destination audio&nbsp;:",
      "videoInputSource" : "source video:",

      "videoStreamCouldntBeStartedTryChangingRes" : "Le flux vidéo n’a pas pu être démarré.\nEssayez de modifier la résolution dans le panneau de droite.",
      "audioStreamCouldntBeStarted" : "Le flux audio n’a pas pu être démarré.",

      "modal" : {
        "sureRemoveMedia" : "Êtes-vous sûr de vouloir supprimer ce média ?",

        "addText" : "Ajouter du texte",

        "importAMedia" : "Importer un média",
        "importAFile" : "Importer un fichier depuis l'ordinateur",
        "acceptedFormats" : "Les formats acceptés sont le .jpg et le .mp4.",

        "newFolder" : "Nouveau dossier",
        "informations" : "Informations",

        "editFolder" : "Modifier le dossier",
        "inprogress" : "En cours",
        "finished" : "Terminé",
        "warningFinishedStatus" : "Attention&nbsp;! Le statut terminé ne vous permettra plus d'éditer.",
        "sureToRemoveFolder" : "Êtes-vous sûr de vouloir supprimer le dossier&nbsp;?",

        "editProject" : "Modifier le projet",

        "selectAnImage" : "Sélectionnez une image",
        "sureToRemoveProject" : "Êtes-vous sûr de vouloir supprimer le projet&nbsp;?",

        "newProject" : "Nouveau projet"

      },


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

      "remove" : "Remove",

      "lastMediasAdded" : "Last medias added",
      "listOfPublications" : "List of publications",

    }
  };
}

var settings = {

  "codelang" : lang,
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
  "thumbSuffix" : "_thumb",

  "mediaThumbWidth" : 320,
  "mediaThumbHeight" : 240,

  "_comment" : "// see http://regexr.com/3d4t8",
  "regexpMatchFolderNames" : "^([^.]+)$",
  "regexpMatchProjectPreviewNames" : "^(apercu|preview)",
  "regexpGetFileExtension" : "\\.[^.]*$",
  "regexpRemoveFileExtension" : "(.+?)(\\.[^.]*$|$)"

};

// should work in ES6
var dodoc = Object.assign( localize, settings);

try {
  module.exports = dodoc;
} catch( err) {

}