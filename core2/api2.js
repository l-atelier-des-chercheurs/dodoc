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
  auth = require("./auth"),
  users = require("./users"),
  journal = require("./journal"),
  recoverPassword = require("./recover-password");

module.exports = (function () {
  const API = {
    init: (app) => {
      return _initAPI(app);
    },
  };

  function _initAPI(app) {
    dev.logfunction();

    app.get("/_perf", loadPerf);

    app.use("/_api2/{*index}", [cors(_corsCheck)]);

    app.get(
      "/_api2/_networkInfos",
      _generalPasswordCheck,
      _getLocalNetworkInfos
    );
    app.get("/_api2/_authCheck", _checkGeneralPassword);
    app.get("/_api2/_tokenCheck", _checkToken);

    app.get("/_api2/_storagePath", _onlyAdmins, _getStoragePath);
    app.patch("/_api2/_storagePath", _onlyAdmins, _setStoragePath);
    app.post("/_api2/_restartApp", _onlyAdmins, _restartApp);

    app.get("/_api2/_logs", _getLogs);

    app.get("/_api2/_users", _getAllUsers);
    app.patch("/_api2/_users/:id", _updateUser);

    /* PUBLIC FOLDER */
    app.get(
      [
        "/_api2/:folder_type/:folder_slug/_public",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_public",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_public",
      ],
      _getPublicFolder
    );

    /* BIN */
    app.get(
      [
        "/_api2/:folder_type/_bin",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/_bin",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/_bin",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _getFolderBin
    );
    app.post(
      [
        "/_api2/:folder_type/_bin/:bin_folder_slug/_restore",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/_bin/:bin_folder_slug/_restore",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/_bin/:bin_folder_slug/_restore",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _restoreFolderFromBin
    );
    app.delete(
      [
        "/_api2/:folder_type/_bin/:bin_folder_slug",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/_bin/:bin_folder_slug",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/_bin/:bin_folder_slug",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _removeBinFolder
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
    app.get(
      [
        "/_api2/:folder_type/:folder_slug/_bin",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_bin",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_bin",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _getFilesBin
    );
    app.post(
      [
        "/_api2/:folder_type/:folder_slug/_bin/:meta_filename/_restore",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_bin/:meta_filename/_restore",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_bin/:meta_filename/_restore",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _restoreFileFromBin
    );
    app.delete(
      [
        "/_api2/:folder_type/:folder_slug/_bin/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_bin/:meta_filename",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_bin/:meta_filename",
      ],
      _generalPasswordCheck,
      _restrictToLocalAdmins,
      _removeBinFile
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
      _restrictToContributors,
      _export
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
    app.patch(
      [
        "/_api2/:folder_type/:folder_slug/:meta_filename/_regenerateThumbs",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:meta_filename/_regenerateThumbs",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/:meta_filename/_regenerateThumbs",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _regenerateThumbs
    );
    app.delete(
      [
        "/_api2/:meta_filename",
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
      _restrictIfPrivate,
      _getFolders
    );
    app.post(
      ["/_api2/:folder_type/:folder_slug/_login"],
      _generalPasswordCheck,
      _loginToFolder
    );
    app.post(
      ["/_api2/:folder_type/:folder_slug/_recoverPassword"],
      _generalPasswordCheck,
      _recoverPassword
    );
    app.post(
      ["/_api2/:folder_type/:folder_slug/_resetPassword"],
      _generalPasswordCheck,
      _resetPassword
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
      _export
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
      _restrictIfPrivate,
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

    app.get("/site.webmanifest", _loadManifest);
    app.get("/robots.txt", _loadRobots);
    app.get("/{*index}", loadIndex);
    notifier.on("fileCreated", async (room, { path_to_folder }) => {
      _updateFileCountAndBroadcast("fileCreated", path_to_folder);
    });
    notifier.on("fileRemoved", async (room, { path_to_folder }) => {
      _updateFileCountAndBroadcast("fileRemoved", path_to_folder);
    });
    notifier.on(
      "folderCreated",
      async (room, { path_to_folder, path_to_type }) => {
        _updateParentFoldersCountAndBroadcast(path_to_folder, path_to_type);
      }
    );
    notifier.on("folderRemoved", async (room, { path_to_folder }) => {
      const path_to_type = utils.getContainingFolder(path_to_folder);
      _updateParentFoldersCountAndBroadcast(path_to_folder, path_to_type);
    });
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

  async function _checkGeneralPassword(req, res, next) {
    dev.logapi();
    await _generalPasswordCheck(req, res);
    return res.status(200).send();
  }
  async function _checkToken(req, res, next) {
    dev.logapi();

    try {
      const { token, token_path } = JSON.parse(req.headers.authorization);
      if (!token || !token_path) {
        const err = new Error("Token and/or token_path missing in headers");
        err.code = "no_token_submitted";
        throw err;
      }
      auth.checkTokenValidity({ token, token_path, purpose: "auth" });
    } catch (err) {
      return res.status(401).send({ code: err.code });
    }
    return res.status(200).send();
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

    const token_path = auth.extractAndCheckToken({ req });
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

    const token_path = auth.extractAndCheckToken({ req });
    if (token_path) {
      if (token_path === utils.convertToSlashPath(path_to_folder))
        return "Token editing self";
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
      dev.error(`not allowed to contribute to folder ${path_to_folder}`);
      if (res) return res.status(403).send({ code: "not_allowed" });
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
      dev.error(`not allowed to admin folder ${path_to_folder}`);
      if (res) return res.status(403).send({ code: "not_allowed" });
    }
  }
  async function _restrictIfPrivate(req, res, next) {
    const { path_to_type, path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    try {
      const folder_is_private = await auth.isFolderPrivate({ path_to_folder });
      if (!folder_is_private) {
        dev.logverbose(
          "Folder is not private, can be listed without restrictions"
        );
        return next();
      } else dev.logverbose("Folder is private");

      const allowed = await _canContributeToFolder({
        path_to_type,
        path_to_folder,
        req,
      });
      if (allowed) {
        dev.logverbose("User allowed to open private folder");
        return next();
      } else {
        dev.error("User NOT allowed to open private folder");
        return res.status(401).send({ code: "folder_private" });
      }
    } catch (err) {
      return res.status(404).send({ code: "not_found" });
    }
  }
  async function _onlyAdmins(req, res, next) {
    dev.logapi();

    try {
      const allowed = await _canAdminFolder({
        path_to_folder: ".",
        req,
      });
      if (allowed) return next ? next() : undefined;

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
    d.is_livereload = dev.isLivereload();

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
      users_must_accept_terms_to_signup,
      terms_in_footer,
      confidentiality_in_footer,
      require_mail_to_signup,
      enable_events,
      enable_chats,
      enable_indexing,
      $admins,
      $contributors,
      favicon_image_name,
      topbar_image_name,
      hero_image_name,
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
    d.can_send_email = global.can_send_email;
    d.signup_password_hashed = signup_password
      ? utils.hashCode(signup_password)
      : "";
    d.require_signup_to_contribute = require_signup_to_contribute === true;
    d.require_mail_to_signup = require_mail_to_signup === true;
    d.users_must_accept_terms_to_signup =
      users_must_accept_terms_to_signup === true;
    d.terms_in_footer = terms_in_footer === true;
    d.confidentiality_in_footer = confidentiality_in_footer === true;
    d.enable_events = enable_events === true;
    d.enable_chats = enable_chats === true;
    d.enable_indexing = enable_indexing === true;
    d.$admins = $admins || "";
    d.$contributors = $contributors || "";

    const $files = await settings
      .getFiles()
      .catch((err) => dev.error("Error while getting settings", err));

    const findMatchingFileThumb = ({ meta_name, resolution }) => {
      if (!meta_name) return false;
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
    if (favicon_thumb) d.favicon_url = `./thumbs/${favicon_thumb}`;

    const topbar_thumb = findMatchingFileThumb({
      meta_name: topbar_image_name,
      resolution: 320,
    });
    if (topbar_thumb) d.topbar_thumb = `./thumbs/${topbar_thumb}`;

    const hero_thumb = findMatchingFileThumb({
      meta_name: hero_image_name,
      resolution: 2000,
    });
    if (hero_thumb) d.hero_thumb = `./thumbs/${hero_thumb}`;

    d.custom_fonts = (await _loadCustomFonts()) || {};

    res.render("index", d);
  }

  async function _loadManifest(req, res) {
    const { name_of_instance } = await settings.get();
    res.type("application/json");
    res.send({
      name: name_of_instance || "do•doc",
      short_name: name_of_instance || "do•doc",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    });
  }
  async function _loadRobots(req, res) {
    const { enable_indexing } = await settings.get();
    const disallow = enable_indexing === true ? "" : "/";
    res.type("text/plain");
    res.send(`User-agent: *\nDisallow: ${disallow}`);
  }

  function loadPerf(req, res) {
    let d = {};
    d.local_ips = utils.getLocalIPs();
    res.render("perf", d);
  }

  async function _getFolders(req, res, next) {
    // 1. Extract and validate input
    const { path_to_type } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");

    dev.logapi({ path_to_type });

    try {
      let d = await folder.getFolders({ path_to_type });

      // todo : filter depending on $status, only authors see folders
      dev.logpackets(`Successfully got folders ${path_to_type}`);
      journal.log({
        from: "api2",
        event: "get_folders",
        details: {
          outcome: "success",
          path_to_type,
          folders_count: d.length || 0,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(d);
    } catch (err) {
      _handleGetFoldersError(err, res, { path_to_type, token_path });
    }

    // cache.printStatus();
  }
  async function _createFolder(req, res, next) {
    const { path_to_type, data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization);

    dev.logapi({ path_to_type });

    const folder_title = data.title || "untitled";

    try {
      const new_folder_slug = await folder.createFolder({
        path_to_type,
        data,
      });

      const path_to_folder = path.join(path_to_type, new_folder_slug);
      const new_folder_meta = await folder.getFolder({ path_to_folder });

      dev.logpackets(`Successfully created folder ${path_to_folder}`);

      res.status(200).json({ new_folder_slug });

      journal.log({
        from: "api2",
        event: "create_folder",
        details: {
          outcome: "success",
          path_to_folder,
          folder_title,
          author_path: token_path,
        },
      });

      notifier.emit("folderCreated", utils.convertToSlashPath(path_to_type), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        path_to_type: utils.convertToSlashPath(path_to_type),
        meta: new_folder_meta,
      });
    } catch (err) {
      journal.log({
        from: "api2",
        event: "create_folder",
        details: {
          outcome: "error",
          path_to_type,
          folder_title,
          author_path: token_path,
        },
      });

      const error_msg = `Failed to create "${folder_title}" folder in ${path_to_type}: ${err.message}`;
      dev.error(error_msg);
      res.status(500).send({ code: err.code, err_infos: err.err_infos });
    }
  }

  async function _importFolder(req, res, next) {
    // 1. Extract and validate input
    const { path_to_type } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization);

    dev.logapi({ path_to_type });

    try {
      // 2. Import the folder
      const path_to_new_folder = await folder.importFolder({
        path_to_type,
        req,
      });

      // 4. Prepare success data
      const new_folder_meta = await folder.getFolder({
        path_to_folder: path_to_new_folder,
      });

      // 4. Log success
      dev.logpackets(`Successfully imported folder ${path_to_new_folder}`);
      journal.log({
        from: "api2",
        event: "import_folder",
        details: {
          outcome: "success",
          path_to_new_folder,
          folder_title: new_folder_meta.title || "untitled",
          author_path: token_path,
        },
      });

      // 5. Send response
      res.status(200).json({ new_folder_meta });

      // 7. Notify subscribers (after response)
      notifier.emit("folderCreated", utils.convertToSlashPath(path_to_type), {
        path_to_folder: utils.convertToSlashPath(path_to_new_folder),
        path_to_type: utils.convertToSlashPath(path_to_type),
        meta: new_folder_meta,
      });
    } catch (err) {
      _handleImportFolderError(err, res, { path_to_type, token_path });
    }
  }

  // Helper function for folder import error handling
  function _handleImportFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to import folder into ${context.path_to_type}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "import_folder",
      details: {
        outcome: "error",
        path_to_type: context.path_to_type,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  async function _getFolder(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder = "" } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    const detailed = req.query?.detailed === "true";
    const no_files = req.query?.no_files === "true";

    dev.logapi({ path_to_folder });

    // const hrstart = process.hrtime();

    try {
      // 2. Get the folder and files
      let d = await folder.getFolder({ path_to_folder, detailed });
      if (!no_files) d.$files = await file.getFiles({ path_to_folder });

      // let hrend = process.hrtime(hrstart);
      // dev.performance(
      //   `${path_to_folder} – ${hrend[0]}s ${hrend[1] / 1000000}ms`
      // );

      // 3. Log success
      dev.logpackets(`Successfully got folder ${path_to_folder}`);
      journal.log({
        from: "api2",
        event: "get_folder",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(d);
    } catch (err) {
      _handleGetFolderError(err, res, { path_to_folder, token_path });
    }
    // cache.printStatus();
  }

  async function _getPublicFolder(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder = "" } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");

    dev.logapi({ path_to_folder });

    try {
      // 2. Get the folder
      let d = await folder.getFolder({ path_to_folder });

      // 3. Check if folder is public or superadmin access
      const { general_password } = await settings.get();
      if (d.$public !== true && general_password) {
        // only allow queries with superadmintoken
        if (!auth.checkSuperadminToken(req.query?.superadmintoken)) {
          const err = new Error("Folder is not public");
          err.code = "folder_not_public";
          throw err;
        }
      }

      try {
        // 4. Get files with embedded source
        const files = await file.getFiles({
          path_to_folder,
          embed_source: true,
        });
        d.$files = files;

        // 5. Log success
        dev.logpackets(`Successfully got public folder ${path_to_folder}`);
        journal.log({
          from: "api2",
          event: "get_public_folder",
          details: {
            outcome: "success",
            path_to_folder,
            author_path: token_path,
          },
        });

        // 6. Send response
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(d);
      } catch (err) {
        dev.error("Failed to get files: " + err);
        journal.log({
          from: "api2",
          event: "get_public_folder",
          details: {
            outcome: "partial_success",
            path_to_folder,
            author_path: token_path,
          },
        });
        res.json({});
      }
    } catch (err) {
      _handleGetPublicFolderError(err, res, { path_to_folder, token_path });
    }
  }

  async function _updateFolder(req, res, next) {
    // 1. Extract and validate input
    const {
      path_to_type,
      path_to_folder = "",
      data,
    } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization);
    const update_cover = req.query?.cover !== undefined;

    dev.logapi({ path_to_folder, data, update_cover });

    try {
      // 2. Update the folder
      const changed_data = await folder.updateFolder({
        path_to_type,
        path_to_folder,
        data,
        update_cover_req: update_cover ? req : false,
      });

      // 3. Log success
      dev.logpackets(`Successfully updated folder ${path_to_folder}`);
      journal.log({
        from: "api2",
        event: "update_folder",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });

      // 5. Send response
      res.status(200).json({ status: "ok" });

      // 6. Notify subscribers (after response)
      _notifyFolderUpdated(path_to_type, path_to_folder, changed_data);

      // TODO if $password is updated successfully, then revoke all tokens except current
    } catch (err) {
      _handleUpdateFolderError(err, res, { path_to_folder, token_path });
    }
  }

  async function _loginToFolder(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder, data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    const submitted_password = data.$password;

    dev.logapi({ path_to_folder, data });

    try {
      // 2. Verify password
      await folder.login({
        path_to_folder,
        submitted_password,
      });

      // 3. Generate and store token
      // if no throwing error, we generate a token, store it node/electron side and send it back to the client
      // this token matches a path such as authors/louis
      // any folder that has authors can only be updated/removed by users with a valid token corresponding to those authors
      const token = await auth.createAndStoreToken({
        path_to_folder,
      });

      // 4. Log success
      dev.logpackets(`Successfully logged in to folder ${path_to_folder}`);
      journal.log({
        from: "api2",
        event: "login_to_folder",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });

      // 5. Send response
      res.status(200).json({ status: "ok", token });
    } catch (err) {
      _handleLoginToFolderError(err, res, { path_to_folder, token_path });
    }
  }

  // Helper function for login to folder error handling
  function _handleLoginToFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to login to folder ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "login_to_folder",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  async function _logoutFromFolder(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder, data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    const token = data.token;

    dev.logapi({ path_to_folder, token });

    try {
      // 2. Revoke the token
      // not sure we need to check token before revoking it
      // auth.checkTokenValidity({ token, token_path: path_to_folder });
      await auth.revokeToken({
        token_to_revoke: token,
      });

      // 3. Log success
      dev.logpackets(`Successfully logged out from folder ${path_to_folder}`);
      journal.log({
        from: "api2",
        event: "logout_from_folder",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.status(200).json({ status: "ok" });
    } catch (err) {
      _handleLogoutFromFolderError(err, res, { path_to_folder, token_path });
    }
  }

  // Helper function for logout from folder error handling
  function _handleLogoutFromFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to logout from folder ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "logout_from_folder",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  async function _removeFolder(req, res, next) {
    // 1. Extract and validate input
    const { path_to_type, path_to_folder } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization);

    dev.logapi({ path_to_folder });

    try {
      // 2. Remove the folder
      await folder.removeFolder({
        path_to_type,
        path_to_folder,
      });

      // 3. Clean up related data
      await auth.removeAllTokensForFolder({ token_path: path_to_folder });

      // 4. Log success
      dev.logpackets(`Successfully removed folder ${path_to_folder}`);
      journal.log({
        from: "api2",
        event: "remove_folder",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });

      // 5. Send response
      res.status(200).json({ status: "ok" });

      // 6. Notify subscribers (after response)
      _notifyFolderRemoved(path_to_type, path_to_folder);
    } catch (err) {
      _handleRemoveFolderError(err, res, { path_to_folder, token_path });
    }
  }

  async function _uploadFile(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder = "" } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization);

    dev.logapi({ path_to_folder });

    try {
      // 2. Import the file
      const { meta_filename } = await file.importFile({
        path_to_folder,
        req,
      });

      // 3. Prepare success data
      const path_to_meta = path.join(path_to_folder, meta_filename);
      const meta = await file.getFile({ path_to_meta });

      // 4. Log success
      dev.logpackets(`Successfully uploaded file ${path_to_meta}`);
      journal.log({
        from: "api2",
        event: "upload_file",
        details: {
          outcome: "success",
          path_to_folder,
          file_title: meta.title || meta_filename,
          author_path: token_path,
        },
      });

      // 5. Send response
      res.status(200).json({ uploaded_meta: meta, meta_filename });

      // 6. Notify subscribers (after response)
      _notifyFileCreated(path_to_folder, meta);
    } catch (err) {
      _handleUploadFileError(err, res, { path_to_folder, token_path });
    }
  }

  async function _export(req, res, next) {
    const { path_to_folder, path_to_parent_folder, meta_filename, data } =
      utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_folder, path_to_parent_folder, data });

    const folder_to_export_to =
      data.export_to_parent_folder === true && path_to_parent_folder !== "."
        ? path_to_parent_folder
        : path_to_folder;

    // add res to data so res becomes available to Exporter to generate HTML
    data.express_res = res;

    // DISPATCH TASKS
    const task = new Exporter({
      path_to_folder,
      folder_to_export_to,
      instructions: data,
    });
    const task_id = task.id;

    // 1. create a task with parameters: settings / author that started it / source folder path / destination slug path  / time created / etc.
    // 2. return ID of task to client
    // 3. using this ID, client can join a room to get progress on task
    // 4. when task finishes, it notifies client with notifier and also triggers a fileCreated

    dev.logpackets(`Successfully started export task ${task_id}`);
    journal.log({
      from: "api2",
      event: "export",
      details: {
        outcome: "started",
        path_to_folder,
        folder_to_export_to,
        task_id,
        author_path: token_path,
      },
    });
    res.status(200).json({ task_id });

    // wait a bit to make sure that the client has the time to watch task, in case it fails right away
    await new Promise((r) => setTimeout(r, 100));

    try {
      const exported_path_to_meta = await task.start();
      const meta = await file.getFile({
        path_to_meta: exported_path_to_meta,
      });
      journal.log({
        from: "api2",
        event: "export",
        details: {
          outcome: "success",
          path_to_folder,
          folder_to_export_to,
          exported_path_to_meta,
          task_id,
          author_path: token_path,
        },
      });
      notifier.emit(
        "fileCreated",
        utils.convertToSlashPath(folder_to_export_to),
        {
          path_to_folder: utils.convertToSlashPath(folder_to_export_to),
          meta,
        }
      );
    } catch (err) {
      dev.error("Failed to export file: " + err);
      journal.log({
        from: "api2",
        event: "export",
        details: {
          outcome: "error",
          path_to_folder,
          error_message: err.message,
          task_id,
          author_path: token_path,
        },
      });
      notifier.emit("taskEnded", task_id, {
        task_id,
        event: "failed",
        message: err.message,
      });
    }
  }

  async function _copyFolder(req, res, next) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_type, path_to_folder, data });

    try {
      let { path_to_destination_type, new_meta, is_copy_or_move } = data;
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
        is_copy_or_move,
      });
      dev.logpackets(
        `Successfully copied folder ${path_to_source_folder} to ${copy_folder_path}`
      );
      journal.log({
        from: "api2",
        event: "copy_folder",
        details: {
          outcome: "success",
          path_to_source_folder,
          path_to_destination_type,
          copy_folder_path,
          is_copy_or_move,
          author_path: token_path,
        },
      });
      res.status(200).json({ copy_folder_path });

      const new_folder_meta = await folder.getFolder({
        path_to_folder: copy_folder_path,
      });

      notifier.emit(
        "folderCreated",
        utils.convertToSlashPath(path_to_destination_type),
        {
          path: utils.convertToSlashPath(path_to_destination_type),
          meta: new_folder_meta,
        }
      );
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to copy content: " + message);
      journal.log({
        from: "api2",
        event: "copy_folder",
        details: {
          outcome: "error",
          path_to_folder,
          error_message: message,
          author_path: token_path,
        },
      });
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }
  async function _downloadFolder(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder, path_to_type } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");

    dev.logapi({ path_to_folder, path_to_type });

    try {
      // 2. Prepare download headers
      const filename = utils.getZipFolderFilename({
        path_to_folder,
        path_to_type,
      });
      res.header("Content-Type", "application/zip");
      res.header("Content-Disposition", `attachment; filename="${filename}"`);
      // const { size } = await thumbs.getInfosForFolder({
      //   path_to_folder,
      // });
      // if (size) res.header("Content-Length", size);

      // 3. Create and stream archive
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
      const folder_slug = utils.getFilename(path_to_folder);
      archive.directory(full_folder_path, folder_slug);

      archive.finalize();

      // 4. Log success
      dev.logpackets(`Successfully started download for ${path_to_folder}`);
      journal.log({
        from: "api2",
        event: "download_folder",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });

      dev.log(`download started`);
    } catch (err) {
      _handleDownloadFolderError(err, res, { path_to_folder, token_path });
    }
  }

  // Helper function for download folder error handling
  function _handleDownloadFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to download folder ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "download_folder",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  /************************************************************************************ BIN ***********/

  async function _getFolderBin(req, res, next) {
    // 1. Extract and validate input
    const { path_to_type } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");

    dev.logapi({ path_to_type });

    try {
      // 2. Get the bin content
      const bin_content = await folder.getFolderBinContent({
        path_to_type,
      });

      // 3. Log success
      dev.logpackets(`Successfully got bin content for ${path_to_type}`);
      journal.log({
        from: "api2",
        event: "get_folder_bin",
        details: {
          outcome: "success",
          path_to_type,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.json(bin_content);
    } catch (err) {
      _handleGetFolderBinError(err, res, { path_to_type, token_path });
    }
  }

  // Helper function for get folder bin error handling
  function _handleGetFolderBinError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to get bin content for ${context.path_to_type}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "get_folder_bin",
      details: {
        outcome: "error",
        path_to_type: context.path_to_type,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  async function _restoreFolderFromBin(req, res, next) {
    const { path_to_type, path_to_folder_in_bin } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_type, path_to_folder_in_bin });

    try {
      const restored_folder_path = await folder.restoreFromBin({
        path_to_folder_in_bin,
        path_to_type,
      });
      dev.logpackets(`Successfully restored folder ${restored_folder_path}`);
      journal.log({
        from: "api2",
        event: "restore_folder_from_bin",
        details: {
          outcome: "success",
          path_to_folder_in_bin,
          restored_folder_path,
          author_path: token_path,
        },
      });
      res.status(200).json({ restored_folder_path });

      const new_folder_meta = await folder.getFolder({
        path_to_folder: restored_folder_path,
      });

      notifier.emit("folderCreated", utils.convertToSlashPath(path_to_type), {
        path_to_folder: utils.convertToSlashPath(restored_folder_path),
        path_to_type: utils.convertToSlashPath(path_to_type),
        meta: new_folder_meta,
      });
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to restore from bin: " + message);
      journal.log({
        from: "api2",
        event: "restore_folder_from_bin",
        details: {
          outcome: "error",
          path_to_folder_in_bin,
          error_message: message,
          author_path: token_path,
        },
      });
      res.status(500).send({ code, err_infos });
    }
  }
  async function _removeBinFolder(req, res, next) {
    const { path_to_folder_in_bin } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_folder_in_bin });

    try {
      await folder.removeBinFolder({
        path_to_folder_in_bin,
      });
      dev.logpackets(
        `Successfully removed bin folder ${path_to_folder_in_bin}`
      );
      journal.log({
        from: "api2",
        event: "remove_bin_folder",
        details: {
          outcome: "success",
          path_to_folder_in_bin,
          author_path: token_path,
        },
      });
      res.status(200).json({ status: "ok" });
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to remove bin folder: " + message);
      journal.log({
        from: "api2",
        event: "remove_bin_folder",
        details: {
          outcome: "error",
          path_to_folder_in_bin,
          error_message: message,
          author_path: token_path,
        },
      });
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }

  async function _getFilesBin(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");

    dev.logapi({ path_to_folder });

    try {
      // 2. Get the bin content
      const bin_content = await file.getFilesBin({
        path_to_folder,
      });

      // 3. Log success
      dev.logpackets(
        `Successfully got files bin content for ${path_to_folder}`
      );
      journal.log({
        from: "api2",
        event: "get_files_bin",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.json(bin_content);
    } catch (err) {
      _handleGetFilesBinError(err, res, { path_to_folder, token_path });
    }
  }

  // Helper function for get files bin error handling
  function _handleGetFilesBinError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to get files bin content for ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "get_files_bin",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  async function _restoreFileFromBin(req, res, next) {
    const { path_to_folder, meta_filename } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_folder, meta_filename });

    try {
      const restored_file_path = await file.restoreFileFromBin({
        path_to_folder,
        meta_filename,
      });

      dev.logpackets(`Successfully restored file ${restored_file_path}`);
      journal.log({
        from: "api2",
        event: "restore_file_from_bin",
        details: {
          outcome: "success",
          path_to_folder,
          meta_filename,
          restored_file_path,
          author_path: token_path,
        },
      });
      res.status(200).json({ restored_file_path });

      const restored_file_meta = await file.getFile({
        path_to_meta: path.join(path_to_folder, restored_file_path),
      });

      notifier.emit("fileCreated", utils.convertToSlashPath(path_to_folder), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        meta: restored_file_meta,
      });
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to restore file from bin: " + message);
      journal.log({
        from: "api2",
        event: "restore_file_from_bin",
        details: {
          outcome: "error",
          path_to_folder,
          meta_filename,
          error_message: message,
          author_path: token_path,
        },
      });
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }

  async function _removeBinFile(req, res, next) {
    const { path_to_folder, meta_filename } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_folder, meta_filename });

    try {
      await file.removeBinFile({
        path_to_folder,
        meta_filename,
      });
      dev.logpackets(
        `Successfully removed bin file ${path_to_folder} ${meta_filename}`
      );
      journal.log({
        from: "api2",
        event: "remove_bin_file",
        details: {
          outcome: "success",
          path_to_folder,
          meta_filename,
          author_path: token_path,
        },
      });
      res.status(200).json({ status: "ok" });
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to remove bin folder: " + message);
      journal.log({
        from: "api2",
        event: "remove_bin_file",
        details: {
          outcome: "error",
          path_to_folder,
          meta_filename,
          error_message: message,
          author_path: token_path,
        },
      });
      res.status(500).send({
        code,
        err_infos,
      });
    }
  }

  async function _remixFolder(req, res, next) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_type, path_to_folder, data });

    // Check if folder can be remixed (applies to all remix operations)
    const folder_meta = await folder.getFolder({
      path_to_folder,
    });
    if (folder_meta.$can_be_remixed !== true) {
      const err = new Error("Folder is not open to remix");
      err.code = "source_folder_not_open_to_remix";
      throw err;
    }

    try {
      let { path_to_destination_type, new_meta } = data;
      if (!path_to_destination_type) path_to_destination_type = path_to_type;

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
        err.code = "destination_folder_not_open_to_user_contribution";
        throw err;
      }

      const path_to_source_folder = path_to_folder;
      new_meta.$is_remix_of = path_to_source_folder;

      const remix_folder_path = await folder.copyFolder({
        path_to_type,
        path_to_source_folder,
        path_to_destination_type,
        new_meta,
      });
      dev.logpackets(
        `Successfully remixed folder ${path_to_source_folder} to ${remix_folder_path}`
      );
      journal.log({
        from: "api2",
        event: "remix_folder",
        details: {
          outcome: "success",
          path_to_source_folder,
          path_to_destination_type,
          remix_folder_path,
          author_path: token_path,
        },
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

      notifier.emit(
        "folderCreated",
        utils.convertToSlashPath(path_to_destination_type),
        {
          path: utils.convertToSlashPath(path_to_destination_type),
          meta: new_folder_meta,
        }
      );
    } catch (err) {
      const { message, code, err_infos } = err;
      dev.error("Failed to remix folder: " + message);
      journal.log({
        from: "api2",
        event: "remix_folder",
        details: {
          outcome: "error",
          path_to_folder,
          error_message: message,
          author_path: token_path,
        },
      });
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

    notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_folder), {
      path_to_folder: utils.convertToSlashPath(path_to_folder),
      changed_data,
    });

    if (path_to_type)
      notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_type), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        changed_data,
      });
  }

  async function _generatePreview(req, res, next) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_folder, data });

    // TODO : do not move to parent folder, instead use that file as $cover
    const task = new Exporter({
      path_to_folder,
      folder_to_export_to: path_to_folder,
      instructions: data,
    });
    const task_id = task.id;
    journal.log({
      from: "api2",
      event: "generate_preview",
      details: {
        outcome: "started",
        path_to_folder,
        task_id,
        author_path: token_path,
      },
    });
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

      journal.log({
        from: "api2",
        event: "generate_preview",
        details: {
          outcome: "success",
          path_to_folder,
          exported_path_to_meta,
          task_id,
          author_path: token_path,
        },
      });
      notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_folder), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        changed_data,
      });
      notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_type), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        changed_data,
      });
    } catch (err) {
      dev.error("Failed to generate preview: " + err);
      journal.log({
        from: "api2",
        event: "generate_preview",
        details: {
          outcome: "error",
          path_to_folder,
          error_message: err.message,
          task_id,
          author_path: token_path,
        },
      });
      notifier.emit("taskEnded", task_id, {
        task_id,
        message: err,
      });
    }
  }

  async function _getFile(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder, path_to_meta, meta_filename } =
      utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");

    // no filename found in params, user may be requesting folders
    if (!path_to_meta) return next();

    dev.logapi({ path_to_meta });

    try {
      // 2. Get the file and archives
      const meta = await file.getFile({
        path_to_meta,
      });
      const file_archives = await file.getArchives({
        path_to_folder,
        meta_filename,
      });
      if (file_archives) meta.$archives = file_archives;

      // 3. Log success
      dev.logpackets(`Successfully got file ${path_to_meta}`);
      journal.log({
        from: "api2",
        event: "get_file",
        details: {
          outcome: "success",
          path_to_meta,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(meta);
    } catch (err) {
      _handleGetFileError(err, res, { path_to_meta, token_path });
    }
  }

  // Helper function for get file error handling
  function _handleGetFileError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to get file ${context.path_to_meta}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "get_file",
      details: {
        outcome: "error",
        path_to_meta: context.path_to_meta,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  async function _updateFile(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder, path_to_meta, data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization);

    dev.logapi({ path_to_folder, path_to_meta, data });

    try {
      // 2. Update the file
      const changed_data = await file.updateFile({
        path_to_folder,
        path_to_meta,
        data,
      });

      // 3. Log success
      dev.logpackets(`Successfully updated file ${path_to_meta}`);
      journal.log({
        from: "api2",
        event: "update_file",
        details: {
          outcome: "success",
          path_to_meta,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.status(200).json({ status: "ok" });

      // 5. Notify subscribers (after response)
      _notifyFileUpdated(path_to_folder, path_to_meta, changed_data);
    } catch (err) {
      _handleUpdateFileError(err, res, { path_to_meta, token_path });
    }
  }

  async function _regenerateThumbs(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder, path_to_meta, meta_filename } =
      utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");

    dev.logapi({ path_to_folder, path_to_meta, meta_filename });

    try {
      // 2. Regenerate the thumbnails
      const changed_data = await file._regenerateThumbs({
        path_to_folder,
        path_to_meta,
        meta_filename,
      });

      // 3. Log success
      dev.logpackets(`Successfully regenerated thumbs for ${path_to_meta}`);
      journal.log({
        from: "api2",
        event: "regenerate_thumbs",
        details: {
          outcome: "success",
          path_to_meta,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.status(200).json({ status: "ok" });

      // 5. Notify subscribers (after response)
      notifier.emit("fileUpdated", utils.convertToSlashPath(path_to_folder), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        path_to_meta: utils.convertToSlashPath(path_to_meta),
        changed_data,
      });
    } catch (err) {
      _handleRegenerateThumbsError(err, res, { path_to_meta, token_path });
    }
  }

  // Helper function for regenerate thumbs error handling
  function _handleRegenerateThumbsError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to regenerate thumbs for ${context.path_to_meta}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "regenerate_thumbs",
      details: {
        outcome: "error",
        path_to_meta: context.path_to_meta,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  async function _removeFile(req, res, next) {
    // 1. Extract and validate input
    const {
      path_to_folder = "",
      meta_filename,
      path_to_meta,
    } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization);

    dev.logapi({ path_to_folder, meta_filename });

    try {
      // 2. Remove the file
      await file.removeFile({
        path_to_folder,
        meta_filename,
        path_to_meta,
      });

      // 3. Log success
      dev.logpackets(
        `Successfully removed file ${path_to_folder} ${meta_filename}`
      );
      journal.log({
        from: "api2",
        event: "remove_file",
        details: {
          outcome: "success",
          path_to_folder,
          meta_filename,
          author_path: token_path,
        },
      });

      // 4. Send response
      res.status(200).json({ status: "ok" });

      // 5. Notify subscribers (after response)
      _notifyFileRemoved(path_to_folder, path_to_meta);
    } catch (err) {
      _handleRemoveFileError(err, res, {
        path_to_folder,
        meta_filename,
        token_path,
      });
    }
  }

  async function _copyFile(req, res, next) {
    // 1. Extract and validate input
    const { path_to_folder, meta_filename, path_to_meta, data } =
      utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization);

    dev.logapi({ path_to_folder, path_to_meta, data });

    try {
      // 2. Validate destination and permissions
      let { path_to_destination_folder, new_meta } = data;
      if (!path_to_destination_folder) {
        path_to_destination_folder = path_to_folder;
      } else {
        // Check for auth to copy to folder
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

      // 4. Copy the file
      const copy_meta_filename = await file.copyFile({
        path_to_folder,
        path_to_destination_folder,
        meta_filename,
        path_to_meta,
        new_meta,
      });

      // 5. Prepare success data
      const meta = await file.getFile({
        path_to_meta: path.join(path_to_destination_folder, copy_meta_filename),
      });

      // 5. Log success
      dev.logpackets(
        `Successfully copied file ${path_to_folder} to ${path_to_destination_folder}`
      );
      journal.log({
        from: "api2",
        event: "copy_file",
        details: {
          outcome: "success",
          path_to_folder,
          path_to_destination_folder,
          meta_filename,
          author_path: token_path,
        },
      });

      // 6. Send response
      res.status(200).json({ meta_filename: copy_meta_filename });

      // 7. Notify subscribers (after response)
      _notifyFileCreated(path_to_destination_folder, meta);
    } catch (err) {
      _handleCopyFileError(err, res, {
        path_to_folder,
        meta_filename,
        token_path,
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

  async function _restartApp(req, res, next) {
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    journal.log({
      from: "api2",
      event: "restart_app",
      details: {
        outcome: "success",
        author_path: token_path,
      },
    });
    notifier.emit("restartApp");
    res.status(200).json({ status: "ok" });
  }
  async function _getLogs(req, res, next) {
    const logs = await journal.getLogs();
    res.json({ logs });
  }
  async function _getStoragePath(req, res, next) {
    const pathToUserContent = await settings.getStoragePath();
    dev.logfunction({ pathToUserContent });
    res.json({ pathToUserContent });
  }
  async function _setStoragePath(req, res, next) {
    const { data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    const new_path = data.new_path;

    try {
      await settings.updateStoragePath({ new_path });
      journal.log({
        from: "api2",
        event: "set_storage_path",
        details: {
          outcome: "success",
          new_path,
          author_path: token_path,
        },
      });
      res.status(200).json({ status: "ok" });
    } catch (err) {
      journal.log({
        from: "api2",
        event: "set_storage_path",
        details: {
          outcome: "error",
          new_path,
          error_message: err.message,
          author_path: token_path,
        },
      });
      res.status(500).send({ code: err.code });
    }
  }

  async function _getAllUsers(req, res, next) {
    const all_users = users.getAllUsers();
    res.json(all_users);
  }
  async function _updateUser(req, res, next) {
    const id = req.params.id;
    const { path } = req.body;
    const user = users.updateUser(id, { path });
    if (!user) return res.status(404).json({ status: "user not found" });
    res.json(user);
    notifier.emit("userUpdated", { id, changed_data: { path } });
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
  async function _loadCustomCategories() {
    let custom_categories = await folder.getFolders({
      path_to_type: "categories",
    });
    return custom_categories.reduce((acc, category) => {
      acc.push({
        title: category.title,
        tag_color: category.tag_color || "",
        path: category.$path,
      });
      return acc;
    }, []);
  }

  async function _updateFileCountAndBroadcast(event, path_to_folder) {
    dev.logfunction({ path_to_folder });
    const path_to_type = utils.getContainingFolder(path_to_folder);
    const $files_count = await file.getFilesCount({ path_to_folder });

    let admin_meta = {
      $files_count,
    };
    if (event === "fileCreated")
      admin_meta.$date_last_file = utils.getCurrentDate();

    const changed_data = await folder.updateFolder({
      path_to_type,
      path_to_folder,
      admin_meta,
    });
    notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_folder), {
      path_to_folder: utils.convertToSlashPath(path_to_folder),
      changed_data,
    });
    if (path_to_type)
      notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_type), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        changed_data,
      });
  }

  async function _updateParentFoldersCountAndBroadcast(
    path_to_folder,
    path_to_type
  ) {
    dev.logfunction({ path_to_folder, path_to_type });

    // Get the parent folder (the one containing the type folder)
    // E.g., for path_to_type "spaces/espace-de-test/projects", parent is "spaces/espace-de-test"
    const path_to_parent_folder = utils.getContainingFolder(path_to_type);
    if (!path_to_parent_folder) return; // No parent to update

    const $folders_count = await folder.getFoldersCount({
      path_to_folder: path_to_parent_folder,
    });

    const admin_meta = {
      $folders_count,
    };

    const path_to_parent_type = utils.getContainingFolder(
      path_to_parent_folder
    );
    const changed_data = await folder.updateFolder({
      path_to_type: path_to_parent_type,
      path_to_folder: path_to_parent_folder,
      admin_meta,
    });

    notifier.emit(
      "folderUpdated",
      utils.convertToSlashPath(path_to_parent_folder),
      {
        path_to_folder: utils.convertToSlashPath(path_to_parent_folder),
        changed_data,
      }
    );
    if (path_to_parent_type)
      notifier.emit(
        "folderUpdated",
        utils.convertToSlashPath(path_to_parent_type),
        {
          path_to_folder: utils.convertToSlashPath(path_to_parent_folder),
          changed_data,
        }
      );
  }

  async function _recoverPassword(req, res) {
    const { path_to_folder } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_folder });

    try {
      const result = await recoverPassword.recoverPassword({
        path_to_folder,
      });
      dev.logpackets(`Successfully recovered password for ${path_to_folder}`);
      journal.log({
        from: "api2",
        event: "recover_password",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });
      res.status(200).json(result);
    } catch (err) {
      dev.error(err);
      journal.log({
        from: "api2",
        event: "recover_password",
        details: {
          outcome: "error",
          path_to_folder,
          error_message: err.message,
          author_path: token_path,
        },
      });
      res.status(500).send({ code: err.code });
    }
  }

  async function _resetPassword(req, res) {
    const { path_to_type, path_to_folder, data } = utils.makePathFromReq(req);
    const { token_path } = JSON.parse(req.headers.authorization || "{}");
    dev.logapi({ path_to_folder, data });

    try {
      const { token, new_password } = data;
      const result = await recoverPassword.resetPassword({
        path_to_type,
        path_to_folder,
        token,
        new_password,
      });

      dev.logpackets(`Successfully reset password for ${path_to_folder}`);
      journal.log({
        from: "api2",
        event: "reset_password",
        details: {
          outcome: "success",
          path_to_folder,
          author_path: token_path,
        },
      });
      res.status(200).json(result);

      notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_folder), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        changed_data: result.changed_data,
      });
      if (path_to_type)
        notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_type), {
          path_to_folder: utils.convertToSlashPath(path_to_folder),
          changed_data: result.changed_data,
        });
    } catch (err) {
      dev.error(err);
      journal.log({
        from: "api2",
        event: "reset_password",
        details: {
          outcome: "error",
          path_to_folder,
          error_message: err.message,
          author_path: token_path,
        },
      });
      res.status(500).send({ code: err.code });
    }
  }

  // Helper function for folder update notifications
  function _notifyFolderUpdated(path_to_type, path_to_folder, changed_data) {
    notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_folder), {
      path_to_folder: utils.convertToSlashPath(path_to_folder),
      changed_data,
    });
    if (path_to_type)
      notifier.emit("folderUpdated", utils.convertToSlashPath(path_to_type), {
        path_to_folder: utils.convertToSlashPath(path_to_folder),
        changed_data,
      });
  }

  // Helper function for folder update error handling
  function _handleUpdateFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to update folder ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "update_folder",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  // Helper function for folder removal notifications
  function _notifyFolderRemoved(path_to_type, path_to_folder) {
    notifier.emit("folderRemoved", utils.convertToSlashPath(path_to_folder), {
      path_to_folder: utils.convertToSlashPath(path_to_folder),
    });
    notifier.emit("folderRemoved", utils.convertToSlashPath(path_to_type), {
      path_to_folder: utils.convertToSlashPath(path_to_folder),
    });
  }

  // Helper function for folder removal error handling
  function _handleRemoveFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to remove folder ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "remove_folder",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(404).send({ code, err_infos });
  }

  // Helper function for file creation notifications
  function _notifyFileCreated(path_to_folder, meta) {
    notifier.emit("fileCreated", utils.convertToSlashPath(path_to_folder), {
      path_to_folder: utils.convertToSlashPath(path_to_folder),
      meta,
    });
  }

  // Helper function for file upload error handling
  function _handleUploadFileError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to upload file to ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "upload_file",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    try {
      res.status(500).send({ code, err_infos });
    } catch (e) {
      // Response may have already been sent
    }
  }

  // Helper function for file update notifications
  function _notifyFileUpdated(path_to_folder, path_to_meta, changed_data) {
    notifier.emit("fileUpdated", utils.convertToSlashPath(path_to_folder), {
      path_to_folder: utils.convertToSlashPath(path_to_folder),
      path_to_meta: utils.convertToSlashPath(path_to_meta),
      changed_data,
    });
  }

  // Helper function for file update error handling
  function _handleUpdateFileError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to update file ${context.path_to_meta}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "update_file",
      details: {
        outcome: "error",
        path_to_meta: context.path_to_meta,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  // Helper function for file removal notifications
  function _notifyFileRemoved(path_to_folder, path_to_meta) {
    notifier.emit("fileRemoved", utils.convertToSlashPath(path_to_folder), {
      path_to_folder: utils.convertToSlashPath(path_to_folder),
      path_to_meta: utils.convertToSlashPath(path_to_meta),
    });
  }

  // Helper function for file removal error handling
  function _handleRemoveFileError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to remove file ${context.meta_filename} from ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "remove_file",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        meta_filename: context.meta_filename,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  // Helper function for file copy error handling
  function _handleCopyFileError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to copy file ${context.meta_filename} from ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "copy_file",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        meta_filename: context.meta_filename,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  function _handleGetFoldersError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to get folders from ${context.path_to_type}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "get_folders",
      details: {
        outcome: "error",
        path_to_type: context.path_to_type,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  function _handleGetFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to get folder ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "get_folder",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  function _handleGetPublicFolderError(err, res, context) {
    const { message, code, err_infos } = err;
    const error_msg = `Failed to get public folder ${context.path_to_folder}: ${message}`;

    dev.error(error_msg);
    journal.log({
      from: "api2",
      event: "get_public_folder",
      details: {
        outcome: "error",
        path_to_folder: context.path_to_folder,
        error_message: message,
        author_path: context.token_path,
      },
    });

    res.status(500).send({ code, err_infos });
  }

  return API;
})();
