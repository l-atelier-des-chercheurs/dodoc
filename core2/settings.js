const utils = require("./utils"),
  folder = require("./folder"),
  file = require("./file"),
  contentFolder = require("./content-folder");

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
      if (!global.is_electron) {
        throw new Error(`option_only_available_in_electron`);
      }

      // refuse folders that would be refused at next startup
      const { status } = await contentFolder.getStatus(new_path);
      if (status === "incompatible") {
        const err = new Error(`content folder is not compatible: ${new_path}`);
        err.code = "content_folder_incompatible";
        throw err;
      }

      const electron = require("../electron/electron");
      electron.saveNewPathToUserContent({ path: new_path });
    },
    getStoragePath: async () => {
      return await _getStoragePath();
    },
  };

  return API;
})();

async function _getStoragePath() {
  dev.logfunction();
  // if (global.is_electron) {
  //   const Store = require("electron-store").default;
  //   const store = new Store({ name: "dodoc" });
  //   return store.get("custom_content_path");
  // }
  return global.pathToUserContent;
}
