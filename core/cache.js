const cache = require('memory-cache');

module.exports = (function() {
  let caches = {};

  function makeKey({ type, slugFolderName }) {
    return `${type}`;
    // if(slugFolderName) {
    //   return `${type}/${slugFolderName}`;
    // } else {
    // }
  }

  return {
    get: ({ type, slugFolderName }) => {
      dev.logfunction(`CACHE — get ${type}/${slugFolderName}`);

      if (!caches.hasOwnProperty(type)) {
        return null;
      }

      if (slugFolderName) {
        const meta = caches[type].get(slugFolderName);
        if (!meta) return null;
        return meta;
      } else {
        let obj = {};
        caches[type].keys().forEach(k => {
          obj[k] = caches[type].get(k);
        });
        return obj;
      }
    },
    put: ({ type, slugFolderName }, value) => {
      dev.logfunction(`CACHE — put ${type}/${slugFolderName}`);
      if (!caches.hasOwnProperty(type)) {
        caches[type] = new cache.Cache();
      }
      caches[type].put(slugFolderName, value);
    },
    del: ({ type, slugFolderName }) => {
      dev.logfunction(`CACHE — del ${type}/${slugFolderName}`);
      if (!caches.hasOwnProperty(type)) {
        return null;
      }
      // if editing a key we need to remove the general one as well
      caches[type].del(slugFolderName);
    }
  };
})();
