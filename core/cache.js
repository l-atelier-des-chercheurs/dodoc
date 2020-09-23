const cache = require("memory-cache");

module.exports = (function () {
  let caches = {};
  let is_enabled = false;

  return {
    enable: () => (is_enabled = true),
    get: ({ type, slugFolderName }) => {
      if (!is_enabled) {
        return null;
      }

      dev.logfunction(`CACHE — get ${type}/${slugFolderName}`);

      if (!caches.hasOwnProperty(type)) {
        dev.logverbose("--> no cache");
        return null;
      }

      if (slugFolderName) {
        const meta = caches[type].get(slugFolderName);
        if (!meta) {
          dev.logverbose("--> no cache");
          return null;
        }
        dev.logverbose("--> has cache");
        return meta;
      } else {
        dev.logverbose("--> has cache");
        let obj = {};
        caches[type].keys().forEach((k) => {
          obj[k] = caches[type].get(k);
        });
        return obj;
      }
    },
    put: ({ type, slugFolderName }, value) => {
      if (!is_enabled) {
        return null;
      }

      dev.logfunction(`CACHE — put ${type}/${slugFolderName}`);
      if (!caches.hasOwnProperty(type)) {
        caches[type] = new cache.Cache();
      }
      caches[type].put(slugFolderName, value);
    },
    del: ({ type, slugFolderName }) => {
      if (!is_enabled) {
        return null;
      }

      dev.logfunction(`CACHE — del ${type}/${slugFolderName}`);
      if (!caches.hasOwnProperty(type)) {
        return null;
      }
      // if editing a key we need to remove the general one as well
      caches[type].del(slugFolderName);
    },
  };
})();
