const path = require("path"),
  fs = require("fs-extra"),
  { IncomingForm } = require("formidable");

const utils = require("./utils"),
  thumbs = require("./thumbs");

module.exports = (function () {
  const API = {
    createMedia: async ({ req, folder_type, folder_slug }) => {
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

      await utils.saveMetaAtPath({
        folder_type,
        folder_slug,
        file_slug: filename + ".txt",
        meta,
      });

      // make meta for file
    },
  };

  function _handleForm({ req, folder_type, folder_slug }) {
    dev.logfunction({ folder_type, folder_slug });
    return new Promise((resolve, reject) => {
      const folder_path = utils.getPathToUserContent(
        global.settings.schema[folder_type].path,
        folder_slug
      );

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

        let { new_path, new_filename } = await _renameUploadedFile({
          folder_path,
          originalFilename: file.originalFilename,
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
      // TODO fs stat
      // await fs.stat(filepath);
    }

    new_meta.date_uploaded = new_meta.date_modified = utils.getCurrentDate();

    new_meta.media_filename = filename;

    // set correct file type from additional meta or filename
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
        new_meta.type = "text";
        break;
      // case ".ino":
      //   additionalMeta.type = "code";
      //   break;
      case ".pdf":
        new_meta.type = "document";
        break;
    }
    dev.logfunction(`Type determined to be ${new_meta.type}`);

    return new_meta;
  }

  return API;
})();
