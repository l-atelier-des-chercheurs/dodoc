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
        back: "retour",
        save: "enregistrer",
        description: "description",
        keywords: "mots-clés",
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
        general_password_instructions: `Limiter l’accès aux projets aux visiteurs munis de ce mot de passe. La page d’accueil restera cependant accessible et 
        peut afficher un email de contact pour faire une demande d’accès, si besoin. Laisser le champ vide pour que l’accès soit ouvert à tou·te·s.`,
        general_password_modal_text: `Un mot de passe est nécessaire pour accéder aux projets créés sur cette plate-forme. 
        Si vous ne possédez pas de mot de passe, contactez-nous ici :`,

        contactmail_of_instance: `Adresse e-mail de contact`,
        contactmail_of_instance_instructions: `Indiqué aux visiteurs comme adresse à utiliser pour obtenir plus d’informations, récupérer un compte dont le mot de passe a été oublié ou demander le mot de passe d’accès.`,

        ui_lang_select: "Langue de l’interface",

        signup_password: "mot de passe pour la création d’un compte",
        signup_password_instructions:
          "Limiter la création de compte (et donc de projets) aux personnes munis de ce mot de passe. Laisser le champ vide pour que toutes les personnes qui accèdent puissent se créer un compte et publier des contenus.",

        login: "s’identifier",
        logout: "se déconnecter",
        name_or_pseudonym: "nom ou pseudonyme",
        contributors: "Contributeur·rice·s",
        contributor: "Contributeur·rice",
        admin: "Administrateur·rice",
        create: "créer",
        create_account: "créer un compte",
        show_list: "Afficher la liste",
        list_of_contributors: "Liste des contributeur·rice·s",
        upload_from_device: "Importer une image",
        import_instructions: "Importer depuis un autre appareil",
        progress: "État d’avancement",
        draft: "Brouillon",
        draft_status_explanations:
          "Le projet apparaîtra dans la section <i>brouillon</i> sur la page d’accueil.",
        invisible: "Invisible",
        public: "Public",
        public_status_explanations:
          "Le projet sera visible et accessible à tous.",
        not_public_status_explanations:
          "Le projet ne sera visible qu’à ses contributeurs.",
        finished: "Finalisé",
        no_draft_proejcts: "Aucun projet en brouillon pour le moment",
        no_finalized_proejcts: "Aucun projet finalisé pour le moment",
        finished_status_explanations:
          "Ce projet sera affiché en haut de la page d’accueil.",
        show_projects: "Afficher les projets",
        no_accounts_yet: "Aucun compte de contributueur créé pour le moment",
        restart_to_apply: "Relancez do•doc pour appliquer",
        restart: "Relancer do•doc",
        reveal: "Révéler",

        medias: "Médias",
        license: "Licence",
        files: "Fichiers",
        template: "Gabarit",

        close: "Fermer",
        settings: "Réglages",
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

        copyleft: "Art Libre / Copyleft",
        copyleft_explanations: "<i>Explications à ajouter</i>",

        machines_and_materials: "Machines et matériaux",

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
          "Le titre est aussi utilisé sur la page d’accueil.",
        project_desc_instructions:
          "La description est aussi affichée sur la page d’accueil.",
        add_authors: "Ajouter des contributeur·rice·s",

        or_paste_an_image: "Ou coller une image depuis le presse-papier",
        "notifications.no_image_in_clipboard":
          "Votre presse-papier ne contient pas d’images",
        "notifications.project_was_removed": "Ce projet vient d’être supprimé",

        more_infos: "Plus d’informations",
        informations: "Informations",

        duplicate: "Dupliquer",
        remove: "Supprimer",
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

        disconnect_warning:
          "Vous avez été déconnectés. Veuillez recharger la page pour vous reconnecter à do•doc.",
        reload_page: "Recharger cette page",

        create_a_module: "Créer un module",
        list_of_archives: "Liste des archives",
        restore_this_version: "Restaurer cette version",

        "instructions.pane.Capturer":
          "Capturez des images, des vidéos et du sons puis retrouvez les dans le panneau <i>Collecter</i>.",
        "instructions.pane.Collecter": `Retrouvez ici toutes vos captures. Vous pouvez les légender, les supprimer et les organiser dans des groupes.
          <br />
          Vous pouvez aussi importer des fichiers (photos, vidéos, audios, 3D, PDF ou autre) depuis vos appareils.`,
        "instructions.pane.Remixer":
          "Recadrez, raccourcissez, assemblez et annotez vos médias.",
        "instructions.pane.Publier": `Créez ici des publications : journal du projet, tutoriel, livret, etc.
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
      },
      de: {},
      nl: {},
      oc: {},
    }, // set locale messages
  });

  return i18n;
}
