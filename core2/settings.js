const utils = require("./utils"),
  folder = require("./folder"),
  file = require("./file");

module.exports = (function () {
  let local_cache = undefined;

  const API = {
    get: async () => {
      dev.logfunction();

      let d = JSON.parse(
        JSON.stringify(await folder.getFolder({ path_to_folder: "" }))
      );
      const files = await file.getFiles({ path_to_folder: "" });
      d.$files = files;

      return d;
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
