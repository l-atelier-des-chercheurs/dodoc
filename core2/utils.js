const path = require("path"),
  moment = require("moment"),
  TOML = require("@iarna/toml"),
  slugg = require("slugg"),
  validator = require("validator"),
  fs = require("fs-extra"),
  writeFileAtomic = require("write-file-atomic");

module.exports = (function () {
  const API = {
    parseMeta(d) {
      return TOML.parse(d);
    },

    getPathToUserContent(...paths) {
      return path.join(global.pathToUserContent, ...paths);
    },

    slug(term) {
      dev.logfunction({ term });
      return slugg(term);
    },

    async storeMeta({ path, meta }) {
      dev.logfunction({ path, meta });

      if (typeof meta === "object") meta = TOML.stringify(meta);

      try {
        await writeFileAtomic(path, meta);
        return;
      } catch (err) {
        throw err;
      }
    },
    getCurrentDate() {
      return moment().format(global.settings.metaDateFormat);
    },
    parseDate(date, f) {
      if (moment(date, f, true).isValid()) {
        return moment(date, f).format(global.settings.metaDateFormat);
      } else {
        return "";
      }
    },

    async readMetaFile({ folder_type, folder_slug, file_slug }) {
      dev.logfunction({ folder_type, folder_slug, file_slug });

      const meta_path = API.getPathToUserContent(
        folder_type,
        folder_slug,
        file_slug
      );

      const meta_file_content = await fs.readFile(meta_path, "UTF-8");
      let meta = API.parseMeta(meta_file_content);

      return meta;
    },

    validateMeta({ fields, new_meta }) {
      let meta = {};

      if (fields)
        Object.entries(fields).map(([field_name, opt]) => {
          if (new_meta.hasOwnProperty(field_name)) {
            meta[field_name] = new_meta[field_name];
            // TODO Validator
          }
        });

      return meta;
    },

    async saveMetaAtPath({ folder_type, folder_slug, file_slug, meta }) {
      dev.logfunction({ folder_type, folder_slug, file_slug, meta });

      const meta_path = API.getPathToUserContent(
        folder_type,
        folder_slug,
        file_slug
      );

      await API.storeMeta({ path: meta_path, meta });
      return;
    },

    makeRatio({ w, h }) {
      return +Number.parseFloat(h / w).toPrecision(4);
    },
  };

  return API;
})();
