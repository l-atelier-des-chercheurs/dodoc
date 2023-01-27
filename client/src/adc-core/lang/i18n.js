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
        hello: "bonjour monde",
        edit: "modifier",
        caption: "légende",
        date_created: "date de création",
        date_modified: "dernière modification",
        date_uploaded: "date d’envoi",
        cancel: "annuler",
        select: "Sélectionner",
        back: "retour",
        save: "enregistrer",
        description: "description",
        no_description: "Pas de description",
        keywords: "Mots-clés",
        add: "ajouter",
        access: "accéder",
        title: "titre",
        name: "nom",
        name_of_instance: "Nom de l’instance",
        name_of_instance_instructions: `Par exemple, <i>Documentation du fablab</i>, <i>do•doc de la classe de C</i>, etc.
          Apparaîtra dans l’onglet du navigateur sur la page d’accueil et dans la barre de navigation.`,
        presentation_of_instance: "Présentation de l’instance",
        presentation_of_instance_instructions: `
          Apparaîtra sur la page d’accueil uniquement.
          `,
        general_password: "mot de passe général",
        general_password_instructions: `Limiter l’accès aux projets aux visiteurs munies de ce mot de passe. La page d’accueil restera cependant accessible et 
        peut afficher un email de contact pour faire une demande d’accès, si besoin. Laisser le champ vide pour que l’accès soit ouvert à tou·te·s.`,
        general_password_modal_text: `Un mot de passe est nécessaire pour accéder aux projets créés sur cette plate-forme. 
        Si vous ne possédez pas de mot de passe, contactez-nous ici :`,

        connection_lost: `Connexion perdue`,
        connection_lost_reload_to_reconnect: `La connexion s’est interrompue… Vous pouvez tenter de recharger la page pour vous reconnecter.<br>Si vous rencontrez souvent cette erreur, contactez `,
        reload_page: "Recharger cette page",
        create_page: "Ajouter une page",

        contactmail_of_instance: `Adresse e-mail de contact`,
        contactmail_of_instance_instructions: `Indiqué aux visiteurs comme adresse à utiliser pour obtenir plus d’informations, récupérer un compte dont le mot de passe a été oublié ou demander le mot de passe d’accès.`,

        ui_lang_select: "Langue de l’interface",
        lang_updated: "La langue a été mise à jour",

        signup_password: "mot de passe pour la création d’un compte",
        signup_password_instructions:
          "Limiter la création de compte (et donc de projets) aux personnes munis de ce mot de passe. Laisser le champ vide pour que toutes les personnes qui accèdent puissent se créer un compte et publier des contenus.",

        login: "se connecter",
        logout: "se déconnecter",
        name_or_pseudonym: "nom ou pseudonyme",
        contributors: "Contributeur·rice·s",
        contributor: "Contributeur·rice",
        admin: "Administrateur·rice",
        create: "créer",
        create_account: "créer un compte",
        your_account: "votre compte",
        new_account: "nouveau compte",
        show_list: "Afficher la liste",
        list_of_contributors: "Liste des contributeur·rice·s",
        upload_from_device: "Importer une image",

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
        page_spreads: "Pages en vis-à-vis",
        page: "Page",
        spread: "Planche",
        cover: "Couverture",
        backcover: "Quatrième de couverture",
        margins: "Marges",
        margins_instructions:
          "Renseignez ici les repères de marge souhaitez. Les marges seront dessinées avec un trait violet.",
        left: "Gauche",
        right: "Droite",
        top: "En haut",
        bottom: "En bas",
        margins_inside: "Petit fond",
        margins_outside: "Grand fond",

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

        CC: "Creative Commons",
        license: "Licence",
        licence_instructions:
          "Indiquez ici les conditions de réutilisation de votre contenu.",
        files: "Fichiers",
        template: "Gabarit",

        close: "Fermer",
        settings: "Réglages",
        pages: "Liste des pages",
        path_to_content: "Chemin du stockage des contenus",
        path_to_content_instructions: `Attention, fonctionnalité avancée !
          Le chemin ci-dessus indique l’emplacement du dossier qui contient les contenus de do•doc. Si vous modifiez ce chemin, il est très fortement conseillé d’utiliser soit un dossier vide, soit un dossier qui contient uniquement des contenus créés par do•doc. Redémarrez do•doc pour que ce règlage prenne effet.`,

        access_control: "Contrôle des accès",
        storage: "Stockage",

        saving: "Enregistrement…",
        saved: "OK !",
        connected: "Connecté",

        creativecommons_by_nc_sa: "Creative Commons BY NC SA",
        creativecommons_by_nc_sa_explanations: "<i>Explications à ajouter</i>",

        all_rights_reserved: "Tous Droits Réservés",
        all_rights_reserved_explanations: "<i>Explications à ajouter</i>",

        drop_here: "Déposer ici",

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

        take_picture: "Prendre une photo",
        delay: "Retardateur",
        timelapse: "time-lapse",
        framerate: "images par seconde",
        stop_recording: "Arrêter la capture",
        pause_recording: "Mettre en pause",
        unpause_recording: "Relancer l’enregistrement",
        record_audio: "Capturer un son",
        record_video: "Capturer une vidéo",
        stopmotion: "animation",
        with_sound: "avec le son",
        update: "Mettre à jour",
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
        echoCancellation: "Suppression de l'écho",
        noiseSuppression: "Réduction du bruit",
        grid: "Grille",
        gridstep: "Pas de la grille",
        zoom: "Zoom",
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
        project_title_instructions:
          "Le titre est affiché ici et sur la page d’accueil.",
        project_desc_instructions:
          "La description est affichée ici et sur la page d’accueil.",
        add_authors: "Ajouter des contributeur·rice·s",

        or_paste_an_image: "Ou coller une image depuis le presse-papier",
        "notifications.no_image_in_clipboard":
          "Votre presse-papier ne contient pas d’images",
        "notifications.project_was_removed": "Ce projet vient d’être supprimé",

        more_infos: "Plus d’informations",
        informations: "Informations",

        duplicate: "Dupliquer",
        remove: "Supprimer",
        remove_project: "Supprimer le projet",
        remove_media: "Supprimer le média",
        confirm_removal: "Confirmer la suppression",
        move_up: "Remonter",
        move_down: "Descendre",
        source_project: "Projet source",

        current: "Actuel",
        save_on_this_device: "Sauvegarder pour cet appareil",
        will_use_cookies: "Cette fonctionnalité utilise les cookies",

        "module.label.text": "Bloc de texte",
        "module.label.mosaic": "Mosaïque de médias",
        "module.label.carousel": "Caroussel",
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
