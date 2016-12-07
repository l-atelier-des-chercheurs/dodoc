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
      "close" : "Fermer",
      "remove" : "Supprimer",
      "edit" : "Modifier",
      "accept" : "Valider",
      "uploadPubliToFtp" : "Envoyer la publication vers un FTP",

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
      "addLocalMedia" : "Importer un média",
      "back" : "retour",
      "fullscreen" : "Plein écran",
      "quitFullscreen" : "Quitter le plein écran",
      "removeThisImage" : "Supprimer cette image",
      "removeThisMedia" : "Supprimer ce média",
      "previzStopMotion" : "Prévisualiser",
      "finishStopmotion" : "Finaliser l’animation",
      "addToFav" : "Mettre en favoris",

      "selectTemplate" : "Sélection de gabarit",

      "thisFolderNameIsAlreadyTaken" : "Le nom de dossier suivant existe déjà : ",
      "pleaseUseAnother" : "Veuillez en utiliser un autre.",

      "browserCantUserWebRTC" : "Attention ! Votre navigateur ne permet pas de capturer des photos et du son (Safari ou appareils Apple).\nUtilisez l’option d’import  de la page Bibliothèque (croix jaune) pour ajouter des photos, des vidéos et du son.",
      "chooseCameraResolution" : "Sélectionnez la résolution de votre caméra",
      "customCameraResolution" : "Choississez une résolution",
      "backToAnimation" : "Retour à l’animation",

      "width" : "largeur",
      "height" : "hauteur",
      "apply" : "appliquer",

      "removeProject" : "Supprimer le projet",
      "createFolder" : "Créer un dossier",
      "createProject" : "Créer un projet",
      "show" : "afficher",

      "imageCount" : "Image ",
      "frameRate" : "Vitesse de lecture&nbsp;: ",

      "audioInputSource" : "source audio&nbsp;:",
      "audioOutputDestination" : "destination audio&nbsp;:",
      "videoInputSource" : "source video:",
      "lastImageOpacity" : "Afficher la dernière image en transparence",

      "currentVideoResolutionIs" : "Résolution actuelle&nbsp;: ",
      "videoStreamCouldntBeStartedTryChangingRes" : "Le flux vidéo n’a pas pu être démarré.\nEssayez de modifier la résolution dans le panneau de droite.",
      "videoStreamNotAvailable" : "Erreur : le flux vidéo n’est pas disponible.",
      "audioStreamCouldntBeStarted" : "Le flux audio n’a pas pu être démarré.",

      "mediapublitemplatesarestoredint" : "Les données chargées sur cette page sont stockées dans le dossier suivant&nbsp;: ",
      "toconnectwithanotherdevice" : "Pour vous connecter avec un autre appareil connecté au même réseau wifi, naviguez vers l’adresse suivante (et ignorez l’avertissement qui s’affiche)&nbsp;:",
      "clickHereToMoveContentFolder" : "Cliquez ici pour déplacer le dossier des contenus utilisateurs",


      "modal" : {
        "sureRemoveMedia" : "Êtes-vous sûr de vouloir supprimer ce média ?",
        "someFieldsAreEmptyFillThem" : "Tous les champs obligatoires ne sont pas remplis.",

        "addText" : "Ajouter du texte",

        "importAMedia" : "Importer un média",
        "importAFile" : "Importer un fichier depuis l'ordinateur",
        "acceptedFormats" : "Les formats acceptés sont le .jpg, .png et le .mp4.",

        "newFolder" : "Nouveau dossier",
        "informations" : "Informations",
        "pathofmedia" : "Emplacement du média sur le disque dur&nbsp;:",

        "editFolder" : "Modifier le dossier",
        "inprogress" : "En cours",
        "finished" : "Terminé",
        "warningFinishedStatus" : "Attention&nbsp;! Le statut terminé ne vous permettra plus d'éditer.",
        "sureToRemoveFolder" : "Êtes-vous sûr de vouloir supprimer le dossier ?",

        "editProject" : "Modifier le projet",

        "selectAnImage" : "Sélectionnez une image",
        "sureToRemoveProject" : "Êtes-vous sûr de vouloir supprimer le projet ?",

        "newProject" : "Nouveau projet",
        "newPubli" : "Nouvelle publication",
        "editPubli" : "Éditer la publication",

        "newMediaCreatedAtPath" : "Un nouveau média vient d’être créé dans le projet ",
        "newFolderCreatedWithName" : "Un nouveau dossier vient d’être créé avec pour nom ",
        "newProjectCreatedWithName" : "Un nouveau projet vient d’être créé avec pour nom ",
        "atPath" : " dans le chemin ",

        "moveContentFolder" : "Déplacer le dossier <em>dodoc</em> sur votre disque dur",

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

      "mediapublitemplatesarestoredint" : "Medias, publications and templates are currently stored in ",
      "toconnectwithanotherdevice" : "To connect with another device, use the following URL (and ignore the warning that’s shown):",

    }
  };
}

var settings = {

  "codelang" : lang,
  "userDirname": "user",
  "contentDirname" : "contenus",
  "publicationTemplateDirname" : "templates",
  "exportedPubliDir" : "publications",
  "metaFileext" : ".txt",
  "videoext" : ".webm",
  "stopMotionext" : ".webm",
  "audioext" : ".wav",
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
  "deletedPrefix" : "x_",
  "thumbSuffix" : "thumb",

  "mediaThumbWidth" : 720,
  "mediaThumbHeight" : 720,
  "mediaThumbQuality" : 60,

  "_comment" : "// see http://regexr.com/3d4t8",
  "regexpMatchFolderNames" : "^([^.]+)$",
  "regexpMatchProjectPreviewNames" : "^(apercu|preview)",
  "regexpGetFileExtension" : "\\.[^.]*$",
  "regexpRemoveFileExtension" : "(.+?)(\\.[^.]*$|$)",
  "regexpGetMediaName" : "^[^\-]*",

};

// should work in ES6
var dodoc = Object.assign( localize, settings);

try {
  module.exports = dodoc;
} catch( err) {

}