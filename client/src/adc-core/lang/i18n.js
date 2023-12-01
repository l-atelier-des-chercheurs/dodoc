import Vue from "vue";
import VueI18n from "vue-i18n";

export default function () {
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

  i18n.changeLocale = (new_lang) => {
    import(
      /* webpackChunkName: "lang-[request]" */ `@/adc-core/lang/${new_lang}.js`
    ).then((messages) => {
      i18n.locale = new_lang;
      document.querySelector("html").setAttribute("lang", new_lang);
      i18n.setLocaleMessage(new_lang, messages.default);
      localStorage.setItem("language", new_lang);
    });
  };
  i18n.changeLocale(lang_settings.current);

  return i18n;
}
