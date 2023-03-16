import VueI18n from "vue-i18n";
import Vue from "vue";
import localstore from "store";

export default function () {
  Vue.use(VueI18n);

  let lang_settings = {
    available: ["fr", "en", "de", "nl", "oc"],
    default: "en",
    current: "",
    init: function () {
      let localstore_lang = localstore.get("language");

      // // force lang to french
      // this.current = 'fr';
      // return;

      if (localstore_lang !== undefined) {
        if (this.available.includes(localstore_lang)) {
          this.current = localstore_lang;
        }
      }

      if (this.current === "") {
        // set current lang from window.navigator.language
        // window.navigator.language can be 'fr', 'en', or 'fr-FR'
        let browser_lang_available = this.available.find((l) => {
          return window.navigator.language.includes(l);
        });
        this.current = browser_lang_available
          ? browser_lang_available
          : this.default;
      }
    },
  };
  lang_settings.init();

  const i18n = new VueI18n({
    locale: lang_settings.current, // set locale
    fallbackLocale: "en",
    messages: {
      fr: {
        welcome_to_dodoc: "Bienvenue sur do•doc !",
        home: "Accueil",
        admins_edit_text_here:
          'Pour commencer, créez un compte admin en cliquant sur "se connecter" en haut à droite, puis cliquez sur le boutton "Réglages" ci-dessous.',
        edit: "modifier",
        stop_edit: "Arrêter les modifications",
        caption: "légende",
        date_created: "date de création",
        date_modified: "dernière modification",
        date_uploaded: "date d’envoi",
        cancel: "annuler",
        select: "Sélectionner",
        back: "retour",
        save: "enregistrer",
        save_as_favorite: "Enregistrer en favori",

        description: "description",
        no_description: "Pas de description",
        keywords: "Mots-clés",
        add: "ajouter",
        access: "accéder",
        title: "titre",
        name: "nom",
        name_of_instance: "Nom de l’instance",
        name_of_instance_instructions: `Par exemple, <b>Documentation du fablab de Malakoff</b>, <b>do•doc de la classe de CM</b>, etc.
          Apparaîtra dans l’onglet du navigateur sur la page d’accueil et dans la barre de navigation.`,
        presentation_of_instance: "Présentation de l’instance",
        presentation_of_instance_instructions: `
          Apparaîtra sur la page d’accueil uniquement.
          `,
        general_password: "mot de passe général",
        general_password_instructions: `Limiter l’accès aux projets aux visiteurs munis de ce mot de passe. La page d’accueil restera cependant accessible et 
        peut afficher un email de contact pour faire une demande d’accès, si besoin. Laisser le champ vide pour que l’accès soit ouvert à tou·te·s.`,
        general_password_modal_text: `Un mot de passe est nécessaire pour accéder aux projets créés sur cette plate-forme. 
        Si vous ne possédez pas de mot de passe, contactez-nous ici :`,

        submitted_password_is_wrong: "Mot de passe erroné",
        account_doesnt_exist: "Ce compte n’existe pas",
        submit: "Valider",

        connection_lost: `Connexion perdue`,
        connection_lost_reload_to_reconnect: `La connexion s’est interrompue… Vous pouvez tenter de recharger la page pour vous reconnecter.<br>Si vous rencontrez souvent cette erreur, contactez `,
        reload_page: "Recharger cette page",
        create_page: "Ajouter une page",
        add_on_page: "Ajouter sur la page",
        page_color: "Couleur de cette page",
        position: "Position",
        media: "Média",
        active_media_instr:
          "Retrouvez ici les informations sur le média sélectionné dans la page actuelle.",

        contactmail_of_instance: `Adresse e-mail de contact`,
        contactmail_of_instance_instructions: `Indiqué aux visiteurs comme adresse à utiliser pour obtenir plus d’informations, récupérer un compte dont le mot de passe a été oublié ou demander le mot de passe d’accès.`,

        ui_lang_select: "Langue de l’interface",
        lang_updated: "La langue a été mise à jour",

        signup_password: "mot de passe pour la création d’un compte",
        signup_password_instructions:
          "Limiter la création de compte (et donc de projets) aux personnes munies de ce mot de passe. Laisser le champ vide pour que toutes les personnes qui accèdent puissent se créer un compte et publier des contenus.",

        login: "se connecter",
        logout: "se déconnecter",
        name_or_pseudonym: "Nom ou pseudonyme",
        email: "Courriel",
        password: "Mot de passe",
        role: "Rôle",
        contributors: "Contributeur·rice·s",
        contributor: "Contributeur·rice",
        admin: "Administrateur·rice",
        create: "créer",
        existing: "Existant",
        create_account: "créer un compte",
        your_account: "votre compte",
        new_account: "nouveau compte",
        show_list: "Afficher la liste",
        show: "Afficher",
        hide: "Masquer",
        list_of_contributors: "Liste des contributeur·rice·s",
        upload_from_device: "Importer une image",
        device: "Appareil",
        audioinput: "Entrée audio",
        audiooutput: "Sortie audio",

        import: "Importer",
        waiting: "À venir",
        sending: "En cours",
        sent: "Envoyé",
        retry: "Réessayer",

        import_instructions: "Importer depuis un autre appareil",
        show_meta: "Afficher les métadonnées",
        hide_meta: "Masquer les métadonnées",
        show_description: "Afficher la description",
        hide_description: "Masquer la description",
        recover_password: "Récupérer mon de passe",

        visibility: "Visibilité",
        visibility_text: `Indiquez ici l’état d’avancement du projet et qui pourra le consulter.`,

        publications: "Publications",
        back_to_publications: "Retour aux publications",

        story: "Récit",
        page_by_page: "Document page à page",
        cartography: "Cartographie",
        export: "Exporter",
        share: "Partager",
        exports_in_progress: "Exportation(s) en cours",

        format: "Format",
        format_instructions:
          "Sélectionnez un format ou définissez les dimensions de la page, en centimètres.",
        A4_portrait: "A4 en portrait",
        A4_landscape: "A4 en paysage",
        A5_portrait: "A5 en portrait",
        A5_landscape: "A5 en paysage",
        custom: "Personnalisé",
        width: "Largeur",
        height: "Hauteur",
        text_size: "Taille du texte",
        background_color: "Couleur du fond",
        outline_width: "Épaisseur du contour",
        outline_color: "Couleur du contour",
        custom_color: "Couleur personnalisée",
        z_index: "Ordre d’empilement",
        move_to_front: "Premier-plan",
        move_to_back: "Arrière-plan",
        fullscreen: "Plein-écran",
        exit_fullscreen: "Quitter le plein-écran",

        opacity: "Opacité",
        page_spreads: "Pages en vis-à-vis",
        page: "Page",
        lock: "Verrouiller",
        unlock: "Déverrouiller",
        page_options: "Options de page",
        spread: "Planche",
        cover: "Couverture",
        backcover: "Quatrième de couverture",
        margins: "Marges",
        margins_instructions:
          "Renseignez ici les repères de marge souhaités, en centimètres. Les marges seront dessinées avec un trait violet.",
        pagination_instructions:
          "Indiquez ici les règlages souhaités pour l’affichage du numéro de la page.",
        pagination_instructions_spread:
          "Habituellement, les pages de gauche d'un livre sont les pages paires et les pages de droite sont impaires.",
        distance_to_right: "Distance au bord droit",
        distance_to_bottom: "Distance au bord du bas",
        distance_to_outside: "Distance au bord extérieur",

        left: "Gauche",
        right: "Droite",
        top: "En haut",
        bottom: "En bas",
        margins_inside: "Petit fond (intérieur)",
        margins_outside: "Grand fond (extérieur)",
        pagination: "Pagination",
        pagn_starts_on_page: "Le décompte de page démarre à la page",
        hide_pagination: "Masquer la pagination",
        hide_pagination_instr: "Concerne uniquement cette page",
        border_radius: "Coins arrondis",
        photo: "Photo",
        remove_this_image: "Supprimer cette image",
        erase: "Effacer",

        status: "État",
        list_of_projects: "Liste des projets",
        no_projects: "Aucun projet à afficher",
        draft: "Brouillon",
        draft_status_explanations:
          "Le projet apparaîtra dans la section <i>brouillon</i> sur la page d’accueil.",
        listed: "Listé",
        invisible: "Invisible",
        visible_status_explanations_projects:
          "Le projet sera affiché avec les autres projets.",
        invisible_status_explanations_projects:
          "Le projet ne sera pas affiché avec les autres projets, il sera uniquement accessible à ses auteurs et aux personnes qui possèdent le lien.",
        visible_status_explanations_publis:
          "La publication sera visible par tous ceux qui accèdent au projet.",
        invisible_status_explanations_publis:
          "La publication ne sera visible qu’aux auteurs du projet.",

        invisible_nonauthor_projects: "Projets invisibles d’autres comptes",
        finished: "Finalisé",
        my_projects: "Mes projets",

        finished_projects: "Projets finalisés",
        projects_in_progress: "Projets en cours",

        default_value: "Par défaut",

        finished_status_explanations:
          "Ce projet sera affiché en haut de la page d’accueil.",

        show_projects: "Afficher les projets",
        no_accounts_yet: "Aucun compte de contributueur créé pour le moment",
        restart_to_apply: "Relancez do•doc pour appliquer",
        restart: "Relancer do•doc",
        reveal: "Révéler",
        choose_a_pane: "Choisissez un panneau ci-dessus pour démarrer !",
        download: "Télécharger",

        medias: "Médias",
        no_media_in_project: "Aucun média dans ce projet",
        number_of_media: "Nombre de médias",
        media_removed: "Média supprimé",
        media_duplicated: "Média dupliqué",

        CC: "Creative Commons",
        license: "Licence",
        licence_instructions:
          "Indiquez ici les conditions de réutilisation de votre contenu.",
        files: "Fichiers",
        template: "Gabarit",

        close: "Fermer",
        settings: "Réglages",
        list_of_pages: "Liste des pages",
        list_of_spreads: "Liste des planches",
        show_grid: "Afficher la grille",
        snap_to_grid: "Magnétisme de la grille",
        gridstep: "Pas de la grille",
        scale: "Échelle",
        list_of_medias: "Liste des médias",
        list_of_medias_instr:
          "Cette liste recense tous les médias présents sur cette page. Cliquez sur l’un d’eux pour afficher son emplacement et ses propriétés.",

        path_to_content: "Chemin du stockage des contenus",
        path_to_content_instructions: `Attention, fonctionnalité avancée !
          Le chemin ci-dessus indique l’emplacement du dossier qui contient les contenus de do•doc. Si vous modifiez ce chemin, il est très fortement conseillé d’utiliser soit un dossier vide, soit un dossier qui contient uniquement des contenus créés par do•doc. Redémarrez do•doc pour que ce règlage prenne effet.`,

        access_control: "Contrôle des accès",
        storage: "Stockage",

        make_a_video: "Fabriquer une vidéo",
        video_assemblage: "Montage vidéo",
        video_assemblage_summary:
          "Créer un montage vidéo à partir d’images et de vidéos.",
        video_assemblage_instructions:
          "Cette recette propose de créer un montage vidéo en mettant plusieurs vidéos ou images bout à bout.<br> Médias acceptés : des vidéos et des images.<br>Créera une nouvelle vidéo.",

        video_effects: "Effets vidéo",
        video_effects_summary: "Appliquer des effets et filtres sur une vidéo.",
        video_effects_instructions:
          "Liste des effets et filtres disponibles : noir et blanc, ralenti, accéléré, inversion de la lecture, rotation et miroir.<br>Média accepté : une seule vidéo.",
        effect: "Effet",
        black_and_white: "Noir et blanc",
        white: "Blanc",
        black: "Noir",
        transparent: "Transparent",

        space: "Espace",

        watermark: "Habillage",
        watermark_instructions:
          "Sélectionnez une image à placer dans le coin supérieur droit de la vidéo.",
        colored_filter: "Filtre coloré",
        filters_color: "Couleur du filtre",
        slow_down: "Ralentir",
        slowing_video_down_limit:
          "Attention ! La piste audio sera supprimée (si elle existe) car la vitesse souhaitée est trop lente. Pour garder et convertir le son choisissez une vitesse entre 0,5 et 1.",
        speed_up: "Accélérer",
        a_little: "Un peu",
        a_lot: "Beaucoup",
        clockwise: "Dans le sens des aiguilles d’une montre",
        counterclockwise: "Dans le sens inverse des aiguilles d’une montre",
        reverse: "Inverser le début et la fin",
        angle: "Angle",
        "error:": "Erreur&nbsp;:",
        mirror: "Miroir",
        horizontal_flip: "Retournement horizontal",
        vertical_flip: "Retournement vertical",
        both: "Les deux",

        mix_audio_and_image: "Son sur une image",
        mix_audio_and_image_summary: "Ajouter du son sur une image.",
        mix_audio_and_image_instructions:
          "Cette recette prend une image et une piste audio. Elle permet de créer des <i>images parlantes</i>.<br> Médias acceptés : une image et une piste sonore.<br>Créera une vidéo de la durée de la piste sonore.",
        stopmotion_animation: "Animation image par image",
        stopmotion_animation_summary:
          "Assembler des images pour créer une vidéo.",
        stopmotion_animation_instructions:
          "Cette recette permet l’assemblage d’un nombre illimité d’images pour créer une séquence vidéo dans laquelle elles défilent à une vitesse réglable.<br> Médias acceptés : uniquement des images. Les dimensions de la première image détermine si la vidéo finale est en portrait ou paysage.<br>Créera une nouvelle vidéo.",
        mix_audio_and_video: "Son sur une vidéo",
        mix_audio_and_video_summary:
          "Ajouter ou remplacer du son sur une vidéo.",
        mix_audio_and_video_instructions:
          "Cette recette prend une vidéo et une piste audio. Elle ajoute ou remplace la bande sonore de la vidéo avec celle qui est sélectionnée.<br> Médias acceptés : une vidéo et une piste sonore.<br>Créera une nouvelle vidéo de la durée du plus long média.",

        add_sound_video_file:
          "Ouvrez un projet et ajoutez un média <b>son</b> et un média <b>vidéo</b> en cliquant sur la flèche verte.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : une vidéo et une piste sonore.",
        add_sound_image_file:
          "Ouvrez un projet et ajoutez un média <b>son</b> et un média <b>image</b> en cliquant sur la flèche verte.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : une image et une piste sonore.",
        add_multiple_videos_files:
          "Ouvrez un projet et ajoutez plusieurs médias <b>vidéo</b> en cliquant sur la flèche verte. Les vidéos seront mises bout à bout dans l’ordre d’ajout.<br>L’exportation créera une nouvelle vidéo.<br>Médias acceptés : uniquement des vidéos de même taille.",
        add_one_video_file:
          "Ouvrez un projet et ajoutez un média <b>vidéo</b> en cliquant sur la flèche verte.<br>L’exportation créera une nouvelle vidéo.",
        add_multiple_images:
          "Ouvrez un projet et ajoutez plusieurs médias <b>image</b> en cliquant sur la flèche verte. Les images seront mises bout à bout dans l’ordre d’ajout. Exportez la séquence et réglez la vitesse de défilement des images.<br>L’exportation créera una video.<br>Médias acceptés : uniquement des images. Les dimensions de la première image détermine si la vidéo finale est en portrait ou paysage.",
        more_informations: "Plus d’informations",

        make_an_exhibition: "Créer une exposition",

        image_tracking: "Réalité augmentée",
        create_block: "Créer un groupe",
        image_tracking_summary: "",
        image_tracking_instructions: ``,
        target_image: "Image cible",
        create_target: "Compiler les images cibles",
        image_shown: "Image affichée",
        face_masks: "Les masques",
        face_masks_summary: "Créer une galerie de masques interactifs !",
        face_masks_instructions: `Cette recette utilise un gabarit spécifique à imprimer, puis à dessiner et à prendre en photo. 
          Ces dessins seront ensuite projetés sur le visage à l’aide de la caméra frontale d’un smartphone, d’une tablette ou d’un ordinateur.
          <br>Média accepté : des images avec ou sans légende.`,

        saving: "Enregistrement…",
        saved: "OK !",
        connected: "Connecté",
        archives: "Archives",

        creativecommons_by_nc_sa: "Creative Commons BY NC SA",
        creativecommons_by_nc_sa_explanations: "<i>Explications à ajouter</i>",

        all_rights_reserved: "Tous Droits Réservés",
        all_rights_reserved_explanations: "<i>Explications à ajouter</i>",

        drop_here: "Déposer ici",
        enable: "Activer",

        // effets
        effects: "Effets",
        enable_effects: "Activer les effets",
        pick_color_in_video: "Choisir la couleur dans la vidéo",
        "click_in_video…": "Cliquez dans la vidéo…",
        similarity: "Similarité",
        smoothness: "Lissage",
        spill: "Débord",
        replace_color_with: "Remplacer par",
        use_own_risk:
          "Utilisez avec précaution : les médias peuvent devenir invisible dans certains cas !",
        chroma_key: "Incrustation (fond vert)",
        color: "couleur",
        flip_horizontally: "Retourner horizontalement",
        flip_vertically: "Retourner verticalement",
        brightness: "Luminosité",
        contrast: "Contraste",
        hue: "Teinte",
        saturation: "Saturation",
        lightness: "Clarté",
        dotscreen: "Noir et blanc (tramé)",

        copyleft: "Art Libre / Copyleft",
        copyleft_explanations: "<i>Explications à ajouter</i>",

        machines_and_materials: "Machines et matériaux",

        camera: "Camera",
        sources: "Sources",
        "Entire screen": "Écran de l’ordinateur",
        no_stopmotion_created_yet:
          "Les animations créées apparaîtront dans ce panneau.",
        stop_stopmotion: "Arrêter cette animation",
        onion_skin: "Pelure d’oignon",

        pick_a_camera: "Sélectionnez une caméra",
        resolutions: "Résolutions",
        screen_capture: "Capture d’écran",
        cant_pick_resolution_when_screen_capture:
          "La sélection de la résolution n’est pas compatible avec la capture d’écran.",

        take_picture: "Prendre une photo",
        delay: "Retardateur",
        timelapse: "time-lapse",
        framerate: "images par seconde",
        live: "Direct",
        img_per_second: "Images par seconde",

        stop_recording: "Arrêter la capture",
        pause_recording: "Mettre en pause",
        unpause_recording: "Relancer l’enregistrement",
        record_audio: "Capturer un son",
        record_video: "Capturer une vidéo",
        stopmotion: "animation",
        stopmotion_list: "Liste des animations",
        sure_to_cancel_stopmotion:
          "Êtes-vous sûr de vouloir arrêter cette animation ? Vous pourrez la retrouver dans le menu <i>Liste des animations</i>",
        play: "Lire",
        stop: "Stop",
        pause: "Pause",
        first_image: "Première image",
        previous_image: "Image précédente",
        next_image: "Image suivante",
        last_image: "Dernière image",
        assemble: "Assembler",

        with_sound: "avec le son",
        update: "Mettre à jour",
        video: "vidéo",
        audio: "son",
        lines: "lignes",
        vecto: "formes",
        or_download_media_on_device:
          "ou télécharger ce média sur votre appareil",

        interval_between_pictures: "Intervalle entre chaque photo",
        start_timelapse: "Démarrer le time-lapse",
        stop_timelapse: "Interrompre le time-lapse",
        seconds_per_image: "secondes par image",
        quality: "qualité",
        duration: "Durée",

        name_of_stream: "Nom du flux",
        failed_to_start_streams_change_source_or_res:
          "Le flux vidéo ou audio n’a pas pu être démarré.<br>Essayez de modifier la source ou la résolution dans les réglages.",
        failed_to_share_stream: "Le partage du flux n’a pas pu avoir lieu",
        stream_local_mode: "sur cet appareil",
        stream_remote_mode: "do•doc distant",
        "stream_shown:": "Flux utilisé&nbsp;:",
        share_stream: "Partager ce flux",
        "stream_currently_shared_with_name:":
          "Flux vidéo/audio partagé sous le nom&nbsp;:",

        remote_access: "Sources distantes",
        hangup: "raccrocher",
        connect: "Se connecter",
        connect_to_other_users:
          "Accéder à des sources provenant d’autres appareils connectés actuellement à ce do•doc",

        seconds: "secondes",
        no_video_input_available: "Aucune source vidéo disponible",
        no_audio_input_available: "Aucune source audio disponible",
        no_audio_output_available: "Aucune sortie audio disponible",
        echoCancellation: "Suppression de l’écho",
        noiseSuppression: "Réduction du bruit",
        halfs: "Moitiés",
        thirds: "Tiers",
        fourths: "Quarts",
        reload: "Recharger",

        already_added: "Déjà ajouté",
        open: "ouvrir",
        create_and_open: "Créer et ouvrir",
        create_a_project: "Créer un projet",
        create_a_publication: "Créer une publication",

        add_media: "Ajouter un média",
        add_medias: "Ajouter des médias",
        add_text: "Ajouter du texte",

        display_as_public: "Afficher la vue publique",

        project_author_instructions:
          "Ils et elles sont les seuls à pouvoir ajouter, modifier ou supprimer ce projet et ses contenus.",
        space_author_instructions:
          "Ils et elles sont les seuls à pouvoir ajouter, modifier ou supprimer cet espace et ses contenus.",
        project_title_instructions:
          "Le titre est affiché ici et sur la page d’accueil.",
        project_desc_instructions:
          "La description est affichée ici et sur la page d’accueil.",
        add_authors: "Ajouter des contributeur·rice·s",
        ellipsis: "Ellipse",
        rectangle: "Rectangle",
        line: "Ligne",
        arrow: "Flèche",

        or_paste_an_image: "Ou coller une image depuis le presse-papier",
        "notifications.no_image_in_clipboard":
          "Votre presse-papier ne contient pas d’images",
        "notifications.project_was_removed": "Ce projet vient d’être supprimé",

        more_infos: "Plus d’informations",
        informations: "Informations",

        duplicate: "Dupliquer",
        move_to_page: "Déplacer vers une autre page",
        move: "Déplacer",
        unselect: "Déselectionner",
        remove: "Supprimer",
        remove_project: "Supprimer le projet",
        remove_media: "Supprimer le média",
        withdraw_from_page: "Enlever de la page",
        confirm_removal: "Confirmer la suppression",
        move_up: "Remonter",
        move_down: "Descendre",
        source_project: "Projet source",
        media_pickers_instr:
          "Choisissez le nom du projet qui contient les médias que vous souhaitez utiliser. Si les médias appartiennent à un autre projet, ils seront d’abord importés dans le projet actuel.",

        current: "Actuel",
        save_on_this_device: "Sauvegarder pour cet appareil",
        will_use_cookies: "Cette fonctionnalité utilise les cookies",

        "module.label.text": "Bloc de texte",
        "module.label.mosaic": "Mosaïque de médias",
        "module.label.carousel": "Carrousel",
        object_fit_cover: "Remplir le cadre",
        object_fit_contain: "Remplir sans dépasser",

        create_a_module: "Créer un module",
        list_of_archives: "Liste des archives",
        restore_this_version: "Restaurer cette version",

        general_informations: "Informations sur l’instance",

        panes: "Panneaux",
        capture: "Capturer",
        collect: "Collecter",
        remix: "Remixer",
        publish: "Publier",

        remixes_list: "Liste des remixes",

        "instructions.pane.capture":
          "Capturez des images, des vidéos et du sons puis retrouvez les dans le panneau <i>Collecter</i>.",
        "instructions.pane.collect": `Retrouvez ici toutes vos captures. Vous pouvez les légender, les supprimer et les organiser dans des groupes.
          <br />
          Vous pouvez aussi importer des fichiers (photos, vidéos, audios, 3D, PDF ou autre) depuis vos appareils.`,
        "instructions.pane.remix":
          "Recadrez, raccourcissez, assemblez et annotez vos médias.",
        "instructions.pane.publish": `Créez ici des publications : journal du projet, tutoriel, livret, etc.
          <br />
          Elles contiendront du texte et des éléments que vous avez collecté.`,
      },
      en: {
        hello: "hello world",
        edit: "edit",
        caption: "caption",
        date_created: "created date",
        date_modified: "last edited",
        cancel: "cancel",
        save: "save",
        description: "description",
        keywords: "keywords",
        template: "Template",

        ui_lang_select: "Interface language",
        lang_updated: "The lang has been updated",
      },
      de: {},
      nl: {},
      oc: {},
    }, // set locale messages
  });

  return i18n;
}
