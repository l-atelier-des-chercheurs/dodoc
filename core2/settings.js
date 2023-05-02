const utils = require("./utils"),
  folder = require("./folder");

module.exports = (function () {
  let local_cache = undefined;

  const API = {
    get: async () => {
      dev.logfunction();
      const folder_meta = await folder
        .getFolder({
          path_to_folder: "",
        })
        .catch((err) => {
          dev.error(err);
          return {};
        });
      return folder_meta;
    },
    updatePath({ new_path }) {
      dev.logfunction();
      _saveNewPathToUserContent({ path: new_path });
    },
  };

  return API;
})();

function _saveNewPathToUserContent({ path }) {
  try {
    const Store = require("electron-store");
    const store = new Store();
    store.set("custom_content_path", path);
  } catch (err) {
    throw new Error(`option_only_available_in_electron`);
  }
}
