const cors = require("cors");
const url = require("url");

const file = require("./file"),
  auth = require("./auth");

module.exports = (function() {
  const API = {
    init: app => {
      return _initRemoteApi(app);
    }
  };

  function _initRemoteApi(app) {
    dev.logfunction("REMOTE_API — _initRemoteApi");

    // list all of type (projects, publications, etc.)
    if (!global.settings.api.enabled) {
      return false;
    }

    dev.logverbose("REMOTE_API — _initRemoteApi : is enabled");

    //https://github.com/expressjs/cors#enabling-cors-pre-flight
    app.options("/api/:type/:slug?", cors());
    app.get(
      "/api/:type/:slug?",
      [cors(_corsCheck), _sessionPasswordCheck],
      _sendResources
    );
  }

  function _corsCheck(req, callback) {
    dev.logfunction("REMOTE_API — _corsCheck");
    dev.logverbose(`REMOTE_API — _corsCheck : ${JSON.stringify(req.headers)}`);
    var corsOptions;
    if (global.settings.api.allow_all_domains) {
      dev.logverbose("REMOTE_API — _corsCheck : allowed for all domains");
      next();
    } else {
      if (
        !req.headers.hasOwnProperty("Origin") &&
        !req.headers.hasOwnProperty("origin")
      ) {
        dev.error(`REMOTE_API — _corsCheck : missing Origin in header`);
        callback(new Error("Missing origin in request"));
      }

      dev.logverbose(
        `REMOTE_API — _corsCheck : allowed for specific domains. Whitelist is: ${global.settings.api.domains_whitelist.join(
          ", "
        )}`
      );

      const _origin = req.headers.hasOwnProperty("Origin")
        ? req.headers["Origin"]
        : req.headers["origin"];

      const origin_hostname = url.parse(_origin).hostname;
      dev.logverbose(
        `REMOTE_API — _corsCheck : checking against origin_hostname : ${origin_hostname}`
      );

      if (
        global.settings.api.domains_whitelist.indexOf(origin_hostname) !== -1
      ) {
        dev.logverbose(`REMOTE_API — _corsCheck : check passed`);
        callback(null, { origin: true });
      } else {
        dev.error(
          `REMOTE_API — _corsCheck : check failed, hostname not authorized`
        );
        callback(new Error("Not allowed by CORS"));
      }
    }
  }

  function _sessionPasswordCheck(req, res, next) {
    dev.logfunction("REMOTE_API — _sessionPasswordCheck");

    if (global.hasOwnProperty("session_password")) {
      if (global.session_password !== "") {
        // note : no underscore in custom headers in nginx by default
        if (!req.headers.hasOwnProperty("session-password")) {
          dev.error("REMOTE_API — _sessionPasswordCheck : no password sent");
          return res
            .status(500)
            .send(
              "No session-password sent while this do•doc uses a session_password, please add it"
            );
        }

        const request_session_password = new Buffer(
          req.headers["session-password"],
          "base64"
        ).toString("binary");

        if (
          !auth.isSubmittedSessionPasswordValid(
            auth.hashCode(request_session_password)
          )
        ) {
          dev.error("REMOTE_API — _sessionPasswordCheck : wrong password");
          dev.error(
            `Submitted: "${auth.hashCode(
              request_session_password
            )}" — Should be: "${global.session_password}"`
          );
          return res.status(500).send("Wrong password sent!");
        }
      }
    }

    dev.logverbose(
      "REMOTE_API — _sessionPasswordCheck : password checks passed"
    );
    next();
  }

  function _sendResources(req, res, next) {
    dev.logfunction("REMOTE_API — _sendResources");

    let type = req.params.type;
    let slugFolderName = req.params.slug;

    const hrstart = process.hrtime();
    _getContent({ type, slugFolderName, req })
      .then(d => {
        dev.log("Returned api request successfully");
        let hrend = process.hrtime(hrstart);
        dev.performance(
          `PERFORMANCE — _getContent : ${hrend[0]}s ${hrend[1] / 1000000}ms`
        );
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(d);
      })
      .catch(err => {
        dev.error("Failed to get expected content: " + err);
        res.status(500).send("Error parsing request: " + err);
      });
  }

  function _getContent({ type, slugFolderName, req }) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(
        `REMOTE_API - _getContent for type = ${type}, slugFolderName = ${slugFolderName}`
      );

      let foldersData;

      file
        .getFolder({ type, slugFolderName })
        .then(_foldersData => {
          if (_foldersData === undefined) {
            return reject("No folder found with name " + slugFolderName);
          }

          foldersData = _foldersData;

          if (!slugFolderName) {
            foldersData = _removePasswordFromFoldersMeta(foldersData);
            return resolve(foldersData);
          } else {
            if (!foldersData.hasOwnProperty(slugFolderName)) {
              dev.error(
                `REMOTE_API — _getContent : no folder with this slug exists: ${slugFolderName}`
              );
              return reject("No folder with this slug exists!");
            }

            if (
              foldersData[slugFolderName].hasOwnProperty("password") &&
              foldersData[slugFolderName].password !== ""
            ) {
              if (
                !req.hasOwnProperty("headers") ||
                !req.headers.hasOwnProperty("folder-password")
              ) {
                dev.error(
                  `REMOTE_API — _getContent : no password submitted for protected folder ${slugFolderName}`
                );
                return reject("No password submitted for protected folder!");
              }

              const request_folder_password = new Buffer(
                req.headers["folder-password"],
                "base64"
              ).toString("binary");

              if (
                request_folder_password !== foldersData[slugFolderName].password
              ) {
                dev.error(
                  `REMOTE_API — _getContent : wrong password for folder ${slugFolderName}`
                );
                dev.error(
                  `Submitted: ${request_folder_password}\nShould be: ${foldersData[slugFolderName].password}`
                );
                return reject("Wrong password sent!");
              }
            }

            // only continue if requesting a specific folder
            // the code isnt exactly the clearest though
            return file.getMediaMetaNames({
              type,
              slugFolderName
            });
          }
        })
        .then(list_metaFileName => {
          let medias_list = list_metaFileName.map(_metaFileName => {
            return {
              slugFolderName,
              metaFileName: _metaFileName
            };
          });
          return file.readMediaList({ type, medias_list });
        })
        .then(folders_and_medias => {
          if (
            folders_and_medias !== undefined &&
            Object.keys(folders_and_medias).length
          ) {
            foldersData[slugFolderName].medias =
              folders_and_medias[slugFolderName].medias;
          }

          // disabled : if passwords don’t match, content is rejected
          // in the future we’ll return only public medias instead
          // if (
          //   foldersData[slugFolderName].hasOwnProperty('password') &&
          //   foldersData[slugFolderName].password !== ''
          // ) {
          //   if (
          //     !req.headers.hasOwnProperty('folder-password') ||
          //     request_folder_password !==
          //       foldersData[slugFolderName].password
          //   ) {
          //     foldersData = auth.removeNonPublicMediasFromAllFolders(
          //       foldersData
          //     );
          //   }
          // }

          foldersData = _removePasswordFromFoldersMeta(foldersData);

          // TODO :
          if (
            !global.settings.structure[type].hasOwnProperty("medias") ||
            !global.settings.structure[type]["medias"].fields.hasOwnProperty(
              "slugMediaName"
            )
          ) {
            return resolve(foldersData);
          }

          let tasks = [];

          Object.keys(foldersData[slugFolderName].medias).map(k => {
            const _media = foldersData[slugFolderName].medias[k];
            if (!_media.hasOwnProperty("slugMediaName")) {
              return;
            }

            let get_original_media_meta = new Promise((resolve, reject) => {
              file
                .readMediaAndThumbs({
                  type: "projects",
                  slugFolderName: _media.slugProjectName,
                  metaFileName: _media.slugMediaName
                })
                .then(meta => {
                  if (!meta) {
                    // case of non-existent media (was removed recently for example)
                  } else {
                    foldersData[slugFolderName].medias[
                      k
                    ]._source_media_meta = meta;
                  }
                  return resolve();
                });
            });
            tasks.push(get_original_media_meta);
          });

          Promise.all(tasks).then(() => {
            return resolve(foldersData);
          });
        })
        .catch(err => reject(err));
    });
  }

  function _removePasswordFromFoldersMeta(foldersData) {
    Object.keys(foldersData).map(s => {
      if (
        foldersData[s].hasOwnProperty("password") &&
        foldersData[s].password !== ""
      ) {
        foldersData[s].password = "has_pass";
      }
    });
    return foldersData;
  }

  return API;
})();
