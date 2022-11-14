const path = require("path"),
  fs = require("fs-extra");

const utils = require("./utils"),
  thumbs = require("./thumbs"),
  cache = require("./cache");

module.exports = (function () {
  const API = {
    getFolders: async ({ relative_path }) => {
      dev.logfunction({ relative_path });
      // TODO cache get all folders

      const folders_slugs = await _getFolderSlugs({ relative_path });

      const all_folders_with_meta = [];
      for (let folder_slug of folders_slugs) {
        const path_to_folder = path.join(relative_path, folder_slug);
        const folder_meta = await API.getFolder({
          relative_path: path_to_folder,
        }).catch((err) => {
          dev.error(err);
        });
        if (folder_meta) all_folders_with_meta.push(folder_meta);
      }

      return all_folders_with_meta;
    },

    getFolder: async ({ relative_path }) => {
      dev.logfunction({ relative_path });

      const { schema, folder_slug, subfolder_slug } =
        await utils.parseAndCheckSchema({ relative_path });

      const d = cache.get({
        key: relative_path,
      });
      if (d) return d;

      let folder_meta = await utils
        .readMetaFile(relative_path, "meta.txt")
        .catch((err) => {
          throw err;
        });
      folder_meta.$slug = subfolder_slug ? subfolder_slug : folder_slug;

      let cover = await _getFolderCover({
        schema,
        relative_path,
      });
      if (cover) folder_meta.$cover = cover;

      // remove $password from this object
      if (folder_meta.$password && folder_meta.$password.length > 0)
        folder_meta.$password = "_active";

      // TODO get number of files if files in schema
      cache.set({
        key: relative_path,
        value: folder_meta,
      });

      return folder_meta;
    },

    createFolder: async ({ relative_path, data }) => {
      dev.logfunction({ relative_path, data });

      let folder_slug = `untitled`;
      if (data?.requested_slug) folder_slug = utils.slug(data.requested_slug);

      let { $cover, ...meta } = data;

      folder_slug = await _preventFolderOverride({
        relative_path,
        folder_slug,
      });

      const { schema } = await utils.parseAndCheckSchema({ relative_path });

      let valid_meta = meta
        ? utils.validateMeta({
            fields: schema.fields,
            new_meta: meta,
          })
        : {};

      // set date_created field
      valid_meta.$date_created = valid_meta.$date_modified =
        utils.getCurrentDate();

      // set status (see readme)
      valid_meta.$public = valid_meta.$public ? valid_meta.$public : false;

      if (valid_meta.$password) {
        // encrypt before store
        valid_meta.$password = await utils.hashPassword({
          password: valid_meta.$password,
        });
      }

      const path_to_folder = utils.getPathToUserContent(
        relative_path,
        folder_slug
      );
      await fs.ensureDir(path_to_folder);

      await utils.saveMetaAtPath({
        relative_path: path.join(relative_path, folder_slug),
        file_slug: "meta.txt",
        meta: valid_meta,
      });

      // TODO store cover if it exists

      return folder_slug;
    },
    updateFolder: async ({
      folder_type,
      folder_slug,
      data,
      update_cover_req,
    }) => {
      dev.logfunction({ folder_type, folder_slug, data });

      // get folder meta
      let meta = await utils.readMetaFile(folder_type, folder_slug, "meta.txt");
      const previous_meta = JSON.parse(JSON.stringify(meta));

      let { ...new_meta } = data;

      // filter new_meta with schema – only keep props listed in schema, not read_only, and respecing the type
      if (new_meta) {
        const clean_meta = await utils.cleanNewMeta({
          relative_path,
          new_meta,
        });
        Object.assign(meta, clean_meta);
      }

      meta.$date_modified = utils.getCurrentDate();
      await utils.saveMetaAtPath({
        relative_path,
        file_slug: "meta.txt",
        meta,
      });

      // todo deep compare
      let changed_meta = Object.keys(meta).reduce((acc, key) => {
        if (JSON.stringify(meta[key]) !== JSON.stringify(previous_meta[key]))
          acc[key] = meta[key];
        return acc;
      }, {});

      if (update_cover_req) {
        await thumbs.removeFolderCover({ folder_type, folder_slug });
        await fs.remove(
          utils.getPathToUserContent(
            folder_type,
            folder_slug,
            "meta_cover.jpeg"
          )
        );

        // TODO improve legibility
        await API.saveCover({
          req: update_cover_req,
          folder_type,
          folder_slug,
        }).catch((err) => {});

        changed_meta.$cover = await _getFolderCover({
          folder_type,
          folder_slug,
        });
      }

      cache.delete({
        key: `${folder_type}/${folder_slug}`,
      });

      return changed_meta;
    },
    removeFolder: async ({ folder_type, folder_slug }) => {
      dev.logfunction({ folder_type, folder_slug });

      try {
        if (global.settings.removePermanently === true)
          await _removeFolderForGood({ folder_type, folder_slug });
        else await _moveFolderToBin({ folder_type, folder_slug });

        await thumbs.removeFolderThumbs({ folder_type, folder_slug });
        cache.delete({
          key: `${folder_type}/${folder_slug}`,
        });

        return folder_slug;
      } catch (err) {
        throw err;
      }
    },

    saveCover: async ({ req, folder_type, folder_slug }) => {
      dev.logfunction({ folder_type, folder_slug });

      if (!global.settings.schema[folder_type].hasOwnProperty("$cover")) {
        dev.error(`no cover allowed on ${folder_type}`);
        return;
      }

      const { folder_path, filepath } = await utils
        .handleForm({
          req,
          folder_type,
          folder_slug,
        })
        .catch((err) => {
          return;
        });

      const cover_name = "meta_cover.jpeg";
      const full_path_to_thumb = path.join(folder_path, cover_name);

      // TODO read filepath with sharp,
      await utils.makeImageFromPath({
        full_path: filepath,
        new_path: full_path_to_thumb,
        resolution: 2000,
      });
      await fs.remove(filepath);

      return;
    },

    login: async ({ folder_type, folder_slug, submitted_password }) => {
      dev.logfunction({ folder_type, folder_slug, submitted_password });

      // get folder meta
      let folder_meta = await utils
        .readMetaFile(folder_type, folder_slug, "meta.txt")
        .catch((err) => {
          throw err;
        });

      // check if folder has a password
      if (
        !folder_meta.hasOwnProperty("$password") ||
        folder_meta.$password === ""
      )
        throw new Error("Folder doesn’t have any password");

      const submitted_password_matches = utils.checkPassword({
        submitted_password,
        stored_password_with_salt: folder_meta.$password,
      });
      if (!submitted_password_matches) {
        throw new Error("Submitted password doesn’t match");
      }
      return;
    },
  };

  async function _getFolderSlugs({ relative_path }) {
    dev.logfunction({ relative_path });

    const folder_path = utils.getPathToUserContent(relative_path);

    try {
      let folders = (await fs.readdir(folder_path, { withFileTypes: true }))
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

  async function _getFolderCover({ schema, relative_path }) {
    dev.logfunction({ schema, relative_path });

    if (!schema.$cover) return false;

    const cover_name = "meta_cover.jpeg";
    const cover_path = utils.getPathToUserContent(relative_path, cover_name);

    if (!(await fs.pathExists(cover_path))) return false;

    dev.logverbose(`folder has cover`);
    const thumb_meta = await thumbs.makeFolderCover({
      relative_path,
    });

    return thumb_meta;
  }

  async function _preventFolderOverride({ relative_path, folder_slug }) {
    dev.logfunction({ relative_path, folder_slug });

    const folders_slugs = await _getFolderSlugs({ relative_path });
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

  async function _removeFolderForGood({ folder_type, folder_slug }) {
    const full_folder_path = utils.getPathToUserContent(
      folder_type,
      folder_slug
    );

    try {
      await fs.remove(full_folder_path);
      return;
    } catch (err) {
      throw err;
    }
  }
  async function _moveFolderToBin({ folder_type, folder_slug }) {
    const full_folder_path = utils.getPathToUserContent(
      folder_type,
      folder_slug
    );
    const bin_folder_path = utils.getPathToUserContent(
      folder_type,
      global.settings.deletedFolderName,
      folder_slug
    );

    try {
      await fs.move(full_folder_path, bin_folder_path, { overwrite: true });
      return;
    } catch (err) {
      throw err;
    }
  }

  return API;
})();
