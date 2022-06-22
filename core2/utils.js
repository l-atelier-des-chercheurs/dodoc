const path = require("path"),
  moment = require("moment"),
  TOML = require("@iarna/toml"),
  slugg = require("slugg"),
  validator = require("validator"),
  fs = require("fs-extra"),
  writeFileAtomic = require("write-file-atomic"),
  { networkInterfaces } = require("os");

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
      return new Date();
    },
    parseDate(date) {
      return new Date(date);
    },
    async readMetaFile(...paths) {
      dev.logfunction({ paths });

      const meta_path = API.getPathToUserContent(...paths);
      const meta_file_content = await fs
        .readFile(meta_path, "UTF-8")
        .catch((err) => {
          throw err;
        });
      return API.parseMeta(meta_file_content);
    },

    async readFileContent(...paths) {
      dev.logfunction({ paths });

      const media_path = API.getPathToUserContent(...paths);
      const media_file_content = await fs.readFile(media_path, "UTF-8");
      return media_file_content;
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

    getLocalIP() {
      const nets = networkInterfaces();
      const results = Object.create(null); // Or just '{}', an empty object

      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
          if (net.family === familyV4Value && !net.internal) {
            if (!results[name]) {
              results[name] = [];
            }
            results[name].push(net.address);
          }
        }
      }

      return results;
    },
  };

  return API;
})();
