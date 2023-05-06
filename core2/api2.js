const cors = require("cors"),
  url = require("url"),
  path = require("path");

const folder = require("./folder"),
  file = require("./file"),
  settings = require("./settings"),
  notifier = require("./notifier"),
  utils = require("./utils"),
  cache = require("./cache"),
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

    app.get("/_api2/_ip", _generalPasswordCheck, _getLocalNetworkInfos);
    app.get("/_api2/_authCheck", _checkGeneralPasswordAndToken);

    app.get("/_api2/_storagePath", _onlyAdmins, _getStoragePath);
    app.patch("/_api2/_storagePath", _onlyAdmins, _setStoragePath);
    app.post("/_api2/_restart", _onlyAdmins, _restart);

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
        "/_api2/:folder_type/:folder_slug/_upload",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/_upload",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type/:subsub_folder_slug/_upload",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _uploadFile
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
        "/_api2/:folder_type",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type",
        "/_api2/:folder_type/:folder_slug/:sub_folder_type/:sub_folder_slug/:subsub_folder_type",
      ],
      _generalPasswordCheck,
      _restrictToContributors,
      _createFolder
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

  async function _restrictToContributors(req, res, next) {
    const { path_to_type, path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    // check if path_to_type in schema mentions $can_be_created_by "everyone"
    if (auth.canFolderBeCreatedByAll({ path_to_type })) {
      dev.logapi("Folder can be created by all according to schema");
      return next ? next() : undefined;
    }

    try {
      if (
        (await auth.isFolderOpenedToAll({
          field: "$contributors",
          path_to_folder,
        })) ||
        (await auth.isFolderOpenedToAll({ field: "$admins", path_to_folder }))
      ) {
        dev.logapi("Folder opened to any contributors");
        return next ? next() : undefined;
      }

      const token_path = auth.extrackAndCheckToken({ req });

      if (token_path === path_to_folder) {
        dev.logapi("Token editing self");
        return next ? next() : undefined;
      }
      if (await auth.isTokenInstanceAdmin({ token_path })) {
        dev.logapi("Token is instance admin");
        return next ? next() : undefined;
      }
      if (
        await auth.isTokenIncluded({
          field: "$contributors",
          path_to_folder,
          token_path,
        })
      ) {
        dev.logapi("Token is contributor");
        return next ? next() : undefined;
      }
      if (
        await auth.isTokenIncluded({
          field: "$admins",
          path_to_folder,
          token_path,
        })
      ) {
        dev.logapi("Token is local admin");
        return next ? next() : undefined;
      }

      const err = new Error("Token not allowed");
      err.code = "token_not_allowed_must_be_contributors";
      throw err;
    } catch (err) {
      dev.error(err.message);
      if (res) return res.status(403).send({ code: err.code });
      throw err;
    }
  }
  async function _restrictToLocalAdmins(req, res, next) {
    const { path_to_folder } = utils.makePathFromReq(req);
    dev.logapi({ path_to_folder });

    try {
      if (
        (await auth.isFolderOpenedToAll({
          field: "$admins",
          path_to_folder,
        })) ||
        (await auth.isFolderOpenedToAll({ field: "$admins" }))
      )
        return next ? next() : undefined;

      const token_path = auth.extrackAndCheckToken({ req });

      if (token_path === path_to_folder) {
        dev.logapi("Token editing self");
        return next ? next() : undefined;
      }
      if (await auth.isTokenInstanceAdmin({ token_path })) {
        dev.logapi("Token is instance admin");
        return next ? next() : undefined;
      }
      if (
        await auth.isTokenIncluded({
          field: "$admins",
          path_to_folder,
          token_path,
        })
      ) {
        dev.logapi("Token is local admin");
        return next ? next() : undefined;
      }

      const err = new Error("Token not allowed");
      err.code = "token_not_allowed_must_be_local_admin";
      throw err;
    } catch (err) {
      dev.error(err.message);
      if (res) return res.status(403).send({ code: err.code });
      throw err;
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

  // async function _onlyAdminsLocalAdminsAndContributors(req, res, next) {
  //   const { path_to_folder } = utils.makePathFromReq(req);
  //   dev.logapi({ path_to_folder });

  //   let folder_authors = [];
  //   if (path_to_folder) {
  //     const folder_meta = await folder
  //       .getFolder({ path_to_folder })
  //       .catch((err) => {
  //         dev.error(err.message);
  //         if (res) return res.status(404).send({ code: err.code });
  //         throw err;
  //       });
  //     folder_authors = folder_meta.$authors;
  //     if (!folder_authors || folder_authors.length === 0)
  //       return next ? next() : undefined;
  //   }

  //   if (!req.headers || !req.headers.authorization) {
  //     const err = new Error("Headers and token missing");
  //     err.code = "no_headers_with_token_submitted";
  //     throw err;
  //   }

  //   try {
  //     const { token, token_path } = JSON.parse(req.headers.authorization);
  //     if (!token || !token_path) {
  //       const err = new Error("Token and/or token_path missing in headers");
  //       err.code = "no_token_submitted";
  //       throw err;
  //     }

  //     auth.checkTokenValidity({ token, token_path });

  //     if (await auth.isTokenInstanceAdmin({ author_path: token_path })) {
  //       // if token is admin
  //       dev.logapi("Token is admin");
  //       return next ? next() : undefined;
  //     } else if (!path_to_folder) {
  //       dev.logapi("Token not admin is attempting to edit admin settings");
  //       const err = new Error("Token is not admin");
  //       err.code = "endpoint_only_allowed_for_admins";
  //       throw err;
  //     } else if (path_to_folder === token_path) {
  //       dev.logapi("Token path and folder path are identical, next");
  //       return next ? next() : undefined;
  //     } else if (folder_authors.includes(token_path)) {
  //       dev.logapi("Token path is listed in folder authors");
  //       return next ? next() : undefined;
  //     }

  //     dev.logapi("Failed to auth token");
  //     const err = new Error("Failed to auth token");
  //     err.code = "failed_to_auth_token";
  //     throw err;

  //     // if folder is child/has parent, the parent's authors will determine who can edit this child
  //     // if (path_to_parent_folder)
  //     //   await auth.isTokenIncluded({
  //     //     path_to_folder: path_to_parent_folder,
  //     //     author_path: token_path,
  //     //   });
  //     // else
  //     //   await auth.isTokenIncluded({
  //     //     path_to_folder,
  //     //     author_path: token_path,
  //     //   });
  //   } catch (err) {
  //     dev.error(err.message);
  //     if (res) return res.status(403).send({ code: err.code });
  //     throw err;
  //   }
  // }

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
      $cover,
      general_password,
      signup_password,
      require_signup_to_contribute,
      require_mail_to_signup,
      $admins,
      $contributors,
    } = await settings.get();

    d.name_of_instance = name_of_instance || "";
    d.presentation_of_instance = presentation_of_instance || "";
    d.contactmail_of_instance = contactmail_of_instance || "";
    d.cover_of_instance = $cover || {};
    d.favicon_url = $cover ? `/thumbs/${$cover[640]}` : false;
    d.has_general_password = !!general_password;
    d.has_signup_password = !!signup_password;
    d.require_signup_to_contribute = require_signup_to_contribute === true;
    d.require_mail_to_signup = require_mail_to_signup === true;
    d.$admins = $admins || "";
    d.$contributors = $contributors || "";

    d.custom_fonts = (await _loadCustomFonts()) || {};

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

      // todo : filter depending on $status, only authors see folders

      res.setHeader("Access-Control-Allow-Origin", "*");
      dev.logpackets({ d });
      res.json(d);
    } catch (err) {
      dev.error("Failed to get expected content: " + err);
      res.status(404).send({ code: err.code });
    }

    cache.printStatus();
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
      dev.error("Failed to create folder: " + err.message);
      res.status(500).send({ code: err.code });
    }
  }

  async function _getFolder(req, res, next) {
    const { path_to_folder = "" } = utils.makePathFromReq(req);
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
      res.status(404).send({ code: err.code });
    }
    cache.printStatus();
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
      dev.error("Failed to update folder: " + err.message);
      res.status(500).send({ code: err.code });
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
      res.status(404).send({ code: err.code });
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
        path_to_meta: path.join(path_to_folder, meta_filename),
      });
      notifier.emit("fileCreated", path_to_folder, { path_to_folder, meta });
    } catch (err) {
      dev.error("Failed to upload file: " + err);
      res.status(500).send({ code: err.code });
    }
  }
  async function _exportToParent(req, res, next) {
    const { path_to_folder, path_to_parent_folder, data } =
      utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, path_to_parent_folder, data });

    // DISPATCH TASKS
    const task = new Exporter({
      path_to_folder,
      folder_to_export_to: path_to_parent_folder,
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
      path_to_parent_folder,
      task_id,
    });
    res.status(200).json({ task_id });

    // } catch (err) {
    //   dev.error("Failed to export file: " + err);
    //   res.status(500).send({ code: err.code });
    // }

    try {
      const exported_path_to_meta = await task.start();
      const meta = await file.getFile({
        path_to_meta: exported_path_to_meta,
      });
      notifier.emit("fileCreated", path_to_parent_folder, {
        path_to_folder: path_to_parent_folder,
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

    let { path_to_destination_type, new_meta } = data;
    if (!path_to_destination_type) path_to_destination_type = path_to_type;
    else {
      // todo check for auth to copy folder
    }

    const path_to_source_folder = path_to_folder;

    try {
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
      notifier.emit("folderCreated", path_to_type, {
        path: path_to_type,
        meta: new_folder_meta,
      });
    } catch (err) {
      dev.error("Failed to copy expected content: " + err);
      res.status(500).send({ code: err.code });
    }
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
      dev.error("Failed to upload file: " + err);
      res.status(500).send({ code: err.code });
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
      res.status(500).send({ code: err.code });
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
      res.status(404).send({ code: err.code });
    }
  }

  async function _copyFile(req, res, next) {
    const { path_to_folder, meta_filename, path_to_meta, data } =
      utils.makePathFromReq(req);
    dev.logapi({ path_to_folder, path_to_meta, data });

    let { destination_path_to_folder, new_meta } = data;
    if (!destination_path_to_folder)
      destination_path_to_folder = path_to_folder;
    else {
      // todo check for auth to copy to folder
    }

    try {
      const copy_meta_filename = await file.copyFile({
        path_to_folder,
        destination_path_to_folder,
        meta_filename,
        path_to_meta,
        new_meta,
      });
      dev.logpackets({
        status: `copied file`,
        path_to_folder,
        destination_path_to_folder,
        copy_meta_filename,
      });
      res.status(200).json({ meta_filename: copy_meta_filename });

      const meta = await file.getFile({
        path_to_meta: path.join(destination_path_to_folder, copy_meta_filename),
      });
      notifier.emit("fileCreated", destination_path_to_folder, {
        path_to_folder: destination_path_to_folder,
        meta,
      });
    } catch (err) {
      dev.error("Failed to copy expected content: " + err);
      res.status(500).send({ code: err.code });
    }
  }

  function _getLocalNetworkInfos(req, res, next) {
    dev.logapi();
    const local_ips = utils.getLocalIP();

    dev.logpackets({ local_ips });
    res.status(200).json(local_ips);
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
