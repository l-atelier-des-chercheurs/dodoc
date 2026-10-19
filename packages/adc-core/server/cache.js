const { LRUCache } = require("lru-cache");

module.exports = (function () {
  // separate caches so that scanning a folder with many files
  // doesn't evict folder metas, which are requested much more often
  let _caches = {};
  let _is_enabled = false;

  const sizeCalculation = (value) => {
    if (typeof value === "object") return JSON.stringify(value).length;
    return value.length;
  };

  function _getCache(namespace) {
    const c = _caches[namespace];
    if (!c) throw new Error(`Unknown cache namespace ${namespace}`);
    return c;
  }

  return {
    init: () => {
      _caches.files = new LRUCache({
        max: global.settings.lruCacheMax,
        maxSize: global.settings.lruCacheMaxSize,
        sizeCalculation,
      });
      _caches.folders = new LRUCache({
        max: global.settings.lruFoldersCacheMax,
        maxSize: global.settings.lruFoldersCacheMaxSize,
        sizeCalculation,
      });
      _is_enabled = true;
    },
    get: ({ namespace = "files", key }) => {
      if (!_is_enabled) return;

      const val = _getCache(namespace).get(key);
      if (val) dev.logfunction(`has ${namespace} cache for ${key}`);
      else dev.logfunction(`no ${namespace} cache for ${key}`);

      return val;
    },
    set: ({ namespace = "files", key, value }) => {
      if (!_is_enabled) return;

      dev.logfunction(`set ${namespace} ${key}`);
      const val = _getCache(namespace).set(key, value);
      return val;
    },
    delete: ({ namespace = "files", key }) => {
      if (!_is_enabled) return;

      dev.logfunction(`delete ${namespace} ${key}`);
      const val = _getCache(namespace).delete(key);
      return val;
    },
    printStatus: () => {
      if (!_is_enabled) return dev.log("cache is not enabled");

      for (const [namespace, c] of Object.entries(_caches))
        dev.log(
          `${namespace} cache: number of items = ${c.size}, size = ${c.calculatedSize}`
        );
    },
  };
})();
