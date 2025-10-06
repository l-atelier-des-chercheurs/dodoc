import Vue from "vue";
import VueI18n from "vue-i18n";

let changeLocale;
let findMissingTranslations;

const i18n = () => {
  Vue.use(VueI18n);

  let lang_settings = {
    available: ["fr", "en", "it", "fon"],
    default: "en",
    current: "",
    init: function () {
      let localstore_lang = localStorage.getItem("language");

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

  const loadLangageFile = async (lang) => {
    let content = null;
    if (lang === "fr") content = await import("@/adc-core/lang/fr.js");
    else if (lang === "it") content = await import("@/adc-core/lang/it.js");
    // else if (lang === "fon") content = await import("@/adc-core/lang/fon.js");
    else content = await import("@/adc-core/lang/en.js");
    return content.default;
  };

  const i18n = new VueI18n({
    locale: lang_settings.current, // set locale
    fallbackLocale: {
      fon: ["fr"],
      default: ["en"],
    },
  });

  const loadLangAsDefault = async (lang) => {
    const lang_file = await loadLangageFile(lang);
    i18n.setLocaleMessage(lang, lang_file);
  };

  changeLocale = async (new_lang) => {
    const messages = await loadLangageFile(new_lang);
    i18n.locale = new_lang;
    document.querySelector("html").setAttribute("lang", new_lang);
    i18n.setLocaleMessage(new_lang, messages);
    localStorage.setItem("language", new_lang);

    // lang fr is always up to date – others, not so much. Load english as default
    if (["it"].includes(new_lang)) await loadLangAsDefault("en");
    // if (["fon"].includes(new_lang)) await loadLangAsDefault("fr");
  };
  changeLocale(lang_settings.current);

  findMissingTranslations = async () => {
    let all_translations = {};
    for (const lang of lang_settings.available) {
      try {
        all_translations[lang] = await loadLangageFile(lang);
      } catch (e) {
        e;
      }
    }
    const all_translations_by_id = Object.entries(all_translations).reduce(
      (acc, [lang, messages]) => {
        const all_messages = Object.entries(messages);
        all_messages.map(([id, translation]) => {
          if (!acc[id]) acc[id] = {};
          acc[id][lang] = translation;
        });
        return acc;
      },
      {}
    );
    return all_translations_by_id;
    // return "plop";
  };

  return i18n;
};

export { i18n, changeLocale, findMissingTranslations };
