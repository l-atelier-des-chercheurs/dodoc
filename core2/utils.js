const path = require("path"),
  moment = require("moment"),
  TOML = require("@iarna/toml"),
  slugg = require("slugg"),
  validator = require("validator"),
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
  };

  function _parseDate(date, f) {
    if (moment(date, f, true).isValid()) {
      return moment(date, f).format("DD-MM-YYYY HH:mm:ss Z");
    } else {
      return "";
    }
  }

  return API;
})();
