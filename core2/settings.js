const utils = require("./utils"),
  cache = require("./cache");

module.exports = (function () {
  const API = {
    get: async () => {
      dev.logfunction();

      const d = cache.get({
        key: "admin_settings",
      });
      if (d) return d;

      let meta = {};
      try {
        meta = await utils.readMetaFile("settings.txt");
      } catch (err) {}

      meta.pathToUserContent = global.pathToUserContent;

      cache.set({
        key: "admin_settings",
        value: meta,
      });

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

      cache.delete({
        key: "admin_settings",
      });

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
