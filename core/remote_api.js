var cors = require('cors');

module.exports = (function() {
  const API = {
    init: app => {
      return _initRemoteApi(app);
    }
  };

  function _initRemoteApi(app) {
    dev.logfunction('REMOTE_API — _initRemoteApi');

    // list all of type (projects, publications, etc.)
    if (!global.settings.api.enabled) {
      return false;
    }

    dev.logverbose('REMOTE_API — _initRemoteApi : is enabled');

    app.get('/api/:type/:subtype', cors(_corsCheck), function(req, res, next) {
      _sendResource(req, res, next);
    });
  }

  function _corsCheck(req, callback) {
    dev.logfunction('REMOTE_API — _corsCheck');
    var corsOptions;
    if (global.settings.api.allow_all_domains) {
      dev.logverbose('REMOTE_API — _corsCheck : allowed for all domains');
      corsOptions = { origin: true };
    } else {
      dev.logverbose(
        'REMOTE_API — _initRemoteApi : allowed for specific domains'
      );

      if (
        global.settings.api.domains_whitelist.indexOf(req.header('Origin')) !==
        -1
      ) {
        corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
      } else {
        corsOptions = { origin: false }; // disable CORS for this request
      }
    }

    callback(null, corsOptions);
  }

  function _sendResource(req, res, next) {
    res.json({ msg: 'This works!' });
  }

  return API;
})();
