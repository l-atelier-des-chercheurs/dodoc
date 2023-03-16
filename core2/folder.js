const path = require("path"),
  fs = require("fs-extra");

const utils = require("./utils"),
  thumbs = require("./thumbs"),
  cache = require("./cache");

module.exports = (function () {
  const API = {
    getFolders: async ({ path_to_type }) => {
      dev.logfunction({ path_to_type });
      // TODO cache get all folders

      await utils.parseAndCheckSchema({
        relative_path: path_to_type,
      });

      const folders_slugs = await _getFolderSlugs({
        path_to_type,
      });

      const all_folders_with_meta = [];
      for (let folder_slug of folders_slugs) {
        const path_to_folder = path.join(path_to_type, folder_slug);
        const folder_meta = await API.getFolder({
          path_to_folder,
        }).catch((err) => {
          dev.error(err);
        });
        if (folder_meta) all_folders_with_meta.push(folder_meta);
      }

      return all_folders_with_meta;
    },

    getFolder: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });

      const schema = await utils.parseAndCheckSchema({
        relative_path: path_to_folder,
      });

      const d = cache.get({
        key: path_to_folder,
      });
      if (d) return d;

      let folder_meta = await utils
        .readMetaFile(path_to_folder, "meta.txt")
        .catch((err) => {
          throw err;
        });
      folder_meta.$path = path_to_folder;

      if (schema.$cover) {
        let cover = await _getFolderCover({
          path_to_folder,
        });
        if (cover) folder_meta.$cover = cover;
      }

      // remove $password from this object
      if (folder_meta.$password && folder_meta.$password.length > 0)
        folder_meta.$password = "_active";

      // TODO get number of files if files in schema
      cache.set({
        key: path_to_folder,
        value: folder_meta,
      });

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

      const schema = await utils.parseAndCheckSchema({
        relative_path: path_to_type,
      });

      let valid_meta = meta
        ? utils.validateMeta({
            fields: schema.fields,
            new_meta: meta,
          })
        : {};

      // todo check for uniqueness (for example project's title, or author's name and email)
      // throw if already exists

      valid_meta.$date_created = valid_meta.$date_modified =
        utils.getCurrentDate();

      valid_meta.$status = valid_meta.$status
        ? valid_meta.$status
        : "invisible";

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
    updateFolder: async ({ path_to_folder, data, update_cover_req }) => {
      dev.logfunction({ path_to_folder, data });

      // get folder meta
      let meta = await utils.readMetaFile(path_to_folder, "meta.txt");
      const previous_meta = JSON.parse(JSON.stringify(meta));

      let { ...new_meta } = data;

      // filter new_meta with schema – only keep props present in the schema, not read_only, and respecing the type
      if (new_meta) {
        const clean_meta = await utils.cleanNewMeta({
          relative_path: path_to_folder,
          new_meta,
        });
        Object.assign(meta, clean_meta);
      }

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
        await thumbs.removeFolderCover({ path_to_folder });
        await fs.remove(
          utils.getPathToUserContent(path_to_folder, "meta_cover.jpeg")
        );

        // TODO improve legibility
        await API.saveCover({
          req: update_cover_req,
          path_to_folder,
        }).catch((err) => {});

        changed_meta.$cover = await _getFolderCover({
          path_to_folder,
        });
      }

      cache.delete({
        key: path_to_folder,
      });

      return changed_meta;
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

    saveCover: async ({ req, path_to_folder }) => {
      dev.logfunction({ path_to_folder });

      const schema = await utils.parseAndCheckSchema({
        relative_path: path_to_folder,
      });

      if (!schema.hasOwnProperty("$cover")) {
        dev.error(`no cover allowed on ${path_to_folder}`);
        return;
      }

      const { path_to_temp_file } = await utils
        .handleForm({
          path_to_folder,
          req,
        })
        .catch((err) => {
          return;
        });

      const cover_name = "meta_cover.jpeg";
      const full_path_to_thumb = utils.getPathToUserContent(
        path_to_folder,
        cover_name
      );

      // TODO read filepath with sharp,
      await utils.makeImageFromPath({
        full_path: path_to_temp_file,
        new_path: full_path_to_thumb,
        resolution: 2000,
      });
      await fs.remove(path_to_temp_file);

      return;
    },

    login: async ({ path_to_folder, submitted_password }) => {
      dev.logfunction({ path_to_folder, submitted_password });

      // get folder meta
      let folder_meta = await utils
        .readMetaFile(path_to_folder, "meta.txt")
        .catch((err) => {
          throw err;
        });

      // check if folder has a password
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

  async function _getFolderCover({ schema, path_to_folder }) {
    dev.logfunction({ schema, path_to_folder });

    const cover_name = "meta_cover.jpeg";
    const cover_path = utils.getPathToUserContent(path_to_folder, cover_name);

    if (!(await fs.pathExists(cover_path))) return false;

    dev.logverbose(`folder has cover`);
    const thumb_meta = await thumbs.makeFolderCover({
      path_to_folder,
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
