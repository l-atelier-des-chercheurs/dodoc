const path = require("path"),
  fs = require("fs-extra"),
  { IncomingForm } = require("formidable");

const utils = require("./utils"),
  thumbs = require("./thumbs"),
  cache = require("./cache");

module.exports = (function () {
  const API = {
    importFile: async ({ req, folder_type, folder_slug }) => {
      dev.logfunction({ folder_type, folder_slug });

      if (!global.settings.schema[folder_type].hasOwnProperty("files"))
        dev.error(`no files allowed on ${folder_type}`);

      const { filename, filepath, additional_meta } = await _handleForm({
        req,
        folder_type,
        folder_slug,
      }).catch((err) => {
        dev.error(`Failed to handle form`, err);
      });

      dev.log(`New file uploaded to`, { folder_type }, { folder_slug });
      dev.logverbose({ filename, filepath, additional_meta });

      const extracted_meta = await _extractAdditionalMetaFromFile({
        additional_meta,
        filename,
        filepath,
      });

      // user added meta
      const valid_meta = utils.validateMeta({
        fields: global.settings.schema[folder_type].files.fields,
        new_meta: additional_meta,
      });

      const meta = Object.assign({}, valid_meta, extracted_meta);

      // file-specific metas will be added when getting files, the same as thumbs, and stored alongside
      // - date created

      const meta_filename = filename + ".meta.txt";

      await utils.saveMetaAtPath({
        folder_type,
        folder_slug,
        file_slug: meta_filename,
        meta,
      });

      return meta_filename;
    },

    getFiles: async ({ folder_type, folder_slug }) => {
      dev.logfunction({ folder_type, folder_slug });

      const meta_filenames = await _getMetasInFolder({
        folder_type,
        folder_slug,
      });

      // no caching here to get more flexibility with lru cache (busting medias with few access, etc.)

      const metas = [];
      for (const meta_filename of meta_filenames) {
        try {
          dev.logverbose(`reading ${meta_filename}`);

          const meta = await API.getFile({
            folder_type,
            folder_slug,
            meta_filename,
          });

          metas.push(meta);
        } catch (err) {
          dev.error(err);
        }
      }

      // generate thumb if necessary (media_filename or link)
      return metas;
    },
    getFile: async ({ folder_type, folder_slug, meta_filename }) => {
      dev.logfunction({ folder_type, folder_slug, meta_filename });

      const d = cache.get({
        key: `${folder_type}/${folder_slug}/${meta_filename}`,
      });
      if (d) return d;

      let meta = await utils.readMetaFile(
        folder_type,
        folder_slug,
        meta_filename
      );
      meta.slug = meta_filename;

      if (meta.media_filename.endsWith("txt"))
        meta.content = await utils.readFileContent(
          folder_type,
          folder_slug,
          meta.media_filename
        );

      const _thumbs = await thumbs
        .makeThumbForMedia({
          media_type: meta.type,
          media_filename: meta.media_filename,
          folder_type,
          folder_slug,
        })
        .catch((err) => {
          dev.error(err);
        });
      if (_thumbs) meta.thumbs = _thumbs;

      const infos = await thumbs.getInfosForFile({
        media_type: meta.type,
        media_filename: meta.media_filename,
        folder_type,
        folder_slug,
      });
      if (infos) meta.infos = infos;

      cache.set({
        key: `${folder_type}/${folder_slug}/${meta_filename}`,
        value: meta,
      });

      return meta;
    },
    getArchives: async ({ folder_type, folder_slug, meta_filename }) => {
      dev.logfunction({ folder_type, folder_slug, meta_filename });
      return await _readArchives({
        folder_type,
        folder_slug,
        meta_filename,
      });
    },

    updateFile: async ({ folder_type, folder_slug, meta_slug, data }) => {
      dev.logfunction({ folder_type, folder_slug, meta_slug, data });

      let meta = await utils.readMetaFile(folder_type, folder_slug, meta_slug);
      const previous_meta = { ...meta };

      let { content, ...new_meta } = data;

      // update meta file
      if (new_meta) {
        const clean_meta = _cleanNewMeta({
          folder_type,
          new_meta,
        });
        Object.assign(meta, clean_meta);
      }

      if (typeof content !== "undefined") {
        if (typeof content !== "string")
          throw new Error("Content (text) is not a string");

        // check if content is different from previous content, return early if that's the case
        const previous_content = await utils.readFileContent(
          folder_type,
          folder_slug,
          meta.media_filename
        );
        if (previous_content === content)
          throw new Error("content not changed");

        dev.logfunction(
          `Content is supposed to be updated`,
          { previous_content },
          { content },
          { type: meta.type },
          { media_filename: meta.media_filename }
        );

        if (global.settings.versioning === true)
          _archiveVersion({
            folder_type,
            folder_slug,
            media_filename: meta.media_filename,
          });

        // TODO update media (text, image, etc.)
        if (meta.type === "text")
          await utils
            .saveMetaAtPath({
              folder_type,
              folder_slug,
              file_slug: meta.media_filename,
              meta: content,
            })
            .catch((err) => {
              throw err;
            });

        // TODO remove thumbs
      }

      meta.date_modified = utils.getCurrentDate();
      await utils.saveMetaAtPath({
        folder_type,
        folder_slug,
        file_slug: meta_slug,
        meta,
      });

      // dev.log({ meta, previous_meta });
      const changed_data = Object.keys(meta).reduce((acc, key) => {
        if (JSON.stringify(meta[key]) !== JSON.stringify(previous_meta[key]))
          acc[key] = meta[key];
        return acc;
      }, {});

      if (typeof content !== "undefined") changed_data.content = content;

      cache.delete({
        key: `${folder_type}/${folder_slug}/${meta_slug}`,
      });

      return changed_data;
    },

    removeFile: async ({ folder_type, folder_slug, meta_slug }) => {
      dev.logfunction({ folder_type, folder_slug, meta_slug });

      try {
        // todo remove file thumbs
        await thumbs.removeFileThumbs({ folder_type, folder_slug, meta_slug });

        if (global.settings.removePermanently === true)
          await _removeFileForGood({ folder_type, folder_slug, meta_slug });
        else await _moveFileToBin({ folder_type, folder_slug, meta_slug });

        cache.delete({
          key: `${folder_type}/${folder_slug}/${meta_slug}`,
        });

        return folder_slug;
      } catch (err) {
        throw err;
      }
    },
  };

  function _handleForm({ req, folder_type, folder_slug }) {
    dev.logfunction({ folder_type, folder_slug });
    return new Promise((resolve, reject) => {
      const folder_path = utils.getPathToUserContent(folder_type, folder_slug);

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
          `File uploaded: – field: ${field} – file: ${JSON.stringify(
            uploadedFile
          )}.`
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
        dev.logverbose(`Files downloaded`);
        dev.logverbose({ file });

        if (!file || !file.filepath) throw { message: "No file meta to parse" };

        // make url-compatible media filenames
        const { name, ext } = path.parse(file.originalFilename);
        const slugged_original_filename = utils.slug(name) + ext;

        let { new_path, new_filename } = await _renameUploadedFile({
          folder_path,
          originalFilename: slugged_original_filename,
          filepath: file.filepath,
        }).catch((err) => {
          return reject(err);
        });

        return resolve({
          filename: new_filename,
          filepath: new_path,
          additional_meta,
        });
      });

      form.parse(req);
    });
  }

  async function _renameUploadedFile({
    folder_path,
    originalFilename,
    filepath,
  }) {
    dev.logfunction({ folder_path, originalFilename, filepath });

    // get original filename
    let original_filename = originalFilename;

    // check if available, create new name if necessary
    new_filename = await _preventFileOverride({
      folder_path,
      original_filename,
    });

    const new_path = path.join(folder_path, new_filename);

    try {
      await fs.move(filepath, new_path, { overwrite: false });
      return { new_path, new_filename };
    } catch (err) {
      throw err;
    }
  }

  async function _preventFileOverride({ folder_path, original_filename }) {
    dev.logfunction({ folder_path, original_filename });

    let all_files_and_folders_names_without_ext = (
      await fs.readdir(folder_path, { withFileTypes: true })
    ).map((item) => path.parse(item.name).name);

    dev.logverbose({ all_files_and_folders_names_without_ext });

    if (all_files_and_folders_names_without_ext.length === 0)
      return original_filename;

    let index = 0;
    let original_filename_without_ext = path.parse(original_filename).name;
    let new_filename_without_ext = original_filename_without_ext;
    let ext = path.parse(original_filename).ext;

    while (
      all_files_and_folders_names_without_ext.includes(new_filename_without_ext)
    ) {
      index++;
      new_filename_without_ext = `${original_filename_without_ext}-${index}`;
    }
    return new_filename_without_ext + ext;
  }

  async function _extractAdditionalMetaFromFile({
    additional_meta,
    filename,
    filepath,
  }) {
    dev.logfunction();

    let new_meta = {};

    // use fileCreationDate
    if (additional_meta.fileCreationDate)
      new_meta.date_created = utils.parseDate(additional_meta.fileCreationDate);
    else {
      // TODO fs stat ?
      // await fs.stat(filepath);
    }

    new_meta.date_uploaded = new_meta.date_modified = utils.getCurrentDate();

    new_meta.media_filename = filename;

    if (additional_meta.type) {
      new_meta.type = additional_meta.type;
    } else {
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
          new_meta.type = "image";
          break;
        case ".mp4":
        case ".flv":
        case ".mov":
        case ".webm":
        case ".avi":
          new_meta.type = "video";
          break;
        case ".stl":
          new_meta.type = "stl";
          break;
        case ".mp3":
        case ".wav":
        case ".m4a":
        case ".ogg":
          new_meta.type = "audio";
          break;
        case ".md":
        case ".rtf":
        case ".txt":
          new_meta.type = "text";
          break;
        case ".pdf":
          new_meta.type = "document";
          break;
        default:
          new_meta.type = "other";
      }
      dev.logfunction(`Type determined to be ${new_meta.type}`);
    }

    return new_meta;
  }

  async function _getMetasInFolder({ folder_type, folder_slug }) {
    dev.logfunction({ folder_type, folder_slug });

    const folder_path = utils.getPathToUserContent(folder_type, folder_slug);

    try {
      let files = (await fs.readdir(folder_path, { withFileTypes: true }))
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

  async function _removeFileForGood({ folder_type, folder_slug, meta_slug }) {
    const _all_file_paths = await _getAllFilesRelatedToMeta({
      folder_type,
      folder_slug,
      meta_slug,
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

  async function _moveFileToBin({ folder_type, folder_slug, meta_slug }) {
    const _all_file_paths = await _getAllFilesRelatedToMeta({
      folder_type,
      folder_slug,
      meta_slug,
    });

    try {
      for (const file_path of _all_file_paths) {
        var path_in_bin = file_path.replace(
          path.join(folder_type, folder_slug),
          path.join(folder_type, folder_slug, global.settings.deletedFolderName)
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

  async function _getAllFilesRelatedToMeta({
    folder_type,
    folder_slug,
    meta_slug,
  }) {
    let paths = [];

    const full_meta_path = utils.getPathToUserContent(
      folder_type,
      folder_slug,
      meta_slug
    );
    paths.push(full_meta_path);

    let meta = await utils.readMetaFile(folder_type, folder_slug, meta_slug);
    const media_filename = meta.media_filename;

    const full_media_path = utils.getPathToUserContent(
      folder_type,
      folder_slug,
      media_filename
    );
    paths.push(full_media_path);

    const archive_folder_name = path.parse(media_filename).name + "_archives";
    const full_archive_path = utils.getPathToUserContent(
      folder_type,
      folder_slug,
      archive_folder_name
    );
    paths.push(full_archive_path);

    dev.logfunction({ paths });

    return paths;
  }

  function _cleanNewMeta({ folder_type, new_meta }) {
    dev.logfunction({ folder_type, new_meta });

    global.settings.schema[folder_type].files.fields;

    // check fields that exist in schema
    // TODO

    // prevent editing fields such as date_created

    return new_meta;
  }

  async function _archiveVersion({ folder_type, folder_slug, media_filename }) {
    dev.logfunction(arguments[0]);
    const media_path = utils.getPathToUserContent(
      folder_type,
      folder_slug,
      media_filename
    );

    const archive_folder_name = path.parse(media_filename).name + "_archives";
    const archived_folder_path = utils.getPathToUserContent(
      folder_type,
      folder_slug,
      archive_folder_name
    );
    await fs.ensureDir(archived_folder_path);

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
        archived_folder_path,
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
  async function _readArchives({ folder_type, folder_slug, meta_filename }) {
    dev.logfunction(arguments[0]);

    let meta = await utils.readMetaFile(
      folder_type,
      folder_slug,
      meta_filename
    );

    const archive_folder_name =
      path.parse(meta.media_filename).name + "_archives";
    const archived_folder_path = utils.getPathToUserContent(
      folder_type,
      folder_slug,
      archive_folder_name
    );

    // get a list of all files in archives folder

    // if .txt, read content

    // return an array
    /*
    [
      {
        filename: "some-numbers.txt",
        content: "Hello\nWorld"
      },
      …
    ]
    */

    try {
      let filenames = (
        await fs.readdir(archived_folder_path, { withFileTypes: true })
      )
        .filter((dirent) => !dirent.isDirectory())
        .map((dirent) => dirent.name);
      dev.logfunction({ filenames });

      const files_content = [];
      for (const filename of filenames) {
        const content = await utils.readFileContent(
          folder_type,
          folder_slug,
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

  return API;
})();
