module.exports = (function() {
  // Ready translated locale messages
  const messages = {
    ascending: {
      fr: "Croissant",
      en: "Ascending",
      nl: "Toenemend",
      oc: "Creissent"
    },
    descending: {
      fr: "Décroissant",
      en: "Descending",
      nl: "Afnemend",
      oc: "Descreissent"
    },
    create_a_project: {
      fr: "Créer un projet",
      en: "Create a project",
      nl: "Project aanmaken ",
      oc: "Crear un projècte"
    },
    create_a_publication: {
      fr: "Créer une recette",
      en: "Create a recipe",
      nl: "Publicatie aanmaken ",
      oc: "Crear una recepta"
    },
    publication: {
      fr: "Recette",
      en: "Recipe",
      nl: "Publicatie",
      oc: "Recepta"
    },
    name: {
      fr: "Nom",
      en: "Name",
      nl: "Naam",
      oc: "Nom"
    },
    project_name: {
      fr: "Nom du projet",
      en: "Project name",
      nl: "Naam van het project",
      oc: "Nom del projècte"
    },
    created_date: {
      fr: "Date de création",
      en: "Created date",
      nl: "Datum van oprichting",
      oc: "Data de creacion"
    },
    uploaded: {
      fr: "Importation",
      en: "Uploaded",
      nl: "Geüpload",
      oc: "Importacion"
    },
    created: {
      fr: "Création",
      en: "Created",
      nl: "Gemaakt ",
      oc: "Creacion"
    },
    edited: {
      fr: "Édition",
      en: "Edited",
      nl: "Bewerkt",
      oc: "Edicion"
    },
    sent_date: {
      fr: "Date d’envoi",
      en: "Sent date",
      nl: "Verzendingsdatum",
      oc: "Data de mandadís"
    },
    for_the_placement_on_timeline: {
      fr: "(pour le placement sur la timeline)",
      en: "(used for the position on the timeline)",
      nl: "(voor de plaatsing op de tijdlijn)",
      oc: "Pel plaçament sus la timeline"
    },
    type: {
      fr: "Type",
      en: "Type",
      nl: "Type",
      oc: "Tipe"
    },
    color: {
      fr: "Couleur",
      en: "Color",
      nl: "Kleur",
      oc: "Color"
    },
    keywords: {
      fr: "Mots-clés",
      en: "Keywords",
      nl: "Kernwoorden",
      oc: "Mots-claus"
    },
    share: {
      fr: "Partage",
      en: "Share",
      nl: "Deel",
      oc: "Partatge"
    },
    copy: {
      fr: "Copier",
      en: "Copy",
      nl: "Kopiëren",
      oc: "Copiar"
    },
    author: {
      fr: "Auteur(s)",
      en: "Author(s)",
      nl: "Auteur",
      oc: "Autor"
    },
    download: {
      fr: "Télécharger",
      en: "Download",
      nl: "Downloaden",
      oc: "Telecargar"
    },
    caption: {
      fr: "Légende",
      en: "Caption",
      nl: "Bijschrift",
      oc: "Legenda"
    },
    formatting: {
      fr: "Mise en forme",
      en: "Formatting",
      nl: "Opmaak",
      oc: "Mesa en forma"
    },
    smoothing: {
      fr: "Lissage",
      en: "smoothing",
      nl: "effen",
      oc: "Lissatge"
    },
    onion_skin: {
      fr: "Pelure d’oignon",
      en: "Onion skin",
      nl: "uienschil",
      oc: "Pelofa de cèba"
    },
    "file:": {
      fr: "Fichier&nbsp;:",
      en: "File&nbsp;:",
      nl: "Bestand:",
      oc: "Fichièr"
    },
    add_to_project: {
      fr: "Ajouter au projet&nbsp;:",
      en: "Add to project:",
      nl: "Toevoegen aan project:",
      oc: "Apondre al projècte"
    },
    input_password: {
      fr: "Renseigner le mot de passe ci-dessous :",
      en: "Input the password here:",
      nl: "Wachtwoord invoeren:",
      oc: "Entresenhar lo mot de Santa-Clara çai-jos :"
    },
    validate_with_enter: {
      fr: "Valider avec la touche ENTRÉE.",
      en: "Validate with ENTER.",
      nl: "Bevestig met ENTER.",
      oc: "Validar amb la toca ENTRADA"
    },
    no_stopmotion_created_yet: {
      fr: "Les animations créées apparaîtront dans ce panneau.",
      en: "Created stopmotion animations will appear in this list.",
      nl: "Er is nog geen stopmotion gemaakt: ",
      oc: "Las animacions creadas apparaisseràn dins aqueste panèu."
    },
    device: {
      fr: "Appareil",
      en: "Device",
      nl: "Toestel",
      oc: "Aparelh"
    },
    "camera2 1, facing front": {
      fr: "Caméra frontale",
      nl: "Camera naar voren gericht ",
      oc: "Camerà frontala"
    },
    "camera2 0, facing back": {
      fr: "Caméra arrière",
      nl: "Camera naar achteren gericht ",
      oc: "Camerà arrièra"
    },
    very_slow: {
      fr: "Très lent",
      en: "Very slow",
      nl: "Zeer traag",
      oc: "Fòrça lent"
    },
    slow: {
      fr: "Lent",
      en: "Slow",
      nl: "Traag",
      oc: "Lent"
    },
    speed_medium: {
      fr: "Normal",
      en: "Normal",
      nl: "Normaal",
      oc: "Normal"
    },
    fast: {
      fr: "Rapide",
      en: "Fast",
      nl: "Snel",
      oc: "Rapid"
    },
    forget_password_and_close: {
      fr: "Oublier le mot de passe et fermer le projet",
      en: "Forget password and close project",
      nl: "Wachtwoord vergeten en sluiten ",
      oc: "Doblidar lo mot de Santa-Clara e clavar lo projècte"
    },
    remember_password_on_this_device: {
      fr: "Sauvegarder pour cet appareil",
      en: "Remember for this device",
      nl: "Wachtwoord onthouden op dit toestel",
      oc: "Salvagardar per aqueste aparelh"
    },
    cooking_pot: {
      fr: "La marmite",
      en: "Cooking pot",
      nl: "De ketel",
      oc: "L'ola"
    },
    copy_of: {
      fr: "Copie de",
      en: "Copy of",
      nl: "Kopie van",
      oc: "Còpia de"
    },
    text_overflow: {
      fr: "Texte en excès",
      en: "Overflow text",
      nl: "Tekstoverloop",
      oc: "Tèxte en excès"
    },
    move_to_foreground: {
      fr: "Mettre au premier plan",
      en: "Move to foreground",
      nl: "Op de voorgrond plaatsen. ",
      oc: "Botar al primièr plan"
    },
    move_to_background: {
      fr: "Mettre à l’arrière plan",
      en: "Move to background",
      nl: "Op de achtergrond plaatsen",
      oc: "Botar al rèire plan"
    },
    "layer:": {
      fr: "Calque&nbsp;:",
      en: "Layer:",
      nl: "Laag:",
      oc: "Calca"
    },
    css_settings: {
      fr: "Règlages CSS",
      en: "CSS settings",
      nl: "CSS instellingen",
      oc: "Reglatges CSS"
    },
    edit_content: {
      fr: "Modifier le contenu",
      en: "Edit content",
      nl: "Inhoud wijzigen ",
      oc: "Modificar lo contengut"
    },
    adjust: {
      fr: "Ajuster",
      en: "Adjust",
      nl: "Wijzigen",
      oc: "Ajustar"
    },
    rotate_clockwise: {
      fr: "Pivoter vers la droite",
      en: "Rotate clockwise",
      oc: "Virar cap a drecha"
    },
    convert_video_for_the_web: {
      fr: "Optimiser la vidéo",
      en: "Optimize video",
      oc: "Optimizar la vidèo"
    },
    revert_to_original: {
      fr: "Revenir à l’original",
      en: "Revert to original",
      oc: "Tornar a l'original"
    },
    duplicate: {
      fr: "Dupliquer",
      en: "Duplicate",
      nl: "Dupliceren",
      oc: "Duplicar"
    },
    search: {
      fr: "Rechercher",
      en: "Search",
      oc: "Cercar"
    },
    project_name_to_find: {
      fr: "Rechercher par nom de projet",
      en: "Search by project name",
      oc: "Cercar per nom de projècte"
    },
    show_all: {
      fr: "Tout afficher",
      en: "Show all",
      nl: "Alles tonen",
      oc: "Afichar tot"
    },
    cooking_pot_instructions: {
      fr: "Mélangez des médias pour en créer des nouveaux !",
      en: "Mix a single or multiple medias to create new medias!",
      nl: "Meng bestanden om nieuwe bestanden te maken !",
      oc: "Mesclar de mèdias per ne crear de novèls !"
    },
    untitled: {
      fr: "Sans titre",
      en: "Untitled",
      nl: "Zonder naam",
      oc: "Sens títol"
    },
    mix_audio_and_video: {
      fr: "Son sur une vidéo",
      en: "Sound + video",
      nl: "Video- en geluidsbestanden combineren",
      oc: "Son sus una vidèo"
    },
    mix_audio_and_image: {
      fr: "Son sur une image",
      en: "Sound + image",
      nl: "Foto- en geluidsbestanden combineren",
      oc: "Son sus un imatge"
    },
    add_sound_video_file: {
      fr:
        "Ouvrez un projet et ajoutez un média <b>son</b> et un média <b>vidéo</b> en cliquant sur la flèche verte.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : une vidéo et une piste sonore.",
      en: "Add a <b>sound</b> and a <b>video</b> media to create a new video.",
      nl:
        "Open een project en voeg een <b>geluidsbestand</b> en een <b>videobestand</b> toe door op de groene pijl te klikken .<br>Als u exporteert, wordt een nieuwe video gemaakt .<br>Ondersteunde bestandstypen : video en geluid.",
      oc:
        "Dubrissètz un projècte e apondètz un mèdia <b>son</b> e un mèdia <b>vidèo</b> en cliquant sus la sageta verda.<br>L’exportacion crearà una novèla vidèo.<br>mèdias acceptats : una vidèo e una pista sonora."
    },
    add_sound_image_file: {
      fr:
        "Ouvrez un projet et ajoutez un média <b>son</b> et un média <b>image</b> en cliquant sur la flèche verte.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : une image et une piste sonore.",
      en: "Add a <b>sound</b> and an <b>image</b> media to create a new video.",
      nl:
        "Open een project en voeg een <b>geluidsbestand</b> en een <b>fotobestand</b> toe door op de groene pijl te klikken .<br>Als u exporteert, wordt een nieuwe video gemaakt .<br>Ondersteunde bestandstypen : foto en geluid.",
      oc:
        "Dubrissètz un projècte e apondètz un mèdia <b>son</b> e un mèdia <b>imatge</b> en cliquant sus la sageta verda.<br>L’exportacion crearà una nouvèla vidèo.<br>mèdias acceptats : un imatge e una pista sonora."
    },
    add_multiple_videos_files: {
      fr:
        "Ouvrez un projet et ajoutez plusieurs médias <b>vidéo</b> en cliquant sur la flèche verte. Les vidéos seront mises bout à bout dans l’ordre d’ajout.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : uniquement des vidéos de même taille.",
      en: "Add multiple <b>video</b> medias to create a new video.",
      nl:
        "Open een project en voeg meerdere <b>video</b>bestanden toe door op de groene pijl te klikken . Video’s worden in volgorde van toevoeging na elkaar geplaatst.<br>Als u exporteert, wordt een nieuwe video gemaakt .<br> Ondersteunde bestandstypen : alleen video’s van hetzelfde formaat.",
      oc:
        "Dubrissètz un projècte e apondètz mantunes mèdias <b>vidèo</b> en cliquant sus la sageta verda. Las vidèos seràn mesas bout à bout dins l’òrdre d’apondon.<br>L’exportacion crearà una nouvèla vidèo.<br>mèdias acceptats : unicament de vidèos de meteissa talha."
    },
    add_multiple_images: {
      fr:
        "Ouvrez un projet et ajoutez plusieurs médias <b>image</b> en cliquant sur la flèche verte. Les images seront mises bout à bout dans l’ordre d’ajout. Exportez la séquence et réglez la vitesse de défilement des images.<br>L’exportation créera une vidéo.<br>Médias acceptés : uniquement des images. Les dimensions de la première image détermine si la vidéo finale est en portrait ou paysage.",
      en: "Add multiple <b>image</b> medias to create a video.",
      nl:
        "Open een project en voeg verschillende <b>foto</b>bestanden toe door op de groene pijl te klikken. Foto’s worden in volgorde van toevoeging na elkaar geplaatst. Exporteer de beelden en pas de schuifsnelheid van de beelden aan.<br>Als u exporteert, wordt een nieuwe video gemaakt .<br> Ondersteunde bestandstypen : enkel fotobetanden. De afmetingen van het eerste beeld bepalen of de uiteindelijke video als portret of landschap is ingedeeld.",
      oc:
        "Dubrissètz un projècte e apondètz mantunes mèdias <b>imatge</b> en cliquant sus la sageta verda. Los imatges seràn botats bout à bout dins l’òrdre d’apondon. Exportatz la séquence et reglatz la vitessa de défilement des images.<br>L’exportation créera una vidèo.<br>mèdias acceptés : uniquement des images. Les dimensions de la première image détermine si la vidèo finala es en retrach o paisatge."
    },
    style: {
      fr: "style",
      en: "style",
      nl: "stijl",
      oc: "estil"
    },
    css: {
      fr: "css",
      en: "css",
      nl: "css",
      oc: "css"
    },
    write_some_CSS_code_for_example: {
      fr: "Écrivez ici du code CSS, <br>par exemple <code>color: blue;</code>",
      en: "Write here some CSS code, <br>for example <code>color: blue;</code>",
      nl: "Noteer hier CSS code, <br>bijvoorbeeld <code>color: blue;</code>",
      oc:
        "Escrigatz aicí de còde CSS, <br>per exemple <code>color: blue;</code>"
    },
    framerate: {
      fr: "images par seconde",
      en: "images per second",
      nl: "beelden per seconde, ",
      oc: "imatges per seconda"
    },
    timelapse: {
      fr: "déclenchement automatique",
      en: "timelapse",
      nl: "tijdsverloop ",
      oc: "delargament automatic"
    },
    seconds_per_image: {
      fr: "secondes par image",
      en: "seconds per image",
      nl: "seconden per beeld",
      oc: "secondas per imatge"
    },
    seconds: {
      fr: "secondes",
      en: "seconds",
      nl: "seconden",
      oc: "secondas"
    },
    quality: {
      fr: "qualité",
      en: "quality",
      nl: "kwaliteit",
      oc: "qualitat"
    },
    bytes: {
      fr: "octets",
      en: "bytes",
      nl: "bytes",
      oc: "octets"
    },
    kb: {
      fr: "ko",
      en: "KB",
      nl: "kb",
      oc: "ko"
    },
    mb: {
      fr: "Mo",
      en: "MB",
      nl: "Mb",
      oc: "Mo"
    },
    gb: {
      fr: "Go",
      en: "GB",
      nl: "Gb",
      oc: "Go"
    },
    duration: {
      fr: "Durée",
      en: "Duration",
      nl: "Duur",
      oc: "Durada"
    },
    send: {
      fr: "Envoyer",
      en: "Send",
      nl: "Verzenden",
      oc: "Mandar"
    },
    open_in_dodoc: {
      fr: "Ouvrir dans do•doc",
      en: "Open in do•doc",
      nl: "Openen in do•doc",
      oc: "Dubrir dins do•doc"
    },
    connect_to_dodoc: {
      fr: "Accéder à do•doc",
      en: "Open do•doc",
      nl: "Toegang tot do•doc",
      oc: "Accedir a do•doc"
    },
    login: {
      fr: "S’identifier",
      en: "Login",
      nl: "Inloggen ",
      oc: "S'identificar"
    },
    adding_password_warning: {
      fr:
        "Attention ! Si vous ajoutez ou modifiez un mot de passe tous les utilisateurs qui y sont actuellement connectés devront le renseigner avant de pouvoir continuer à contribuer.",
      en:
        "Warning! Adding or changing the password will disconnect all users until they enter the new password.",
      nl:
        "Opgelet! Als u een wachtwoord toevoegt of wijzigt, moeten alle gebruikers die er momenteel mee verbonden zijn dit invoeren voordat ze een bijdrage kunnen blijven leveren..",
      oc:
        "Avisa ! Si volètz apondre o modificar un mot de passa totes los utilizaires que i son ara conectats deuràn l'entresenhar abans que de poder continuar."
    },
    removing_password_warning: {
      fr:
        "Si vous retirez le mot de passe tous les utilisateurs qui ont accès à do•doc pourront modifier le projet.",
      en:
        "Removing the password for this project will allow everyone to access, edit and delete it.",
      nl:
        "Als u het wachtwoord verwijdert, kunnen alle gebruikers die toegang hebben tot do•doc het project wijzigen.",
      oc:
        "Si tiratz lo mot de Santa-Clara totes los utilizaires qu'an accès a do•doc poiràn modificar lo projècte."
    },
    help: {
      fr: "Aide",
      en: "Help",
      nl: "Hulp",
      oc: "Ajuda"
    },
    date: {
      fr: "Date",
      en: "Date",
      nl: "Datum",
      oc: "Data"
    },
    portrait: {
      fr: "Portrait",
      en: "Portrait",
      nl: "Portret",
      oc: "Retrach"
    },
    nfc_tag: {
      fr: "Tag NFC",
      en: "Tag NFC",
      nl: "Tag NFC",
      oc: "Tag NFC"
    },
    yes: {
      fr: "Oui",
      en: "Yes",
      nl: "ja",
      oc: "Òc"
    },
    cancel: {
      fr: "Annuler",
      en: "Cancel",
      nl: "Annuleren",
      oc: "Anullar"
    },
    back: {
      fr: "Retour",
      en: "Back",
      nl: "Terug",
      oc: "Tornar"
    },
    sureToRemoveAuthor: {
      fr:
        "Êtes-vous sûr de vouloir supprimer cet auteur ? Tous les médias, projets et recettes associés seront conservés.",
      en:
        "Do you really want to delete this author? All medias, projects and recipes will be kept.",
      nl: "Weet u zeker dat u deze auteur wilt verwijderen ?",
      oc:
        "Sètz segur de voler suprimir aqueste autor ? Totes los mèdias, projèctes e recèptas associadas seràn servadas."
    },
    show_all_authors: {
      fr: "Afficher l’ensemble des auteurs",
      en: "Show all authors",
      nl: "Bekijk alle auteurs",
      oc: "Afichar totes los autors"
    },
    show_all_keywords: {
      fr: "Afficher l’ensemble des mots-clés",
      en: "Show all keywords",
      nl: "Bekijk alle kernwoord",
      oc: "Afichar totes los mots-claus"
    },
    hide_all_keywords: {
      fr: "Masquer l’ensemble des mots-clés",
      en: "Hide all keywords",
      oc: "Amagar totes los mots-claus"
    },
    all_tags: {
      fr: "Liste des mots-clés disponibles",
      en: "List of keywords available",
      oc: "Tièra dels mots-claus disponibles"
    },
    changes_not_saved_sureToCloseModal: {
      fr: "Des modifications ont eu lieu, souhaitez-vous les enregistrer ?",
      en:
        "All changes were not saved. Do you really want to close this window?",
      nl: "Er zijn wijzigingen gebeurd , wilt u deze opslaan?",
      oc: "De modificacions se faguèron, desiratz de las enregistrar ?"
    },
    save_changes: {
      fr: "Oui, enregistrer les modifications",
      en: "Yes, save changes",
      nl: "Ja, wijzigingen opslaan. ",
      oc: "Òc, enregistrar las modificacions"
    },
    close_the_window: {
      fr: "Non, fermer sans enregistrer",
      en: "No, close without saving",
      nl: "Nee, sluiten zonder opslaan",
      oc: "Non, clavar sens enregistrar"
    },
    sureToRemovePubli: {
      fr: "Êtes-vous sûr de vouloir supprimer cette recette ?",
      en: "Do you really want to delete this recipe?",
      nl: "Weet u zeker dat u deze publicatie wilt verwijderen?",
      oc: "Sètz segur de voler suprimir aquesta recèpta ?"
    },
    sure_to_cancel_stopmotion: {
      fr:
        "Êtes-vous sûr de vouloir arrêter cette animation ? Vous pourrez la retrouver dans le menu <i>Liste des animations</i>",
      en:
        "Do you really want to cancel this stopmotion? You can resume making it by clicking on <i>Stopmotion list</i>",
      nl:
        "Weet je zeker dat je deze animatie wilt stoppen? U kunt het terugvinden in het menu <i>Lijst van animaties</i>.",
      oc:
        "Sètz segur de voler arestar aquesta animacion ? La poiretz tornar trobar dins lo menut <i>Tièra de las animacions<i>"
    },
    validate_media: {
      fr: "Valider le média",
      en: "Validate the media",
      nl: "Media valideren",
      oc: "Validar lo mèdia"
    },
    add_keyword: {
      fr: "Ajouter un mot-clé",
      en: "Add a keyword",
      nl: "Kernwoord toevoegen",
      oc: "Apondre un mot-clau"
    },
    add: {
      fr: "Ajouter",
      en: "Add",
      nl: "Toevoegen",
      oc: "Apondre"
    },
    close: {
      fr: "Fermer",
      en: "Fermer",
      nl: "Sluiten",
      oc: "Clavar"
    },
    very_high: {
      fr: "Très élevée (1080p)",
      en: "Very high (1080p)",
      nl: "Zeer hoog (1080p)",
      oc: "Fòrça nauta (1080p)"
    },
    high: {
      fr: "Élevée (720p)",
      en: "High (1080p)",
      nl: "Hoog (720p)",
      oc: "Nauta"
    },
    medium: {
      fr: "Moyenne (640p)",
      en: "Medium (640p)",
      nl: "Medium (640p)",
      oc: "Mejana (640p)"
    },
    low: {
      fr: "Basse (360p)",
      en: "Low (360p)",
      nl: "Laag (360p)",
      oc: "Bassa (360p)"
    },
    showing: {
      fr: "Affichage de",
      en: "Showing",
      nl: "Weergave ",
      oc: "Affichatge de"
    },
    media_filter: {
      fr: "Filtre de médias",
      en: "Medias filter",
      nl: "Bestandsfilter",
      oc: "Filtre de mèdias"
    },
    no_projects_yet: {
      fr:
        "Il n’y a pas encore de projet, créez-en un pour commencer à utiliser do•doc !",
      en: "No projects yet, create one to start using do•doc!",
      nl:
        "Er is nog geen project, maak er een aan om do•doc in gebruik te nemen!",
      oc:
        "Pas de projèctes encara, creatz-ne un per començar d'utilizar do•doc !"
    },
    projects_of: {
      fr: "projets sur",
      en: "projects of",
      nl: "projecten van",
      oc: "projèctes sus"
    },
    medias_of: {
      fr: "médias sur",
      en: "medias of",
      nl: "bestanden van",
      oc: "mèdias sus"
    },
    projects: {
      fr: "Projets",
      en: "Projects",
      nl: "Projecten",
      oc: "Projèctes"
    },
    project: {
      fr: "Projet",
      en: "Project",
      nl: "Project",
      oc: "Projècte"
    },
    medias: {
      fr: "Médias",
      en: "Medias",
      nl: "Bestanden",
      oc: "Mèdias"
    },
    media: {
      fr: "Média",
      en: "Media",
      nl: "Media",
      oc: "Mèdia"
    },
    authors: {
      fr: "Auteurs",
      en: "Authors",
      nl: "Auteurs",
      oc: "Autors"
    },
    authors_list: {
      fr: "Liste des auteurs",
      en: "List of authors",
      nl: "Lijt van auteurs",
      oc: "Tièra dels autors"
    },
    create_an_author: {
      fr: "Créer un auteur",
      en: "Create an author",
      nl: "Maak een auteur aan",
      oc: "Crear un autor"
    },
    favorite_medias: {
      fr: "Média favoris",
      en: "Favorite medias",
      nl: "Favoriete media",
      oc: "Mèdia favorit"
    },
    all_medias: {
      fr: "Tous les médias",
      en: "All medias",
      nl: "Alle media",
      oc: "Totes los mèdias"
    },
    create_text: {
      fr: "Écrire",
      en: "Write",
      nl: "Schrijven",
      oc: "Escriure"
    },
    import: {
      fr: "Importer",
      en: "Import",
      nl: "Importeren",
      oc: "Importar"
    },
    import_all_files: {
      fr: "Importer tous les fichiers",
      en: "Import all files",
      nl: "Importeer alle bestanden",
      oc: "Importar totes los fichièrs"
    },
    import_medias: {
      fr: "Importer des médias",
      en: "Import medias",
      nl: "Importeer media",
      oc: "Importar de mèdias"
    },
    select_files_to_import: {
      fr: "Sélectionner les fichiers à importer",
      en: "Select files to import",
      nl: "Selecteer bestanden om te importeren ",
      oc: "Seleccionar los fichièrs d'importar"
    },
    upload_from_device: {
      fr: "Importer un fichier image",
      en: "Upload an image file",
      nl: "Selecteer een omslagafbeelding",
      oc: "Importar un fichièr imatge"
    },
    or_choose_from_image_medias: {
      fr: "Ou choisir un média image",
      en: "Or choose from image medias",
      oc: "O causir un mèdia imatge"
    },
    select_portrait_image: {
      fr: "Importer un fichier image",
      en: "Import an image file",
      nl: "Selecteer een portretfoto",
      oc: "Importar un fichièr imatge"
    },
    add_to_recipe: {
      fr: "Ajouter à la recette",
      en: "Add to recipe",
      nl: "Toevoegen aan recept",
      oc: "Apondre a la recèpta"
    },
    add_a_page: {
      fr: "Ajouter une page",
      en: "Add a page",
      nl: "Een pagina toevoegen",
      oc: "Apondre una pagina"
    },
    insert_a_page_here: {
      fr: "Insérer une page ici",
      en: "Insert a page here",
      nl: "Hier een pagina invoegen",
      oc: "Inserir una pagina aicí"
    },
    add_a_page_before: {
      fr: "Ajouter une page avant celle-ci",
      en: "Add a page before this one",
      nl: "Hiervoor een pagina toevoegen ",
      oc: "Apondre una pagina abans aquela"
    },
    add_a_page_after: {
      fr: "Ajouter une page après celle-ci",
      en: "Add a page after this one",
      nl: "Hierna een pagina toevoegen ",
      oc: "Apondre una pagina aprèp aquela"
    },
    add_a_page_here: {
      fr: "Ajouter une page ici",
      en: "Add a page here",
      nl: "Hier een pagina toevoegen",
      oc: "Apondre una pagina aicí"
    },
    remove_this_page: {
      fr: "▲ Supprimer cette page ▲",
      en: "▲ Remove this page ▲",
      nl: "▲ deze pagina verwijderen ▲",
      oc: "▲ Suprimir aquesta pagina ▲"
    },
    anonymous: {
      fr: "anonyme",
      en: "anonymous",
      nl: "anoniem",
      oc: "anonime"
    },
    other_users: {
      fr: "autres utilisateurs",
      en: "other users",
      nl: "andere gebruikers",
      oc: "autres utilizaires"
    },
    other_users_connected: {
      fr: "autres utilisateurs connectés",
      en: "other user connected",
      nl: "andere verbonden gebruikers",
      oc: "autres utilizaires connectats"
    },
    mix_medias: {
      fr: "Mélanger des médias",
      en: "Mix medias",
      nl: "Mengen van media",
      oc: "Mesclar de mèdias"
    },
    made_with_dodoc: {
      fr: "Page web réalisée avec l’application libre et gratuite do•doc",
      en: "Webpage made with do•doc, a free and open-source app",
      nl: "Webpagina gerealiseerd met de gratis applicatie do•doc",
      oc: "Pagina web creada amb l'aplicacion liura e gratuita do•doc"
    },
    loading: {
      fr: "chargement",
      en: "loading",
      nl: "laden",
      oc: "cargament"
    },
    open: {
      fr: "Ouvrir",
      en: "Open",
      nl: "Openen",
      oc: "Dubrir"
    },
    save: {
      fr: "Enregistrer",
      en: "Save",
      nl: "Opslaan",
      oc: "Enregistrar"
    },
    as_favorite: {
      fr: "+ favoris",
      en: "+ favourite",
      nl: "toevoegen aan favorieten",
      oc: "+ favorits"
    },
    edit: {
      fr: "Modifier",
      en: "Edit",
      nl: "Wijzigen",
      oc: "Modificar"
    },
    width: {
      fr: "Largeur",
      en: "Width",
      nl: "Breedte",
      oc: "Largor"
    },
    height: {
      fr: "Hauteur",
      en: "Height",
      nl: "Hoogte",
      oc: "Nautor"
    },
    zoom: {
      fr: "Zoom",
      en: "Zoom",
      nl: "Zoom",
      oc: "Zoom"
    },
    settings: {
      fr: "Règlages",
      en: "Settings",
      nl: "Instellingen",
      oc: "Reglatges"
    },
    stopmotion_list: {
      fr: "Liste des animations",
      en: "Stopmotion list",
      nl: "Lijst van animaties",
      oc: "Tièra de las animacions"
    },
    print: {
      fr: "Imprimer",
      en: "Print",
      nl: "Afdrukken",
      oc: "Estampar"
    },
    create: {
      fr: "Créer",
      en: "Create",
      nl: "Aanmaken",
      oc: "Crear"
    },
    remove: {
      fr: "Supprimer",
      en: "Remove",
      nl: "Verwijderen",
      oc: "Suprimir"
    },
    remove_image: {
      fr: "Supprimer l’image",
      en: "Remove image",
      oc: "Suprimir l'imatge"
    },
    withdraw: {
      fr: "Enlever",
      en: "Withdraw",
      nl: "Terugtrekken",
      oc: "Tirar"
    },
    remove_this_image: {
      fr: "Supprimer cette image",
      en: "Remove this image",
      nl: "Dit beeld verwijderen",
      oc: "Suprimir aqueste imatge"
    },
    password: {
      fr: "Mot de passe",
      en: "Mot de passe",
      nl: "Wachtwoord",
      oc: "Mot de Santa Clara"
    },
    password_required_to_open: {
      fr: "Mot de passe requis",
      en: "Password required",
      nl: "Wachtwoord vereist",
      oc: "Mot de Santa Clara requesit"
    },
    show_password: {
      fr: "Afficher le mot de passe",
      en: "Show password",
      nl: "Wachtwoord tonen ",
      oc: "Afichar lo mot de Santa Clara"
    },
    hide: {
      fr: "Cacher",
      en: "Hide",
      nl: "Verbergen",
      oc: "Amagar"
    },
    protected_by_pass: {
      fr: "protégé par mot de passe",
      en: "protected by password",
      nl: "Beveiligd met een wachtwoord. ",
      oc: "protegit per mot de Santa Clara"
    },
    password_instructions: {
      fr:
        "Si existant, seul les utilisateurs possédant ce mot de passe pourront ouvrir ce projet.",
      en:
        "If set, only users with the password will be able to open this project.",
      nl:
        "Indien van toepassing, alleen gebruikers met dit wachtwoord kunnen dit project openen.",
      oc:
        "Si existent, sonque los utilizaires tenent aqueste mot de Santa Clara poiràn dubrir aqueste projècte."
    },
    author_instructions: {
      fr:
        "Pour créer des auteurs, fermez cette fenêtre et cliquez sur le bouton (AUTEURS).",
      en: "To create authors, close this window and click on (AUTHORS).",
      nl:
        "Om auteurs aan te maken, sluit dit venster en klik op de knop (AUTEURS).",
      oc:
        "Per crear d'autors, clavatz aquesta fenèstra e clicatz sul boton (AUTORS)."
    },
    translate_dodoc_instructions: {
      fr:
        "Pour proposer une nouvelle traduction, rendez-vous sur le <a href='https://forum.latelier-des-chercheurs.fr/t/traduire-do-doc-comment-s-y-prendre/' class='js--openInBrowser' target='_blank'>forum dédié</a> ou contactez-nous par mail : <a href='mailto:info@latelier-des-chercheurs.fr?subject=traduire%20do•doc' class='js--openInBrowser' target='_blank'>info@latelier-des-chercheurs.fr</a>.",
      en:
        "To translate do•doc, consult the following <a href='https://forum.latelier-des-chercheurs.fr/t/traduire-do-doc-comment-s-y-prendre/' class='js--openInBrowser' target='_blank'>forum post (in french)</a> or get in touch via email: <a href='mailto:info@latelier-des-chercheurs.fr?subject=translate%20do•doc' class='js--openInBrowser' target='_blank'>info@latelier-des-chercheurs.fr</a>."
    },
    author_name_editing_instructions: {
      fr:
        "Attention&nbsp;! Si vous modifiez ce nom tous les médias, projets et recettes resteront associés au nom précédent.",
      en:
        "Warning! All existing medias, projects and recipes will still be associated to the previous name.",
      oc:
        "Avisa ! Si modificatz aqueste nom totes los mèdias, projèctes e recèptas demoraràn associats al nom precedent."
    },
    when_logged_as_author_content_will_be_tagged: {
      fr:
        "Lorsque vous êtes identifié comme auteur tous les projets, médias et recettes porteront votre nom.",
      en:
        "When logged in as an author all projects, medias and recipes will be saved with your name.",
      oc:
        "Quand seretz identificats coma autor totes los mèdias, projèctes e recèptas portaràn vòstre nom."
    },
    more_informations_on_authors: {
      fr:
        "Vous pourrez ajouter d’autres co-auteurs directement dans les projets, médias et recettes. Si vous supprimez un auteur, tous les médias, projets et recettes conserveront le nom d’auteur et ne seront pas supprimées.",
      en:
        "You can add co-authors in the projects, medias and recipes. If you remove an author, all the projects, medias and recipes will keep this author name and won’t be removed.",
      oc:
        "Poiretz apondre d'autres co-autors directament dins los projèctes, mèdias e recèptas. Si suprimissètz un autor, totes los mèdias, projèctes e recèptas servaràn lo nom d'autor e seràn pas suprimidas."
    },
    sort_by: {
      fr: "Organiser par",
      en: "Sort by",
      nl: "Sorteer volgens",
      oc: "Organizar per"
    },
    by: {
      fr: "par",
      en: "by",
      nl: "per",
      oc: "per"
    },
    in_the_order: {
      fr: "Dans l’ordre",
      en: "In the order",
      nl: "In volgorde",
      oc: "Dins l'òrdre"
    },
    public: {
      fr: "Public",
      en: "Public",
      nl: "Publiek",
      oc: "Public"
    },
    fav: {
      fr: "Favoris",
      en: "Favourite",
      nl: "Favoriet",
      oc: "Favorits"
    },
    content: {
      fr: "Contenu",
      en: "Content",
      nl: "Inhoud",
      oc: "Contengut"
    },
    "lang:": {
      fr: "Changer la langue&nbsp;:",
      en: "Select lang:",
      nl: "De taal wijzigen:",
      oc: "Cambiar la lenga"
    },
    lang: {
      fr: "Changer la langue",
      en: "Select lang",
      nl: "De taal wijzigen",
      oc: "Cambiar la lenga"
    },
    share_access: {
      fr: "Accéder depuis d’autres appareils",
      en: "Access from other devices",
      nl: "Toegang verlenen via andere toestellen ",
      oc: "Accedir dins d'autres aparelhs"
    },
    scan_qr_code: {
      fr: "Scanner un code QR",
      en: "Scan a QR code",
      nl: "QR-code scannen ",
      oc: "Escanerizar un còde QR"
    },
    photo: {
      fr: "photo",
      en: "picture",
      nl: "foto",
      oc: "fòto"
    },
    video: {
      fr: "vidéo",
      en: "video",
      nl: "video",
      oc: "vidèo"
    },
    stopmotion: {
      fr: "animation",
      en: "stop motion",
      nl: "animatie",
      oc: "animacion"
    },
    audio: {
      fr: "son",
      en: "sound",
      nl: "geluid",
      oc: "son"
    },
    vecto: {
      fr: "formes",
      en: "shapes",
      nl: "vormen",
      oc: "formas"
    },
    image: {
      fr: "image",
      en: "image",
      nl: "beeld",
      oc: "imatge"
    },
    text: {
      fr: "texte",
      en: "text",
      nl: "tekst",
      oc: "tèxte"
    },
    document: {
      fr: "document",
      en: "document",
      nl: "document",
      oc: "document"
    },
    other: {
      fr: "autre",
      en: "other",
      nl: "andere",
      oc: "autre"
    },
    with_sound: {
      fr: "avec le son",
      en: "with sound",
      nl: "met geluid",
      oc: "amb lo son"
    },
    generate: {
      fr: "Générer",
      en: "Generate",
      nl: "Genereren",
      oc: "Generar"
    },
    select: {
      fr: "Sélectionner",
      en: "Select",
      nl: "Selecteren",
      oc: "Seleccionar"
    },
    unselect: {
      fr: "Dé-sélectionner",
      en: "Unselect",
      nl: "Deselecteren",
      oc: "Deseleccionar"
    },
    toconnectwithanotherdevice: {
      fr:
        "Pour accéder à cet élément avec un autre appareil, connectez vous au même réseau wifi puis entrez l’url suivante dans un navigateur web, ou bien scannez le code QR&nbsp;: ",
      en:
        "To access this do•doc element with another device, first connect it to the same wifi network, then type this adress in your browser or scan this QR code:",
      nl:
        "Om dit item met een ander apparaat te openen , maak verbinding met hetzelfde wifi-netwerk en voer vervolgens de volgende URL in een webbrowser in, of scan de QR-code: ",
      oc:
        "Per accedir aqueste element amb un autre aparelh, conectatz-vos al meteis ret wifi puèi dintratz l'url seguenta dins un navigador web, o escanerizatz lo còde QR :"
    },
    sureToRemoveProject: {
      fr: "Êtes-vous sûr de vouloir supprimer ce projet ?",
      en: "Do you really want to delete this project?",
      nl: "Weet u zeker dat u dit project wilt verwijderen?",
      oc: "Sètz segur de voler suprimir aqueste projècte ?"
    },
    sureToRemoveMedia: {
      fr: "Êtes-vous sûr de vouloir supprimer ce média ?",
      en: "Do you really want to delete this media?",
      nl: "Weet u zeker dat u deze media wilt verwijderen?",
      oc: "Sètz segur de voler suprimir aqueste mèdia ?"
    },
    edit_the_media: {
      fr: "Éditer le média",
      en: "Edit media",
      nl: "Media bewerken",
      oc: "Editar lo mèdia"
    },
    edit_project: {
      fr: "Éditer le projet",
      en: "Edit project",
      nl: "Project bewerken",
      oc: "Editar lo projècte"
    },
    edit_publication: {
      fr: "Éditer la recette",
      en: "Edit recipe",
      nl: "Recept bewerken",
      oc: "Editar la recèpta"
    },
    drop_here_to_import: {
      fr: "Déposez vos contenus ici pour les importer",
      en: "Drop your content here to import",
      nl: "Laad de bestanden hier om te importeren ",
      oc: "Depausatz vòstres contenguts aicí per los importar"
    },
    capture: {
      fr: "Capturer",
      en: "Capture",
      nl: "Vastleggen",
      oc: "Capturar"
    },
    current: {
      fr: "Actuellement",
      en: "Current",
      nl: "Nu",
      oc: "Ara"
    },
    currently: {
      fr: "Actuellement",
      en: "Now",
      nl: "Momenteel",
      oc: "Ara"
    },
    update: {
      fr: "Mettre à jour",
      en: "Update",
      nl: "Bijwerken",
      oc: "Metre a jorn"
    },
    more_information: {
      fr:
        "Pour plus d’information, consultez la <a href='https://latelier-des-chercheurs.fr/docs/manuel-dodoc' class='js--openInBrowser' target='_blank'>documentation</a> ou <a href='mailto:info@latelier-des-chercheurs.fr?subject=do•doc' class='js--openInBrowser' target='_blank'>contactez</a> les auteurs de ce logiciel.",
      en:
        "For more informations, read the <a href='https://latelier-des-chercheurs.fr/docs/manuel-dodoc' class='js--openInBrowser' target='_blank'>documentation (in french)</a> or <a href='mailto:info@latelier-des-chercheurs.fr?subject=do•doc' class='js--openInBrowser' target='_blank'>contact</a> the creators of this app.",
      nl:
        "Voor meer informatie. , bezoek <a href='https://latelierdes-chercheurs.fr/docs/manuel-dodoc' class='js--openInBrowser' target='_blank'>documentatie</a> ou <a href='mailto:info@latelier-des-chercheurs.fr?subject=do•doc' class='js--openInBrowser' target='_blank'>contacteer</a> de auteurs van dit programma.",
      oc:
        "Per mai d’informacion, consultatz la <a href='https://latelier-des-chercheurs.fr/docs/manuel-dodoc' class='js--openInBrowser' target='_blank'>documentation</a> o <a href='mailto:info@latelier-des-chercheurs.fr?subject=do•doc' class='js--openInBrowser' target='_blank'>contactatz</a> los autors d'aqueste logicial."
    },
    no_media_in_folder: {
      fr: "Aucun média dans ce dossier.",
      en: "No media in this folder.",
      nl: "Geen media in deze map .",
      oc: "Cap de mèdia dins aqueste dorsièr."
    },
    no_images_to_show: {
      fr: "Aucun média image à afficher.",
      en: "No image to show.",
      oc: "Cap de mèdia imatge d'afichar."
    },
    no_public_media_in_folder: {
      fr: "Aucun média public dans ce dossier.",
      en: "No public media in this folder.",
      nl: "Geen openbare media in deze map .",
      oc: "Cap de mèdia public dins aqueste dorsièr."
    },
    more_informations: {
      fr: "Plus d’infos",
      en: "More infos",
      nl: "Meer info",
      oc: "Mai d'infos"
    },
    contents_are_stored: {
      fr: "Les contenus de ce dossier sont enregistrés dans ",
      en: "Contents for this folder are stored in ",
      nl: "De inhoud van dit bestand wordt opgeslagen in ",
      oc: "Los contenguts d'aqueste dorsièr son enregistrats dins"
    },
    folder_information: {
      fr: "Informations du dossier",
      en: "Folder informations",
      nl: "map-info",
      oc: "Informacions del dorsièr"
    },
    calendar: {
      fr: "Calendrier",
      en: "Calendar",
      nl: "Kalender",
      oc: "Calendièr"
    },
    now: {
      fr: "en ce moment",
      en: "now",
      nl: "op dit moment",
      oc: "d'aquesta passa"
    },
    list: {
      fr: "Liste",
      en: "List",
      nl: "Lijst",
      oc: "Tièra"
    },
    fullscreen: {
      fr: "Plein écran",
      en: "Fullscreen",
      nl: "Volledig scherm",
      oc: "Plen ecran"
    },
    cover_image: {
      fr: "Image de couverture",
      en: "Cover image",
      oc: "Imatge de cobertura"
    },
    filter: {
      fr: "Filtre",
      en: "Filter",
      nl: "Filter",
      oc: "Filtre"
    },
    filters: {
      fr: "Filtres",
      en: "Filters",
      nl: "Filters",
      oc: "Filtres"
    },
    header_left: {
      fr: "En-tête gauche",
      en: "Left header text",
      nl: "Linker koptekst",
      oc: "Entèsta esquèrra"
    },
    header_right: {
      fr: "En-tête droite",
      en: "Right header text",
      nl: "Rechtse koptekst",
      oc: "Entèsta drecha"
    },
    gridstep: {
      fr: "Pas de la grille d’alignement",
      en: "Step of alignment grid",
      nl: "Geen uitlijningsrooster ",
      oc: "Cap de grilhas d'alinhament"
    },
    snap_to_grid: {
      fr: "Magnétisme",
      en: "Snap to grid",
      nl: "Magnetisme",
      oc: "Magnetisme"
    },
    margin_top: {
      fr: "Marge: haut",
      en: "Margin: top",
      nl: "Marge boven",
      oc: "Marge: naut"
    },
    margin_left: {
      fr: "Marge: gauche",
      en: "Margin: left",
      nl: "Marge links",
      oc: "Marge: esquèr"
    },
    margin_right: {
      fr: "Marge: droite",
      en: "Margin: right",
      nl: "Marge rechts",
      oc: "Marge: drech"
    },
    margin_bottom: {
      fr: "Marge: bas",
      en: "Margin: bottom",
      nl: "Marge beneden",
      oc: "Marge: bas"
    },
    number_of_medias: {
      fr: "Nombre de médias",
      en: "Number of medias",
      nl: "Aantal media",
      oc: "Nombre de mèdias"
    },
    number_of_pages: {
      fr: "Nombre de pages",
      en: "Number of pages",
      nl: "Aantal pagina’s",
      oc: "Nombre de paginas"
    },
    show_page_numbers: {
      fr: "Afficher le numéro de page dans le coin en bas à droite",
      en: "Show page number in the bottom-right corner",
      nl: "Geef het paginanummer in de rechterbenedenhoek weer ",
      oc: "Afichar lo numèro de pagina dins lo caire en bas a drech"
    },
    export_folder: {
      fr: "Exporter en format WEB",
      en: "Export as a webpage",
      nl: "Exporteren in web formaat",
      oc: "Exportar en format web"
    },
    export: {
      fr: "Exporter",
      en: "Export",
      nl: "Exporteren",
      oc: "Exportar"
    },
    export_as_pdf: {
      fr: "Export PDF",
      en: "Export as PDF",
      nl: "Exporteren als PDF",
      oc: "Expòrt PDF"
    },
    new_window: {
      fr: "Nouvelle fenêtre",
      en: "New Window",
      nl: "Nieuw venster ",
      oc: "Novèla fenèstra"
    },
    previous_creations: {
      fr: "Créations précédentes",
      en: "Previous creations",
      nl: "Vorige creaties",
      oc: "Creacions precedentas"
    },
    export_video_instructions: {
      fr:
        "Cliquez sur le bouton pour lancer la création d’une seule vidéo à partir des vidéos ajoutées à la recette.",
      en: "Click this button to generate a video from multiple source videos.",
      nl:
        "Klik op de knop om een video te maken van de video’s die aan de publicatie zijn toegevoegd.",
      oc:
        "Clicatz sul boton per lançar la creacion d'una sola vidèo a partir de las vidèos apondudas a la recèpta."
    },
    export_audio_video_mix_instructions: {
      fr:
        "Cliquez sur le bouton pour lancer la création d’une vidéo à partir du son et de la vidéo sélectionnés.",
      en:
        "Click this button to generate a video from the sound and video selected.",
      nl:
        "Klik op de knop om een video te maken van het geselecteerde geluid en de geselecteerde video.",
      oc:
        "Clicar sul boton per lançar la creacion d'una vidèo dins dels son e de la vidèo seleccionats."
    },
    export_audio_image_mix_instructions: {
      fr:
        "Cliquez sur le bouton pour lancer la création d’une vidéo à partir du son et de l’image sélectionnés.",
      en:
        "Click this button to generate a video from the sound and image selected.",
      nl:
        "Klik op de knop om een video te maken van het geselecteerde geluid en het geselecteerde beeld.",
      oc:
        "Clicar sul boton per lançar la creacion d'una vidèo dins dels son e de l'imatge seleccionats."
    },
    export_stopmotion_instructions: {
      fr:
        "Cliquez sur le bouton pour lancer la création d’une seule vidéo à partir des images ajoutées à la recette.",
      en:
        "Click this button to generate a video from images you have selected.",
      nl:
        "Klik op de knop om een video te maken van de afbeeldingen die aan de publicatie zijn toegevoegd.",
      oc:
        "Clicar sul boton per lançar la creacion d'una sola vidèo en partir dels imatges aponduts a la recèpta."
    },
    make_video: {
      fr: "Fabriquer une vidéo",
      en: "Make a video",
      nl: "Maak een video",
      oc: "Fargar una vidèo"
    },
    interval_between_pictures: {
      fr: "Intervalle entre chaque photo",
      en: "Interval between photos",
      nl: "Interval tussen elk beeld",
      oc: "Interval entre cada fòto"
    },
    publication_list: {
      fr: "Liste des recettes",
      en: "Recipes list",
      nl: "Lijst van publicaties",
      oc: "Tièra de las recèptas"
    },
    export_creation: {
      fr: "Exportation d’une création",
      en: "Export a creation",
      nl: "Exporteer een creatie",
      oc: "Exportacion d'una creacion"
    },
    get_pdf: {
      fr:
        "Pour récupérer un PDF de cette recette (par exemple pour l’imprimer), cliquez sur le bouton ci-dessous&nbsp;:",
      en:
        "To download a PDF of this recipe (for example, to print it), click here:",
      nl:
        "Als u een PDF van deze publicatie wilt maken (bijvoorbeeld om deze af te drukken), klik op de knop hieronder:",
      oc:
        "Per recuperar un PDF d'aquesta recèpta (per exemple per l'estampar), clicatz sul boton çai-jos :"
    },
    download_pdf: {
      fr: "Télécharger un PDF",
      en: "Download PDF",
      nl: "Download PDF",
      oc: "Telecargar un PDF"
    },
    get_website: {
      fr:
        "Pour récupérer un site web contenant cette recette (par exemple pour la diffuser en ligne), cliquez sur le bouton ci-dessous&nbsp;:",
      en:
        "To download a website version of this recipe (for example, to publish online), click here:",
      nl:
        "Als u een website van deze publicatie wilt maken (bijvoorbeeld om deze online te delen), klikt u op de knop hieronder:",
      oc:
        "Per recuperar un sit web contenent aquesta recèpta (per exemple per la difusar en linha), clicatz sul boton çai-jos :"
    },
    download_website: {
      fr: "Télécharger une version web",
      en: "Download a website",
      nl: "Download website",
      oc: "Telecargar una version web"
    },
    open_in_app: {
      fr: "Afficher",
      en: "Open",
      nl: "Tonen",
      oc: "Afichar"
    },
    get_a_link: {
      fr: "Récupérer un lien vers ce document&nbsp;:",
      en: "Get a link to this document&nbsp;:",
      nl: "Een koppeling naar dit document ophalen:",
      oc: "Recuperar un ligam de cap a aqueste document"
    },
    format: {
      fr: "Format",
      en: "Format",
      nl: "Format",
      oc: "Format"
    },
    name_of_copy: {
      fr: "Nom à donner à la copie",
      en: "Name of the copy",
      nl: "Naam die aan de kopie moet worden gegeven",
      oc: "Nom de balhar a la còpia"
    },
    template: {
      fr: "Gabarit",
      en: "Template",
      nl: "sjabloon",
      oc: "Gabarit"
    },
    standard: {
      fr: "Standard",
      en: "Standard",
      nl: "standaard",
      oc: "Estandard"
    },
    "feuille de choux": {
      fr: "Feuille de Choux",
      en: "Feuille de Choux",
      nl: "koolblad",
      oc: "Feuille de Choux"
    },
    "human tech days": {
      fr: "Human Tech Days",
      en: "Human Tech Days",
      nl: "Human Tech Days",
      oc: "Human Tech Days"
    },
    page_by_page: {
      fr: "Document page à page",
      en: "Paged document",
      nl: "Document pagina per pagina",
      oc: "Document pagina per pagina"
    },
    carreau: {
      fr: "Carreau",
      nl: "Tegel",
      oc: "Carreau"
    },
    video_assemblage: {
      fr: "Montage vidéo",
      en: "Video editing",
      nl: "Videobewerking",
      oc: "Montatge vidèo"
    },
    stopmotion_animation: {
      fr: "Animation image par image",
      en: "Stopmotion animation",
      nl: "Stopmotion animatie",
      oc: "Animacion imatge per imatge"
    },
    web: {
      fr: "Page web",
      en: "Webpage",
      nl: "Webpagina",
      oc: "Pagina web"
    },
    back_to_project: {
      fr: "Retour au projet",
      en: "Back to project",
      nl: "Terug naar project",
      oc: "Tornar al projècte"
    },
    page_by_page_summary: {
      fr: "Créer un PDF imprimable ou une page web à mettre en ligne.",
      en: "Creates a printable PDF or website to upload online.",
      nl: "Maak een afdrukbare PDF of webpagina om te uploaden.",
      oc: "Crear un PDF estampable o una pagina web de botar en linha."
    },
    page_by_page_instructions: {
      fr:
        "Cette recette permet de créer un document avec un format précis et plusieurs pages.<br> Médias acceptés : images, vidéos, sons et textes.<br>Créera un PDF imprimable (pour faire des affiches, tracts, journaux, etc.) ou une page web à mettre en ligne.",
      en:
        "This recipe can be used to create a paged document with a specific size.<br>Accepted medias: images, videos, sounds and texts.<br>Will create a PDF that can be printed (to make posters, tracts, newspapers, etc.) or a webpage to upload online.",
      nl:
        "Met dit recept kunt u een document met een exacte indeling en meerdere pagina’s maken.<br> Ondersteunde media: afbeeldingen, video’s, geluid en tekst.<br>Maak een afdrukbare PDF (om posters, flyers, kranten, enz. te maken) of een webpagina om te uploaden.",
      oc:
        "Aquesta recèpta permet de crear un document amb un format precís e mantunas paginas.<br>Mèdias acceptats : imatges, vidèos, sons e tèxtes.<br>Crearà un PDF estampable (per faire d'afichas, tractes, jornals, eca.) o una pagina web de botar en linha."
    },
    video_assemblage_summary: {
      fr: "Créer un montage vidéo à partir d’images et de vidéos.",
      en: "Creates a video from images and videos.",
      nl: "Maak een videomontage van afbeeldingen en video’s.",
      oc: "Crear un montatge vidèo en partir d'imatges e de vidèos."
    },
    video_assemblage_instructions: {
      fr:
        "Cette recette propose de créer un montage vidéo en mettant plusieurs vidéos ou images bout à bout.<br> Médias acceptés : des vidéos et des images.<br>Créera une nouvelle vidéo.",
      en:
        "This recipe creates a video from multiple source images and videos, one after the other.<br>Accepted medias: images and videos.<br>Will create a new video.",
      nl:
        "Dit recept stelt voor om een video montage te maken door meerdere video’s of afbeeldingen na elkaar te plaatsen.<br> Ondersteunde media: video’s en afbeeldingen.<br>Maakt een nieuwe video.",
      oc:
        "Aquesta recèpta prepausa de crear un montatge vidèo en botant mantunas vidèos o imatges cap a cap.<br>Mèdias acceptats imatges e vidèos.<br> Crearà una novèla vidèo."
    },
    stopmotion_animation_summary: {
      fr: "Assembler des images pour créer une vidéo.",
      en: "Creates a video from images shown for a specific period of time.",
      nl: "Beelden samenvoegen om een video te maken.",
      oc: "Assemblar d'imatges per crear una vidèo."
    },
    stopmotion_animation_instructions: {
      fr:
        "Cette recette permet l’assemblage d’un nombre illimité d’images pour créer une séquence vidéo dans laquelle elles défilent à une vitesse réglable.<br> Médias acceptés : uniquement des images. Les dimensions de la première image détermine si la vidéo finale est en portrait ou paysage.<br>Créera une nouvelle vidéo.",
      en:
        "This recipe takes any number of images as inputs and creates a single video with images displayed at a specific speed.<br>Accepted medias: images of any size. The first image will determine if the video will be in portrait or landscape.<br>Will create a new video.",
      nl:
        "Met dit recept kunt u een onbeperkt aantal beelden samenvoegen om een videosequentie te maken waarin deze beelden na elkaar verschijnen aan een in te stellen snelheid.<br> Ondersteunde media: enkel afbeeldingen. De afmetingen van het eerste beeld bepalen of de uiteindelijke video als portret of landschap is ingedeeld.<br>Maakt een nieuwe video.",
      oc:
        "Aquesta recèpta permet d'assemblar un nombre illimitat d'imatges per crear una sequéncia vidèo que i desfilan a una vitessa reglabla.<br> Mèdias acceptats : sonque d'imatges. Las dimensions del primièr imatge determina si la vidèo finala es en retrach o paisatge.<br> Crearà una novèla vidèo."
    },
    mix_audio_and_video_summary: {
      fr: "Ajouter ou remplacer du son sur une vidéo.",
      en: "Add or replace sound that’s on a video.",
      nl: "Geluid op een video toevoegen of vervangen.",
      oc: "Apondre o remplaçar de son sus una vidèo."
    },
    mix_audio_and_video_instructions: {
      fr:
        "Cette recette prend une vidéo et une piste audio. Elle ajoute ou remplace la bande sonore de la vidéo avec celle qui est sélectionnée.<br> Médias acceptés : une vidéo et une piste sonore.<br>Créera une nouvelle vidéo de la durée du plus long média.",
      en:
        "This recipe mixes a video and an audio track to create a new video where they are played at the same time.<br>Accepted medias: a video and a sound track.<br>Will create a new video.",
      nl:
        "Dit recept gebruikt een videobestand en een audionummer. Hiermee wordt de soundtrack aan de video toegevoegd of vervangen door het gekozen geluidsbestand.<br> Ondersteunde media: video- en geluidsbestanden.<br>Maakt een nieuwe video met de lengte van de langste media.",
      oc:
        "Aquesta recèpta pren una vidèo e una pista audio. Apond o remplça la banda sonora de la vidèo amb la qu'es seleccionada.<br>Mèdias acceptats: una vidèo e una pista sonora.<br>Crearà una novèla vidèo de la duradadel mai long mèdia."
    },
    mix_audio_and_image_summary: {
      fr: "Ajouter du son sur une image.",
      en: "Add sound to an image to create a video.",
      nl: "Geluid toevoegen aan een beeld.",
      oc: "Apondre de son sus un imatge."
    },
    mix_audio_and_image_instructions: {
      fr:
        "Cette recette prend une image et une piste audio. Elle permet de créer des <i>images parlantes</i>.<br> Médias acceptés : une image et une piste sonore.<br>Créera une vidéo de la durée de la piste sonore.",
      en:
        "This recipe mixes an image with an audio track to create a <i>speaking image</i><br>Accepted medias: an image and a sound track.<br>Will create a new video.",
      nl:
        "Dit recept gebruikt een beeld- en een geluidsbetand. Het maakt het mogelijk om <i>sprekende beelden te maken .<br> Ondersteunde media: beeld- en geluidsbestand.<br>Maakt een video met de duur van het geluidsbestand.",
      oc:
        "Aquesta recèpta pren un imatge e una p ista audio. Permet de crear d'<i>imatges parlantas<i>.<br> Mèdias acceptats : un imatge e una pista sonora.<br>Crearà una vidèo de la durada de la pista sonora."
    },
    carreau_summary: {
      fr: "Empiler des médias pour créer en temps réel des présentations.",
      en: "Stack multiple medias on a single surface to project content.",
      nl: "Media samenvoegen om real-time presentaties te maken.",
      oc: "Apilar de mèdias per crear en temps real de presentacion."
    },
    carreau_instructions: {
      fr:
        "Cette recette permet de collaborer à plusieurs sur la même surface pour présenter des médias de différent type. Ouvrez une nouvelle fenêtre vers cette recette en plein écran sur un projecteur pour afficher uniquement la surface.<br> Médias acceptés : images, vidéos, sons.",
      en:
        "Use this mode to show multiple medias on a large projection or screen, for example by opening a browser and clicking on the fullscreen button.<br>Accepted medias: images, videos and sounds.",
      nl:
        "Met dit recept kunt u met meerdere op hetzelfde platform samenwerken om verschillende soorten media te presenteren. Open een nieuw venster naar dit recept op volledig scherm met een projector om alleen het platform weer te geven.<br>Ondersteunde media: afbeeldingen, video’s, geluidsbestanden.",
      oc:
        "Aquesta recèpta permet de collaborar a mantunes sus la m eteissa susfacia per presentar de mèdias de diferents tipe. Dubriscatz una novèla fenèstra de cap a-aquesta recèpta en plen ecran sus un projector per afichar sonque la susfacia.<br> Mèdias acceptats : imatges, vidèos, sons."
    },
    last_modified: {
      fr: "Dernière modification",
      en: "Last modified",
      nl: "laatst gewijzigd",
      oc: "Darrièra modificacion"
    },
    open_project: {
      fr: "Afficher le projet",
      en: "Show the project",
      oc: "Afichar lo projècte"
    },
    remote_access: {
      fr: "Accès depuis d’autres appareils",
      en: "Acces from other devices",
      nl: "Toegang vanaf andere apparaten",
      oc: "Accès dins d'autres aparelhs"
    },
    img_per_second: {
      fr: "Images par seconde",
      en: "Images per second",
      nl: "Beelden per seconde",
      oc: "Imatges per seconda"
    },
    sent: {
      fr: "Envoyé",
      en: "Sent",
      nl: "Verzonden",
      oc: "Mandat"
    },
    disable: {
      fr: "Désactiver",
      en: "Disable",
      nl: "uitschakelen",
      oc: "Desactivar"
    },
    previous_media: {
      fr: "Média précédent",
      en: "Previous media",
      nl: "Vorige media ",
      oc: "Mèdia precedent"
    },
    next_media: {
      fr: "Média suivant",
      en: "Next media",
      nl: "Volgende media ",
      oc: "Mèdia seguent"
    },
    minimize_media: {
      fr: "Utiliser comme référence",
      en: "Use as a reference",
      nl: "gebruik als verwijzing",
      oc: "Utilizar coma una referéncia"
    },
    remember_project_password_for_this_device: {
      fr: "Se souvenir du mot de passe pour cet appareil",
      en: "Remember password for this device",
      nl: "Het wachtwoord op dit apparaat onthouden",
      oc: "Se remembrar del mot de Santa Clara per aqueste aparelh"
    },
    notifications: {
      ios_not_compatible_with_capture: {
        fr:
          "Les iPhones et les iPads ne sont pas compatibles avec la fonctionnalité de Capture.",
        en:
          "iPhones and iPads are not currently compatible with the <i>capture</i> page.",
        nl: "IPhones en iPads zijn niet compatibel met de opnamefunctie.",
        oc:
          "Los Iphones and Ipads son pas compatibles amb la fonccionalitat de captura."
      },
      instead_import_with_this_button: {
        fr:
          "Utilisez plutôt la fonctionnalité d’import ci-dessus pour prendre des photos et des vidéos ou en importer depuis votre appareil.",
        en:
          "Instead import or capture photos and videos here in the import modal.",
        nl:
          "Gebruik in plaats daarvan de invoerfunctie hierboven om foto’s en video’s te maken of te importeren vanaf uw apparaat",
        oc:
          "Utilizatz puslèu la fonccionalitat d'impòrt çai-sus per pree de fòtos e de vidèos o n'importar dins de vòstre aparelh"
      },
      media_was_sent: {
        fr: "Le média a été enregistré.",
        en: "The media was sent.",
        nl: "Media is opgenomen.",
        oc: "Lo mèdia es estat enregistrat."
      },
      media_couldnt_be_sent: {
        fr:
          "Le média n’a pas pu être enregistré à cause d’une erreur de connexion.",
        en: "The media was not sent because of a connexion error.",
        nl: "Media kon niet worden opgeslagen vanwege verbindingsfout.",
        oc:
          "Lo mèdia es pas estat enregistrat per causa d'una error de connexion."
      },
      file_was_sent: {
        fr: "Le fichier a été enregistré.",
        en: "The file was sent.",
        nl: "Het bestand is opgeslagen.",
        oc: "Lo mèdia es estat enregistrat"
      },
      file_upload_not_allowed: {
        fr: "Votre navigateur web ne prend pas en charge l’envoi de fichiers.",
        en: "File upload is not allowed by this browser.",
        nl: "Uw webbrowser ondersteunt het verzenden van bestanden niet.",
        oc: "Vòstre navigador web pren pas en carga la mandadís de fichièrs."
      },
      connection_active: {
        fr: "La connexion au serveur est active.",
        en: "The connection to the server is active.",
        nl: "Serververbinding is actief.",
        oc: "La connexion al servidor es activa."
      },
      connection_lost: {
        fr: "La connexion au serveur a été perdue.",
        en: "The connection to the server was lost.",
        nl: "Serververbinding is verbroken.",
        oc: "La connexion al servidor es estada perduda"
      },
      contents_wont_be_editable: {
        fr: "Les modifications et ajouts ne seront plus pris en compte.",
        en: "Content editing is disabled.",
        nl: "Wijzigingen en aanvullingen zullen niet langer mogelijk zijn.",
        oc: "Las modofocacions e los apondons seràn pas pus pres en compte."
      },
      connection_error: {
        fr: "La connexion au serveur n’a pu se faire.",
        en: "The connection to the server could not be established.",
        nl: "De verbinding met de server kan niet worden gemaakt.",
        oc: "La connexion al servidor s'es pas poscuda far"
      },
      media_has_been_added_successfully: {
        fr: "Le média a bien été transféré",
        en: "The media was successfully added.",
        nl: "Media is overgebracht",
        oc: "Lo mèdia es ben estat transferit"
      },
      wrong_password_for_dodoc: {
        fr: "Le mot de passe envoyé n’est pas valide. Veuillez réessayer.",
        en: "Wrong password, please try again.",
        nl: "Het gebruikte wachtwoord is ongeldig. Probeer het opnieuw.",
        oc: "Lo mot de Santa Clara mandat es pas valid. Volgatz tornar ensajar."
      },
      loading_dodoc: {
        fr: "Chargement de do•doc en cours…",
        en: "Loading do•doc…",
        nl: "Do•doc is aan het laden …",
        oc: "Cargament de do•doc en cors…"
      },
      "wrong_password_for_folder:": {
        fr: "Le mot de passe n’est pas le bon pour le dossier&nbsp;:",
        en: "Wrong password or folder missing for:",
        nl: "Het wachtwoord is niet correct voor dit onderdeel:",
        oc: "Lo mot de passa es pas lo bon pel dorsièr:"
      },
      "created_edited_media:": {
        fr: "Création ou édition d’un média pour le dossier&nbsp;:",
        en: "A media has been created or edited in folder:",
        nl: "Media voor dit onderdeel aanmaken of bewerken:",
        oc: "Creacion o edicion d'un mèdia pel dorsièr:"
      },
      project_name_exists: {
        fr: "Ce nom de projet existe déjà, utilisez-en un autre.",
        en: "This project name already exists. Please use another.",
        nl: "Deze projectnaam bestaat al, gebruik een andere.",
        oc: "Aqueste nom de projècte existís ja, utilisatz ne un autre."
      },
      publi_name_exists: {
        fr: "Ce nom de recette existe déjà, utilisez-en un autre.",
        en: "This recipe name already exists. Please use another.",
        nl: "Deze publicatienaam bestaat al, gebruik een andere.",
        oc: "Aqueste nom de recèptas existís ja, utilisatz ne un autre."
      },
      author_name_exists: {
        fr: "Ce nom d’auteur existe déjà, utilisez-en un autre.",
        en: "This author name already exists. Please use another.",
        nl: "Deze auteursnaam bestaat al, gebruik een andere.",
        oc: "Aqueste nom d'autor existís ja, utilisatz ne un autre."
      },
      folder_name_needs_alphanumeric_characters: {
        fr:
          "Les noms de dossier doivent contenir au moins un caractère alphanumérique.",
        en: "Folder names need to contain at least one alphanumeric character.",
        nl: "Bestandsnamen moeten ten minste een alfanumeriek teken bevatten.",
        oc:
          "Los noms de dorsièrs devon conténer au mens un caractèr alfanumeric."
      },
      "failed_to_get_folder:": {
        fr: "Le dossier suivant n’a pas été trouvé:",
        en: "Failed to get the requested folder:",
        nl: "Het volgende bestand is niet gevonden:",
        oc: "Lo dorsièr seguent es pas estat trobat:"
      },
      failed_to_start_video_change_source_or_res: {
        fr:
          "Le flux vidéo n’a pas pu être démarré.<br>Essayez de modifier la source ou la résolution dans les réglages.",
        en:
          "Failed to start camera feed. Try changing the source or the resolution.",
        nl:
          "Videostream kan niet worden gestart .<br>Probeer de bron of de resolutie in de instellingen te wijzigen.",
        oc:
          "Lo flux vidèo es pas estat desmarrat.<br>Ensajatz de modificar la sorça o la resolucion dins los reglatges."
      },
      video_source_not_set: {
        fr: "La source vidéo n’a pas été trouvée.",
        en: "The source video has not been set.",
        nl: "Videobron niet gevonden.",
        oc: "La sorça audio es pas estada trobada."
      },
      failed_to_start_audio_change_source: {
        fr:
          "Le flux audio n’a pas pu être démarré.<br>Essayez de modifier la source dans les réglages.",
        en: "Failed to start audio feed. Try changing the source.",
        nl:
          "Audiostream kan niet worden gestart.<br>Probeer de bron in de instellingen te wijzigen.",
        oc:
          "Lo flux audio es pas estat desmarrat.<br>Ensajatz de modificar la sorça dins los reglatges."
      },
      audio_source_not_set: {
        fr: "La source audio n’a pas été trouvée.",
        en: "The source audio has not been set.",
        nl: "Audiobron niet gevonden.",
        oc: "La sorça audio es pas estada trobada."
      },
      video_stream_not_available: {
        fr: "Erreur : le flux vidéo n’est pas disponible.",
        en: "Error: Video stream not available.",
        nl: "Fout : videostream is niet beschikbaar.",
        oc: "Error : lo flux vidèo es pas disponible"
      },
      no_content_found_with_nfc_tag: {
        fr:
          "Scan d’un tag NFC réussi, associez-lui un auteur ou un média pour commencer.",
        en: "NFC tag detected, bind it to an author or a media to start.",
        nl: "NFC tag gevonden, koppel een auteur of media om te beginnen.",
        oc:
          "Escan d'un tag NFC capitat, associatz-li un autor o un mèdia per començar."
      },
      author_found_with_nfc_tag: {
        fr: "Scan d’un tag NFC réussi, activation de l’auteur suivant&nbsp;:",
        en: "NFC tag detected, the following author will be logged-in:",
        nl: "NFC tag gevonden, activatie van de volgende auteur:",
        oc: "Escan d'un tag NFC capitat, activacion de l'autor seguent:"
      },
      medias_uploaded: {
        fr: "Tous les médias ont bien étés enregistrés.",
        en: "All medias were imported successfully.",
        nl: "Alle media zijn opgenomen.",
        oc: "Totes los mèdias son ben estat enregistrats"
      },
      medias_upload_failed: {
        fr: "Erreur&nbsp;: certains médias n’ont pas pu être enregistrés.",
        en: "Error: some medias failed to import.",
        nl: "Foutmelding: sommige media kunnen niet worden opgenomen.",
        oc: "Error: d'unes mèdias son pas estat enregistrats"
      },
      video_converted: {
        fr: "La vidéo a été convertie et ajoutée au projet.",
        en: "The video was converted successfully and added to the project.",
        nl: "De video is geconverteerd en toegevoegd aan het project.",
        oc: "La vidèo es estada convertida e aponduda al projècte."
      },
      project_has_been_removed: {
        fr: "Ce projet vient d’être supprimé par quelqu’un d’autre.",
        en: "This project just got removed by another user.",
        nl: "Dit project werd zojuist door iemand anders verwijderd.",
        oc: "Aqueste projècte ven d'èsser suprimit per qualqu'un mai."
      },
      wrong_password_for: {
        fr: "Mot de passe erroné pour ",
        en: "Wrong password for project ",
        nl: "Onjuist wachtwoord voor ",
        oc: "Mot de Santa Clara erronèu per"
      },
      creating_video: {
        fr: "En cours de création de la vidéo…",
        en: "Creating video…",
        nl: "De video wordt gemaakt…",
        oc: "En cors de creacion de la vidèo..."
      },
      preparing_video_from_montage: {
        fr: "Préparation des vidéos du montage",
        en: "Pre-processing videos from the montage",
        nl: "Voorbereiding van het bewerken van video’s",
        oc: "Preparacion de las vidèos del montatge"
      },
      finished_creating_recipe: {
        fr: "La recette est terminée et peut être consultée !",
        en: "The recipe was successfully completed!",
        nl: "Het recept is afgewerkt en kan worden bekeken!",
        oc: "La recèpta es acabada e pòt èsser consultada"
      },
      media_copied_successfully: {
        fr: "La copie du média a été réalisée avec succès.",
        en: "The media was copied successfully.",
        nl: "De kopie van de media is gemaakt.",
        oc: "La còpia del mèdia es estada reailzada amb succès"
      },
      creation_in_progress: {
        fr: "En cours de création…",
        en: "Creation in progress…",
        nl: "In opmaak…",
        oc: "En cors de creacion..."
      },
      connected_to_dodoc: {
        fr: "Connection à do•doc active",
        en: "Connection to do•doc active",
        nl: "verbinding met do•doc actief",
        oc: "Connexion a do•doc activa"
      },
      using_saved_password: {
        fr: "Connection à do•doc en utilisant le mot de passe enregistré",
        en: "Connecting to do•doc using the password that was saved",
        nl: "Verbinding met do•doc met het opgeslagen wachtwoord",
        oc: "Connexion a do•doc en utilizant lo mot de Santa Clara enregistrat"
      },
      pdf_created: {
        fr: "Le PDF a été créé",
        en: "PDF created",
        nl: "De pdf is gemaakt",
        oc: "Lo PDF es estat creat"
      },
      video_created: {
        fr: "La vidéo a été créée",
        en: "The video was created",
        nl: "De video is gemaakt",
        oc: "La vidèo es estada creada"
      },
      video_creation_failed: {
        fr: "La vidéo n’a pas pu être créée",
        en: "The video was not created",
        nl: "Video kan niet worden gemaakt ",
        oc: "La vidèo es pas estada creada"
      },
      project_copy_in_progress: {
        fr: "Copie du projet en cours…",
        en: "Copy of the project in progress…",
        nl: "Laden van de kopie…",
        oc: "Còpia del projècte en cors..."
      },
      project_copy_completed: {
        fr: "Copie terminée",
        en: "Copy finished",
        nl: "Kopiëren geslaagd",
        oc: "Còpia acabada"
      },
      password_added_or_changed_to_this_project: {
        fr: "Le mot de passe de ce projet a été ajouté ou modifié.",
        en: "The password for this project hass been added or changed.",
        nl: "Wachtwoord voor dit project werd toegevoegd of gewijzigd .",
        oc:
          "Lo mot de Santa-Cmlara d'aqueste projècte es estat apondut o modificat"
      },
      enter_password_to_reopen_project: {
        fr: "Entrez le nouveau mot de passe pour accéder à nouveau à",
        en: "Enter the new password to reopen project",
        nl: "Voer het nieuwe wachtwoord in om opnieuw toegang te krijgen",
        oc: "Dintratz lo novèl mot de santa-Clara per accedir tornar mai a"
      }
    }
  };

  return messages;
})();
