const path = require("path"),
  TOML = require("@iarna/toml"),
  slugg = require("slugg"),
  fs = require("fs-extra"),
  writeFileAtomic = require("write-file-atomic"),
  { networkInterfaces } = require("os"),
  sharp = require("sharp"),
  { IncomingForm } = require("formidable"),
  md5File = require("md5-file"),
  crypto = require("crypto");

sharp.cache(false);

module.exports = (function () {
  const API = {
    parseMeta(d) {
      return TOML.parse(d);
    },

    getPathToUserContent(...paths) {
      return path.join(global.pathToUserContent, ...paths);
    },
    getPathToCache(...paths) {
      return path.join(global.pathToCache, ...paths);
    },
    async createFolderInCache(prefix = "folder") {
      let folder_name = `${prefix}_${+API.getCurrentDate()}-${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`;
      const full_path_to_folder_in_cache = API.getPathToCache(folder_name);
      await fs.ensureDir(full_path_to_folder_in_cache);
      return full_path_to_folder_in_cache;
    },

    slug(term) {
      dev.logfunction({ term });
      const slugged = slugg(term);
      if (slugged.length === 0) return "untitled";
      return slugged;
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

    makeRatio({ w, h }) {
      return +Number.parseFloat(h / w).toPrecision(4);
    },

    async checkFieldUniqueness({ fields, meta, siblings_folders }) {
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
            const proposed_value_for_unique_field = meta[field_name];
            if (
              siblings_folders.some(
                (f) => f[field_name] === proposed_value_for_unique_field
              )
            ) {
              const err = new Error(
                `Field "${field_name}" supposed to be unique, is already taken`
              );
              err.code = "unique_field_taken";
              err.err_infos = field_name;
              throw err;
            }
          }
        }
    },

    validateMeta({ fields, new_meta, context = "creation" }) {
      dev.logfunction({ fields, new_meta });
      let meta = {};

      const predefined_fields = {
        $status: { type: "string" },
        $admins: { type: "any" },
        $contributors: { type: "any" },
        $password: { type: "string" },
        $can_be_remixed: { type: "boolean" },
        $is_remix_of: { type: "string" },
        $list_of_remixes: { type: "array" },
      };
      fields = Object.assign({}, fields, predefined_fields);

      if (fields)
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
            opt.type === "boolean" &&
            typeof new_meta[field_name] === "boolean"
          ) {
            meta[field_name] = new_meta[field_name];
            // TODO Validator
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
      // see cleanNewMeta

      return meta;
    },
    async cleanNewMeta({ relative_path, new_meta }) {
      dev.logfunction({ relative_path, new_meta });
      // todo check fields in schema, make sure user added fields are allowed and with the right formatting
      // merge with validateMeta ?
      const item_in_schema = API.parseAndCheckSchema({
        relative_path,
      });
      item_in_schema;

      return new_meta;
    },

    getLocalIPs() {
      const nets = networkInterfaces();
      const results = [];

      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
          if (net.family === familyV4Value && !net.internal) {
            // if (!results[name]) {
            //   results[name] = [];
            // }
            results.push(net.address);
          }
        }
      }

      return results;
    },

    async handleForm({ path_to_folder, req }) {
      return new Promise((resolve, reject) => {
        dev.logfunction({ path_to_folder });

        const form = new IncomingForm({
          uploadDir: API.getPathToUserContent(path_to_folder),
          multiples: false,
          maxFileSize: global.settings.maxFileSizeInMoForUpload * 1024 * 1024,
        });

        let file = null;
        let user_additional_meta = {};

        form.on("field", (name, value) => {
          dev.logverbose(`Field gotten`, name, value);
          user_additional_meta = JSON.parse(value);
        });

        // every time a file has been uploaded successfully,
        form.on("file", (field, uploadedFile) => {
          dev.logverbose(
            `File uploaded: 
                – field: ${field} 
                – file: ${JSON.stringify(uploadedFile)}.`
          );
          file = uploadedFile;
        });

        form
          .on("error", (err) => {
            return reject(err);
          })
          .on("aborted", (err) => {
            return reject(err);
          });

        form.once("end", async () => {
          dev.logverbose(`File downloaded`);
          dev.logverbose({ file });

          if (!file || !file.filepath)
            return reject(new Error("No file to parse"));

          return resolve({
            originalFilename: file.originalFilename,
            path_to_temp_file: file.filepath,
            user_additional_meta,
          });
        });

        form.parse(req);
      });
    },

    async makeImageFromPath({
      full_path,
      new_path,
      resolution,
      format = "jpeg",
      withoutEnlargement = false,
    }) {
      if (format === "png")
        await sharp(full_path)
          .rotate()
          .resize(resolution, resolution, {
            fit: "inside",
            withoutEnlargement,
          })
          .withMetadata()
          .toFormat("png", {})
          .toFile(new_path)
          .catch((err) => {
            // todo handle errors better
            // use cause to keep track throw new Error("Failed in some way", { cause: err });
            throw err;
          });
      else
        await sharp(full_path)
          .rotate()
          .resize(resolution, resolution, {
            fit: "inside",
            withoutEnlargement,
          })
          .flatten({ background: "white" })
          .withMetadata()
          .toFormat("jpeg", {
            quality: global.settings.mediaThumbQuality,
          })
          .toFile(new_path)
          .catch((err) => {
            throw err;
          });
    },
    async convertAndCopyImage({ source, destination, resolution }) {
      await sharp(source)
        .rotate()
        .flatten({ background: "white" })
        .resize(resolution.width, resolution.height, {
          fit: "contain",
          withoutEnlargement: false,
          background: "black",
        })
        .withMetadata()
        .toFile(destination)
        .catch((err) => {
          dev.error(`Failed to sharp create image to destination.`);
          throw err;
        });
    },

    async getImageMetadata({ full_media_path }) {
      return await sharp(full_media_path).metadata();
    },

    async imageBufferToFile({ image_buffer, full_path_to_thumb }) {
      return await sharp(image_buffer).toFile(full_path_to_thumb);
    },

    async md5FromFile({ full_media_path }) {
      return await md5File(full_media_path);
    },

    parseAndCheckSchema({ relative_path = "" }) {
      dev.logfunction({ relative_path });

      const schema = global.settings.schema;

      let items_in_path =
        relative_path.length === 0 ? [] : relative_path.split("/");
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

      // –––   /spaces/tle/projects/mon-projet/remixes => schema.$folders.spaces.$folders.projects.$folders.remixes
      // –––   /spaces/tle/projects/mon-projet/remixes/montage-video => schema.$folders.spaces.$folders.projects.$folders.remixes
      // –––   /spaces/tle/projects/mon-projet/remixes/montage-video/media.meta.txt => schema.$folders.spaces.$folders.projects.$folders.remixes

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

    cleanReqPath(path) {
      let p = path.substring(7);
      if (p.endsWith("/")) p = p.slice(0, -1);
      return p;
    },

    makePathFromReq(req) {
      let {
        folder_type,
        folder_slug,
        sub_folder_type,
        sub_folder_slug,
        subsub_folder_type,
        subsub_folder_slug,
        meta_filename,
      } = req.params;

      const obj = {};

      if (subsub_folder_type)
        obj.path_to_type = `${folder_type}/${folder_slug}/${sub_folder_type}/${sub_folder_slug}/${subsub_folder_type}`;
      else if (sub_folder_type)
        obj.path_to_type = `${folder_type}/${folder_slug}/${sub_folder_type}`;
      else if (folder_type) obj.path_to_type = `${folder_type}`;

      if (subsub_folder_slug)
        obj.path_to_folder = `${folder_type}/${folder_slug}/${sub_folder_type}/${sub_folder_slug}/${subsub_folder_type}/${subsub_folder_slug}`;
      else if (sub_folder_slug)
        obj.path_to_folder = `${folder_type}/${folder_slug}/${sub_folder_type}/${sub_folder_slug}`;
      else if (folder_slug)
        obj.path_to_folder = `${folder_type}/${folder_slug}`;

      if (subsub_folder_slug)
        obj.path_to_parent_folder = `${folder_type}/${folder_slug}/${sub_folder_type}/${sub_folder_slug}`;
      else if (sub_folder_slug)
        obj.path_to_parent_folder = `${folder_type}/${folder_slug}`;

      if (meta_filename && meta_filename.includes(".")) {
        obj.meta_filename = meta_filename;
        obj.path_to_meta = `${obj.path_to_folder}/${meta_filename}`;
      }

      if (req.body) obj.data = req.body;

      return obj;
    },

    async hashPassword({
      password,
      salt = crypto.randomBytes(32).toString("hex"),
    }) {
      // see https://stackoverflow.com/a/67038052
      const buf = crypto.scryptSync(password, salt, 64).toString("hex");
      return `${buf.toString("hex")}.${salt}`;
    },
    async checkPassword({ submitted_password, stored_password_with_salt }) {
      // check if password matches stored_password once it is hashed
      const [stored_password, salt] = stored_password_with_salt.split(".");
      const submitted_password_with_salt = await API.hashPassword({
        password: submitted_password,
        salt,
      });
      return submitted_password_with_salt === stored_password_with_salt;
    },

    getSlugFromPath(path) {
      return path.split("/").at(-1);
    },
    getContainingFolder(path) {
      return path.substring(0, path.lastIndexOf("/"));
    },
    getFolderParent(path) {
      if (!path) return false;
      let paths = path.split("/");
      if (paths.length >= 2) {
        paths = paths.slice(0, -2);
        return paths.join("/");
      }
      return false;
    },
    isExtensionLosslessImageFormat(filename) {
      if (filename) {
        const extension = path.parse(filename).ext?.toLowerCase();
        if (extension) return [".png", ".svg"].includes(extension);
      }
      return false;
    },
    getFilename(path) {
      return path.substring(path.lastIndexOf("/") + 1);
    },
    hashCode(s) {
      return (
        "" +
        s.split("").reduce(function (a, b) {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0)
      );
    },
  };

  return API;
})();
