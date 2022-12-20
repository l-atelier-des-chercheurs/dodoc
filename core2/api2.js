const cors = require("cors"),
  url = require("url"),
  path = require("path");

const folder = require("./folder"),
  file = require("./file"),
  settings = require("./settings"),
  notifier = require("./notifier"),
  utils = require("./utils"),
  cache = require("./cache"),
  auth = require("./auth");

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
    app.use("/_api2/*", [cors(_corsCheck)]);
    // app.options("/_api2/*", cors());

    app.get("/_api2/_ip", _generalPasswordCheck, _getLocalNetworkInfos);
    app.get("/_api2/_authCheck", _checkGeneralPasswordAndToken);
    app.get("/_api2/_admin", _getAdminInfos);
    app.patch("/_api2/_admin", _setAdminInfos);
    app.post("/_api2/_restart", _restart);

    /* FILES */
    app.get(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug/:meta_filename",
      ],
      _generalPasswordCheck,
      _getFile
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/_upload",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug/_upload",
      ],
      _generalPasswordCheck,
      _authenticateToken,
      _uploadFile
    );
    app.patch(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug/:meta_filename",
      ],
      _generalPasswordCheck,
      _authenticateToken,
      _updateFile
    );
    app.delete(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug/:meta_filename",
      ],
      _generalPasswordCheck,
      _authenticateToken,
      _removeFile
    );

    /* FOLDERS */
    app.get(
      [
        "/_api2/:folder_type",
        "/_api2/:folder_type/:folder_slug/:subfolder_type",
      ],
      _generalPasswordCheck,
      _getFolders
    );
    app.post(
      ["/_api2/:folder_type/:folder_slug/_login"],
      _generalPasswordCheck,
      _loginToFolder
    );
    app.post(
      ["/_api2/:folder_type/:folder_slug/_logout"],
      _generalPasswordCheck,
      _logoutFromFolder
    );
    app.post(
      [
        "/_api2/:folder_type",
        "/_api2/:folder_type/:folder_slug/:subfolder_type",
      ],
      _generalPasswordCheck,
      _createFolder
    );

    app.get(
      [
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug",
      ],
      _generalPasswordCheck,
      _getFolder
    );
    app.patch(
      [
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug",
      ],
      _generalPasswordCheck,
      _authenticateToken,
      _updateFolder
    );
    app.delete(
      [
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:subfolder_type/:subfolder_slug",
      ],
      _generalPasswordCheck,
      _authenticateToken,
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

  async function _generalPasswordCheck(req, res, next) {
    dev.logapi();

    const { general_password } = await settings.get();
    if (!general_password) return next ? next() : undefined;

    try {
      if (!req.headers || !req.headers.authorization)
        throw new Error(`no_general_password_submitted`);

      const { general_password: submitted_general_password } = JSON.parse(
        req.headers.authorization
      );
      if (!submitted_general_password)
        throw new Error(`no_general_password_submitted`);

      if (submitted_general_password !== general_password)
        throw new Error(`wrong_general_password`);

      return next ? next() : undefined;
    } catch (err) {
      dev.error(err.message);
      if (res) return res.status(401).send({ message: err.message });
      throw err;
    }
  }

  async function _checkGeneralPasswordAndToken(req, res, next) {
    dev.logapi();
    let response = {};
    try {
      await _generalPasswordCheck(req);
      response.general_password_is_valid = true;
    } catch (err) {
      response.general_password_is_wrong = err.message;
    }

    try {
      await _authenticateToken(req);
      response.token_is_valid = true;
    } catch (err) {
      response.token_is_wrong = err.message;
    }

    return res.json(response);
  }

  async function _authenticateToken(req, res, next) {
    const { path_to_folder, path_to_parent_folder } =
      utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, path_to_parent_folder });

    // check if path and token match,
    // and either :
    // - if path matches the path of the folder that is about to be edited (for example, user authors/louis editing authors/louis)
    // - or if path is amongst the folder $authors
    // if so, then next(), otherwise return 403
    // ref = https://www.digitalocean.com/community/tutorials/nodejs-jwt-expressjs

    // todo not very clean, merge with auth.isAuthorIncluded
    const folder_meta = await folder.getFolder({ path_to_folder });
    if (!folder_meta.$authors || folder_meta.$authors.length === 0)
      return next ? next() : undefined;

    if (!req.headers || !req.headers.authorization)
      throw new Error(`no_token_set`);

    try {
      const { token, token_path } = JSON.parse(req.headers.authorization);
      if (!token || !token_path) throw new Error(`no_token_set`);

      auth.checkToken({ token, token_path });

      if (!path_to_folder) {
        // means we're just checking the validity of the token
        return next ? next() : undefined;
      }
      if (await auth.isAuthorAdmin({ author_path: token_path })) {
        dev.logapi("Author is admin, next");
        return next ? next() : undefined;
      }
      if (path_to_folder === token_path) {
        dev.logapi("Token path and folder path are identical, next");
        return next ? next() : undefined;
      }

      // if folder is child/has parent, the parent's authors will determine who can edit this child
      if (path_to_parent_folder)
        await auth.isAuthorIncluded({
          path_to_folder: path_to_parent_folder,
          author_path: token_path,
        });
      else
        await auth.isAuthorIncluded({
          path_to_folder,
          author_path: token_path,
        });

      dev.logapi("Author allowed, next");
      return next ? next() : undefined;
    } catch (err) {
      dev.error(err.message);
      if (res) return res.status(403).send({ message: err.message });
      throw err;
    }
  }

  async function loadIndex(req, res) {
    dev.logapi();
    let d = {};
    d.schema = global.settings.schema;
    d.debug_mode = dev.isDebug();

    // get instance name
    // get logo/favicon
    // get session password
    // get author creation password
    const {
      name_of_instance,
      presentation_of_instance,
      contactmail_of_instance,
      general_password,
      signup_password,
    } = await settings.get();
    if (name_of_instance) d.name_of_instance = name_of_instance;
    if (presentation_of_instance)
      d.presentation_of_instance = presentation_of_instance;
    if (contactmail_of_instance)
      d.contactmail_of_instance = contactmail_of_instance;

    d.has_general_password = !!general_password;
    d.has_signup_password = !!signup_password;

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
      _sendErrorToClient({ res, err });
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
      res.setHeader("Access-Control-Allow-Origin", "*");
      dev.logpackets({ d });
      res.json(d);
    } catch (err) {
      dev.error("Failed to get expected content: " + err);
      _sendErrorToClient({ res, err });
    }
    cache.printStatus();
  }

  async function _updateFolder(req, res, next) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    const update_cover = req.query?.hasOwnProperty("cover");
    dev.logapi({ path_to_folder, data, update_cover });

    try {
      const changed_data = await folder.updateFolder({
        path_to_folder,
        data,
        update_cover_req: update_cover ? req : false,
      });
      dev.logpackets({ status: "folder was updated" });
      res.status(200).json({ status: "ok" });

      // TODO if $password is updated successfully, then revoke all tokens except current

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
  async function _loginToFolder(req, res, next) {
    const { path_to_folder, data } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, data });

    try {
      await folder.login({
        path_to_folder,
        submitted_password: data.$password,
      });

      // if no throwing error, we generate a token, store it node/electron side and send it back to the client
      // this token matches a path such as authors/louis
      // any folder that has authors can only be updated/removed by users with a valid token corresponding to those authors
      const token = await auth.createAndStoreToken({
        path_to_folder,
      });
      dev.logpackets({ status: "logged in to folder", path_to_folder, token });
      res.status(200).json({ status: "ok", token });
    } catch (err) {
      dev.error("Failed to login to folder: " + err.message);
      res.status(500).send({ code: err.code });
    }
  }
  async function _logoutFromFolder(req, res, next) {
    const { path_to_folder, data } = utils.makePathFromReq(req);
    const token = data.token;
    dev.logapi({ path_to_folder, token });

    try {
      // not sure we need to check token before revoking it
      // auth.checkToken({ token, token_path: path_to_folder });
      await auth.revokeToken({
        token_to_revoke: token,
      });
      dev.logpackets({
        status: "logged out from folder",
        token,
        path_to_folder,
      });
      res.status(200).json({ status: "ok" });
    } catch (err) {
      dev.error("Failed to logout from folder: " + err.message);
      res.status(500).send({ code: err.code });
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

      await auth.removeAllTokensForFolder({ token_path: path_to_folder });

      notifier.emit("folderRemoved", path_to_folder, { path: path_to_folder });
      notifier.emit("folderRemoved", path_to_type, { path: path_to_folder });
    } catch (err) {
      dev.error("Failed to remove expected content: " + err);
      res.status(404).send(err);
    }
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
        path_to_folder,
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
        path_to_folder,
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

  async function _checkAuth(req, res, next) {}

  async function _getAdminInfos(req, res, next) {
    // TODO only available to admins
    dev.logapi();
    const admin_infos = await settings.get();
    res.status(200).json(admin_infos);
  }
  async function _setAdminInfos(req, res, next) {
    // TODO only available to admins
    const { data } = utils.makePathFromReq(req);
    dev.logapi({ data });

    try {
      const changed_data = await settings.set({ input_meta: data });

      dev.logpackets({ status: "adminSettings were updated" });
      res.status(200).json({ status: "ok" });

      notifier.emit("adminSettingsUpdated", "_admin", { changed_data });
    } catch (err) {
      res.status(500).send(err);
    }
  }
  async function _restart(req, res, next) {
    dev.logapi({ data });
    // TODO only available to admins
    notifier.emit("restart");
  }

  function _sendErrorToClient({ res, err }) {
    // TODO handle all errors
    if (err.code === "ENOENT") {
      res.status(404).send({ message: "no_such_file_or_folder" });
    } else if (err.message) {
      res.status(500).send({ message: err.message });
    } else {
      debugger;
    }
  }

  return API;
})();
