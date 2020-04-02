const dev = require("./dev-log"),
  api = require("./api"),
  auth = require("./auth"),
  exporter = require("./exporter"),
  file = require("./file");

module.exports = (function() {
  dev.log(`Sockets module initialized at ${api.getCurrentDate()}`);
  let app;
  let io;

  const API = {
    init: (app, io) => init(app, io),
    createMediaMeta: ({ type, slugFolderName, additionalMeta }) =>
      createMediaMeta({ type, slugFolderName, additionalMeta }),
    notify: notify,
    io: () => io
  };

  function init(thisApp, thisIO) {
    dev.log(`Initializing socket module`);

    app = thisApp;
    io = thisIO;

    io.use(function(socket, next) {
      if (
        auth.isSubmittedSessionPasswordValid(
          socket.handshake.query.hashed_session_password
        )
      ) {
        dev.log(`CONNECTION ALLOWED`);
        next();
      } else {
        dev.error(`CONNECTION DENIED`);
        next(new Error("Authentication error"));
      }
    }).on("connection", function(socket) {
      dev.log(`RECEIVED CONNECTION FROM SOCKET.id: ${socket.id}`);
      socket._data = {};

      var onevent = socket.onevent;
      socket.onevent = function(packet) {
        var args = packet.data || [];
        onevent.call(this, packet); // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet); // additional call to catch-all
      };

      socket.on("*", (event, data) => dev.log(`RECEIVED EVENT: ${event}`));

      socket.on("authenticate", d => onAuthenticate(socket, d));

      socket.on("listFolders", d => onListFolders(socket, d));
      socket.on("listFolder", d => onListFolder(socket, d));
      socket.on("createFolder", d => onCreateFolder(socket, d));
      socket.on("editFolder", d => onEditFolder(socket, d));
      socket.on("removeFolder", d => onRemoveFolder(socket, d));

      socket.on("listMedias", d => onListMedias(socket, d));
      socket.on("createMedia", d => onCreateMedia(socket, d));
      socket.on("editMedia", d => onEditMedia(socket, d));
      socket.on("copyMediaToFolder", d => onCopyMediaToFolder(socket, d));
      socket.on("removeMedia", d => onRemoveMedia(socket, d));
      socket.on("listSpecificMedias", d => onListSpecificMedias(socket, d));

      socket.on("downloadPubliPDF", d => onDownloadPubliPDF(socket, d));
      socket.on("downloadVideoPubli", d => onDownloadVideoPubli(socket, d));
      socket.on("downloadStopmotionPubli", d =>
        onDownloadStopmotionPubli(socket, d)
      );
      socket.on("addTempMediaToFolder", d => onAddTempMediaToFolder(socket, d));
      socket.on("copyFolder", d => onCopyFolder(socket, d));
      socket.on("updateNetworkInfos", d => onUpdateNetworkInfos(socket, d));

      socket.on("updateClientInfo", d => onUpdateClientInfo(socket, d));
      socket.on("listClientsInfo", d => onListClientsInfo(socket, d));

      socket.on("disconnect", d => onClientDisconnect(socket));
    });
  }

  /**************************************************************** UTIL ********************************/
  function onAuthenticate(socket, d) {
    dev.logfunction(`EVENT - onAuthenticate for ${JSON.stringify(d, null, 4)}`);
    auth
      .setAuthenticate(d.folder_passwords)
      .then(list_of_authorized_folders => {
        socket._is_authorized_for_folders = list_of_authorized_folders;
        api.sendEventWithContent(
          "authentificated",
          list_of_authorized_folders,
          io,
          socket
        );
      })
      .catch(err => {
        dev.error(`Failed to auth: ${err}`);
      });
  }

  function notify({
    socket,
    socketid,
    not_localized_string,
    localized_string,
    type
  }) {
    dev.logfunction(`EVENT - notify for socketid = ${socketid}`);
    if (socketid || socket) {
      if (!socket) {
        socket = io.sockets.connected[socketid];
      }
      api.sendEventWithContent(
        "notify",
        { not_localized_string, localized_string, type },
        io,
        socket
      );
    }
  }

  /**************************************************************** FOLDER ********************************/
  function onListFolders(socket, data) {
    dev.logfunction(`EVENT - onListFolders`);
    if (!data || !data.hasOwnProperty("type")) {
      dev.error(`Missing type field`);
      return;
    }
    const type = data.type;
    const hrstart = process.hrtime();
    sendFolders({ type, socket }).then(() => {
      let hrend = process.hrtime(hrstart);
      dev.performance(
        `PERFORMANCE — listFolders : ${hrend[0]}s ${hrend[1] / 1000000}ms`
      );
    });
  }
  function onListFolder(socket, { type, slugFolderName }) {
    dev.logfunction(
      `EVENT - onListFolder with slugFolderName = ${slugFolderName}`
    );
    const hrstart = process.hrtime();
    sendFolders({ type, slugFolderName, socket }).then(() => {
      let hrend = process.hrtime(hrstart);
      dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
    });
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
  function onEditFolder(socket, { type, slugFolderName, data, id }) {
    dev.logfunction(
      `EVENT - onEditFolder for type = ${type}, slugFolderName = ${slugFolderName}, data = ${JSON.stringify(
        data
      )}`
    );

    file
      .getFolder({ type, slugFolderName })
      .then(foldersData => {
        if (!auth.canAdminFolder(socket, foldersData, type)) {
          notify({
            socket,
            socketid: socket.id,
            not_localized_string: `Not allowed to edit`
          });
          return;
        }

        file
          .editFolder({
            type,
            slugFolderName,
            foldersData: Object.values(foldersData)[0],
            newFoldersData: data
          })
          .then(({ slugFolderName, meta }) => {
            // if password was changed
            if (
              Object.values(foldersData)[0].hasOwnProperty("password") &&
              Object.values(foldersData)[0].password !== meta.password
            ) {
              Object.keys(io.sockets.connected).forEach(sid => {
                let this_socket = io.sockets.connected[sid];

                if (this_socket === socket) {
                  return;
                }

                this_socket._is_authorized_for_folders.map(i => {
                  if (i.type === type) {
                    if (i.allowed_slugFolderNames.includes(slugFolderName)) {
                      // remove slug from list
                      i.allowed_slugFolderNames = i.allowed_slugFolderNames.filter(
                        s => s !== slugFolderName
                      );
                    }
                  }
                });

                // refresh auth
                api.sendEventWithContent(
                  "authentificated",
                  this_socket._is_authorized_for_folders,
                  io,
                  this_socket
                );
              });
            }

            sendFolders({ type, slugFolderName, id });
          })
          .catch(err => {
            dev.error(`Error on editFolder: ${err}`);
          });
      })
      .catch(err => {
        dev.error(`No folder found: ${err}`);
      });
  }

  function onRemoveFolder(socket, { type, slugFolderName }) {
    dev.logfunction(`EVENT - onRemoveFolder for ${slugFolderName}`);
    file
      .getFolder({ type, slugFolderName })
      .then(foldersData => {
        if (!auth.canAdminFolder(socket, foldersData, type)) {
          notify({
            socket,
            socketid: socket.id,
            not_localized_string: `Not allowed to remove`
          });
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
        dev.error(`No folder found: ${err}`);
      });
  }

  /**************************************************************** MEDIA ********************************/

  function onListMedias(socket, { type, slugFolderName }) {
    dev.logfunction(
      `EVENT - onListMedias : type = ${type}, slugProjectName = ${slugFolderName}`
    );

    const hrstart = process.hrtime();
    sendMedias({ type, slugFolderName, socket }).then(() => {
      let hrend = process.hrtime(hrstart);
      dev.performance(
        `PERFORMANCE — listMedias : ${hrend[0]}s ${hrend[1] / 1000000}ms`
      );
    });
  }

  function onCreateMedia(
    socket,
    { type, id, slugFolderName, additionalMeta, rawData = "" }
  ) {
    dev.logfunction(
      `EVENT - onCreateMedia : slugFolderName = ${slugFolderName} and type = ${type} and rawData.length = ${rawData.length}`
    );
    file
      .createMedia({
        type,
        rawData,
        slugFolderName,
        additionalMeta,
        socket
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

  function onEditMedia(
    socket,
    { type, slugFolderName, slugMediaName, data, recipe_with_data }
  ) {
    dev.logfunction(
      `EVENT - onEditMedia for type ${type}\nslugFolderName = ${slugFolderName}\nslugMediaName = ${slugMediaName}\ndata = ${JSON.stringify(
        data,
        null,
        4
      )}`
    );

    file
      .editMedia({
        type,
        slugFolderName,
        metaFileName: slugMediaName,
        data,
        recipe_with_data,
        socket
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
  function onCopyMediaToFolder(
    socket,
    {
      type,
      from_slugFolderName,
      to_slugFolderName,
      slugMediaName,
      meta_to_edit
    }
  ) {
    dev.logfunction(
      `EVENT - onCopyMediaToFolder for type ${type}
      from_slugFolderName = ${from_slugFolderName}\n
      to_slugFolderName = ${to_slugFolderName}\n
      slugMediaName = ${slugMediaName}\n
      with new meta_to_edit = ${meta_to_edit}`
    );

    file
      .getFolder({ type, slugFolderName: from_slugFolderName })
      .then(foldersData => {
        if (!auth.canAdminFolder(socket, foldersData, type)) {
          notify({
            socket,
            socketid: socket.id,
            not_localized_string: `Not allowed to edit from folder ${from_slugFolderName}`
          });
        } else {
          return;
        }
      })
      .then(() => {
        file
          .getFolder({ type, slugFolderName: to_slugFolderName })
          .then(foldersData => {
            if (!auth.canAdminFolder(socket, foldersData, type)) {
              notify({
                socket,
                socketid: socket.id,
                not_localized_string: `Not allowed to edit destination folder ${to_slugFolderName}`
              });
            }
            return;
          });
      })
      .then(() => {
        file
          .copyMediaToAnotherFolder({
            type,
            from_slugFolderName,
            to_slugFolderName,
            metaFileName: slugMediaName,
            meta_to_edit
          })
          .then(newMetaFileName => {
            notify({
              socket,
              localized_string: `media_copied_successfully`,
              type: "success"
            });

            sendMedias({
              type,
              slugFolderName: to_slugFolderName,
              metaFileName: newMetaFileName
            });
          })
          .catch((err, p) => {
            notify({
              socket,
              socketid: socket.id,
              not_localized_string: `Copy failed with error: ${err}`
            });

            dev.error(`Failed to copy media to another folder: ${err}`);
            reject(err);
          });
      });
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

  function onDownloadPubliPDF(socket, { slugPubliName, options }) {
    dev.logfunction(
      `EVENT - onDownloadPubliPDF with 
      slugPubliName = ${slugPubliName}`
    );
    exporter
      .makePDFForPubli({ slugPubliName, options })
      .then(({ pdfName, imageName, docPath }) => {
        notify({
          socket,
          localized_string: `finished_creating_recipe`,
          type: "success"
        });

        api.sendEventWithContent(
          "publiPDFGenerated",
          { pdfName, imageName, docPath },
          io,
          socket
        );
      });
  }

  function onDownloadVideoPubli(socket, { slugPubliName, options }) {
    dev.logfunction(
      `EVENT - onDownloadVideoPubli with 
      slugPubliName = ${slugPubliName} 
      and options = ${JSON.stringify(options)}`
    );

    exporter
      .makeVideoForPubli({ slugPubliName, socket, options })
      .then(videoName => {
        notify({
          socket,
          localized_string: `finished_creating_recipe`,
          type: "success"
        });

        api.sendEventWithContent(
          "publiVideoGenerated",
          { videoName },
          io,
          socket
        );
      })
      .catch(error_msg => {
        notify({
          socket,
          socketid: socket.id,
          localized_string: `video_creation_failed`,
          not_localized_string: error_msg,
          type: "error"
        });

        api.sendEventWithContent("publiVideoFailed", {}, io, socket);
      });
  }

  function onDownloadStopmotionPubli(socket, { slugPubliName, options }) {
    dev.logfunction(
      `EVENT - onDownloadStopmotionPubli with 
      slugPubliName = ${slugPubliName}`
    );

    exporter
      .makeVideoFromImagesInPubli({ slugPubliName, options, socket })
      .then(videoName => {
        notify({
          socket,
          localized_string: `finished_creating_recipe`,
          type: "success"
        });

        api.sendEventWithContent(
          "publiStopmotionIsGenerated",
          { videoName },
          io,
          socket
        );
      })
      .catch(error => {
        notify({
          socket,
          socketid: socket.id,
          localized_string: `video_creation_failed`,
          not_localized_string: error.message,
          type: "error"
        });

        api.sendEventWithContent("publiStopmotionFailed", {}, io, socket);
      });
  }

  function onAddTempMediaToFolder(socket, { from, to, additionalMeta }) {
    dev.logfunction(
      `EVENT - onAddTempMediaToFolder with 
      from = ${JSON.stringify(from)} and to = ${JSON.stringify(to)}`
    );

    file
      .addTempMediaToFolder({ from, to, additionalMeta })
      .then(() => {
        notify({
          socket,
          socketid: socket.id,
          localized_string: `media_has_been_added_successfully`
        });
      })
      .catch(err => {
        notify({
          socket,
          socketid: socket.id,
          not_localized_string: `Error adding temp media to folder: ${err}`
        });
      });
  }

  function onCopyFolder(socket, { type, slugFolderName, new_folder_name, id }) {
    dev.logfunction(
      `EVENT - onCopyFolder with 
      type = ${type} and slugFolderName = ${slugFolderName}, for name = ${new_folder_name}`
    );
    file.copyFolder({ type, slugFolderName, new_folder_name }).then(
      new_slugFolderName => {
        sendFolders({ type, slugFolderName: new_slugFolderName, id });
      },
      function(err) {
        dev.error(`Failed to copy folder! Error: ${err}`);
      }
    );
  }

  function onUpdateNetworkInfos() {
    dev.logfunction(`EVENT - onUpdateNetworkInfos`);
    api.getNetworkInfos().then(
      localNetworkInfos => {
        api.sendEventWithContent("newNetworkInfos", localNetworkInfos, io);
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
    return new Promise(function(resolve, reject) {
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

            let filteredFoldersData = auth.filterFolders(
              thisSocket,
              type,
              foldersData
            );

            if (filteredFoldersData === undefined) {
              filteredFoldersData = "";
            } else {
              // remove password field
              for (let k in filteredFoldersData) {
                // check if there is any password, if there is then send a placeholder
                if (
                  filteredFoldersData[k].hasOwnProperty("password") &&
                  filteredFoldersData[k].password !== ""
                ) {
                  filteredFoldersData[k].password = "has_pass";
                }
              }
            }

            if (slugFolderName) {
              api.sendEventWithContent(
                "listFolder",
                { [type]: filteredFoldersData },
                io,
                thisSocket
              );
              return resolve();
            } else {
              api.sendEventWithContent(
                "listFolders",
                { [type]: filteredFoldersData },
                io,
                thisSocket
              );
              return resolve();
            }
          });
        })
        .catch(err => {
          dev.error(`No folder found: ${err}`);
          return reject();
        });
    });
  }

  function sendMedias({ type, slugFolderName, metaFileName, socket, id }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `COMMON - sendMedias for type = ${type}, slugFolderName = ${slugFolderName}, metaFileName = ${metaFileName} and id = ${id}`
      );

      file
        .getFolder({ type, slugFolderName })
        .then(foldersData => {
          if (foldersData === undefined) {
            return reject();
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
                  dev.logverbose(
                    `Got medias, now sending to the right clients`
                  );

                  if (
                    folders_and_medias !== undefined &&
                    Object.keys(folders_and_medias).length
                  ) {
                    if (metaFileName && id) {
                      folders_and_medias[slugFolderName].medias[
                        metaFileName
                      ].id = id;
                    }

                    if (
                      foldersData[slugFolderName].hasOwnProperty("password") &&
                      foldersData[slugFolderName].password !== ""
                    ) {
                      foldersData[slugFolderName].password = "has_pass";
                    }

                    foldersData[slugFolderName].medias =
                      folders_and_medias[slugFolderName].medias;
                  }

                  Object.keys(io.sockets.connected).forEach(sid => {
                    if (!!socket && socket.id !== sid) {
                      return;
                    }

                    let thisSocket = socket || io.sockets.connected[sid];

                    let filtered_folders_and_medias = auth.filterMedias(
                      thisSocket,
                      type,
                      foldersData
                    );

                    api.sendEventWithContent(
                      !!metaFileName ? "listMedia" : "listMedias",
                      { [type]: filtered_folders_and_medias },
                      io,
                      thisSocket
                    );
                    return resolve();
                  });
                });
            })
            .catch(err => {
              dev.error(`Failed to list medias! Error: ${err}`);
              return reject(err);
            });
        })
        .catch(err => {
          dev.error(`No folder found: ${err}`);
          return reject(err);
        });
    });
  }

  // only for one user at a time
  function sendSpecificMedias({ type, medias_list, socket }) {
    dev.logfunction(`COMMON - sendSpecificMedias`);
    file.readMediaList({ type, medias_list }).then(folders_and_medias => {
      api.sendEventWithContent(
        "listSpecificMedias",
        { [type]: folders_and_medias },
        io,
        socket
      );
    });
  }

  function onUpdateClientInfo(socket, data) {
    socket._data = data;
    sendClients();
  }
  function onListClientsInfo(socket) {
    sendClients(socket);
  }

  function sendClients(socket) {
    // envoyer la liste des clients connectés
    dev.logfunction(`COMMON - sendClients`);

    const connected_clients = [];
    Object.entries(io.sockets.connected).forEach(([id, this_socket]) => {
      connected_clients.push({
        id,
        data: this_socket._data
      });
    });

    api.sendEventWithContent("listClients", connected_clients, io, socket);
  }

  function onClientDisconnect(socket) {
    sendClients();
  }

  return API;
})();
