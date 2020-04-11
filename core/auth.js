const dev = require("./dev-log"),
  file = require("./file");

module.exports = (function () {
  const API = {
    setAuthenticate: (folder_passwords) => setAuthenticate(folder_passwords),
    canAdminFolder: (socket, foldersData, type) =>
      new Promise((resolve, reject) =>
        canAdminFolder(socket, foldersData, type)
          .then((d) => resolve(d))
          .catch((e) => reject(e))
      ),
    filterFolders: (socket, type, foldersData) =>
      filterFolders(socket, type, foldersData),
    filterMedias: (socket, type, folders_and_medias) =>
      filterMedias(socket, type, folders_and_medias),
    removeNonPublicMediasFromAllFolders: (folders_and_medias) =>
      removeNonPublicMediasFromAllFolders(folders_and_medias),

    isSubmittedSessionPasswordValid: (pwd) =>
      isSubmittedSessionPasswordValid(pwd),

    hashCode: (code) => hashCode(code),
  };

  function setAuthenticate(folder_passwords) {
    return new Promise(function (resolve, reject) {
      dev.logfunction(
        `AUTH — setAuthenticate with ${JSON.stringify(
          folder_passwords,
          null,
          4
        )}`
      );

      // todo : if session_password, a user has to auth before getting any info

      if (
        folder_passwords === undefined ||
        Object.keys(folder_passwords).length === 0
      ) {
        resolve([]);
      }

      let tasks = [];

      Object.keys(folder_passwords).map((type) => {
        // get all folders slugs and passwords
        if (
          typeof folder_passwords[type] !== "object" ||
          Object.keys(folder_passwords[type]).length === 0
        ) {
          dev.log(`AUTH — setAuthenticate : no usable content for ${type}`);
          return;
        }

        let myPromise = new Promise((resolve, reject) => {
          file
            .getFolder({ type })
            .then((foldersData) => {
              dev.logverbose(
                `AUTH — setAuthenticate : got folder data, now checking against folder_passwords[${type}]`
              );
              const foldertype_passwords = folder_passwords[type];

              let allowed_slugFolderNames = [];
              // compare with data we received
              for (let slugFolderName in foldertype_passwords) {
                dev.logverbose(
                  `AUTH — setAuthenticate : checking for ${slugFolderName}`
                );
                if (
                  foldersData.hasOwnProperty(slugFolderName) &&
                  foldersData[slugFolderName].hasOwnProperty("password")
                ) {
                  if (
                    foldertype_passwords[slugFolderName] ===
                    // SparkMD5.hash(foldersData[slugFolderName].password)
                    foldersData[slugFolderName].password
                  ) {
                    dev.logverbose(`Password fit for ${slugFolderName}.`);
                    allowed_slugFolderNames.push(slugFolderName);
                  } else {
                    dev.error(`Password is wrong for ${slugFolderName}.`);
                    dev.error(
                      `Submitted: ${foldertype_passwords[slugFolderName]}\nShould be: ${foldersData[slugFolderName].password}`
                    );
                  }
                }
              }

              resolve({ type, allowed_slugFolderNames });
            })
            .catch((err) => {
              dev.error(`Failed to get folder data: ${err}`);
              resolve([]);
            });
        });
        tasks.push(myPromise);
      });
      Promise.all(tasks).then((d_array) => {
        if (d_array.length === 0) {
          resolve([]);
        }
        d_array = d_array.filter((i) => !!i);
        resolve(d_array);
      });
    });
  }

  async function canAdminFolder(socket, foldersData, type) {
    const slugFolderName = Object.keys(foldersData)[0];

    dev.logfunction(
      `AUTH — canAdminFolder with slugFolderName = ${slugFolderName}, type = ${type}`
    );

    // check if account is admin
    // if it is then it can see everything
    const is_admin = await isSocketLoggedInAsAdmin(socket);
    dev.logverbose(`AUTH — canAdminFolder: is_admin = ${is_admin}`);
    if (is_admin) return true;

    // let’s check if only_authors_can_edit_own_content is set to true
    if (global.only_authors_can_edit_own_content) {
      // this means that only authors can edit the content
      if (
        foldersData[slugFolderName].authors &&
        Array.isArray(foldersData[slugFolderName].authors) &&
        foldersData[slugFolderName].authors.length > 0 &&
        foldersData[slugFolderName].authors.some((a) => !!a.slugFolderName)
      ) {
        // if folder has authors, then we need to check whether this socket has author as well

        // legacy: in the past authors were tagged with their name (and not their slugs… stupid decision…)
        // so we need to only get authors that have their slugs
        const allowed_authors_slugs = foldersData[
          slugFolderName
        ].authors.reduce((acc, a) => {
          if (a.slugFolderName) acc.push(a.slugFolderName);
          return acc;
        }, []);

        const socket_has_author_that_is_allowed = allowed_authors_slugs.some(
          (allowed_author_slug) => {
            return socket._is_authorized_for_folders.some(
              (f) =>
                f.type === "authors" &&
                f.allowed_slugFolderNames &&
                f.allowed_slugFolderNames.includes(allowed_author_slug)
            );
          }
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

  function filterMedias(socket, type, folders_and_medias) {
    dev.logfunction(`AUTH — filterMedias`);

    if (canAdminFolder(socket, folders_and_medias, type)) {
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
    } else if (!!pwd && String(pwd) === String(global.session_password)) {
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

  async function isSocketLoggedInAsAdmin(socket) {
    dev.logfunction(`AUTH — isSocketLoggedInAsAdmin`);

    if (!socket || !socket.hasOwnProperty("_is_authorized_for_folders"))
      return false;

    // get sockets authors
    const sockets_authors = socket._is_authorized_for_folders.find(
      (f) =>
        f.type === "authors" &&
        f.allowed_slugFolderNames &&
        f.allowed_slugFolderNames.length > 0
    );
    if (!sockets_authors) return false;

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
      admins_slugs.some((a) =>
        sockets_authors.allowed_slugFolderNames.includes(a)
      )
    )
      return true;
    return false;
  }

  return API;
})();
