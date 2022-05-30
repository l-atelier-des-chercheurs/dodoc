const cors = require("cors");
const url = require("url");

const file = require("./file2"),
  auth = require("../core/auth");

module.exports = (function () {
  const API = {
    init: (app) => {
      return _initAPI(app);
    },
  };

  function _initAPI(app) {
    dev.logfunction("API2 — _initAPI");
    app.options("/api2/*", cors());

    app.get(
      "/api2/:type?/:slug?",
      [cors(_corsCheck), _sessionPasswordCheck],
      _sendResources
    );
  }

  function _corsCheck(req, callback) {
    dev.logfunction("API2 — _corsCheck");
    // dev.logverbose(`API2 — _corsCheck : ${JSON.stringify(req.headers)}`);
    // check origin

    callback(null, { origin: true });
  }
  function _sessionPasswordCheck(req, res, next) {
    next();
  }

  async function _sendResources(req, res, next) {
    let folder_type = req.params.type;
    let folder_slug = req.params.slug;
    dev.logfunction({ folder_type }, { folder_slug });

    if (!folder_type) return res.status(422).send("Missing folder_type field");

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
    dev.performance(
      `PERFORMANCE — _getContent : ${hrend[0]}s ${hrend[1] / 1000000}ms`
    );
  }

  return API;
})();
