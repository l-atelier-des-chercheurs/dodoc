const bcrypt = require("bcryptjs");

const dev = require("./dev-log"),
  file = require("./file");

module.exports = (function () {
  const API = {
    setAuthenticate: (user_folder_passwords) =>
      new Promise((resolve, reject) =>
        setAuthenticate(user_folder_passwords)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    canEditFolder: (socket, folderData, type) =>
      new Promise((resolve, reject) =>
        canEditFolder(socket, folderData, type)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    canSeeFolder: (socket, folderData, type) =>
      new Promise((resolve, reject) =>
        canSeeFolder(socket, folderData, type)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    filterFolders: (socket, type, foldersData) =>
      new Promise((resolve, reject) =>
        filterFolders(socket, type, foldersData)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    filterMedias: (socket, type, folders_and_medias) =>
      new Promise((resolve, reject) =>
        filterMedias(socket, type, folders_and_medias)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    preventFieldsEditingDependingOnRole: ({ socket, type, type_two, meta }) =>
      new Promise((resolve, reject) =>
        preventFieldsEditingDependingOnRole({ socket, type, type_two, meta })
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),

    removeNonPublicMediasFromAllFolders: (folders_and_medias) =>
      removeNonPublicMediasFromAllFolders(folders_and_medias),

    isSubmittedSessionPasswordValid: (pwd) =>
      isSubmittedSessionPasswordValid(pwd),

    hashCode: (code) => hashCode(code),

    getSocketAuthors: (socket) => getSocketAuthors(socket),

    isSocketSessionAdmin: (socket) =>
      new Promise((resolve, reject) =>
        isSocketSessionAdmin(socket)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
  };

  async function setAuthenticate(user_folder_passwords) {
    dev.logfunction(
      `AUTH — setAuthenticate with ${JSON.stringify(
        user_folder_passwords,
        null,
        4
      )}`
    );

    if (
      typeof user_folder_passwords !== "object" ||
      Object.keys(user_folder_passwords).length === 0
    ) {
      return [];
    }

    let tasks = Object.entries(user_folder_passwords).reduce(
      (acc, [type, foldertype_passwords]) => {
        if (
          typeof foldertype_passwords !== "object" ||
          Object.keys(foldertype_passwords).length === 0
        ) {
          dev.log(`AUTH — setAuthenticate : no usable content for ${type}`);
          return acc;
        }

        acc.push(async () => {
          // get all folders slugs and passwords
          const foldersData = await file.getFolder({ type }).catch((err) => {
            dev.error(`Failed to get folder data: ${err}`);
            return [];
          });

          if (!foldersData) return [];

          dev.logverbose(
            `AUTH — setAuthenticate : got folder data, now checking against user_folder_passwords[${type}]`
          );

          let allowed_slugFolderNames = [];

          // compare with data we received
          for (let slugFolderName in foldertype_passwords) {
            dev.logverbose(
              `AUTH — setAuthenticate : checking for ${slugFolderName}`
            );
            if (
              foldersData.hasOwnProperty(slugFolderName) &&
              foldersData[slugFolderName].hasOwnProperty("password") &&
              !!foldersData[slugFolderName].password
            ) {
              const password_field_options =
                global.settings.structure[type].fields.password;

              let match = false;
              const submitted_password = foldertype_passwords[slugFolderName];

              if (
                password_field_options.hasOwnProperty("transform") &&
                password_field_options.transform === "crypt"
              ) {
                match = await bcrypt.compare(
                  submitted_password,
                  foldersData[slugFolderName].password
                );
              } else {
                match =
                  submitted_password === foldersData[slugFolderName].password;
              }

              if (match) {
                dev.logverbose(`Password fit for ${slugFolderName}.`);
                allowed_slugFolderNames.push(slugFolderName);
              } else {
                dev.error(`Password is wrong for ${slugFolderName}.`);
                dev.error(`Submitted password is ${submitted_password}.`);
              }
            } else {
              dev.logverbose(
                `No password for folder = ${slugFolderName}, adding it to allowed.`
              );
              allowed_slugFolderNames.push(slugFolderName);
            }
          }

          return { type, allowed_slugFolderNames };
        });

        return acc;
      },
      []
    );

    let d_array = await Promise.all(tasks.map((p) => p()));

    if (d_array.length === 0) {
      return [];
    }

    d_array = d_array.filter((i) => !!i);
    return d_array;
  }

  async function isSocketSessionAdmin(socket) {
    const sockets_authors_slugs =
      socket &&
      socket._is_authorized_for_folders &&
      socket._is_authorized_for_folders.length > 0 &&
      socket._is_authorized_for_folders.some(
        (f) =>
          f.type === "authors" &&
          f.allowed_slugFolderNames &&
          f.allowed_slugFolderNames.length > 0
      )
        ? socket._is_authorized_for_folders.find(
            (f) =>
              f.type === "authors" &&
              f.allowed_slugFolderNames &&
              f.allowed_slugFolderNames.length > 0
          ).allowed_slugFolderNames
        : false;

    // check if account is admin
    // if it is then it can see everything
    if (sockets_authors_slugs)
      return await isSocketLoggedInAsAdmin(sockets_authors_slugs);

    return false;
  }

  async function canEditFolder(socket, folderData, type) {
    const slugFolderName = folderData.slugFolderName;

    dev.logfunction(
      `AUTH — canEditFolder with slugFolderName = ${slugFolderName}, type = ${type}`
    );

    /* 
      overview : 
      • if has editing_limited_to === everybody, 
        - then YES
      • if socket is admin
        - then YES
      • if has editing_limited_to === with_password or editing_limited_to is not set,
        - if folder has no password or if password match
          - then YES
      • if has editing_limited_to === only_authors 
        - if folder and socket have one authors_slug in common
          - then YES
      • if has editing_limited_to === nobody 
        - nobody except admins
          - then YES
      then NO

    */

    if (
      folderData.hasOwnProperty("editing_limited_to") &&
      folderData.editing_limited_to === "everybody"
    ) {
      return "everybody_can_edit";
    }

    const sockets_authors_slugs = getSocketAuthors(socket);

    // socket has no authors, but might be able to access if no authors on folder, and no password
    if (!sockets_authors_slugs)
      dev.logverbose(`AUTH — canEditFolder : socket has no authors`);
    else
      dev.logverbose(
        `AUTH — canEditFolder: socket authors are ${sockets_authors_slugs.join(
          ","
        )}`
      );

    // check if account is admin
    // if it is then it can see everything
    if (sockets_authors_slugs) {
      const is_admin = await isSocketLoggedInAsAdmin(sockets_authors_slugs);
      dev.logverbose(`AUTH — canEditFolder: is_admin = ${is_admin}`);
      if (is_admin) return "is_session_admin";
    }

    if (folderData.editing_limited_to === "nobody") {
      throw new Error("nobody_can_edit");
    }

    // if editing_limited_to is not set, or set to with_password
    if (
      !folderData.hasOwnProperty("editing_limited_to") ||
      folderData.editing_limited_to === "" ||
      folderData.editing_limited_to === "with_password"
    ) {
      dev.logverbose(`AUTH — canEditFolder: checkIfHasPasswordOrPasswordMatch`);
      if (
        checkIfHasPasswordOrPasswordMatch({
          socket,
          type,
          slugFolderName,
          folderData,
        })
      )
        return "has_password";
      else throw new Error("missing_password");
    }

    // let’s check if editing_limited_to is set to 'only_authors'
    // if folder has author, then socket has to have authors aswell
    if (folderData.editing_limited_to === "only_authors") {
      const reason_for_edit_allowed = await checkIfAuthorIsFoldersAuthor({
        sockets_authors_slugs,
        folderData,
      }).catch((err) => {
        throw new Error(err);
      });
      return reason_for_edit_allowed;
    }
  }

  async function checkIfAuthorIsFoldersAuthor({
    sockets_authors_slugs,
    folderData,
  }) {
    dev.logfunction(`AUTH — checkIfAuthorIsFoldersAuthor`);

    // return there if socket has no authorized list
    if (!sockets_authors_slugs) throw new Error("socket_is_not_logged_in");

    if (
      folderData.authors &&
      Array.isArray(folderData.authors) &&
      folderData.authors.length > 0 &&
      folderData.authors.some((a) => !!a.slugFolderName)
    ) {
      // this means that only authors can edit the content
      // if folder has authors, then we need to check whether this socket has author as well
      // legacy: in the past authors were tagged with their name (and not their slugs… stupid decision…)
      // so we need to only get authors that have their slugs
      const allowed_authors_slugs = folderData.authors.reduce((acc, a) => {
        if (a.slugFolderName) acc.push(a.slugFolderName);
        return acc;
      }, []);

      dev.logverbose(
        `AUTH — canEditFolder: folder has authors: allowed_authors_slugs = ${allowed_authors_slugs.join(
          " - "
        )}`
      );
      const socket_has_author_that_is_allowed = allowed_authors_slugs.some(
        (allowed_author_slug) =>
          sockets_authors_slugs.includes(allowed_author_slug)
      );

      dev.logverbose(
        `AUTH — canEditFolder: has author, is socket author --> ${socket_has_author_that_is_allowed}`
      );
      if (socket_has_author_that_is_allowed) return "allowed_author";
      else throw new Error("authors_not_allowed");
    } else {
      // if folder has no author then we’re good
      dev.logverbose(
        `AUTH — canEditFolder: no author for folder though folder is set to only_authors --> unauthorized`
      );
      return "no_author_set_for_folder";
    }
  }

  async function canSeeFolder(socket, folderData, type) {
    const slugFolderName = folderData.slugFolderName;

    dev.logfunction(
      `AUTH — canSeeFolder with slugFolderName = ${slugFolderName}, type = ${type}`
    );

    if (
      folderData.hasOwnProperty("viewing_limited_to") &&
      folderData.viewing_limited_to === "everybody"
    ) {
      return "everybody_can_edit";
    }

    const sockets_authors_slugs = getSocketAuthors(socket);
    if (sockets_authors_slugs) {
      const is_admin = await isSocketLoggedInAsAdmin(sockets_authors_slugs);
      dev.logverbose(`AUTH — canSeeFolder: is_admin = ${is_admin}`);
      if (is_admin) return "is_session_admin";
    }

    if (
      folderData.hasOwnProperty("viewing_limited_to") &&
      folderData.viewing_limited_to === "only_authors"
    ) {
      const reason_for_viewing_allowed = await checkIfAuthorIsFoldersAuthor({
        sockets_authors_slugs,
        folderData,
      }).catch((err) => {
        throw new Error(err);
      });
      return reason_for_viewing_allowed;
    }

    const reason = await canEditFolder(socket, folderData, type).catch(
      (err) => {
        dev.error(`Failed to edit folder: ${err}`);
      }
    );

    if (!reason) return false;

    return reason;
  }

  async function filterFolders(socket, type, foldersData) {
    dev.logfunction(`AUTH — filterFolders`);

    if (foldersData === undefined) {
      return {};
    }

    const socket_is_admin = await isSocketSessionAdmin(socket);

    // we do this in order not to touch the original foldersData for other clients
    let filteredFoldersData = JSON.parse(JSON.stringify(foldersData));

    // for (let slugFolderName in filteredFoldersData) {
    //   // find if sessionID has this folder
    //   if (canEditFolder(socket, filteredFoldersData, slugFolderName, type)) {
    //     filteredFoldersData[slugFolderName]._authorized = true;
    //   } else {
    //     filteredFoldersData[slugFolderName]._authorized = false;
    //   }
    // }

    const filter_folders = {};

    for ([slugFolderName, meta] of Object.entries(filteredFoldersData)) {
      const filtered_meta = filterMetaDependingOnAuthorRole({
        socket,
        socket_is_admin,
        type,
        slugFolderName,
        meta,
      });
      filter_folders[slugFolderName] = filtered_meta;
    }

    return filter_folders;
  }

  async function filterMedias(socket, type, folders_and_medias) {
    dev.logfunction(`AUTH — filterMedias`);

    const slugFolderName = Object.keys(folders_and_medias)[0];

    if (
      !(await canSeeFolder(
        socket,
        folders_and_medias[slugFolderName],
        type
      ).catch((err) => {
        dev.error(`Failed to see folder: ${err}, returning public medias only`);
      }))
    ) {
      // check for each media if hasownproperty 'public' and if public is set to true
      return removeNonPublicMediasFromAllFolders(folders_and_medias);
    }

    return folders_and_medias;
  }

  function filterMetaDependingOnAuthorRole({
    socket,
    socket_is_admin,
    type,
    type_two,
    slugFolderName,
    meta,
  }) {
    dev.logfunction(`AUTH — filterMetaDependingOnAuthorRole`);

    // check if structure has a property enabled
    let fields =
      type_two === undefined
        ? global.settings.structure[type].fields
        : global.settings.structure[type][type_two].fields;

    if (meta.hasOwnProperty("password") && meta.password !== "") {
      meta.password = "has_pass";
    }

    const field_to_act_on = Object.entries(fields).find(([key, f]) =>
      f.hasOwnProperty("show_only_to")
    );
    if (!field_to_act_on) return meta;

    const field_name = field_to_act_on[0];
    const field_props = field_to_act_on[1];

    // check if author is one of field_to_act_on.show_only_to
    if (field_props.show_only_to.includes("self")) {
      // check is socket is amongst the authors of this content
      if (isSocketAuthorizedForFolders({ socket, type, slugFolderName })) {
        return meta;
      }
    }

    if (field_props.show_only_to.includes("admin")) {
      // check is socket is amongst the authors of this content
      if (socket_is_admin) {
        return meta;
      }
    }

    // hide field
    if (meta.hasOwnProperty(field_name) && !!meta[field_name])
      delete meta[field_name];
    return meta;
  }

  async function preventFieldsEditingDependingOnRole({
    socket,
    type,
    type_two,
    meta,
  }) {
    dev.logfunction(`AUTH — preventFieldsEditingDependingOnRole`);

    if (typeof meta !== "object" || Object.keys(meta).length === 0) return meta;

    // check if structure has a property enabled
    let fields =
      type_two === undefined
        ? global.settings.structure[type].fields
        : global.settings.structure[type][type_two].fields;

    const field_to_act_on = Object.entries(fields).find(([key, f]) =>
      f.hasOwnProperty("only_admin_can_edit")
    );
    if (!field_to_act_on) return meta;

    const field_name = field_to_act_on[0];
    const field_props = field_to_act_on[1];

    if (meta.hasOwnProperty(field_name) && !!meta[field_name]) {
      if (!(await isSocketSessionAdmin(socket))) {
        delete meta[field_name];
      }
    }
    return meta;
  }

  function removeNonPublicMediasFromAllFolders(folders_and_medias) {
    let filtered_folders_and_medias = JSON.parse(
      JSON.stringify(folders_and_medias)
    );
    Object.keys(filtered_folders_and_medias).map((slugFolderName) => {
      const folders_data = filtered_folders_and_medias[slugFolderName];
      if (folders_data.hasOwnProperty("medias")) {
        Object.keys(folders_data.medias).map((slugMediaName) => {
          if (
            !folders_data.medias[slugMediaName].hasOwnProperty("public") ||
            folders_data.medias[slugMediaName].public === false
          ) {
            // if no public prop or public prop === false, remove from list
            delete folders_data.medias[slugMediaName];
          }
        });
      }
    });
    return JSON.parse(JSON.stringify(filtered_folders_and_medias));
  }

  function isSubmittedSessionPasswordValid(pwd) {
    dev.logfunction(`AUTH — isSubmittedSessionPasswordValid`);

    if (!global.session_password || String(global.session_password) === "") {
      // no session password
      dev.logverbose(`No session password`);
      return true;
    }

    if (!pwd) {
      // no session password
      dev.logverbose(`Session password is set but no password were submitted`);
      return false;
    }

    if (String(pwd) === String(global.session_password)) {
      // has session password, is good
      dev.logverbose(`Has session password, is valid`);
      return true;
    }

    // has session password, is wrong
    dev.logverbose(`Submitted session pwd not valid.`);
    dev.logverbose(`Expected pwd: ${global.session_password}`);
    dev.logverbose(`Submitted pwd: ${pwd}`);
    return false;
  }

  function hashCode(s) {
    return s.split("").reduce(function (a, b) {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
  }

  function checkIfHasPasswordOrPasswordMatch({
    socket,
    type,
    slugFolderName,
    folderData,
  }) {
    dev.logverbose(
      `AUTH — checkIfHasPasswordOrPasswordMatch for ${type}/${slugFolderName}`
    );

    if (!folderData.hasOwnProperty("password") || folderData.password === "") {
      dev.logverbose(
        `AUTH — checkIfHasPasswordOrPasswordMatch: no password --> authorized`
      );
      return true;
    }

    if (isSocketAuthorizedForFolders({ socket, type, slugFolderName })) {
      dev.logverbose(
        `AUTH — checkIfHasPasswordOrPasswordMatch: socket has password --> authorized`
      );
      return true;
    } else {
      dev.logverbose(
        `AUTH — checkIfHasPasswordOrPasswordMatch: socket doesn’t have password --> refused`
      );
      return false;
    }
  }

  function isSocketAuthorizedForFolders({ socket, type, slugFolderName }) {
    if (!socket.hasOwnProperty("_is_authorized_for_folders")) return false;

    return socket._is_authorized_for_folders.some((i) => {
      return (
        i.hasOwnProperty("type") &&
        i.type === type &&
        i.hasOwnProperty("allowed_slugFolderNames") &&
        i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
      );
    });
  }

  async function isSocketLoggedInAsAdmin(sockets_authors_slugs) {
    dev.logfunction(`AUTH — isSocketLoggedInAsAdmin`);

    let is_admin = false;

    // get all session authors
    const all_authors_informations = await file.getFolder({ type: "authors" });
    const admins_slugs = Object.values(all_authors_informations).reduce(
      (acc, a) => {
        if (a.role === "admin") acc.push(a.slugFolderName);
        return acc;
      },
      []
    );

    if (
      admins_slugs.length > 0 &&
      admins_slugs.some((a) => sockets_authors_slugs.includes(a))
    )
      is_admin = true;

    dev.logverbose(`AUTH — isSocketLoggedInAsAdmin: ${is_admin}`);
    return is_admin;
  }

  function getSocketAuthors(socket) {
    return socket &&
      socket._is_authorized_for_folders &&
      socket._is_authorized_for_folders.length > 0 &&
      socket._is_authorized_for_folders.some(
        (f) =>
          f.type === "authors" &&
          f.allowed_slugFolderNames &&
          f.allowed_slugFolderNames.length > 0
      )
      ? socket._is_authorized_for_folders.find(
          (f) =>
            f.type === "authors" &&
            f.allowed_slugFolderNames &&
            f.allowed_slugFolderNames.length > 0
        ).allowed_slugFolderNames
      : false;
  }

  return API;
})();
