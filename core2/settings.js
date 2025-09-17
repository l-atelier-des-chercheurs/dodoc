const utils = require("./utils"),
  folder = require("./folder"),
  file = require("./file");

module.exports = (function () {
  let local_cache = undefined;

  const API = {
    get: async () => {
      dev.logfunction();
      let d = await folder.getFolder({
        path_to_folder: ".",
      });
      return d;
    },
    getFiles: async () => {
      return await file.getFiles({ path_to_folder: "." });
    },
    updateStoragePath: async ({ new_path }) => {
      dev.logfunction();
      await _saveNewPathToUserContent({ path: new_path });
    },
    getStoragePath: async () => {
      return await _getStoragePath();
    },
  };

  return API;
})();

async function _getStoragePath() {
  dev.logfunction();
  if (global.is_electron) {
    const Store = require("electron-store");
    const store = new Store();
    return store.get("custom_content_path");
  }
  return global.pathToUserContent;
}

async function _saveNewPathToUserContent({ path }) {
  dev.logfunction({ path });
  try {
    const Store = require("electron-store");
    const store = new Store();
    store.set("custom_content_path", path);
  } catch (err) {
    throw new Error(`option_only_available_in_electron`);
  }
}
