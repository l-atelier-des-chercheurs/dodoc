const cors = require("cors");
const url = require("url");

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
    app.options("/_api2/*", cors());

    app.get(
      "/_api2/_ip",
      [cors(_corsCheck), _sessionPasswordCheck],
      _getLocalNetworkInfos
    );
    app.get(
      "/_api2/:folder_type",
      [cors(_corsCheck), _sessionPasswordCheck],
      _getFolders
    );
    app.get(
      "/_api2/:folder_type/:folder_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _getFolderWithFiles
    );
    app.post(
      "/_api2/:folder_type",
      [cors(_corsCheck), _sessionPasswordCheck],
      _createFolder
    );
    app.patch(
      "/_api2/:folder_type/:folder_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _updateFolder
    );
    app.delete(
      "/_api2/:folder_type/:folder_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _removeFolder
    );

    app.post(
      "/_api2/:folder_type/:folder_slug/_upload",
      [cors(_corsCheck), _sessionPasswordCheck],
      _uploadFile
    );
    app.patch(
      "/_api2/:folder_type/:folder_slug/:meta_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _updateFile
    );
    app.delete(
      "/_api2/:folder_type/:folder_slug/:meta_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _removeFile
    );

    app.get("/*", loadIndex);
  }

  function _corsCheck(req, callback) {
    dev.logfunction();

    // dev.logverbose(`API2 — _corsCheck : ${JSON.stringify(req.headers)}`);
    // check origin

    callback(null, { origin: true });
  }
  function _sessionPasswordCheck(req, res, next) {
    next();
  }

  function loadIndex(rea, res) {
    dev.logfunction();
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
    let folder_type = req.params.folder_type;
    dev.logfunction({ folder_type });

    if (!global.settings.schema[folder_type])
      return res.status(422).send("Missing schema for folder_type");

    const hrstart = process.hrtime();

    try {
      const d = await folder.getFolders({ folder_type });
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

  async function _getFolderWithFiles(req, res, next) {
    let { folder_type, folder_slug } = req.params;
    dev.logfunction({ folder_type, folder_slug });

    if (!global.settings.schema[folder_type].files)
      return res.status(422).send("No files for folder_type");

    const hrstart = process.hrtime();

    try {
      const folder_meta = await folder.getFolder({ folder_type, folder_slug });
      const files = await file.getFiles({ folder_type, folder_slug });
      folder_meta.files = files;
      res.json(folder_meta);
    } catch (err) {
      dev.error(err);
      if (err.code === "ENOENT") res.status(404).send();
      else res.status(500).send(err);
    }
    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);

    cache.printStatus();
  }

  async function _createFolder(req, res, next) {
    let folder_type = req.params.folder_type;
    const data = req.body;

    dev.logfunction({ folder_type, data });

    const hrstart = process.hrtime();

    let new_folder_slug;

    try {
      new_folder_slug = await folder.createFolder({
        folder_type,
        data,
      });
      res.status(200).json({ status: "ok" });

      const new_folder_meta = await folder.getFolder({
        folder_type,
        folder_slug: new_folder_slug,
      });

      notifier.emit("createFolder", `${folder_type}`, {
        folder_type,
        meta: new_folder_meta,
      });
    } catch (err) {
      dev.error("Failed to update expected content: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _updateFolder(req, res, next) {
    let folder_type = req.params.folder_type;
    let folder_slug = req.params.folder_slug;
    const data = req.body;

    dev.logfunction({ folder_type, folder_slug, data });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!global.settings.schema.hasOwnProperty(folder_type))
      return res.status(422).send("Missing schema for folder_type");
    if (!folder_slug) return res.status(422).send("Missing folder slug");
    if (!data) return res.status(422).send("Missing body");

    const hrstart = process.hrtime();

    try {
      const changed_data = await folder.updateFolder({
        folder_type,
        folder_slug,
        data,
      });
      res.status(200).json({ status: "ok" });

      notifier.emit("updateFolder", `${folder_type}`, {
        folder_type,
        folder_slug,
        changed_data,
      });
    } catch (err) {
      dev.error("Failed to update expected content: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _removeFolder(req, res, next) {
    let folder_type = req.params.folder_type;
    let folder_slug = req.params.folder_slug;

    dev.logfunction({ folder_type, folder_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!folder_slug) return res.status(422).send("Missing folder_slug field");

    const hrstart = process.hrtime();

    try {
      folder_slug = await folder.removeFolder({
        folder_type,
        folder_slug,
      });
      // res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json({ status: "ok" });

      notifier.emit("removeFolder", `${folder_type}`, {
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

  async function _uploadFile(req, res, next) {
    let folder_type = req.params.folder_type;
    let folder_slug = req.params.folder_slug;

    dev.logfunction({ folder_type, folder_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!folder_slug) return res.status(422).send("Missing folder_slug field");

    const hrstart = process.hrtime();

    try {
      meta_filename = await file.importFile({
        req,
        folder_type,
        folder_slug,
      });
      // res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json({ meta_filename });

      const file_meta = await file.getFile({
        folder_type,
        folder_slug,
        meta_filename,
      });

      notifier.emit("newFile", `${folder_type}/${folder_slug}`, {
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

    dev.logfunction({ folder_type, folder_slug, meta_slug });

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
      // res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json({ status: "ok" });

      notifier.emit("updateFile", `${folder_type}/${folder_slug}`, {
        folder_type,
        folder_slug,
        meta_slug,
        changed_data,
      });
    } catch (err) {
      dev.error("Failed to update content: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _removeFile(req, res, next) {
    let folder_type = req.params.folder_type;
    let folder_slug = req.params.folder_slug;
    let meta_slug = req.params.meta_slug;

    dev.logfunction({ folder_type, folder_slug, meta_slug });

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
      // res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json({ status: "ok" });

      notifier.emit("removeFile", `${folder_type}/${folder_slug}`, {
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
    dev.logfunction();
    const hrstart = process.hrtime();

    const local_ips = utils.getLocalIP();
    res.status(200).json(local_ips);

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  return API;
})();
