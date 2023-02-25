const formidable = require("formidable"),
  path = require("path");

const api = require("./api"),
  file = require("./file"),
  sockets = require("./sockets"),
  dev = require("./dev-log");

module.exports = (function () {
  const API = {
    handleForm: ({ req, type, slugFolderName }) => {
      return new Promise(function (resolve, reject) {
        dev.logfunction(
          `IMPORTER — handleForm : type = ${type}, slugFolderName = ${slugFolderName}`
        );

        // create an incoming form object
        const form = formidable({
          multiples: false,
          maxFileSize: global.settings.maxFileSizeForUpload * 1024 * 1024,
        });

        let socketid = "";

        // store all uploads in the folder directory
        let slugFolderPath = api.getFolderPath(
          path.join(global.settings.structure[type].path, slugFolderName)
        );
        form.uploadDir = slugFolderPath;

        let allFilesMeta = [];

        let fieldValues = {};
        form.on("field", function (name, value) {
          console.log(`Got field with name = ${name} and value = ${value}.`);
          if (name === "socketid") {
            socketid = value;
          }

          try {
            fieldValues[name] = JSON.parse(value);
          } catch (e) {
            // didn’t get an object as additional meta
          }
        });

        // every time a file has been uploaded successfully,
        form.on("file", function (field, uploadedFile) {
          dev.logverbose(
            `File uploaded:\nfield: ${field}\nfile: ${JSON.stringify(
              uploadedFile,
              null,
              4
            )}.`
          );
          // add addiontal meta from 'field' to the array
          let newFile = uploadedFile;
          for (let fileName in fieldValues) {
            if (fileName === newFile.name) {
              newFile = Object.assign({}, newFile, {
                additionalMeta: fieldValues[fileName],
              });
            }
          }
          //       dev.logverbose(`Found matching filenames, new meta file is: ${JSON.stringify(newFile,null,4)}`);
          allFilesMeta.push(newFile);
        });

        // log any errors that occur
        form.on("error", function (err) {
          console.log(`An error has happened: ${err}`);
          return reject(err);
        });
        form.on("aborted", function (err) {
          console.log(`File upload aborted: ${err}`);
          return reject(err);
        });

        // once all the files have been uploaded
        form.once("end", async function () {
          dev.logverbose(`All files downloaded ${allFilesMeta.length}`);

          if (allFilesMeta.length === 0)
            return reject(new Error("No file meta to parse"));

          let metaFileNames = [];

          for (var i in allFilesMeta) {
            let metaFileName = await renameAndConvertMediaAndCreateMeta({
              uploadDir: form.uploadDir,
              slugFolderName,
              fileMeta: allFilesMeta[i],
              socketid,
              type,
            }).catch((err) => {
              dev.error(`Failed to rename/convert media: ${err}`);
              return reject(err);
            });
            metaFileNames.push(metaFileName);
          }

          return resolve({
            msg: {
              msg: "success",
              metaFileNames,
            },
          });
        });

        // parse the incoming request containing the form data
        form.parse(req);
      });
    },
  };

  async function renameAndConvertMediaAndCreateMeta({
    uploadDir,
    slugFolderName,
    fileMeta,
    socketid,
    type,
  }) {
    dev.logfunction(`IMPORTER — renameAndConvertMediaAndCreateMeta`);

    let newFileName = fileMeta.originalFilename;
    try {
      newFileName = await api.findFirstFilenameNotTaken(uploadDir, newFileName);
    } catch (err) {
      throw err;
    }

    dev.logverbose(`Following filename is available: ${newFileName}`);

    if (fileMeta.hasOwnProperty("additionalMeta")) {
      dev.logverbose(
        `Has additional meta: ${JSON.stringify(
          fileMeta.additionalMeta,
          null,
          4
        )}`
      );
    } else {
      fileMeta.additionalMeta = {};
    }

    try {
      newFileName = await file.convertAndSaveMedia({
        uploadDir,
        tempPath: fileMeta.filepath,
        newFileName,
        socketid,
      });
    } catch (err) {
      throw err;
    }

    fileMeta.additionalMeta.media_filename = newFileName;
    const metaFileName = await sockets.createMediaMeta({
      type,
      slugFolderName,
      additionalMeta: fileMeta.additionalMeta,
    });

    return metaFileName;
  }

  return API;
})();
