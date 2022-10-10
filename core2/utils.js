const path = require("path"),
  TOML = require("@iarna/toml"),
  slugg = require("slugg"),
  validator = require("validator"),
  fs = require("fs-extra"),
  writeFileAtomic = require("write-file-atomic"),
  { networkInterfaces } = require("os"),
  sharp = require("sharp"),
  { IncomingForm } = require("formidable");

sharp.cache(false);

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
      const file_path = API.getPathToUserContent(...paths);
      return await fs.readFile(file_path, "UTF-8");
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

    validateMeta({ fields, new_meta }) {
      let meta = {};

      if (fields)
        Object.entries(fields).map(([field_name, opt]) => {
          if (new_meta.hasOwnProperty(field_name)) {
            meta[field_name] = new_meta[field_name];
            // TODO Validator
          }
        });
      // see cleanNewMeta

      return meta;
    },
    cleanNewMeta({ folder_type, new_meta }) {
      dev.logfunction({ folder_type, new_meta });
      // check fields in schema, make sure user added fields are allowed and with the right formatting
      // merge with validateMeta ?
      global.settings.schema[folder_type];
      return new_meta;
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

    async handleForm({ req, folder_type, folder_slug }) {
      return new Promise((resolve, reject) => {
        dev.logfunction({ folder_type, folder_slug });
        const folder_path = API.getPathToUserContent(folder_type, folder_slug);

        const form = new IncomingForm({
          uploadDir: folder_path,
          multiples: false,
          maxFileSize: global.settings.maxFileSizeInMoForUpload * 1024 * 1024,
        });

        let socketid = "";
        let file = null;
        let additional_meta = {};

        form.on("field", (name, value) => {
          dev.logverbose(`Field gotten`, name, value);
          additional_meta = JSON.parse(value);

          // if (name === "socketid") socketid = value;
          // try {
          //   field_values[name] = JSON.parse(value);
          // } catch (e) {}
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
            folder_path,
            originalFilename: file.originalFilename,
            filepath: file.filepath,
            additional_meta,
          });
        });

        form.parse(req);
      });
    },

    async makeImageFromPath({ full_path, new_path, resolution }) {
      await sharp(full_path)
        .rotate()
        .resize(resolution, resolution, {
          fit: "inside",
          withoutEnlargement: true,
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

    async getImageMetadata({ full_media_path }) {
      return await sharp(full_media_path).metadata();
    },

    async imageBufferToFile({ image_buffer, full_path_to_thumb }) {
      return await sharp(image_buffer).toFile(full_path_to_thumb);
    },
  };

  return API;
})();
