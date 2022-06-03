const path = require("path"),
  fs = require("fs-extra"),
  formidable = require("formidable");

const utils = require("./utils"),
  thumbs = require("./thumbs");

module.exports = (function () {
  const API = {
    createMedia: async ({ req, folder_type, folder_slug }) => {
      dev.logfunction({ folder_type, folder_slug });

      _handleForm({ req, folder_type, folder_slug });

      // generate unique slug from time, or use meta.requested_folder_name
      // let folder_slug = new_meta.requested_folder_name
      //   ? new_meta.requested_folder_name
      //   : `untitled-${folder_type}`;
    },
  };

  async function _handleForm({ req, folder_type, folder_slug }) {
    dev.logfunction({ folder_type, folder_slug });

    let form = new formidable.IncomingForm();
    form.multiples = false;
    form.maxFileSize = global.settings.maxFileSizeForUpload * 1024 * 1024;

    let socketid = "";

    // store all uploads in the folder directory
    const folder_path = utils.getPathToUserContent(
      global.settings.schema[folder_type].path,
      folder_slug
    );
    form.uploadDir = folder_path;

    let all_files_meta = [];
    let field_values = {};
    form.on("field", (name, value) => {
      if (name === "socketid") socketid = value;
      try {
        field_values[name] = JSON.parse(value);
      } catch (e) {}
    });

    // every time a file has been uploaded successfully,
    form.on("file", (field, uploadedFile) => {
      dev.logverbose(
        `File uploaded: – field: ${field} – file: ${JSON.stringify(
          uploadedFile,
          null,
          4
        )}.`
      );
      let newFile = uploadedFile;
      for (let fileName in field_values) {
        if (fileName === newFile.name) {
          newFile = Object.assign({}, newFile, {
            additionalMeta: field_values[fileName],
          });
        }
      }
      all_files_meta.push(newFile);
    });

    form
      .on("error", (err) => {
        throw err;
      })
      .on("aborted", (err) => {
        throw err;
      });

    form.once("end", async () => {
      dev.logverbose(`All files downloaded ${all_files_meta.length}`);
      if (all_files_meta.length === 0)
        throw { message: "No file meta to parse" };

      let meta_filenames = [];
      for (var i in all_files_meta) {
        let metaFileName = await _renameUploadedFile({
          folder_path,
          file_meta: all_files_meta[i],
        }).catch((err) => {
          throw err;
        });
        // dev.logverbose(`Following filename is available: ${newFileName}`);

        // if (fileMeta.hasOwnProperty("additionalMeta")) {
        //   dev.logverbose(
        //     `Has additional meta: ${JSON.stringify(
        //       fileMeta.additionalMeta,
        //       null,
        //       4
        //     )}`
        //   );
        // } else {
        //   fileMeta.additionalMeta = {};
        // }

        // // try {
        // //   newFileName = await file.convertAndSaveMedia({
        // //     uploadDir,
        // //     tempPath: fileMeta.filepath,
        // //     newFileName,
        // //     socketid,
        // //   });
        // // } catch (err) {
        // //   throw err;
        // // }

        // fileMeta.additionalMeta.media_filename = newFileName;

        // // create media meta here
        // // const metaFileName = await sockets.createMediaMeta({
        // //   folder_type,
        // //   folder_slug,
        // //   additionalMeta: fileMeta.additionalMeta,
        // // });

        // return metaFileName;

        meta_filenames.push(metaFileName);
      }

      return {
        meta_filenames,
      };
    });

    // parse the incoming request containing the form data
    form.parse(req);
  }

  async function _renameUploadedFile({ folder_path, file_meta }) {
    dev.logfunction({ folder_path, file_meta });

    // get original filename
    let original_filename = file_meta.originalFilename;

    // check if available, create new name if necessary
    new_filename = await _preventFileOverride({
      folder_path,
      original_filename,
    });

    const new_path = path.join(folder_path, new_filename);

    try {
      await fs.move(file_meta.filepath, new_path, { overwrite: false });
      return;
    } catch (err) {
      throw err;
    }
  }

  async function _preventFileOverride({ folder_path, original_filename }) {
    dev.logfunction({ folder_path, original_filename });

    let all_files_and_folders_names_without_ext = (
      await fs.readdir(folder_path, { withFileTypes: true })
    ).map((item) => path.parse(item.name).name);

    dev.logfunction({ all_files_and_folders_names_without_ext });

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
