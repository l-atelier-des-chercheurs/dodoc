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
  sockets = require("./core/sockets"),
  remote_api = require("./core/remote_api"),
  ;

module.exports = function (app) {
  /**
   * routing event
   */
  app.get("/", showIndex);
  app.get("/:project", loadFolderOrMedia);
  app.get("/:project/media/:metaFileName", loadFolderOrMedia);

  app.get("/_publications/:publication", linkPublication);
  app.get("/_publications/web/:publication", exportPublication);
  app.get("/_publications/print/:publication", printPublication);
  app.get("/_publications/reply/:publication", replyToPublication);
  app.get("/_publications/survey/:publication", surveyPublication);
  app.get("/_publications/print/doc/:docName", showDoc);
  app.get("/_publications/video/:videoName", showVideo);
  app.get("/_archives/:type/:slugFolderName", downloadArchive);
  app.post("/_file-upload/:type/:slugFolderName", postFile);

  remote_api.init(app);

  /**
   * routing functions
   */
  function generatePageData(req) {
    return new Promise(function (resolve, reject) {
      let fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;
      dev.log(`••• the following page has been requested: ${fullUrl} •••`);

      let pageData = {};

      pageData.pageTitle = "do•doc";
      // full path on the storage space, as displayed in the footer
      pageData.folderPath = api.getFolderPath();
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
    let projectFolder = req.query.folder ? req.query.folder : undefined;

    generatePageData(req).then(
      (pageData) => {
        // dev.logpackets(
        //   `Rendering index with data `,
        //   JSON.stringify(pageData, null, 4)
        // );
        if (projectFolder) {
          pageData.projectFolder = projectFolder;
          pageData.type = "projects";
        }
        pageData.slugFolderName = undefined;

        res.render("index", pageData);
      },
      (err) => {
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
      (pageData) => {
        pageData.type = "projects";
        pageData.slugFolderName = slugProjectName;
        pageData.metaFileName = metaFileName;
        pageData.display = display;

        if (!!global.session_password && !metaFileName) {
          return res.render("index", pageData);
        }

        // let’s make sure that folder exists first and return some meta
        file
          .getFolder({ type: "projects", slugFolderName: slugProjectName })
          .then((foldersData) => {
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
                    metaFileName,
                  },
                ],
              })
              .then((folders_and_medias) => {
                if (Object.keys(folders_and_medias) !== 0)
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
      (err) => {
        dev.error(`Err while getting index data: ${err}`);
      }
    );
  }

  async function printPublication(req, res) {
    let slugPubliName = req.param("publication");
    dev.logfunction(
      `ROUTER — printPublication • slugPubliName = ${slugPubliName}`
    );

    // only allow for localhost: with electron/puppeteer to export PDF and if local dev
    if (req.hostname !== "localhost")
      res.status(403).send(`Only allowed for localhost`);

    const foldersData = await file.getFolder({
      type: "publications",
      slugFolderName: slugPubliName,
    });

    const pageData = await generatePageData(req);

    dev.logverbose(`Generated printpublication pageData`);
    dev.logverbose(`Now getting publication data for ${slugPubliName}`);

    const _pageData = await loadPublicationAndModel(
      slugPubliName,
      foldersData[slugPubliName]
    );
    Object.assign(pageData, _pageData);

    pageData.mode = "print_publication";
    res.render("index", pageData);
  }

  async function replyToPublication(req, res) {
    let slugPubliName = req.param("publication");
    const type = "publications";
    dev.logfunction(
      `ROUTER — replyToPublication • slugPubliName = ${slugPubliName}`
    );

    let keywords = undefined;
    if (req.query && req.query.hasOwnProperty("keyword")) {
      if (typeof req.query.keyword === "string")
        keywords = [{ title: req.query.keyword }];
      else if (Array.isArray(req.query.keyword))
        keywords = req.query.keyword.map((k) => ({ title: k }));
    }

    const foldersData = await file
      .getFolder({
        type,
        slugFolderName: slugPubliName,
      })
      .catch((err) => {
        res.status(403).send(`Failed to load publi: ${err}`);
        return;
      });

    const folders_meta = foldersData[slugPubliName];
    if (!folders_meta) {
      res.status(403).send(`Failed to load publi`);
    }

    if (
      folders_meta.hasOwnProperty("viewing_limited_to") &&
      folders_meta.viewing_limited_to !== "everybody"
    ) {
      res.status(403).send(`Access not allowed.`);
      return;
    }

    if (folders_meta.is_model !== true) {
      res.status(403).send(`Publi ${folders_meta.name} is not a model`);
      return;
    }

    const rnd = (Math.random().toString(36) + "00000000000000000").slice(
      2,
      3 + 8
    );

    // en créé une nouvelle : nom = aléatoire, modèle = slugPubliName, edition par tt le monde
    let data = {
      name: `«${folders_meta.name}»`,
      desired_foldername: `${folders_meta.name}-reply-${rnd}`,
      follows_model: slugPubliName,
      template: folders_meta.template,
      editing_limited_to: "everybody",
      viewing_limited_to: "everybody",
    };

    if (keywords) data.keywords = keywords;

    const slugFolderName = await file
      .createFolder({ type, data })
      .catch((err) => {
        dev.error(`Failed to create folder! Error: ${err}`);
        res.status(403).send(`Error on creating reply to ${slugPubliName}.`);
      });

    sockets.sendFolders({ type, slugFolderName });

    res.redirect(`/_publications/survey/` + slugFolderName);
  }

  async function surveyPublication(req, res) {
    // if a publication has been requested
    let slugPubliName = req.param("publication");

    dev.logfunction(
      `ROUTER — surveyPublication • slugPubliName = ${slugPubliName}`
    );

    generatePageData(req).then((pageData) => {
      pageData.type = "publications";
      pageData.slugFolderName = slugPubliName;
      pageData.display = "survey";
      return res.render("index", pageData);
    });
  }

  async function exportPublication(req, res) {
    let slugPubliName = req.param("publication");
    const type = "publications";

    dev.logfunction(
      `ROUTER — exportPublication • slugPubliName = ${slugPubliName}`
    );

    const isSocketAllowed = await isSocketIDAuthorized({
      socketid: req.query.socketid,
      type,
      slugFolderName: slugPubliName,
    }).catch((err) => {
      sockets.notify({
        socketid: req.query.socketid,
        localized_string: `action_not_allowed`,
        not_localized_string: err.message,
        type: "error",
      });
    });
    if (!isSocketAllowed) return false;

    const foldersData = await file.getFolder({
      type,
      slugFolderName: slugPubliName,
    });

    let pageData = await generatePageData(req);

    const _pageData = await loadPublicationAndModel(
      slugPubliName,
      foldersData[slugPubliName]
    );
    Object.assign(pageData, _pageData);

    pageData.mode = "export_publication";

    res.render("index", pageData, (err, html) => {
      exporter
        .copyFolderContent({
          html,
          all_medias: [
            {
              folders_and_medias: pageData.folderAndMediaData,
              type: "projects",
            },
            {
              folders_and_medias: pageData.publiAndMediaData,
              type: "publications",
            },
          ],
          slugFolderName: slugPubliName,
        })
        .then(
          (cachePath) => {
            var archive = archiver("zip", {
              zlib: { level: 0 }, //
            });

            archive.on("error", function (err) {
              res.status(500).send({ error: err.message });
              return;
            });

            //on stream closed we can end the request
            archive.on("end", function () {
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
  }

  async function linkPublication(req, res) {
    let slugPubliName = req.param("publication");
    const type = "publications";

    dev.logfunction(
      `ROUTER — linkPublication • slugPubliName = ${slugPubliName}`
    );

    const foldersData = await file.getFolder({
      type,
      slugFolderName: slugPubliName,
    });

    if (!foldersData.hasOwnProperty(slugPubliName)) {
      res.status(403).send(`Publi not found.`);
      return;
    }

    if (
      foldersData[slugPubliName].hasOwnProperty("viewing_limited_to") &&
      foldersData[slugPubliName].viewing_limited_to !== "everybody"
    ) {
      res.status(403).send(`Access not allowed.`);
      return;
    }

    const pageData = await generatePageData(req);

    const _pageData = await loadPublicationAndModel(
      slugPubliName,
      foldersData[slugPubliName]
    );
    Object.assign(pageData, _pageData);

    pageData.mode = "link_publication";
    res.render("index", pageData);
  }

  async function loadPublicationAndModel(slugPubliName, publi_data) {
    let pageData = {};

    const _pageData = await exporter.loadPublication(slugPubliName);

    Object.assign(pageData, _pageData);

    const model_slug = publi_data.follows_model
      ? publi_data.follows_model
      : false;

    if (model_slug) {
      const model_infos = await exporter.loadPublication(model_slug);
      if (model_infos) {
        // extract publiAndMediaData and folderAndMediaData and merge inside pageData
        // UGLY FIX: should deep merge objects to prevent overrides when model and reply use the same
        // project as source but not the same medias.
        // --> These should not happen for now because replies can’t use project’s medias.
        Object.assign(
          pageData.folderAndMediaData,
          model_infos.folderAndMediaData
        );
        Object.assign(
          pageData.publiAndMediaData,
          model_infos.publiAndMediaData
        );
      }
    }

    return pageData;
  }

  function showDoc(req, res) {
    let docName = req.param("docName");
    const cachePath = path.join(
      global.tempStorage,
      global.settings.cacheDirname,
      "_publications"
    );
    const docPath = path.join(cachePath, docName);

    res.download(docPath, docName, function (err) {
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

    res.download(videoPath, videoName, function (err) {
      if (err) {
      } else {
      }
    });
  }

  async function downloadArchive(req, res) {
    let type = req.param("type");
    let slugFolderName = req.param("slugFolderName");

    const isSocketAllowed = await isSocketIDAuthorized({
      socketid: req.query.socketid,
      type,
      slugFolderName,
    }).catch((err) => {
      sockets.notify({
        socketid: req.query.socketid,
        localized_string: `action_not_allowed`,
        not_localized_string: err.message,
        type: "error",
      });
    });
    if (!isSocketAllowed) return false;

    dev.log(
      `Will create and stream archive for folder ${type}/${slugFolderName}`
    );

    // checks passed
    var archive = archiver("zip", {
      zlib: { level: 0 }, //
    });

    archive.on("error", function (err) {
      res.status(500).send({ error: err.message });
      return;
    });

    //on stream closed we can end the request
    archive.on("end", function () {
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
  }

  async function postFile(req, res) {
    let type = req.params.type;
    let slugFolderName = req.params.slugFolderName;

    // const isSocketAllowed = await isSocketIDAuthorized({
    //   socketid: req.query.socketid,
    //   type,
    //   slugFolderName,
    // }).catch((err) => {
    //   sockets.notify({
    //     socketid: req.query.socketid,
    //     localized_string: `action_not_allowed`,
    //     not_localized_string: err.message,
    //     type: "error",
    //   });
    // });
    // if (!isSocketAllowed) return false;

    importer
      .handleForm({ req, type, slugFolderName })
      .then(({ msg }) => {
        sockets.notify({
          socketid: req.query.socketid,
          localized_string: `imported_files_successfully`,
          type: "success",
        });
        res.end(JSON.stringify(msg));
      })
      .catch(({ err }) => {
        sockets.notify({
          socketid: req.query.socketid,
          localized_string: `action_not_allowed`,
          not_localized_string: err.message,
          type: "error",
        });
        res.end();
      });
  }

  async function isSocketIDAuthorized({ socketid, type, slugFolderName }) {
    if (!socketid) throw "Missing socketid in URL";

    const connected_sockets = sockets.io().sockets.connected;

    if (!connected_sockets || !connected_sockets.hasOwnProperty(socketid)) {
      throw "Missing sockets server-side.";
    }

    const socket = connected_sockets[socketid];

    const foldersData = await file.getFolder({ type, slugFolderName });
    if (
      !(await auth
        .canEditFolder(socket, foldersData[slugFolderName], type)
        .catch((err) => {
          dev.error(`Failed to edit folder: ${err}`);
          notify({
            socket,
            socketid: socket.id,
            localized_string: `action_not_allowed`,
            not_localized_string: `Error: folder can’t be edited ${slugFolderName} ${err}`,
            type: "error",
          });
        }))
    )
      throw "User can’t edit folder";

    return true;
  }
};
