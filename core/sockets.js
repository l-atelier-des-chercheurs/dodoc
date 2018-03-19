const dev = require('./dev-log'),
  api = require('./api'),
  auth = require('./auth');

const file = require('./file');

module.exports = (function() {
  dev.log(`Main module initialized at ${api.getCurrentDate()}`);
  let app;
  let io;
  let electronApp;

  const API = {
    init: (app, io, electronApp) => init(app, io, electronApp),
    createMediaMeta: (slugFolderName, slugMediaName, additionalMeta) =>
      createMediaMeta(slugFolderName, slugMediaName, additionalMeta),
    pushMessage: msg => pushMessage(msg)
  };

  function init(thisApp, thisIO, thisElectronApp) {
    dev.log(`Initializing socket module`);

    app = thisApp;
    io = thisIO;
    electronApp = thisElectronApp;

    io.on('connection', function(socket) {
      var onevent = socket.onevent;
      socket.onevent = function(packet) {
        var args = packet.data || [];
        onevent.call(this, packet); // original call
        packet.data = ['*'].concat(args);
        onevent.call(this, packet); // additional call to catch-all
      };
      socket.on('*', function(event, data) {
        dev.log(`RECEIVED EVENT: ${event}`);
      });

      socket.on('authenticate', function(data) {
        onAuthenticate(socket, data);
      });

      socket.on('listFolders', function() {
        onListFolders(socket);
      });
      socket.on('createFolder', function(data) {
        onCreateFolder(socket, data);
      });
      socket.on('removeFolder', function(data) {
        onRemoveFolder(socket, data);
      });
      socket.on('editFolder', function(data) {
        onEditFolder(socket, data);
      });

      socket.on('listMedias', function(data) {
        onListMedias(socket, data);
      });
      socket.on('createTextMedia', function(data) {
        onCreateTextMedia(socket, data);
      });
      socket.on('editMedia', function(data) {
        onEditMedia(socket, data);
      });
      socket.on('removeMedia', function(data) {
        onRemoveMedia(socket, data);
      });
    });
  }

  /**************************************************************** UTIL ********************************/
  function onAuthenticate(socket, d) {
    dev.logfunction(`EVENT - onAuthenticate for ${JSON.stringify(d, null, 4)}`);
    auth
      .setAuthenticate(socket.id, d.admin_access)
      .then(list_admin_folders => {
        api.sendEventWithContent(
          'authentificated',
          list_admin_folders,
          io,
          socket
        );
      })
      .catch(err => {
        api.sendEventWithContent('authentificated', {}, io, socket);
      });
  }

  function pushMessage(msg) {
    dev.logfunction(`EVENT - pushMessage ${msg}`);
    api.sendEventWithContent('authentificated', {}, io, socket);
  }

  /**************************************************************** FOLDER ********************************/
  function onListFolders(socket) {
    dev.logfunction(`EVENT - onListFolders`);
    sendFolders({ socket });
  }
  function onCreateFolder(socket, d) {
    dev.logfunction(`EVENT - onCreateFolder for ${d.name}`);
    file.createFolder(d).then(
      slugFolderName => {
        sendFolders({ slugFolderName, folderID: d.folderID });
      },
      function(err) {
        dev.error(`Failed to list folders! Error: ${err}`);
      }
    );
  }
  function onEditFolder(socket, d) {
    dev.logfunction(`EVENT - onEditFolder for ${d.slugFolderName}`);
    if (!d.hasOwnProperty('slugFolderName')) {
      dev.error(`Missing slugFoldername for edit event.`);
    }

    // check if allowed
    file.getFolder(d.slugFolderName).then(
      foldersData => {
        if (!auth.hasFolderAuth(socket.id, foldersData)) {
          return;
        }
        file
          .editFolder(foldersData[d.slugFolderName], d)
          .then(slugFolderName => {
            sendFolders({ slugFolderName });
          });
      },
      function(err, p) {
        dev.error(`Failed to edit folder: ${err}`);
        reject(err);
      }
    );
  }
  function onRemoveFolder(socket, slugFolderName) {
    dev.logfunction(`EVENT - onRemoveFolder for ${slugFolderName}`);
    // check if allowed
    file.getFolder(slugFolderName).then(
      foldersData => {
        if (!auth.hasFolderAuth(socket.id, foldersData)) {
          return;
        }
        file.removeFolder(slugFolderName).then(
          () => {
            sendFolders();
          },
          function(err, p) {
            dev.error(`Failed to remove folder: ${err}`);
            reject(err);
          }
        );
      },
      function(err, p) {
        dev.error(`Failed to remove folder: ${err}`);
        reject(err);
      }
    );
  }

  /**************************************************************** MEDIA ********************************/

  function onListMedias(socket, d) {
    dev.logfunction(`EVENT - onListMedias : ${JSON.stringify(d, null, 4)}`);
    sendMedias({ slugFolderName: d.slugFolderName, socket });
  }

  function onCreateTextMedia(socket, d) {
    dev.logfunction(
      `EVENT - onCreateTextMedia : ${JSON.stringify(d, null, 4)}`
    );
    file
      .createTextMedia(d)
      .then(textMediaMeta => {
        file
          .createMediaMeta(
            d.slugFolderName,
            textMediaMeta.slugMediaName,
            textMediaMeta.additionalMeta
          )
          .then(() =>
            sendMedias({
              slugFolderName: d.slugFolderName,
              slugMediaName: textMediaMeta.slugMediaName,
              mediaID: d.mediaID
            })
          )
          .catch(err => {
            dev.error(`Couldn’t create text media meta: ${err}`);
            reject(err);
          });
      })
      .catch(err => {
        dev.error(`Couldn’t create text media: ${err}`);
        reject(err);
      });
  }

  function createMediaMeta(slugFolderName, slugMediaName, additionalMeta) {
    dev.logfunction(
      `EVENT - createMediaMeta for ${slugFolderName}/${slugMediaName}`
    );
    dev.logverbose(
      `Has additional meta: ${JSON.stringify(additionalMeta, null, 4)}`
    );
    file.createMediaMeta(slugFolderName, slugMediaName, additionalMeta).then(
      () => {
        sendMedias({ slugFolderName, slugMediaName });
      },
      function(err) {
        dev.error(`Failed to list medias! Error: ${err}`);
      }
    );
  }

  function onEditMedia(socket, d) {
    dev.logfunction(
      `EVENT - onEditMedia for ${d.slugFolderName}/${d.slugMediaName}`
    );
    file.editMediaMeta(d).then(
      slugFolderName => {
        sendMedias({ slugFolderName, slugMediaName: d.slugMediaName });
      },
      function(err) {
        dev.error(`Failed to edit media! Error: ${err}`);
      }
    );
  }

  function onRemoveMedia(socket, d) {
    dev.logfunction(
      `EVENT - onRemoveMedia for ${d.slugFoldername}/${d.slugMediaName}`
    );
    let slugFolderName = d.slugFolderName;
    let slugMediaName = d.slugMediaName;
    file.removeMedia(slugFolderName, slugMediaName).then(
      () => {
        sendMedias({ slugFolderName });
      },
      function(err, p) {
        dev.error(`Failed to remove media: ${err}`);
        reject(err);
      }
    );
  }

  /**************************************************************** GENERAL ********************************/

  function sendFolders({ slugFolderName, socket, folderID } = {}) {
    dev.logfunction(`COMMON - sendFolders for ${slugFolderName}`);

    file.getFolder(slugFolderName).then(
      foldersData => {
        // if folder creation, we get an ID to open the folder straight away
        if (foldersData !== undefined && slugFolderName && folderID) {
          foldersData[slugFolderName].folderID = folderID;
        }

        // check if single socket or multiple sockets
        Object.keys(io.sockets.connected).forEach(sid => {
          if (socket) {
            if (socket.id !== sid) {
              return;
            }
          }
          let thisSocket = socket || io.sockets.connected[sid];
          let filteredFoldersData = auth.filterFolders(sid, foldersData);

          if (filteredFoldersData === undefined) {
            filteredFoldersData = '';
          } else {
            for (let k in filteredFoldersData) {
              // check if there is any password, if there is then send a placeholder
              if (
                filteredFoldersData[k].password &&
                filteredFoldersData[k].password !== ''
              ) {
                filteredFoldersData[k].password = 'has_pass';
              }
            }
          }

          if (slugFolderName) {
            api.sendEventWithContent(
              'listFolder',
              filteredFoldersData,
              io,
              thisSocket
            );
          } else {
            api.sendEventWithContent(
              'listFolders',
              filteredFoldersData,
              io,
              thisSocket
            );
          }
        });
      },
      function(err, p) {
        dev.error(`Failed to get folders data: ${err}`);
        reject(err);
      }
    );
  }

  function sendMedias({ slugFolderName, slugMediaName, socket, mediaID }) {
    dev.logfunction(
      `COMMON - sendMedias for slugFolderName = ${slugFolderName}, slugMediaName = ${slugMediaName} and mediaID = ${mediaID}`
    );

    file.getFolder(slugFolderName).then(
      foldersData => {
        file
          .gatherAllMedias(slugFolderName, slugMediaName, mediaID)
          .then(mediasData => {
            dev.logverbose(`Got medias, now sending to the right clients`);
            Object.keys(io.sockets.connected).forEach(sid => {
              if (!!socket && socket.id !== sid) {
                return;
              }

              // bug return object

              let filteredMediasData = {};
              if (auth.hasFolderAuth(sid, foldersData)) {
                // let filteredMediasData = auth.filterMedias(mediasData);
                filteredMediasData = JSON.parse(JSON.stringify(mediasData));
              }

              let folder_and_medias = {
                [slugFolderName]: {
                  medias: filteredMediasData
                }
              };

              dev.logverbose(`${JSON.stringify(folder_and_medias, null, 4)}`);

              api.sendEventWithContent(
                !!slugMediaName ? 'listMedia' : 'listMedias',
                folder_and_medias,
                io,
                socket || io.sockets.connected[sid]
              );
            });
          });
      },
      function(err, p) {
        dev.error(`Failed to get folders data: ${err}`);
        reject(err);
      }
    );
  }

  return API;
})();
