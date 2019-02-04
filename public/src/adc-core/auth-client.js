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

  function updateAdminAccess({ type, slugFolderName, pass }) {
    if (!folder_passwords.hasOwnProperty(type)) {
      folder_passwords[type] = {};
    }
    folder_passwords[type][slugFolderName] = SparkMD5.hash(pass);

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
