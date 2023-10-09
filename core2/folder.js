const path = require("path"),
  fs = require("fs-extra"),
  unzipper = require("unzipper");

const utils = require("./utils"),
  thumbs = require("./thumbs"),
  file = require("./file"),
  cache = require("./cache");

module.exports = (function () {
  const API = {
    getFolders: async ({ path_to_type }) => {
      dev.logfunction({ path_to_type });
      // TODO cache get all folders

      utils.parseAndCheckSchema({
        relative_path: path_to_type,
      });

      const folders_slugs = await _getFolderSlugs({
        path_to_type,
      });

      let all_folders_with_meta = [];
      for (let folder_slug of folders_slugs) {
        const path_to_folder = path.join(path_to_type, folder_slug);
        const folder_meta = await API.getFolder({
          path_to_folder,
        }).catch((err) => {
          if (err.code === "ENOENT")
            dev.error(`Failed to get folder`, err.message);
          else throw err;
        });
        if (folder_meta) all_folders_with_meta.push(folder_meta);
        await new Promise(setImmediate);
      }

      return all_folders_with_meta;
    },

    getFolder: async ({ path_to_folder, detailed }) => {
      dev.logfunction({ path_to_folder, detailed });

      let d = cache.get({
        key: path_to_folder,
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
      folder_meta.$path = path_to_folder;

      if (item_in_schema.$cover) {
        let cover = await _getFolderCover({
          path_to_folder,
        });
        if (cover) folder_meta.$cover = cover;
      }

      // remove $password from this object
      if (folder_meta.$password && folder_meta.$password.length > 0)
        folder_meta.$password = "_active";

      // TODO get number of files if files in item_in_schema
      cache.set({
        key: path_to_folder,
        value: JSON.parse(JSON.stringify(folder_meta)),
      });

      if (detailed)
        folder_meta.$infos = await thumbs.getInfosForFolder({ path_to_folder });

      return folder_meta;
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

      let full_path_to_folder_in_cache = await utils.createFolderInCache(
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
      const meta_file = directory.files.find((f) => f.path === "meta.txt");

      if (!meta_file) {
        await fs.remove(full_path_to_folder_in_cache);
        const err = new Error("Imported folder is missing meta.txt");
        err.code = "imported_folder_not_valid";
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
      valid_meta.requested_slug = originalFilename;

      const new_folder_slug = await API.createFolder({
        path_to_type,
        data: valid_meta,
      });

      // copy all medias to new folder
      const full_path_to_folder = utils.getPathToUserContent(
        path_to_type,
        new_folder_slug
      );

      // await directory.extract({ path: full_path_to_folder, concurrency: 5 });

      const files_to_copy = directory.files.filter(
        (f) => f.path !== "meta.txt"
      );

      function extractFile(file) {
        return new Promise((resolve, reject) => {
          const path_to_file = path.join(full_path_to_folder, file.path);
          if (file.type === "Directory") fs.ensureDir(path_to_file, resolve);
          else if (file.type === "File")
            file
              .stream()
              .pipe(fs.createWriteStream(path_to_file))
              .on("error", (err) => {
                dev.error("Failed to extract", file.path);
                return reject();
              })
              .on("finish", () => {
                dev.logverbose("Successfully extracted", file.path);
                return resolve();
              });
        });
      }

      for (let i = 0; i < files_to_copy.length; i++) {
        dev.logverbose("Extracting", file.path);
        await extractFile(files_to_copy[i]);
      }

      await fs.remove(full_path_to_folder_in_cache);

      return new_folder_slug;
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

      let { ...new_meta } = data;

      // filter new_meta with schema – only keep props present in the schema, not read_only, and respecing the type
      if (new_meta && Object.keys(new_meta).length > 0) {
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

      cache.delete({
        key: path_to_folder,
      });

      return changed_meta;
    },
    copyFolder: async ({
      path_to_type,
      path_to_source_folder,
      path_to_destination_type,
      new_meta,
    }) => {
      dev.logfunction({ path_to_source_folder, path_to_destination_type });

      // check for field uniqueness
      await _cleanFields({
        meta: new_meta,
        path_to_type,
        context: "update",
      });

      const source_folder_slug = utils.getSlugFromPath(path_to_source_folder);

      let folder_slug = source_folder_slug + "-copy";
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

      // todo update with meta
      await API.updateFolder({
        path_to_type,
        path_to_folder: path_to_destination_folder,
        admin_meta: {
          $date_created: utils.getCurrentDate(),
        },
        data: new_meta,
      });

      return path_to_destination_folder;
    },

    removeFolder: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });

      try {
        if (global.settings.removePermanently === true)
          await _removeFolderForGood({ path_to_folder });
        else await _moveFolderToBin({ path_to_folder });

        await thumbs.removeFolderThumbs({ path_to_folder });
        cache.delete({
          key: path_to_folder,
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
        const err = new Error("Folder doesn’t have password");
        err.code = "no_password_for_folder";
        throw err;
      }

      const submitted_password_matches = await utils.checkPassword({
        submitted_password,
        stored_password_with_salt: folder_meta.$password,
      });
      if (!submitted_password_matches) {
        const err = new Error("Submitted password doesn’t match");
        err.code = "submitted_password_is_wrong";
        throw err;
      }
      return;
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

    if (data.hasOwnProperty("path_to_meta")) {
      if (data.path_to_meta === "") return;

      const path_to_meta = data.path_to_meta;
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
        resolution: 2000,
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
        dev.error("couldn’t make cover thumbs, returning false");
        return false;
      });

    return thumb_meta;
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
    if (!meta) return {};

    const { fields = {} } = utils.parseAndCheckSchema({
      relative_path: path_to_type,
    });

    if (path_to_type) {
      // not applicable to instance settings
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

    return utils.validateMeta({
      fields,
      new_meta: meta,
      context,
    });
  }

  async function _moveFolderToBin({ path_to_folder }) {
    const bin_folder_path =
      path_to_folder.substr(0, path_to_folder.lastIndexOf("/")) +
      "/" +
      global.settings.deletedFolderName +
      "/" +
      path_to_folder.substr(path_to_folder.lastIndexOf("/") + 1);

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

  return API;
})();
