const path = require("path"),
  fs = require("fs-extra");

const utils = require("./utils"),
  thumbs = require("./thumbs"),
  cache = require("./cache");

module.exports = (function () {
  const API = {
    importFile: async ({ path_to_folder, req }) => {
      dev.logfunction({ path_to_folder });

      const schema = await utils.parseAndCheckSchema({
        relative_path: path_to_folder,
      });
      const fields = schema.$files.fields;

      let additional_meta = {};
      let extracted_meta = {};
      let meta_filename = undefined;

      // if req.body has content, this means there is no files to process
      if (Object.keys(req.body) && Object.keys(req.body).length) {
        additional_meta = req.body;
        extracted_meta = await _initMeta({
          additional_meta,
        });

        const prefix = additional_meta.requested_slug
          ? utils.slug(additional_meta.requested_slug)
          : "infos";
        meta_filename =
          prefix + "-" + +extracted_meta.$date_uploaded + ".meta.txt";
      } else {
        const {
          originalFilename,
          path_to_temp_file,
          user_additional_meta: _additional_meta,
        } = await utils
          .handleForm({
            path_to_folder,
            req,
          })
          .catch((err) => {
            dev.error(`Failed to handle form`, err);
          });

        additional_meta = _additional_meta;

        // await this.copyFileToFolderAndCreate({
        //   additional_meta,
        //   originalFilename,
        //   path_to_folder,
        //   path_to_temp_file,
        // });

        // make url-compatible media filenames
        const { name, ext } = path.parse(originalFilename);
        const slugged_original_filename = utils.slug(name) + ext;

        let { new_path, new_filename } = await _renameUploadedFile({
          path_to_folder,
          originalFilename: slugged_original_filename,
          path_to_temp_file,
        }).catch((err) => {
          throw err;
        });

        extracted_meta = await _initMeta({
          additional_meta,
          filename: new_filename,
        });

        meta_filename = new_filename + ".meta.txt";

        dev.log(`New file uploaded to`, { path_to_folder });
        dev.logverbose({
          new_filename,
          new_path,
          additional_meta,
          meta_filename,
        });
      }

      // user added meta
      let validated_meta = utils.validateMeta({
        fields,
        new_meta: additional_meta,
      });
      const meta = Object.assign({}, validated_meta, extracted_meta);

      let new_meta_filename = await _preventFileOverride({
        path_to_folder,
        original_filename: meta_filename,
      });

      await utils.saveMetaAtPath({
        relative_path: path_to_folder,
        file_slug: new_meta_filename,
        meta,
      });

      return new_meta_filename;
    },

    getFiles: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });

      const meta_filenames = await _getMetasInFolder({
        path_to_folder,
      });

      // no caching here to get more flexibility with lru cache (busting medias with few access, etc.)

      const metas = [];
      for (const meta_filename of meta_filenames) {
        try {
          dev.logverbose(`reading ${meta_filename}`);

          const path_to_meta = path.join(path_to_folder, meta_filename);
          const meta = await API.getFile({
            path_to_folder,
            path_to_meta,
          });

          metas.push(meta);
        } catch (err) {
          dev.error(err);
        }
      }

      return metas;
    },
    getFile: async ({ path_to_folder, path_to_meta }) => {
      dev.logfunction({ path_to_folder, path_to_meta });

      const d = cache.get({
        key: path_to_meta,
      });
      if (d) return d;

      let meta = await utils.readMetaFile(path_to_meta);
      meta.$path = path_to_meta;

      const media_filename = meta.$media_filename;
      const media_type = meta.$type;

      if (media_filename && media_filename.endsWith(".txt"))
        meta.$content = await utils.readFileContent(
          path_to_folder,
          media_filename
        );

      const _thumbs = await thumbs
        .makeThumbForMedia({
          media_type,
          media_filename,
          path_to_folder,
        })
        .catch((err) => {
          dev.error(err);
        });
      if (_thumbs) meta.$thumbs = _thumbs;

      if (media_filename) {
        const file_infos = await thumbs.getInfosForFile({
          media_type,
          media_filename,
          path_to_folder,
        });
        if (file_infos) meta.$infos = file_infos;
      }

      cache.set({
        key: path_to_meta,
        value: meta,
      });

      return meta;
    },
    getArchives: async ({ path_to_folder, meta_filename }) => {
      dev.logfunction({ path_to_folder, meta_filename });
      return await _readArchives({
        path_to_folder,
        meta_filename,
      });
    },

    updateFile: async ({ path_to_folder, path_to_meta, data }) => {
      dev.logfunction({ path_to_folder, path_to_meta, data });

      let meta = await utils.readMetaFile(path_to_meta);
      const previous_meta = { ...meta };

      let { $content, ...new_meta } = data;

      // update meta file
      if (new_meta) {
        const clean_meta = await utils.cleanNewMeta({
          relative_path: path_to_meta,
          new_meta,
        });
        Object.assign(meta, clean_meta);
      }

      if (typeof $content !== "undefined") {
        if (typeof $content !== "string")
          throw new Error("Content (text) is not a string");

        // check if content is different from previous content, return early if that's the case
        const previous_content = await utils.readFileContent(
          path_to_folder,
          meta.$media_filename
        );
        if (previous_content === $content)
          throw new Error("content_not_changed");

        dev.logfunction(
          `Content is supposed to be updated`,
          { previous_content },
          { $content },
          { $type: meta.$type },
          { $media_filename: meta.$media_filename }
        );

        if (global.settings.versioning === true)
          _archiveVersion({
            path_to_folder,
            media_filename: meta.$media_filename,
          });

        // TODO update media (text, image, etc.)
        if (meta.$type === "text") {
          const full_path = utils.getPathToUserContent(
            path_to_folder,
            meta.$media_filename
          );
          await utils
            .storeContent({
              full_path,
              meta: $content,
            })
            .catch((err) => {
              throw err;
            });
        }
        // TODO remove thumbs
      }

      meta.$date_modified = utils.getCurrentDate();
      await utils.storeContent({
        full_path: utils.getPathToUserContent(path_to_meta),
        meta,
      });

      // dev.log({ meta, previous_meta });
      const changed_data = Object.keys(meta).reduce((acc, key) => {
        if (JSON.stringify(meta[key]) !== JSON.stringify(previous_meta[key]))
          acc[key] = meta[key];
        return acc;
      }, {});

      if (typeof $content !== "undefined") changed_data.$content = $content;

      cache.delete({
        key: path_to_meta,
      });

      return changed_data;
    },

    removeFile: async ({ path_to_folder, meta_filename }) => {
      dev.logfunction({ path_to_folder, meta_filename });

      try {
        await thumbs.removeFileThumbs({ path_to_folder, meta_filename });
        // todo check if file exists in sharedb collection, remove
        // await serverRTC.removeDoc({});

        if (global.settings.removePermanently === true)
          await _removeFileForGood({ path_to_folder, meta_filename });
        else await _moveFileToBin({ path_to_folder, meta_filename });

        cache.delete({
          key: `${path_to_folder}/${meta_filename}`,
        });

        return;
      } catch (err) {
        throw err;
      }
    },

    addFileToFolder: async ({
      full_path_to_file,
      desired_filename,
      path_to_folder,
    }) => {
      dev.logfunction({ full_path_to_file, path_to_folder });

      let new_filename = await _preventFileOverride({
        path_to_folder,
        original_filename: desired_filename,
      });

      const destination_path = utils.getPathToUserContent(
        path_to_folder,
        new_filename
      );
      await fs.copy(full_path_to_file, destination_path);

      const meta = await _initMeta({
        additional_meta: {
          $date_created: +new Date(),
        },
        filename: new_filename,
      });

      const meta_filename = new_filename + ".meta.txt";

      await utils.saveMetaAtPath({
        relative_path: path_to_folder,
        file_slug: meta_filename,
        meta,
      });

      return meta_filename;
    },

    duplicateFile: async ({
      path_to_folder,
      meta_filename,
      path_to_meta,
      data,
    }) => {
      dev.logfunction({ path_to_folder, meta_filename, path_to_meta, data });

      let meta = await utils.readMetaFile(path_to_meta);

      if (meta.hasOwnProperty("$media_filename")) {
        // copy media
        let new_filename = await _preventFileOverride({
          path_to_folder,
          original_filename: meta.$media_filename,
        });

        const og_path = utils.getPathToUserContent(
          path_to_folder,
          meta.$media_filename
        );
        const copy_path = utils.getPathToUserContent(
          path_to_folder,
          new_filename
        );
        await fs.copy(og_path, copy_path);

        meta.$media_filename = new_filename;
      }
      meta.$date_uploaded = utils.getCurrentDate();

      const new_meta_filename = await _preventFileOverride({
        path_to_folder,
        original_filename: meta_filename,
      });

      await utils.saveMetaAtPath({
        relative_path: path_to_folder,
        file_slug: new_meta_filename,
        meta,
      });

      await API.updateFile({
        path_to_folder,
        path_to_meta: path.join(path_to_folder, new_meta_filename),
        data,
      });

      return new_meta_filename;
    },
  };

  async function _renameUploadedFile({
    path_to_folder,
    originalFilename,
    path_to_temp_file,
  }) {
    dev.logfunction({ path_to_folder, originalFilename, path_to_temp_file });

    // get original filename
    let original_filename = originalFilename;

    // check if available, create new name if necessary
    let new_filename = await _preventFileOverride({
      path_to_folder,
      original_filename,
    });
    const new_path = utils.getPathToUserContent(path_to_folder, new_filename);

    try {
      await fs.move(path_to_temp_file, new_path, { overwrite: false });
      return { new_path, new_filename };
    } catch (err) {
      throw err;
    }
  }

  async function _preventFileOverride({ path_to_folder, original_filename }) {
    dev.logfunction({ path_to_folder, original_filename });

    const full_path_to_folder = utils.getPathToUserContent(path_to_folder);

    const getFilenameWithoutExt = (filename) =>
      filename.substring(0, filename.indexOf("."));
    const getFilenameExt = (filename) =>
      filename.substring(filename.indexOf("."), filename.length);

    let all_files_and_folders_names_without_ext = (
      await fs.readdir(full_path_to_folder, { withFileTypes: true })
    ).map(({ name }) => getFilenameWithoutExt(name));

    dev.logverbose({ all_files_and_folders_names_without_ext });

    if (all_files_and_folders_names_without_ext.length === 0)
      return original_filename;

    let index = 0;
    let original_filename_without_ext =
      getFilenameWithoutExt(original_filename);
    let new_filename_without_ext = original_filename_without_ext;
    let ext = getFilenameExt(original_filename);

    while (
      all_files_and_folders_names_without_ext.includes(new_filename_without_ext)
    ) {
      index++;
      new_filename_without_ext = `${original_filename_without_ext}-${index}`;
    }
    return new_filename_without_ext + ext;
  }

  async function _initMeta({ additional_meta = {}, filename }) {
    dev.logfunction();

    let new_meta = {};

    if (additional_meta.$date_created)
      new_meta.$date_created = utils.parseDate(additional_meta.$date_created);
    else {
      // TODO fs stat ?
      // await fs.stat(filepath);
    }

    new_meta.$date_uploaded = new_meta.$date_modified = utils.getCurrentDate();
    if (filename) new_meta.$media_filename = filename;

    // set status (see readme)
    new_meta.$status = additional_meta.$status
      ? additional_meta.$status
      : "invisible";

    if (additional_meta.$type) {
      new_meta.$type = additional_meta.$type;
    } else if (filename) {
      const ext = path.extname(filename);
      switch (ext.toLowerCase()) {
        case ".jpeg":
        case ".jpg":
        case ".webp":
        case ".png":
        case ".gif":
        case ".tiff":
        case ".tif":
        case ".dng":
        case ".svg":
          new_meta.$type = "image";
          break;
        case ".mp4":
        case ".flv":
        case ".mov":
        case ".webm":
        case ".webp":
        case ".avi":
          new_meta.$type = "video";
          break;
        case ".stl":
          new_meta.$type = "stl";
          break;
        case ".mp3":
        case ".wav":
        case ".m4a":
        case ".ogg":
          new_meta.$type = "audio";
          break;
        case ".md":
        case ".rtf":
        case ".txt":
          new_meta.$type = "text";
          break;
        case ".pdf":
          new_meta.$type = "pdf";
          break;
        default:
          new_meta.$type = "other";
      }
      dev.logfunction(`Type determined to be ${new_meta.$type}`);
    }

    return new_meta;
  }

  async function _getMetasInFolder({ path_to_folder }) {
    dev.logfunction({ path_to_folder });

    try {
      let files = (
        await fs.readdir(utils.getPathToUserContent(path_to_folder), {
          withFileTypes: true,
        })
      )
        .filter(
          (dirent) => !dirent.isDirectory() && dirent.name.endsWith(".meta.txt")
        )
        .map((dirent) => dirent.name);
      dev.logfunction({ files });
      return files;
    } catch (err) {
      dev.logfunction("No files found");
      return [];
    }
  }

  async function _removeFileForGood({ path_to_folder, meta_filename }) {
    dev.logfunction({ path_to_folder, meta_filename });

    const _all_file_paths = await _getAllFilesRelatedToMeta({
      path_to_folder,
      meta_filename,
    });

    try {
      for (const file_path of _all_file_paths) {
        await fs.remove(file_path);
      }
      return;
    } catch (err) {
      throw err;
    }
  }

  async function _moveFileToBin({ path_to_folder, meta_filename }) {
    dev.logfunction({ path_to_folder, meta_filename });

    const _all_file_paths = await _getAllFilesRelatedToMeta({
      path_to_folder,
      meta_filename,
    });

    try {
      for (const file_path of _all_file_paths) {
        const path_in_bin = file_path.replace(
          path.join(path_to_folder),
          path.join(path_to_folder, global.settings.deletedFolderName)
        );
        dev.logverbose({ file_path, path_in_bin });
        await fs
          .move(file_path, path_in_bin, { overwrite: true })
          .catch((err) => {
            // don't catch error if missing target at path (can be an "…_archives" folder)
          });
      }
      return;
    } catch (err) {
      throw err;
    }
  }

  async function _getAllFilesRelatedToMeta({ path_to_folder, meta_filename }) {
    let paths = [];

    const full_meta_path = utils.getPathToUserContent(
      path_to_folder,
      meta_filename
    );
    paths.push(full_meta_path);

    let meta = await utils.readMetaFile(path_to_folder, meta_filename);
    const media_filename = meta.$media_filename;

    if (!media_filename) return paths;

    const full_media_path = utils.getPathToUserContent(
      path_to_folder,
      media_filename
    );
    paths.push(full_media_path);

    const archive_folder_name = _getArchivePath(media_filename);

    const full_archive_path = utils.getPathToUserContent(
      path_to_folder,
      archive_folder_name
    );
    paths.push(full_archive_path);

    dev.logfunction({ paths });

    return paths;
  }

  async function _archiveVersion({ path_to_folder, media_filename }) {
    dev.logfunction(arguments[0]);
    const media_path = utils.getPathToUserContent(
      path_to_folder,
      media_filename
    );

    const archive_folder_name = _getArchivePath(media_filename);

    const full_archived_folder_path = utils.getPathToUserContent(
      path_to_folder,
      archive_folder_name
    );
    await fs.ensureDir(full_archived_folder_path);

    try {
      // keep file name, append -1, -2, etc. if necessary to prevent override
      // const archived_media_filename = await _preventFileOverride({
      //   folder_path: archived_folder_path,
      //   original_filename: media_filename,
      // });

      // use timestamp to mark time archived
      const archived_media_filename =
        +utils.getCurrentDate() + path.parse(media_filename).ext;

      const archived_media_path = path.join(
        full_archived_folder_path,
        archived_media_filename
      );

      await fs.move(media_path, archived_media_path, {
        overwrite: true,
      });
      return;
    } catch (err) {
      throw err;
    }
  }
  async function _readArchives({ path_to_folder, meta_filename }) {
    dev.logfunction();

    let meta = await utils.readMetaFile(path_to_folder, meta_filename);

    const archive_folder_name = _getArchivePath(meta.$media_filename);
    const full_archived_folder_path = utils.getPathToUserContent(
      path_to_folder,
      archive_folder_name
    );

    try {
      let filenames = (
        await fs.readdir(full_archived_folder_path, { withFileTypes: true })
      )
        .filter((dirent) => !dirent.isDirectory())
        .map((dirent) => dirent.name);
      dev.logfunction({ filenames });

      const files_content = [];
      for (const filename of filenames) {
        const content = await utils.readFileContent(
          path_to_folder,
          archive_folder_name,
          filename
        );
        const date = +path.parse(filename).name;
        files_content.push({
          date,
          filename,
          content,
        });
      }
      return files_content;
    } catch (err) {
      throw err;
    }
  }

  function _getArchivePath(media_filename) {
    return "_archives_" + path.parse(media_filename).name;
  }

  return API;
})();
