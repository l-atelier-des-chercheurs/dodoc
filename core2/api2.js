const cors = require("cors"),
  url = require("url"),
  path = require("path"),
  archiver = require("archiver");

const folder = require("./folder"),
  file = require("./file"),
  settings = require("./settings"),
  notifier = require("./notifier"),
  utils = require("./utils"),
  Exporter = require("./Exporter"),
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

    app.get(
      "/_api2/_networkInfos",
      _generalPasswordCheck,
      _getLocalNetworkInfos
    );
    app.get("/_api2/_authCheck", _checkGeneralPasswordAndToken);

    app.get("/_api2/_storagePath", _onlyAdmins, _getStoragePath);
    app.patch("/_api2/_storagePath", _onlyAdmins, _setStoragePath);
    app.post("/_api2/_restart", _onlyAdmins, _restart);

    /* PUBLIC FILES */
    app.get(
      [
        "/_api2/:folder_type/:folder_slug/_public",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_public",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_public",
      ],
      _getPublicFolder
    );

    /* FILES */
    app.get(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/:meta_filename",
      ],
      _generalPasswordCheck,
      _getFile
    );
    app.post(
      [
        "/_api2/_upload",
        "/_api2/:folder_type/:folder_slug/_upload",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_upload",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_upload",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _uploadFile
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename/_optimize",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:meta_filename/_optimize",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/:meta_filename/_optimize",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _exportToParent
    );
    app.patch(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/:meta_filename",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _updateFile
    );
    app.delete(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/:meta_filename",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _removeFile
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename/_copy",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:meta_filename/_copy",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/:meta_filename/_copy",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _copyFile
    );

    /* FOLDERS */
    app.get(
      [
        "/_api2/:folder_type",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type",
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
        "/_api2/:folder_type/_create",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/_create",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/_create",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _createFolder
    );
    app.post(
      [
        "/_api2/:folder_type/_import",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/_import",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/_import",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _importFolder
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/_export",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_export",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_export",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _exportToParent
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/_copy",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_copy",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_copy",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _copyFolder
    );
    app.get(
      [
        "/_api2/:folder_type/:folder_slug.zip",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug.zip",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug.zip",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _downloadFolder
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/_remix",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_remix",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_remix",
      ],
      _generalPasswordCheck,
      _remixFolder
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/_generatePreview",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_generatePreview",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_generatePreview",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _generatePreview
    );
    app.get(
      [
        "/_api2/",
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug",
      ],
      _generalPasswordCheck,
      _getFolder
    );

    app.patch(
      [
        "/_api2/",
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _updateFolder
    );
    app.delete(
      [
        "/_api2/:folder_type/:folder_slug",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
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
      if (!req.headers || !req.headers.authorization) {
        const err = new Error("Headers and general password missing");
        err.code = "no_headers_with_general_password_submitted";
        throw err;
      }

      const { general_password: submitted_general_password } = JSON.parse(
        req.headers.authorization
      );
      if (!submitted_general_password) {
        const err = new Error("General password missing");
        err.code = "no_general_password_submitted";
        throw err;
      }

      if (submitted_general_password !== general_password) {
        const err = new Error("Submitted general password is wrong");
        err.code = "submitted_general_password_is_wrong";
        throw err;
      }

      return next ? next() : undefined;
    } catch (err) {
      dev.error(err.message);
      if (res) return res.status(401).send({ code: err.code });
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
      response.general_password_is_wrong = err.code;
    }

    try {
      const { token, token_path } = JSON.parse(req.headers.authorization);
      if (!token || !token_path) {
        const err = new Error("Token and/or token_path missing in headers");
        err.code = "no_token_submitted";
        throw err;
      }
      auth.checkTokenValidity({ token, token_path });
      response.token_is_valid = true;
    } catch (err) {
      response.token_is_wrong = err.code;
    }

    return res.json(response);
  }

  async function _canContributeToFolder({ path_to_type, path_to_folder, req }) {
    dev.logapi();

    if (path_to_type && auth.canFolderBeCreatedByAll({ path_to_type }))
      return "Folder contribution allowed to all according to schema";

    if (
      (await auth.isFolderOpenedToAll({
        field: "$contributors",
        path_to_folder,
      })) ||
      (await auth.isFolderOpenedToAll({ field: "$admins", path_to_folder }))
    )
      return "Folder opened to any contributors or admins";

    const token_path = auth.extrackAndCheckToken({ req });

    if (token_path) {
      if (token_path === path_to_folder) return "Token editing self";
      if (
        await auth.isTokenIncluded({
          field: "$contributors",
          path_to_folder,
          token_path,
        })
      )
        return "Token is contributor";
    }

    const allowed = await _canAdminFolder({
      path_to_folder,
      req,
    });
    if (allowed) return allowed;

    return false;
  }

  async function _canAdminFolder({ path_to_folder, req }) {
    dev.logapi();

    if (
      (await auth.isFolderOpenedToAll({
        field: "$admins",
        path_to_folder,
      })) ||
      (await auth.isInstanceOpenedToAll())
    )
      return "Folder opened to any contributors";

    if (
      await auth.isFolderInheritingFromParent({
        field: "$admins",
        path_to_folder,
      })
    ) {
      const path_to_parent_folder = utils.getFolderParent(path_to_folder);
      if (!path_to_parent_folder) return false;
      const allowed = await _canContributeToFolder({
        path_to_folder: path_to_parent_folder,
        req,
      });
      // if so, return
      if (allowed) return "Parent inheritance: " + allowed;
      else return false;
    }

    const token_path = auth.extrackAndCheckToken({ req });

    if (token_path) {
      if (token_path === path_to_folder) return "Token editing self";
      if (await auth.isTokenInstanceAdmin({ token_path }))
        return "Token is instance admin";
      if (
        await auth.isTokenIncluded({
          field: "$admins",
          path_to_folder,
          token_path,
        })
      )
        return "Token is local admin";
    }

    const path_to_parent_folder = utils.getFolderParent(path_to_folder);
    if (!path_to_parent_folder) return false;
    const allowed = await _canAdminFolder({
      path_to_folder: path_to_parent_folder,
      req,
    });
    if (allowed) return "Parent inheritance: " + allowed;

    return false;
  }

  async function _restrictToContributors(req, res, next) {
    const { path_to_type, path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    const allowed = await _canContributeToFolder({
      path_to_type,
      path_to_folder,
      req,
    });

    if (allowed) {
      dev.log(allowed);
      return next();
    } else {
      dev.error("not allowed to contribute");
      if (res) return res.status(401).send({ code: "not_allowed" });
      return false;
    }
  }
  async function _restrictToLocalAdmins(req, res, next) {
    const { path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    const allowed = await _canAdminFolder({
      path_to_folder,
      req,
    });

    if (allowed) {
      dev.log(allowed);
      return next();
    } else {
      dev.log("not allowed to contribute");
      if (res) return res.status(403).send({ code: "not_allowed" });
    }
  }
  async function _onlyAdmins(req, res, next) {
    dev.logapi();

    try {
      const token_path = auth.extrackAndCheckToken({ req });

      if (await auth.isTokenInstanceAdmin({ token_path }))
        return next ? next() : undefined;

      const err = new Error("Token not allowed");
      err.code = "token_not_allowed_must_admin";
      throw err;
    } catch (err) {
      dev.error(err.message);
      if (res) return res.status(403).send({ code: err.code });
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
      hero_background_color,
      text_background_color,
      text_image_layout,
      general_password,
      signup_password,
      require_signup_to_contribute,
      require_mail_to_signup,
      enable_events,
      $admins,
      $contributors,

      favicon_image_name,
      topbar_image_name,
      hero_image_name,
      $files = [],
    } = await settings
      .get()
      .catch((err) => dev.error("Error while getting settings", err));

    d.name_of_instance = name_of_instance || "";
    d.presentation_of_instance = presentation_of_instance || "";
    d.contactmail_of_instance = contactmail_of_instance || "";
    d.hero_background_color = hero_background_color || "";
    d.text_background_color = text_background_color || "";
    d.text_image_layout = text_image_layout || "";
    d.has_general_password = !!general_password;
    d.signup_password_hashed = signup_password
      ? utils.hashCode(signup_password)
      : "";
    d.require_signup_to_contribute = require_signup_to_contribute === true;
    d.require_mail_to_signup = require_mail_to_signup === true;
    d.enable_events = enable_events === true;
    d.$admins = $admins || "";
    d.$contributors = $contributors || "";

    const findMatchingFileThumb = ({ meta_name, resolution }) => {
      const matching_file = $files.find(
        (f) => utils.getFilename(f.$path) === meta_name
      );
      if (matching_file && matching_file.$thumbs)
        return matching_file.$thumbs[resolution];
      return false;
    };

    const favicon_thumb = findMatchingFileThumb({
      meta_name: favicon_image_name,
      resolution: 640,
    });
    if (favicon_thumb) d.favicon_url = `/thumbs/${favicon_thumb}`;

    const topbar_thumb = findMatchingFileThumb({
      meta_name: topbar_image_name,
      resolution: 320,
    });
    if (topbar_thumb) d.topbar_thumb = `/thumbs/${topbar_thumb}`;

    const hero_thumb = findMatchingFileThumb({
      meta_name: hero_image_name,
      resolution: 2000,
    });
    if (hero_thumb) d.hero_thumb = `/thumbs/${hero_thumb}`;

    d.custom_fonts = (await _loadCustomFonts()) || {};

    res.render("index2", d);
  }
  function loadPerf(rea, res) {
    let d = {};
    d.local_ips = utils.getLocalIPs();
    res.render("perf", d);
  }

  async function _getFolders(req, res, next) {
    const { path_to_type } = utils.makePathFromReq(req);

    try {
      let d = await folder.getFolders({ path_to_type });

      // todo : filter depending on $status, only authors see folders

      res.setHeader("Access-Control-Allow-Origin", "*");
      dev.logpackets({ d });
      res.json(d);
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to get folders: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }

    // cache.printStatus();
  }
  async function _createFolder(req, res, next) {
    const { path_to_type, data } = utils.makePathFromReq(req);
    dev.logapi({ path_to_type });

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
      const { message, code, err_infos } = err;
      dev.error("Failed to create folder: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }
  async function _importFolder(req, res, next) {
    const { path_to_type } = utils.makePathFromReq(req);
    dev.logapi({ path_to_type });

    try {
      const new_folder_slug = await folder.importFolder({
        path_to_type,
        req,
      });
      dev.logpackets(`folder was imported with name ${new_folder_slug}`);
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
      const { message, code, err_infos } = err;
      dev.error("Failed to import folder: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }

  async function _getFolder(req, res, next) {
    const { path_to_folder = "" } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    const detailed = req.query?.detailed === "true";
    const hrstart = process.hrtime();

    try {
      let d = await folder.getFolder({ path_to_folder, detailed });
      const files = await file.getFiles({ path_to_folder });
      d.$files = files;

      let hrend = process.hrtime(hrstart);
      dev.performance(
        `${path_to_folder} – ${hrend[0]}s ${hrend[1] / 1000000}ms`
      );

      res.setHeader("Access-Control-Allow-Origin", "*");
      dev.logpackets({ d });
      res.json(d);
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to create folder: " + message);
      res.status(404).send({
        code,
        err_infos,
      });
    }
    // cache.printStatus();
  }

  async function _getPublicFolder(req, res, next) {
    const { path_to_folder = "" } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    try {
      let d = await folder.getFolder({ path_to_folder });
      if (d.$public !== true) {
        // only allow queries with superadmintoken
        if (!auth.checkSuperadminToken(req.query?.sat)) {
          const err = new Error("Folder is not public");
          err.code = "folder_not_public";
          throw err;
        }
      }

      const files = await file.getFiles({ path_to_folder, embed_source: true });

      d.$files = files;

      res.setHeader("Access-Control-Allow-Origin", "*");
      dev.logpackets({ d });
      res.json(d);
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to create folder: " + message);
      res.status(404).send({
        code,
        err_infos,
      });
    }
  }

  async function _updateFolder(req, res, next) {
    const {
      path_to_type,
      path_to_folder = "",
      data,
    } = utils.makePathFromReq(req);
    const update_cover = req.query?.hasOwnProperty("cover");
    dev.logapi({ path_to_folder, data, update_cover });

    try {
      const changed_data = await folder.updateFolder({
        path_to_type,
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
      if (path_to_type)
        notifier.emit("folderUpdated", path_to_type, {
          path: path_to_folder,
          changed_data,
        });
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to update folder: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
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
      const { message, code, err_infos } = err;
      dev.error("Failed to login to folder: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }
  async function _logoutFromFolder(req, res, next) {
    const { path_to_folder, data } = utils.makePathFromReq(req);
    const token = data.token;
    dev.logapi({ path_to_folder, token });

    try {
      // not sure we need to check token before revoking it
      // auth.checkTokenValidity({ token, token_path: path_to_folder });
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
      const { message, code, err_infos } = err;
      dev.error("Failed to logout to folder: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
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
      const { message, code, err_infos } = err;
      dev.error("Failed to remove content: " + message);
      res.status(404).send({
        code,
        err_infos,
      });
    }
  }

  async function _uploadFile(req, res, next) {
    const { path_to_folder = "" } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    try {
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
      const { message, code, err_infos } = err;
      dev.error("Failed to upload file: " + message);
      try {
        res.status(500).send({
          code,
          err_infos,
        });
      } catch (e) {}
    }
  }
  async function _exportToParent(req, res, next) {
    const { path_to_folder, path_to_parent_folder, meta_filename, data } =
      utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, path_to_parent_folder, data });

    // export to folder if optimizing file, otherwise export to parent
    const folder_to_export_to = meta_filename
      ? path_to_folder
      : path_to_parent_folder;

    // DISPATCH TASKS
    const task = new Exporter({
      path_to_folder,
      folder_to_export_to,
      instructions: data,
    });
    const task_id = task.id;

    // TODO
    // 1. create a task with parameters: settings / author that started it / source folder path / destination slug path  / time created / etc.
    // 2. return ID of task to client
    // 3. using this ID, client can join a room to get progress on task
    // 4. when task finishes, it notifies client with notifier and also triggers a fileCreated

    dev.logpackets({
      status: `task_started`,
      folder_to_export_to,
      task_id,
    });
    res.status(200).json({ task_id });

    // wait a bit to make sure that the client has the time to watch task, in case it fails right away
    await new Promise((r) => setTimeout(r, 100));

    try {
      const exported_path_to_meta = await task.start();
      const meta = await file.getFile({
        path_to_meta: exported_path_to_meta,
      });
      notifier.emit("fileCreated", folder_to_export_to, {
        path_to_folder: folder_to_export_to,
        meta,
      });
    } catch (err) {
      dev.error("Failed to export file: " + err);
      notifier.emit("taskEnded", task_id, {
        task_id,
        message: err,
      });
    }
  }

  async function _copyFolder(req, res, next) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    dev.logapi({ path_to_type, path_to_folder, data });

    try {
      let { path_to_destination_type, new_meta } = data;
      if (!path_to_destination_type) path_to_destination_type = path_to_type;
      else if (path_to_destination_type !== path_to_type) {
        // todo check for auth to copy folder
        const path_to_parent_folder = utils.getContainingFolder(
          path_to_destination_type
        );
        const allowed = await _canContributeToFolder({
          path_to_folder: path_to_parent_folder,
          req,
        });
        if (!allowed) {
          const err = new Error(
            "Destination folder not open to user contribution"
          );
          err.code = "not_allowed_to_copy_folder";
          throw err;
        }
      }

      const path_to_source_folder = path_to_folder;

      const copy_folder_path = await folder.copyFolder({
        path_to_type,
        path_to_source_folder,
        path_to_destination_type,
        new_meta,
      });
      dev.logpackets({
        status: `copied folder`,
        path_to_source_folder,
        path_to_destination_type,
      });
      res.status(200).json({ copy_folder_path });

      const new_folder_meta = await folder.getFolder({
        path_to_folder: copy_folder_path,
      });

      notifier.emit("folderCreated", path_to_destination_type, {
        path: path_to_destination_type,
        meta: new_folder_meta,
      });
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to copy content: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }
  async function _downloadFolder(req, res, next) {
    const { path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    try {
      const folder_slug = utils.getFilename(path_to_folder);
      res.header("Content-Type", "application/zip");
      res.header(
        "Content-Disposition",
        `attachment; filename="${folder_slug}.zip"`
      );
      // const { size } = await thumbs.getInfosForFolder({
      //   path_to_folder,
      // });
      // if (size) res.header("Content-Length", size);

      const archive = archiver("zip", {
        zlib: { level: 0 },
      });
      archive.on("warning", (err) => {
        throw err;
      });
      archive.on("error", function (err) {
        throw err;
      });
      archive.pipe(res);

      const full_folder_path = utils.getPathToUserContent(path_to_folder);
      archive.directory(full_folder_path, folder_slug);

      archive.finalize();

      dev.log(`download started`);
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to download content: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }

  async function _remixFolder(req, res, next) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    dev.logapi({ path_to_type, path_to_folder, data });

    try {
      let { path_to_destination_type, new_meta } = data;
      if (!path_to_destination_type) path_to_destination_type = path_to_type;
      else if (path_to_destination_type !== path_to_type) {
        // todo check for auth to copy folder
        const path_to_parent_folder = utils.getContainingFolder(
          path_to_destination_type
        );
        const allowed = await _canContributeToFolder({
          path_to_folder: path_to_parent_folder,
          req,
        });
        if (!allowed) {
          const err = new Error(
            "Destination folder not open to user contribution"
          );
          err.code = "not_allowed_to_remix_folder";
          throw err;
        }
      }

      const path_to_source_folder = path_to_folder;
      new_meta.$is_remix_of = path_to_source_folder;

      const remix_folder_path = await folder.copyFolder({
        path_to_type,
        path_to_source_folder,
        path_to_destination_type,
        new_meta,
      });
      dev.logpackets({
        status: `remixed folder`,
        path_to_source_folder,
        path_to_destination_type,
      });
      res.status(200).json({ remix_folder_path });

      await _updateFolderListOfRemixes({
        path_to_type,
        path_to_folder,
        new_remix_path: remix_folder_path,
      });

      const new_folder_meta = await folder.getFolder({
        path_to_folder: remix_folder_path,
      });

      notifier.emit("folderCreated", path_to_destination_type, {
        path: path_to_destination_type,
        meta: new_folder_meta,
      });
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to remix folder: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }

  async function _updateFolderListOfRemixes({
    path_to_type,
    path_to_folder,
    new_remix_path,
  }) {
    dev.logapi({ path_to_type, path_to_folder, new_remix_path });

    const new_folder_meta = await folder.getFolder({
      path_to_folder,
    });

    let $list_of_remixes = new_folder_meta.$list_of_remixes || [];
    $list_of_remixes.push(new_remix_path);

    const data = { $list_of_remixes };

    const changed_data = await folder.updateFolder({
      path_to_type,
      path_to_folder,
      data,
    });

    notifier.emit("folderUpdated", path_to_folder, {
      path: path_to_folder,
      changed_data,
    });
    if (path_to_type)
      notifier.emit("folderUpdated", path_to_type, {
        path: path_to_folder,
        changed_data,
      });
  }

  async function _generatePreview(req, res, next) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, data });

    // TODO : do not move to parent folder, instead use that file as $cover
    const task = new Exporter({
      path_to_folder,
      folder_to_export_to: path_to_folder,
      instructions: data,
    });
    const task_id = task.id;
    res.status(200).json({ task_id });

    // wait a bit to make sure that the client has the time to watch task, in case it fails right away
    await new Promise((r) => setTimeout(r, 100));

    try {
      const exported_path_to_meta = await task.start();
      const changed_data = await folder.updateFolder({
        path_to_folder,
        data: { path_to_meta: exported_path_to_meta },
        update_cover_req: true,
      });

      notifier.emit("folderUpdated", path_to_folder, {
        path: path_to_folder,
        changed_data,
      });
      notifier.emit("folderUpdated", path_to_type, {
        path: path_to_folder,
        changed_data,
      });
    } catch (err) {
      dev.error("Failed to generate preview: " + err);
      notifier.emit("taskEnded", task_id, {
        task_id,
        message: err,
      });
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
      const { message, code, err_infos } = err;
      dev.error("Failed to get file: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
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
      const { message, code, err_infos } = err;
      dev.error("Failed to update file: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
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
      const { message, code, err_infos } = err;
      dev.error("Failed to remove file: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }

  async function _copyFile(req, res, next) {
    const { path_to_folder, meta_filename, path_to_meta, data } =
      utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, path_to_meta, data });

    try {
      let { path_to_destination_folder, new_meta } = data;
      if (!path_to_destination_folder)
        path_to_destination_folder = path_to_folder;
      else {
        // todo check for auth to copy to folder
        const allowed = await _canContributeToFolder({
          path_to_folder: path_to_destination_folder,
          req,
        });
        if (!allowed) {
          const err = new Error(
            "Destination folder not open to user contribution"
          );
          err.code = "not_allowed_to_copy_to_folder";
          throw err;
        }
      }

      const copy_meta_filename = await file.copyFile({
        path_to_folder,
        path_to_destination_folder,
        meta_filename,
        path_to_meta,
        new_meta,
      });
      dev.logpackets({
        status: `copied file`,
        path_to_folder,
        path_to_destination_folder,
        copy_meta_filename,
      });
      res.status(200).json({ meta_filename: copy_meta_filename });

      const meta = await file.getFile({
        path_to_meta: path.join(path_to_destination_folder, copy_meta_filename),
      });
      notifier.emit("fileCreated", path_to_destination_folder, {
        path_to_folder: path_to_destination_folder,
        meta,
      });
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to copy folder: " + message);
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }

  function _getLocalNetworkInfos(req, res, next) {
    dev.logapi();

    const local_ips = utils.getLocalIPs();
    const protocol = global.settings.protocol;
    const port = global.appInfos.port;

    res.status(200).json({
      local_ips,
      protocol,
      port,
    });
  }

  async function _checkAuth(req, res, next) {}
  async function _restart(req, res, next) {
    notifier.emit("restart");
  }

  async function _getStoragePath(req, res, next) {
    res.json({ pathToUserContent: global.pathToUserContent });
  }
  async function _setStoragePath(req, res, next) {
    const { data } = utils.makePathFromReq(req);
    const new_path = data.new_path;
    settings.updatePath({ new_path });
    res.status(200).json({ status: "ok" });
  }

  async function _loadCustomFonts() {
    let custom_fonts = await folder.getFolders({ path_to_type: "fonts" });
    return custom_fonts.reduce((acc, font) => {
      if (font.title && font.font_files)
        acc.push({
          title: font.title,
          path: font.$path,
          font_files: font.font_files,
        });

      return acc;
    }, []);
  }

  return API;
})();
