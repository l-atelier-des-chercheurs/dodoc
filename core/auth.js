const bcrypt = require("bcrypt");

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
    canAdminFolder: (socket, foldersData, type) =>
      new Promise((resolve, reject) =>
        canAdminFolder(socket, foldersData, type)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    canSeeFolder: (socket, foldersData, type) =>
      new Promise((resolve, reject) =>
        canSeeFolder(socket, foldersData, type)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    filterFolders: (socket, type, foldersData) =>
      filterFolders(socket, type, foldersData),
    filterMedias: (socket, type, folders_and_medias) =>
      new Promise((resolve, reject) =>
        filterMedias(socket, type, folders_and_medias)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    removeNonPublicMediasFromAllFolders: (folders_and_medias) =>
      removeNonPublicMediasFromAllFolders(folders_and_medias),

    isSubmittedSessionPasswordValid: (pwd) =>
      isSubmittedSessionPasswordValid(pwd),

    hashCode: (code) => hashCode(code),
    encrypt: (code) => encrypt(code),
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

  async function canAdminFolder(socket, foldersData, type) {
    const slugFolderName = Object.keys(foldersData)[0];

    dev.logfunction(
      `AUTH — canAdminFolder with slugFolderName = ${slugFolderName}, type = ${type}`
    );

    const sockets_authors =
      socket &&
      socket._is_authorized_for_folders &&
      socket._is_authorized_for_folders.length > 0
        ? socket._is_authorized_for_folders.find(
            (f) =>
              f.type === "authors" &&
              f.allowed_slugFolderNames &&
              f.allowed_slugFolderNames.length > 0
          )
        : false;
    let sockets_authors_slugs = [];

    // socket has no authors, but might be able to access if no authors on folder, and no password
    if (!sockets_authors)
      dev.logfunction(`AUTH — canAdminFolder : socket has no authors`);
    else {
      sockets_authors_slugs = sockets_authors.allowed_slugFolderNames;
      dev.logverbose(
        `AUTH — canAdminFolder: socket authors are ${sockets_authors_slugs.join(
          ","
        )}`
      );
    }

    // check if account is admin
    // if it is then it can see everything
    if (sockets_authors) {
      const is_admin = await isSocketLoggedInAsAdmin(sockets_authors_slugs);
      dev.logverbose(`AUTH — canAdminFolder: is_admin = ${is_admin}`);
      if (is_admin) return true;
    }

    // let’s check if only_authors_can_edit_own_content is set to true
    // if folder has author, then socket has to have authors aswell
    if (global.only_authors_can_edit_own_content) {
      // return there if socket has no authorized list
      if (!sockets_authors) return false;

      if (
        foldersData[slugFolderName].authors &&
        Array.isArray(foldersData[slugFolderName].authors) &&
        foldersData[slugFolderName].authors.length > 0 &&
        foldersData[slugFolderName].authors.some((a) => !!a.slugFolderName)
      ) {
        // this means that only authors can edit the content
        // if folder has authors, then we need to check whether this socket has author as well
        // legacy: in the past authors were tagged with their name (and not their slugs… stupid decision…)
        // so we need to only get authors that have their slugs
        const allowed_authors_slugs = foldersData[
          slugFolderName
        ].authors.reduce((acc, a) => {
          if (a.slugFolderName) acc.push(a.slugFolderName);
          return acc;
        }, []);

        dev.logverbose(
          `AUTH — canAdminFolder: folder has authors: allowed_authors_slugs = ${allowed_authors_slugs.join(
            " - "
          )}`
        );
        const socket_has_author_that_is_allowed = allowed_authors_slugs.some(
          (allowed_author_slug) =>
            sockets_authors_slugs.includes(allowed_author_slug)
        );

        dev.logverbose(
          `AUTH — canAdminFolder: has author, is socket author --> ${socket_has_author_that_is_allowed}`
        );
        return socket_has_author_that_is_allowed;
      } else {
        // if folder has no author then we’re good
        dev.logverbose(
          `AUTH — canAdminFolder: no author for folder --> authorized`
        );
      }
    }

    // let’s check whether the folder has a password
    if (
      !foldersData[slugFolderName].hasOwnProperty("password") ||
      foldersData[slugFolderName].password === ""
    ) {
      dev.logverbose(`AUTH — canAdminFolder: no password --> authorized`);
      return true;
    }

    if (isSocketAuthorizedForFolders({ socket, type, slugFolderName })) {
      dev.logverbose(
        `AUTH — canAdminFolder: socket has password --> authorized`
      );
      return true;
    } else {
      dev.logverbose(
        `AUTH — canAdminFolder: socket doesn’t have password --> refused`
      );
      return false;
    }
  }

  async function canSeeFolder(socket, foldersData, type) {
    const slugFolderName = Object.keys(foldersData)[0];

    dev.logfunction(
      `AUTH — canSeeFolder with slugFolderName = ${slugFolderName}, type = ${type}`
    );

    return await canAdminFolder(socket, foldersData, type);
  }

  function filterFolders(socket, type, foldersData) {
    dev.logfunction(`AUTH — filterFolders`);

    if (foldersData === undefined) {
      return;
    }

    // we do this in order not to touch the original foldersData for other clients
    let filteredFoldersData = JSON.parse(JSON.stringify(foldersData));

    // for (let slugFolderName in filteredFoldersData) {
    //   // find if sessionID has this folder
    //   if (canAdminFolder(socket, filteredFoldersData, slugFolderName, type)) {
    //     filteredFoldersData[slugFolderName]._authorized = true;
    //   } else {
    //     filteredFoldersData[slugFolderName]._authorized = false;
    //   }
    // }
    return filteredFoldersData;
  }

  async function filterMedias(socket, type, folders_and_medias) {
    dev.logfunction(`AUTH — filterMedias`);

    const can_see_folder = await canSeeFolder(socket, folders_and_medias, type);

    if (can_see_folder) {
      return folders_and_medias;
    } else {
      // check for each media if hasownproperty 'public' and if public is set to true
      return removeNonPublicMediasFromAllFolders(folders_and_medias);
    }
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

    if (!!pwd && String(pwd) === String(global.session_password)) {
      // has session password, is good
      dev.logverbose(`Has session password, is valid`);
      return true;
    } else {
      // has session password, is wrong
      dev.logverbose(`Expected pwd: ${global.session_password}`);
      dev.logverbose(`Submitted pwd: ${pwd}`);
    }
    return false;
  }

  function hashCode(s) {
    return s.split("").reduce(function (a, b) {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
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
      return true;
    return false;
  }

  return API;
})();
