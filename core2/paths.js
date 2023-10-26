module.exports = (function () {
  const API = {
    getCacheFolder(is_electron) {
      if (is_electron) {
        const { app } = require("electron");
        return app.getPath("temp");
      } else {
        const getPath = require("platform-folders");
        return getPath.getCacheFolder();
      }
    },
    getDocumentsFolder(is_electron) {
      if (is_electron) {
        const { app } = require("electron");
        return app.getPath("documents");
      } else {
        const getPath = require("platform-folders");
        return getPath.getDocumentsFolder();
      }
    },
  };

  return API;
})();
