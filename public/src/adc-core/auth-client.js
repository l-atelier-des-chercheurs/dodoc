const SparkMD5 = require('spark-md5');

module.exports = (function() {
  let folder_passwords = {};

  const API = {
    init: () => init(),
    updateAdminAccess: folderPass => updateAdminAccess(folderPass),
    removeKey: slugFolderName => removeKey(slugFolderName),
    getAdminAccess: () => getAdminAccess()
  };

  function init() {
    folder_passwords = {
      projects: {
        'hello-world': SparkMD5.hash('coucou')
      }
    };
    // folder_passwords = localstore.get('folder_passwords') || {};
  }

  // function updateAdminAccess(folderPass) {
  //   for (let slugFolderName in folderPass) {
  //     folder_passwords[slugFolderName] = folderPass[slugFolderName];
  //   }
  //   // localstore.set('folder_passwords', folder_passwords);
  // }

  // function removeKey(slugFolderName) {
  //   delete folder_passwords[slugFolderName];
  //   // localstore.set('folder_passwords', folder_passwords);
  // }

  function getAdminAccess() {
    return folder_passwords;
  }

  return API;
})();
