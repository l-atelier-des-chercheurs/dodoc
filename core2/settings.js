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
    set: async ({ data }) => {
      dev.logfunction();

      let old_meta = await API.get();

      if (input_meta.hasOwnProperty("pathToUserContent")) {
        const new_pathToUserContent = input_meta.pathToUserContent;
        _saveNewPathToUserContent({ path: new_pathToUserContent });
        delete input_meta.pathToUserContent;
      }
      // todo store path somewhere else

      let meta = Object.assign({}, old_meta, input_meta);
      meta.$date_modified = utils.getCurrentDate();

      await utils.saveMetaAtPath({
        relative_path: "/",
        file_slug: "settings.txt",
        meta,
      });

      let changed_meta = Object.keys(meta).reduce((acc, key) => {
        if (JSON.stringify(meta[key]) !== JSON.stringify(old_meta[key]))
          acc[key] = meta[key];
        return acc;
      }, {});

      local_cache = undefined;

      return changed_meta;
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
