module.exports = (function() {
  // Ready translated locale messages
  const messages = {
    fr: {
      ascending: 'Croissant',
      descending: 'Décroissant',
      create_a_folder: 'Créer un dossier',
      name: 'Nom',
      created_date: 'Date de création',
      sent_date: 'Date d’envoi',
      for_the_placement_on_timeline: '(pour le placement sur la timeline)',
      type: 'Type',
      color: 'Couleur',
      keywords: 'Mot-clés',
      author: 'Auteur(s)',
      zoom: 'Zoom',
      download: 'Télécharger',
      caption: 'Légende',
      date: 'Date',

      loading: 'chargement',
      open: 'Ouvrir',
      save: 'Enregistrer',
      edit: 'Éditer',
      print: 'Imprimer',
      create: 'Créer',
      remove: 'Suppr.',
      password: 'Mot de passe',
      protected_by_pass: 'protégé par mot de passe',
      password_instructions:
        'Si existant, seul les utilisateurs possédant ce mot de passe pourront modifier ce dossier et accéder aux médias non publics.',

      sort_by: 'Organiser par',
      in_the_order: 'Dans l’ordre',
      public: 'Public',
      fav: 'Favoris',
      content: 'Contenu',

      'lang:': 'Changer la langue&nbsp;:',
      lang: 'Changer la langue',

      photo: 'photo',
      video: 'vidéo',
      stopmotion: 'animation',
      audio: 'son',

      credits:
        'Un projet libre et open-source réalisé par l’<a href="https://latelier-des-chercheurs.fr" class="js--openInBrowser" target="_blank">Atelier des Chercheurs</a> avec et pour le <a href="https://www.studiotheatre.fr/" class="js--openInBrowser" target="_blank">Studio-Théâtre de Vitry-sur-Seine</a>.',

      toconnectwithanotherdevice:
        'Pour accéder à do•doc avec un autre appareil, connectez-vous au même réseau wifi puis entrez l’url suivante dans un navigateur web&nbsp;: ',
      toconnectwithanotherdevicetothisfolder:
        'Pour accéder à ce dossier avec un autre appareil, connectez vous au même réseau wifi puis entrez l’url suivante dans un navigateur web&nbsp;: ',
      sureToRemoveFolder: 'Êtes-vous sûr de vouloir supprimer ce dossier ?',
      sureToRemoveMedia: 'Êtes-vous sûr de vouloir supprimer ce média ?',

      create_a_folder: 'Créer un dossier',
      edit_the_media: 'Éditer le média',
      edit_folder: 'Éditer le dossier',

      capture: 'Capture',
      currently: 'Actuellement',

      more_information:
        'Pour plus d’information, consultez la <a href="https://latelier-des-chercheurs.fr/docs/manuel-dodoc" class="js--openInBrowser" target="_blank">documentation</a> ou <a href="mailto:info@latelier-des-chercheurs.fr?subject=do•doc" class="js--openInBrowser" target="_blank">contactez</a> les auteurs de ce logiciel.',
      no_media_in_folder: 'Aucun média dans ce dossier.',
      no_public_media_in_folder: 'Aucun média public dans ce dossier.',
      auto_scroll: 'défilement<br>automatique',
      scale: 'échelle&nbsp;:',
      scale_items: {
        second: 'sec',
        minute: 'min',
        hour: 'h',
        half_day: '½j',
        day: 'j'
      },
      contents_are_stored: 'Les contenus de ce dossier sont enregistrés dans ',
      folder_information: 'Informations du dossier',
      calendar: 'Calendrier',
      now: 'en ce moment',
      list: 'Liste',
      fullscreen: 'Plein écran',
      preview: 'Aperçu',
      filter: 'Filtre',

      export_folder: 'Exporter en format WEB',
      export: 'Exporter',

      last_modified: 'Dernière modification',
      remote_access: 'Accès depuis d’autres appareils',

      notifications: {
        file_was_sent: 'Le fichier a été envoyé.',
        file_upload_not_allowed:
          'Votre navigateur web ne prend pas en charge l’envoi de fichiers.',
        connection_active: 'La connexion au serveur est active.',
        connection_lost: 'La connexion au serveur a été perdue.',
        contents_wont_be_editable:
          'Les modifications et ajouts ne seront plus pris en compte.',
        connection_error: 'La connexion au serveur n’a pu se faire.',
        'wrong_password_for_folder:':
          'Le password n’est pas le bon pour le dossier&nbsp;:',
        'created_edited_media:':
          'Création ou édition d’un média pour le dossier&nbsp;:',
        folder_name_exists:
          'Ce nom de dossier existe déjà, utilisez-en un autre.',
        folder_name_needs_alphanumeric_characters:
          'Les noms de dossier doivent contenir au moins un caractère alphanumérique.',
        'failed_to_get_folder:': 'Le dossier suivant n’a pas été trouvé:',
        failed_to_start_video_change_source_or_res:
          'Le flux vidéo n’a pas pu être démarré.\nEssayez de modifier la source ou la résolution dans les réglages.',
        video_source_not_set: 'La source vidéo n’a pas été trouvée.',
        failed_to_start_audio_change_source:
          'Le flux audio n’a pas pu être démarré.\nEssayez de modifier la source dans les réglages.',
        audio_source_not_set: 'La source audio n’a pas été trouvée.',
        video_stream_not_available:
          'Erreur : le flux vidéo n’est pas disponible.'
      }
    },
    en: {
      ascending: 'Ascending',
      descending: 'Descending',
      create_a_folder: 'Create a folder',
      name: 'Name',
      created_date: 'Created date',
      sent_date: 'Sent date',
      for_the_placement_on_timeline: '(used for the position on the timeline)',
      type: 'Type',
      color: 'Color',
      keywords: 'Keywords',
      author: 'Author(s)',
      zoom: 'Zoom',
      download: 'Download',
      caption: 'Caption',
      date: 'Date',

      loading: 'loading',
      open: 'Open',
      save: 'Save',
      edit: 'Edit',
      print: 'Print',
      create: 'Create',
      remove: 'Remove',
      password: 'Mot de passe',
      protected_by_pass: 'protected by password',
      password_instructions:
        'If set, only users with the password will be able to edit this folder and access the content that’s not public.',

      sort_by: 'Sort by',
      in_the_order: 'In the order',
      public: 'Public',
      fav: 'Favourite',
      content: 'Content',

      'lang:': 'Select lang:',
      lang: 'Select lang',

      photo: 'picture',
      video: 'video',
      stopmotion: 'stop motion',
      audio: 'sound',

      credits:
        'A free and open-source app made by l’<a href="https://latelier-des-chercheurs.fr" class="js--openInBrowser" target="_blank">Atelier des Chercheurs</a> with and for the <a href="https://www.studiotheatre.fr/" class="js--openInBrowser" target="_blank">Studio-Théâtre de Vitry-sur-Seine</a>.',

      toconnectwithanotherdevice:
        'To access do•doc with another device, connect to the same wifi network and type this adress in your browser:',
      toconnectwithanotherdevicetothisfolder:
        'To access this folder in do•doc with another device, connect to the same wifi network and type this adress in your browser:',
      sureToRemoveFolder: 'Do you really want to delete this folder?',
      sureToRemoveMedia: 'Do you really want to delete this media?',

      create_a_folder: 'Create a folder',
      edit_the_media: 'Edit media',
      edit_folder: 'Edit folder',

      capture: 'Capture',
      currently: 'Now',

      more_information:
        'For more informations, read the <a href="https://latelier-des-chercheurs.fr/docs/manuel-dodoc" class="js--openInBrowser" target="_blank">documentation (in french)</a> or <a href="mailto:info@latelier-des-chercheurs.fr?subject=do•doc" class="js--openInBrowser" target="_blank">contact</a> the creators of this app.',

      no_media_in_folder: 'No media in this folder.',
      no_public_media_in_folder: 'No public media in this folder.',
      auto_scroll: 'autoscroll',
      scale: 'scale:',
      scale_items: {
        second: 'sec',
        minute: 'min',
        hour: 'h',
        half_day: '½d',
        day: 'd'
      },
      contents_are_stored: 'Contents for this folder are stored in ',
      folder_information: 'Folder information',
      calendar: 'Calendar',
      now: 'now',
      list: 'List',
      fullscreen: 'Fullscreen',
      preview: 'Preview',
      filter: 'Filter',

      export_folder: 'Export as a webpage',
      export: 'Export',

      last_modified: 'Last modified',
      remote_access: 'Acces from other devices',

      notifications: {
        file_was_sent: 'The file was sent.',
        file_upload_not_allowed: 'File upload is not allowed by this browser.',
        connection_active: 'The connection to the server is active.',
        connection_lost: 'The connection to the server was lost.',
        contents_wont_be_editable: 'Content editing is disabled.',
        connection_error:
          'The connection to the server could not be established.',
        'wrong_password_for_folder:': 'Wrong password or folder missing for:',
        'created_edited_media:':
          'A media has been created or edited in folder:',
        folder_name_exists: 'Folder name already exists. Please use another.',
        folder_name_needs_alphanumeric_characters:
          'Folder names need to contain at least one alphanumeric character.',
        'failed_to_get_folder:': 'Failed to get the requested folder:',
        failed_to_start_video_change_source_or_res:
          'Failed to start camera feed. Try changing the source or the resolution.',
        video_source_not_set: 'The source video has not been set.',
        failed_to_start_audio_change_source:
          'Failed to start audio feed. Try changing the source.',
        audio_source_not_set: 'The source audio has not been set.',
        video_stream_not_available: 'Error: Video stream not available.'
      }
    }
  };

  return messages;
})();
