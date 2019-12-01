module.exports = (function() {
  // Ready translated locale messages
  const messages = {
    fr: {
      ascending: "Croissant",
      descending: "Décroissant",
      create_a_project: "Créer un projet",
      create_a_publication: "Créer une recette",
      publication: "Recette",
      name: "Nom",
      project_name: "Nom du projet",
      created_date: "Date de création",
      uploaded: "Importation",
      created: "Création",
      edited: "Édition",
      sent_date: "Date d’envoi",
      for_the_placement_on_timeline: "(pour le placement sur la timeline)",
      type: "Type",
      color: "Couleur",
      keywords: "Mots-clés",
      share: "Partage",
      copy: "Copier",
      author: "Auteur(s)",
      download: "Télécharger",
      caption: "Légende",
      formatting: "Mise en forme",
      smoothing: "Lissage",
      onion_skin: "Pelure d’oignon",
      "file:": "Fichier&nbsp;:",
      add_to_project: "Ajouter au projet&nbsp;:",
      input_password: "Renseigner le mot de passe ci-dessous :",
      validate_with_enter: "Valider avec la touche ENTRÉE.",
      no_stopmotion_created_yet:
        "Les animations créées apparaîtront dans ce panneau.",
      device: "Appareil",
      "camera2 1, facing front": "Caméra frontale",
      "camera2 0, facing back": "Caméra arrière",

      very_slow: "Très lent",
      slow: "Lent",
      speed_medium: "Normal",
      fast: "Rapide",
      forget_password_and_close: "Oublier le mot de passe et fermer le projet",

      remember_password_on_this_device: "Sauvegarder pour cet appareil",

      cooking_pot: "La marmite",
      copy_of: "Copie de",
      text_overflow: "Texte en excès",
      move_to_foreground: "Mettre au premier plan",
      move_to_background: "Mettre à l’arrière plan",
      "layer:": "Calque&nbsp;:",
      css_settings: "Règlages CSS",
      edit_content: "Modifier le contenu",
      adjust: "Ajuster",
      duplicate: "Dupliquer",
      project_name_to_find: "Nom du projet à trouver",

      show_all: "Tout afficher",
      cooking_pot_instructions:
        "Mélangez des médias pour en créer des nouveaux !",
      untitled: "Sans titre",
      mix_audio_and_video: "Son sur une vidéo",
      mix_audio_and_image: "Son sur une image",
      add_sound_video_file:
        "Ouvrez un projet et ajoutez un média <b>son</b> et un média <b>vidéo</b> en cliquant sur la flèche verte.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : une vidéo et une piste sonore.",
      add_sound_image_file:
        "Ouvrez un projet et ajoutez un média <b>son</b> et un média <b>image</b> en cliquant sur la flèche verte.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : une image et une piste sonore.",
      add_multiple_videos_files:
        "Ouvrez un projet et ajoutez plusieurs médias <b>vidéo</b> en cliquant sur la flèche verte. Les vidéos seront mises bout à bout dans l’ordre d’ajout.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : uniquement des vidéos de même taille.",
      add_multiple_images:
        "Ouvrez un projet et ajoutez plusieurs médias <b>image</b> en cliquant sur la flèche verte. Les images seront mises bout à bout dans l’ordre d’ajout. Exportez la séquence et réglez la vitesse de défilement des images.<br>L’exportation créera une vidéo.<br>Médias acceptés : uniquement des images. Les dimensions de la première image détermine si la vidéo finale est en portrait ou paysage.",
      style: "style",
      css: "css",
      write_some_CSS_code_for_example:
        "Écrivez ici du code CSS, <br>par exemple <code>color: blue;</code>",
      framerate: "images par seconde",
      timelapse: "déclenchement automatique",
      seconds_per_image: "secondes par image",
      seconds: "secondes",
      quality: "qualité",
      bytes: "octets",
      kb: "ko",
      mb: "Mo",
      gb: "Go",
      duration: "Durée",
      send: "Envoyer",
      open_in_dodoc: "Ouvrir dans do•doc",
      connect_to_dodoc: "Accéder à do•doc",

      login: "S’identifier",
      adding_password_warning:
        "Attention ! Si vous ajoutez ou modifiez un mot de passe tous les utilisateurs qui y sont actuellement connectés devront le renseigner avant de pouvoir continuer à contribuer.",
      removing_password_warning:
        "Si vous retirez le mot de passe tous les utilisateurs qui ont accès à do•doc pourront modifier le projet.",
      help: "Aide",
      date: "Date",
      portrait: "Portrait",
      nfc_tag: "Tag NFC",
      yes: "Oui",
      cancel: "Annuler",
      back: "Retour",
      sureToRemoveAuthor:
        "Êtes-vous sûr de vouloir supprimer cet auteur ? Tous les médias, projets et recettes associés seront conservés.",
      show_all_authors: "Afficher l’ensemble des auteurs",
      changes_not_saved_sureToCloseModal:
        "Des modifications ont eu lieu, souhaitez-vous les enregistrer ?",
      save_changes: "Oui, enregistrer les modifications",
      close_the_window: "Non, fermer sans enregistrer",
      sureToRemovePubli: "Êtes-vous sûr de vouloir supprimer cette recette ?",
      sure_to_cancel_stopmotion:
        'Êtes-vous sûr de vouloir arrêter cette animation ? Vous pourrez la retrouver dans le menu "Liste des animations"',
      validate_media: "Valider le média",
      add_keyword: "Ajouter un mot-clé",
      add: "Ajouter",
      close: "Fermer",

      very_high: "Très élevée (1080p)",
      high: "Élevée (720p)",
      medium: "Moyenne (640p)",
      low: "Basse (360p)",

      showing: "Affichage de",
      media_filter: "Filtre de médias",
      no_projects_yet:
        "Il n’y a pas encore de projet, créez-en un pour commencer à utiliser do•doc !",
      projects_of: "projets sur",
      medias_of: "médias sur",
      projects: "Projets",
      project: "Projet",
      medias: "Médias",
      media: "Média",
      authors: "Auteurs",
      authors_list: "Liste des auteurs",
      create_an_author: "Créer un auteur",
      favorite_medias: "Média favoris",
      all_medias: "Tous les médias",
      create_text: "Écrire",
      import: "Importer",
      import_all_files: "Importer tous les fichiers",
      import_medias: "Importer des médias",
      select_files_to_import: "Sélectionner les fichiers à importer",
      select_cover_image: "Sélectionner une image de couverture",
      select_portrait_image: "Sélectionner une image de portrait",
      add_to_recipe: "Ajouter à la recette",
      add_a_page: "Ajouter une page",
      insert_a_page_here: "Insérer une page ici",
      add_a_page_before: "Ajouter une page avant celle-ci",
      add_a_page_after: "Ajouter une page après celle-ci",
      add_a_page_here: "Ajouter une page ici",
      remove_this_page: "▲ Supprimer cette page ▲",

      anonymous: "anonyme",
      other_users: "autres utilisateurs",
      other_users_connected: "autres utilisateurs connectés",

      mix_medias: "Mélanger des médias",

      made_with_dodoc:
        "Page web réalisée avec l’application libre et gratuite do•doc",

      loading: "chargement",
      open: "Ouvrir",
      save: "Enregistrer",
      as_favorite: "+ favoris",
      edit: "Éditer",
      width: "Largeur",
      height: "Hauteur",
      zoom: "Zoom",
      settings: "Règlages",
      stopmotion_list: "Liste des animations",

      print: "Imprimer",
      create: "Créer",
      remove: "Supprimer",
      withdraw: "Enlever",
      remove_this_image: "Supprimer cette image",
      password: "Mot de passe",
      password_required_to_open: "Mot de passe requis",
      show_password: "Afficher le mot de passe",
      hide: "Cacher",
      protected_by_pass: "protégé par mot de passe",
      password_instructions:
        "Si existant, seul les utilisateurs possédant ce mot de passe pourront ouvrir ce projet.",
      author_instructions:
        "Pour créer des auteurs, fermez cette fenêtre et cliquez sur le bouton (AUTEURS).",
      author_name_editing_instructions:
        "Attention&nbsp;! Tous les médias, projets et recettes resteront associés au nom précédent.",
      when_logged_as_author_content_will_be_tagged:
        "Lorsque vous êtes identifié comme auteur tous les projets, médias et recettes porteront votre nom.",
      more_informations_on_authors:
        "Vous pourrez ajouter d’autres co-auteurs directement dans les projets, médias et recettes. Si vous supprimez un auteur, tous les médias, projets et recettes conserveront le nom d’auteur et ne seront pas supprimées.",

      sort_by: "Organiser par",
      by: "par",
      in_the_order: "Dans l’ordre",
      public: "Public",
      fav: "Favoris",
      content: "Contenu",
      edit: "Modifier",

      "lang:": "Changer la langue&nbsp;:",
      lang: "Changer la langue",
      share_access: "Accéder depuis d’autres appareils",
      scan_qr_code: "Scanner un code QR",

      photo: "photo",
      video: "vidéo",
      stopmotion: "animation",
      audio: "son",
      vecto: "formes",
      image: "image",
      text: "texte",
      document: "document",
      other: "autre",
      with_sound: "avec le son",
      generate: "Générer",

      select: "Sélectionner",
      unselect: "Dé-sélectionner",

      toconnectwithanotherdevice:
        "Pour accéder à cet élément avec un autre appareil, connectez vous au même réseau wifi puis entrez l’url suivante dans un navigateur web, ou bien scannez le code QR&nbsp;: ",
      sureToRemoveProject: "Êtes-vous sûr de vouloir supprimer ce projet ?",
      sureToRemoveMedia: "Êtes-vous sûr de vouloir supprimer ce média ?",

      edit_the_media: "Éditer le média",
      edit_project: "Éditer le projet",
      edit_publication: "Éditer la recette",
      drop_here_to_import: "Déposez vos contenus ici pour les importer",

      capture: "Capturer",
      current: "Actuellement",
      currently: "Actuellement",
      update: "Mettre à jour",

      more_information:
        'Pour plus d’information, consultez la <a href="https://latelier-des-chercheurs.fr/docs/manuel-dodoc" class="js--openInBrowser" target="_blank">documentation</a> ou <a href="mailto:info@latelier-des-chercheurs.fr?subject=do•doc" class="js--openInBrowser" target="_blank">contactez</a> les auteurs de ce logiciel.',
      no_media_in_folder: "Aucun média dans ce dossier.",
      no_public_media_in_folder: "Aucun média public dans ce dossier.",
      auto_scroll: "défilement<br>automatique",
      scale: "échelle&nbsp;:",
      scale_items: {
        second: "sec",
        minute: "min",
        hour: "h",
        half_day: "½j",
        day: "j"
      },

      more_informations: "Plus d’infos",
      contents_are_stored: "Les contenus de ce dossier sont enregistrés dans ",
      folder_information: "Informations du dossier",
      calendar: "Calendrier",
      now: "en ce moment",
      list: "Liste",
      fullscreen: "Plein écran",
      preview: "Aperçu",
      filter: "Filtre",
      filters: "Filtres",
      search_by_name: "Rechercher par nom",
      header_left: "En-tête gauche",
      header_right: "En-tête droite",
      gridstep: "Pas de la grille d’alignement",
      snap_to_grid: "Magnétisme",
      margin_top: "Marge: haut",
      margin_left: "Marge: gauche",
      margin_right: "Marge: droite",
      margin_bottom: "Marge: bas",
      number_of_medias: "Nombre de médias",
      number_of_pages: "Nombre de pages",
      show_page_numbers:
        "Afficher le numéro de page dans le coin en bas à droite",

      export_folder: "Exporter en format WEB",
      export: "Exporter",
      export_as_pdf: "Export PDF",
      new_window: "Nouvelle fenêtre",
      previous_creations: "Créations précédentes",
      export_video_instructions:
        "Cliquez sur le bouton pour lancer la création d’une seule vidéo à partir des vidéos ajoutées à la recette.",
      export_audio_video_mix_instructions:
        "Cliquez sur le bouton pour lancer la création d’une vidéo à partir du son et de la vidéo sélectionnés.",
      export_audio_image_mix_instructions:
        "Cliquez sur le bouton pour lancer la création d’une vidéo à partir du son et de l’image sélectionnés.",
      export_stopmotion_instructions:
        "Cliquez sur le bouton pour lancer la création d’une seule vidéo à partir des images ajoutées à la recette.",
      make_video: "Fabriquer une vidéo",
      interval_between_pictures: "Intervalle entre chaque photo",

      publication_list: "Liste des recettes",
      export_creation: "Exportation d’une création",
      get_pdf:
        "Pour récupérer un PDF de cette recette (par exemple pour l’imprimer), cliquez sur le bouton ci-dessous&nbsp;:",
      download_pdf: "Télécharger un PDF",
      get_website:
        "Pour récupérer un site web contenant cette recette (par exemple pour la diffuser en ligne), cliquez sur le bouton ci-dessous&nbsp;:",
      download_website: "Télécharger une version web",
      open_in_app: "Afficher",

      get_a_link: "Récupérer un lien vers ce document&nbsp;:",

      format: "Format",
      name_of_copy: "Nom à donner à la copie",
      template: "Gabarit",
      standard: "Standard",
      "feuille de choux": "Feuille de Choux",
      "human tech days": "Human Tech Days",
      page_by_page: "Document page à page",
      carreau: "Carreau",
      video_assemblage: "Montage vidéo",
      stopmotion_animation: "Animation image par image",
      web: "Page web",
      back_to_project: "Retour au projet",

      page_by_page_summary:
        "Créer un PDF imprimable ou une page web à mettre en ligne.",
      page_by_page_instructions: `Cette recette permet de créer un document avec un format précis et plusieurs pages.<br> Médias acceptés : images, vidéos, sons et textes.<br>Créera un PDF imprimable (pour faire des affiches, tracts, journaux, etc.) ou une page web à mettre en ligne.`,
      video_assemblage_summary:
        "Créer un montage vidéo à partir d’images et de vidéos.",
      video_assemblage_instructions: `Cette recette propose de créer un montage vidéo en mettant plusieurs vidéos ou images bout à bout.<br> Médias acceptés : des vidéos et des images.<br>Créera une nouvelle vidéo.`,
      stopmotion_animation_summary:
        "Assembler des images pour créer une vidéo.",
      stopmotion_animation_instructions: `Cette recette permet l’assemblage d’un nombre illimité d’images pour créer une séquence vidéo dans laquelle elles défilent à une vitesse réglable.<br> Médias acceptés : uniquement des images. Les dimensions de la première image détermine si la vidéo finale est en portrait ou paysage.<br>Créera une nouvelle vidéo.`,
      mix_audio_and_video_summary: "Ajouter ou remplacer du son sur une vidéo.",
      mix_audio_and_video_instructions: `Cette recette prend une vidéo et une piste audio. Elle ajoute ou remplace la bande sonore de la vidéo avec celle qui est sélectionnée.<br> Médias acceptés : une vidéo et une piste sonore.<br>Créera une nouvelle vidéo de la durée du plus long média.`,
      mix_audio_and_image_summary: "Ajouter du son sur une image.",
      mix_audio_and_image_instructions: `Cette recette prend une image et une piste audio. Elle permet de créer des <i>images parlantes</i>.<br> Médias acceptés : une image et une piste sonore.<br>Créera une vidéo de la durée de la piste sonore.`,
      carreau_summary:
        "Empiler des médias pour créer en temps réel des présentations.",
      carreau_instructions: `Cette recette permet de collaborer à plusieurs sur la même surface pour présenter des médias de différent type. Ouvrez une nouvelle fenêtre vers cette recette en plein écran sur un projecteur pour afficher uniquement la surface.<br> Médias acceptés : images, vidéos, sons.`,

      last_modified: "Dernière modification",
      remote_access: "Accès depuis d’autres appareils",
      img_per_second: "Images par seconde",
      sent: "Envoyé",
      disable: "Désactiver",
      previous_media: "Média précédent",
      next_media: "Média suivant",
      minimize_media: "Utiliser comme référence",
      remember_project_password_for_this_device:
        "Se souvenir du mot de passe pour cet appareil",

      notifications: {
        ios_not_compatible_with_capture:
          "Les iPhones et les iPads ne sont pas compatibles avec la fonctionnalité de Capture.",
        instead_import_with_this_button:
          "Utilisez plutôt la fonctionnalité d’import ci-dessus pour prendre des photos et des vidéos ou en importer depuis votre appareil.",
        media_was_sent: "Le média a été enregistré.",
        media_couldnt_be_sent:
          "Le média n’a pas pu être enregistré à cause d’une erreur de connexion.",
        file_was_sent: "Le fichier a été enregistré.",
        file_upload_not_allowed:
          "Votre navigateur web ne prend pas en charge l’envoi de fichiers.",
        connection_active: "La connexion au serveur est active.",
        connection_lost: "La connexion au serveur a été perdue.",
        contents_wont_be_editable:
          "Les modifications et ajouts ne seront plus pris en compte.",
        connection_error: "La connexion au serveur n’a pu se faire.",
        media_has_been_added_successfully: "Le média a bien été transféré",
        wrong_password_for_dodoc:
          "Le mot de passe envoyé n’est pas valide. Veuillez réessayer.",
        loading_dodoc: "Chargement de do•doc en cours…",
        "wrong_password_for_folder:":
          "Le mot de passe n’est pas le bon pour le dossier&nbsp;:",
        "created_edited_media:":
          "Création ou édition d’un média pour le dossier&nbsp;:",
        project_name_exists:
          "Ce nom de projet existe déjà, utilisez-en un autre.",
        publi_name_exists:
          "Ce nom de recette existe déjà, utilisez-en un autre.",
        author_name_exists:
          "Ce nom d’auteur existe déjà, utilisez-en un autre.",
        folder_name_needs_alphanumeric_characters:
          "Les noms de dossier doivent contenir au moins un caractère alphanumérique.",
        "failed_to_get_folder:": "Le dossier suivant n’a pas été trouvé:",
        failed_to_start_video_change_source_or_res:
          "Le flux vidéo n’a pas pu être démarré.<br>Essayez de modifier la source ou la résolution dans les réglages.",
        video_source_not_set: "La source vidéo n’a pas été trouvée.",
        failed_to_start_audio_change_source:
          "Le flux audio n’a pas pu être démarré.<br>Essayez de modifier la source dans les réglages.",
        audio_source_not_set: "La source audio n’a pas été trouvée.",
        video_stream_not_available:
          "Erreur : le flux vidéo n’est pas disponible.",
        no_content_found_with_nfc_tag:
          "Scan d’un tag NFC réussi, associez-lui un auteur ou un média pour commencer.",
        author_found_with_nfc_tag:
          "Scan d’un tag NFC réussi, activation de l’auteur suivant&nbsp;:",
        medias_uploaded: "Tous les médias ont bien étés enregistrés.",
        medias_upload_failed:
          "Erreur&nbsp;: certains médias n’ont pas pu être enregistrés.",
        video_converted: "La vidéo a été convertie et ajoutée au projet.",
        project_has_been_removed:
          "Ce projet vient d’être supprimé par quelqu’un d’autre.",
        wrong_password_for: "Mot de passe erroné pour ",
        creating_video: "En cours de création de la vidéo…",
        preparing_video_from_montage: "Préparation des vidéos du montage",
        finished_creating_recipe:
          "La recette est terminée et peut être consultée !",
        media_copied_successfully:
          "La copie du média a été réalisée avec succès.",
        creation_in_progress: "En cours de création…",
        connected_to_dodoc: "Connection à do•doc active",
        using_saved_password:
          "Connection à do•doc en utilisant le mot de passe enregistré",
        pdf_created: "Le PDF a été créé",
        video_created: "La vidéo a été créée",
        video_creation_failed: "La vidéo n’a pas pu être créée",
        project_copy_in_progress: "Copie du projet en cours…",
        project_copy_completed: "Copie terminée",
        password_added_or_changed_to_this_project:
          "Le mot de passe de ce projet a été ajouté ou modifié.",
        enter_password_to_reopen_project:
          "Entrez le nouveau mot de passe pour accéder à nouveau à"
      }
    },
    en: {
      ascending: "Ascending",
      descending: "Descending",
      create_a_project: "Create a project",
      create_a_publication: "Create a recipe",
      name: "Name",
      project_name: "Project name",
      created_date: "Created date",
      uploaded: "Uploaded",
      created: "Created",
      edited: "Edited",
      sent_date: "Sent date",
      for_the_placement_on_timeline: "(used for the position on the timeline)",
      type: "Type",
      color: "Color",
      keywords: "Keywords",
      author: "Author(s)",
      share: "Share",
      copy: "Copy",
      download: "Download",
      caption: "Caption",
      formatting: "Formatting",

      login: "Login",
      adding_password_warning:
        "Warning! Adding or changing the password will disconnect all users until they enter the new password.",
      removing_password_warning:
        "Removing the password for this project will allow everyone to access, edit and delete it.",
      help: "Help",
      date: "Date",
      smoothing: "smoothing",
      onion_skin: "Onion skin",
      "file:": "File&nbsp;:",
      add_to_project: "Add to project:",
      input_password: "Input the password here:",
      validate_with_enter: "Validate with ENTER.",
      no_stopmotion_created_yet:
        "Created stopmotion animations will appear in this list.",
      device: "Device",

      very_slow: "Very slow",
      slow: "Slow",
      speed_medium: "Normal",
      fast: "Fast",
      forget_password_and_close: "Forget password and close project",

      remember_password_on_this_device: "Remember for this device",

      cooking_pot: "Cooking pot",
      copy_of: "Copy of",
      text_overflow: "Overflow text",
      move_to_foreground: "Move to foreground",
      move_to_background: "Move to background",
      "layer:": "Layer:",
      css_settings: "CSS settings",
      edit_content: "Edit content",
      adjust: "Adjust",
      duplicate: "Duplicate",
      project_name_to_find: "Project name to find",

      show_all: "Show all",
      cooking_pot_instructions:
        "Mix a single or multiple medias to create new medias!",
      untitled: "Untitled",
      framerate: "images per second",
      timelapse: "timelapse",
      seconds_per_image: "seconds per image",
      seconds: "seconds",
      quality: "quality",

      bytes: "bytes",
      kb: "KB",
      mb: "MB",
      gb: "GB",
      duration: "Duration",
      send: "Send",
      open_in_dodoc: "Open in do•doc",
      connect_to_dodoc: "Open do•doc",

      portrait: "Portrait",
      nfc_tag: "Tag NFC",
      yes: "Yes",
      cancel: "Cancel",
      back: "Back",
      sureToRemoveAuthor:
        "Do you really want to delete this author? All medias, projects and recipes will be kept.",
      show_all_authors: "Show all authors",
      changes_not_saved_sureToCloseModal:
        "All changes were not saved. Do you really want to close this window?",
      save_changes: "Yes, save changes",
      close_the_window: "No, close without saving",
      sureToRemovePubli: "Do you really want to delete this recipe?",
      sure_to_cancel_stopmotion:
        'Do you really want to cancel this stopmotion? You can resume making it by clicking on "Stopmotion list"',
      validate_media: "Validate the media",
      add_keyword: "Add a keyword",
      add: "Add",
      close: "Fermer",

      very_high: "Very high (1080p)",
      high: "High (1080p)",
      medium: "Medium (640p)",
      low: "Low (360p)",

      showing: "Showing",
      media_filter: "Medias filter",
      no_projects_yet: "No projects yet, create one to start using do•doc!",
      projects_of: "projects of",
      medias_of: "medias of",
      projects: "Projects",
      project: "Project",
      medias: "Medias",
      media: "Media",
      authors: "Authors",
      authors_list: "List of authors",
      create_an_author: "Create an author",
      favorite_medias: "Favorite medias",
      all_medias: "All medias",
      create_text: "Write",
      import: "Import",
      import_medias: "Import medias",
      import_all_files: "Import all files",
      select_files_to_import: "Select files to import",
      select_cover_image: "Select a cover image",
      select_portrait_image: "Select a portrait",
      add_to_recipe: "Add to recipe",
      add_a_page: "Add a page",
      insert_a_page_here: "Insert a page here",
      add_a_page_before: "Add a page before this one",
      add_a_page_after: "Add a page after this one",
      add_a_page_here: "Add a page here",
      remove_this_page: "▲ Remove this page ▲",

      anonymous: "anonymous",
      other_users: "other users",
      other_users_connected: "other user connected",

      mix_medias: "Mix medias",

      made_with_dodoc: "Webpage made with do•doc, a free and open-source app",

      loading: "loading",
      open: "Open",
      save: "Save",
      as_favorite: "+ favourite",
      edit: "Edit",
      print: "Print",
      create: "Create",
      remove: "Remove",
      withdraw: "Withdraw",
      remove_this_image: "Remove this image",
      password: "Mot de passe",
      password_required_to_open: "Password required",
      show_password: "Show password",
      hide: "Hide",
      protected_by_pass: "protected by password",
      password_instructions:
        "If set, only users with the password will be able to open this project.",
      author_instructions:
        "To create authors, close this window and click on (AUTHORS).",
      author_name_editing_instructions:
        "Warning! All existing medias, projects and recipes will still be associated to the previous name.",
      when_logged_as_author_content_will_be_tagged:
        "When logged in as an author all projects, medias and recipes will be saved with your name.",
      more_informations_on_authors:
        "You can add co-authors in the projects, medias and recipes. If you remove an author, all the projects, medias and recipes will keep this author name and won’t be removed.",

      sort_by: "Sort by",
      by: "by",
      in_the_order: "In the order",
      public: "Public",
      fav: "Favourite",
      content: "Content",
      edit: "Edit",
      width: "Width",
      height: "Height",
      zoom: "Zoom",
      settings: "Settings",
      stopmotion_list: "Stopmotion list",

      "lang:": "Select lang:",
      lang: "Select lang",
      share_access: "Access from other devices",
      scan_qr_code: "Scan a QR code",

      photo: "picture",
      video: "video",
      stopmotion: "stop motion",
      audio: "sound",
      vecto: "shapes",
      image: "image",
      text: "text",
      document: "document",
      other: "other",
      with_sound: "with sound",
      generate: "Generate",

      export: "Export",
      export_as_pdf: "Export as PDF",
      new_window: "New Window",
      export_video_instructions:
        "Click this button to generate a video from multiple source videos.",
      export_audio_video_mix_instructions:
        "Click this button to generate a video from the sound and video selected.",
      export_audio_image_mix_instructions:
        "Click this button to generate a video from the sound and image selected.",
      export_stopmotion_instructions:
        "Click this button to generate a video from images you have selected.",
      make_video: "Make a video",
      interval_between_pictures: "Interval between photos",

      select: "Select",
      unselect: "Unselect",

      toconnectwithanotherdevice:
        "To access this do•doc element with another device, first connect it to the same wifi network, then type this adress in your browser or scan this QR code:",
      sureToRemoveProject: "Do you really want to delete this project?",
      sureToRemoveMedia: "Do you really want to delete this media?",

      publication: "Recipe",
      edit_the_media: "Edit media",
      edit_project: "Edit project",
      edit_publication: "Edit recipe",
      drop_here_to_import: "Drop your content here to import",

      capture: "Capture",
      current: "Current",
      currently: "Now",
      update: "Update",

      more_information:
        'For more informations, read the <a href="https://latelier-des-chercheurs.fr/docs/manuel-dodoc" class="js--openInBrowser" target="_blank">documentation (in french)</a> or <a href="mailto:info@latelier-des-chercheurs.fr?subject=do•doc" class="js--openInBrowser" target="_blank">contact</a> the creators of this app.',

      no_media_in_folder: "No media in this folder.",
      no_public_media_in_folder: "No public media in this folder.",
      auto_scroll: "autoscroll",
      scale: "scale:",
      scale_items: {
        second: "sec",
        minute: "min",
        hour: "h",
        half_day: "½d",
        day: "d"
      },

      more_informations: "More infos",
      contents_are_stored: "Contents for this folder are stored in ",
      folder_information: "Folder information",
      calendar: "Calendar",
      now: "now",
      list: "List",
      fullscreen: "Fullscreen",
      preview: "Preview",
      filter: "Filter",
      filters: "Filters",
      search_by_name: "Search by name",
      header_left: "Left header text",
      header_right: "Right header text",
      gridstep: "Step of alignment grid",
      snap_to_grid: "Snap to grid",
      margin_top: "Margin: top",
      margin_left: "Margin: left",
      margin_right: "Margin: right",
      margin_bottom: "Margin: bottom",
      number_of_medias: "Number of medias",
      number_of_pages: "Number of pages",
      show_page_numbers: "Show page number in the bottom-right corner",

      export_folder: "Export as a webpage",
      export: "Export",

      publication_list: "Recipes list",
      export_creation: "Export a creation",
      get_pdf:
        "To download a PDF of this recipe (for example, to print it), click here:",
      download_pdf: "Download PDF",
      get_website:
        "To download a website version of this recipe (for example, to publish online), click here:",
      download_website: "Download a website",
      open_in_app: "Open",

      get_a_link: "Get a link to this document&nbsp;:",

      format: "Format",
      name_of_copy: "Name of the copy",
      template: "Template",
      page_by_page: "Paged document",
      video_assemblage: "Video editing",
      web: "Webpage",
      back_to_project: "Back to project",

      previous_creations: "Previous creations",
      stopmotion_animation: "Stopmotion animation",

      page_by_page_summary:
        "Creates a printable PDF or website to upload online.",
      page_by_page_instructions: `This recipe can be used to create a paged document with a specific size.<br>Accepted medias: images, videos, sounds and texts.<br>Will create a PDF that can be printed (to make posters, tracts, newspapers, etc.) or a webpage to upload online.`,
      video_assemblage_summary: `Creates a video from images and videos.`,
      video_assemblage_instructions: `This recipe creates a video from multiple source images and videos, one after the other.<br>Accepted medias: images and videos.<br>Will create a new video.`,
      stopmotion_animation_summary:
        "Creates a video from images shown for a specific period of time.",
      stopmotion_animation_instructions: `This recipe takes any number of images as inputs and creates a single video with images displayed at a specific speed.<br>Accepted medias: images of any size. The first image will determine if the video will be in portrait or landscape.<br>Will create a new video.`,
      mix_audio_and_video_summary: "Add or replace sound that’s on a video.",
      mix_audio_and_video_instructions: `This recipe mixes a video and an audio track to create a new video where they are played at the same time.<br>Accepted medias: a video and a sound track.<br>Will create a new video.`,
      mix_audio_and_image_summary: "Add sound to an image to create a video.",
      mix_audio_and_image_instructions: `This recipe mixes an image with an audio track to create a <i>speaking image</i><br>Accepted medias: an image and a sound track.<br>Will create a new video.`,
      carreau_summary:
        "Stack multiple medias on a single surface to project content.",
      carreau_instructions: `Use this mode to show multiple medias on a large projection or screen, for example by opening a browser and clicking on the fullscreen button.<br>Accepted medias: images, videos and sounds.`,

      add_sound_video_file:
        "Add a <b>sound</b> and a <b>video</b> media to create a new video.",
      add_sound_image_file:
        "Add a <b>sound</b> and an <b>image</b> media to create a new video.",
      mix_audio_and_video: "Sound + video",
      mix_audio_and_image: "Sound + image",
      add_multiple_videos_files:
        "Add multiple <b>video</b> medias to create a new video.",
      add_multiple_images:
        "Add multiple <b>image</b> medias to create a video.",
      style: "style",
      css: "css",
      write_some_CSS_code_for_example:
        "Write here some CSS code, <br>for example <code>color: blue;</code>",

      last_modified: "Last modified",
      remote_access: "Acces from other devices",
      img_per_second: "Images per second",
      sent: "Sent",
      disable: "Disable",
      previous_media: "Previous media",
      next_media: "Next media",
      minimize_media: "Use as a reference",
      remember_project_password_for_this_device:
        "Remember password for this device",

      notifications: {
        ios_not_compatible_with_capture:
          "iPhones and iPads are not currently compatible with the <i>capture</i> page.",
        instead_import_with_this_button:
          "Instead import or capture photos and videos here in the import modal.",
        media_was_sent: "The media was sent.",
        media_couldnt_be_sent:
          "The media was not sent because of a connexion error.",
        file_was_sent: "The file was sent.",
        file_upload_not_allowed: "File upload is not allowed by this browser.",
        media_has_been_added_successfully: "The media was successfully added.",
        connection_active: "The connection to the server is active.",
        connection_lost: "The connection to the server was lost.",
        contents_wont_be_editable: "Content editing is disabled.",
        connection_error:
          "The connection to the server could not be established.",
        wrong_password_for_dodoc: "Wrong password, please try again.",
        loading_dodoc: "Loading do•doc…",
        "wrong_password_for_folder:": "Wrong password or folder missing for:",
        "created_edited_media:":
          "A media has been created or edited in folder:",
        project_name_exists:
          "This project name already exists. Please use another.",
        publi_name_exists:
          "This recipe name already exists. Please use another.",
        author_name_exists:
          "This author name already exists. Please use another.",
        folder_name_needs_alphanumeric_characters:
          "Folder names need to contain at least one alphanumeric character.",
        "failed_to_get_folder:": "Failed to get the requested folder:",
        failed_to_start_video_change_source_or_res:
          "Failed to start camera feed. Try changing the source or the resolution.",
        video_source_not_set: "The source video has not been set.",
        failed_to_start_audio_change_source:
          "Failed to start audio feed. Try changing the source.",
        audio_source_not_set: "The source audio has not been set.",
        video_stream_not_available: "Error: Video stream not available.",
        no_content_found_with_nfc_tag:
          "NFC tag detected, bind it to an author or a media to start.",
        author_found_with_nfc_tag:
          "NFC tag detected, the following author will be logged-in:",
        medias_uploaded: "All medias were imported successfully.",
        medias_upload_failed: "Error: some medias failed to import.",
        video_converted:
          "The video was converted successfully and added to the project.",
        project_has_been_removed:
          "This project just got removed by another user.",
        wrong_password_for: "Wrong password for project ",
        creating_video: "Creating video…",
        preparing_video_from_montage: "Pre-processing videos from the montage",
        finished_creating_recipe: "The recipe was successfully completed!",
        media_copied_successfully: "The media was copied successfully.",
        creation_in_progress: "Creation in progress…",
        connected_to_dodoc: "Connection to do•doc active",
        using_saved_password:
          "Connecting to do•doc using the password that was saved",
        pdf_created: "PDF created",
        video_created: "The video was created",
        video_creation_failed: "The video was not created",
        project_copy_in_progress: "Copy of the project in progress…",
        project_copy_completed: "Copy finished",
        password_added_or_changed_to_this_project:
          "The password for this project hass been added or changed.",
        enter_password_to_reopen_project:
          "Enter the new password to reopen project"
      }
    },
    nl: {
      ascending: "Toenemend",
      descending: "Afnemend",
      create_a_project: "Project aanmaken ",
      create_a_publication: "Publicatie aanmaken ",
      publication: "Publicatie",
      name: "Naam",
      project_name: "Naam van het project",
      created_date: "Datum van oprichting",
      uploaded: "Geüpload",
      created: "Gemaakt ",
      edited: "Bewerkt",
      sent_date: "Verzendingsdatum",
      for_the_placement_on_timeline: "(voor de plaatsing op de tijdlijn)",

      type: "Type",
      color: "Kleur",
      keywords: "Kernwoorden",
      share: "Deel",
      copy: "Kopiëren",
      author: "Auteur",
      download: "Downloaden",
      caption: "Bijschrift",
      formatting: "Opmaak",
      smoothing: "effen",
      onion_skin: "uienschil",
      "file:": "Bestand:",
      add_to_project: "Toevoegen aan project:",
      input_password: "Wachtwoord invoeren:",
      validate_with_enter: "Bevestig met ENTER.",
      no_stopmotion_created_yet: "Er is nog geen stopmotion gemaakt: ",
      device: "Toestel",
      "camera2 1, facing front": "Camera naar voren gericht ",
      "camera2 0, facing back": "Camera naar achteren gericht ",
      very_slow: "Zeer traag",
      slow: "Traag",
      speed_medium: "Normaal",
      fast: "Snel",
      forget_password_and_close: "Wachtwoord vergeten en sluiten ",

      remember_password_on_this_device: "Wachtwoord onthouden op dit toestel",
      cooking_pot: "De ketel",
      copy_of: "Kopie van",
      text_overflow: "Tekstoverloop",
      move_to_foreground: "Op de voorgrond plaatsen. ",
      move_to_background: "Op de achtergrond plaatsen",
      "layer:": "Laag:",
      css_settings: "CSS instellingen",
      edit_content: "Inhoud wijzigen ",
      adjust: "Wijzigen",
      duplicate: "Dupliceren",
      show_all: "Alles tonen",
      cooking_pot_instructions: "Meng bestanden om nieuwe bestanden te maken !",
      untitled: "Zonder naam",
      mix_audio_and_video: "Video- en geluidsbestanden combineren",
      mix_audio_and_image: "Foto- en geluidsbestanden combineren",
      add_sound_video_file:
        "Open een project en voeg een <b>geluidsbestand</b> en een <b>videobestand</b> toe door op de groene pijl te klikken .<br>Als u exporteert, wordt een nieuwe video gemaakt .<br>Ondersteunde bestandstypen : video en geluid.",
      add_sound_image_file:
        "Open een project en voeg een <b>geluidsbestand</b> en een <b>fotobestand</b> toe door op de groene pijl te klikken .<br>Als u exporteert, wordt een nieuwe video gemaakt .<br>Ondersteunde bestandstypen : foto en geluid.",
      add_multiple_videos_files:
        "Open een project en voeg meerdere <b>video</b>bestanden toe door op de groene pijl te klikken . Video’s worden in volgorde van toevoeging na elkaar geplaatst.<br>Als u exporteert, wordt een nieuwe video gemaakt .<br> Ondersteunde bestandstypen : alleen video’s van hetzelfde formaat.",
      add_multiple_images:
        "Open een project en voeg verschillende <b>foto</b>bestanden toe door op de groene pijl te klikken. Foto’s worden in volgorde van toevoeging na elkaar geplaatst. Exporteer de beelden en pas de schuifsnelheid van de beelden aan.<br>Als u exporteert, wordt een nieuwe video gemaakt .<br> Ondersteunde bestandstypen : enkel fotobetanden. De afmetingen van het eerste beeld bepalen of de uiteindelijke video als portret of landschap is ingedeeld.",
      style: "stijl",
      css: "css",
      write_some_CSS_code_for_example:
        "Noteer hier CSS code, <br>bijvoorbeeld <code>color: blue;</code>",
      framerate: "beelden per seconde, ",
      timelapse: "tijdsverloop ",
      seconds_per_image: "seconden per beeld",
      seconds: "seconden",
      quality: "kwaliteit",
      bytes: "bytes",
      kb: "kb",
      mb: "Mb",
      gb: "Gb",
      duration: "Duur",
      send: "Verzenden",
      open_in_dodoc: "Openen in do•doc",
      connect_to_dodoc: "Toegang tot do•doc",
      login: "Inloggen ",
      adding_password_warning:
        "Opgelet! Als u een wachtwoord toevoegt of wijzigt, moeten alle gebruikers die er momenteel mee verbonden zijn dit invoeren voordat ze een bijdrage kunnen blijven leveren..",
      removing_password_warning:
        "Als u het wachtwoord verwijdert, kunnen alle gebruikers die toegang hebben tot do•doc het project wijzigen.",
      help: "Hulp",
      date: "Datum",
      portrait: "Portret",
      nfc_tag: "Tag NFC",
      yes: "ja",
      cancel: "Annuleren",
      back: "Terug",
      sureToRemoveAuthor: "Weet u zeker dat u deze auteur wilt verwijderen ?",
      show_all_authors: "Bekijk alle auteurs",
      changes_not_saved_sureToCloseModal:
        "Er zijn wijzigingen gebeurd , wilt u deze opslaan?",
      save_changes: "Ja, wijzigingen opslaan. ",
      close_the_window: "Nee, sluiten zonder opslaan",
      sureToRemovePubli: "Weet u zeker dat u deze publicatie wilt verwijderen?",
      sure_to_cancel_stopmotion:
        'Weet je zeker dat je deze animatie wilt stoppen? U kunt het terugvinden in het menu "Lijst van animaties".',
      validate_media: "Media valideren",
      add_keyword: "Kernwoord toevoegen",
      add: "Toevoegen",
      close: "Sluiten",
      very_high: "Zeer hoog (1080p)",
      high: "Hoog (720p)",
      medium: "Medium (640p)",
      low: "Laag (360p)",
      showing: "Weergave ",
      media_filter: "Bestandsfilter",
      no_projects_yet:
        "Er is nog geen project, maak er een aan om do•doc in gebruik te nemen!",
      projects_of: "projecten van",
      medias_of: "bestanden van",
      projects: "Projecten",
      project: "Project",
      medias: "Bestanden",
      media: "Media",
      authors: "Auteurs",
      authors_list: "Lijt van auteurs",
      create_an_author: "Maak een auteur aan",
      favorite_medias: "Favoriete media",
      all_medias: "Alle media",
      create_text: "Schrijven",
      import: "Importeren",
      import_all_files: "Importeer alle bestanden",
      import_medias: "Importeer media",
      select_files_to_import: "Selecteer bestanden om te importeren ",
      select_cover_image: "Selecteer een omslagafbeelding",
      select_portrait_image: "Selecteer een portretfoto",
      add_to_recipe: "Toevoegen aan recept",
      add_a_page: "Een pagina toevoegen",
      insert_a_page_here: "Hier een pagina invoegen",
      add_a_page_before: "Hiervoor een pagina toevoegen ",
      add_a_page_after: "Hierna een pagina toevoegen ",
      add_a_page_here: "Hier een pagina toevoegen",
      remove_this_page: "▲ deze pagina verwijderen ▲",
      anonymous: "anoniem",
      other_users: "andere gebruikers",
      other_users_connected: "andere verbonden gebruikers",
      mix_medias: "Mengen van media",
      made_with_dodoc: "Webpagina gerealiseerd met de gratis applicatie do•doc",

      loading: "laden",
      open: "Openen",
      save: "Opslaan",
      as_favorite: "toevoegen aan favorieten",
      edit: "Bewerken",
      width: "Breedte",
      height: "Hoogte",
      zoom: "Zoom",
      settings: "Instellingen",
      stopmotion_list: "Lijst van animaties",
      print: "Afdrukken",
      create: "Aanmaken",
      remove: "Verwijderen",
      withdraw: "Terugtrekken",
      remove_this_image: "Dit beeld verwijderen",
      password: "Wachtwoord",
      password_required_to_open: "Wachtwoord vereist",
      show_password: "Wachtwoord tonen ",
      hide: "Verbergen",
      protected_by_pass: "Beveiligd met een wachtwoord. ",
      password_instructions:
        "Indien van toepassing, alleen gebruikers met dit wachtwoord kunnen dit project openen.",
      author_instructions:
        "Om auteurs aan te maken, sluit dit venster en klik op de knop (AUTEURS).",
      sort_by: "Sorteer volgens",
      by: "per",
      in_the_order: "In volgorde",
      public: "Publiek",
      fav: "Favoriet",
      content: "Inhoud",
      edit: "Wijzigen",
      "lang:": "De taal wijzigen:",
      lang: "De taal wijzigen",
      share_access: "Toegang verlenen via andere toestellen ",
      scan_qr_code: "QR-code scannen ",
      photo: "foto",
      video: "video",
      stopmotion: "animatie",
      audio: "geluid",
      vecto: "vormen",
      image: "beeld",
      text: "tekst",
      document: "document",
      other: "andere",
      with_sound: "met geluid",
      generate: "Genereren",
      select: "Selecteren",
      unselect: "Deselecteren",
      toconnectwithanotherdevice:
        "Om dit item met een ander apparaat te openen , maak verbinding met hetzelfde wifi-netwerk en voer vervolgens de volgende URL in een webbrowser in, of scan de QR-code: ",
      sureToRemoveProject: "Weet u zeker dat u dit project wilt verwijderen?",
      sureToRemoveMedia: "Weet u zeker dat u deze media wilt verwijderen?",
      edit_the_media: "Media bewerken",
      edit_project: "Project bewerken",
      edit_publication: "Recept bewerken",
      drop_here_to_import: "Laad de bestanden hier om te importeren ",

      capture: "Vastleggen",
      current: "Nu",
      currently: "Momenteel",
      update: "Bijwerken",
      more_information:
        'Voor meer informatie. , bezoek <a href="https://latelierdes-chercheurs.fr/docs/manuel-dodoc" class="js--openInBrowser" target="_blank">documentatie</a> ou <a href="mailto:info@latelier-des-chercheurs.fr?subject=do•doc" class="js--openInBrowser" target="_blank">contacteer</a> de auteurs van dit programma.',
      no_media_in_folder: "Geen media in deze map .",
      no_public_media_in_folder: "Geen openbare media in deze map .",

      auto_scroll: "automatisch <br>scrollen",
      scale: "schaal:",
      scale_items: {
        second: "sec",
        minute: "min",
        hour: "u",
        half_day: "1/2d",
        day: "d"
      },
      more_informations: "Meer info",
      contents_are_stored: "De inhoud van dit bestand wordt opgeslagen in ",
      folder_information: "map-info ",
      calendar: "Kalender",
      now: "op dit moment",
      list: "Lijst",
      fullscreen: "Volledig scherm",
      preview: "Overzicht",
      filter: "Filter",
      filters: "Filters",
      header_left: "Linker koptekst",
      header_right: "Rechtse koptekst",
      gridstep: "Geen uitlijningsrooster ",
      snap_to_grid: "Magnetisme",
      margin_top: "Marge boven",
      margin_left: "Marge links",
      margin_right: "Marge rechts",
      margin_bottom: "Marge beneden",
      number_of_medias: "Aantal media",
      number_of_pages: "Aantal pagina’s",
      show_page_numbers: "Geef het paginanummer in de rechterbenedenhoek weer ",
      export_folder: "Exporteren in web formaat",
      export: "Exporteren",
      export_as_pdf: "Exporteren als PDF",
      new_window: "Nieuw venster ",
      previous_creations: "Vorige creaties",
      export_video_instructions:
        "Klik op de knop om een video te maken van de video’s die aan de publicatie zijn toegevoegd.",
      export_audio_video_mix_instructions:
        "Klik op de knop om een video te maken van het geselecteerde geluid en de geselecteerde video.",
      export_audio_image_mix_instructions:
        "Klik op de knop om een video te maken van het geselecteerde geluid en het geselecteerde beeld.",
      export_stopmotion_instructions:
        "Klik op de knop om een video te maken van de afbeeldingen die aan de publicatie zijn toegevoegd.",
      make_video: "Maak een video",
      interval_between_pictures: "Interval tussen elk beeld",
      publication_list: "Lijst van publicaties",
      export_creation: "Exporteer een creatie",
      get_pdf:
        "Als u een PDF van deze publicatie wilt maken (bijvoorbeeld om deze af te drukken), klik op de knop hieronder:",
      download_pdf: "Download PDF",
      get_website:
        "Als u een website van deze publicatie wilt maken (bijvoorbeeld om deze online te delen), klikt u op de knop hieronder:",
      download_website: "Download website",
      open_in_app: "Tonen",
      get_a_link: "Een koppeling naar dit document ophalen:",
      format: "Format",
      name_of_copy: "Naam die aan de kopie moet worden gegeven",
      template: "sjabloon",
      standard: "standaard",

      "feuille de choux": "koolblad",
      "human tech days": "Human Tech Days",
      page_by_page: "Document pagina per pagina",
      carreau: "Tegel",
      video_assemblage: "Videobewerking",
      stopmotion_animation: "Stopmotion animatie",
      web: "Webpagina",
      back_to_project: "Terug naar project",
      page_by_page_summary:
        "Maak een afdrukbare PDF of webpagina om te uploaden.",
      page_by_page_instructions: `Met dit recept kunt u een document
        met een exacte indeling en meerdere pagina's maken.<br> Ondersteunde media: afbeeldingen, video's, geluid en tekst.<br>Maak
        een afdrukbare PDF (om posters, flyers, kranten, enz. te maken) of
        een webpagina om te uploaden.`,
      video_assemblage_summary:
        "Maak een videomontage van afbeeldingen en video’s.",
      video_assemblage_instructions: `Dit recept stelt voor om een
        video montage te maken door meerdere video's of afbeeldingen na elkaar te plaatsen.<br> Ondersteunde media: video's en
        afbeeldingen.<br>Maakt een nieuwe video.`,
      stopmotion_animation_summary:
        "Beelden samenvoegen om een video te maken.",
      stopmotion_animation_instructions: `Met dit recept kunt u een
        onbeperkt aantal beelden samenvoegen om een videosequentie te
        maken waarin deze beelden na elkaar verschijnen aan een in te stellen snelheid.<br> Ondersteunde media: enkel afbeeldingen. De afmetingen van het eerste beeld bepalen of de uiteindelijke video als portret of landschap is ingedeeld.<br>Maakt een nieuwe video.`,
      mix_audio_and_video_summary:
        "Geluid op een video toevoegen of vervangen.",
      mix_audio_and_video_instructions: `Dit recept gebruikt een videobestand en een audionummer. Hiermee wordt de soundtrack aan de video toegevoegd of vervangen door het gekozen geluidsbestand.<br> Ondersteunde media: video- en geluidsbestanden.<br>Maakt een nieuwe
        video met de lengte van de langste media.`,
      mix_audio_and_image_summary: "Geluid toevoegen aan een beeld.",
      mix_audio_and_image_instructions: `Dit recept gebruikt een beeld- en een geluidsbetand. Het maakt het mogelijk om <i>sprekende beelden te maken .<br> Ondersteunde media: beeld- en 
        geluidsbestand.<br>Maakt een video met de duur van het geluidsbestand.`,
      carreau_summary: "Media samenvoegen om real-time presentaties te maken.",
      carreau_instructions: `Met dit recept kunt u met meerdere op
        hetzelfde platform samenwerken om verschillende soorten media te
        presenteren. Open een nieuw venster naar dit recept op volledig
        scherm met een projector om alleen het platform weer te geven.<br>
        Ondersteunde media: afbeeldingen, video's, geluidsbestanden.`,
      last_modified: "laatst gewijzigd",
      remote_access: "Toegang vanaf andere apparaten",
      img_per_second: "Beelden per seconde",
      sent: "Verzonden",
      disable: "uitschakelen",
      previous_media: "Vorige media ",
      next_media: "Volgende media ",
      minimize_media: "gebruik als verwijzing",
      remember_project_password_for_this_device:
        "Het wachtwoord op dit apparaat onthouden",
      notifications: {
        ios_not_compatible_with_capture:
          "IPhones en iPads zijn niet compatibel met de opnamefunctie.",
        instead_import_with_this_button:
          "Gebruik in plaats daarvan de invoerfunctie hierboven om foto’s en video’s te maken of te importeren vanaf uw apparaat",

        media_was_sent: "Media is opgenomen.",
        media_couldnt_be_sent:
          "Media kon niet worden opgeslagen vanwege verbindingsfout.",

        file_was_sent: "Het bestand is opgeslagen.",
        file_upload_not_allowed:
          "Uw webbrowser ondersteunt het verzenden van bestanden niet.",
        connection_active: "Serververbinding is actief.",
        connection_lost: "Serververbinding is verbroken.",
        contents_wont_be_editable:
          "Wijzigingen en aanvullingen zullen niet langer mogelijk zijn.",

        connection_error:
          "De verbinding met de server kan niet worden gemaakt.",
        media_has_been_added_successfully: "Media is overgebracht",
        wrong_password_for_dodoc:
          "Het gebruikte wachtwoord is ongeldig. Probeer het opnieuw.",
        loading_dodoc: "Do•doc is aan het laden …",
        "wrong_password_for_folder:":
          "Het wachtwoord is niet correct voor dit onderdeel:",
        "created_edited_media:":
          "Media voor dit onderdeel aanmaken of bewerken:",
        project_name_exists: "Deze projectnaam bestaat al, gebruik een andere.",
        publi_name_exists:
          "Deze publicatienaam bestaat al, gebruik een andere.",
        author_name_exists: "Deze auteursnaam bestaat al, gebruik een andere.",
        folder_name_needs_alphanumeric_characters:
          "Bestandsnamen moeten ten minste een alfanumeriek teken bevatten.",
        "failed_to_get_folder:": "Het volgende bestand is niet gevonden:",
        failed_to_start_video_change_source_or_res:
          "Videostream kan niet worden gestart .<br>Probeer de bron of de resolutie in de instellingen te wijzigen.",
        video_source_not_set: "Videobron niet gevonden.",
        failed_to_start_audio_change_source:
          "Audiostream kan niet worden gestart.<br>Probeer de bron in de instellingen te wijzigen.",
        audio_source_not_set: "Audiobron niet gevonden.",
        video_stream_not_available: "Fout : videostream is niet beschikbaar.",
        no_content_found_with_nfc_tag:
          "NFC tag gevonden, koppel een auteur of media om te beginnen.",

        author_found_with_nfc_tag:
          "NFC tag gevonden, activatie van de volgende auteur:",

        medias_uploaded: "Alle media zijn opgenomen.",
        medias_upload_failed:
          "Foutmelding: sommige media kunnen niet worden opgenomen.",
        video_converted:
          "De video is geconverteerd en toegevoegd aan het project.",
        project_has_been_removed:
          "Dit project werd zojuist door iemand anders verwijderd.",
        wrong_password_for: "Onjuist wachtwoord voor ",
        creating_video: "De video wordt gemaakt…",

        preparing_video_from_montage:
          "Voorbereiding van het bewerken van video’s",
        finished_creating_recipe:
          "Het recept is afgewerkt en kan worden bekeken!",
        media_copied_successfully: "De kopie van de media is gemaakt.",
        creation_in_progress: "In opmaak…",
        connected_to_dodoc: "verbinding met do•doc actief",
        using_saved_password:
          "Verbinding met do•doc met het opgeslagen wachtwoord",

        pdf_created: "De pdf is gemaakt",
        video_created: "De video is gemaakt",
        video_creation_failed: "Video kan niet worden gemaakt ",
        project_copy_in_progress: "Laden van de kopie…",
        project_copy_completed: "Kopiëren geslaagd",
        password_added_or_changed_to_this_project:
          "Wachtwoord voor dit project werd toegevoegd of gewijzigd .",
        enter_password_to_reopen_project:
          "Voer het nieuwe wachtwoord in om opnieuw toegang te krijgen"
      }
    }
  };

  return messages;
})();
