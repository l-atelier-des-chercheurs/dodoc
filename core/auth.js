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

      if (Object.keys(folder_passwords).length === 0) {
        resolve({});
      }

      const type = Object.keys(folder_passwords)[0];

      if (folder_passwords === undefined || folder_passwords === {}) {
        dev.logverbose(`No admin data, resolving immediately.`);
        resolve({ [type]: [] });
      } else {
        // get all folders slugs and passwords

        file
          .getFolder({ type })
          .then(foldersData => {
            const foldertype_passwords = folder_passwords[type];
            let list_of_folders_whose_passwords_match = [];

            // compare with data we received
            for (let slugFolderName in foldertype_passwords) {
              if (
                foldersData.hasOwnProperty(slugFolderName) &&
                foldersData[slugFolderName].hasOwnProperty('password')
              ) {
                if (
                  foldertype_passwords[slugFolderName] ===
                  SparkMD5.hash(foldersData[slugFolderName].password)
                ) {
                  dev.logverbose(`Password fit for ${slugFolderName}.`);
                  list_of_folders_whose_passwords_match.push(slugFolderName);
                } else {
                  dev.logverbose(`Password is wrong for ${slugFolderName}.`);
                }
              }
            }
            resolve({ [type]: list_of_folders_whose_passwords_match });
          })
          .catch(err => {
            dev.error(`Failed to get folder data: ${err}`);
            resolve({});
          });
      }
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

    if (
      socket.hasOwnProperty('_is_authorized_for_folders') &&
      socket._is_authorized_for_folders.hasOwnProperty(type) &&
      socket._is_authorized_for_folders[type].indexOf(slugFolderName) >= 0
    ) {
      dev.logverbose(`AUTH — canAdminFolder: accepted`);
      return true;
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

    for (let slugFolderName in filteredFoldersData) {
      // find if sessionID has this folder
      if (canAdminFolder(socket, filteredFoldersData, slugFolderName, type)) {
        filteredFoldersData[slugFolderName]._authorized = true;
      } else {
        filteredFoldersData[slugFolderName]._authorized = false;
      }
    }
    return filteredFoldersData;
  }
  return API;
})();
