const cors = require("cors");
const url = require("url");

const file = require("./file2"),
  auth = require("../core/auth");

const EventEmitter = require("node:events");
const myEmitter = new EventEmitter();

module.exports = (function () {
  const API = {
    init: (app) => {
      return _initAPI(app);
    },
  };

  function _initAPI(app) {
    dev.logfunction();

    app.options("/api2/*", cors());

    app.get(
      "/api2/:type?/:slug?",
      [cors(_corsCheck), _sessionPasswordCheck],
      _getResource
    );

    app.post(
      "/api2/:type",
      [cors(_corsCheck), _sessionPasswordCheck],
      _createFolder
    );
    app.post(
      "/api2/:type/:slug",
      [cors(_corsCheck), _sessionPasswordCheck],
      _updateResource
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

  async function _getResource(req, res, next) {
    let folder_type = req.params.type;
    let folder_slug = req.params.slug;
    dev.logfunction({ folder_type, folder_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!global.settings.schema.hasOwnProperty(folder_type))
      return res.status(422).send("Missing schema for folder_type");

    //  possible queries :
    // - projects,
    // - projects/files,
    // - projects/specific.txt, publications, etc.

    const hrstart = process.hrtime();

    try {
      let d;
      if (!folder_slug) d = await file.getFolders({ folder_type });
      else d = await file.getFolder({ folder_type, folder_slug });

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
    let folder_type = req.params.type;
    const content = req.body;

    dev.logfunction({ folder_type, content });

    const hrstart = process.hrtime();
    // create

    try {
      const d = await file.createFolder({
        folder_type,
        new_meta: content,
      });
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(d);
    } catch (err) {
      dev.error("Failed to update expected content: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  async function _updateResource(req, res, next) {
    let folder_type = req.params.type;
    let folder_slug = req.params.slug;
    const content = req.body;

    dev.logfunction({ folder_type, folder_slug, content });

    if (!folder_type) return res.status(422).send("Missing folder_type field");
    if (!global.settings.schema.hasOwnProperty(folder_type))
      return res.status(422).send("Missing schema for folder_type");
    if (!folder_slug) return res.status(422).send("Missing folder slug");
    if (!content) return res.status(422).send("Missing body");

    const hrstart = process.hrtime();

    try {
      const d = await file.updateFolderMeta({
        folder_type,
        folder_slug,
        new_meta: content,
      });

      // push only new fields EMIT with socketio
      myEmitter.emit("event", 1, 2, 3, 4, 5);

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(d);
    } catch (err) {
      dev.error("Failed to update expected content: " + err);
      res.status(500).send(err);
    }

    let hrend = process.hrtime(hrstart);
    dev.performance(`${hrend[0]}s ${hrend[1] / 1000000}ms`);
  }

  return API;
})();
