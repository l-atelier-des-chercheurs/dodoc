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
        date_created: "création",
      },
      en: {
        hello: "hello world",
        edit: "edit",
        caption: "caption",
        date_created: "created",
      },
    }, // set locale messages
  });

  return i18n;
}
