/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from "vue";

import localstore from "store";
import _ from "underscore";
Object.defineProperty(Vue.prototype, "$_", { value: _ });

import alertify from "alertify.js";
Vue.prototype.$alertify = alertify;

import auth from "../adc-core/auth-client.js";
auth.init();
Vue.prototype.$auth = auth;

import locale_strings from "./locale_strings.js";

import "prismjs";

// Vue.config.silent = false;
// Vue.config.devtools = true;

Vue.prototype.$eventHub = new Vue(); // Global event bus

import PortalVue from "portal-vue";
Vue.use(PortalVue);

import VueI18n from "vue-i18n";
Vue.use(VueI18n);

import VuePlyr from "vue-plyr";
Vue.use(VuePlyr);

import VueTippy, { TippyComponent } from "vue-tippy";

Vue.use(VueTippy);
Vue.component("tippy", TippyComponent);

import DateFieldComponent from "./components/subcomponents/DateField.vue";
Vue.component("DateField", DateFieldComponent);

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

    // has lang set
    if (localstore_lang !== undefined) {
      // exists in available
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

import moment from "moment";
import "moment/locale/fr";
import "moment/locale/en-gb";
import "moment/locale/nl";
import "./moment_locale_oc.js";

moment.locale(lang_settings.current);
Vue.prototype.$moment = moment;

Vue.prototype.$loadScript = function (src) {
  return new Promise(function (resolve, reject) {
    if (document.querySelector('script[src="' + src + '"]')) {
      resolve();
      return;
    }

    const el = document.createElement("script");

    el.type = "text/javascript";
    el.async = true;
    el.src = src;

    el.addEventListener("load", resolve);
    el.addEventListener("error", reject);
    el.addEventListener("abort", reject);

    document.head.appendChild(el);
  });
};

const html = document.documentElement; // returns the html tag
html.setAttribute("lang", lang_settings.current);

// tweak locale_strings to fit vuei18n pattern
let messages = {};
Object.entries(locale_strings).map(([key, translations]) => {
  Object.entries(translations).map(([lang_code, translation]) => {
    if (typeof translation === "object") {
      const key2 = lang_code;
      const translations = translation;

      Object.entries(translations).map(([lang_code, translation]) => {
        if (!messages[lang_code].hasOwnProperty(key))
          messages[lang_code][key] = {};
        if (!messages[lang_code][key].hasOwnProperty(key2))
          messages[lang_code][key][key2] = {};
        messages[lang_code][key][key2] = translation;
      });
      // Object.entries(translation).map(([key2, translation2]) => {
      //   if (!messages[lang_code][key].hasOwnProperty(key2))
      //     messages[lang_code][key][key2] = {};
      //   messages[lang_code][key][key2][lang_code] = translation2;
      // });
    } else {
      if (!messages.hasOwnProperty(lang_code)) messages[lang_code] = {};
      if (!messages[lang_code].hasOwnProperty(key))
        messages[lang_code][key] = {};
      messages[lang_code][key] = translation;
    }
  });
});

// check for missing lang
const lang_keys = lang_settings.available.map((l) => l.key);

var get_missing_langs = function ({ translation_slug, items }) {
  let list = [];
  const missing_lang = lang_keys.filter((k) => !Object.keys(items).includes(k));
  if (missing_lang.length > 0) {
    missing_lang.map((lang) => {
      list.push({ lang, translation_slug });
    });
  }
  return list;
};

// const missing_translations = Object.entries(locale_strings).reduce(
//   (acc, [translation_slug, items]) => {
//     if (typeof Object.values(items)[0] === "object") {
//       const list = Object.entries(items).reduce(
//         (acc, [translation_slug, items]) => {
//           const list = get_missing_langs({ translation_slug, items });
//           if (list.length > 0) {
//             acc = acc.concat(list);
//           }
//           return acc;
//         },
//         []
//       );
//       if (list.length > 0) {
//         acc = acc.concat(list);
//       }
//     } else {
//       const list = get_missing_langs({ translation_slug, items });
//       if (list.length > 0) {
//         acc = acc.concat(list);
//       }
//     }
//     return acc;
//   },
//   []
// );

// Create VueI18n instance with options
let i18n = new VueI18n({
  locale: lang_settings.current, // set locale
  fallbackLocale: "en",
  messages, // set locale messages
});

/** *********
  SOCKETIO
***********/

import custom_socketio from "../adc-core/custom-socketio.js";
Vue.prototype.$socketio = custom_socketio.init(i18n, auth, alertify);

import App from "./App.vue";

let vm = new Vue({
  // eslint-disable-line no-new
  i18n,
  el: "#app",
  components: { App },
  template: `
    <App
    />
  `,
  data: {
    store: window.store,
    state: window.state,

    justCreatedFolderID: false,
    justCreatedMediaID: false,

    currentTime: "",
    app_is_fullscreen: false,

    do_navigation: {
      view: "ListView",
      current_slugProjectName: false,
    },
    media_modal: {
      open: false,
      minimized: false,
      show_sidebar: true,
      current_slugProjectName: false,
      current_metaFileName: false,
    },
    showSessionPasswordModal: false,
    showAuthorsListModal: false,

    // persistant, par device (dans le localstorage)
    settings: {
      has_modal_opened: false,
      capture_mode_cant_be_changed: false,

      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,

      url_queries: {},

      capture_options: {
        selected_mode: "",
        selected_devicesId: {
          audioinput: "",
          videoinput: "",
          audiooutput: "",
        },
        ideal_camera_resolution: {
          name: "",
          width: "",
          height: "",
        },

        distant_flux: {
          active: false,
          username: `dodoc-${(
            Math.random().toString(36) + "00000000000000000"
          ).slice(2, 3 + 2)}`,
          callee_username: "",
        },
      },

      current_publication: {
        slug: false,
        page_id: false,
        layer_id: false,
        accepted_media_type: [],
      },

      current_chat: {
        slug: false,
      },

      current_author_slug: false,

      publi_zoom: 0.8,

      show_publi_panel: false,
      show_chat_panel: false,

      enable_system_bar: window.state.is_electron && window.state.is_darwin,

      project_filter: {
        keyword: "",
        author: "",
        name: "",
      },
      media_filter: {
        keyword: "",
        author: "",
        fav: false,
        type: "",
      },
      opened_folder: false,
    },
    lang: {
      available: lang_settings.available,
      current: lang_settings.current,
    },
  },
  created() {
    if (window.state.dev_mode === "debug") console.log("ROOT EVENT: created");

    if (this.store.request.display === "standalone") return false;

    if (this.settings.enable_system_bar)
      document.body.classList.add("has_systembar");

    if (window.state.dev_mode === "debug")
      console.log("ROOT EVENT: created / checking for password");

    if (window.location.search.length > 1) {
      for (
        var aItKey,
          nKeyId = 0,
          aCouples = window.location.search.substr(1).split("&");
        nKeyId < aCouples.length;
        nKeyId++
      ) {
        aItKey = aCouples[nKeyId].split("=");
        this.settings.url_queries[unescape(aItKey[0])] =
          aItKey.length > 1 ? unescape(aItKey[1]) : "";
      }
    }

    document.addEventListener("fullscreenchange", this.detectFullScreen);
    document.addEventListener("mozfullscreenchange", this.detectFullScreen);
    document.addEventListener("webkitfullscreenchange", this.detectFullScreen);
    window.addEventListener("resize", () => {
      this.settings.windowWidth = window.innerWidth;
      this.settings.windowHeight = window.innerHeight;
    });

    this.currentTime = this.$moment().millisecond(0);
    setInterval(() => (this.currentTime = this.$moment().millisecond(0)), 1000);

    if (this.state.noticeOfError) {
      if (this.state.noticeOfError === "failed_to_find_folder") {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t('notifications["failed_to_get_folder:"]') +
              " " +
              this.store.request.slugProjectName
          );
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.state.noticeOfError);
      }
      return;
    }

    if (window.state.dev_mode === "debug")
      console.log(
        "ROOT EVENT: created / no errors, checking for content to load"
      );

    // if a slugProjectName or a metaFileName is requested, load the content of that folder rightaway
    // we are probably in a webbrowser that accesses a subfolder or a media
    if (this.store.request.slugProjectName) {
      this.$eventHub.$once("socketio.projects.folders_listed", () => {
        this.openProject(this.store.request.slugProjectName);
      });
      // requesting edit of a media
      if (this.store.request.metaFileName) {
        this.$eventHub.$once("socketio.projects.listMedias", () => {
          const metaFileName = this.store.request.metaFileName;
          this.media_modal.show_sidebar = false;
          this.openMedia({
            slugProjectName: this.store.request.slugProjectName,
            metaFileName,
          });
        });
      }
    } else if (
      ["export_publication", "print_publication", "link_publication"].includes(
        this.state.mode
      ) &&
      Object.keys(this.store.publications).length > 0
    ) {
      this.settings.current_publication.slug = Object.keys(
        this.store.publications
      )[0];
    }

    /* à la connexion/reconnexion, détecter si un projet ou une publi sont ouverts 
    et si c’est le cas, rafraichir leur contenu (meta, medias) */
    this.$eventHub.$on("socketio.reconnect", () => {
      this.$socketio.listFolders({ type: "authors" });
      this.$socketio.listFolders({ type: "projects" });

      if (this.settings.current_publication.slug) {
        this.$socketio.listFolder({
          type: "publications",
          slugFolderName: this.settings.current_publication.slug,
        });
        this.$socketio.listMedias({
          type: "publications",
          slugFolderName: this.settings.current_publication.slug,
        });
      }
      if (this.do_navigation.current_slugProjectName) {
        this.$socketio.listFolder({
          type: "projects",
          slugFolderName: this.do_navigation.current_slugProjectName,
        });
        this.$socketio.listMedias({
          type: "projects",
          slugFolderName: this.do_navigation.current_slugProjectName,
        });
      }
    });

    window.onpopstate = (event) => {
      console.log(
        `ROOT EVENT: popstate with event.state.slugProjectName = ${event.state.slugProjectName}`
      );
      this.do_navigation.current_slugProjectName = event.state.slugProjectName;
    };

    window.addEventListener("tag.newTagDetected", this.newTagDetected);

    if (this.state.mode === "live") {
      console.log("ROOT EVENT: created / now connecting with socketio");

      if (!this.$root.state.is_electron) {
        this.$eventHub.$on("socketio.connect", () => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications["connected_to_dodoc"]'));
        });
        this.$eventHub.$on("socketio.reconnect", () => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications["connected_to_dodoc"]'));
        });
      }

      if (this.$root.state.session_password === "has_pass") {
        var session_storage_pwd = this.$auth.getSessionPasswordFromLocalStorage();
        if (session_storage_pwd) {
          this.$socketio.connect(session_storage_pwd);

          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .log(this.$t("notifications.using_saved_password"));

          this.$eventHub.$once("socketio.socketerror", () => {
            this.showSessionPasswordModal = true;
          });
        } else {
          this.showSessionPasswordModal = true;
        }

        this.$eventHub.$on("socketio.socketerror", () => {
          // if error, attempt to reconnect
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t('notifications["wrong_password_for_dodoc"]'));
          this.showSessionPasswordModal = true;
        });
      } else {
        this.$socketio.connect();
      }

      this.$eventHub.$once("socketio.authentificated", () => {
        this.$socketio.listFolders({ type: "authors" });
        this.$socketio.listFolders({ type: "projects" });

        if (this.current_project) {
          this.$socketio.listMedias({
            type: "projects",
            slugFolderName: this.current_project.slugFolderName,
          });
        }
      });
    }
  },
  beforeDestroy() {
    this.$root.settings.current_publication.page_id = false;
  },
  watch: {
    "settings.has_modal_opened": function () {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: var has changed: has_modal_opened: ${this.settings.has_modal_opened}`
        );
      }
      if (this.has_modal_opened) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    },
    "store.authors": function () {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: var has changed: store.authors`);
      }
      // check if, when store.authors refresh, the current_author_slug is still there
      // delog if not
      if (
        this.settings.current_author_slug &&
        !this.store.authors.hasOwnProperty(this.settings.current_author_slug)
      ) {
        this.unsetAuthor();
      }
    },
  },
  computed: {
    current_project() {
      if (
        !this.store.hasOwnProperty("projects") ||
        Object.keys(this.store.projects).length === 0
      ) {
        this.closeProject();
        return {};
      }

      if (
        this.store.projects.hasOwnProperty(
          this.do_navigation.current_slugProjectName
        )
      ) {
        return this.store.projects[this.do_navigation.current_slugProjectName];
      } else {
        this.closeProject();
        return {};
      }
    },
    current_author() {
      if (!this.settings.current_author_slug) return false;
      if (!this.store.authors.hasOwnProperty(this.settings.current_author_slug))
        return false;
      return this.store.authors[this.settings.current_author_slug];
    },
    current_publication() {
      if (this.settings.current_publication.slug) {
        if (
          this.store.publications.hasOwnProperty(
            this.settings.current_publication.slug
          )
        ) {
          return this.store.publications[
            this.settings.current_publication.slug
          ];
        }
      }
      return false;
    },
    all_folders() {
      return Object.values(this.store.projects).reduce((acc, p) => {
        if (!!p.folder && !acc.includes(p.folder)) acc.push(p.folder);
        return acc;
      }, []);
    },
    projects_that_are_accessible() {
      const type = "projects";
      return Object.values(this.store[type]).filter((p) =>
        this.canSeeFolder({ type, slugFolderName: p.slugFolderName })
      );
    },
    current_publication_medias() {
      if (
        !this.current_publication ||
        !this.current_publication.hasOwnProperty("medias")
      )
        return false;

      if (
        this.current_publication.template === "page_by_page" &&
        this.$root.settings.current_publication.page_id
      ) {
        // we need to check current page
        return Object.values(this.current_publication.medias).filter(
          (m) => m.page_id === this.$root.settings.current_publication.page_id
        );
      }
      return this.current_publication.medias;
    },
    requested_media() {
      return this.store.projects[this.store.request.slugProjectName].medias[
        this.store.request.metaFileName
      ];
    },
    allAuthors() {
      let allAuthors = [];
      return Object.values(this.store.authors);
    },
    allKeywords() {
      let allKeywords = [];
      for (let slugProjectName in this.store.projects) {
        const project = this.store.projects[slugProjectName];
        let projectKeywords = project.keywords;
        if (!!projectKeywords) {
          projectKeywords.map((val) => {
            allKeywords.push(val.title);
          });
        }

        if (
          project.hasOwnProperty("medias") &&
          Object.keys(project.medias).length > 0
        ) {
          Object.values(project.medias).map((m) => {
            if (m.hasOwnProperty("keywords") && m.keywords.length > 0) {
              allKeywords = allKeywords.concat(m.keywords.map((k) => k.title));
            }
          });
        }
      }
      allKeywords = allKeywords.filter(function (item, pos) {
        return allKeywords.indexOf(item) == pos;
      });

      return allKeywords.map((kw) => {
        return {
          text: kw,
          classes: "tagcolorid_" + (parseInt(kw, 36) % 2),
        };
      });
    },
    currentTime_human() {
      return this.$moment(this.currentTime).format("LL   LTS");
    },
    screen_is_wide() {
      if (this.settings.windowWidth < 750) {
        return false;
      }
      return true;
    },
  },
  methods: {
    getAllKeywordsFrom(base) {
      let uniqueKeywords = [];
      Object.values(base).map((meta) => {
        if (!meta["keywords"]) return;
        meta.keywords.map((k) => {
          if (uniqueKeywords.indexOf(k.title) == -1)
            uniqueKeywords.push(k.title);
        });
      });
      uniqueKeywords = uniqueKeywords.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

      return uniqueKeywords.map((kw) => {
        return {
          text: kw,
          classes: "tagcolorid_" + (parseInt(kw, 36) % 2),
        };
      });
    },
    getAllAuthorsFrom(base) {
      let uniqueAuthors = [];
      Object.values(base).map((meta) => {
        if (!meta["authors"]) return;
        if (typeof meta.authors === "string") {
          meta.authors = [{ name: meta.authors }];
        }
        meta.authors.map((k) => {
          if (uniqueAuthors.indexOf(k.slugFolderName) == -1)
            uniqueAuthors.push(k.slugFolderName);
        });
      });
      uniqueAuthors = uniqueAuthors.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
      return uniqueAuthors.map((kw) => {
        return {
          slugFolderName: kw,
        };
      });
    },
    getAuthor(slugFolderName) {
      if (Object.keys(this.store.authors).length === 0) return false;
      const author = Object.values(this.store.authors).find(
        (a) => a.slugFolderName === slugFolderName
      );
      return author;
    },
    getAllTypesFrom(base) {
      let uniquetTypes = [];
      Object.values(base).map((meta) => {
        if (!meta["type"]) return;
        if (uniquetTypes.indexOf(meta.type) == -1) uniquetTypes.push(meta.type);
      });
      uniquetTypes = uniquetTypes.sort(function (a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
      return uniquetTypes;
    },
    detectFullScreen() {
      var fullscreenElement =
        document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      if (fullscreenElement) {
        this.app_is_fullscreen = true;
      } else {
        this.app_is_fullscreen = false;
      }
    },
    createFolder: function (fdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }

      this.justCreatedFolderID = fdata.id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      this.$socketio.createFolder(fdata);
    },
    editFolder: function (fdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }
      this.$socketio.editFolder(fdata);
    },
    removeFolder: function ({ type, slugFolderName }) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: removeFolder: slugFolderName = ${slugFolderName} of type = ${type}`
        );
      }
      this.$socketio.removeFolder({ type, slugFolderName });
    },
    createMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: createMedia`);
      }
      this.justCreatedMediaID = mdata.id =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      if (this.current_author) {
        if (!mdata.hasOwnProperty("additionalMeta")) {
          mdata.additionalMeta = {};
        }
        mdata.additionalMeta.authors = [
          { slugFolderName: this.current_author.slugFolderName },
        ];
      }

      this.$nextTick(() => {
        this.$socketio.createMedia(mdata);
      });
    },

    removeMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: removeMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }
      this.$socketio.removeMedia(mdata);
    },
    editMedia: function (mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },
    canSeeFolder: function ({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      // if folder has pass, and user doesn’t have it
      const folder = this.store[type][slugFolderName];

      if (
        (!folder.hasOwnProperty("viewing_limited_to") &&
          folder.password !== "has_pass") ||
        folder.viewing_limited_to === "everybody"
      )
        return true;

      if (this.current_author.role === "admin") return true;

      if (
        folder.password === "has_pass" &&
        !this.userHasPasswordSaved({ type, slugFolderName })
      ) {
        return false;
      }

      return true;
    },
    userHasPasswordSaved: function ({ type, slugFolderName }) {
      // if folder doesn’t have a password set
      return this.state.list_authorized_folders.some((i) => {
        return (
          !!i &&
          i.hasOwnProperty("type") &&
          i.type === type &&
          i.hasOwnProperty("allowed_slugFolderNames") &&
          i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
        );
      });
    },
    canEditFolder: function ({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      const folder = this.store[type][slugFolderName];

      // if no password && no editing limits
      if (
        folder.password !== "has_pass" &&
        (!folder.hasOwnProperty("editing_limited_to") ||
          folder.editing_limited_to === "with_password")
      )
        return true;

      // if explicit edit authorized
      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "everybody"
      )
        return true;

      // if admin
      if (this.current_author && this.current_author.role === "admin")
        return true;

      // if password is set
      if (
        folder.password === "has_pass" &&
        (!folder.hasOwnProperty("editing_limited_to") ||
          folder.editing_limited_to === "with_password")
      ) {
        return this.state.list_authorized_folders.some((i) => {
          return (
            !!i &&
            i.hasOwnProperty("type") &&
            i.type === type &&
            i.hasOwnProperty("allowed_slugFolderNames") &&
            i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
          );
        });
      }

      // if editing_limited_to === 'only_authors'
      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "only_authors"
      ) {
        if (!folder.authors || folder.authors.length === 0) return true;

        return folder.authors.some(
          (a) => a.slugFolderName === this.current_author.slugFolderName
        );
      }

      return false;
    },
    openProject: function (slugProjectName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openProject: ${slugProjectName}`);
      }
      if (
        !this.store.projects.hasOwnProperty(slugProjectName) ||
        !this.canSeeFolder({
          type: "projects",
          slugFolderName: slugProjectName,
        })
      ) {
        console.log("Missing folder key on the page, aborting.");
        this.closeProject();
        return false;
      }

      this.do_navigation.view = "ProjectView";
      this.do_navigation.current_slugProjectName = slugProjectName;

      this.$socketio.listMedias({
        type: "projects",
        slugFolderName: slugProjectName,
      });

      history.pushState(
        { slugProjectName },
        this.store.projects[slugProjectName].name,
        "/" + slugProjectName
      );
    },
    closeProject: function () {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: closeProject");
      }

      this.do_navigation.view = "ListView";
      this.do_navigation.current_slugProjectName = "";

      history.pushState({ slugProjectName: "" }, "", "/");
    },
    openMedia({ slugProjectName, metaFileName }) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: openMedia with slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`
        );
      }

      this.media_modal.open = true;
      this.media_modal.minimized = false;
      this.media_modal.current_slugProjectName = slugProjectName;
      this.media_modal.current_metaFileName = metaFileName;
    },
    closeMedia: function () {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: closeMedia`);
      }

      this.media_modal.open = false;
    },
    setProjectKeywordFilter(newKeywordFilter) {
      if (this.settings.project_filter.keyword !== newKeywordFilter) {
        this.settings.project_filter.keyword = newKeywordFilter;
      } else {
        this.settings.project_filter.keyword = "";
      }
    },
    setProjectAuthorFilter(newAuthorFilter) {
      if (this.settings.project_filter.author !== newAuthorFilter) {
        this.settings.project_filter.author = newAuthorFilter;
      } else {
        this.settings.project_filter.author = "";
      }
    },
    setMediaKeywordFilter(newKeywordFilter) {
      if (this.settings.media_filter.keyword !== newKeywordFilter) {
        this.settings.media_filter.keyword = newKeywordFilter;
      } else {
        this.settings.media_filter.keyword = "";
      }
    },
    setMediaAuthorFilter(newAuthorFilter) {
      if (this.settings.media_filter.author !== newAuthorFilter) {
        this.settings.media_filter.author = newAuthorFilter;
      } else {
        this.settings.media_filter.author = "";
      }
    },
    setFavFilter() {
      this.settings.media_filter.fav = !this.settings.media_filter.fav;
    },
    setTypeFilter(newTypeFilter) {
      if (
        this.settings.media_filter.type !== newTypeFilter &&
        newTypeFilter.length > 0
      ) {
        this.settings.media_filter.type = newTypeFilter;
      } else {
        this.settings.media_filter.type = "";
      }
    },

    filterMedia(media) {
      const checkIfMediaIsFav = (media) => {
        return (
          media.hasOwnProperty("fav") &&
          typeof media.fav === "boolean" &&
          media.fav === this.settings.media_filter.fav
        );
      };

      const checkIfMediaHasKeyword = (media) => {
        return (
          media.hasOwnProperty("keywords") &&
          typeof media.keywords === "object" &&
          media.keywords.filter(
            (k) => k.title === this.settings.media_filter.keyword
          ).length > 0
        );
      };
      const checkIfMediaHasAuthor = (media) => {
        return (
          media.hasOwnProperty("authors") &&
          typeof media.authors === "object" &&
          media.authors.filter(
            (k) => k.slugFolderName === this.settings.media_filter.author
          ).length > 0
        );
      };
      const checkIfMediaHasType = (media) => {
        return (
          media.hasOwnProperty("type") &&
          typeof media.type === "string" &&
          this.settings.media_filter.type.includes(media.type)
        );
      };

      return (
        (!this.settings.media_filter.fav || checkIfMediaIsFav(media)) &&
        (!this.settings.media_filter.keyword ||
          checkIfMediaHasKeyword(media)) &&
        (!this.settings.media_filter.author || checkIfMediaHasAuthor(media)) &&
        (!this.settings.media_filter.type || checkIfMediaHasType(media))
      );
    },

    updateLocalLang: function (newLangCode) {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: updateLocalLang");
      }
      i18n.locale = newLangCode;
      moment.locale(newLangCode);
      this.lang.current = newLangCode;

      const html = document.documentElement; // returns the html tag
      html.setAttribute("lang", newLangCode);

      localstore.set("language", newLangCode);
    },
    setAuthor: function (author) {
      this.settings.current_author_slug = author.slugFolderName;
      this.$socketio.socket.emit("updateClientInfo", { author });
    },
    unsetAuthor: function () {
      this.$auth.removeAllFoldersPassword({
        type: "authors",
      });
      this.$socketio.sendAuth();

      this.settings.current_author_slug = false;
      this.$socketio.socket.emit("updateClientInfo", {});
    },
    togglePubliPanel: function () {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: togglePubliPanel`);
      }
      if (this.settings.show_publi_panel) {
        this.closePubliPanel();
      } else {
        this.openPubliPanel();
      }
    },
    openPubliPanel: function () {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openPubliPanel`);
      }
      this.settings.show_publi_panel = true;
      this.settings.current_publication.slug = false;

      this.$socketio.listFolders({ type: "publications" });
    },
    closePubliPanel: function () {
      if (window.state.dev_mode === "debug")
        console.log(`ROOT EVENT: closePubliPanel`);

      this.settings.show_publi_panel = false;
      this.settings.current_publication.slug = false;
    },

    openChatPanel: function () {
      if (window.state.dev_mode === "debug")
        console.log(`ROOT EVENT: openChatPanel`);

      this.settings.show_chat_panel = true;
    },
    closeChatPanel: function () {
      if (window.state.dev_mode === "debug")
        console.log(`ROOT EVENT: closeChatPanel`);

      this.settings.show_chat_panel = false;
    },

    openPublication(slugPubliName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openPublication: ${slugPubliName}`);
      }
      this.$socketio.listFolder({
        type: "publications",
        slugFolderName: slugPubliName,
      });
      this.$socketio.listMedias({
        type: "publications",
        slugFolderName: slugPubliName,
      });
      this.settings.current_publication.slug = slugPubliName;
    },
    closePublication() {
      if (window.state.dev_mode === "debug") {
        console.log("ROOT EVENT: closePublication");
      }
      this.settings.current_publication.slug = false;
    },
    listSpecificMedias(mdata) {
      if (window.state.dev_mode === "debug") {
        console.log(
          `ROOT EVENT: listSpecificMedias with medias_list = ${JSON.stringify(
            mdata,
            null,
            4
          )}`
        );
      }
      this.$socketio.listSpecificMedias(mdata);
    },
    setPublicationZoom(val) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: setPublicationZoom with val = ${val}`);
      }
      this.settings.publi_zoom = val;
    },

    newTagDetected(e) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: newTagDetected with e.detail = ${e.detail}`);
      }

      // EXPERIMENTAL : SPECIFIC TAGS OPEN MEDIA MODAL
      // '3121284126' '3121310334' '3121063518' '3121370062'

      // const nfc_custom_tags = [
      //   {
      //     id: '3121284126',
      //     slugProjectName: '110bis-16-novembre',
      //     metaFileName: 'question-1-49.jpg.txt'
      //   },
      //   {
      //     id: '3121370062',
      //     slugProjectName: '110bis-16-novembre',
      //     metaFileName: 'question-2-49-49-49.jpg.txt'
      //   },
      //   {
      //     id: '3121063518',
      //     slugProjectName: '110bis-16-novembre',
      //     metaFileName: 'question-3-49-49-49.jpg.txt'
      //   }
      // ];

      // const matching_tags = nfc_custom_tags.filter(nfc => nfc.id === e.detail);

      // if (matching_tags.length > 0) {
      //   this.closeMedia();
      //   this.media_modal.minimized = false;
      //   this.media_modal.show_sidebar = false;

      //   const matching_tag = matching_tags[0];

      //   this.$socketio.listMedias({
      //     type: 'projects',
      //     slugFolderName: matching_tag.slugProjectName
      //   });

      //   this.$eventHub.$once('socketio.projects.listMedias', () => {
      //     this.openMedia({
      //       slugProjectName: matching_tag.slugProjectName,
      //       metaFileName: matching_tag.metaFileName
      //     });
      //     setTimeout(() => {
      //       this.openProject(matching_tag.slugProjectName);
      //       this.settings.capture_options.selected_mode = 'video';
      //       this.do_navigation.view = 'CaptureView';
      //     }, 2000);

      //     setTimeout(() => {
      //       this.media_modal.minimized = true;
      //     }, 4000);
      //   });

      //   return;
      // }

      const author = this.$_.findWhere(this.store.authors, {
        nfc_tag: e.detail,
      });
      if (!author) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.no_content_found_with_nfc_tag"));
        return;
      }

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(
          this.$t("notifications.author_found_with_nfc_tag") +
            " " +
            `<button class="bg-blanc padding-none c-bleumarine font-thin">${author.name}</button>`
        );
      this.setAuthor(author);
    },

    setMediaFilter(filter) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: setMediaFilter`);
      }

      this.settings.media_filter = filter;
    },
    unsetMediaFilter() {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: unsetMediaFilter`);
      }
      this.settings.media_filter = {};
    },
    loadAllProjectsMedias() {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: loadAllProjectsMedias`);
      }

      // in this.store.projects, find those that don’t have medias prop and
      // request their medias
      Object.keys(this.store.projects).forEach((slugProjectName) => {
        const project_meta = this.store.projects[slugProjectName];
        this.$socketio.listMedias({
          type: "projects",
          slugFolderName: slugProjectName,
        });
      });

      let number_of_projects_to_load_medias_to = Object.keys(
        this.store.projects
      ).length;

      this.$eventHub.$on("socketio.projects.listMedias", () => {
        number_of_projects_to_load_medias_to--;
        if (number_of_projects_to_load_medias_to === 0) {
          this.$eventHub.$emit("socketio.has_finished_loading_all_medias");
        }
      });

      setTimeout(() => {
        this.$eventHub.$emit("socketio.has_finished_loading_all_medias");
      }, 5000);
    },
    formatDateToHuman(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").format("LL");
    },
    formatDateToPrecise(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").format("LTS L");
    },
    formatDurationToMinuteHours(date) {
      return this.$moment.utc(date).format("mm:ss");
    },
    updateNetworkInfos() {
      this.$socketio.updateNetworkInfos();
    },
    navigation_back() {
      if (this.do_navigation.view === "CaptureView") {
        this.do_navigation.view = "ProjectView";
      } else if (this.do_navigation.view === "ProjectView") {
        this.closeProject();
      }
    },
    formatBytes(a, b) {
      if (0 == a) return `0 ${this.$t("bytes")}`;

      var e = [
        this.$t("bytes"),
        this.$t("kb"),
        this.$t("mb"),
        this.$t("gb"),
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB",
      ];

      var c = 1024,
        d = b || 2,
        f = Math.floor(Math.log(a) / Math.log(c));
      return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
    },
  },
});
