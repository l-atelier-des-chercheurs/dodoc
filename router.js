const path = require('path'),
  fs = require('fs-extra'),
  formidable = require('formidable'),
  archiver = require('archiver');

const settings = require('./settings.json'),
  sockets = require('./core/sockets'),
  dev = require('./core/dev-log'),
  cache = require('./core/cache'),
  api = require('./core/api'),
  file = require('./core/file'),
  exporter = require('./core/exporter');

module.exports = function(app, io, m) {
  /**
   * routing event
   */
  app.get('/', showIndex);
  app.get('/:project', loadFolderOrMedia);
  app.get('/:project/media/:metaFileName', loadFolderOrMedia);
  app.get('/publication/:publication', printPublication);
  app.get('/publication/web/:publication', exportPublication);
  app.get('/publication/print/:pdfName', showPDF);
  app.post('/:project/file-upload', postFile2);

  /**
   * routing functions
   */
  function generatePageData(req) {
    return new Promise(function(resolve, reject) {
      let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageData = {};

      pageData.pageTitle = 'do•doc 2';
      // full path on the storage space, as displayed in the footer
      pageData.folderPath = api.getFolderPath();
      pageData.slugProjectName = '';
      pageData.url = req.path;
      pageData.protocol = req.protocol;
      pageData.structure = settings.structure;
      pageData.authorsFolder = settings.structure.authors.path;
      pageData.isDebug = dev.isDebug();

      pageData.mode = 'live';

      resolve(pageData);
    });
  }

  // GET
  function showIndex(req, res) {
    generatePageData(req).then(
      pageData => {
        dev.logpackets(
          `Rendering index with data `,
          JSON.stringify(pageData, null, 4)
        );
        res.render('index', pageData);
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function loadFolderOrMedia(req, res) {
    let slugProjectName = req.param('project');
    let metaFileName = req.param('metaFileName');

    generatePageData(req).then(
      pageData => {
        // let’s make sure that folder exists first and return some meta
        file
          .getFolder({ type: 'projects', slugFolderName: slugProjectName })
          .then(
            foldersData => {
              pageData.slugProjectName = slugProjectName;
              pageData.folderAndMediaData = foldersData;
              if (metaFileName) {
                pageData.metaFileName = metaFileName;
              }
              res.render('index', pageData);
            },
            (err, p) => {
              dev.error(`Failed to get folder: ${err}`);
              pageData.noticeOfError = 'failed_to_find_folder';
              res.render('index', pageData);
            }
          )
          .catch(err => {
            dev.error('No folder found');
          });
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function exportFolder(req, res) {
    let slugProjectName = req.param('project');
    generatePageData(req).then(pageData => {
      // get medias for a folder
      file
        .getFolder({ type: 'projects', slugFolderName: slugProjectName })
        .then(
          foldersData => {
            file.gatherAllMedias(slugProjectName).then(
              mediasData => {
                // recreate full object
                foldersData[slugProjectName].medias = mediasData;
                pageData.folderAndMediaData = foldersData;
                pageData.mode = 'export';

                res.render('index', pageData, (err, html) => {
                  exporter.copyWebsiteContent({ html, slugProjectName }).then(
                    cachePath => {
                      var archive = archiver('zip');

                      archive.on('error', function(err) {
                        res.status(500).send({ error: err.message });
                      });

                      //on stream closed we can end the request
                      archive.on('end', function() {
                        dev.log('Archive wrote %d bytes', archive.pointer());
                      });

                      //set the archive name
                      res.attachment(slugProjectName + '.zip');

                      //this is the streaming magic
                      archive.pipe(res);

                      archive.directory(cachePath, false);

                      archive.finalize();
                    },
                    (err, p) => {
                      dev.error('Failed while preparing/making a web export');
                    }
                  );
                });
              },
              (err, p) => {
                dev.error(`Failed to gather medias: ${err}`);
                pageData.noticeOfError = 'failed_to_find_folder';
                res.render('index', pageData);
              }
            );
          },
          (err, p) => {
            dev.error(`Failed to get folder: ${err}`);
            pageData.noticeOfError = 'failed_to_find_folder';
            res.render('index', pageData);
          }
        )
        .catch(err => {
          dev.error('No folder found');
        });
    });
  }

  function printPublication(req, res) {
    loadPublication(req, res).then(pageData => {
      pageData.mode = 'print_publication';
      res.render('index', pageData);
    });
  }

  function exportPublication(req, res) {
    let slugPubliName = req.param('publication');

    loadPublication(req, res).then(pageData => {
      pageData.mode = 'export_publication';
      res.render('index', pageData, (err, html) => {
        exporter
          .copyPubliContent({
            html,
            folders_and_medias: pageData.folderAndMediaData,
            slugPubliName
          })
          .then(
            cachePath => {
              var archive = archiver('zip');

              archive.on('error', function(err) {
                res.status(500).send({ error: err.message });
              });

              //on stream closed we can end the request
              archive.on('end', function() {
                dev.log('Archive wrote %d bytes', archive.pointer());
              });

              //set the archive name
              res.attachment(slugPubliName + '.zip');

              //this is the streaming magic
              archive.pipe(res);

              archive.directory(cachePath, false);

              archive.finalize();
            },
            (err, p) => {
              dev.error('Failed while preparing/making a web export');
            }
          );
      });
    });
  }

  function showPDF(req, res) {
    let pdfName = req.param('pdfName');
    const cachePath = path.join(
      global.tempStorage,
      settings.cacheDirname,
      '_publications'
    );
    const pdfPath = path.join(cachePath, pdfName);

    res.download(pdfPath, pdfName, function(err) {
      if (err) {
      } else {
      }
    });
  }

  function loadPublication(req, res) {
    return new Promise((resolve, reject) => {
      let slugPubliName = req.param('publication');
      let slugFolderName = slugPubliName;
      let type = 'publications';

      let publi_and_medias = {};

      generatePageData(req).then(pageData => {
        // get publication
        file
          .getFolder({
            type,
            slugFolderName
          })
          .then(publiData => {
            publi_and_medias = publiData;
            file
              .getMediaMetaNames({
                type,
                slugFolderName
              })
              .then(list_metaFileName => {
                let medias_list = list_metaFileName.map(metaFileName => {
                  return {
                    slugFolderName,
                    metaFileName
                  };
                });
                file
                  .readMediaList({
                    type,
                    medias_list
                  })
                  .then(publi_medias => {
                    dev.logverbose(
                      `Got medias, now sending to the right clients`
                    );
                    publi_and_medias[slugFolderName].medias =
                      publi_medias[slugFolderName].medias;
                    pageData.publiAndMediaData = publi_and_medias;

                    // we need to get the list of original medias in the publi
                    var list_of_linked_medias = [];

                    Object.entries(publi_medias[slugFolderName].medias).forEach(
                      ([key, value]) => {
                        list_of_linked_medias.push({
                          slugFolderName: value.slugProjectName,
                          metaFileName: value.slugMediaName
                        });
                      }
                    );

                    file
                      .readMediaList({
                        type: 'projects',
                        medias_list: list_of_linked_medias
                      })
                      .then(folders_and_medias => {
                        pageData.folderAndMediaData = folders_and_medias;
                        resolve(pageData);
                      });
                  });
              });
          });
      });
    });
  }

  function postFile2(req, res) {
    let slugProjectName = req.param('project');
    dev.logverbose(`Will add new media for folder ${slugProjectName}`);

    // create an incoming form object
    var form = new formidable.IncomingForm();

    // specify that we want to allow the user to upload multiple files in a single request
    form.multiples = false;
    form.maxFileSize = 1000 * 1024 * 1024;

    // store all uploads in the folder directory
    form.uploadDir = api.getFolderPath(slugProjectName);

    let allFilesMeta = [];

    let fieldValues = {};
    form.on('field', function(name, value) {
      console.log(`Got field with name = ${name} and value = ${value}.`);
      try {
        fieldValues[name] = JSON.parse(value);
      } catch (e) {
        // didn’t get an object as additional meta
      }
    });

    // every time a file has been uploaded successfully,
    form.on('file', function(field, file) {
      dev.logverbose(
        `File uploaded:\nfield: ${field}\nfile: ${JSON.stringify(
          file,
          null,
          4
        )}.`
      );
      // add addiontal meta from 'field' to the array
      let newFile = file;
      for (let fileName in fieldValues) {
        if (fileName === file.name) {
          newFile = Object.assign({}, file, {
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
      if (allFilesMeta.length > 0) {
        var m = [];
        for (var i in allFilesMeta) {
          m.push(
            renameMediaAndCreateMeta(
              form.uploadDir,
              slugProjectName,
              allFilesMeta[i]
            )
          );
        }
        Promise.all(m).then(() => {
          let msg = {};
          msg.msg = 'success';
          //           msg.medias = JSON.stringify(allFilesMeta);
          res.end(JSON.stringify(msg));
        });
      }
    });

    // parse the incoming request containing the form data
    form.parse(req);
  }

  function renameMediaAndCreateMeta(uploadDir, slugProjectName, fileMeta) {
    return new Promise(function(resolve, reject) {
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

          let newPathToNewFileName = path.join(uploadDir, newFileName);
          fs.renameSync(fileMeta.path, newPathToNewFileName);

          fileMeta.additionalMeta.media_filename = newFileName;
          sockets.createMediaMeta({
            type: 'projects',
            slugFolderName: slugProjectName,
            additionalMeta: fileMeta.additionalMeta
          });
          resolve();
        },
        function(err) {
          reject(err);
        }
      );
    });
  }
};
