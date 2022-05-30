const path = require("path"),
  moment = require("moment"),
  parsedown = require("dodoc-parsedown"),
  validator = require("validator");

module.exports = (function () {
  const API = {
    sanitizeMetaFromFile({ folder_type, meta }) {
      dev.logfunction({ folder_type });
      let new_meta = {};

      // const fields =
      //   type_two === undefined
      //     ? global.settings.structure[type].fields
      //     : global.settings.structure[type][type_two].fields;
      const fields = global.settings.schema[folder_type].fields;

      if (!fields) throw `no fields matching ${folder_type}`;

      Object.keys(meta).forEach((key) => {
        if (fields[key]?.hasOwnProperty("type")) {
          const fieldType = fields[key].type;
          if (fieldType === "date") {
            new_meta[key] = _parseDate(meta[key]);
          } else if (fieldType === "string") {
            new_meta[key] = validator.unescape(meta[key]);
          } else if (fieldType === "number") {
            new_meta[key] = validator.toFloat(meta[key]);
          } else if (fieldType === "boolean") {
            new_meta[key] = validator.toBoolean(meta[key]);
          } else if (fieldType === "array") {
            new_meta[key] = meta[key];
          } else {
            dev.error(`Unexpected field type ${fieldType}.`);
          }
        }
      });

      return new_meta;
    },

    parseMeta(d) {
      dev.logfunction();
      return parsedown.parse(d);
    },

    makeFullPath({ folder_type }, ...paths) {
      if (!global.settings.schema.hasOwnProperty(folder_type))
        throw `Missing type ${folder_type} in global.settings.json`;

      let _full_path = path.join(
        global.pathToUserContent,
        global.settings.schema[folder_type].path
      );

      if (paths) _full_path = path.join(_full_path, ...paths);

      return _full_path;
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
