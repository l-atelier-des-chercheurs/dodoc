const path = require("path"),
  fs = require("fs-extra"),
  archiver = require("archiver");

const auth = require("./core/auth"),
  dev = require("./core/dev-log"),
  cache = require("./core/cache"),
  api = require("./core/api"),
  file = require("./core/file"),
  exporter = require("./core/exporter"),
  importer = require("./core/importer"),
  remote_api = require("./core/remote_api");

module.exports = function(app) {
  /**
   * routing event
   */
  app.get("/", showIndex);
  app.get("/:project", loadFolderOrMedia);
  app.get("/:project/media/:metaFileName", loadFolderOrMedia);
  app.get("/_publications/:publication", linkPublication);
  app.get("/_publications/web/:publication", exportPublication);
  app.get("/_publications/print/:publication", printPublication);
  app.get("/_publications/print/doc/:docName", showDoc);
  app.get("/_publications/video/:videoName", showVideo);
  app.get("/_archives/:type/:slugFolderName", downloadArchive);
  app.post("/_file-upload/:type/:slugFolderName", postFile);

  remote_api.init(app);

  // app.ws('/_collaborative-editing', collaborativeEditing);

  function collaborativeEditing(ws, req) {
    console.log("WebSocket sharedb event");

    ws.on("message", msg => {
      console.log("WebSocket was closed");
      ws.send(msg);
    });

    ws.on("close", () => {
      console.log("WebSocket was closed");
    });
  }

  /**
   * routing functions
   */
  function generatePageData(req) {
    return new Promise(function(resolve, reject) {
      let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageData = {};

      pageData.pageTitle = "do•doc";
      // full path on the storage space, as displayed in the footer
      pageData.folderPath = api.getFolderPath();
      pageData.slugProjectName = "";
      pageData.url = req.path;
      pageData.protocol = req.protocol;
      pageData.structure = global.settings.structure;
      pageData.authorsFolder = global.settings.structure.authors.path;
      pageData.isDebug = dev.isDebug();

      pageData.mode = "live";

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
        res.render("index", pageData);
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function loadFolderOrMedia(req, res) {
    let slugProjectName = req.param("project");
    let metaFileName = req.param("metaFileName")
      ? req.param("metaFileName").replace(/\*/g, ".")
      : undefined;
    let display = req.query["display"];

    dev.logfunction(
      `ROUTER — loadFolderOrMedia • slugProjectName=${slugProjectName} metaFileName=${metaFileName}`
    );

    generatePageData(req).then(
      pageData => {
        pageData.slugProjectName = slugProjectName;
        pageData.metaFileName = metaFileName;
        pageData.display = display;

        if (!!global.session_password && !metaFileName) {
          return res.render("index", pageData);
        }

        // let’s make sure that folder exists first and return some meta
        file
          .getFolder({ type: "projects", slugFolderName: slugProjectName })
          .then(foldersData => {
            foldersData = api.removePasswordFromFoldersMeta(foldersData);
            pageData.folderAndMediaData = foldersData;
            if (!metaFileName) {
              return res.render("index", pageData);
            }

            file
              .readMediaList({
                type: "projects",
                medias_list: [
                  {
                    slugFolderName: slugProjectName,
                    metaFileName
                  }
                ]
              })
              .then(folders_and_medias => {
                pageData.folderAndMediaData[slugProjectName].medias =
                  folders_and_medias[slugProjectName].medias;
                return res.render("index", pageData);
              });
          })
          .catch((err, p) => {
            dev.error(`Failed to get folder: ${err}`);
            pageData.noticeOfError = "failed_to_find_folder";
            res.render("index", pageData);
          });
      },
      err => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  function printPublication(req, res) {
    let slugPubliName = req.param("publication");
    generatePageData(req).then(pageData => {
      dev.logverbose(`Generated printpublication pageData`);
      dev.logverbose(`Now getting publication data for ${slugPubliName}`);
      exporter.loadPublication(slugPubliName, pageData).then(pageData => {
        pageData.mode = "print_publication";
        res.render("index", pageData);
      });
    });
  }

  function exportPublication(req, res) {
    let slugPubliName = req.param("publication");
    generatePageData(req).then(pageData => {
      exporter.loadPublication(slugPubliName, pageData).then(pageData => {
        pageData.mode = "export_publication";
        res.render("index", pageData, (err, html) => {
          exporter
            .copyFolderContent({
              html,
              folders_and_medias: pageData.folderAndMediaData,
              slugFolderName: slugPubliName
            })
            .then(
              cachePath => {
                var archive = archiver("zip", {
                  zlib: { level: 0 } //
                });

                archive.on("error", function(err) {
                  res.status(500).send({ error: err.message });
                });

                //on stream closed we can end the request
                archive.on("end", function() {
                  dev.log("Archive wrote %d bytes", archive.pointer());
                });

                //set the archive name
                res.attachment(slugPubliName + ".zip");

                //this is the streaming magic
                archive.pipe(res);

                archive.directory(cachePath, false);

                archive.finalize();
              },
              (err, p) => {
                dev.error("Failed while preparing/making a web export");
              }
            );
        });
      });
    });
  }

  function linkPublication(req, res) {
    let slugPubliName = req.param("publication");
    generatePageData(req).then(pageData => {
      exporter.loadPublication(slugPubliName, pageData).then(pageData => {
        pageData.mode = "link_publication";
        res.render("index", pageData);
      });
    });
  }

  function showDoc(req, res) {
    let docName = req.param("docName");
    const cachePath = path.join(
      global.tempStorage,
      global.settings.cacheDirname,
      "_publications"
    );
    const docPath = path.join(cachePath, docName);

    res.download(docPath, docName, function(err) {
      if (err) {
      } else {
      }
    });
  }

  function showVideo(req, res) {
    let videoName = req.param("videoName");
    const cachePath = path.join(
      global.tempStorage,
      global.settings.cacheDirname,
      "_publications"
    );
    const videoPath = path.join(cachePath, videoName);

    res.download(videoPath, videoName, function(err) {
      if (err) {
      } else {
      }
    });
  }

  function downloadArchive(req, res) {
    let type = req.param("type");
    let slugFolderName = req.param("slugFolderName");

    // check if folder is protected
    file
      .getFolder({ type: type, slugFolderName })
      .then(foldersData => {
        const folder_meta = Object.values(foldersData)[0];
        if (!folder_meta.hasOwnProperty("password") || !folder_meta.password) {
          return;
        }
        // if it is, check that we have a socketid with the request and if so, if that id is allowed to access that folder
        if (!req.query.hasOwnProperty("pwd")) {
          throw "Missing password for protected folder";
        }
        const pwd = req.query.pwd;

        if (String(auth.hashCode(folder_meta.password)) !== String(pwd)) {
          throw "Wrong password for folder";
        }

        return;
      })
      .then(() => {
        dev.log(
          `Will create and stream archive for folder ${type}/${slugFolderName}`
        );

        // checks passed
        var archive = archiver("zip", {
          zlib: { level: 0 } //
        });

        archive.on("error", function(err) {
          res.status(500).send({ error: err.message });
        });

        //on stream closed we can end the request
        archive.on("end", function() {
          dev.log("Archive wrote %d bytes", archive.pointer());
        });

        //set the archive name
        res.attachment(slugFolderName + ".zip");

        //this is the streaming magic
        archive.pipe(res);

        const baseFolderPath = global.settings.structure[type].path;
        const mainFolderPath = api.getFolderPath(baseFolderPath);
        const thisFolderPath = path.join(mainFolderPath, slugFolderName);

        archive.directory(thisFolderPath, false);

        archive.finalize();
      })
      .catch(err => {
        dev.error(`Error! ${err}`);
        res.status(500).send({ error: err });
      });
  }

  function postFile(req, res) {
    let type = req.param("type");
    let slugFolderName = req.param("slugFolderName");
    importer.handleForm({ req, res, type, slugFolderName });
  }
};
