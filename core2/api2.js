const cors = require("cors"),
  url = require("url"),
  path = require("path");

const folder = require("./folder"),
  file = require("./file"),
  notifier = require("./notifier"),
  utils = require("./utils"),
  cache = require("./cache");

module.exports = (function () {
  const API = {
    init: (app) => {
      return _initAPI(app);
    },
  };

  function _initAPI(app) {
    dev.logfunction();

    app.get("/_perf", loadPerf);

    // todo forbiddenFiles txt
    // app.use(forbiddenFiles);
    app.use("/_api2/*", [cors(_corsCheck), _sessionPasswordCheck]);
    // app.options("/_api2/*", cors());

    app.get("/_api2/_ip", _getLocalNetworkInfos);
    app.get("/_api2/_admin", _getAdminInfos);

    /* FILES */
    app.get(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug/:meta_filename",
      ],
      _getFile
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/_upload",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug/_upload",
      ],
      _uploadFile
    );
    app.patch(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug/:meta_filename",
      ],
      _updateFile
    );
    app.delete(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug/:meta_filename",
      ],
      _removeFile
    );

    /* FOLDERS */
    app.get(
      [
        "/_api2/:folder_type",
        "/_api2/:folder_type/:folder_slug/:subfolder_type",
      ],
      _getFolders
    );
    app.post(
      [
        "/_api2/:folder_type",
        "/_api2/:folder_type/:folder_slug/:subfolder_type",
      ],
      _createFolder
    );

    app.get(
      [
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug",
      ],
      _getFolder
    );
    // app.post("/_api2/:folder_type/:folder_slug/_login", _loginToFolder);
    app.patch(
      [
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug",
      ],
      _updateFolder
    );
    app.delete(
      [
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug",
      ],
      _removeFolder
    );

    app.get("/*", loadIndex);
  }

  function _corsCheck(req, callback) {
    console.log();
    dev.logapi({ path: req.path }, { params: req.params });

    // TODO check origin
    callback(null, { origin: true });
  }
  function _sessionPasswordCheck(req, res, next) {
    // TODO
    next();
  }

  function loadIndex(req, res) {
    dev.logapi();
    let d = {};
    d.schema = global.settings.schema;
    res.render("index2", d);
  }
  function loadPerf(rea, res) {
    let d = {};
    d.local_ips = utils.getLocalIP();
    res.render("perf", d);
  }

  async function _getFolders(req, res, next) {
    const { path_to_type } = utils.makePathFromReq(req);

    try {
      let d = await folder.getFolders({ path_to_type });
      res.setHeader("Access-Control-Allow-Origin", "*");
      dev.logpackets({ d });
      res.json(d);
    } catch (err) {
      dev.error("Failed to get expected content: " + err);
      res.status(500).send(err);
    }
    cache.printStatus();
  }
  async function _createFolder(req, res, next) {
    const { path_to_type, data } = utils.makePathFromReq(req);
    dev.logapi({ path_to_type });

    // TODO check if schema allows it
    // return res.status(422).send(err.message);

    try {
      const new_folder_slug = await folder.createFolder({
        path_to_type,
        data,
      });
      dev.logpackets(`folder was created with name ${new_folder_slug}`);
      res.status(200).json({ new_folder_slug });

      const path_to_folder = path.join(path_to_type, new_folder_slug);
      const new_folder_meta = await folder.getFolder({
        path_to_folder,
      });

      notifier.emit("folderCreated", path_to_type, {
        path: path_to_type,
        meta: new_folder_meta,
      });
    } catch (err) {
      dev.error("Failed to create folder: " + err.message);
      res.status(500).send({ message: err.message, error: err });
    }
  }

  async function _getFolder(req, res, next) {
    const { path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    try {
      let d = JSON.parse(
        JSON.stringify(await folder.getFolder({ path_to_folder }))
      );
      const files = await file.getFiles({ path_to_folder });
      d.$files = files;
      // TODO bug : $files end up in the cache, somehow

      res.setHeader("Access-Control-Allow-Origin", "*");
      dev.logpackets({ d });
      res.json(d);
    } catch (err) {
      dev.error("Failed to get expected content: " + err);
      res.status(500).send(err);
    }
    cache.printStatus();
  }

  async function _updateFolder(req, res, next) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    const update_cover = req.query?.hasOwnProperty("cover");
    dev.logapi({ path_to_folder, data, update_cover });

    // TODO check if schema allows it, if data exists
    // return res.status(422).send(err.message);

    // TODO check if header contains a valid jwt that certifies that user is author
    // if (auth.checkFolderForAuth({ folder_type, folder_slug }))
    //   res.status(422).send("Not allowed");

    try {
      const changed_data = await folder.updateFolder({
        path_to_folder,
        data,
        update_cover_req: update_cover ? req : false,
      });
      dev.logpackets({ status: "folder was updated" });
      res.status(200).json({ status: "ok" });

      notifier.emit("folderUpdated", path_to_folder, {
        path: path_to_folder,
        changed_data,
      });
      notifier.emit("folderUpdated", path_to_type, {
        path: path_to_folder,
        changed_data,
      });
    } catch (err) {
      dev.error("Failed to update folder: " + err.message);
      res.status(500).send({ message: err.message });
    }
  }

  async function _removeFolder(req, res, next) {
    const { path_to_type, path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    try {
      await folder.removeFolder({
        path_to_folder,
      });
      dev.logpackets({ status: "folder was removed" });
      res.status(200).json({ status: "ok" });

      notifier.emit("folderRemoved", path_to_folder, { path: path_to_folder });
      notifier.emit("folderRemoved", path_to_type, { path: path_to_folder });
    } catch (err) {
      dev.error("Failed to remove expected content: " + err);
      res.status(404).send(err);
    }
  }
  async function _loginToFolder(req, res, next) {
    // try {
    //   await folder.login({
    //     folder_type,
    //     folder_slug,
    //     submitted_password: data.$password,
    //   });
    //   dev.logpackets({ status: "logged in to folder" });
    //   res.status(200).json({ status: "ok" });
    // } catch (err) {
    //   dev.error(`Failed to login to folder: ${err.message}`);
    // res.status(404).send("Folder is missing");
    // }
  }

  async function _uploadFile(req, res, next) {
    const { path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    try {
      dev.logapi({ path_to_folder });

      const meta_filename = await file.importFile({
        path_to_folder,
        req,
      });
      dev.logpackets({
        status: `uploaded file`,
        path_to_folder,
        meta_filename,
      });
      res.status(200).json({ meta_filename });

      const meta = await file.getFile({
        path_to_meta: path.join(path_to_folder, meta_filename),
      });
      notifier.emit("fileCreated", path_to_folder, { path_to_folder, meta });
    } catch (err) {
      dev.error("Failed to upload file: " + err);
      res.status(500).send(err);
    }
  }

  async function _getFile(req, res, next) {
    const { path_to_folder, path_to_meta, meta_filename } =
      utils.makePathFromReq(req);
    // no filename found in params, user may be requesting folders
    if (!path_to_meta) return next();

    dev.logapi({ path_to_meta });

    try {
      const meta = await file.getFile({
        path_to_meta,
      });
      const file_archives = await file
        .getArchives({
          path_to_folder,
          meta_filename,
        })
        .catch(() => {});
      if (file_archives) meta.$archives = file_archives;

      res.setHeader("Access-Control-Allow-Origin", "*");
      dev.logpackets({ meta });
      res.json(meta);
    } catch (err) {
      dev.error("Failed to upload file: " + err);
      res.status(500).send(err);
    }
  }

  async function _updateFile(req, res, next) {
    const { path_to_folder, path_to_meta, data } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, path_to_meta, data });

    try {
      const changed_data = await file.updateFile({
        path_to_folder,
        path_to_meta,
        data,
      });
      dev.logpackets({ status: "file was updated" });
      res.status(200).json({ status: "ok" });

      notifier.emit("fileUpdated", path_to_folder, {
        path_to_folder,
        path_to_meta,
        changed_data,
      });
    } catch (err) {
      dev.error("Failed to update content: " + err.message);
      res.status(500).send(err);
    }
  }

  async function _removeFile(req, res, next) {
    const { path_to_folder, meta_filename, path_to_meta } =
      utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, meta_filename });

    try {
      await file.removeFile({
        path_to_folder,
        meta_filename,
      });
      dev.logpackets(`file ${meta_filename} was removed`);
      res.status(200).json({ status: "ok" });

      notifier.emit("fileRemoved", path_to_folder, {
        path_to_folder,
        path_to_meta,
      });
    } catch (err) {
      dev.error("Failed to remove expected content: " + err);
      res.status(404).send(err);
    }
  }

  function _getLocalNetworkInfos(req, res, next) {
    dev.logapi();
    const local_ips = utils.getLocalIP();

    dev.logpackets({ local_ips });
    res.status(200).json(local_ips);
  }
  function _getAdminInfos(req, res, next) {
    // TODO only available to admins
    dev.logapi();
    // get storage path

    dev.logpackets();
    res.status(200).json({
      pathToUserContent: pathToUserContent,
    });
  }

  return API;
})();
