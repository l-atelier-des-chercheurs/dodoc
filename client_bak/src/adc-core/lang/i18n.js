import Vue from "vue";
import VueI18n from "vue-i18n";

let changeLocale;
let findMissingTranslations;

const i18n = () => {
  Vue.use(VueI18n);

  let lang_settings = {
    available: ["fr", "en", "de", "nl", "oc"],
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

  const i18n = new VueI18n({
    locale: lang_settings.current, // set locale
    fallbackLocale: "en",
    silentFallbackWarn: true,
  });

  changeLocale = async (new_lang) => {
    const messages = await import(
      /* webpackChunkName: "lang-[request]" */ `@/adc-core/lang/${new_lang}.js`
    );
    i18n.locale = new_lang;
    document.querySelector("html").setAttribute("lang", new_lang);
    i18n.setLocaleMessage(new_lang, messages.default);
    localStorage.setItem("language", new_lang);
  };
  changeLocale(lang_settings.current);

  findMissingTranslations = async () => {
    let all_translations = {};
    for (const lang of lang_settings.available) {
      try {
        const messages = await import(
          /* webpackChunkName: "lang-[request]" */ `@/adc-core/lang/${lang}.js`
        );
        all_translations[lang] = messages.default;
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
