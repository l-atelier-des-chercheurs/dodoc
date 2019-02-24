const formidable = require('formidable');

const api = require('./api'),
  file = require('./file'),
  sockets = require('./sockets'),
  dev = require('./dev-log');

module.exports = (function() {
  const API = {
    handleForm: ({ req, res, type, slugFolderName }) => {
      return new Promise(function(resolve, reject) {
        dev.logfunction(
          `IMPORTER — handleForm : type = ${type}, slugFolderName = ${slugFolderName}`
        );

        // create an incoming form object
        var form = new formidable.IncomingForm();

        // specify that we want to allow the user to upload multiple files in a single request
        form.multiples = false;
        form.maxFileSize = global.settings.maxFileSizeForUpload * 1024 * 1024;
        let socketid = '';

        // store all uploads in the folder directory
        form.uploadDir = api.getFolderPath(slugFolderName);

        let allFilesMeta = [];

        let fieldValues = {};
        form.on('field', function(name, value) {
          console.log(`Got field with name = ${name} and value = ${value}.`);
          if (name === 'socketid') {
            socketid = value;
          }

          try {
            fieldValues[name] = JSON.parse(value);
          } catch (e) {
            // didn’t get an object as additional meta
          }
        });

        // every time a file has been uploaded successfully,
        form.on('file', function(field, uploadedFile) {
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
                additionalMeta: fieldValues[fileName]
              });
            }
          }
          //       dev.logverbose(`Found matching filenames, new meta file is: ${JSON.stringify(newFile,null,4)}`);
          allFilesMeta.push(newFile);
        });

        // log any errors that occur
        form.on('error', function(err) {
          console.log(`An error has happened: ${err}`);
        });
        form.on('aborted', function(err) {
          console.log(`File upload aborted: ${err}`);
        });

        // once all the files have been uploaded
        form.on('end', function() {
          let msg = {};
          msg.msg = 'success';
          //           msg.medias = JSON.stringify(allFilesMeta);
          res.end(JSON.stringify(msg));

          if (allFilesMeta.length > 0) {
            var m = [];
            for (var i in allFilesMeta) {
              m.push(
                renameAndConvertMediaAndCreateMeta({
                  uploadDir: form.uploadDir,
                  slugFolderName,
                  fileMeta: allFilesMeta[i],
                  socketid,
                  type
                })
              );
            }
            Promise.all(m).then(() => {
              resolve();
            });
          }
        });

        // parse the incoming request containing the form data
        form.parse(req);
      });
    }
  };

  function renameAndConvertMediaAndCreateMeta({
    uploadDir,
    slugFolderName,
    fileMeta,
    socketid,
    type
  }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction('IMPORTER — renameAndConvertMediaAndCreateMeta');
      api.findFirstFilenameNotTaken(uploadDir, fileMeta.name).then(
        function(newFileName) {
          dev.logverbose(`Following filename is available: ${newFileName}`);

          if (fileMeta.hasOwnProperty('additionalMeta')) {
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

          file
            .convertAndSaveMedia({
              uploadDir,
              tempPath: fileMeta.path,
              newFileName,
              socketid
            })
            .then(newFileName => {
              fileMeta.additionalMeta.media_filename = newFileName;
              sockets.createMediaMeta({
                type,
                slugFolderName,
                additionalMeta: fileMeta.additionalMeta
              });
              resolve();
            })
            .catch(err => {
              dev.error(err);
              fileMeta.additionalMeta.media_filename = newFileName;
              sockets.createMediaMeta({
                type,
                slugFolderName,
                additionalMeta: fileMeta.additionalMeta
              });
              resolve();
            });
        },
        function(err) {
          reject(err);
        }
      );
    });
  }

  return API;
})();
