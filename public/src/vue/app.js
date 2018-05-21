/** *********
  VUE
***********/

// The following line loads the standalone build of Vue instead of the runtime-only build,
// so you don't have to do: import Vue from 'vue/dist/vue'
// This is done with the browser options. For the config, see package.json
import Vue from 'vue';

import localstore from 'store';
import _ from 'underscore';
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
      // used in publications
      this.socket.on('listSomeMedias', this._onListSomeMedias);
      this.socket.on('listFolder', this._onListFolder);
      this.socket.on('listFolders', this._onListFolders);

      this.socket.on('listSpecificMedias', this._onListSpecificMedias);

      this.socket.on('notify', this._onNotify);
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

    _onListMedia(data) {
      console.log('Received _onListMedia packet.');
      debugger;
      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      for (let slugFolderName in content) {
        console.log(`Media data is for ${slugFolderName}.`);
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          // window.store[type][slugFolderName].medias =
          //   content[slugFolderName].medias;
          window.store[type][slugFolderName].medias = Object.assign(
            {},
            window.store[type][slugFolderName].medias,
            content[slugFolderName].medias
          );

          debugger;

          const mediaData = Object.values(content[slugFolderName].medias)[0];

          if (mediaData.hasOwnProperty('id')) {
            this.$eventHub.$emit('socketio.new_media_captured', mediaData);
          }

          window.dispatchEvent(
            new CustomEvent(`${type}.listMedia`, {
              detail: slugFolderName
            })
          );
        }
      }

      // check if mediaData has a mediaID (which would mean a user just created it)
    },

    _onListMedias(data) {
      console.log('Received _onListMedias packet.');

      let type = Object.keys(data)[0];
      let content = Object.values(data)[0];

      console.log(`Type is ${type}`);

      for (let slugFolderName in content) {
        console.log(`Media data is for ${slugFolderName}.`);
        if (
          window.store[type].hasOwnProperty(slugFolderName) &&
          window.store[type][slugFolderName].hasOwnProperty('medias')
        ) {
          // window.store[type][slugFolderName].medias =
          //   content[slugFolderName].medias;
          window.store[type][slugFolderName].medias =
            content[slugFolderName].medias;

          window.dispatchEvent(
            new CustomEvent(`${type}.listMedias`, {
              detail: slugFolderName
            })
          );
        }
      }
    },

    _onListSpecificMedias(data) {
      console.log('Received _onListSomeMedias packet.');

      Object.keys(data).map(slugProjectName => {
        window.store.projects[slugProjectName].medias = Object.assign(
          {},
          window.store.projects[slugProjectName].medias,
          data[slugProjectName].medias
        );

        // Object.keys(mdata[slugProjectName].medias).map(m => {
        //   const meta = mdata[slugProjectName].medias[m];
        //   window.store.projects[slugProjectName].medias[m] = meta;
        // });
        this.$eventHub.$emit('publication.listSpecificMedias');
      });
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
    createMedia(mdata) {
      this.socket.emit('createMedia', mdata);
    },
    editMedia(mdata) {
      this.socket.emit('editMedia', mdata);
    },
    removeMedia(mdata) {
      this.socket.emit('removeMedia', mdata);
    },
    listSpecificMedias(media_list) {
      this.socket.emit('listSpecificMedias', media_list);
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
    />
  `,
  data: {
    store: window.store,
    state: window.state,

    justCreatedFolderID: false,
    justCreatedMediaID: false,

    settings: {
      has_modal_opened: false,

      current_slugProjectName: false,
      current_slugPubliName: false,
      current_author: false,
      showMediaModalFor: false,

      publi_zoom: 1,

      show_publi_panel: false,
      view: 'ListView',
      has_sidebar_opened: false,
      highlightMedia: '',
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

    window.addEventListener('tag.newTagDetected', this.newTagDetected);

    if (this.state.mode === 'live') {
      console.log('ROOT EVENT: created / now connecting with socketio');
      this.$socketio.connect();
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
      this.$socketio.createMedia(mdata);
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
      this.$socketio.listMedias({
        type: 'projects',
        slugFolderName: slugProjectName
      });

      history.pushState(
        { slugProjectName },
        this.store.projects[slugProjectName].name,
        '/' + slugProjectName
      );
      // window.addEventListener('project.listMedias', this.listMediasForProject);
    },
    closeProject: function() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: closeProject');
      }

      this.settings.view = 'ListView';
      this.settings.current_slugProjectName = '';

      history.pushState({ slugProjectName: '' }, '', '/');
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
    },
    unsetAuthor: function() {
      this.settings.current_author = false;
    },
    togglePubliPanel: function() {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: togglePubliPanel`);
      }
      this.settings.show_publi_panel = !this.settings.show_publi_panel;
      this.settings.current_slugPubliName = false;

      if (this.settings.show_publi_panel) {
        this.$socketio.listFolders({ type: 'publications' });
      }
    },
    openPublication(slugPubliName) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: openPublication: ${slugPubliName}`);
      }
      this.$socketio.listMedias({
        type: 'publications',
        slugFolderName: slugPubliName
      });
      this.settings.current_slugPubliName = slugPubliName;
    },
    closePublication() {
      if (window.state.dev_mode === 'debug') {
        console.log('ROOT EVENT: closePublication');
      }
      this.settings.current_slugPubliName = false;
    },

    listSpecificMedias(medias_list) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: listSpecificMedias with medias_list = ${JSON.stringify(
            medias_list,
            null,
            4
          )}`
        );
      }
      this.$socketio.listSpecificMedias(medias_list);
    },

    showMediaModalFor({ slugProjectName, slugMediaName }) {
      if (window.state.dev_mode === 'debug') {
        console.log(
          `ROOT EVENT: showMediaModalFor with slugProjectName = ${slugProjectName} and slugMediaName = ${slugMediaName}`
        );
      }
      this.settings.showMediaModalFor = {
        slugProjectName,
        slugMediaName
      };
    },
    setPublicationZoom(val) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: setPublicationZoom`);
      }
      this.settings.publi_zoom = val;
    },

    newTagDetected(e) {
      if (window.state.dev_mode === 'debug') {
        console.log(`ROOT EVENT: newTagDetected with e.detail = ${e.detail}`);
      }
      const author = _.findWhere(this.store.authors, {
        nfc_tag: e.detail
      });
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
    }
  }
});
