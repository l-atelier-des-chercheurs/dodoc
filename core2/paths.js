module.exports = (function () {
  const API = {
    getCacheFolder() {
      if (global.is_electron) {
        const { app } = require("electron");
        return app.getPath("temp");
      } else {
        const getPath = require("platform-folders");
        return getPath.getCacheFolder();
      }
    },
    getDocumentsFolder() {
      if (global.is_electron) {
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
