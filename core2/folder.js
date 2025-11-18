const path = require("path"),
  fs = require("fs-extra"),
  unzipper = require("unzipper");

const utils = require("./utils"),
  thumbs = require("./thumbs"),
  file = require("./file"),
  cache = require("./cache"),
  archives = require("./archives");

module.exports = (function () {
  const API = {
    getFolders: async ({ path_to_type, detailed = false }) => {
      dev.logfunction({ path_to_type });
      // TODO cache get all folders

      utils.parseAndCheckSchema({
        relative_path: path_to_type,
      });

      const folders_slugs = await _getFolderSlugs({
        path_to_type,
      });

      let all_folders_with_meta = [];
      let lastYield = Date.now();
      const YIELD_INTERVAL_MS = 50;

      for (let folder_slug of folders_slugs) {
        const path_to_folder = path.join(path_to_type, folder_slug);
        const folder_meta = await API.getFolder({
          path_to_folder,
          detailed,
        }).catch((err) => {
          if (err.code === "ENOENT")
            dev.error(`Failed to get folder`, err.message);
          else throw err;
        });
        if (folder_meta) all_folders_with_meta.push(folder_meta);

        // Yield only if enough time has passed
        if (Date.now() - lastYield >= YIELD_INTERVAL_MS) {
          await new Promise(setImmediate);
          lastYield = Date.now();
        }
      }

      return all_folders_with_meta;
    },

    getFolder: async ({ path_to_folder, detailed }) => {
      dev.logfunction({ path_to_folder, detailed });

      let d = cache.get({
        key: _getCacheKey({ path_to_folder }),
      });
      if (d) {
        d = JSON.parse(JSON.stringify(d));
        if (detailed) {
          d.$infos = await thumbs.getInfosForFolder({
            path_to_folder,
          });
        }
        return d;
      }

      const item_in_schema = utils.parseAndCheckSchema({
        relative_path: path_to_folder,
      });
      if (!item_in_schema) {
        const err = new Error("No schema for path");
        err.code = "missing_schema_for_path";
        throw err;
      }

      let folder_meta = await utils
        .readMetaFile(path_to_folder, "meta.txt")
        .catch((err) => {
          throw err;
        });
      folder_meta.$path = utils.convertToSlashPath(path_to_folder);

      if (item_in_schema.$cover) {
        let cover = await _getFolderCover({
          path_to_folder,
        });
        if (cover) folder_meta.$cover = cover;
      }

      if (folder_meta.$preview) {
        let preview_file = await _getFolderPreview({
          path_to_folder,
          meta_filename: folder_meta.$preview,
        });
        if (preview_file) folder_meta.$preview = preview_file;
        else delete folder_meta.$preview;
      }

      // remove $password from this object
      if (folder_meta.$password && folder_meta.$password.length > 0)
        folder_meta.$password = "_active";

      cache.set({
        key: _getCacheKey({ path_to_folder }),
        value: JSON.parse(JSON.stringify(folder_meta)),
      });

      if (detailed)
        folder_meta.$infos = await thumbs.getInfosForFolder({ path_to_folder });

      return folder_meta;
    },
    getFoldersCount: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });

      const item_in_schema = utils.parseAndCheckSchema({
        relative_path: path_to_folder,
      });
      if (!item_in_schema || !item_in_schema.$folders) {
        return 0;
      }

      let total_count = 0;
      const folder_types = Object.keys(item_in_schema.$folders);

      for (const folder_type of folder_types) {
        const path_to_type = path.join(path_to_folder, folder_type);
        try {
          const folders_slugs = await _getFolderSlugs({ path_to_type });
          total_count += folders_slugs.length;
        } catch (err) {
          // Folder type doesn't exist yet, skip it
          if (err.code !== "ENOENT") throw err;
        }
      }

      return total_count;
    },

    createFolder: async ({ path_to_type, data }) => {
      dev.logfunction({ path_to_type, data });

      let folder_slug = `untitled`;
      if (data?.requested_slug) folder_slug = utils.slug(data.requested_slug);

      let { $cover, ...meta } = data;

      folder_slug = await _preventFolderOverride({
        path_to_type,
        folder_slug,
      });

      let valid_meta = await _cleanFields({
        meta,
        path_to_type,
      });

      valid_meta.$date_created = valid_meta.$date_modified =
        utils.getCurrentDate();

      valid_meta.$status = valid_meta.$status ? valid_meta.$status : "private";

      if (valid_meta.$password) {
        // encrypt before store
        valid_meta.$password = await utils.hashPassword({
          password: valid_meta.$password,
        });
      }

      const path_to_folder = utils.getPathToUserContent(
        path_to_type,
        folder_slug
      );
      await fs.ensureDir(path_to_folder);

      await utils.saveMetaAtPath({
        relative_path: path.join(path_to_type, folder_slug),
        meta: valid_meta,
      });

      // TODO store cover if it exists

      return folder_slug;
    },
    importFolder: async ({ path_to_type, req }) => {
      dev.logfunction({ path_to_type });

      let full_path_to_folder_in_cache = await utils.createUniqueFolderInCache(
        "import"
      );

      // store zip to cache,
      const {
        originalFilename,
        path_to_temp_file,
        user_additional_meta: _additional_meta,
      } = await utils
        .handleForm({
          destination_full_folder_path: full_path_to_folder_in_cache,
          req,
        })
        .catch((err) => {
          dev.error(`Failed to handle form`, err);
        });

      const directory = await unzipper.Open.file(path_to_temp_file);

      // two cases : either all medias are at root ('meta.txt' and so on)
      // or they are in a subfolder
      let subfolder_name = false;
      let meta_file = directory.files.find((f) => f.path === "meta.txt");

      if (!meta_file) {
        meta_file = directory.files.find((f) => {
          // Replace all path separators with '/' for consistency
          const normalizedPath = f.path.replace(/\\/g, "/");
          const path_splits = normalizedPath.split("/");
          if (path_splits.length === 2 && path_splits[1] === "meta.txt") {
            subfolder_name = path_splits[0];
            return true;
          }
          return false;
        });
      }
      if (!meta_file) {
        await fs.remove(full_path_to_folder_in_cache);
        const err = new Error("Imported folder is missing meta.txt");
        err.code = "imported_folder_not_valid";
        throw err;
      }

      // check edge case: if someone download a space and tried importing it as a project, catch that
      const is_space = directory.files.find((f) => {
        const normalizedPath = f.path.replace(/\\/g, "/");
        return normalizedPath.endsWith("projects/");
      });
      if (is_space) {
        const err = new Error(
          "Imported folder seems to be a space and not a project"
        );
        err.code = "imported_folder_is_a_space";
        throw err;
      }

      const buffer = await meta_file.buffer();
      const meta = utils.parseMeta(buffer.toString());

      Object.assign(meta, _additional_meta);

      meta.title = "Import – " + meta.title;

      let valid_meta = await _cleanFields({
        meta,
        path_to_type,
        handle_duplicates: "correct",
      }).catch((err) => {
        // TODO handle err here ?
      });
      valid_meta.requested_slug =
        subfolder_name || path.parse(originalFilename).name;

      const new_folder_slug = await API.createFolder({
        path_to_type,
        data: valid_meta,
      });

      const path_to_new_folder = path.join(path_to_type, new_folder_slug);
      const full_path_to_folder =
        utils.getPathToUserContent(path_to_new_folder);

      const files_to_copy = directory.files.filter((f) => {
        const normalizedPath = f.path.replace(/\\/g, "/");
        const path_splits = normalizedPath.split("/");
        return path_splits.length >= 2 && path_splits[1] !== "meta.txt";
      });

      function extractFile(file) {
        return new Promise((resolve, reject) => {
          const prepare_filepath = subfolder_name
            ? file.path.substring(subfolder_name.length + 1)
            : file.path;

          const path_to_file = path.join(full_path_to_folder, prepare_filepath);
          if (file.type === "Directory") fs.ensureDir(path_to_file, resolve);
          else if (file.type === "File")
            file
              .stream()
              .pipe(fs.createWriteStream(path_to_file))
              .on("error", (err) => {
                dev.error("Failed to extract", prepare_filepath);
                return reject(err);
              })
              .on("finish", () => {
                dev.logverbose("Successfully extracted", prepare_filepath);
                return resolve();
              });
        });
      }

      for (let i = 0; i < files_to_copy.length; i++) {
        dev.logverbose("Extracting", file.path);
        await extractFile(files_to_copy[i]).catch((err) => {
          err;
          // dont reject, we just go on (error could be hidden files not being extracted, which doesnt matter)
        });
      }

      await fs.remove(full_path_to_folder_in_cache);

      return path_to_new_folder;
    },
    updateFolder: async ({
      path_to_type,
      path_to_folder,
      data,
      admin_meta,
      update_cover_req,
    }) => {
      dev.logfunction({ path_to_folder, data });

      let meta = await utils.readMetaFile(path_to_folder, "meta.txt");
      const previous_meta = JSON.parse(JSON.stringify(meta));

      // filter new_meta with schema – only keep props present in the schema, not read_only, and respecing the type
      if (data && Object.keys(data).length > 0) {
        let { ...new_meta } = data;
        const valid_meta = await _cleanFields({
          meta: new_meta,
          path_to_type,
          path_to_folder,
          context: "update",
        });

        if (valid_meta.$password)
          valid_meta.$password = await utils.hashPassword({
            password: valid_meta.$password,
          });

        // override existing meta with new valid meta
        Object.assign(meta, valid_meta);
      }

      // unchecked properties, not available through API. Used by copyFolder for example
      if (admin_meta) Object.assign(meta, admin_meta);

      meta.$date_modified = utils.getCurrentDate();

      await utils.saveMetaAtPath({
        relative_path: path_to_folder,
        meta,
      });

      // todo deep compare
      let changed_meta = Object.keys(meta).reduce((acc, key) => {
        if (JSON.stringify(meta[key]) !== JSON.stringify(previous_meta[key]))
          acc[key] = meta[key];
        return acc;
      }, {});

      if (update_cover_req) {
        await _updateCover({
          path_to_folder,
          data,
          req: update_cover_req,
        });
        const cover = await _getFolderCover({
          path_to_folder,
        });
        if (cover) changed_meta.$cover = cover;
        else changed_meta.$cover = false;
      }

      if (changed_meta.$preview) {
        let preview_file = await _getFolderPreview({
          path_to_folder,
          meta_filename: changed_meta.$preview,
        });
        if (preview_file) changed_meta.$preview = preview_file;
        else delete changed_meta.$preview;
      }

      cache.delete({
        key: _getCacheKey({ path_to_folder }),
      });

      return changed_meta;
    },
    copyFolder: async ({
      path_to_type,
      path_to_source_folder,
      path_to_destination_type,
      new_meta,
      is_copy_or_move = "copy",
    }) => {
      dev.logfunction({ path_to_source_folder, path_to_destination_type });

      // check for field uniqueness
      await _cleanFields({
        meta: new_meta,
        path_to_type: path_to_destination_type,
        context: "update",
      });

      const source_folder_slug = utils.getSlugFromPath(path_to_source_folder);

      let folder_slug =
        is_copy_or_move === "copy"
          ? source_folder_slug + "-copy"
          : source_folder_slug;
      folder_slug = await _preventFolderOverride({
        path_to_type: path_to_destination_type,
        folder_slug,
      });

      const path_to_destination_folder = path.join(
        path_to_destination_type,
        folder_slug
      );
      await fs.copy(
        utils.getPathToUserContent(path_to_source_folder),
        utils.getPathToUserContent(path_to_destination_folder)
      );

      // copy all thumbs
      await thumbs.duplicateThumbFolder({
        path_to_source_folder,
        path_to_destination_folder,
      });

      await API.updateFolder({
        path_to_type: path_to_destination_type,
        path_to_folder: path_to_destination_folder,
        admin_meta: {
          $date_created: utils.getCurrentDate(),
        },
        data: new_meta,
      });

      return path_to_destination_folder;
    },

    removeFolder: async ({ path_to_type, path_to_folder }) => {
      dev.logfunction({ path_to_type, path_to_folder });

      try {
        const { remove_permanently } = await require("./settings").get();
        if (remove_permanently === true) {
          await _removeFolderForGood({ path_to_folder });
        } else {
          // update $date_modified to now
          await API.updateFolder({
            path_to_type,
            path_to_folder,
          });
          await _moveFolderToBin({ path_to_folder });
        }
        await thumbs.removeFolderThumbs({ path_to_folder });
        await archives.removeFolderArchives({ path_to_folder });

        cache.delete({
          key: _getCacheKey({ path_to_folder }),
        });

        return;
      } catch (err) {
        throw err;
      }
    },

    login: async ({ path_to_folder, submitted_password }) => {
      dev.logfunction({ path_to_folder, submitted_password });

      // get folder meta
      let folder_meta = await utils
        .readMetaFile(path_to_folder, "meta.txt")
        .catch((err) => {
          throw err;
        });

      // check if folder has a password, login can only be used on folders with passwords
      if (
        !folder_meta.hasOwnProperty("$password") ||
        folder_meta.$password === ""
      ) {
        const err = new Error("Folder doesn't have password");
        err.code = "no_password_for_folder";
        throw err;
      }

      const submitted_password_matches = await utils.checkPassword({
        submitted_password,
        stored_password_with_salt: folder_meta.$password,
      });
      if (!submitted_password_matches) {
        const err = new Error("Submitted password doesn't match");
        err.code = "submitted_password_is_wrong";
        throw err;
      }
      return;
    },

    getFolderBinContent: async ({ path_to_type }) => {
      dev.logfunction({ path_to_type });

      // get _bin folder size
      const bin_folder_path = path.join(
        path_to_type,
        global.settings.deletedFolderName
      );
      const bin_size = await utils.getFolderSize(bin_folder_path);

      const bin_folders = await API.getFolders({
        path_to_type: bin_folder_path,
        detailed: true,
      });

      return {
        size: bin_size,
        items: bin_folders,
      };
    },
    restoreFromBin: async ({ path_to_folder_in_bin, path_to_type }) => {
      const restored_folder_path = await API.copyFolder({
        path_to_type,
        path_to_source_folder: path_to_folder_in_bin,
        path_to_destination_type: path_to_type,
        new_meta: {},
        is_copy_or_move: "move",
      });

      await _removeFolderForGood({ path_to_folder: path_to_folder_in_bin });
      await thumbs.removeFolderThumbs({
        path_to_folder: path_to_folder_in_bin,
      });

      return restored_folder_path;
    },
    removeBinFolder: async ({ path_to_folder_in_bin }) => {
      await _removeFolderForGood({ path_to_folder: path_to_folder_in_bin });
    },
  };

  async function _getFolderSlugs({ path_to_type }) {
    dev.logfunction({ path_to_type });
    const full_path_to_folder = utils.getPathToUserContent(path_to_type);

    try {
      let folders = (
        await fs.readdir(full_path_to_folder, { withFileTypes: true })
      )
        .filter(
          (dirent) =>
            dirent.isDirectory() &&
            !["_", "."].some((char) => dirent.name.startsWith(char))
        )
        .map((dirent) => dirent.name);

      dev.logfunction({ folders });
      return folders;
    } catch (err) {
      dev.logfunction("No dir or folder found");
      return [];
    }
  }

  async function _updateCover({ path_to_folder, data, req }) {
    const item_in_schema = utils.parseAndCheckSchema({
      relative_path: path_to_folder,
    });
    if (!item_in_schema.hasOwnProperty("$cover")) {
      dev.error(`no cover allowed on ${path_to_folder}`);
      return;
    }

    const full_path_to_thumb = utils.getPathToUserContent(
      path_to_folder,
      "meta_cover.jpeg"
    );
    await thumbs.removeFolderCover({ path_to_folder });
    await fs.remove(full_path_to_thumb);

    if (data?.hasOwnProperty("path_to_meta")) {
      if (data.path_to_meta === "") return;

      const path_to_meta = utils.convertToLocalPath(data.path_to_meta);
      const path_to_folder = utils.getContainingFolder(path_to_meta);

      const meta = await file.getFile({
        path_to_meta,
      });
      const path_to_file = utils.getPathToUserContent(
        path.join(path_to_folder, meta.$media_filename)
      );
      await utils.makeImageFromPath({
        full_path: path_to_file,
        new_path: full_path_to_thumb,
        resolution: 4000,
        withoutEnlargement: true,
      });
    } else if (req) {
      const { originalFilename, path_to_temp_file } = await utils
        .handleForm({
          path_to_folder,
          req,
        })
        .catch((err) => {
          return;
        });

      const format = utils.isExtensionLosslessImageFormat(originalFilename)
        ? "png"
        : "jpeg";

      await utils.makeImageFromPath({
        full_path: path_to_temp_file,
        new_path: full_path_to_thumb,
        resolution: 2000,
        format,
      });
      await fs.remove(path_to_temp_file);
    }
  }

  async function _getFolderCover({ path_to_folder }) {
    dev.logfunction({ path_to_folder });

    const cover_path = utils.getPathToUserContent(
      path_to_folder,
      "meta_cover.jpeg"
    );

    if (!(await fs.pathExists(cover_path))) return false;

    dev.logverbose(`folder has cover`);
    const thumb_meta = await thumbs
      .makeFolderCover({
        path_to_folder,
      })
      .catch((err) => {
        dev.error("couldn't make cover thumbs, returning false");
        return false;
      });

    return thumb_meta;
  }
  async function _getFolderPreview({ path_to_folder, meta_filename }) {
    dev.logfunction({ path_to_folder, meta_filename });

    try {
      const path_to_meta = path.join(path_to_folder, meta_filename);
      return await file.getFile({
        path_to_meta,
      });
    } catch (e) {
      // failed to get preview media
      return false;
    }
  }

  async function _preventFolderOverride({ path_to_type, folder_slug }) {
    dev.logfunction({ path_to_type, folder_slug });

    const folders_slugs = await _getFolderSlugs({ path_to_type });
    dev.logfunction({ folders_slugs });

    if (folders_slugs.length === 0) return folder_slug;

    let index = 0,
      new_folder_slug = folder_slug;

    while (folders_slugs.includes(new_folder_slug)) {
      index++;
      new_folder_slug = `${folder_slug}-${index}`;
    }
    return new_folder_slug;
  }

  async function _removeFolderForGood({ path_to_folder }) {
    try {
      await fs.remove(utils.getPathToUserContent(path_to_folder));
    } catch (err) {
      throw err;
    }
  }

  async function _cleanFields({
    meta,
    path_to_type,
    path_to_folder,
    context,
    handle_duplicates = "throw",
  }) {
    if (!meta || Object.keys(meta).length === 0) return {};

    const { fields = {} } = utils.parseAndCheckSchema({
      relative_path: path_to_type,
    });

    if (path_to_type && path_to_type !== ".") {
      // not applicable to instance settings

      // Find all unique fields
      const uniqueFields = Object.entries(fields)
        .filter(([key, f]) => f.unique === true)
        .map(([key]) => key);
      // Check if meta is attempting to set/change a unique field
      const isChangingUniqueField = uniqueFields.some((field) =>
        meta.hasOwnProperty(field)
      );
      if (uniqueFields.length > 0 && isChangingUniqueField) {
        let siblings_folders = await API.getFolders({ path_to_type });
        siblings_folders = siblings_folders.filter(
          (sf) => sf.$path !== path_to_folder
        );
        if (siblings_folders.length > 0)
          meta = await utils.checkFieldUniqueness({
            fields,
            meta,
            siblings_folders,
            handle_duplicates,
          });
      }
    }

    return utils.validateMeta({
      fields,
      new_meta: meta,
      context,
    });
  }

  async function _moveFolderToBin({ path_to_folder }) {
    const bin_folder_path = utils.getBinFolder(path_to_folder);
    const full_folder_path = utils.getPathToUserContent(path_to_folder);
    const full_bin_folder_path = utils.getPathToUserContent(bin_folder_path);

    try {
      await fs.move(full_folder_path, full_bin_folder_path, {
        overwrite: true,
      });
      return;
    } catch (err) {
      throw err;
    }
  }

  function _getCacheKey({ path_to_folder }) {
    return path_to_folder || "global_settings";
  }

  return API;
})();
