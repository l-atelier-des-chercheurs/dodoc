const cors = require("cors");
const url = require("url");

const folder = require("./folder");
const file = require("./file");
const notifier = require("./notifier");

module.exports = (function () {
  const API = {
    init: (app) => {
      return _initAPI(app);
    },
  };

  function _initAPI(app) {
    dev.logfunction();

    app.get("/", loadIndex);
    app.get("/_perf", loadPerf);

    app.options("/api2/*", cors());

    app.get(
      "/api2/:folder_type?/:folder_slug?",
      [cors(_corsCheck), _sessionPasswordCheck],
      _getResource
    );

    // create folder
    app.post(
      "/api2/:folder_type",
      [cors(_corsCheck), _sessionPasswordCheck],
      _createFolder
    );
    // update folder
    app.patch(
      "/api2/:folder_type/:folder_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _updateFolder
    );
    // remove folder
    app.delete(
      "/api2/:folder_type/:folder_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _removeFolder
    );

    // upload file
    app.post(
      "/api2/:folder_type/:folder_slug/_uploadFile",
      [cors(_corsCheck), _sessionPasswordCheck],
      _uploadFile
    );
    // update file
    app.patch(
      "/api2/:folder_type/:folder_slug/:meta_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _updateFile
    );
    // remove file
    app.delete(
      "/api2/:folder_type/:folder_slug/:meta_slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _removeFile
    );
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
    res.render("index");
  }
  function loadPerf(rea, res) {
    res.render("perf");
  }
  async function _getResource(req, res, next) {
    let folder_type = req.params.folder_type;
    let folder_slug = req.params.folder_slug;
    dev.logfunction({ folder_type, folder_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!global.settings.schema.hasOwnProperty(folder_type))
      return res.status(422).send("Missing schema for folder_type");

    const hrstart = process.hrtime();

    try {
      let d;
      if (!folder_slug) d = await folder.getFolders({ folder_type });
      else d = await file.getFiles({ folder_type, folder_slug });

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(d);
    } catch (err) {
      dev.error("Failed to get expected content: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _createFolder(req, res, next) {
    let folder_type = req.params.folder_type;
    const content = req.body;

    dev.logfunction({ folder_type, content });

    const hrstart = process.hrtime();

    let new_folder_slug;

    try {
      new_folder_slug = await folder.createFolder({
        folder_type,
        new_meta: content,
      });
      res.status(200).json({ status: "ok" });

      const new_folder_meta = await folder.getFolder({
        folder_type,
        folder_slug: new_folder_slug,
      });
      notifier.emit("createFolder", { folder_type, meta: new_folder_meta });
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
    const content = req.body;

    dev.logfunction({ folder_type, folder_slug, content });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!global.settings.schema.hasOwnProperty(folder_type))
      return res.status(422).send("Missing schema for folder_type");
    if (!folder_slug) return res.status(422).send("Missing folder slug");
    if (!content) return res.status(422).send("Missing body");

    const hrstart = process.hrtime();

    try {
      const changed_meta = await folder.updateFolderMeta({
        folder_type,
        folder_slug,
        new_meta: content,
      });
      res.status(200).json({ status: "ok" });

      notifier.emit("updateFolder", { folder_type, folder_slug, changed_meta });
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

      notifier.emit("removeFolder", { folder_type, folder_slug });
    } catch (err) {
      dev.error("Failed to remove expected content: " + err);
      res.status(500).send(err);
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
      res.status(200).json({ status: "ok" });

      const file_meta = await file.getFile({
        folder_type,
        folder_slug,
        meta_filename,
      });
      notifier.emit("newFile", { folder_type, folder_slug, file_meta });

      notifier.emit("", {});
    } catch (err) {
      dev.error("Failed to upload file: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _updateFile(req, res, next) {
    let folder_type = req.params.folder_type;
    let folder_slug = req.params.folder_slug;
    let meta_slug = req.params.meta_slug;
    const content = req.body;

    dev.logfunction({ folder_type, folder_slug, meta_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!folder_slug) return res.status(422).send("Missing folder_slug field");
    if (!meta_slug) return res.status(422).send("Missing meta_slug field");
    if (!content) return res.status(422).send("Missing body");

    const hrstart = process.hrtime();

    try {
      const changed_meta = await file.updateFile({
        folder_type,
        folder_slug,
        meta_slug,
        new_meta: content,
      });
      // res.setHeader("Access-Control-Allow-Origin", "*");
      res.status(200).json({ status: "ok" });

      notifier.emit("updateFile", {
        folder_type,
        folder_slug,
        meta_slug,
        changed_meta,
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

      notifier.emit("removeFile", {
        folder_type,
        folder_slug,
        meta_slug,
      });
    } catch (err) {
      dev.error("Failed to remove expected content: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  return API;
})();
