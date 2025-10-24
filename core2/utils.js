const path = require("path"),
  TOML = require("@iarna/toml"),
  slugg = require("slugg"),
  fs = require("fs-extra"),
  writeFileAtomic = require("write-file-atomic"),
  { networkInterfaces } = require("os"),
  sharp = require("sharp"),
  { IncomingForm } = require("formidable"),
  md5File = require("md5-file"),
  exifr = require("exifr"),
  crypto = require("crypto"),
  archiver = require("archiver"),
  { promisify } = require("util"),
  fastFolderSize = require("fast-folder-size"),
  fetch = require("node-fetch"),
  ffmpegTracker = require("./ffmpeg-tracker");

sharp.cache(false);

module.exports = (function () {
  const API = {
    parseMeta(d) {
      return TOML.parse(d);
    },

    getPathToUserContent(...paths) {
      return path.join(global.pathToUserContent, ...paths);
    },
    getBinFolder(p) {
      const pre = p.substr(0, p.lastIndexOf(path.sep));
      const post = p.substr(p.lastIndexOf(path.sep) + 1);
      return path.join(pre, global.settings.deletedFolderName, post);
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
    async createUniqueFilenameInCache(ext) {
      let folder_name = await API.createUniqueFolderInCache();
      let filename = ext ? `document.${ext}` : "document";
      return path.join(folder_name, filename);
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
        $public: { type: "boolean" },
        $admins: { type: "any" },
        $preview: { type: "string" },
        $credits: { type: "string" },
        $location: { type: "object" },
        $origin: { type: "string" },
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

    createZIPFromFolder({ full_path_to_folder }) {
      return new Promise((resolve, reject) => {
        const containing_folder = API.getContainingFolder(full_path_to_folder);
        const folder_name = API.getFilename(full_path_to_folder);
        const path_to_zip = path.join(containing_folder, `${folder_name}.zip`);

        const output = fs.createWriteStream(path_to_zip);
        const archive = archiver("zip", {
          zlib: { level: 0 },
        });
        archive.on("warning", (err) => {
          throw err;
        });
        archive.on("error", function (err) {
          dev.error(`Failed to create ZIP from folder: ${err}`);
          return reject(err);
        });
        archive.on("finish", function () {
          return resolve(path_to_zip);
        });
        archive.pipe(output);
        archive.directory(full_path_to_folder, false);
        archive.finalize();
      });
    },
    async handleForm({
      path_to_folder,
      destination_full_folder_path,
      req,
      upload_max_file_size_in_mo = 10_000,
    }) {
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
          allowEmptyFiles: true,
          minFileSize: 0,
          maxFileSize: upload_max_file_size_in_mo * 1024 * 1024,
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
            if (err.code === 1009) {
              dev.error(
                `File size limit exceeded. Maximum file size is ${upload_max_file_size_in_mo} Mo.`
              );
              return reject("file_size_limit_exceeded");
            } else {
              return reject(err);
            }
          })
          .on("aborted", (err) => {
            if (err.code === 1009) {
              dev.error(
                `File size limit exceeded. Maximum file size is ${upload_max_file_size_in_mo} Mo.`
              );
              return reject("file_size_limit_exceeded");
            }
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
    async convertAndCopyImage({ source, destination, width, height }) {
      await sharp(source)
        .rotate()
        .flatten({ background: "white" })
        .resize(width, height, {
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

    async downloadFileFromUrl({
      url: fileUrl,
      destination_path,
      max_file_size_in_mo = 100,
      timeout_ms = 30000,
      base_url = null,
    }) {
      dev.logfunction({ fileUrl, destination_path });

      // Handle relative URLs by combining with base_url
      if (base_url && !fileUrl.startsWith("http")) {
        fileUrl = new URL(fileUrl, base_url).href;
      } else if (!fileUrl.startsWith("http")) {
        fileUrl = utils.addhttp(fileUrl);
      }

      return new Promise(async (resolve, reject) => {
        try {
          const response = await fetch(fileUrl, {
            timeout: timeout_ms,
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; DodocBot/1.0)",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // Check content length
          const contentLength = response.headers.get("content-length");
          if (
            contentLength &&
            parseInt(contentLength, 10) > max_file_size_in_mo * 1024 * 1024
          ) {
            throw new Error("File size limit exceeded");
          }

          // Get filename from URL or use default
          const parsedUrl = new URL(fileUrl);
          let filename = path.basename(parsedUrl.pathname);
          if (!filename || filename === "/") {
            filename = "downloaded-file";
          }

          // Download the file
          const buffer = await response.buffer();

          // Check actual downloaded size
          if (buffer.length > max_file_size_in_mo * 1024 * 1024) {
            throw new Error("File size limit exceeded");
          }

          // Ensure destination directory exists
          await fs.ensureDir(path.dirname(destination_path));

          // Write file
          await fs.writeFile(destination_path, buffer);

          resolve({
            filename,
            size: buffer.length,
            path: destination_path,
          });
        } catch (error) {
          reject(error);
        }
      });
    },

    async md5FromFile({ full_media_path }) {
      return await md5File(full_media_path);
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
        bin_folder_slug,
        bin_meta_filename,
        meta_filename,
      } = req.params;

      const obj = {};

      let path_to_type = [];
      if (folder_type) {
        path_to_type.push(folder_type);
        if (sub_folder_type) {
          path_to_type.push(folder_slug, sub_folder_type);
          if (subsub_folder_type)
            path_to_type.push(sub_folder_slug, subsub_folder_type);
        }
      }
      obj.path_to_type = path.join(...path_to_type);

      let path_to_folder = [];
      if (folder_slug) {
        path_to_folder.push(folder_type, folder_slug);
        if (sub_folder_slug) {
          path_to_folder.push(sub_folder_type, sub_folder_slug);
          if (subsub_folder_slug)
            path_to_folder.push(subsub_folder_type, subsub_folder_slug);
        }
      }
      obj.path_to_folder = path.join(...path_to_folder);

      let path_to_parent_folder = [];
      if (sub_folder_slug) {
        path_to_parent_folder.push(folder_type, folder_slug);
        if (subsub_folder_slug)
          path_to_parent_folder.push(sub_folder_type, sub_folder_slug);
      }
      obj.path_to_parent_folder = path.join(...path_to_parent_folder);

      if (meta_filename && meta_filename.includes(".")) {
        obj.meta_filename = meta_filename;
        obj.path_to_meta = path.join(obj.path_to_folder, meta_filename);
      }

      if (bin_folder_slug) {
        obj.path_to_folder_in_bin = path.join(
          obj.path_to_type,
          global.settings.deletedFolderName,
          bin_folder_slug
        );
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

    getSlugFromPath(p) {
      return path.basename(p);
    },
    getContainingFolder(p) {
      return path.dirname(p);
    },
    getFolderParent(p) {
      if (!p) return false;
      let paths = p.split(path.sep);
      if (paths.length >= 2) {
        paths = paths.slice(0, -2);
        return paths.join(path.sep);
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
    getFilename(p) {
      return p.substring(p.lastIndexOf(path.sep) + 1);
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
      const new_val =
        ((val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
      return Math.min(Math.max(new_val, out_min), out_max);
    },
    fileExtensionIs(media_path, ext) {
      const exts = typeof ext === "string" ? [ext] : ext;
      const _ext = path.extname(media_path);
      return exts.includes(_ext.toLowerCase());
    },

    convertVideoToStandardFormat({
      source,
      destination,
      format = "mp4",
      image_width,
      image_height,
      video_bitrate = "4000k",
      audio_bitrate = "192k",
      trim_start,
      trim_end,
      reportProgress,
    }) {
      return new Promise(async (resolve, reject) => {
        const ffmpeg_cmd = ffmpegTracker.createTrackedFfmpeg();

        // Add input with trim options if specified
        if (trim_start !== undefined && trim_end !== undefined) {
          ffmpeg_cmd
            .input(source)
            .inputOptions([`-ss ${trim_start}`, `-to ${trim_end}`]);
        } else {
          ffmpeg_cmd.input(source);
        }

        // Configure video or audio based on requirements
        if (video_bitrate === "no_video") {
          // Audio-only export
          ffmpeg_cmd.noVideo();
          if (audio_bitrate !== "no_audio") {
            ffmpeg_cmd
              .withAudioCodec("aac")
              .withAudioBitrate(audio_bitrate)
              .audioFilter("aresample=44100");
          }
        } else {
          // Video export (with optional audio)
          const videoFilters = [];
          if (image_width && image_height) {
            videoFilters.push(
              `scale=${image_width}:${image_height}:force_original_aspect_ratio=decrease`,
              `pad=${image_width}:${image_height}:(ow-iw)/2:(oh-ih)/2:black`
            );
          }
          videoFilters.push("setsar=1", "fps=30", "format=yuv420p");

          ffmpeg_cmd
            .withVideoCodec("libx264")
            .withVideoBitrate(video_bitrate)
            .videoFilter(videoFilters);

          // Configure audio for video export
          if (audio_bitrate === "no_audio") {
            ffmpeg_cmd.noAudio();
          } else {
            ffmpeg_cmd
              .withAudioCodec("aac")
              .withAudioBitrate(audio_bitrate)
              .audioFilter("aresample=44100");
          }
        }

        // Set output format and options
        if (video_bitrate === "no_video") {
          // Audio-only export - use ADTS AAC format
          ffmpeg_cmd.toFormat("adts");
        } else if (format === "mp4") {
          ffmpeg_cmd
            .toFormat("mp4")
            .addOptions(["-movflags +faststart", "-preset fast", "-crf 23"]);
        } else if (format === "mpegts") {
          ffmpeg_cmd.toFormat("mpegts").addOptions(["-preset fast", "-crf 23"]);
        }

        // Execute
        ffmpeg_cmd
          .on("start", (commandLine) => {
            dev.logverbose("FFmpeg command: " + commandLine);
          })
          .on("progress", (progress) => {
            if (reportProgress && progress.percent) {
              reportProgress(progress.percent);
            }
          })
          .on("end", () => {
            dev.logverbose("Video conversion completed");
            resolve();
          })
          .on("error", (err, stdout, stderr) => {
            dev.error("FFmpeg error: " + err.message);
            dev.error("stderr: " + stderr);
            reject(err);
          })
          .save(destination);
      });
    },
    getVideoMetaData({ path }) {
      return new Promise(async (resolve, reject) => {
        const ffprobe_cmd = ffmpegTracker.ffprobe(path, (err, metadata) => {
          if (err || typeof metadata === "undefined") return reject(err);

          let duration;
          if (
            typeof metadata.format?.duration === "number" &&
            metadata.format.duration > 0
          ) {
            duration = +metadata.format.duration.toPrecision(3);
            // Additional validation to ensure duration is reasonable
            if (duration <= 0 || duration > 86400) {
              // More than 24 hours seems unreasonable
              dev.error(
                `Suspicious duration value: ${duration} seconds for file: ${path}`
              );
              duration = undefined;
            }
          }

          let location;
          if (metadata.format?.tags?.location)
            location = metadata.format.tags.location;
          if (metadata.format?.tags?.["com.apple.quicktime.location.ISO6709"])
            location =
              metadata.format.tags["com.apple.quicktime.location.ISO6709"];

          let width = metadata.streams[0]?.width;
          let height = metadata.streams[0]?.height;
          let ratio =
            width && height
              ? API.makeRatio({
                  w: width,
                  h: height,
                })
              : undefined;

          let streams = metadata.streams;

          return resolve({
            duration,
            location,
            width,
            height,
            ratio,
            streams,
          });
        });
      });
    },
    async hasAudioTrack({ video_path }) {
      try {
        const { streams } = await API.getVideoMetaData({ path: video_path });
        return streams?.some((s) => s.codec_type === "audio");
      } catch (err) {
        dev.error("Error getting video metadata in hasAudioTrack:", err);
        return false;
      }
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

    async getGPSFromFile(full_media_path) {
      return await exifr.gps(full_media_path);
    },

    convertToSlashPath(p) {
      return p.replaceAll(path.sep, "/");
    },
    convertToLocalPath(p) {
      return p.replaceAll("/", path.sep);
    },
    async testWriteFileInFolder(folder_path) {
      dev.logfunction({ folder_path });
      const path_to_test_file = path.join(folder_path, "__test.txt");
      const created_on_date = API.getCurrentDate();
      await fs.ensureDir(folder_path);
      await writeFileAtomic(
        path_to_test_file,
        `Test file created and immediately deleted by dodoc while starting, on ${created_on_date}.`
      );
      await fs.remove(path_to_test_file);
      return;
    },
    addhttp(url) {
      if (!/^(?:f|ht)tps?\:\/\//.test(url)) url = "http://" + url;
      return url;
    },

    async getFolderSize(...paths) {
      const full_folder_path = API.getPathToUserContent(...paths);
      const fastFolderSizeAsync = promisify(fastFolderSize);
      try {
        const bin_size = await fastFolderSizeAsync(full_folder_path);
        return bin_size;
      } catch (err) {
        dev.error(err);
        return 0;
      }
    },
    getZipFolderFilename({ path_to_folder, path_to_type }) {
      try {
        const folder_slug = API.getFilename(path_to_folder);
        const type_slug = API.getFilename(path_to_type);
        const appname = global.appInfos.name;
        const version_number = global.appInfos.version.split(".")[0];
        return `${appname}_v${version_number}_${type_slug}_${folder_slug}.zip`;
      } catch (err) {
        dev.error(err);
        return "download.zip";
      }
    },

    getDependenciesWithVersions() {
      try {
        const packageJsonPath = path.join(global.appRoot, "package.json");
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );

        const allDependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.optionalDependencies,
        };

        // Get actual installed versions from node_modules
        const installedVersions = [];
        for (const [depName, requiredVersion] of Object.entries(
          allDependencies
        )) {
          try {
            const depPackageJsonPath = path.join(
              global.appRoot,
              "node_modules",
              depName,
              "package.json"
            );
            if (fs.existsSync(depPackageJsonPath)) {
              const depPackageJson = JSON.parse(
                fs.readFileSync(depPackageJsonPath, "utf8")
              );
              installedVersions.push(`${depName}:${depPackageJson.version}`);
            } else {
              installedVersions.push(`${depName}:NOT_INSTALLED`);
            }
          } catch (err) {
            installedVersions.push(`${depName}:ERROR_READING`);
          }
        }

        // Sort dependencies alphabetically
        installedVersions.sort((a, b) =>
          a.split(":")[0].localeCompare(b.split(":")[0])
        );

        return installedVersions.join(", ");
      } catch (err) {
        return `Error reading dependencies: ${err.message}`;
      }
    },
  };

  return API;
})();
