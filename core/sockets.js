const dev = require("./dev-log"),
  api = require("./api"),
  auth = require("./auth"),
  exporter = require("./exporter"),
  file = require("./file"),
  changelog = require("./changelog"),
  access = require("./access");

const bcrypt = require("bcryptjs");

module.exports = (function () {
  dev.log(`Sockets module initialized at ${api.getCurrentDate()}`);
  let app;
  let io;

  const API = {
    init: (app, io) => init(app, io),
    createMediaMeta: ({ type, slugFolderName, additionalMeta }) =>
      new Promise((resolve, reject) =>
        createMediaMeta({ type, slugFolderName, additionalMeta })
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    sendFolders: ({ type, slugFolderName, socket, id }) =>
      new Promise((resolve, reject) =>
        sendFolders({ type, slugFolderName, socket, id })
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    notify: notify,
    io: () => io,
  };

  function init(thisApp, thisIO) {
    dev.log(`Initializing socket module`);

    app = thisApp;
    io = thisIO;

    io.use(function (socket, next) {
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
    }).on("connection", function (socket) {
      dev.log(`RECEIVED CONNECTION FROM SOCKET.id: ${socket.id}`);
      dev.log(
        `Clients connected currently : ${
          Object.keys(io.sockets.connected).length
        }`
      );

      let ip = "";
      if (socket.handshake) {
        if (socket.handshake.headers && socket.handshake.headers["x-real-ip"]) {
          // need to add the following to nginx .conf
          // proxy_set_header X-Real-IP $remote_addr;
          ip = socket.handshake.headers["x-real-ip"];
        } else if (socket.handshake.address) {
          ip = socket.handshake.address;
        }
      }

      let user_agent = "";
      if (
        socket.handshake &&
        socket.handshake.headers &&
        socket.handshake.headers["user-agent"]
      )
        user_agent = socket.handshake.headers["user-agent"];

      access.append({
        ip,
        user_agent,
      });
      socket._data = {};

      var onevent = socket.onevent;
      socket.onevent = function (packet) {
        var args = packet.data || [];
        onevent.call(this, packet); // original call
        packet.data = ["*"].concat(args);
        onevent.call(this, packet); // additional call to catch-all
      };

      socket.on("*", (event, data) => dev.log(`RECEIVED EVENT: ${event}`));

      socket.on("authenticate", (d) => onAuthenticate(socket, d));

      socket.on("listFolders", (d) => onListFolders(socket, d));
      socket.on("listFolder", (d) => onListFolder(socket, d));
      socket.on("createFolder", (d) => onCreateFolder(socket, d));
      socket.on("editFolder", (d) => onEditFolder(socket, d));
      socket.on("removeFolder", (d) => onRemoveFolder(socket, d));

      socket.on("listMedias", (d) => onListMedias(socket, d));
      socket.on("createMedia", (d) => onCreateMedia(socket, d));
      socket.on("editMedia", (d) => onEditMedia(socket, d));
      socket.on("copyMediaToFolder", (d) => onCopyMediaToFolder(socket, d));
      socket.on("removeMedia", (d) => onRemoveMedia(socket, d));
      socket.on("listSpecificMedias", (d) => onListSpecificMedias(socket, d));

      socket.on("downloadPubliPDF", (d) => onDownloadPubliPDF(socket, d));
      socket.on("downloadVideoPubli", (d) => onDownloadVideoPubli(socket, d));
      socket.on("downloadStopmotionPubli", (d) =>
        onDownloadStopmotionPubli(socket, d)
      );
      socket.on("addTempMediaToFolder", (d) =>
        onAddTempMediaToFolder(socket, d)
      );
      socket.on("copyFolder", (d) => onCopyFolder(socket, d));

      socket.on("updateNetworkInfos", (d) => onUpdateNetworkInfos(socket, d));
      socket.on("updateClientInfo", (d) => onUpdateClientInfo(socket, d));
      socket.on("listClientsInfo", (d) => onListClientsInfo(socket, d));

      socket.on("disconnect", (d) => onClientDisconnect(socket));

      socket.on("loadJournal", (d) => onLoadJournal(socket, d));
      socket.on("emptyJournal", (d) => onEmptyJournal(socket, d));
    });
  }

  /**************************************************************** UTIL ********************************/
  async function onAuthenticate(socket, d) {
    dev.logfunction(`EVENT - onAuthenticate for ${JSON.stringify(d, null, 4)}`);

    const hrstart = process.hrtime();

    const list_of_authorized_folders = await auth.setAuthenticate(
      d.folder_passwords
    );
    socket._is_authorized_for_folders = list_of_authorized_folders;

    let hrend = process.hrtime(hrstart);
    dev.performance(
      `PERFORMANCE — setAuthenticate : ${hrend[0]}s ${hrend[1] / 1000000}ms`
    );

    api.sendEventWithContent(
      "authentificated",
      list_of_authorized_folders,
      io,
      socket
    );
  }

  function notify({
    socket,
    socketid,
    not_localized_string,
    localized_string,
    type,
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
  async function onListFolders(socket, { type }) {
    dev.logfunction(`EVENT - onListFolders`);
    if (!type) {
      dev.error(`Missing type field`);
      return;
    }
    const hrstart = process.hrtime();

    await sendFolders({ type, socket });

    let hrend = process.hrtime(hrstart);
    dev.performance(
      `PERFORMANCE — listFolders for type = ${type} : ${hrend[0]}s ${
        hrend[1] / 1000000
      }ms`
    );
  }
  async function onListFolder(socket, { type, slugFolderName }) {
    dev.logfunction(
      `EVENT - onListFolder with slugFolderName = ${slugFolderName}`
    );
    const hrstart = process.hrtime();
    await sendFolders({ type, slugFolderName, socket });
    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function onCreateFolder(socket, { type, data, id }) {
    dev.logfunction(`EVENT - onCreateFolder for ${data.name}`);

    data = await auth.preventFieldsEditingDependingOnRole({
      socket,
      type,
      meta: data,
    });

    const slugFolderName = await file
      .createFolder({ type, data })
      .catch((err) => {
        dev.error(`Failed to create folder! Error: ${err}`);
        notify({
          socket,
          socketid: socket.id,
          localized_string: `action_not_allowed`,
          not_localized_string: `Error: can’t create folder ${err}`,
          type: "error",
        });
        throw err;
      });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "created_folder",
      detail: { type, slugFolderName, data },
    });

    await sendFolders({ type, slugFolderName, id });
  }
  async function onEditFolder(socket, { type, slugFolderName, data, id }) {
    dev.logfunction(
      `EVENT - onEditFolder for type = ${type}, 
      slugFolderName = ${slugFolderName}, data = ${JSON.stringify(data)}`
    );

    const foldersData = await file.getFolder({ type, slugFolderName });

    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: folder can’t be edited ${slugFolderName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    data = await auth.preventFieldsEditingDependingOnRole({
      socket,
      type,
      meta: data,
    });

    // check if password is crypted and should change
    const password_field_options =
      global.settings.structure[type].fields.password;

    const socket_is_admin = await auth.isSocketSessionAdmin(socket);

    if (
      password_field_options &&
      password_field_options.hasOwnProperty("transform") &&
      password_field_options.transform === "crypt" &&
      Object.values(foldersData)[0].password &&
      data.hasOwnProperty("password") &&
      !socket_is_admin
    ) {
      // if attempting to set new password
      // only allow if old_password match

      if (
        !data._old_password ||
        !(await bcrypt.compare(
          data._old_password,
          Object.values(foldersData)[0].password
        ))
      ) {
        dev.error(
          `Failed to change password and edit folder: old password is wrong or missing`
        );
        notify({
          socket,
          socketid: socket.id,
          localized_string: `action_not_allowed`,
          not_localized_string: `Error: folder can’t be edited ${slugFolderName} because old password is wrong or missing`,
          type: "error",
        });
        throw `Failed to change password and edit folder: old password is wrong or missing`;
      }
    }

    const { meta } = await file.editFolder({
      type,
      slugFolderName,
      foldersData: Object.values(foldersData)[0],
      newFoldersData: data,
    });

    // if password was changed
    if (
      Object.values(foldersData)[0].hasOwnProperty("password") &&
      Object.values(foldersData)[0].password !== meta.password
    ) {
      Object.keys(io.sockets.connected).forEach((sid) => {
        let this_socket = io.sockets.connected[sid];

        if (this_socket === socket) {
          return;
        }

        this_socket._is_authorized_for_folders.map((i) => {
          if (i.type === type) {
            if (i.allowed_slugFolderNames.includes(slugFolderName)) {
              // remove slug from list
              i.allowed_slugFolderNames = i.allowed_slugFolderNames.filter(
                (s) => s !== slugFolderName
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

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "edited_folder",
      detail: { type, slugFolderName, data },
    });

    await sendFolders({ type, slugFolderName, id });
  }

  async function updateFolderModified({ type, slugFolderName }) {
    dev.logfunction(
      `EVENT - updateFolderModified for type = ${type}, slugFolderName = ${slugFolderName}`
    );
    onEditFolder(undefined, { type, slugFolderName, data: {} });
  }

  async function onRemoveFolder(socket, { type, slugFolderName }) {
    dev.logfunction(`EVENT - onRemoveFolder for ${slugFolderName}`);

    const foldersData = await file.getFolder({ type, slugFolderName });

    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: removing folder not allowed ${slugFolderName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    await file
      .removeFolder({
        type,
        slugFolderName,
      })
      .catch((err) => {
        dev.error(`Failed to remove folder: ${err}`);
        reject(err);
      });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "removed_folder",
      detail: { type, slugFolderName },
    });

    await sendFolders({ type });
  }

  /**************************************************************** MEDIA ********************************/

  async function onListMedias(socket, { type, slugFolderName }) {
    dev.logfunction(
      `EVENT - onListMedias : type = ${type}, slugProjectName = ${slugFolderName}`
    );

    const hrstart = process.hrtime();
    await sendMedias({ type, slugFolderName, socket });

    let hrend = process.hrtime(hrstart);
    dev.performance(
      `PERFORMANCE — listMedias : ${hrend[0]}s ${hrend[1] / 1000000}ms`
    );
  }

  async function onCreateMedia(
    socket,
    { type, id, slugFolderName, additionalMeta, rawData = "" }
  ) {
    dev.logfunction(
      `EVENT - onCreateMedia : slugFolderName = ${slugFolderName} and type = ${type} and rawData.length = ${rawData.length}`
    );

    const foldersData = await file.getFolder({ type, slugFolderName });
    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: media can’t be created for protected folder ${slugFolderName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    const _additionalMeta = await file.createMedia({
      type,
      rawData,
      slugFolderName,
      additionalMeta,
      socket,
    });

    const metaFileName = await file.createMediaMeta({
      type,
      slugFolderName,
      additionalMeta: _additionalMeta,
    });

    updateFolderModified({ type, slugFolderName });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "created_media",
      detail: { type, slugFolderName, additionalMeta },
    });

    await sendMedias({
      type,
      slugFolderName,
      metaFileName,
      id,
    });
  }

  async function createMediaMeta({ type, slugFolderName, additionalMeta }) {
    dev.logfunction(`EVENT - createMediaMeta for ${slugFolderName}`);
    dev.logverbose(
      `Has additional meta: ${JSON.stringify(additionalMeta, null, 4)}`
    );

    const metaFileName = await file
      .createMediaMeta({
        type,
        slugFolderName,
        additionalMeta,
      })
      .catch((err) => {
        dev.error(`Couldn’t create imported media meta: ${err}`);
        throw err;
      });

    updateFolderModified({ type, slugFolderName });

    changelog.append({
      author: undefined,
      action: "created_media_meta",
      detail: { type, slugFolderName, additionalMeta },
    });

    await sendMedias({
      type,
      slugFolderName,
      metaFileName,
    });

    return metaFileName;
  }

  async function onEditMedia(
    socket,
    { type, id, slugFolderName, slugMediaName, data, recipe_with_data }
  ) {
    dev.logfunction(
      `EVENT - onEditMedia for type ${type}\nslugFolderName = ${slugFolderName}\nslugMediaName = ${slugMediaName}\ndata = ${JSON.stringify(
        data,
        null,
        4
      )}`
    );

    const foldersData = await file.getFolder({ type, slugFolderName });

    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: err.message,
            type: "error",
          });
        }))
    )
      return;

    await file
      .editMedia({
        type,
        slugFolderName,
        metaFileName: slugMediaName,
        data,
        recipe_with_data,
        socket,
      })
      .catch((err) => {
        dev.error(`Failed to edit media! Error: ${err}`);
        throw err;
      });

    updateFolderModified({ type, slugFolderName });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "edited_media",
      detail: { type, slugFolderName, slugMediaName, data },
    });

    sendMedias({ type, id, slugFolderName, metaFileName: slugMediaName });
  }
  async function onCopyMediaToFolder(
    socket,
    {
      type,
      from_slugFolderName,
      to_slugFolderName,
      slugMediaName,
      meta_to_edit,
      id,
    }
  ) {
    dev.logfunction(
      `EVENT - onCopyMediaToFolder for type ${type}
      from_slugFolderName = ${from_slugFolderName}\n
      to_slugFolderName = ${to_slugFolderName}\n
      slugMediaName = ${slugMediaName}\n
      with new meta_to_edit = ${meta_to_edit}`
    );

    const from_foldersData = await file.getFolder({
      type,
      slugFolderName: from_slugFolderName,
    });

    if (
      !(await auth
        .canEditFolder(socket, from_foldersData[from_slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: origin folder ${to_slugFolderName} can’t be edited: ${err}`,
            type: "error",
          });
        }))
    )
      return;

    const to_foldersData = await file.getFolder({
      type,
      slugFolderName: to_slugFolderName,
    });

    if (
      !(await auth
        .canEditFolder(socket, to_foldersData[to_slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: destination folder ${to_slugFolderName} can’t be edited: ${err}`,
            type: "error",
          });
        }))
    )
      return;

    const newMetaFileName = await file
      .copyMediaToAnotherFolder({
        type,
        from_slugFolderName,
        to_slugFolderName,
        metaFileName: slugMediaName,
        meta_to_edit,
      })
      .catch((err, p) => {
        notify({
          socket,
          socketid: socket.id,
          not_localized_string: `Copy failed with error: ${err}`,
          type: "error",
        });

        dev.error(`Failed to copy media to another folder: ${err}`);
        reject(err);
      });

    notify({
      socket,
      socketid: socket.id,
      localized_string: `media_copied_successfully`,
      type: "success",
    });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "copied_media",
      detail: { type, from_slugFolderName, to_slugFolderName, slugMediaName },
    });

    sendMedias({
      type,
      id,
      slugFolderName: to_slugFolderName,
      metaFileName: newMetaFileName,
    });
  }

  async function onRemoveMedia(
    socket,
    { type, slugFolderName, slugMediaName }
  ) {
    dev.logfunction(
      `EVENT - onRemoveMedia for type = ${type}, slugFolderName = ${slugFolderName}, and slugMediaName = ${slugMediaName}`
    );

    const foldersData = await file.getFolder({ type, slugFolderName });

    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: folder can’t be edited ${slugFolderName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    await file
      .removeMedia({
        type,
        slugFolderName,
        metaFileName: slugMediaName,
      })
      .catch((err, p) => {
        notify({
          socket,
          socketid: socket.id,
          not_localized_string: `Failed to remove media: ${err}`,
          type: "error",
        });
        reject(err);
      });

    updateFolderModified({ type, slugFolderName });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "removed_media",
      detail: { type, slugFolderName, slugMediaName },
    });

    await sendMedias({ type, slugFolderName });
  }

  function onListSpecificMedias(socket, { type, medias_list }) {
    dev.logfunction(
      `EVENT - onListSpecificMedias with 
      type = ${type} 
      medias_list = ${JSON.stringify(medias_list, null, 4)}`
    );
    sendSpecificMedias({ type, medias_list, socket });
  }

  async function onDownloadPubliPDF(socket, { slugPubliName, options }) {
    dev.logfunction(
      `EVENT - onDownloadPubliPDF with 
      slugPubliName = ${slugPubliName}`
    );

    const foldersData = await file.getFolder({
      type: "publications",
      slugFolderName: slugPubliName,
    });

    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugPubliName], "publications")
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: folder can’t be edited ${slugPubliName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    const { pdfName, imageName, docPath } = await exporter.makePDFForPubli({
      slugPubliName,
      options,
    });

    notify({
      socket,
      localized_string: `finished_creating_recipe`,
      type: "success",
    });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "exported_pdf",
      detail: { slugPubliName, options },
    });

    api.sendEventWithContent(
      "publiPDFGenerated",
      { pdfName, imageName, docPath },
      io,
      socket
    );
  }

  async function onDownloadVideoPubli(socket, { slugPubliName, options }) {
    dev.logfunction(
      `EVENT - onDownloadVideoPubli with 
      slugPubliName = ${slugPubliName} 
      and options = ${JSON.stringify(options)}`
    );

    const foldersData = await file.getFolder({
      type: "publications",
      slugFolderName: slugPubliName,
    });

    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugPubliName], "publications")
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: folder can’t be edited ${slugPubliName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    const videoName = await exporter
      .makeVideoForPubli({ slugPubliName, socket, options })
      .catch((error_msg) => {
        notify({
          socket,
          socketid: socket.id,
          localized_string: `video_creation_failed`,
          not_localized_string: error_msg,
          type: "error",
        });

        api.sendEventWithContent("publiVideoFailed", {}, io, socket);
      });

    notify({
      socket,
      localized_string: `finished_creating_recipe`,
      type: "success",
    });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "exported_video",
      detail: { slugPubliName, options },
    });

    api.sendEventWithContent("publiVideoGenerated", { videoName }, io, socket);
  }

  async function onDownloadStopmotionPubli(socket, { slugPubliName, options }) {
    dev.logfunction(
      `EVENT - onDownloadStopmotionPubli with 
      slugPubliName = ${slugPubliName}`
    );

    const foldersData = await file.getFolder({
      type: "publications",
      slugFolderName: slugPubliName,
    });
    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugPubliName], "publications")
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: folder can’t be downloaded ${slugPubliName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    const videoName = await exporter
      .makeVideoFromImagesInPubli({ slugPubliName, options, socket })
      .catch((error) => {
        notify({
          socket,
          socketid: socket.id,
          localized_string: `video_creation_failed`,
          not_localized_string: error.message,
          type: "error",
        });

        api.sendEventWithContent("publiStopmotionFailed", {}, io, socket);
      });

    notify({
      socket,
      localized_string: `finished_creating_recipe`,
      type: "success",
    });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "exported_stopmotion",
      detail: { slugPubliName, options },
    });

    api.sendEventWithContent(
      "publiStopmotionIsGenerated",
      { videoName },
      io,
      socket
    );
  }

  async function onAddTempMediaToFolder(socket, { from, to, additionalMeta }) {
    dev.logfunction(
      `EVENT - onAddTempMediaToFolder with 
      from = ${JSON.stringify(from)} and to = ${JSON.stringify(to)}`
    );

    const foldersData = await file.getFolder({
      type: to.type,
      slugFolderName: to.slugFolderName,
    });

    if (
      !(await auth
        .canEditFolder(socket, foldersData[to.slugFolderName], to.type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: temp media can’t be added to folder ${to.slugFolderName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    await file
      .addTempMediaToFolder({ from, to, additionalMeta })
      .catch((err) => {
        notify({
          socket,
          socketid: socket.id,
          not_localized_string: `Error adding temp media to folder: ${err}`,
        });
      });

    notify({
      socket,
      socketid: socket.id,
      localized_string: `media_has_been_added_successfully`,
    });
  }

  async function onCopyFolder(
    socket,
    { type, slugFolderName, new_folder_name, id }
  ) {
    dev.logfunction(
      `EVENT - onCopyFolder with 
      type = ${type} and slugFolderName = ${slugFolderName}, for name = ${new_folder_name}`
    );

    const foldersData = await file.getFolder({ type, slugFolderName });

    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: editing this content is not allowed ${slugFolderName} ${err}`,
            type: "error",
          });
        }))
    )
      return;

    const new_slugFolderName = await file.copyFolder({
      type,
      slugFolderName,
      new_folder_name,
    });

    changelog.append({
      author: auth.getSocketAuthors(socket),
      action: "copied_folder",
      detail: { type, slugFolderName, new_folder_name },
    });

    await sendFolders({ type, slugFolderName: new_slugFolderName, id });
  }

  function onUpdateNetworkInfos(socket) {
    dev.logfunction(`EVENT - onUpdateNetworkInfos`);
    api.getNetworkInfos().then(
      (localNetworkInfos) => {
        api.sendEventWithContent(
          "newNetworkInfos",
          localNetworkInfos,
          io,
          socket
        );
      },
      function (err, p) {
        dev.error(`Err while getting local IP: ${err}`);
        reject(err);
      }
    );
  }

  /**************************************************************** GENERAL ********************************/

  // send projects, authors and publications
  async function sendFolders({ type, slugFolderName, socket, id } = {}) {
    dev.logfunction(
      `COMMON - sendFolders for type = ${type} and slugFolderName = ${slugFolderName}`
    );

    let foldersData = {};
    try {
      foldersData = slugFolderName
        ? await file.getFolder({ type, slugFolderName })
        : await file.getFolders({ type });
    } catch (err) {
      dev.error(`Error listing folder(s): ${err}`);
      throw err;
    }

    // if folder creation, we get an ID to open the folder straight away
    if (foldersData !== undefined && slugFolderName && id) {
      foldersData[slugFolderName].id = id;
    }

    // check if single socket or multiple sockets
    Object.keys(io.sockets.connected).forEach(async (sid) => {
      if (socket && socket.id !== sid) return;

      let thisSocket = socket || io.sockets.connected[sid];

      let filteredFoldersData = await auth.filterFolders(
        thisSocket,
        type,
        foldersData
      );

      if (slugFolderName) {
        api.sendEventWithContent(
          "listFolder",
          { [type]: filteredFoldersData },
          io,
          thisSocket
        );
      } else {
        api.sendEventWithContent(
          "listFolders",
          { [type]: filteredFoldersData },
          io,
          thisSocket
        );
      }
    });
  }

  async function sendMedias({
    type,
    slugFolderName,
    metaFileName,
    socket,
    id,
  }) {
    dev.logfunction(
      `COMMON - sendMedias for type = ${type}, slugFolderName = ${slugFolderName}, metaFileName = ${metaFileName} and id = ${id}`
    );

    let foldersData = await file
      .getFolder({ type, slugFolderName })
      .catch((err) => {
        dev.error(`No folder found: ${err}`);
        throw err;
      });

    const list_metaFileName = await file.getMediaMetaNames({
      type,
      slugFolderName,
      metaFileName,
    });

    let medias_list = list_metaFileName.map((_metaFileName) => {
      return {
        slugFolderName,
        metaFileName: _metaFileName,
      };
    });
    let folders_and_medias = await file.readMediaList({ type, medias_list });
    dev.logverbose(`Got medias, now sending to the right clients`);

    foldersData[slugFolderName].medias = {};

    if (
      folders_and_medias !== undefined &&
      Object.keys(folders_and_medias).length
    ) {
      if (metaFileName && id) {
        folders_and_medias[slugFolderName].medias[metaFileName].id = id;
      }

      foldersData[slugFolderName].medias =
        folders_and_medias[slugFolderName].medias;
    }

    for (sid in io.sockets.connected) {
      if (!!socket && socket.id !== sid) {
        continue;
      }

      let thisSocket = socket || io.sockets.connected[sid];

      let filtered_folders_and_medias = await auth.filterMedias(
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
    }
  }

  // only for one user at a time
  function sendSpecificMedias({ type, medias_list, socket }) {
    dev.logfunction(`COMMON - sendSpecificMedias`);
    file.readMediaList({ type, medias_list }).then((folders_and_medias) => {
      api.sendEventWithContent(
        "listSpecificMedias",
        { [type]: folders_and_medias },
        io,
        socket
      );
    });
  }

  function onUpdateClientInfo(socket, data) {
    Object.keys(data).map((k) => {
      socket._data[k] = data[k];
    });
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
        // not sending socketio ID in full — we use it to check incoming REST request
        id: id.substring(0, 4),
        data: this_socket._data,
      });
    });

    api.sendEventWithContent("listClients", connected_clients, io, socket);
  }

  function onClientDisconnect(socket) {
    sendClients();

    dev.log(
      `Clients connected currently : ${
        Object.keys(io.sockets.connected).length
      }`
    );
  }

  async function onLoadJournal(socket, { type = "changelog" } = {}) {
    dev.logfunction(`EVENT - onLoadJournal for type = ${type}`);

    const socket_is_admin = await auth.isSocketSessionAdmin(socket);
    if (!socket_is_admin) {
      dev.error(`Non-admin attempted to load journal`);
      notify({
        socket,
        socketid: socket.id,
        localized_string: `action_not_allowed`,
        not_localized_string: `Error: you need to be an admin to read the journal`,
        type: "error",
      });
      throw `Non-admin attempted to load journal`;
    }

    let journal_content;
    if (type === "changelog") journal_content = await changelog.read();
    if (type === "access") journal_content = await access.read();

    api.sendEventWithContent("loadJournal", journal_content, io, socket);
  }

  async function onEmptyJournal(socket, { type = "changelog" } = {}) {
    dev.logfunction(`EVENT - onEmptyJournal for type = ${type}`);

    const socket_is_admin = await auth.isSocketSessionAdmin(socket);
    if (!socket_is_admin) {
      dev.error(`Non-admin attempted to empty journal`);
      notify({
        socket,
        socketid: socket.id,
        localized_string: `action_not_allowed`,
        not_localized_string: `Error: you need to be an admin to empty the journal`,
        type: "error",
      });
      throw `Non-admin attempted to empty journal`;
    }

    if (type === "changelog") journal_content = await changelog.empty();
    if (type === "access") journal_content = await access.empty();

    await onLoadJournal(socket, { type });
  }

  return API;
})();
