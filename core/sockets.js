const dev = require('./dev-log'),
  api = require('./api'),
  auth = require('./auth'),
  exporter = require('./exporter');

const file = require('./file');
const settings = require('../settings.json');

module.exports = (function() {
  dev.log(`Sockets module initialized at ${api.getCurrentDate()}`);
  let app;
  let io;

  const API = {
    init: (app, io) => init(app, io),
    createMediaMeta: ({ type, slugFolderName, additionalMeta }) =>
      createMediaMeta({ type, slugFolderName, additionalMeta }),
    pushMessage: msg => pushMessage(msg),
    notify: notify
  };

  function init(thisApp, thisIO) {
    dev.log(`Initializing socket module`);

    app = thisApp;
    io = thisIO;

    io.on('connection', function(socket) {
      var onevent = socket.onevent;
      socket.onevent = function(packet) {
        var args = packet.data || [];
        onevent.call(this, packet); // original call
        packet.data = ['*'].concat(args);
        onevent.call(this, packet); // additional call to catch-all
      };

      socket.on('*', (event, data) => dev.log(`RECEIVED EVENT: ${event}`));

      socket.on('authenticate', d => onAuthenticate(socket, d));

      socket.on('listFolders', d => onListFolders(socket, d));
      socket.on('listFolder', d => onListFolder(socket, d));
      socket.on('createFolder', d => onCreateFolder(socket, d));
      socket.on('editFolder', d => onEditFolder(socket, d));
      socket.on('removeFolder', d => onRemoveFolder(socket, d));

      socket.on('listMedias', d => onListMedias(socket, d));
      socket.on('createMedia', d => onCreateMedia(socket, d));
      socket.on('editMedia', d => onEditMedia(socket, d));
      socket.on('removeMedia', d => onRemoveMedia(socket, d));
      socket.on('listSpecificMedias', d => onListSpecificMedias(socket, d));

      socket.on('downloadPubliPDF', d => onDownloadPubliPDF(socket, d));
      socket.on('downloadVideoPubli', d => onDownloadVideoPubli(socket, d));
      socket.on('updateNetworkInfos', d => onUpdateNetworkInfos(socket, d));
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

  function notify({
    socket,
    socketid,
    not_localized_string,
    localized_string
  }) {
    dev.logfunction(`EVENT - notify for socketid = ${socketid}`);
    if (socketid || socket) {
      if (!socket) {
        socket = io.sockets.connected[socketid];
      }
      api.sendEventWithContent(
        'notify',
        { not_localized_string, localized_string },
        io,
        socket
      );
    }
  }

  /**************************************************************** FOLDER ********************************/
  function onListFolders(socket, data) {
    dev.logfunction(`EVENT - onListFolders`);
    if (!data.hasOwnProperty('type')) {
      dev.error(`Missing type field`);
    }
    const type = data.type;
    sendFolders({ type, socket });
  }
  function onListFolder(socket, { type, slugFolderName }) {
    dev.logfunction(
      `EVENT - onListFolder with slugFolderName = ${slugFolderName}`
    );
    sendFolders({ type, slugFolderName, socket });
  }

  function onCreateFolder(socket, { type, data, id }) {
    dev.logfunction(`EVENT - onCreateFolder for ${data.name}`);
    file.createFolder({ type, data }).then(
      slugFolderName => {
        sendFolders({ type, slugFolderName, id });
      },
      function(err) {
        dev.error(`Failed to list folders! Error: ${err}`);
      }
    );
  }
  function onEditFolder(socket, { type, slugFolderName, data }) {
    dev.logfunction(
      `EVENT - onEditFolder for type = ${type}, slugFolderName = ${slugFolderName}, data = ${JSON.stringify(
        data
      )}`
    );

    file
      .getFolder({ type, slugFolderName })
      .then(foldersData => {
        if (!auth.hasFolderAuth(socket.id, foldersData)) {
          return;
        }
        file
          .editFolder({
            type,
            foldersData: Object.values(foldersData)[0],
            newFoldersData: data
          })
          .then(slugFolderName => {
            sendFolders({ type, slugFolderName });
          });
      })
      .catch(err => {
        dev.error('No folder found');
      });
  }

  function onRemoveFolder(socket, { type, slugFolderName }) {
    dev.logfunction(`EVENT - onRemoveFolder for ${slugFolderName}`);
    file
      .getFolder({ type, slugFolderName })
      .then(foldersData => {
        if (!auth.hasFolderAuth(socket.id, foldersData)) {
          return;
        }
        file
          .removeFolder({
            type,
            slugFolderName
          })
          .then(
            () => {
              sendFolders({ type });
            },
            function(err, p) {
              dev.error(`Failed to remove folder: ${err}`);
              reject(err);
            }
          );
      })
      .catch(err => {
        dev.error('No folder found');
      });
  }

  /**************************************************************** MEDIA ********************************/

  function onListMedias(socket, { type, slugFolderName }) {
    dev.logfunction(
      `EVENT - onListMedias : type = ${type}, slugProjectName = ${slugFolderName}`
    );
    sendMedias({ type, slugFolderName, socket });
  }

  function onCreateMedia(
    socket,
    { type, id, slugFolderName, additionalMeta, rawData = '' }
  ) {
    dev.logfunction(
      `EVENT - onCreateMedia : slugFolderName = ${slugFolderName} and type = ${type} and rawData.length = ${
        rawData.length
      }`
    );
    file
      .createMedia({
        type,
        rawData,
        slugFolderName,
        additionalMeta
      })
      .then(_additionalMeta => {
        file
          .createMediaMeta({
            type,
            slugFolderName,
            additionalMeta: _additionalMeta
          })
          .then(metaFileName => {
            sendMedias({
              type,
              slugFolderName,
              metaFileName,
              id
            });
          })
          .catch(err => {
            dev.error(`Couldn’t create captured media meta: ${err}`);
            reject(err);
          });
      })
      .catch(err => {
        dev.error(`Couldn’t create captured media: ${err}`);
        reject(err);
      });
  }

  function createMediaMeta({ type, slugFolderName, additionalMeta }) {
    dev.logfunction(`EVENT - createMediaMeta for ${slugFolderName}`);
    dev.logverbose(
      `Has additional meta: ${JSON.stringify(additionalMeta, null, 4)}`
    );
    file
      .createMediaMeta({ type, slugFolderName, additionalMeta })
      .then(metaFileName => {
        sendMedias({
          type,
          slugFolderName,
          metaFileName
        });
      })
      .catch(err => {
        dev.error(`Couldn’t create imported media meta: ${err}`);
        reject(err);
      });
  }

  function onEditMedia(socket, { type, slugFolderName, slugMediaName, data }) {
    dev.logfunction(
      `EVENT - onEditMedia for type ${type}, slugFolderName = ${slugFolderName} and slugMediaName = ${slugMediaName}`
    );
    file
      .editMediaMeta({
        type,
        slugFolderName,
        metaFileName: slugMediaName,
        data
      })
      .then(
        slugFolderName => {
          sendMedias({ type, slugFolderName, metaFileName: slugMediaName });
        },
        function(err) {
          dev.error(`Failed to edit media! Error: ${err}`);
        }
      );
  }

  function onRemoveMedia(socket, { type, slugFolderName, slugMediaName }) {
    dev.logfunction(
      `EVENT - onRemoveMedia for type = ${type}, slugFolderName = ${slugFolderName}, and slugMediaName = ${slugMediaName}`
    );
    file
      .removeMedia({ type, slugFolderName, metaFileName: slugMediaName })
      .then(
        () => {
          sendMedias({ type, slugFolderName });
        },
        function(err, p) {
          dev.error(`Failed to remove media: ${err}`);
          reject(err);
        }
      );
  }

  function onListSpecificMedias(socket, { type, medias_list }) {
    dev.logfunction(
      `EVENT - onListSpecificMedias with 
      type = ${type} 
      medias_list = ${JSON.stringify(medias_list, null, 4)}`
    );
    sendSpecificMedias({ type, medias_list, socket });
  }

  function onDownloadPubliPDF(socket, { slugPubliName }) {
    dev.logfunction(
      `EVENT - onDownloadPubliPDF with 
      slugPubliName = ${slugPubliName}`
    );
    exporter.makePDFForPubli({ slugPubliName }).then(({ pdfName, pdfPath }) => {
      api.sendEventWithContent(
        'publiPDFGenerated',
        { pdfName, pdfPath },
        io,
        socket
      );
    });
  }

  function onDownloadVideoPubli(socket, { slugPubliName }) {
    dev.logfunction(
      `EVENT - onDownloadVideoPubli with 
      slugPubliName = ${slugPubliName}`
    );

    exporter
      .makeVideoForPubli({ slugPubliName, socket })
      .then(({ videoName }) => {
        api.sendEventWithContent(
          'publiVideoGenerated',
          { videoName },
          io,
          socket
        );
      });
  }

  function onUpdateNetworkInfos() {
    dev.logfunction(`EVENT - onUpdateNetworkInfos`);
    api.getNetworkInfos().then(
      localNetworkInfos => {
        api.sendEventWithContent('newNetworkInfos', localNetworkInfos, io);
      },
      function(err, p) {
        dev.error(`Err while getting local IP: ${err}`);
        reject(err);
      }
    );
  }

  /**************************************************************** GENERAL ********************************/

  // send projects, authors and publications
  function sendFolders({ type, slugFolderName, socket, id } = {}) {
    dev.logfunction(
      `COMMON - sendFolders for type = ${type} and slugFolderName = ${slugFolderName}`
    );

    file
      .getFolder({ type, slugFolderName })
      .then(foldersData => {
        // if folder creation, we get an ID to open the folder straight away
        if (foldersData !== undefined && slugFolderName && id) {
          foldersData[slugFolderName].id = id;
        }

        // check if single socket or multiple sockets
        Object.keys(io.sockets.connected).forEach(sid => {
          if (socket) {
            if (!!socket && socket.id !== sid) {
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
              { [type]: filteredFoldersData },
              io,
              thisSocket
            );
          } else {
            api.sendEventWithContent(
              'listFolders',
              { [type]: filteredFoldersData },
              io,
              thisSocket
            );
          }
        });
      })
      .catch(err => {
        dev.error('No folder found');
      });
  }

  function sendMedias({ type, slugFolderName, metaFileName, socket, id }) {
    dev.logfunction(
      `COMMON - sendMedias for type = ${type}, slugFolderName = ${slugFolderName}, metaFileName = ${metaFileName} and id = ${id}`
    );

    file
      .getFolder({ type, slugFolderName })
      .then(foldersData => {
        if (foldersData === undefined) {
          return;
        }
        file
          .getMediaMetaNames({
            type,
            slugFolderName,
            metaFileName
          })
          .then(list_metaFileName => {
            let medias_list = list_metaFileName.map(_metaFileName => {
              return {
                slugFolderName,
                metaFileName: _metaFileName
              };
            });
            file
              .readMediaList({ type, medias_list })
              .then(folders_and_medias => {
                dev.logverbose(`Got medias, now sending to the right clients`);

                if (folders_and_medias !== undefined && metaFileName && id) {
                  folders_and_medias[slugFolderName].medias[
                    metaFileName
                  ].id = id;
                }

                Object.keys(io.sockets.connected).forEach(sid => {
                  if (!!socket && socket.id !== sid) {
                    return;
                  }

                  // let filteredMediasData = {};
                  // if (auth.hasFolderAuth(sid, foldersData)) {
                  //   // let filteredMediasData = auth.filterMedias(mediasData);
                  //   filteredMediasData = JSON.parse(JSON.stringify(mediasData));
                  // }

                  if (Object.keys(folders_and_medias).length === 0) {
                    folders_and_medias = {
                      [slugFolderName]: {
                        medias: {}
                      }
                    };
                  }

                  api.sendEventWithContent(
                    !!metaFileName ? 'listMedia' : 'listMedias',
                    { [type]: folders_and_medias },
                    io,
                    socket || io.sockets.connected[sid]
                  );
                });
              });
          })
          .catch(err => {
            dev.error(`Failed to list medias! Error: ${err}`);
            reject(err);
          });
      })
      .catch(err => {
        dev.error('No folder found');
      });
  }

  // only for one user at a time
  function sendSpecificMedias({ type, medias_list, socket }) {
    dev.logfunction(`COMMON - sendSpecificMedias`);
    file.readMediaList({ type, medias_list }).then(folders_and_medias => {
      api.sendEventWithContent(
        'listSpecificMedias',
        { [type]: folders_and_medias },
        io,
        socket
      );
    });
  }

  return API;
})();
