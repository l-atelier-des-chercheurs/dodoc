const path = require("path"),
  TOML = require("@iarna/toml"),
  fs = require("fs-extra"),
  writeFileAtomic = require("write-file-atomic");

module.exports = function createMetaUtils(API) {
  return {
    parseMeta(d) {
      return TOML.parse(d);
    },

    async storeContent({ full_path, meta }) {
      dev.logfunction({ full_path, meta });

      if (typeof meta === "object") meta = TOML.stringify(meta);

      try {
        await writeFileAtomic(full_path, meta);
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
    /**
     * Normalize a user-editable calendar date to ISO 8601 date (YYYY-MM-DD).
     * Accepts empty, YYYY-MM-DD, or parseable ISO/datetime strings.
     * Returns "" for empty, null when invalid.
     */
    normalizeCalendarDate(raw) {
      if (raw === null || raw === undefined) return "";
      if (typeof raw === "number") {
        const parsed = new Date(raw);
        if (Number.isNaN(parsed.getTime())) return null;
        return API.formatCalendarDateFromDate(parsed);
      }

      const value = String(raw).trim();
      if (!value) return "";

      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split("-").map((part) => Number(part));
        const parsed = new Date(year, month - 1, day);
        if (
          Number.isNaN(parsed.getTime()) ||
          parsed.getFullYear() !== year ||
          parsed.getMonth() !== month - 1 ||
          parsed.getDate() !== day
        ) {
          return null;
        }
        return value;
      }

      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return null;
      return API.formatCalendarDateFromDate(parsed);
    },
    formatCalendarDateFromDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
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
      const file_path = API.getPathToUserContent(...paths);
      return await fs.readFile(file_path, "UTF-8");
    },

    async saveMetaAtPath({ relative_path, file_slug = "meta.txt", meta }) {
      dev.logfunction({ relative_path, file_slug, meta });
      const meta_path = API.getPathToUserContent(relative_path, file_slug);
      await API.storeContent({ full_path: meta_path, meta });
      return;
    },

    async checkFieldUniqueness({
      fields,
      meta,
      siblings_folders,
      handle_duplicates,
    }) {
      dev.logfunction({ fields, meta, siblings_folders });
      // check if some fields have "unique"
      if (Object.keys(meta).length === 0) return;

      if (fields)
        for ([field_name, opt] of Object.entries(fields)) {
          if (
            opt.unique === true &&
            meta.hasOwnProperty(field_name) &&
            meta[field_name].length > 0
          ) {
            let proposed_value_for_unique_field = meta[field_name];

            const valueAlreadyUsed = (val) =>
              siblings_folders.some((f) => f[field_name] === val);

            if (valueAlreadyUsed(proposed_value_for_unique_field)) {
              if (handle_duplicates === "throw") {
                const err = new Error(
                  `Field "${field_name}" supposed to be unique, is already taken`
                );
                err.code = "unique_field_taken";
                err.err_infos = field_name;
                throw err;
              } else if (handle_duplicates === "correct") {
                // todo while loop to make sure we dont use a
                let index = 1;
                let new_proposed_value = `${proposed_value_for_unique_field}-${index}`;

                while (valueAlreadyUsed(new_proposed_value)) {
                  index++;
                  new_proposed_value = `${proposed_value_for_unique_field}-${index}`;
                }
                meta[field_name] = new_proposed_value;
              }
            }
          }
        }

      return meta;
    },

    validateMeta({ fields, new_meta, context = "creation" }) {
      dev.logfunction({ fields, new_meta });
      let meta = {};

      const predefined_fields = {
        $status: { type: "string" },
        $public: { type: "boolean" },
        $admins: { type: "any" },
        $preview: { type: "string" },
        $credits: { type: "string" },
        $location: { type: "object" },
        $origin: { type: "string" },
        $processing: { type: "array" },
        $contributors: { type: "any" },
        $authors: { type: "any" },
        $password: { type: "string" },
        $can_be_remixed: { type: "boolean" },
        $is_remix_of: { type: "string" },
        $list_of_remixes: { type: "array" },
      };
      fields = Object.assign({}, fields, predefined_fields);

      // Check for fields in new_meta that don't exist in schema
      for (const field_name in new_meta) {
        if (!fields.hasOwnProperty(field_name)) {
          dev.error(`Field "${field_name}" is not defined in schema`);
          // const err = new Error(
          //   `Field "${field_name}" is not defined in schema`
          // );
          // err.code = "undefined_field";
          // throw err;
        }
      }

      if (fields) {
        Object.entries(fields).map(([field_name, opt]) => {
          if (
            new_meta.hasOwnProperty(field_name) &&
            opt.type === "string"
            // &&
            // new_meta[field_name] !== ""
            // should allow empty values
          ) {
            meta[field_name] = new_meta[field_name];
            // TODO Validator
            // todo if has options, check that the value is in the options
          } else if (
            new_meta.hasOwnProperty(field_name) &&
            opt.type === "array" &&
            Array.isArray(new_meta[field_name])
          ) {
            meta[field_name] = new_meta[field_name];
            // TODO Validator
          } else if (
            new_meta.hasOwnProperty(field_name) &&
            opt.type === "number" &&
            typeof new_meta[field_name] === "number"
          ) {
            meta[field_name] = new_meta[field_name];
            // TODO Validator
          } else if (
            new_meta.hasOwnProperty(field_name) &&
            opt.type === "date"
          ) {
            const normalized = API.normalizeCalendarDate(new_meta[field_name]);
            if (normalized === null) {
              const err = new Error(`Invalid date for field ${field_name}`);
              err.code = "invalid_date_field";
              err.err_infos = field_name;
              throw err;
            }
            meta[field_name] = normalized;
          } else if (
            new_meta.hasOwnProperty(field_name) &&
            opt.type === "boolean" &&
            typeof new_meta[field_name] === "boolean"
          ) {
            meta[field_name] = new_meta[field_name];
            // TODO Validator
          } else if (
            new_meta.hasOwnProperty(field_name) &&
            opt.type === "object"
          ) {
            meta[field_name] = new_meta[field_name];
          } else if (
            new_meta.hasOwnProperty(field_name) &&
            opt.type === "any"
          ) {
            meta[field_name] = new_meta[field_name];
          } else {
            if (opt.required === true && context === "creation") {
              // field is required in schema but not present in user-submitted object
              // only checked for creation, not update
              // todo: on updates, check that a required field is not blank
              const err = new Error(`Required field ${field_name} is missing`);
              err.code = "required_field_missing";
              throw err;
            }
          }
        });
      }

      return meta;
    },

    getCopyableMediaMeta(media, overrides = {}) {
      const META_KEYS_NOT_COPIED = [
        "$path",
        "$media_filename",
        "$infos",
        "$type",
        "$thumbs",
        "$date_uploaded",
        "$date_modified",
        "$date_created",
      ];

      const additional_meta = {};
      if (media && typeof media === "object") {
        for (const key of Object.keys(media)) {
          if (META_KEYS_NOT_COPIED.includes(key)) continue;
          const value = media[key];
          if (value === undefined) continue;
          additional_meta[key] = value;
        }
      }

      const result = { ...additional_meta, ...overrides };
      if (Object.prototype.hasOwnProperty.call(overrides, "$processing")) {
        const existing = Array.isArray(additional_meta.$processing)
          ? additional_meta.$processing
          : [];
        const to_append = Array.isArray(overrides.$processing)
          ? overrides.$processing
          : [overrides.$processing];
        result.$processing = [...existing, ...to_append];
      }
      return result;
    },

    parseAndCheckSchema({ relative_path = "" }) {
      dev.logfunction({ relative_path });

      const schema = global.settings.schema;

      if (
        relative_path.includes(path.sep + global.settings.deletedFolderName)
      ) {
        relative_path = relative_path.slice(
          0,
          relative_path.indexOf(path.sep + global.settings.deletedFolderName)
        );
      }

      let items_in_path =
        relative_path.length === 0 ? [] : relative_path.split(path.sep);
      // items_in_path = items_in_path.filter((i) => i !== "_upload");

      // –––   / => schema (admin settings)
      // –––   /image.jpg.meta.txt => schema (admin files)

      // –––   /spaces => schema.$folders.spaces
      // –––   /spaces/tle => schema.$folders.spaces
      // –––   /spaces/tle/image.jpg.meta.txt => schema.$folders.spaces

      // –––   /spaces/tle/projects => schema.$folders.spaces.$folders.projects
      // –––   /spaces/tle/projects/mon-projet => schema.$folders.spaces.$folders.projects
      // –––   /spaces/tle/projects/mon-projet/image.jpg.meta.txt => schema.$folders.spaces.$folders.projects

      // –––   /spaces/tle/projects/mon-projet/publications => schema.$folders.spaces.$folders.projects.$folders.publications

      // –––   /spaces/tle/projects/mon-projet/makes => schema.$folders.spaces.$folders.projects.$folders.makes
      // –––   /spaces/tle/projects/mon-projet/makes/montage-video => schema.$folders.spaces.$folders.projects.$folders.makes
      // –––   /spaces/tle/projects/mon-projet/makes/montage-video/media.meta.txt => schema.$folders.spaces.$folders.projects.$folders.makes

      const checkIfFileOrAction = (str) =>
        str.includes(".") || str.startsWith("_");

      if (
        items_in_path.length === 0 ||
        (items_in_path.length === 1 && checkIfFileOrAction(items_in_path[0]))
      )
        return schema;
      else if (
        items_in_path.length === 1 ||
        items_in_path.length === 2 ||
        (items_in_path.length === 3 && checkIfFileOrAction(items_in_path[2]))
      )
        return schema.$folders[items_in_path[0]];
      else if (
        items_in_path.length === 3 ||
        items_in_path.length === 4 ||
        (items_in_path.length === 5 && checkIfFileOrAction(items_in_path[4]))
      )
        return schema.$folders[items_in_path[0]].$folders[items_in_path[2]];
      else if (
        items_in_path.length === 5 ||
        items_in_path.length === 6 ||
        (items_in_path.length === 7 && checkIfFileOrAction(items_in_path[6]))
      )
        return schema.$folders[items_in_path[0]].$folders[items_in_path[2]]
          .$folders[items_in_path[4]];

      throw new Error(`no_schema_for_folder`);
    },
  };
};
