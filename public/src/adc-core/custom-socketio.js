import io from 'socket.io-client';
import Vue from 'vue';

module.exports = (function() {
  return {
    init: function(i18n, auth) {
      return new Vue({
        i18n,
        data: {
          socket: ''
        },
        methods: {
          connect() {
            let opts = { transports: ['polling', 'websocket'] };
            if (window.navigator.userAgent.indexOf('Chrome') > -1) {
              opts = { transports: ['websocket', 'polling'] };
            }
            this.socket = io.connect(opts);

            this.socket.on('connect', this._onSocketConnect);
            this.socket.on('reconnect', this._onReconnect);
            this.socket.on('pong', this._onPong);
            this.socket.on('error', this._onSocketError);
            this.socket.on('connect_error', this._onConnectError);
            this.socket.on('authentificated', this._authentificated);
            this.socket.on('listMedia', this._onListMedia);
            this.socket.on('listMedias', this._onListMedias);

            this.socket.on('listFolder', this._onListFolder);
            this.socket.on('listFolders', this._onListFolders);

            this.socket.on('listSpecificMedias', this._onListSpecificMedias);
            this.socket.on('publiPDFGenerated', this._onPubliPDFGenerated);
            this.socket.on('publiVideoGenerated', this._onPubliVideoGenerated);
            this.socket.on(
              'publiStopmotionIsGenerated',
              this._onPubliStopmotionGenerated
            );

            this.socket.on('newNetworkInfos', this._onNewNetworkInfos);

            this.socket.on('notify', this._onNotify);

            this.socket.on('pong', this._onPong);

            this.socket.on('listClients', this._listClients);
          },
          _onSocketConnect() {
            let sessionId = this.socket.io.engine.id;
            console.log(`Connected as ${sessionId}`);

            window.state.connected = true;

            this.socket.emit('updateClientInfo', {});
            this.sendAuth();

            // this.listFolders({ type: 'authors' });
            // this.sendAuth();
          },

          _onReconnect() {
            this.sendAuth();
            this.$eventHub.$emit('socketio.reconnect');
            console.log(`Reconnected`);
          },

          _onPong() {
            console.log(`_onPong`);
          },

          sendAuth() {
            let folder_passwords = auth.getAdminAccess();
            console.log(
              `Asking for auth with ${JSON.stringify(
                folder_passwords,
                null,
                4
              )}`
            );
            this.socket.emit('authenticate', { folder_passwords });
          },

          _onSocketError(reason) {
            console.log(`Unable to connect to server: ${reason}`);
            window.state.connected = false;
          },

          _onConnectError(reason) {
            console.log(`Lost connection to server: ${reason}`);
            window.state.connected = false;
          },

          _authentificated(list_authorized_folders) {
            console.log(
              `Admin for ${JSON.stringify(list_authorized_folders, null, 4)}`
            );
            window.state.list_authorized_folders = list_authorized_folders;

            // got list of items admin for, update localstore with that info
            let folder_passwords = auth.getAdminAccess();
            let clean_folder_passwords = {};

            /* 
            {
              projects: {
                bonjour: mon-mot-de-passe
                hello: mdp2
              },
              author: {
                jean: Hello world !
              }
            }
            */

            // list_authorized_folders.map(i => {
            //   if (
            //     !i.hasOwnProperty('allowed_slugFolderNames') ||
            //     !i.hasOwnProperty('type')
            //   )
            //     return;

            //   const type = i.type;

            //   if (!clean_folder_passwords.hasOwnProperty(type)) {
            //     clean_folder_passwords[type] = {};
            //   }

            //   i.allowed_slugFolderNames.map(slugFolderName => {
            //     if(folder_passwords.hasOwnProperty())
            //     // clean_folder_passwords[type];
            //   });
            // });
            // auth.updateAdminAccess();

            this.$eventHub.$emit(`socketio.authentificated`);
          },

          _onListMedia(data) {
            console.log('Received _onListMedia packet.');

            let type = Object.keys(data)[0];
            let content = Object.values(data)[0];

            console.log(`Type is ${type}`);

            for (let slugFolderName in content) {
              console.log(`Media data is for ${slugFolderName}.`);
              if (window.store[type].hasOwnProperty(slugFolderName)) {
                window.store[type][slugFolderName].medias = Object.assign(
                  {},
                  window.store[type][slugFolderName].medias,
                  content[slugFolderName].medias
                );

                // check if mdata has a mediaID (which would mean a user just created it)
                const mdata = Object.values(content[slugFolderName].medias)[0];
                if (mdata.hasOwnProperty('id')) {
                  this.$eventHub.$emit(
                    'socketio.media_created_or_updated',
                    mdata
                  );
                }
              }
            }

            this.$eventHub.$emit(`socketio.${type}.listMedia`);
          },

          _onListMedias(data) {
            console.log('Received _onListMedias packet.');

            let type = Object.keys(data)[0];
            let content = Object.values(data)[0];

            console.log(`Type is ${type}`);

            for (let slugFolderName in content) {
              console.log(`Media data is for ${slugFolderName}.`);
              if (window.store[type].hasOwnProperty(slugFolderName)) {
                window.store[type][slugFolderName].medias =
                  content[slugFolderName].medias;
              }
            }
            this.$eventHub.$emit(`socketio.${type}.listMedias`);
          },

          _onListSpecificMedias(data) {
            console.log('Received _onListSpecificMedias packet.');

            let type = Object.keys(data)[0];
            let content = Object.values(data)[0];

            console.log(`Type is ${type}`);

            for (let slugFolderName in content) {
              console.log(`Media data is for ${slugFolderName}.`);
              if (
                window.store[type].hasOwnProperty(slugFolderName) &&
                window.store[type][slugFolderName].hasOwnProperty('medias')
              ) {
                window.store[type][slugFolderName].medias = Object.assign(
                  {},
                  window.store[type][slugFolderName].medias,
                  content[slugFolderName].medias
                );
              }
            }
            this.$eventHub.$emit(`socketio.${type}.listSpecificMedias`);
          },

          _onPubliPDFGenerated(data) {
            console.log('Received _onPubliPDFGenerated packet.');
            this.$eventHub.$emit('socketio.publication.pdfIsGenerated', data);
          },

          _onPubliVideoGenerated(data) {
            console.log('Received _onPubliVideoGenerated packet.');
            this.$eventHub.$emit('socketio.publication.videoIsGenerated', data);
          },
          _onPubliStopmotionGenerated(data) {
            console.log('Received _onPubliStopmotionGenerated packet.');
            this.$eventHub.$emit(
              'socketio.publication.publiStopmotionIsGenerated',
              data
            );
          },

          _listClients(data) {
            console.log('Received _listClients packet.');
            window.state.clients = data;
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
              if (content[slugFolderName].hasOwnProperty('id')) {
                this.$eventHub.$emit(
                  'socketio.folder_created_or_updated',
                  content[slugFolderName]
                );
              }
            }

            window.store[type] = Object.assign({}, window.store[type], content);
            this.$eventHub.$emit(`socketio.${type}.folder_listed`);
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

            this.$eventHub.$emit(`socketio.${type}.folders_listed`);
          },
          _onNewNetworkInfos(data) {
            console.log('Received _onNewNetworkInfos packet.');
            window.state.localNetworkInfos = data;
          },
          _onNotify({ localized_string, not_localized_string }) {
            console.log('Received _onNotify packet.');
            if (not_localized_string) {
              alertify
                .closeLogOnClick(true)
                .delay(4000)
                .log(not_localized_string);
            }
            if (localized_string) {
              alertify
                .closeLogOnClick(true)
                .delay(4000)
                .log(this.$t(`notifications['${localized_string}']`));
            }
          },
          listFolders(fdata) {
            this.socket.emit('listFolders', fdata);
          },
          listFolder(fdata) {
            this.socket.emit('listFolder', fdata);
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
          listSpecificMedias(mdata) {
            this.socket.emit('listSpecificMedias', mdata);
          },
          downloadPubliPDF(pdata) {
            this.socket.emit('downloadPubliPDF', pdata);
          },
          downloadVideoPubli(pdata) {
            this.socket.emit('downloadVideoPubli', pdata);
          },
          downloadStopmotionPubli(pdata) {
            this.socket.emit('downloadStopmotionPubli', pdata);
          },
          addTempMediaToFolder(pdata) {
            this.socket.emit('addTempMediaToFolder', pdata);
          },
          updateNetworkInfos() {
            this.socket.emit('updateNetworkInfos');
          }
        }
      });
    }
  };
})();
