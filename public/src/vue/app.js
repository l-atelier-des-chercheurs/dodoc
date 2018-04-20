/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from 'vue';

import localstore from 'store';
import alertify from 'alertify.js';
Vue.prototype.$alertify = alertify;

import locale_strings from './locale_strings.js';

Vue.config.silent = false;
Vue.config.devtools = true;

Vue.prototype.$eventHub = new Vue(); // Global event bus

import VueScrollTo from 'vue-scrollto';
Vue.use(VueScrollTo);

import PortalVue from 'portal-vue';
Vue.use(PortalVue);

import VueI18n from 'vue-i18n';
Vue.use(VueI18n);

let lang_settings = {
  available: {
    fr: 'Français',
    en: 'English'
  },
  default: 'en',
  current: '',
  init: function() {
    let localstore_lang = localstore.get('language');

    // has lang set
    if (localstore_lang !== undefined) {
      // exists in available
      if (this.available[localstore_lang] !== undefined) {
        this.current = localstore_lang;
      }
    }

    if (this.current === '') {
      // set current lang from
      let browserLangIsAvailable = Object.keys(this.available).filter(x => {
        return x === window.navigator.language;
      });
      if (browserLangIsAvailable.length > 0) {
        this.current = browserLangIsAvailable[0];
      }
    }

    if (this.current === '') {
      this.current = 'en';
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
import io from 'socket.io-client';

Vue.prototype.$socketio = new Vue({
  i18n,
  data: {
    socket: ''
  },
  methods: {
    connect() {
      if (window.navigator.userAgent.indexOf('Chrome') > -1) {
        this.socket = io.connect({ transports: ['websocket', 'polling'] });
      } else {
        this.socket = io.connect({ transports: ['polling', 'websocket'] });
      }
      this.socket.on('connect', this._onSocketConnect);
      this.socket.on('error', this._onSocketError);
      this.socket.on('connect_error', this._onConnectError);
      this.socket.on('authentificated', this._authentificated);
      this.socket.on('listMedia', this._onListMedia);
      this.socket.on('listMedias', this._onListMedias);
      this.socket.on('listFolder', this._onListFolder);
      this.socket.on('listFolders', this._onListFolders);
      this.socket.on('notify', this._onNotify);
      this.socket.on('gotTagUID', this._gotTagUID);
    },
    _onSocketConnect() {
      let sessionId = this.socket.io.engine.id;
      console.log(`Connected as ${sessionId}`);

      window.state.connected = true;

      // only for non-electron (since obviously in electron we have to be connected)
      if (!window.state.is_electron) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(this.$t('notifications.connection_active'));
      }
      // TODO : reenable auth for folders and publications
      this.listFolders({ type: 'projects' });
      this.listFolders({ type: 'authors' });
      // this.sendAuth();
    },

    sendAuth() {
      let admin_access = auth.getAdminAccess();
      console.log(
        `Asking for auth with ${JSON.stringify(admin_access, null, 4)}`
      );
      this.socket.emit('authenticate', { admin_access });
    },

    _onSocketError(reason) {
      console.log(`Unable to connect to server: ${reason}`);
      window.state.connected = false;
      this.$alertify
        .closeLogOnClick(true)
        .error(this.$t('notifications.connection_error') + ' ' + reason);
    },

    _onConnectError(reason) {
      console.log(`Lost connection to server: ${reason}`);
      window.state.connected = false;
      this.$alertify
        .closeLogOnClick(true)
        .error(
          this.$t('notifications.connection_lost') +
            '<br>' +
            this.$t('notifications.contents_wont_be_editable')
        );
    },

    // _authentificated(list_admin_folders) {
    //   console.log(
    //     `Admin for projects ${JSON.stringify(list_admin_folders, null, 4)}`
    //   );

    //   // compare local store and answer from server
    //   // for each key that is not in the answer, let’s send and alert to notify that the password is most likely wrong or the folder name has changed
    //   if (auth.getAdminAccess() !== undefined) {
    //     let admin_access = Object.keys(auth.getAdminAccess());
    //     admin_access.forEach(slugFolderName => {
    //       if (
    //         list_admin_folders === undefined ||
    //         list_admin_folders.indexOf(slugFolderName) === -1
    //       ) {
    //         this.$alertify
    //           .closeLogOnClick(true)
    //           .delay(4000)
    //           .error(
    //             this.$t('notifications["wrong_password_for_folder:"]') +
    //               ' ' +
    //               slugFolderName
    //           );
    //         auth.removeKey(slugFolderName);
    //       } else {
    //       }
    //     });
    //   }

    //   window.dispatchEvent(
    //     new CustomEvent('socketio.connected_and_authentified')
    //   );
    //   this.listFolders();
    // },

    _onListMedia(mdata) {
      console.log('Received _onListMedia packet.');
      let slugProjectName = Object.keys(mdata)[0];
      console.log(`Media data is for ${slugProjectName}.`);

      let mediaData = Object.values(mdata[slugProjectName].medias)[0];
      let slugMediaName = Object.keys(mdata[slugProjectName].medias)[0];
      mediaData.slugMediaName = slugMediaName;

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .log(
          this.$t('notifications["created_edited_media:"]') +
            ' ' +
            window.store.projects[slugProjectName].name
        );

      window.store.projects[slugProjectName].medias = Object.assign(
        {},
        window.store.projects[slugProjectName].medias,
        mdata[slugProjectName].medias
      );

      // check if mediaData has a mediaID (which would mean a user just created it)
      if (mediaData.hasOwnProperty('id')) {
        this.$eventHub.$emit('socketio.new_media_captured', mediaData);
      }
    },

    _onListMedias(mdata) {
      console.log('Received _onListMedias packet.');
      let slugProjectName = Object.keys(mdata)[0];
      console.log(`Media data is for ${slugProjectName}.`);

      window.store.projects[slugProjectName].medias =
        mdata[slugProjectName].medias;

      window.dispatchEvent(
        new CustomEvent('timeline.listMediasForProject', {
          detail: slugProjectName
        })
      );
    },

    // for projects, authors and publications
    _onListFolder(data) {
      console.log('Received _onListFolder packet.');
      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      // to prevent override of fully formed medias in folders, we copy back the ones we have already
      for (let slugFolderName in content) {
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          content[slugFolderName].medias =
            window.store[type][slugFolderName].medias;
        }
      }

      window.store[type] = Object.assign({}, window.store[type], content);
    },

    // for projects, authors and publications
    _onListFolders(data) {
      console.log('Received _onListFolders packet.');

      if (typeof data !== 'object') {
        return;
      }

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      // to prevent override of fully formed medias in folders, we copy back the ones we have already
      for (let slugFolderName in content) {
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          content[slugFolderName].medias =
            window.store[type][slugFolderName].medias;
        }
      }
      window.store[type] = Object.assign({}, content);
      window.dispatchEvent(new CustomEvent('socketio.folders_listed'));
    },
    _onNotify(msg) {
      console.log('Received _onNotify packet.');

      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .error(this.$t(`notifications[${msg}]`));
    },
    _gotTagUID(tag) {
      console.log('Received _gotTagUID packet.');
      this.$eventHub.$emit('socketio.got_tag', tag);
    },

    listFolders(fdata) {
      this.socket.emit('listFolders', fdata);
    },
    createFolder(fdata) {
      this.socket.emit('createFolder', fdata);
    },
    editFolder(fdata) {
      this.socket.emit('editFolder', fdata);
    },
    removeFolder(fdata) {
      this.socket.emit('removeFolder', fdata);
    },

    listMedias(mdata) {
      this.socket.emit('listMedias', mdata);
    },
    createTextMedia(mdata) {
      this.socket.emit('createTextMedia', mdata);
    },
    createMediaFromCapture(mdata) {
      this.socket.emit('createMediaFromCapture', mdata);
    },
    editMedia(mdata) {
      this.socket.emit('editMedia', mdata);
    },
    removeMedia(mdata) {
      this.socket.emit('removeMedia', mdata);
    }
  }
});

import App from './App.vue';

let vm = new Vue({
  // eslint-disable-line no-new
  i18n,
  el: '#app',
  components: { App },
  template: `
    <App
      :current_slugProjectName="settings.current_slugProjectName"
      :currentProject="currentProject"
    />
  `,
  data: {
    store: window.store,
    state: window.state,

    justCreatedTextmediaID: false,
    justCreatedFolderID: false,
    justCreatedCapturedMediaID: false,

    settings: {
      has_modal_opened: false,
      current_slugProjectName: '',
      show_publi_panel: false,
      view: 'ListView',
      current_author: false,
      has_sidebar_opened: false,
      highlightMedia: '',
      is_loading_medias_for_project: '',
      enable_system_bar: window.state.is_electron && window.state.is_darwin
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
    if (this.settings.enable_system_bar) {
      document.body.classList.add('has_systembar');
    }

    if (window.state.dev_mode === 'debug') {
      console.log('ROOT EVENT: created / checking for errors');
    }

    this.$eventHub.$on('socketio.got_tag', this.handle_new_tag);

    if (this.store.noticeOfError) {
      if (this.store.noticeOfError === 'failed_to_find_folder') {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t('notifications["failed_to_get_folder:"]') +
              ' ' +
              this.store.slugProjectName
          );
      }
    } else {
      if (window.state.dev_mode === 'debug') {
        console.log(
          'ROOT EVENT: created / no errors, checking for content to load'
        );
      }

      // if no error and if we have some content already loaded, let’s open it directly
      // (we are probably in an exported timeline)
      if (Object.keys(this.store.projects).length > 0) {
        this.settings.current_slugProjectName = Object.keys(
          this.store.projects
        )[0];
      } else {
        // if a slugProjectName is requested, load the content of that folder rightaway
        // we are probably in a webbrowser that accesses a subfolder
        if (this.store.slugProjectName) {
          this.settings.current_slugProjectName = this.store.slugProjectName;
          this.settings.is_loading_medias_for_project = this.store.slugProjectName;
          window.addEventListener(
            'socketio.folders_listed',
            () => {
              this.openProject(this.store.slugProjectName);
            },
            { once: true }
          );
        }
      }
    }

    window.onpopstate = event => {
      console.log(
        `ROOT EVENT: popstate with event.state.slugProjectName = ${
          event.state.slugProjectName
        }`
      );
      this.settings.current_slugProjectName = event.state.slugProjectName;
    };

    if (this.state.mode === 'live') {
      console.log('ROOT EVENT: created / now connecting with socketio');
      this.$socketio.connect();
    }
  },
  beforeDestroy() {
    this.$eventHub.$off('socketio.got_tag', this.handle_new_tag);
  },
  methods: {
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

    createTextMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: createTextMedia: ${JSON.stringify(mdata, null, 4)}`
        );
      }

      this.justCreatedTextmediaID = mdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);

      this.$socketio.createTextMedia(mdata);
    },

    createMediaFromCapture: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: createMediaFromCapture`);
      }

      this.justCreatedCapturedMediaID = mdata.id =
        Math.random()
          .toString(36)
          .substring(2, 15) +
        Math.random()
          .toString(36)
          .substring(2, 15);
      this.$socketio.createMediaFromCapture(mdata);
    },

    removeMedia: function({ slugFolderName, slugMediaName }) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: removeMedia: ${slugFolderName}/${slugMediaName}`
        );
      }
      this.$socketio.removeMedia({ slugFolderName, slugMediaName });
    },
    editMedia: function(mdata) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: editMedia: ${JSON.stringify(mdata, null, 4)}`);
      }
      this.$socketio.editMedia(mdata);
    },

    handle_new_tag: function(tag) {
      if (window.state.is_electron) {
        const tagged_author_key = Object.keys(this.$root.store.authors).filter(
          a => {
            let author_info = this.$root.store.authors[a];
            return author_info.tag === tag;
          }
        );
        const author_info = this.$root.store.authors[tagged_author_key];
        this.setAuthor(author_info);
      }
    },

    openProject: function(slugProjectName) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: openProject: ${slugProjectName}`);
      }
      if (!this.store.projects.hasOwnProperty(slugProjectName)) {
        console.log('Missing folder key on the page, aborting.');
        this.closeProject();
        return false;
      }

      this.settings.view = 'ProjectView';
      this.settings.current_slugProjectName = slugProjectName;
      this.settings.is_loading_medias_for_project = slugProjectName;
      this.$socketio.listMedias({ slugFolderName: slugProjectName });

      history.pushState(
        { slugProjectName },
        this.store.projects[slugProjectName].name,
        '/' + slugProjectName
      );
      window.addEventListener(
        'timeline.listMediasForProject',
        this.listMediasForProject
      );
    },
    closeProject: function() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: closeProject');
      }

      this.settings.view = 'ListView';
      this.settings.current_slugProjectName = '';

      history.pushState({ slugProjectName: '' }, '', '/');
    },
    listMediasForProject: function(e) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: listMediasForProject');
      }
      if (e.detail === this.settings.is_loading_medias_for_project) {
        this.settings.is_loading_medias_for_project = '';
      }
    },
    updateLocalLang: function(newLangCode) {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: updateLocalLang');
      }
      i18n.locale = newLangCode;
      moment.locale(newLangCode);

      const html = document.documentElement; // returns the html tag
      html.setAttribute('lang', newLangCode);

      localstore.set('language', newLangCode);
    },
    setAuthor: function(author) {
      this.settings.current_author = author;
    },
    togglePubliPanel: function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: togglePubliPanel`);
      }
      this.settings.show_publi_panel = !this.settings.show_publi_panel;

      if (this.settings.show_publi_panel) {
        this.$socketio.listFolders({ type: 'publications' });
      }
    }
  },
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
    }
  },
  computed: {
    currentProject: function() {
      if (
        this.store.hasOwnProperty('projects') &&
        this.store.projects.hasOwnProperty(
          this.settings.current_slugProjectName
        )
      ) {
        return this.store.projects[this.settings.current_slugProjectName];
      }
      return {};
    }
  }
});
