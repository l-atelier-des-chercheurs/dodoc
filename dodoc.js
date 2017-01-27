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
      "generatePDF" : "Exporter la publication en PDF",

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
      "removeAndStopStopmotion" : "Arrêter et supprimer l’animation",
      "stopMotionCompilationProgress" : "Compilation d’une animation en cours&nbsp;:",
      "imagesAdded" : "images ajoutées",
      "addToFav" : "Mettre en favoris",

      "selectTemplate" : "Sélection de gabarit",

      "thisFolderNameIsAlreadyTaken" : "Le nom de dossier suivant existe déjà&nbsp;: ",
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

      "aStopmotionIsRecordingFinishItFirst" : "Une animation est en cours, terminez là pour changer de mode.",
      "aVideoIsRecordingFinishItFirst" : "Une vidéo est en cours d’enregistrement, terminez là pour changer de mode.",

      "audioInputSource" : "source audio&nbsp;:",
      "audioOutputDestination" : "destination audio&nbsp;:",
      "videoInputSource" : "source video:",
      "lastImageOpacity" : "Afficher la dernière image en transparence",
      "enableAudioInVideo" : "Enregistrer le son",
      "enableLogToFile" : "mode debug",

      "creditADC" : "do•doc est un projet développé par l’Atelier des Chercheurs",

      "currentVideoResolutionIs" : "Résolution actuelle&nbsp;: ",
      "videoStreamCouldntBeStartedTryChangingRes" : "Le flux vidéo n’a pas pu être démarré.\nEssayez de modifier la résolution dans le panneau de droite.",
      "videoStreamNotAvailable" : "Erreur : le flux vidéo n’est pas disponible.",
      "audioStreamCouldntBeStarted" : "Le flux audio n’a pas pu être démarré.",

      "mediapublitemplatesarestoredint" : "Les données chargées sur cette page sont stockées dans le dossier suivant&nbsp;: ",
      "toconnectwithanotherdevice" : "Pour vous connecter depuis un autre appareil qui se trouve sur le même réseau wifi, naviguez vers l’adresse suivante (et ignorez l’avertissement qui s’affiche)&nbsp;:",
      "clickHereToMoveContentFolder" : "Cliquez ici pour déplacer le dossier des contenus utilisateurs",

      "modal" : {
        "sureRemoveMedia" : "Êtes-vous sûr de vouloir supprimer ce média ?",
        "someFieldsAreEmptyFillThem" : "Tous les champs obligatoires ne sont pas remplis.",

        "addText" : "Ajouter du texte",

        "importAMedia" : "Importer un média",
        "importAFile" : "Importer un fichier depuis l'ordinateur",
        "acceptedFormats" : "Les formats acceptés sont le .jpeg, .png et le .mp4.",

        "newFolder" : "Nouveau dossier",
        "informations" : "Informations",
        "pathofmedia" : "Emplacement du média sur le disque dur&nbsp;:",
        "downloadThisMedia" : "Télécharger ce média",
        "downloadThePDF" : "Téléchargez le PDF&nbsp;:",

        "editFolder" : "Modifier le dossier",
        "inprogress" : "En cours",
        "finished" : "Terminé",
        "warningFinishedStatus" : "Attention&nbsp;! Le statut terminé ne vous permettra plus d'éditer.",
        "sureToRemoveFolder" : "Êtes-vous sûr de vouloir supprimer ce dossier ?",
        "sureToRemoveMedia" : "Êtes-vous sûr de vouloir supprimer ce média ?",

        "editProject" : "Modifier le projet",
        "pdfPublicationHasBeenSaved" : "La publication a bien été sauvegardée en PDF",
        "impossibleToConnectToServer" : "Impossible de se connecter au serveur",
        "loginOrPassIsWrong" : "Mauvais login ou mot de passe",
        "noInternetConnection" : "Pas de connexion internet",
        "noInternetCantSendPublicationOverFtp" : "Vous n'êtes pas connecté à internet, vous ne pouvez donc pas envoyer votre publication en FTP.",
        "yourFilesHaveBeenSaved" : "Vos fichiers web ont été sauvegardé&nbsp;:",
        "sendFilesToAServer" : "Envoyer les fichiers vers un serveur",
        "publiHasBeenSentToServer" : "La publication a bien été transferrée au server",
        "clickHereToOpenPubliInAWebBrowser" : "Lien vers votre publication&nbsp;:",

        "selectAnImage" : "Sélectionnez une image",
        "sureToRemoveProject" : "Êtes-vous sûr de vouloir supprimer le projet ?",

        "newProject" : "Nouveau projet",
        "newPubli" : "Nouvelle publication",
        "editPubli" : "Éditer la publication",

        "newMediaCreatedAtPath" : "Un nouveau média vient d’être créé dans le projet ",
        "newFolderCreatedWithName" : "Un nouveau dossier vient d’être créé avec pour nom ",
        "folderRemovedWithName" : "Le dossier suivant vient d’être supprimé&nbsp;: ",
        "newProjectCreatedWithName" : "Un nouveau projet vient d’être créé avec pour nom ",
        "projectRemovedWithName" : "Le projet suivant vient d’être supprimé&nbsp;: ",
        "atPath" : " dans le chemin ",

        "moveContentFolder" : "Déplacer le dossier <em>dodoc</em> sur votre disque dur",
        "instructionsToMoveContentFolder" : "En cliquant sur le bouton ci-dessous, cette fenêtre fermera et au prochain lancement vous serez invité à sélectionner un nouvel emplacement pour stocker les médias, les publications exportées et les templates. Si un dossier nommé <em>dodoc</em> ne s'y trouve pas déjà, il sera créé."

      },
    }
  };
} else if( lang === 'en') {
  var localize = {
    "lang" : {
      "folder" : "Folder",
      "project" : "Project",
      "projects" : "Projects",
      "capture" : "Capture",
      "bibli" : "Media Library",
      "publi" : "Publication",

      "photo" : "picture",
      "video" : "video",
      "stopmotion" : "stop-motion",
      "audio" : "sound",

      "yes" : "yes",
      "ok" : "ok",
      "cancel" : "cancel",
      "name" : "Name",
      "close" : "Close",
      "remove" : "Remove",
      "edit" : "Edit",
      "accept" : "Confirm",
      "uploadPubliToFtp" : "Upload online",
      "generatePDF" : "Create PDF",

      "lastMediasAdded" : "Latest Media",
      "listOfPublications" : "Publications",
      "createPublication" : "Create new publication",

      "quickAccess" : " ",
      "createdOn" : "created",
      "modifiedOn" : "edited",
      "status" : "status",
      "settings" : "settings",

      "editTitle" : "Edit Title",
      "createText" : "Write Text",
      "addLocalMedia" : "Import Media",
      "back" : "back",
      "fullscreen" : "Full screen",
      "quitFullscreen" : "Exit Fullscreen Mode",
      "removeThisImage" : "Delete picture",
      "removeThisMedia" : "Delete media",
      "previzStopMotion" : "Preview",
      "finishStopmotion" : "Save stop-motion",
      "removeAndStopStopmotion" : "Quit stop-motion",
      "stopMotionCompilationProgress" : "Rendering...",
      "imagesAdded" : "pictures saved",
      "addToFav" : "Bookmark",

      "selectTemplate" : "Template selection",

      "thisFolderNameIsAlreadyTaken" : "This name already exist&nbsp;: ",
      "pleaseUseAnother" : "Please use another name.",

      "browserCantUserWebRTC" : "Alert! Your browser does not allow you to capture media (Safari, Apple devices).\nClick the Import Media button in the Media Library to add pictures, video or sounds.",
      "chooseCameraResolution" : "Customize video resolution",
      "customCameraResolution" : "Select video resolution",
      "backToAnimation" : "Back to stop-motion",

      "width" : "width",
      "height" : "height",
      "apply" : "apply",

      "removeProject" : "Delete project",
      "createFolder" : "Create new folder",
      "createProject" : "Create new project",
      "show" : "display",

      "imageCount" : "Picture ",
      "frameRate" : "Frame Rate&nbsp;: ",

      "aStopmotionIsRecordingFinishItFirst" : "Terminate stop-motion before switching mode.",
      "aVideoIsRecordingFinishItFirst" : "Save video before switching mode.",

      "audioInputSource" : "Audio source&nbsp;:",
      "audioOutputDestination" : "Audio output &nbsp;:",
      "videoInputSource" : "Video source:",
      "lastImageOpacity" : "Onion skin",
      "enableAudioInVideo" : "Record sound",
      "enableLogToFile" : "debug mode",

      "creditADC" : "do•doc — a project by l’Atelier des Chercheurs",

      "currentVideoResolutionIs" : "current resolution&nbsp;: ",
      "videoStreamCouldntBeStartedTryChangingRes" : "Video stream not available.\nChange resolution preferences in the settings panels.",
      "videoStreamNotAvailable" : "Error: Video stream not available.",
      "audioStreamCouldntBeStarted" : "Audio stream not available.",

      "mediapublitemplatesarestoredint" : "Data are stored in &nbsp;: ",
      "toconnectwithanotherdevice" : "To access do•doc with another device, please connect it to the same wifi network, then type this adress in your browser (and ignore security message)&nbsp;:",
      "clickHereToMoveContentFolder" : "Click here to change repository",

      "modal" : {
        "sureRemoveMedia" : "Do you want to delete this media?",
        "someFieldsAreEmptyFillThem" : "Please fill required fields",

        "addText" : "Add Text",

        "importAMedia" : "Import media",
        "importAFile" : "Import file",
        "acceptedFormats" : "Available formats: .jpeg, .png et le .mp4.",

        "newFolder" : "New Folder",
        "informations" : "Information",
        "pathofmedia" : "Path to media on drive&nbsp;:",
        "downloadThisMedia" : "Download media",
        "downloadThePDF" : "Download PDF&nbsp;:",

        "editFolder" : "Edit Folder",
        "inprogress" : "in progress",
        "finished" : "Done",
        "warningFinishedStatus" : "Alert&nbsp;! This status will lock your project.",
        "sureToRemoveFolder" : "Do you want to delete this folder?",
        "sureToRemoveMedia" : "Do you want to delete this media?",

        "editProject" : "Edit project",
        "pdfPublicationHasBeenSaved" : "Your publication has been exported and saved as PDF",
        "impossibleToConnectToServer" : "Connexion to server failed.",
        "loginOrPassIsWrong" : "Login or Password incorrect",
        "noInternetConnection" : "No Internet Connexion",
        "noInternetCantSendPublicationOverFtp" : "To send your publication via FTP, please enable Internet connexion.",
        "yourFilesHaveBeenSaved" : "Your files have been saved&nbsp;:",
        "sendFilesToAServer" : "Send files to server",
        "publiHasBeenSentToServer" : "Your publication has been sent to server",
        "clickHereToOpenPubliInAWebBrowser" : "Link to your publication&nbsp;:",

        "selectAnImage" : "Select picture",
        "sureToRemoveProject" : "Do you want to delete this project?",

        "newProject" : "New project",
        "newPubli" : "New publication",
        "editPubli" : "Edit publication",

        "newMediaCreatedAtPath" : "New media saved ",
        "newFolderCreatedWithName" : "New folder saved ",
        "folderRemovedWithName" : "The folder has been deleted with success&nbsp;: ",
        "newProjectCreatedWithName" : "New project saved ",
        "projectRemovedWithName" : "The project has been deleted with success &nbsp;: ",
        "atPath" : " to ",

        "moveContentFolder" : "Move the folder <em>dodoc</em> on your drive",
        "instructionsToMoveContentFolder" : "By pressing confirm, do.doc will restart and ask you to select a new folder to store your media and publications. If there is no existing <em>dodoc</em> repository, one will be created."

      },
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
