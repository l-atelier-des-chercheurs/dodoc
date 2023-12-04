const path = require("path"),
  TOML = require("@iarna/toml"),
  slugg = require("slugg"),
  fs = require("fs-extra"),
  ffmpeg = require("fluent-ffmpeg"),
  writeFileAtomic = require("write-file-atomic"),
  { networkInterfaces } = require("os"),
  sharp = require("sharp"),
  { IncomingForm } = require("formidable"),
  md5File = require("md5-file"),
  crypto = require("crypto");

const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
const ffprobePath = require("ffprobe-static").path.replace(
  "app.asar",
  "app.asar.unpacked"
);

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

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
    async createUniqueFolderInCache(prefix = "folder") {
      let folder_name = API.createUniqueName(prefix);
      const full_path_to_folder_in_cache = API.getPathToCache(folder_name);
      await fs.ensureDir(full_path_to_folder_in_cache);
      return full_path_to_folder_in_cache;
    },
    createUniqueName(prefix = "prefix") {
      return `${prefix}_${+API.getCurrentDate()}-${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`;
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
        $admins: { type: "any" },
        $contributors: { type: "any" },
        $authors: { type: "any" },
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

    async handleForm({ path_to_folder, destination_full_folder_path, req }) {
      dev.logfunction({ path_to_folder, destination_full_folder_path });

      if (
        typeof path_to_folder !== "undefined" &&
        !destination_full_folder_path
      )
        destination_full_folder_path = API.getPathToUserContent(path_to_folder);

      await fs.ensureDir(destination_full_folder_path);

      return new Promise((resolve, reject) => {
        const form = new IncomingForm({
          uploadDir: destination_full_folder_path,
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
          // .withMetadata()
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
          // .withMetadata()
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
        // .withMetadata()
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

    cleanReqPath(path) {
      let p = path.substring(7);
      if (p.endsWith("/")) p = p.slice(0, -1);
      return p;
    },
    endsWithAny(suffixes, string) {
      return suffixes.some(function (suffix) {
        return string.endsWith(suffix);
      });
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
    remap(val, in_min, in_max, out_min, out_max) {
      return (
        ((val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
      );
    },
    fileExtensionIs(media_path, ext) {
      const exts = typeof ext === "string" ? [ext] : ext;
      const _ext = path.extname(media_path);
      return exts.includes(_ext.toLowerCase());
    },

    convertVideoToStandardFormat({
      ffmpeg_cmd,
      source,
      destination,
      format = "mp4",
      bitrate = "6000k",
      resolution,
      reportProgress,
    }) {
      return new Promise(async (resolve, reject) => {
        ffmpeg_cmd = new ffmpeg(global.settings.ffmpeg_options);

        // https://stackoverflow.com/a/70899710
        let totalTime;

        ffmpeg_cmd.input(source);
        const { duration, streams } = await API.getVideoDurationFromMetadata({
          ffmpeg_cmd,
          video_path: source,
        });

        if (duration) ffmpeg_cmd.duration(duration);

        // check if has audio track or not
        if (streams?.some((s) => s.codec_type === "audio"))
          ffmpeg_cmd.withAudioCodec("aac").withAudioBitrate("192k");
        else ffmpeg_cmd.input("anullsrc").inputFormat("lavfi");

        const filter = API.makeFilterToPadMatchDurationAudioVideo({ streams });
        if (filter) ffmpeg_cmd.addOptions([filter]);

        if (resolution)
          ffmpeg_cmd.videoFilter([
            `scale=w=${resolution.width}:h=${resolution.height}:force_original_aspect_ratio=1,pad=${resolution.width}:${resolution.height}:(ow-iw)/2:(oh-ih)/2`,
          ]);

        // if (streams?.some((s) => s.codec_type === "audio"))
        // if (temp_video_volume) {
        //   ffmpeg_cmd.addOptions(["-af volume=" + temp_video_volume + ",apad"]);
        // } else {
        // }

        let flags = [
          "-crf 22",
          "-preset medium",
          "-shortest",
          "-bsf:v h264_mp4toannexb",
          "-pix_fmt yuv420p",
        ];
        if (format === "mp4") {
          flags.push("-movflags +faststart");
          ffmpeg_cmd.toFormat("mp4");
        } else if (format === "mpegts") {
          ffmpeg_cmd.toFormat("mpegts");
        }

        ffmpeg_cmd
          .native()
          .outputFPS(30)
          .withVideoCodec("libx264")
          .withVideoBitrate(bitrate)
          .addOptions(flags)
          .videoFilter(["setsar=1/1"])
          .on("start", function (commandLine) {
            dev.logverbose("Spawned Ffmpeg with command: \n" + commandLine);
          })
          .on("codecData", (data) => {
            totalTime = parseInt(data.duration.replace(/:/g, ""));
          })
          .on("progress", (progress) => {
            if (reportProgress) {
              const time = parseInt(progress.timemark.replace(/:/g, ""));
              const percent = (time / totalTime) * 100;
              reportProgress(percent);
            }
          })
          .on("end", () => {
            return resolve();
          })
          .on("error", function (err, stdout, stderr) {
            dev.error("An error happened: " + err.message);
            dev.error("ffmpeg standard output:\n" + stdout);
            dev.error("ffmpeg standard error:\n" + stderr);
            return reject(err);
          })
          .save(destination);
      });
    },
    getVideoDurationFromMetadata({ ffmpeg_cmd, video_path }) {
      return new Promise(async (resolve, reject) => {
        ffmpeg_cmd = ffmpeg.ffprobe(video_path, (err, metadata) => {
          if (err) return reject(err);

          const duration = metadata.format?.duration;
          const streams = metadata.streams;
          return resolve({ duration, streams });
        });
      });
    },

    makeFilterToPadMatchDurationAudioVideo({ streams = [] }) {
      const audio_stream = streams.find((s) => s.codec_type === "audio");
      const video_stream = streams.find((s) => s.codec_type === "video");
      if (audio_stream && video_stream) {
        const diff = audio_stream.duration - video_stream.duration;
        if (diff > 0.2) {
          // audio is longer than video, we need to pad video
          const diff = audio_stream.duration - video_stream.duration;
          return `-vf tpad=stop_mode=clone:stop_duration=${diff}`;
        } else if (video_stream.duration > audio_stream.duration) {
          // video is longer than audio, we need to pad audio
          return "-af apad";
        }
      }
      return false;
    },
  };

  return API;
})();
