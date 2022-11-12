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

    app.use("/_api2/*", [cors(_corsCheck), _sessionPasswordCheck]);
    // app.options("/_api2/*", cors());

    app.get("/_api2/_ip", _getLocalNetworkInfos);
    app.get("/_api2/_admin", _getAdminInfos);

    // 1st level folders
    app.get("/_api2/*.+*", _getFile);
    app.get("/_api2/*", _getFolders);

    app.post("/_api2/*/_upload", _uploadFile);
    app.post("/_api2/*", _createFolder);

    // app.post("/_api2/:folder_type/:folder_slug/_upload", _uploadFile);

    // app.post("/_api2/:folder_type", _createFolder);
    // app.post("/_api2/:folder_type/:folder_slug/_upload", _uploadFile);
    // app.patch("/_api2/:folder_type/:folder_slug", _updateFolder);
    // app.delete("/_api2/:folder_type/:folder_slug", _removeFolder);
    // app.post("/_api2/:folder_type/:folder_slug/_login", _loginToFolder);

    // // 1st level files
    // app.patch("/_api2/:folder_type/:folder_slug/:meta_slug+.", _updateFile);
    // app.delete("/_api2/:folder_type/:folder_slug/:meta_slug", _removeFile);

    app.get("/*", loadIndex);
  }

  function _corsCheck(req, callback) {
    console.log();
    // dev.logfunction();

    // dev.logverbose(`API2 — _corsCheck : ${JSON.stringify(req.headers)}`);
    // check origin

    callback(null, { origin: true });
  }
  function _sessionPasswordCheck(req, res, next) {
    next();
  }

  function loadIndex(rea, res) {
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
    const relative_path = req.path.substring(7);

    const { folder_type, folder_slug, subfolder_type, subfolder_slug } =
      await utils.parseAndCheckSchema({ relative_path }).catch((err) => {
        return res.status(422).send(err.message);
      });
    dev.logapi({ folder_type, folder_slug, subfolder_type, subfolder_slug });

    const hrstart = process.hrtime();

    try {
      let d;

      // todo improved legibility
      // one single route for all GET, which analyses if it ends with a filename (dot in the name)
      // if it does, fetch file infos (file.getFile)
      // otherwise, if it ends with a folder type from the schema, fetch all the folders located in the path (folder.getFolders)
      // otherwise, look for a folder with a meta.txt in this spot (folder.getFolder)

      if (!folder_slug || (subfolder_type && !subfolder_slug)) {
        d = await folder.getFolders({ relative_path });
      } else if (
        (folder_slug && !subfolder_type) ||
        (subfolder_type && subfolder_slug)
      ) {
        d = await folder.getFolder({ relative_path });
        const files = await file.getFiles({ relative_path });
        d.$files = files;

        // TODO bug : $files end up in the cache, somehow
      }

      res.setHeader("Access-Control-Allow-Origin", "*");

      dev.logpackets({ d });
      res.json(d);
    } catch (err) {
      dev.error("Failed to get expected content: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);

    cache.printStatus();
  }

  async function _getFile(req, res, next) {
    const relative_path = req.path.substring(7);

    // TODO improved legibility

    const { meta_slug } = await utils
      .parseAndCheckSchema({ relative_path })
      .catch((err) => {
        return res.status(422).send(err.message);
      });

    const hrstart = process.hrtime();

    try {
      const file_archives = await file.getArchives({
        relative_path,
        meta_filename: meta_slug,
      });

      dev.logpackets({ file_archives });
      res.json(file_archives);
    } catch (err) {
      dev.error(err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _createFolder(req, res, next) {
    const relative_path = req.path.substring(7);

    const { folder_type, folder_slug, subfolder_type } = await utils
      .parseAndCheckSchema({ relative_path })
      .catch((err) => {
        return res.status(422).send(err.message);
      });
    const data = req.body;

    dev.logapi({
      folder_type,
      folder_slug,
      subfolder_type,
      data,
    });

    const hrstart = process.hrtime();

    let new_folder_slug;

    try {
      new_folder_slug = await folder.createFolder({ relative_path, data });
      dev.logpackets({ status: "folder was created" });
      res.status(200).json({ new_folder_slug });

      const _relative_path = path.join(relative_path, new_folder_slug);
      const new_folder_meta = await folder.getFolder({
        relative_path: _relative_path,
      });

      notifier.emit("folderCreated", relative_path, {
        path: relative_path,
        meta: new_folder_meta,
      });
    } catch (err) {
      dev.error("Failed to create folder: " + err.message);
      res.status(500).send({ message: err.message, error: err });
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _updateFolder(req, res, next) {
    const data = req.body;
    const update_cover = req.query && req.query.hasOwnProperty("cover");

    dev.logapi({ folder_type, folder_slug, data, update_cover });

    // check if header contains a valid jwt that certifies that user is author
    // if (auth.checkFolderForAuth({ folder_type, folder_slug }))
    //   res.status(422).send("Not allowed");

    if (!data) return res.status(422).send("Missing body");

    const hrstart = process.hrtime();

    try {
      const changed_data = await folder.updateFolder({
        folder_type,
        folder_slug,
        data,
        update_cover_req: update_cover ? req : false,
      });
      dev.logpackets({ status: "folder was updated" });
      res.status(200).json({ status: "ok" });

      // TODO improve here
      notifier.emit("folderUpdated", `${folder_type}`, {
        folder_type,
        folder_slug,
        changed_data,
      });
      notifier.emit("folderUpdated", `${folder_type}/${folder_slug}`, {
        folder_type,
        folder_slug,
        changed_data,
      });
    } catch (err) {
      dev.error("Failed to update folder: " + err.message);
      res.status(500).send({ message: err.message });
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _removeFolder(req, res, next) {
    let { folder_type, folder_slug } = req.params;

    dev.logapi({ folder_type, folder_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!folder_slug) return res.status(422).send("Missing folder_slug field");

    const hrstart = process.hrtime();

    try {
      folder_slug = await folder.removeFolder({
        folder_type,
        folder_slug,
      });
      dev.logpackets({ status: "folder was removed" });
      res.status(200).json({ status: "ok" });

      notifier.emit("folderRemoved", `${folder_type}`, {
        folder_type,
        folder_slug,
      });
      notifier.emit("folderRemoved", `${folder_type}/${folder_slug}`, {
        folder_type,
        folder_slug,
      });
    } catch (err) {
      dev.error("Failed to remove expected content: " + err);
      res.status(404).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }
  async function _loginToFolder(req, res, next) {
    let { folder_type, folder_slug } = req.params;
    const data = req.body;

    dev.logapi({ folder_type, folder_slug });

    if (!data || !data.hasOwnProperty("$password"))
      return res.status(422).send("Missing password field");

    try {
      await folder.login({
        folder_type,
        folder_slug,
        submitted_password: data.$password,
      });
      dev.logpackets({ status: "logged in to folder" });
      res.status(200).json({ status: "ok" });
    } catch (err) {
      dev.error(`Failed to login to folder: ${err.message}`);
      res.status(404).send("Folder is missing");
    }
  }

  async function _uploadFile(req, res, next) {
    const relative_path = req.path.substring(7);

    try {
      const { folder_type, folder_slug, subfolder_type, subfolder_slug } =
        await utils.parseAndCheckSchema({ relative_path });
      dev.logapi({ folder_type, folder_slug, subfolder_type, subfolder_slug });

      const hrstart = process.hrtime();

      meta_filename = await file.importFile({
        req,
        folder_type,
        folder_slug,
      });
      dev.logpackets({ status: `uploaded file ${meta_filename}` });
      res.status(200).json({ meta_filename });

      const file_meta = await file.getFile({
        folder_type,
        folder_slug,
        meta_filename,
      });

      notifier.emit("fileCreated", `${folder_type}/${folder_slug}`, {
        folder_type,
        folder_slug,
        file_meta,
      });
    } catch (err) {
      dev.error("Failed to upload file: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _updateFile(req, res, next) {
    let { folder_type, folder_slug, meta_slug } = req.params;
    const data = req.body;

    dev.logapi({ folder_type, folder_slug, meta_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!folder_slug) return res.status(422).send("Missing folder_slug field");
    if (!meta_slug) return res.status(422).send("Missing meta_slug field");
    if (!data) return res.status(422).send("Missing body");

    const hrstart = process.hrtime();

    try {
      const changed_data = await file.updateFile({
        folder_type,
        folder_slug,
        meta_slug,
        data,
      });
      dev.logpackets({ status: "file was updated" });
      res.status(200).json({ status: "ok" });

      notifier.emit("fileUpdated", `${folder_type}/${folder_slug}`, {
        folder_type,
        folder_slug,
        meta_slug,
        changed_data,
      });
    } catch (err) {
      dev.error("Failed to update content: " + err.message);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _removeFile(req, res, next) {
    let { folder_type, folder_slug, meta_slug } = req.params;

    dev.logapi({ folder_type, folder_slug, meta_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!folder_slug) return res.status(422).send("Missing folder_slug field");
    if (!meta_slug) return res.status(422).send("Missing meta_slug field");

    const hrstart = process.hrtime();

    try {
      folder_slug = await file.removeFile({
        folder_type,
        folder_slug,
        meta_slug,
      });
      dev.logpackets({ status: "file was removed" });
      res.status(200).json({ status: "ok" });

      notifier.emit("fileRemoved", `${folder_type}/${folder_slug}`, {
        folder_type,
        folder_slug,
        meta_slug,
      });
    } catch (err) {
      dev.error("Failed to remove expected content: " + err);
      res.status(404).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
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
