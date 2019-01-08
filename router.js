const path = require('path'),
  fs = require('fs-extra'),
  archiver = require('archiver');

const settings = require('./settings.json'),
  sockets = require('./core/sockets'),
  dev = require('./core/dev-log'),
  cache = require('./core/cache'),
  api = require('./core/api'),
  file = require('./core/file'),
  exporter = require('./core/exporter'),
  importer = require('./core/importer');

module.exports = function(app) {
  /**
   * routing event
   */
  app.get('/', showIndex);
  app.get('/:project', loadFolderOrMedia);
  app.get('/:project/media/:metaFileName', loadFolderOrMedia);
  app.get('/publication/:publication', printPublication);
  app.get('/publication/web/:publication', exportPublication);
  app.get('/publication/print/:pdfName', showPDF);
  app.get('/publication/video/:videoName', showVideo);
  app.post('/file-upload/:type/:slugFolderName', postFile2);

  /**
   * routing functions
   */
  function generatePageData(req) {
    return new Promise(function(resolve, reject) {
      let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageData = {};

      pageData.pageTitle = 'do•doc';
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
        // dev.logpackets(
        //   `Rendering index with data `,
        //   JSON.stringify(pageData, null, 4)
        // );
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

  function printPublication(req, res) {
    let slugPubliName = req.param('publication');
    generatePageData(req).then(pageData => {
      exporter.loadPublication(slugPubliName, pageData).then(pageData => {
        pageData.mode = 'print_publication';
        res.render('index', pageData);
      });
    });
  }

  function exportPublication(req, res) {
    let slugPubliName = req.param('publication');
    generatePageData(req).then(pageData => {
      exporter.loadPublication(slugPubliName, pageData).then(pageData => {
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
                var archive = archiver('zip', {
                  zlib: { level: 0 } //
                });

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

  function showVideo(req, res) {
    let videoName = req.param('videoName');
    const cachePath = path.join(
      global.tempStorage,
      settings.cacheDirname,
      '_publications'
    );
    const videoPath = path.join(cachePath, videoName);

    res.download(videoPath, videoName, function(err) {
      if (err) {
      } else {
      }
    });
  }

  function postFile2(req, res) {
    let type = req.param('type');
    let slugFolderName = req.param('slugFolderName');
    importer.handleForm({ req, res, type, slugFolderName });
  }
};
