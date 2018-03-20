import localstore from 'store';
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

/** *********
   AUTH
***********/
window.auth = (function() {
  let admin_access;

  const API = {
    init: () => init(),
    updateAdminAccess: folderPass => updateAdminAccess(folderPass),
    removeKey: slugFolderName => removeKey(slugFolderName),
    getAdminAccess: () => getAdminAccess()
  };

  function init() {
    admin_access = localstore.get('admin_access') || {};
  }

  function updateAdminAccess(folderPass) {
    for (let slugFolderName in folderPass) {
      admin_access[slugFolderName] = folderPass[slugFolderName];
    }
    localstore.set('admin_access', admin_access);
  }

  function removeKey(slugFolderName) {
    delete admin_access[slugFolderName];
    localstore.set('admin_access', admin_access);
  }

  function getAdminAccess() {
    return admin_access;
  }

  return API;
})();
auth.init();

/** *********
  UTILS
***********/

$.extend($.easing, {
  easeInOutQuint: function(x, t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return c / 2 * t * t * t * t * t + b;
    }
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
  }
});

// If click on a link with a specific class, open in the browser and not in electron.
$('body').on('click', '.js--openInBrowser', function() {
  if (window && window.process && window.process.type) {
    const shell = window.require('electron').shell;
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});

document.addEventListener(
  'dragover',
  function(event) {
    event.preventDefault();
    return false;
  },
  false
);

document.addEventListener(
  'drop',
  function(event) {
    event.preventDefault();
    return false;
  },
  false
);

import main from './vue/app.js';
