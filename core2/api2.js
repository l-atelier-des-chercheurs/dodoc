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
    app.options("/api2/:type/:slug?", cors());
    app.get(
      "/api2/:type/:slug?",
      [cors(_corsCheck), _sessionPasswordCheck],
      _sendResources
    );
  }

  function _corsCheck(req, callback) {
    dev.logfunction("API2 — _corsCheck");
    dev.logverbose(`API2 — _corsCheck : ${JSON.stringify(req.headers)}`);
    // check origin

    callback(null, { origin: true });
  }
  function _sessionPasswordCheck(req, res, next) {
    next();
  }

  function _sendResources(req, res, next) {
    dev.logfunction("API2 — _sendResources");

    let type = req.params.type;
    let slugFolderName = req.params.slug;

    const hrstart = process.hrtime();
    _getContent({ type, slugFolderName, req })
      .then((d) => {
        dev.log("Returned api request successfully");
        let hrend = process.hrtime(hrstart);
        dev.performance(
          `PERFORMANCE — _getContent : ${hrend[0]}s ${hrend[1] / 1000000}ms`
        );
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(d);
      })
      .catch((err) => {
        dev.error("Failed to get expected content: " + err);
        res.status(500).send("Error parsing request: " + err);
      });
  }

  async function _getContent({ type, slugFolderName, req }) {
    dev.logfunction(
      `API2 - _getContent for type = ${type}, slugFolderName = ${slugFolderName}`
    );

    const content = await file.getFolder();

    return content;
  }

  return API;
})();
