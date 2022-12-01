import VueI18n from "vue-i18n";
import Vue from "vue";
import localstore from "store";

export default function () {
  Vue.use(VueI18n);

  let lang_settings = {
    available: [
      {
        key: "fr",
        name: "Français",
      },
      {
        key: "en",
        name: "English",
      },
      {
        key: "de",
        name: "Deutsch",
      },
      {
        key: "nl",
        name: "Nederlands",
      },
      {
        key: "oc",
        name: "Occitan",
      },
    ],
    default: "en",
    current: "",
    init: function () {
      let localstore_lang = localstore.get("language");

      // // force lang to french
      // this.current = 'fr';
      // return;

      if (localstore_lang !== undefined) {
        if (this.available.find((l) => l.key === localstore_lang)) {
          this.current = localstore_lang;
        }
      }

      if (this.current === "") {
        // set current lang from window.navigator.language
        // window.navigator.language can be 'fr', 'en', or 'fr-FR'
        let browser_lang_available = this.available.find((l) => {
          return window.navigator.language.includes(l.key);
        });
        this.current = browser_lang_available
          ? browser_lang_available.key
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
        title: "titre",
        name: "nom",
        signup: "s’inscrire",
        login: "s’identifier",
        logout: "se déconnecter",
        name_or_pseudonym: "nom ou pseudonyme",
        contributors: "Contributeur·rice·s",
        create: "créer",
        create_account: "créer un compte",
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
        no_finalized_proejcts: "Aucun projet finalisé pour le moment",
        finished_status_explanations:
          "Ce projet sera affiché en haut de la page d'accueil.",
        no_accounts_yet: "Aucun compte de contributueur créé pour le moment",

        medias: "Médias",
        license: "Licence",
        files: "Fichiers",
        template: "Gabarit",

        creativecommons_by_nc_sa: "Creative Commons BY NC SA",
        creativecommons_by_nc_sa_explanations: "<i>Explications à ajouter</i>",

        all_rights_reserved: "Tous Droits Réservés",
        all_rights_reserved_explanations: "<i>Explications à ajouter</i>",

        copyleft: "Art Libre / Copyleft",
        copyleft_explanations: "<i>Explications à ajouter</i>",

        machines_and_materials: "Machines et matériaux",

        already_added: "Déjà ajouté",
        create_and_open: "Créer et ouvrir",
        create_a_project: "Créer un projet",
        create_a_publication: "Créer une publication",

        or_paste_an_image: "Ou coller une image depuis le presse-papier",
        "notifications.no_image_in_clipboard":
          "Votre presse-papier ne contient pas d'images",
        "notifications.project_was_removed": "Ce projet vient d’être supprimé",

        more_infos: "Plus d’informations",
        informations: "Informations",

        remove: "Supprimer",
        move_up: "Remonter",
        move_down: "Descendre",
        source_project: "Projet source",

        "module.label.text": "Bloc de texte",
        "module.label.mosaic": "Mosaïque de médias",
        "module.label.carousel": "Caroussel",

        disconnect_warning:
          "Vous avez été déconnectés. Veuillez recharger la page pour vous reconnecter à do•doc.",
        reload_page: "Recharger cette page",
        type_of_module: "Type de module",

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
      },
    }, // set locale messages
  });

  return i18n;
}
