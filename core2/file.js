const path = require("path"),
  fs = require("fs-extra");

const utils = require("./utils"),
  thumbs = require("./thumbs"),
  archives = require("./archives"),
  cache = require("./cache");

module.exports = (function () {
  const API = {
    importFile: async ({ path_to_folder, req }) => {
      dev.logfunction({ path_to_folder });

      const item_in_schema = utils.parseAndCheckSchema({
        relative_path: path_to_folder,
      });
      const fields = item_in_schema.$files.fields;

      let additional_meta = {};
      let extracted_meta = {};
      let meta_filename = undefined;

      // Determine import type and get file data
      const {
        fileData,
        additional_meta: _additional_meta,
        importType,
      } = await _determineImportType({
        req,
        path_to_folder,
      });

      additional_meta = _additional_meta;

      if (fileData) {
        // File-based import (URL download or regular upload)
        const { new_path, new_filename } = await _convertOrRenameUploadedFile({
          path_to_folder,
          originalFilename: fileData.originalFilename,
          path_to_temp_file: fileData.path_to_temp_file,
        }).catch((err) => {
          throw err;
        });

        extracted_meta = await _initMeta({
          additional_meta,
          filename: new_filename,
          path_to_media: new_path,
        });

        meta_filename = await _preventFileOverride({
          path_to_folder,
          original_filename: new_filename + ".meta.txt",
        });

        dev.log(`New file ${importType} to`, { path_to_folder });
        dev.logverbose({
          new_filename,
          new_path,
          additional_meta,
          meta_filename,
        });
      } else {
        // Meta-only import
        extracted_meta = await _initMeta({
          additional_meta,
        });

        const prefix = additional_meta.requested_slug
          ? utils.slug(additional_meta.requested_slug)
          : "infos";
        meta_filename =
          prefix + "-" + +extracted_meta.$date_uploaded + ".meta.txt";
      }

      // user added meta
      let validated_meta = utils.validateMeta({
        fields,
        new_meta: additional_meta,
      });
      const meta = Object.assign({}, validated_meta, extracted_meta);

      await utils.saveMetaAtPath({
        relative_path: path_to_folder,
        file_slug: meta_filename,
        meta,
      });

      return { meta, meta_filename };
    },
    getFiles: async ({ path_to_folder, embed_source }) => {
      dev.logfunction({ path_to_folder, embed_source });

      const meta_filenames = await _getMetasInFolder({
        path_to_folder,
      });

      let metas = [];
      let lastYield = Date.now();
      const YIELD_INTERVAL_MS = 50;

      for (const meta_filename of meta_filenames) {
        try {
          // dev.logverbose(`reading ${meta_filename}`);

          const path_to_meta = path.join(path_to_folder, meta_filename);
          let meta = await API.getFile({
            path_to_meta,
          });

          if (embed_source) meta = await _embedSourceMedias({ meta });

          metas.push(meta);

          // Yield only if enough time has passed
          if (Date.now() - lastYield >= YIELD_INTERVAL_MS) {
            await new Promise(setImmediate);
            lastYield = Date.now();
          }
        } catch (err) {
          dev.error(err);
        }
      }

      return metas;
    },
    getFilesCount: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });
      const meta_filenames = await _getMetasInFolder({ path_to_folder });
      return meta_filenames.length;
    },
    getFile: async ({ path_to_meta }) => {
      dev.logfunction({ path_to_meta });

      const d = cache.get({
        key: path_to_meta,
      });
      if (d) return JSON.parse(JSON.stringify(d));

      const path_to_folder = utils.getContainingFolder(path_to_meta);

      let meta = await utils.readMetaFile(path_to_meta);
      meta.$path = utils.convertToSlashPath(path_to_meta);

      const media_filename = meta.$media_filename;
      const media_type = meta.$type;

      if (
        media_filename &&
        [".txt", ".md", ".json", ".csv", ".js", ".ino", ".css"].includes(
          path.extname(media_filename)
        )
      )
        meta.$content = await utils.readFileContent(
          path_to_folder,
          media_filename
        );

      if (media_type) {
        const _thumbs = await thumbs
          .makeThumbForMedia({
            media_type,
            media_filename,
            path_to_folder,
          })
          .catch((err) => {
            if (err.message) dev.error(err.message);
            else dev.error(err);
          });
        if (_thumbs) meta.$thumbs = _thumbs;
      }

      if (media_filename) {
        const file_infos = await thumbs.getInfosForFile({
          media_type,
          media_filename,
          path_to_folder,
        });
        if (file_infos) {
          if (!meta.$location && file_infos.gps)
            meta.$location = file_infos.gps;
          if (file_infos.gps) delete file_infos.gps;
          meta.$infos = file_infos;
        }
      }

      cache.set({
        key: path_to_meta,
        value: meta,
      });

      return meta;
    },
    getArchives: async ({ path_to_folder, meta_filename }) => {
      dev.logfunction({ path_to_folder, meta_filename });
      const archives_content = await archives.getArchives({
        path_to_folder,
        meta_filename,
      });
      if (archives_content) return archives_content;
      return [];
    },

    updateFile: async ({ path_to_folder, path_to_meta, data }) => {
      dev.logfunction({ path_to_folder, path_to_meta, data });

      let meta = await utils.readMetaFile(path_to_meta);
      const previous_meta = { ...meta };

      let { $content, $media_filename, ...new_meta } = data;

      // update meta file
      if (new_meta && Object.keys(new_meta).length) {
        const item_in_schema = utils.parseAndCheckSchema({
          relative_path: path_to_meta,
        });

        if (item_in_schema?.$files?.fields) {
          const clean_meta = utils.validateMeta({
            fields: item_in_schema.$files.fields,
            new_meta,
            context: "update",
          });
          Object.assign(meta, clean_meta);
        } else {
          // No schema validation available, use new_meta as-is
          Object.assign(meta, new_meta);
        }

        // if file has $media_filename
        // if (new.hasOwnProperty("$media_filename") && meta.$media_filename) {
        //   const og_path = utils.getPathToUserContent(
        //     path_to_folder,
        //     previous_meta.$media_filename
        //   );
        //   await fs.remove(og_path);
        // }
      }

      if ($media_filename) meta.$media_filename = $media_filename;
      if (typeof $content !== "undefined") {
        await _updateTextContent({
          new_content: $content,
          path_to_folder,
          media_filename: meta.$media_filename,
        }).catch((err) => {
          if (err.message !== "content_not_changed") throw new Error(err);
        });
        // TODO remove thumbs
      }

      meta.$date_modified = utils.getCurrentDate();
      await utils.storeContent({
        full_path: utils.getPathToUserContent(path_to_meta),
        meta,
      });

      cache.delete({
        key: path_to_meta,
      });

      let changed_data = Object.keys(meta).reduce((acc, key) => {
        if (JSON.stringify(meta[key]) !== JSON.stringify(previous_meta[key]))
          acc[key] = meta[key];
        return acc;
      }, {});

      if ($media_filename)
        // refresh all media, since $thumbs and $infos changed as well
        changed_data = await API.getFile({
          path_to_meta,
        });

      if (typeof $content !== "undefined") changed_data.$content = $content;

      return changed_data;
    },

    getFilesBin: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });

      const bin_folder_path = _getBinFolderPath(path_to_folder);

      const bin_files = await API.getFiles({
        path_to_folder: bin_folder_path,
      });

      const bin_size = await utils.getFolderSize(bin_folder_path);

      return {
        size: bin_size,
        items: bin_files,
      };
    },

    restoreFileFromBin: async ({ path_to_folder, meta_filename }) => {
      dev.logfunction({ path_to_folder, meta_filename });

      const bin_folder_path = _getBinFolderPath(path_to_folder);
      const path_to_file_in_bin = path.join(bin_folder_path, meta_filename);

      const restored_file_path = await API.copyFile({
        path_to_folder: bin_folder_path,
        path_to_destination_folder: path_to_folder,
        meta_filename: meta_filename,
        path_to_meta: path_to_file_in_bin,
        new_meta: {},
      });

      // Remove the file from bin after successful restore
      await _removeFileForGood({ path_to_meta: path_to_file_in_bin });

      return restored_file_path;
    },

    removeBinFile: async ({ path_to_folder, meta_filename }) => {
      dev.logfunction({ path_to_folder, meta_filename });

      const bin_folder_path = _getBinFolderPath(path_to_folder);
      const path_to_file_in_bin = path.join(bin_folder_path, meta_filename);
      await _removeFileForGood({ path_to_meta: path_to_file_in_bin });
    },

    _regenerateThumbs: async ({
      path_to_folder,
      path_to_meta,
      meta_filename,
    }) => {
      dev.logfunction({ path_to_folder, path_to_meta, meta_filename });

      let { $media_filename, $type } = await utils.readMetaFile(path_to_meta);
      await thumbs.removeFileThumbs({ path_to_folder, meta_filename });

      if ($type) {
        const $thumbs = await thumbs
          .makeThumbForMedia({
            media_type: $type,
            media_filename: $media_filename,
            path_to_folder,
          })
          .catch((err) => {
            if (err.message) dev.error(err.message);
            else dev.error(err);
          });
        if ($thumbs) return { $thumbs };
      }
      return { $thumbs: {} };
    },
    removeFile: async ({ path_to_folder, meta_filename, path_to_meta }) => {
      dev.logfunction({ path_to_folder, meta_filename, path_to_meta });

      try {
        await thumbs.removeFileThumbs({ path_to_folder, meta_filename });
        await archives.removeFileArchives({ path_to_folder, meta_filename });

        // todo check if file exists in sharedb collection, remove
        // await serverRTC.removeDoc({});

        const _all_files_and_folders = await _getAllFilesAndFolders({
          path_to_folder,
          meta_filename,
        });

        const { remove_permanently } = await require("./settings").get();

        try {
          for (const file_folder_names of _all_files_and_folders) {
            const full_path_to_file_or_folder = utils.getPathToUserContent(
              path_to_folder,
              file_folder_names
            );

            if (remove_permanently === true)
              await fs.remove(full_path_to_file_or_folder);
            else {
              const bin_folder_path = _getBinFolderPath(path_to_folder);
              const dest_path = utils.getPathToUserContent(
                bin_folder_path,
                file_folder_names
              );
              await fs.move(full_path_to_file_or_folder, dest_path, {
                overwrite: true,
              });
            }
          }
        } catch (err) {
          // don't catch error if missing target at path (can be an "…_archives" folder)
        }

        cache.delete({
          key: `${path_to_meta}`,
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
      additional_meta = {},
    }) => {
      dev.logfunction({ full_path_to_file, path_to_folder });

      const ext = path.extname(full_path_to_file);
      desired_filename = desired_filename + ext;

      let new_filename = await _preventFileOverride({
        path_to_folder,
        original_filename: desired_filename,
      });

      const destination_path = utils.getPathToUserContent(
        path_to_folder,
        new_filename
      );
      await fs.copy(full_path_to_file, destination_path);

      additional_meta.$date_created = +new Date();

      const meta = await _initMeta({
        additional_meta,
        filename: new_filename,
      });

      const meta_filename = await _preventFileOverride({
        path_to_folder,
        original_filename: new_filename + ".meta.txt",
      });

      await utils.saveMetaAtPath({
        relative_path: path_to_folder,
        file_slug: meta_filename,
        meta,
      });

      return meta_filename;
    },
    copyFile: async ({
      path_to_folder,
      path_to_destination_folder,
      meta_filename,
      path_to_meta,
      new_meta,
    }) => {
      dev.logfunction({
        path_to_folder,
        path_to_destination_folder,
        meta_filename,
        path_to_meta,
        new_meta,
      });

      let meta = await utils.readMetaFile(path_to_meta);
      let desired_meta_filename = meta_filename;

      if (meta.hasOwnProperty("$media_filename")) {
        // copy media
        let new_filename = await _preventFileOverride({
          path_to_folder: path_to_destination_folder,
          original_filename: meta.$media_filename,
        });

        const og_path = utils.getPathToUserContent(
          path_to_folder,
          meta.$media_filename
        );
        const copy_path = utils.getPathToUserContent(
          path_to_destination_folder,
          new_filename
        );
        await fs.copy(og_path, copy_path);

        // if thumbs, copy thumbs as well
        await thumbs.copyThumbFiles({
          path_to_folder,
          media_filename: meta.$media_filename,
          path_to_destination_folder,
          new_filename,
        });

        meta.$media_filename = new_filename;
        desired_meta_filename = meta.$media_filename + ".meta.txt";
      }
      meta.$date_uploaded = utils.getCurrentDate();

      const new_meta_filename = await _preventFileOverride({
        path_to_folder: path_to_destination_folder,
        original_filename: desired_meta_filename,
      });

      // meta_filename = await _preventFileOverride({
      //   path_to_folder,
      //   original_filename: new_filename + ".meta.txt",
      // });

      await utils.saveMetaAtPath({
        relative_path: path_to_destination_folder,
        file_slug: new_meta_filename,
        meta,
      });

      await API.updateFile({
        path_to_folder: path_to_destination_folder,
        path_to_meta: path.join(path_to_destination_folder, new_meta_filename),
        data: new_meta,
      });

      return new_meta_filename;
    },
  };

  async function _convertOrRenameUploadedFile({
    path_to_folder,
    originalFilename,
    path_to_temp_file,
  }) {
    dev.logfunction({ path_to_folder, originalFilename, path_to_temp_file });

    // make url-compatible media filenames
    let { name, ext } = path.parse(originalFilename);
    const filename_without_ext = utils.slug(name);

    const new_filename = await _preventFileOverride({
      path_to_folder,
      original_filename: filename_without_ext + ext,
    });
    const new_path = utils.getPathToUserContent(path_to_folder, new_filename);

    await fs.move(path_to_temp_file, new_path, { overwrite: false });
    return { new_path, new_filename };
  }

  async function _preventFileOverride({ path_to_folder, original_filename }) {
    dev.logfunction({ path_to_folder, original_filename });

    const full_path_to_folder = utils.getPathToUserContent(path_to_folder);

    const parseFilename = (filename) => {
      if (!filename.includes(".")) return { name: filename, ext: "" };
      const name = filename.substring(0, filename.indexOf("."));
      const ext = filename.substring(filename.indexOf("."), filename.length);
      return { name, ext };
    };

    let all_files_and_folders_names = (
      await fs.readdir(full_path_to_folder, { withFileTypes: true })
    ).map(({ name }) => name);
    if (all_files_and_folders_names.length === 0) return original_filename;

    let index = 0;
    let new_filename = original_filename;

    while (all_files_and_folders_names.includes(new_filename)) {
      index++;
      const { name, ext } = parseFilename(original_filename);
      // todo increment index instead of -1-1-1
      new_filename = `${name}-${index}${ext}`;
    }
    return new_filename;
  }

  async function _initMeta({ additional_meta = {}, filename, path_to_media }) {
    dev.logfunction();

    // TODO need to rewrite this to match additional_meta with schema

    let new_meta = {};

    // set date created (see readme)
    if (additional_meta.$date_created)
      new_meta.$date_created = utils.parseDate(additional_meta.$date_created);
    else {
      // TODO fs stat ?
      // await fs.stat(filepath);
    }

    // set date uploaded (see readme)
    new_meta.$date_uploaded = new_meta.$date_modified = utils.getCurrentDate();
    if (filename) new_meta.$media_filename = filename;

    // set status (see readme)
    new_meta.$status = additional_meta.$status
      ? additional_meta.$status
      : "private";

    // set origin
    if (additional_meta.$origin && typeof additional_meta.$origin === "string")
      new_meta.$origin = additional_meta.$origin;

    // set authors
    if (additional_meta.$authors && Array.isArray(additional_meta.$authors))
      new_meta.$authors = additional_meta.$authors;

    // set type
    if (additional_meta.$type) {
      new_meta.$type = additional_meta.$type;
    } else if (filename) {
      const ext = path.extname(filename);
      switch (ext.toLowerCase()) {
        case ".jpeg":
        case ".jpg":
        case ".png":
        case ".gif":
        case ".svg":
          new_meta.$type = "image";
          break;
        case ".mp4":
        case ".webm":
          new_meta.$type = "video";
          break;
        case ".obj":
          new_meta.$type = "obj";
          break;
        case ".stl":
          new_meta.$type = "stl";
          break;
        case ".mp3":
        case ".wav":
        case ".aac":
        case ".ogg":
          new_meta.$type = "audio";
          break;
        case ".txt":
        case ".md":
        case ".json":
        case ".csv":
        case ".js":
        case ".ino":
        case ".css":
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

    if (
      additional_meta.$location &&
      additional_meta.$location.latitude &&
      additional_meta.$location.longitude
    ) {
      new_meta.$location = additional_meta.$location;
    } else {
      if (new_meta.$type === "image" && path_to_media) {
        try {
          const gps = await utils.getGPSFromFile(path_to_media);
          if (gps) new_meta.$location = gps;
        } catch (err) {}
      }
    }

    if (additional_meta.$credits) new_meta.$credits = additional_meta.$credits;

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

  async function _getAllFilesAndFolders({ path_to_folder, meta_filename }) {
    let files_and_folders_name = [];
    files_and_folders_name.push(meta_filename);

    let meta = await utils.readMetaFile(path_to_folder, meta_filename);
    const media_filename = meta.$media_filename;

    if (media_filename) {
      files_and_folders_name.push(media_filename);
    }

    dev.logfunction({ files_and_folders_name });

    return files_and_folders_name;
  }

  async function _updateTextContent({
    new_content,
    path_to_folder,
    media_filename,
  }) {
    if (typeof new_content !== "string")
      throw new Error("Content (text) is not a string");

    // check if content is different from previous content, return early if that's the case
    const previous_content = await utils.readFileContent(
      path_to_folder,
      media_filename
    );
    if (previous_content === new_content)
      throw new Error("content_not_changed");

    dev.logfunction(
      `Content is supposed to be updated`,
      { previous_content },
      { new_content },
      { media_filename }
    );

    if (global.settings.versioning === true)
      await archives.archiveVersion({
        path_to_folder,
        media_filename,
      });

    // TODO update media (text, image, etc.)
    const full_path = utils.getPathToUserContent(
      path_to_folder,
      media_filename
    );
    await utils
      .storeContent({
        full_path,
        meta: new_content,
      })
      .catch((err) => {
        throw err;
      });
  }

  async function _embedSourceMedias({ meta }) {
    // if (
    //   !["source_medias", "map_base_media_filename", "cover_meta_filename"].some(
    //     (key) => meta.hasOwnProperty(key)
    //   )
    // )
    //   return meta;

    const source_folder = utils.getFolderParent(
      utils.getContainingFolder(utils.convertToLocalPath(meta.$path))
    );

    const findSourceMedia = async (source_media, key) => {
      if (source_media.hasOwnProperty(key)) {
        const path_to_meta = path.join(source_folder, source_media[key]);
        const source_media_meta = await API.getFile({
          path_to_meta,
        });
        return source_media_meta;
      }
    };

    if (meta.source_medias)
      for (const [index, source_media] of meta.source_medias.entries()) {
        const source_media_meta = await findSourceMedia(
          source_media,
          "meta_filename_in_project"
        );
        if (source_media_meta)
          meta.source_medias[index]._media = source_media_meta;
      }

    const _map = await findSourceMedia(meta, "map_base_media_filename");
    if (_map) meta["_map_base_media"] = _map;

    return meta;
  }

  async function _removeFileForGood({ path_to_meta }) {
    dev.logfunction({ path_to_meta });

    const path_to_folder = utils.getContainingFolder(path_to_meta);
    const meta_filename = path.basename(path_to_meta);

    try {
      await thumbs.removeFileThumbs({ path_to_folder, meta_filename });
      await archives.removeFileArchives({ path_to_folder, meta_filename });

      const _all_files_and_folders = await _getAllFilesAndFolders({
        path_to_folder,
        meta_filename,
      });

      for (const file_folder_names of _all_files_and_folders) {
        const full_path_to_file_or_folder = utils.getPathToUserContent(
          path_to_folder,
          file_folder_names
        );
        await fs.remove(full_path_to_file_or_folder);
      }

      cache.delete({
        key: `${path_to_meta}`,
      });

      return;
    } catch (err) {
      throw err;
    }
  }

  function _getBinFolderPath(path_to_folder) {
    return path.join(path_to_folder, global.settings.deletedFolderName);
  }

  async function _determineImportType({ req, path_to_folder }) {
    dev.logfunction({ path_to_folder });

    const { upload_max_file_size_in_mo } = await require("./settings").get();

    // Check if req.body has content (meta-only or URL import)
    if (req.body && Object.keys(req.body).length) {
      const additional_meta = req.body;

      // Check if this is a URL import
      if (additional_meta.url) {
        const destination_full_folder_path =
          utils.getPathToUserContent(path_to_folder);
        const tempFilename = `temp_${Date.now()}_downloaded-file`;
        const path_to_temp_file = path.join(
          destination_full_folder_path,
          tempFilename
        );

        const downloadResult = await utils.downloadFileFromUrl({
          url: additional_meta.url,
          destination_path: path_to_temp_file,
          max_file_size_in_mo: upload_max_file_size_in_mo,
        });

        const fileData = {
          originalFilename: downloadResult.filename,
          path_to_temp_file: downloadResult.path,
        };

        return {
          fileData,
          additional_meta,
          importType: "downloaded from URL",
        };
      } else {
        // Regular meta-only import
        return {
          fileData: null,
          additional_meta,
          importType: null,
        };
      }
    } else {
      // Regular file upload

      const {
        originalFilename,
        path_to_temp_file,
        user_additional_meta: _additional_meta,
      } = await utils
        .handleForm({
          path_to_folder,
          req,
          upload_max_file_size_in_mo,
        })
        .catch((err) => {
          if (err === "file_size_limit_exceeded") {
            const err = new Error("File size limit exceeded");
            err.code = "file_size_limit_exceeded";
            err.err_infos = {
              upload_max_file_size_in_mo,
            };
            throw err;
          } else {
            dev.error(`Failed to handle form`, err);
            const err = new Error("Failed to save file");
            err.code = "failed_to_save_file";
            throw err;
          }
        });

      return {
        fileData: {
          originalFilename,
          path_to_temp_file,
        },
        additional_meta: _additional_meta,
        importType: "uploaded",
      };
    }
  }

  return API;
})();
