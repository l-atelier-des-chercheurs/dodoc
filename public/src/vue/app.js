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

Array.prototype.move = function (from, to) {
  this.splice(to, 0, this.splice(from, 1)[0]);
};

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
        selected_medias: [],
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
              ` ${this.store.request.type}/${this.store.request.slugFolderName}`
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

    // if a slugFolderName or a metaFileName is requested, load the content of that folder rightaway
    // we are probably in a webbrowser that accesses a subfolder or a media
    if (this.store.request.type && this.store.request.slugFolderName) {
      this.$eventHub.$once("socketio.authentificated", () => {
        this.$socketio.listFolders({ type: this.store.request.type });
      });

      this.$eventHub.$once(
        `socketio.${this.store.request.type}.folders_listed`,
        () => {
          if (this.store.request.type === "projects")
            this.openProject(this.store.request.slugFolderName);
          if (this.store.request.type === "publications") {
            this.settings.current_publication.slug = this.store.request.slugFolderName;
          }
        }
      );
      // requesting edit of a media
      if (this.store.request.metaFileName) {
        this.$eventHub.$once(
          `socketio.${this.store.request.type}.listMedias`,
          () => {
            if (this.store.request.type === "projects") {
              const metaFileName = this.store.request.metaFileName;
              this.media_modal.show_sidebar = false;
              this.openMedia({
                slugProjectName: this.store.request.slugFolderName,
                metaFileName,
              });
            }
          }
        );
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
      this.loadAllChats();

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

      if (!this.state.is_electron) {
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

      // remove auth inbetween reloads
      // this.$auth.removeAllFoldersPassword({
      //   type: "authors",
      // });

      if (this.state.session_password === "has_pass") {
        var session_storage_pwd = this.$auth.getSessionPasswordFromLocalStorage();
        if (session_storage_pwd) {
          this.$socketio.connect(session_storage_pwd);

          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t("notifications.using_saved_password"));

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

      if (this.store.request.display === "survey") {
        this.$socketio.listFolders({ type: "authors" });
      }

      this.$eventHub.$once("socketio.authentificated", () => {
        this.$socketio.listFolders({ type: "authors" });
        this.$socketio.listFolders({ type: "projects" });
        this.$socketio.listFolders({ type: "publications" });
        this.loadAllChats();
        this.updateNetworkInfos();

        if (this.current_project) {
          this.$socketio.listMedias({
            type: "projects",
            slugFolderName: this.current_project.slugFolderName,
          });
        }

        const authorized_authors = this.state.list_authorized_folders.filter(
          (f) => f.type === "authors" && f.allowed_slugFolderNames.length > 0
        );

        if (authorized_authors.length > 0) {
          this.$eventHub.$once("socketio.authors.folders_listed", () => {
            if (Object.values(this.store.authors).length === 0) return;

            const first_author_slug =
              authorized_authors[0].allowed_slugFolderNames[0];
            const author = Object.values(this.store.authors).find(
              (a) => a.slugFolderName === first_author_slug
            );

            if (author) {
              this.setAuthor(first_author_slug);
              this.$alertify
                .closeLogOnClick(true)
                .delay(4000)
                .success(
                  this.$t("notifications.connecting_using_saved_account") +
                    author.name
                );
            }
          });
        }
      });
    }
  },
  beforeDestroy() {
    this.settings.current_publication.page_id = false;
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
        this.settings.current_author_slug !== false &&
        !this.store.authors.hasOwnProperty(this.settings.current_author_slug)
      ) {
        this.unsetAuthor();
      }
    },
    "state.list_authorized_folders": {
      handler() {
        const authors = this.state.list_authorized_folders.find(
          (f) => f.type === "authors"
        );
        if (authors) {
          const allowed_slugFolderNames = authors.allowed_slugFolderNames;
          if (allowed_slugFolderNames.length > 0) {
            this.setAuthor(allowed_slugFolderNames[0]);
            return;
          }
        }
        this.unsetAuthor();
      },
      deep: true,
    },

    current_project() {
      this.updateClientInfo({
        looking_at_project: {
          slugFolderName: this.current_project
            ? this.current_project.slugFolderName
            : false,
        },
      });
    },
    current_publication() {
      this.updateClientInfo({
        looking_at_publi: {
          slugFolderName: this.current_publication
            ? this.current_publication.slugFolderName
            : false,
        },
      });
    },
    media_modal: {
      handler() {
        let editing_media = {};

        if (this.media_modal.open) {
          editing_media.slugFolderName = this.media_modal.current_slugProjectName;
          editing_media.metaFileName = this.media_modal.current_metaFileName;
        }
        this.updateClientInfo({
          editing_media,
        });
      },
      deep: true,
    },
    current_chat() {
      this.updateClientInfo({
        looking_at_chat: {
          slugFolderName: this.current_chat
            ? this.current_chat.slugFolderName
            : false,
        },
      });
    },
  },
  computed: {
    current_project() {
      if (!this.do_navigation.current_slugProjectName) return false;

      if (
        !this.store.hasOwnProperty("projects") ||
        Object.keys(this.store.projects).length === 0
      ) {
        // this.closeProject();
        return false;
      }

      if (
        this.store.projects.hasOwnProperty(
          this.do_navigation.current_slugProjectName
        )
      ) {
        return this.store.projects[this.do_navigation.current_slugProjectName];
      } else {
        this.closeProject();
        return false;
      }
    },
    current_author() {
      if (!this.settings.current_author_slug) return false;
      if (!this.store.authors.hasOwnProperty(this.settings.current_author_slug))
        return false;
      return this.store.authors[this.settings.current_author_slug];
    },
    current_chat() {
      if (!this.settings.current_chat.slug) return false;

      return Object.values(this.store.chats).find(
        (c) => c.slugFolderName === this.settings.current_chat.slug
      );
    },
    current_author_is_admin() {
      return this.current_author && this.current_author.role === "admin";
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
    get_total_unread_messages() {
      return Object.values(this.store.chats).reduce((acc, c) => {
        acc += this.getUnreadMessageCount(c);
        return acc;
      }, 0);
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
    projects_that_are_editable() {
      const type = "projects";
      return Object.values(this.store[type]).filter((p) =>
        this.canEditFolder({ type, slugFolderName: p.slugFolderName })
      );
    },
    unique_clients() {
      return this.$root.state.clients.reduce((acc, client) => {
        if (client.id === this.$root.$socketio.socket.id.substring(0, 4))
          return acc;

        if (
          this.$root.state.local_options.force_login &&
          !client.data.hasOwnProperty("author")
        )
          return acc;

        if (
          !client.data.hasOwnProperty("author") ||
          !acc.some(
            (a) => a.data.slugFolderName === client.data.author.slugFolderName
          )
        )
          acc.push(client);

        return acc;
      }, []);
    },

    current_publication_medias() {
      if (
        !this.current_publication ||
        !this.current_publication.hasOwnProperty("medias")
      )
        return false;

      if (
        this.current_publication.template === "page_by_page" &&
        this.settings.current_publication.page_id
      ) {
        // we need to check current page
        return Object.values(this.current_publication.medias).filter(
          (m) => m.page_id === this.settings.current_publication.page_id
        );
      }
      return this.current_publication.medias;
    },
    requested_media() {
      if (this.store.request.type !== "projects") return false;
      return this.store.projects[this.store.request.slugFolderName].medias[
        this.store.request.metaFileName
      ];
    },
    allAuthors() {
      let allAuthors = [];
      return Object.values(this.store.authors);
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
    consult_domains() {
      if (!!this.state.api_domaines_whitelist)
        return this.state.api_domaines_whitelist
          .split(",")
          .filter((d) => d !== "localhost");
      return false;
    },
  },
  methods: {
    allKeywords({ type = "projects" }) {
      let allTypeKeywords = [];
      for (let slugProjectName in this.store[type]) {
        const folder = this.store[type][slugProjectName];
        let folderKeywords = folder.keywords;
        if (!!folderKeywords) {
          folderKeywords.map((val) => {
            allTypeKeywords.push(val.title);
          });
        }

        if (
          folder.hasOwnProperty("medias") &&
          Object.keys(folder.medias).length > 0
        ) {
          Object.values(folder.medias).map((m) => {
            if (m.hasOwnProperty("keywords") && m.keywords.length > 0) {
              allTypeKeywords = allTypeKeywords.concat(
                m.keywords.map((k) => k.title)
              );
            }
          });
        }
      }
      allTypeKeywords = allTypeKeywords.filter(function (item, pos) {
        return allTypeKeywords.indexOf(item) == pos;
      });

      return allTypeKeywords.map((kw) => {
        return {
          text: kw,
          classes: "tagcolorid_" + (parseInt(kw, 36) % 2),
        };
      });
    },
    getURL() {
      if (!this.$root.state.localNetworkInfos.ip) return false;

      const ip = this.$root.state.localNetworkInfos.ip[0];
      let url = new URL(window.location);

      function isIP(address) {
        const r = RegExp(
          "((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
        );
        return r.test(address);
      }

      // si on est en localhost (cas de electron et navigateur connecté à electron)
      // alors on remplace localhost par l’IP
      if (url.hostname === "localhost") {
        url.hostname = ip;
      }
      // si on est sur une ip (cas d’un hébergement en ligne, ou d’un navigateur connecté à electron)
      // alors on remplace par l’IP
      else if (isIP(url.hostname)) {
        url.hostname = ip;
      }

      return url;
    },
    getUnreadMessageCount(chat) {
      if (!this.current_author) return false;

      if (
        !this.canSeeFolder({
          type: "chats",
          slugFolderName: chat.slugFolderName,
        })
      )
        return false;

      const total_number_of_messages_in_chat = chat.number_of_medias;

      // find media with meta
      const last_messages_read_in_channels = this.current_author
        .last_messages_read_in_channels;

      if (last_messages_read_in_channels) {
        const existing_info = last_messages_read_in_channels.find(
          (c) => c.channel === chat.slugFolderName
        );

        if (existing_info) {
          // const last_message_metaFileName = existing_info.metaFileName;
          // const index_of_past_message_read = Object.values(
          //   chat.medias
          // ).findIndex((m) => m.metaFileName === existing_info.msg);
          // return (
          //   total_number_of_messages_in_chat - index_of_past_message_read - 1
          // );
          // using index for performance reason (no need to list all chats to get a rough unread count)
          if (existing_info.hasOwnProperty("index")) {
            return Math.max(
              0,
              total_number_of_messages_in_chat - Number(existing_info.index)
            );
          }
        }
      }

      return Math.max(0, total_number_of_messages_in_chat);
    },
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
    findClientsLookingAt({ type, slugFolderName, metaFileName }) {
      if (type === "projects" && metaFileName) {
        type = "editing_media";
      } else if (type === "projects") {
        type = "looking_at_project";
      } else if (type === "publications") {
        type = "looking_at_publi";
      } else if (type === "chats") {
        type = "looking_at_chat";
      } else return [];

      return this.$root.unique_clients.filter(
        (c) =>
          c.data &&
          c.data.hasOwnProperty(type) &&
          c.data[type].slugFolderName === slugFolderName &&
          (!metaFileName || c.data[type].metaFileName === metaFileName)
      );
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
      return this.getFolder({ slugFolderName, type: "authors" });
    },
    getFolder({ slugFolderName, type }) {
      if (
        Object.keys(this.store[type]).length === 0 ||
        !this.store[type].hasOwnProperty(slugFolderName)
      )
        return false;
      return this.store[type][slugFolderName];
    },
    getPublication(slugFolderName) {
      if (Object.keys(this.store.publications).length === 0) return false;
      return Object.values(this.store.publications).find(
        (p) => p.slugFolderName === slugFolderName
      );
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
    getFolderPassword({ type, slugFolderName }) {
      const folders_password = this.$auth.getFoldersPasswords();
      if (
        folders_password.hasOwnProperty(type) &&
        folders_password[type].hasOwnProperty(slugFolderName)
      ) {
        return folders_password[type][slugFolderName];
      }
      return "";
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
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(
            `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
          );
        }

        const type = fdata.type;

        fdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.createFolder(fdata);

        const catchFolderCreation = (d) => {
          if (fdata.id === d.id) {
            if (d.password === "has_pass") {
              this.$auth.updateFoldersPasswords({
                [type]: {
                  [d.slugFolderName]: fdata.data.password,
                },
              });

              this.$socketio.sendAuth();
              this.$eventHub.$once("socketio.authentificated", () => {
                return resolve(d);
              });
            } else {
              this.$nextTick(() => {
                return resolve(d);
              });
            }
          } else {
            this.$eventHub.$once(
              `socketio.folder_created_or_updated`,
              catchFolderCreation
            );
          }
        };
        this.$eventHub.$once(
          `socketio.folder_created_or_updated`,
          catchFolderCreation
        );
      });
    },
    editFolder: function (fdata) {
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(
            `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
          );
        }

        fdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.editFolder(fdata);

        const catchFolderEdition = function (d) {
          if (fdata.id === d.id) {
            return resolve(d);
          } else {
            this.$eventHub.$once(
              `socketio.folder_created_or_updated`,
              catchFolderEdition
            );
          }
        };
        this.$eventHub.$once(
          "socketio.folder_created_or_updated",
          catchFolderEdition
        );
      });
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
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(`ROOT EVENT: createMedia`);
        }
        mdata.id =
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

        this.$socketio.createMedia(mdata);

        const catchMediaCreation = (d) => {
          if (mdata.id === d.id) {
            this.$nextTick(() => {
              return resolve(d);
            });
          } else {
            this.$eventHub.$once(
              `socketio.media_created_or_updated`,
              catchMediaCreation
            );
          }
        };
        this.$eventHub.$once(
          `socketio.media_created_or_updated`,
          catchMediaCreation
        );
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
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug") {
          console.log(
            `ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`
          );
        }

        mdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.editMedia(mdata);

        const catchMediaCreation = (d) => {
          if (mdata.id === d.id) {
            this.$nextTick(() => {
              return resolve(d);
            });
          } else {
            this.$eventHub.$once(
              `socketio.media_created_or_updated`,
              catchMediaCreation
            );
          }
        };
        this.$eventHub.$once(
          `socketio.media_created_or_updated`,
          catchMediaCreation
        );
      });
    },
    copyMediaToFolder: function (mdata) {
      return new Promise((resolve, reject) => {
        if (window.state.dev_mode === "debug")
          console.log(
            `ROOT EVENT: copyMediaToFolder: ${JSON.stringify(mdata, null, 4)}`
          );

        mdata.id =
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15);

        this.$socketio.copyMediaToFolder(mdata);

        const catchMediaCopy = (d) => {
          if (mdata.id === d.id) {
            this.$nextTick(() => {
              return resolve(d);
            });
          } else {
            this.$eventHub.$once(
              `socketio.media_created_or_updated`,
              catchMediaCopy
            );
          }
        };
        this.$eventHub.$once(
          `socketio.media_created_or_updated`,
          catchMediaCopy
        );
      });
    },

    canSeeFolder: function ({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      if (this.current_author_is_admin) return true;

      // if folder has pass, and user doesn’t have it
      const folder = this.store[type][slugFolderName];

      if (
        folder.hasOwnProperty("viewing_limited_to") &&
        folder.viewing_limited_to === "everybody"
      ) {
        return true;
      }

      if (
        folder.hasOwnProperty("viewing_limited_to") &&
        folder.viewing_limited_to === "only_authors"
      ) {
        if (!folder.authors || folder.authors.length === 0) return false;

        return folder.authors.some(
          (a) => a.slugFolderName === this.current_author.slugFolderName
        );
      }

      return this.canEditFolder({ type, slugFolderName });
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

      // if admin
      if (this.current_author_is_admin) return true;

      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "nobody"
      )
        return false;

      // if no password && no editing limits
      if (
        folder.password !== "has_pass" &&
        (!folder.hasOwnProperty("editing_limited_to") ||
          folder.editing_limited_to === "" ||
          folder.editing_limited_to === "with_password")
      )
        return true;

      // if explicit edit authorized
      if (
        folder.hasOwnProperty("editing_limited_to") &&
        folder.editing_limited_to === "everybody"
      )
        return true;

      // if password is set
      if (
        folder.password === "has_pass" &&
        (!folder.hasOwnProperty("editing_limited_to") ||
          folder.editing_limited_to === "" ||
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
        if (!folder.authors || folder.authors.length === 0) return false;

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
    setAuthor: function (author_slug) {
      if (this.settings.current_author_slug === author_slug) return;

      if (this.state.dev_mode === "debug") console.log(`ROOT EVENT: setAuthor`);

      const author = Object.values(this.store.authors).find(
        (a) => a.slugFolderName === author_slug
      );

      if (!author) return;

      this.settings.current_author_slug = author_slug;

      this.$socketio.socket.emit("updateClientInfo", {
        author: { slugFolderName: author.slugFolderName },
      });
      this.$socketio.listFolders({ type: "authors" });
      this.$eventHub.$emit("authors.newAuthorSet");
    },
    unsetAuthor: function () {
      if (!this.settings.current_author_slug) return;

      if (this.state.dev_mode === "debug")
        console.log(`ROOT EVENT: unsetAuthor`);

      this.$auth.removeAllFoldersPassword({
        type: "authors",
      });
      this.$socketio.sendAuth();

      this.settings.current_author_slug = false;
      this.$socketio.socket.emit("updateClientInfo", { author: {} });
    },
    updateClientInfo(val) {
      this.$socketio.socket.emit("updateClientInfo", val);
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
    openChat(slugFolderName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openChat: ${slugFolderName}`);
      }
      this.settings.current_chat.slug = slugFolderName;
    },
    closeChat() {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: closeChat`);
      }
      this.settings.current_chat.slug = false;
    },
    openPublication(slugPubliName) {
      if (window.state.dev_mode === "debug") {
        console.log(`ROOT EVENT: openPublication: ${slugPubliName}`);
      }
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
      this.setAuthor(author.slugFolderName);
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
    getOriginalMediaMeta(publi_media) {
      const slugProjectName = publi_media.slugProjectName;
      const slugMediaName = publi_media.slugMediaName;

      // find in store if slugFolderName exists
      if (!this.store.projects.hasOwnProperty(slugProjectName)) {
        console.error(
          `Missing project in store — not expected : ${slugProjectName}`
        );
        console.error(
          `Medias from project was probably added to the publication before it was removed altogether.`
        );
        return;
      }

      // find in store if metaFileName exists
      const project_medias = this.store.projects[slugProjectName].medias;

      if (!project_medias.hasOwnProperty(slugMediaName)) {
        return {};
      } else {
        let meta = JSON.parse(JSON.stringify(project_medias[slugMediaName]));
        if (meta.hasOwnProperty("_isAbsent") && meta._isAbsent) {
          console.error(
            `Missing media in store — not expected : ${slugProjectName} / ${slugMediaName}`
          );
          console.error(
            `Media was probably added to the publication before it was removed.`
          );
          return false;
        }
        return meta;
      }
    },
    loadAllChats() {
      this.$socketio.listFolders({ type: "chats" });
      // too much data/power for limited reward
      // this.$eventHub.$once("socketio.chats.folders_listed", () => {
      //   let index = 0;
      //   Object.keys(this.store.chats).forEach((slugChatName) => {
      //     // const project_meta = this.store.chats[slugChatName];
      //     index++;
      //     setTimeout(() => {
      //       this.$socketio.listMedias({
      //         type: "chats",
      //         slugFolderName: slugChatName,
      //       });
      //     }, 500 * index);
      //   });
      // });
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
    formatDateToCalendar(date) {
      return this.$moment(date, "YYYY-MM-DD HH:mm:ss").calendar();
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
