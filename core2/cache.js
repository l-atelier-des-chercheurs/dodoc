const { LRUCache } = require("lru-cache");

module.exports = (function () {
  let _lru_cache;
  let _is_enabled = false;

  return {
    init: () => {
      const options = {
        max: global.settings.lruCacheMax,
        maxSize: global.settings.lruCacheMaxSize,
        sizeCalculation: (value) => {
          // if (typeof value === "string") return value.length;
          // TODO handle TypeError: Do not know how to serialize a BigInt
          if (typeof value === "object") return JSON.stringify(value).length;
          return value.length;
        },
      };
      _lru_cache = new LRUCache(options);
      _is_enabled = true;
    },
    get: ({ key }) => {
      if (!_is_enabled) return;

      const val = _lru_cache.get(key);
      if (val) dev.logfunction(`has cache for ${key}`);
      else dev.logfunction(`no cache for ${key}`);

      return val;
    },
    set: ({ key, value }) => {
      if (!_is_enabled) return;

      dev.logfunction(`set ${key}`);
      const val = _lru_cache.set(key, value);
      return val;
    },
    delete: ({ key }) => {
      if (!_is_enabled) return;

      dev.logfunction(`delete ${key}`);
      const val = _lru_cache.delete(key);
      return val;
    },
    printStatus: () => {
      if (!_is_enabled) return dev.log("cache is not enabled");

      dev.log(
        `cache is enabled, number of items = ${_lru_cache.size}, size = ${_lru_cache.calculatedSize}`
      );
    },
  };
})();
