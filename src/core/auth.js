const SparkMD5 = require('spark-md5');

const dev = require('./dev-log'),
  file = require('./file');

module.exports = (function() {
  // This var stores all session ID and the folder they are authorized to edit

  const API = {
    setAuthenticate: folder_passwords => setAuthenticate(folder_passwords),
    canAdminFolder: (socket, foldersData, type) =>
      canAdminFolder(socket, foldersData, type),
    filterFolders: (socket, type, foldersData) =>
      filterFolders(socket, type, foldersData),
    filterMedias: (socket, type, folders_and_medias) =>
      filterMedias(socket, type, folders_and_medias)
  };

  function setAuthenticate(folder_passwords) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `AUTH — setAuthenticate with ${JSON.stringify(
          folder_passwords,
          null,
          4
        )}`
      );

      if (
        folder_passwords === undefined ||
        Object.keys(folder_passwords).length === 0
      ) {
        resolve([]);
      }

      let tasks = [];

      Object.keys(folder_passwords).map(type => {
        // get all folders slugs and passwords
        if (
          typeof folder_passwords[type] !== 'object' ||
          Object.keys(folder_passwords[type]).length === 0
        ) {
          dev.log(`AUTH — setAuthenticate : no usable content for ${type}`);
          return;
        }

        let myPromise = new Promise((resolve, reject) => {
          file
            .getFolder({ type })
            .then(foldersData => {
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
                  foldersData[slugFolderName].hasOwnProperty('password')
                ) {
                  if (
                    foldertype_passwords[slugFolderName] ===
                    // SparkMD5.hash(foldersData[slugFolderName].password)
                    foldersData[slugFolderName].password
                  ) {
                    dev.logverbose(`Password fit for ${slugFolderName}.`);
                    allowed_slugFolderNames.push(slugFolderName);
                  } else {
                    dev.logverbose(`Password is wrong for ${slugFolderName}.`);
                  }
                }
              }

              resolve({ type, allowed_slugFolderNames });
            })
            .catch(err => {
              dev.error(`Failed to get folder data: ${err}`);
              resolve([]);
            });
        });
        tasks.push(myPromise);
      });
      Promise.all(tasks).then(d_array => {
        if (d_array.length === 0) {
          resolve([]);
        }
        d_array = d_array.filter(i => !!i);
        resolve(d_array);
      });
    });
  }

  function canAdminFolder(socket, foldersData, type) {
    const slugFolderName = Object.keys(foldersData)[0];

    dev.logfunction(
      `AUTH — canAdminFolder with slugFolderName = ${slugFolderName}, type = ${type}`
    );

    if (
      !foldersData[slugFolderName].hasOwnProperty('password') ||
      foldersData[slugFolderName].password === ''
    ) {
      dev.logverbose(`AUTH — canAdminFolder: no password --> authorized`);
      return true;
    }

    // socket._is_authorized_for_folders.filter();

    if (socket.hasOwnProperty('_is_authorized_for_folders')) {
      const _is_authorized_for_this_folder = socket._is_authorized_for_folders.filter(
        i => {
          return (
            i.hasOwnProperty('type') &&
            i.type === type &&
            i.hasOwnProperty('allowed_slugFolderNames') &&
            i.allowed_slugFolderNames.indexOf(slugFolderName) >= 0
          );
        }
      );

      if (_is_authorized_for_this_folder.length > 0) {
        dev.logverbose(`AUTH — canAdminFolder: authorized`);
        return true;
      }
    }
    dev.logverbose(`AUTH — canAdminFolder: refused`);
    return false;
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
      let filtered_folders_and_medias = JSON.parse(
        JSON.stringify(folders_and_medias)
      );
      Object.keys(filtered_folders_and_medias).map(slugFolderName => {
        const folders_data = filtered_folders_and_medias[slugFolderName];
        if (folders_data.hasOwnProperty('medias')) {
          Object.keys(folders_data.medias).map(slugMediaName => {
            if (
              !folders_data.medias[slugMediaName].hasOwnProperty('public') ||
              folders_data.medias[slugMediaName].public === false
            ) {
              // if no public prop or public prop === false, remove from list
              delete folders_data.medias[slugMediaName];
            }
          });
        }
      });
      return filtered_folders_and_medias;
    }
  }

  return API;
})();
