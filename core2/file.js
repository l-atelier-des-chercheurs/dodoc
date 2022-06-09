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

      const file_meta = await _handleForm({
        req,
        folder_type,
        folder_slug,
      }).catch((err) => {
        dev.error(`Failed to handle form`, err);
      });

      dev.log(`New file uploaded to`, { folder_type }, { folder_slug });
      dev.logverbose(JSON.stringify(file_meta, null, 4));

      // file_meta.media_filename;
      // file_meta.file_meta.additional_meta; // custom meta from FE

      let new_meta;
      if (file_meta.file_meta.additional_meta)
        new_meta = file_meta.file_meta.additional_meta;

      console.log(JSON.stringify(new_meta, null, 4));

      let valid_meta = utils.validateMeta({
        fields: global.settings.schema[folder_type].files.fields,
        new_meta,
      });

      // use fileCreationDate
      if (new_meta.fileCreationDate)
        valid_meta.date_created = utils.parseDate(new_meta.fileCreationDate);

      valid_meta.date_uploaded = valid_meta.date_modified =
        utils.getCurrentDate();

      valid_meta.media_filename = file_meta.media_filename;

      // more fields : add file uploaded date, add type of media field
      // file-specific metas will be added when getting files, the same as thumbs, and stored alongside

      await utils.saveMetaAtPath({
        folder_type,
        folder_slug,
        file_slug: valid_meta.media_filename + ".txt",
        meta: valid_meta,
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
      let file_meta = {};

      form.on("field", (name, value) => {
        dev.logverbose(`Field gotten`, name, value);
        file_meta.additional_meta = JSON.parse(value);

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
        file_meta.file = uploadedFile;
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
        dev.logverbose({ file_meta });
        if (!file_meta.file || !file_meta.file.filepath)
          throw { message: "No file meta to parse" };

        let media_filename = await _renameUploadedFile({
          folder_path,
          originalFilename: file_meta.file.originalFilename,
          filepath: file_meta.file.filepath,
        }).catch((err) => {
          return reject(err);
        });
        dev.logverbose({ file_meta });

        return resolve({
          media_filename,
          file_meta,
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
      return new_filename;
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

  return API;
})();
