/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from 'vue';

import localstore from 'store';
import _ from 'underscore';
Object.defineProperty(Vue.prototype, '$_', { value: _ });

import alertify from 'alertify.js';
Vue.prototype.$alertify = alertify;

import auth from '../adc-core/auth-client.js';
auth.init();
Vue.prototype.$auth = auth;

import locale_strings from './locale_strings.js';

import 'prismjs';

// Vue.config.silent = false;
// Vue.config.devtools = true;

Vue.prototype.$eventHub = new Vue(); // Global event bus

import PortalVue from 'portal-vue';
Vue.use(PortalVue);

import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

import VuePlyr from 'vue-plyr';
Vue.use(VuePlyr);

import VueTippy from '../../node_modules/vue-tippy/dist/vue-tippy.min.js';
Vue.use(VueTippy, {});

let lang_settings = {
  available: {
    fr: 'Français',
    en: 'English'
  },
  default: 'en',
  current: '',
  init: function() {
    let localstore_lang = localstore.get('language');

    // // force lang to french
    // this.current = 'fr';
    // return;

    // has lang set
    if (localstore_lang !== undefined) {
      // exists in available
      if (this.available[localstore_lang] !== undefined) {
        this.current = localstore_lang;
      }
    }

    if (this.current === '') {
      // set current lang from window.navigator.language
      // window.navigator.language can be 'fr', 'en', or 'fr-FR'

      let browserLangIsAvailable = Object.keys(this.available).filter(x => {
        return window.navigator.language.includes(x);
      });
      if (browserLangIsAvailable.length > 0) {
        this.current = browserLangIsAvailable[0];
      }
    }

    if (this.current === '') {
      this.current = this.default;
    }
  }
};
lang_settings.init();

import moment from 'moment';
import 'moment/locale/fr';
import 'moment/locale/en-gb';

moment.locale(lang_settings.current);
Vue.prototype.$moment = moment;

const html = document.documentElement; // returns the html tag
html.setAttribute('lang', lang_settings.current);

// Create VueI18n instance with options
let i18n = new VueI18n({
  locale: lang_settings.current, // set locale
  messages: locale_strings // set locale messages
});

/** *********
  SOCKETIO
***********/

import custom_socketio from '../adc-core/custom-socketio.js';
Vue.prototype.$socketio = custom_socketio.init(i18n, auth, alertify);

import App from './App.vue';

let vm = new Vue({
  // eslint-disable-line no-new
  i18n,
  el: '#app',
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

    currentTime: '',

    do_navigation: {
      view: 'ListView',
      current_slugProjectName: false
    },
    media_modal: {
      open: false,
      minimized: false,
      show_sidebar: true,
      current_slugProjectName: false,
      current_metaFileName: false
    },
    showSessionPasswordModal: false,

    // persistant, par device (dans le localstorage)
    settings: {
      has_modal_opened: false,
      capture_mode_cant_be_changed: false,

      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,

      capture_options: {
        selected_mode: '',
        selected_devicesId: {
          audioinput: '',
          videoinput: '',
          audiooutput: ''
        },
        ideal_camera_resolution: {
          name: '',
          width: '',
          height: ''
        },

        distant_flux: {
          active: false,
          username: `dodoc-${(
            Math.random().toString(36) + '00000000000000000'
          ).slice(2, 3 + 2)}`,
          callee_username: ''
        }
      },

      current_publication: {
        slug: false,
        accepted_media_type: []
      },

      current_author: false,

      publi_zoom: 0.8,

      show_publi_panel: false,
      enable_system_bar: window.state.is_electron && window.state.is_darwin,

      project_filter: {
        keyword: false,
        author: false
      },
      media_filter: {
        keyword: false,
        author: false,
        fav: false
      }
    },
    lang: {
      available: lang_settings.available,
      current: lang_settings.current
    }
  },
  created() {
    if (window.state.dev_mode === 'debug') {
      console.log('ROOT EVENT: created');
    }

    if (this.store.request.display === 'standalone') {
      return false;
    }

    if (this.settings.enable_system_bar) {
      document.body.classList.add('has_systembar');
    }

    if (window.state.dev_mode === 'debug') {
      console.log('ROOT EVENT: created / checking for password');
    }

    // const canAccessDodoc = () => {
    //   if (window.state.is_electron) return true;
    //   if (this.state.session_password === '') return true;

    //   if (
    //     localstore.get('session_password') &&
    //     this.state.session_password !==
    //       hashCode(localstore.get('session_password'))
    //   ) {
    //     return true;
    //   }

    //   var pass = window.prompt(this.$t('input_password'));
    //   if (this.state.session_password === hashCode(pass) + '') {
    //     localstore.set('session_password', pass);
    //     this.$alertify
    //       .closeLogOnClick(true)
    //       .delay(4000)
    //       .success(this.$t('notifications["loading_dodoc"]'));

    //     return true;
    //   } else {
    //     this.$alertify
    //       .closeLogOnClick(true)
    //       .delay(4000)
    //       .error(this.$t('notifications["wrong_password_for_dodoc"]'));
    //   }

    //   return false;
    // };

    window.addEventListener('resize', () => {
      this.settings.windowWidth = window.innerWidth;
      this.settings.windowHeight = window.innerHeight;
    });

    this.currentTime = this.$moment().millisecond(0);
    setInterval(() => (this.currentTime = this.$moment().millisecond(0)), 1000);

    if (this.store.noticeOfError) {
      if (this.store.noticeOfError === 'failed_to_find_folder') {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t('notifications["failed_to_get_folder:"]') +
              ' ' +
              this.store.request.slugProjectName
          );
      }
    } else {
      if (window.state.dev_mode === 'debug') {
        console.log(
          'ROOT EVENT: created / no errors, checking for content to load'
        );
      }

      // if a slugProjectName or a metaFileName is requested, load the content of that folder rightaway
      // we are probably in a webbrowser that accesses a subfolder or a media
      if (this.store.request.slugProjectName) {
        this.$eventHub.$once('socketio.projects.folders_listed', () => {
          this.openProject(this.store.request.slugProjectName);
        });
        // requesting edit of a media
        if (this.store.request.metaFileName) {
          this.$eventHub.$once('socketio.projects.listMedias', () => {
            const metaFileName = this.store.request.metaFileName;
            this.media_modal.show_sidebar = false;
            this.openMedia({
              slugProjectName: this.store.request.slugProjectName,
              metaFileName
            });
          });
        }
      } else if (
        this.state.mode === 'export_publication' &&
        Object.keys(this.store.publications).length > 0
      ) {
        this.settings.current_publication.slug = Object.keys(
          this.store.publications
        )[0];
      } else if (
        this.state.mode === 'print_publication' &&
        Object.keys(this.store.publications).length > 0
      ) {
        this.settings.current_publication.slug = Object.keys(
          this.store.publications
        )[0];
        this.settings.show_publi_panel = true;
      }
    }

    /* à la connexion/reconnexion, détecter si un projet ou une publi sont ouverts 
    et si c’est le cas, rafraichir leur contenu (meta, medias) */
    this.$eventHub.$on('socketio.reconnect', () => {
      this.$socketio.listFolders({ type: 'authors' });
      this.$socketio.listFolders({ type: 'projects' });

      if (this.settings.current_publication.slug) {
        this.$socketio.listFolder({
          type: 'publications',
          slugFolderName: this.settings.current_publication.slug
        });
        this.$socketio.listMedias({
          type: 'publications',
          slugFolderName: this.settings.current_publication.slug
        });
      }
      if (this.do_navigation.current_slugProjectName) {
        this.$socketio.listFolder({
          type: 'projects',
          slugFolderName: this.do_navigation.current_slugProjectName
        });
        this.$socketio.listMedias({
          type: 'projects',
          slugFolderName: this.do_navigation.current_slugProjectName
        });
      }
    });

    window.onpopstate = event => {
      console.log(
        `ROOT EVENT: popstate with event.state.slugProjectName = ${
          event.state.slugProjectName
        }`
      );
      this.do_navigation.current_slugProjectName = event.state.slugProjectName;
    };

    window.addEventListener('tag.newTagDetected', this.newTagDetected);

    if (this.state.mode === 'live') {
      console.log('ROOT EVENT: created / now connecting with socketio');

      if (!this.$root.state.is_electron) {
        this.$eventHub.$on('socketio.connect', () => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications["connected_to_dodoc"]'));
        });
        this.$eventHub.$on('socketio.reconnect', () => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .success(this.$t('notifications["connected_to_dodoc"]'));
        });
      }

      if (this.$root.state.session_password === 'has_pass') {
        var session_storage_pwd = this.$auth.getSessionPasswordFromLocalStorage();
        if (session_storage_pwd) {
          this.$socketio.connect(session_storage_pwd);

          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .log(this.$t('notifications.using_saved_password'));

          this.$eventHub.$once('socketio.socketerror', () => {
            this.showSessionPasswordModal = true;
          });
        } else {
          this.showSessionPasswordModal = true;
        }

        this.$eventHub.$on('socketio.socketerror', () => {
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

      this.$eventHub.$once('socketio.authentificated', () => {
        this.$socketio.listFolders({ type: 'authors' });
        this.$socketio.listFolders({ type: 'projects' });
      });
    }
  },
  beforeDestroy() {},
  watch: {
    'settings.has_modal_opened': function() {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: var has changed: has_modal_opened: ${
            this.settings.has_modal_opened
          }`
        );
      }
      if (this.has_modal_opened) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    },
    'store.authors': function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: var has changed: store.authors`);
      }
      // check if, when store.authors refresh, the current_author is still there
      // delog if not
      if (
        this.settings.current_author &&
        !this.store.authors.hasOwnProperty(
          this.settings.current_author.slugFolderName
        )
      ) {
        this.unsetAuthor();
      }
    }
  },
  computed: {
    currentProject: function() {
      if (
        !this.store.hasOwnProperty('projects') ||
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
    projects_that_are_accessible() {
      const type = 'projects';
      return Object.values(this.store[type]).filter(p =>
        this.canAccessFolder({ type, slugFolderName: p.slugFolderName })
      );
    },
    current_publication_medias() {
      if (
        this.current_publication &&
        this.current_publication.hasOwnProperty('medias')
      ) {
        return this.current_publication.medias;
      }
      return false;
    },
    requested_media() {
      return this.store.projects[this.store.request.slugProjectName].medias[
        this.store.request.metaFileName
      ];
    },
    allAuthors() {
      let allAuthors = [];
      for (let slugAuthorName in this.store.authors) {
        let authorName = this.store.authors[slugAuthorName];
        allAuthors.push(authorName);
      }
      allAuthors = allAuthors.filter(function(item, pos) {
        return allAuthors.indexOf(item) == pos;
      });
      return allAuthors;
    },
    allKeywords() {
      let allKeywords = [];
      for (let slugProjectName in this.store.projects) {
        const project = this.store.projects[slugProjectName];
        let projectKeywords = project.keywords;
        if (!!projectKeywords) {
          projectKeywords.map(val => {
            allKeywords.push(val.title);
          });

          if (
            project.hasOwnProperty('medias') &&
            Object.keys(project.medias).length > 0
          ) {
            Object.values(project.medias).map(m => {
              if (m.hasOwnProperty('keywords') && m.keywords.length > 0) {
                allKeywords = allKeywords.concat(m.keywords.map(k => k.title));
              }
            });
          }
        }
      }
      allKeywords = allKeywords.filter(function(item, pos) {
        return allKeywords.indexOf(item) == pos;
      });

      return allKeywords.map(kw => {
        return {
          text: kw,
          classes: 'tagcolorid_' + (parseInt(kw, 36) % 2)
        };
      });
    },
    currentTime_human() {
      return this.$moment(this.currentTime).format('LL   LTS');
    },
    screen_is_wide() {
      if (this.settings.windowWidth < 750) {
        return false;
      }
      return true;
    }
  },
  methods: {
    getAllKeywordsFrom(base) {
      let uniqueKeywords = [];
      Object.values(base).map(meta => {
        if (!meta['keywords']) return;
        meta.keywords.map(k => {
          if (uniqueKeywords.indexOf(k.title) == -1)
            uniqueKeywords.push(k.title);
        });
      });
      uniqueKeywords = uniqueKeywords.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });

      return uniqueKeywords.map(kw => {
        return {
          text: kw,
          classes: 'tagcolorid_' + (parseInt(kw, 36) % 2)
        };
      });
    },
    getAllAuthorsFrom(base) {
      let uniqueAuthors = [];
      Object.values(base).map(meta => {
        if (!meta['authors']) return;
        if (typeof meta.authors === 'string') {
          meta.authors = [{ name: meta.authors }];
        }
        meta.authors.map(k => {
          if (uniqueAuthors.indexOf(k.name) == -1) uniqueAuthors.push(k.name);
        });
      });
      uniqueAuthors = uniqueAuthors.sort(function(a, b) {
        return a.toLowerCase().localeCompare(b.toLowerCase());
      });
      return uniqueAuthors.map(kw => {
        return {
          name: kw
        };
      });
    },
    createFolder: function(fdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: createfolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }

      this.justCreatedFolderID = fdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      this.$socketio.createFolder(fdata);
    },
    editFolder: function(fdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: editFolder: ${JSON.stringify(fdata, null, 4)}`
        );
      }
      this.$socketio.editFolder(fdata);
    },
    removeFolder: function({ type, slugFolderName }) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: removeFolder: slugFolderName = ${slugFolderName} of type = ${type}`
        );
      }
      this.$socketio.removeFolder({ type, slugFolderName });
    },
    createMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: createMedia`);
      }
      this.justCreatedMediaID = mdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      if (this.settings.current_author.hasOwnProperty('name')) {
        if (!mdata.hasOwnProperty('additionalMeta')) {
          mdata.additionalMeta = {};
        }
        mdata.additionalMeta.authors = [
          { name: this.settings.current_author.name }
        ];
      }

      this.$nextTick(() => {
        this.$socketio.createMedia(mdata);
      });
    },

    removeMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: removeMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }
      this.$socketio.removeMedia(mdata);
    },
    editMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },
    canAccessFolder: function({ type, slugFolderName }) {
      if (!this.store[type].hasOwnProperty(slugFolderName)) return false;

      // if folder doesn’t have a password set
      if (this.store[type][slugFolderName].password !== 'has_pass') {
        return true;
      }

      const has_reference_to_folder = this.state.list_authorized_folders.filter(
        i => {
          if (
            !!i &&
            i.hasOwnProperty('type') &&
            i.type === type &&
            i.hasOwnProperty('allowed_slugFolderNames') &&
            i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
          )
            return true;
          return false;
        }
      );

      if (has_reference_to_folder.length > 0) {
        return true;
      }
      return false;
    },
    openProject: function(slugProjectName) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: openProject: ${slugProjectName}`);
      }
      if (
        !this.store.projects.hasOwnProperty(slugProjectName) ||
        !this.canAccessFolder({
          type: 'projects',
          slugFolderName: slugProjectName
        })
      ) {
        console.log('Missing folder key on the page, aborting.');
        this.closeProject();
        return false;
      }

      this.do_navigation.view = 'ProjectView';
      this.do_navigation.current_slugProjectName = slugProjectName;

      this.$socketio.listMedias({
        type: 'projects',
        slugFolderName: slugProjectName
      });

      history.pushState(
        { slugProjectName },
        this.store.projects[slugProjectName].name,
        '/' + slugProjectName
      );
    },
    closeProject: function() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: closeProject');
      }

      this.do_navigation.view = 'ListView';
      this.do_navigation.current_slugProjectName = '';

      history.pushState({ slugProjectName: '' }, '', '/');
    },
    openMedia({ slugProjectName, metaFileName }) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: openMedia with slugProjectName = ${slugProjectName} and metaFileName = ${metaFileName}`
        );
      }

      this.media_modal.open = true;
      this.media_modal.minimized = false;
      this.media_modal.current_slugProjectName = slugProjectName;
      this.media_modal.current_metaFileName = metaFileName;
    },
    closeMedia: function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: closeMedia`);
      }

      this.media_modal.open = false;
    },
    setProjectKeywordFilter(newKeywordFilter) {
      if (this.settings.project_filter.keyword !== newKeywordFilter) {
        this.settings.project_filter.keyword = newKeywordFilter;
      } else {
        this.settings.project_filter.keyword = false;
      }
    },
    setProjectAuthorFilter(newAuthorFilter) {
      if (this.settings.project_filter.author !== newAuthorFilter) {
        this.settings.project_filter.author = newAuthorFilter;
      } else {
        this.settings.project_filter.author = false;
      }
    },
    setMediaKeywordFilter(newKeywordFilter) {
      if (this.settings.media_filter.keyword !== newKeywordFilter) {
        this.settings.media_filter.keyword = newKeywordFilter;
      } else {
        this.settings.media_filter.keyword = false;
      }
    },
    setMediaAuthorFilter(newAuthorFilter) {
      if (this.settings.media_filter.author !== newAuthorFilter) {
        this.settings.media_filter.author = newAuthorFilter;
      } else {
        this.settings.media_filter.author = false;
      }
    },
    setFavAuthorFilter(newFavFilter) {
      this.settings.media_filter.fav = !this.settings.media_filter.fav;
    },

    isMediaShown(media) {
      if (this.settings.media_filter.fav === true) {
        if (!media.fav) {
          return false;
        }
      }

      if (
        this.settings.media_filter.keyword === false &&
        this.settings.media_filter.author === false
      ) {
        return true;
      }

      if (
        this.settings.media_filter.keyword !== false &&
        this.settings.media_filter.author !== false
      ) {
        // only add to sorted array if project has this keyword
        if (
          media.hasOwnProperty('keywords') &&
          typeof media.keywords === 'object' &&
          media.keywords.filter(
            k => k.title === this.settings.media_filter.keyword
          ).length > 0
        ) {
          if (
            media.hasOwnProperty('authors') &&
            typeof media.authors === 'object' &&
            media.authors.filter(
              k => k.name === this.settings.media_filter.author
            ).length > 0
          ) {
            return true;
          }
        }
        return false;
      }
      // if a project keyword filter is set
      if (this.settings.media_filter.keyword !== false) {
        // only add to sorted array if project has this keyword
        if (
          media.hasOwnProperty('keywords') &&
          typeof media.keywords === 'object' &&
          media.keywords.filter(
            k => k.title === this.settings.media_filter.keyword
          ).length > 0
        ) {
          return true;
        }
        return false;
      }

      if (this.settings.media_filter.author !== false) {
        // only add to sorted array if project has this keyword
        if (
          media.hasOwnProperty('authors') &&
          typeof media.authors === 'object' &&
          media.authors.filter(
            k => k.name === this.settings.media_filter.author
          ).length > 0
        ) {
          return true;
        }
        return false;
      }
      // END MEDIA FILTER LOGIC
    },

    updateLocalLang: function(newLangCode) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateLocalLang');
      }
      i18n.locale = newLangCode;
      moment.locale(newLangCode);
      this.lang.current = newLangCode;

      const html = document.documentElement; // returns the html tag
      html.setAttribute('lang', newLangCode);

      localstore.set('language', newLangCode);
    },
    setAuthor: function(author) {
      this.settings.current_author = author;
      this.$socketio.socket.emit('updateClientInfo', { author });
    },
    unsetAuthor: function() {
      this.settings.current_author = false;
    },
    togglePubliPanel: function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: togglePubliPanel`);
      }
      if (this.settings.show_publi_panel) {
        this.closePubliPanel();
      } else {
        this.openPubliPanel();
      }
    },
    openPubliPanel: function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: openPubliPanel`);
      }
      this.settings.show_publi_panel = true;
      this.settings.current_publication.slug = false;

      this.$socketio.listFolders({ type: 'publications' });
    },
    closePubliPanel: function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: closePubliPanel`);
      }
      this.settings.show_publi_panel = false;
      this.settings.current_publication.slug = false;
    },

    openPublication(slugPubliName) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: openPublication: ${slugPubliName}`);
      }
      this.$socketio.listFolder({
        type: 'publications',
        slugFolderName: slugPubliName
      });
      this.$socketio.listMedias({
        type: 'publications',
        slugFolderName: slugPubliName
      });
      this.settings.current_publication.slug = slugPubliName;
    },
    closePublication() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: closePublication');
      }
      this.settings.current_publication.slug = false;
    },
    downloadPubliPDF({ slugPubliName }) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: downloadPubliPDF: ${slugPubliName}`);
      }
      this.$socketio.downloadPubliPDF({
        slugPubliName
      });
    },
    listSpecificMedias(mdata) {
      if (window.state.dev_mode === 'debug') {
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
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: setPublicationZoom with val = ${val}`);
      }
      this.settings.publi_zoom = val;
    },

    newTagDetected(e) {
      if (window.state.dev_mode === 'debug') {
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
        nfc_tag: e.detail
      });
      if (!author) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.no_content_found_with_nfc_tag'));
        return;
      }

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(
          this.$t('notifications.author_found_with_nfc_tag') +
            ' ' +
            `<button class="bg-blanc padding-none c-bleumarine font-thin">${
              author.name
            }</button>`
        );
      this.setAuthor(author);
    },

    switchLang() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: switchLang`);
      }
      if (this.lang.current === 'fr') {
        this.updateLocalLang('en');
      } else {
        this.updateLocalLang('fr');
      }
    },

    setMediaFilter(filter) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: setMediaFilter`);
      }

      this.settings.media_filter = filter;
    },
    unsetMediaFilter() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: unsetMediaFilter`);
      }
      this.settings.media_filter = {};
    },
    loadAllProjectsMedias() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: loadAllProjectsMedias`);
      }

      // in this.store.projects, find those that don’t have medias prop and
      // request their medias
      Object.keys(this.store.projects).forEach(slugProjectName => {
        const project_meta = this.store.projects[slugProjectName];
        this.$socketio.listMedias({
          type: 'projects',
          slugFolderName: slugProjectName
        });
      });

      let number_of_projects_to_load_medias_to = Object.keys(
        this.store.projects
      ).length;

      this.$eventHub.$on('socketio.projects.listMedias', () => {
        number_of_projects_to_load_medias_to--;
        if (number_of_projects_to_load_medias_to === 0) {
          this.$eventHub.$emit('socketio.has_finished_loading_all_medias');
        }
      });

      setTimeout(() => {
        this.$eventHub.$emit('socketio.has_finished_loading_all_medias');
      }, 5000);
    },
    formatDateToHuman(date) {
      return this.$moment(date, 'YYYY-MM-DD HH:mm:ss').format('LL');
    },
    updateNetworkInfos() {
      this.$socketio.updateNetworkInfos();
    },
    navigation_back() {
      if (this.do_navigation.view === 'CaptureView') {
        this.do_navigation.view = 'ProjectView';
      } else if (this.do_navigation.view === 'ProjectView') {
        this.closeProject();
      }
    }
  }
});
