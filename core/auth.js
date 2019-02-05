const SparkMD5 = require('spark-md5');

const dev = require('./dev-log'),
  file = require('./file');

module.exports = (function() {
  // This var stores all session ID and the folder they are authorized to edit

  const API = {
    setAuthenticate: folder_passwords => setAuthenticate(folder_passwords),
    canAdminFolder: (socket, foldersData, slugFolderName, type) =>
      canAdminFolder(socket, foldersData, slugFolderName, type),
    filterFolders: (socket, type, foldersData) =>
      filterFolders(socket, type, foldersData),
    filterMedias: mediasData => filterMedias(mediasData)
  };

  function setAuthenticate(folder_passwords) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`AUTH — setAuthenticate`);

      if (
        folder_passwords === undefined ||
        Object.keys(folder_passwords).length === 0
      ) {
        resolve({});
      }

      let tasks = [];

      Object.keys(folder_passwords).map(type => {
        // get all folders slugs and passwords
        if (
          typeof folder_passwords[type] !== 'object' ||
          Object.keys(folder_passwords[type]).length === 0
        ) {
          return;
        }

        let myPromise = new Promise((resolve, reject) => {
          file
            .getFolder({ type })
            .then(foldersData => {
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
              resolve();
            });
        });
        tasks.push(myPromise);
      });
      Promise.all(tasks).then(d_array => {
        if (d_array.length === 0) {
          resolve({});
        }
        d_array = d_array.filter(i => !!i);
        resolve(d_array);
      });
    });
  }

  function canAdminFolder(socket, foldersData, slugFolderName, type) {
    dev.logfunction(`AUTH — canAdminFolder ${slugFolderName}`);

    if (
      !foldersData[slugFolderName].hasOwnProperty('password') ||
      foldersData[slugFolderName].password === ''
    ) {
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
    dev.logfunction(`AUTH — filtering folders data`);

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
  return API;
})();
