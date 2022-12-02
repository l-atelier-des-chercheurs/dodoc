const utils = require("./utils");

module.exports = (function () {
  const API = {
    get: async () => {
      dev.logfunction();
      let meta = {};
      try {
        meta = await utils.readMetaFile("settings.txt");
      } catch (err) {}
      meta.pathToUserContent = global.pathToUserContent;
      return meta;
    },
    set: async ({ input_meta }) => {
      dev.logfunction();

      let old_meta = API.get();

      if (input_meta.hasOwnProperty("pathToUserContent")) input_meta;
      // todo store path

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

      return changed_meta;
    },
  };

  return API;
})();
