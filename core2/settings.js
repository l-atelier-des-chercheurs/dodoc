const utils = require("./utils");

module.exports = (function () {
  let local_cache = undefined;

  const API = {
    get: async () => {
      dev.logfunction();

      if (local_cache) return local_cache;

      let meta = {};
      try {
        meta = await utils.readMetaFile("settings.txt");
      } catch (err) {}

      meta.pathToUserContent = global.pathToUserContent;

      local_cache = JSON.parse(JSON.stringify(meta));

      return meta;
    },
    set: async ({ input_meta }) => {
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

  function _saveNewPathToUserContent({ path }) {
    try {
      const Store = require("electron-store");
      const store = new Store();
      store.set("custom_content_path", path);
    } catch (err) {
      throw new Error(`option_only_available_in_electron`);
    }
  }
  return API;
})();
