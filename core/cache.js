const cache = require('memory-cache');

module.exports = cache = (function() {
  function makeKey({ type, slugFolderName }) {
    return `${type}/${slugFolderName}`;
  }

  return {
    get: ({ type, slugFolderName }) => {
      const key = makeKey({ type, slugFolderName });
      cache.get(key);
    },
    put: ({ type, slugFolderName }, value) => {
      const key = makeKey({ type, slugFolderName });
      cache.put(key, value);
      debugger;
    }
  };
})();
