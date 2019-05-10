const SparkMD5 = require('spark-md5');
import localstore from 'store';

module.exports = (function() {
  let folder_passwords;

  const API = {
    init: () => init(),
    updateAdminAccess: folderPass => updateAdminAccess(folderPass),
    removeKey: slugFolderName => removeKey(slugFolderName),
    getAdminAccess: () => getAdminAccess()
  };

  function init() {
    folder_passwords = localstore.get('folder_passwords') || {};
  }

  function updateAdminAccess(_folder_passwords) {
    for (var folder_type in _folder_passwords) {
      if (_folder_passwords.hasOwnProperty(folder_type)) {
        if (!folder_passwords.hasOwnProperty(folder_type)) {
          folder_passwords[folder_type] = {};
        }
        folder_passwords[folder_type] = Object.assign(
          folder_passwords[folder_type],
          _folder_passwords[folder_type]
        );
      }
    }
    localstore.set('folder_passwords', folder_passwords);
  }

  // function removeKey(slugFolderName) {
  //   delete folder_passwords[slugFolderName];
  //   // localstore.set('folder_passwords', folder_passwords);
  // }

  function getAdminAccess() {
    return folder_passwords;
  }

  return API;
})();
