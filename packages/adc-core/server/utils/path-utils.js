const path = require("path"),
  slugg = require("slugg"),
  fs = require("fs-extra"),
  archiver = require("archiver");

module.exports = function createPathUtils(API) {
  return {
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
    fileExtensionIs(media_path, ext) {
      const exts = typeof ext === "string" ? [ext] : ext;
      const _ext = path.extname(media_path);
      return exts.includes(_ext.toLowerCase());
    },

    convertToSlashPath(p) {
      return p.replaceAll(path.sep, "/");
    },
    convertToLocalPath(p) {
      return p.replaceAll("/", path.sep);
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

    getZipFolderTypeFilename({ path_to_type }) {
      try {
        const appname = global.appInfos.name;
        const version_number = global.appInfos.version.split(".")[0];
        const path_slug = path_to_type
          ? path_to_type.split(path.sep).join("_")
          : "type";
        return `${appname}_v${version_number}_type_${path_slug}.zip`;
      } catch (err) {
        dev.error(err);
        return "download.zip";
      }
    },
  };
};
