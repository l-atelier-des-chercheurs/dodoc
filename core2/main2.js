const getPath = require("platform-folders");
const path = require("path");
const fs = require("fs-extra");
const portscanner = require("portscanner");

const server = require("./server"),
  dev = require("./dev-log"),
  cache = require("./cache"),
  utils = require("./utils");
// auth = require("./auth");

const is_electron = process.versions.hasOwnProperty("electron");

module.exports = async function () {
  console.log(`App is ${is_electron ? "electron" : "node"}`);
  console.log(`Starting = ${global.appInfos.name}`);
  console.log(`Node = ${process.versions.node}`);

  const debug = process.argv.length > 0 && process.argv.includes("--debug");
  const verbose = process.argv.length > 0 && process.argv.includes("--verbose");
  const logToFile = false;

  dev.init(debug, verbose, logToFile);

  if (dev.isDebug()) {
    process.traceDeprecation = true;
    // process.on("unhandledRejection", (err) => {
    //   throw err;
    // });
  }

  let win;
  if (is_electron)
    win = await require("./electron")
      .init()
      .catch((err) => {
        dev.error(err);
      });

  await setupApp().catch((err) => {
    dev.error(err);

    if (is_electron) {
      const { dialog } = require("electron");
      dialog.showErrorBox(
        `Impossible de démarrer l’application`,
        `Code erreur: ${err}`
      );
    }

    throw err;
  });

  server();

  if (is_electron) {
    dev.log(`MAIN — opening URL in electron : ${global.appInfos.homeURL}`);
    win.loadURL(global.appInfos.homeURL);
  }
};

async function setupApp() {
  dev.log(`——— Starting app version ${global.appInfos.version}`);

  // dev.logfunction(`test string`);
  // dev.logfunction(`test string + valeur ${global.appInfos.version}`);
  // dev.logfunction(`test plusieurs`, `strings`);
  // dev.logfunction({ test: "objet" });
  // dev.logfunction({ "est-undefined": undefined });
  // dev.logfunction({ test: "plusieurs", propriété: "un objet" });
  // dev.logfunction({ test: "plusieurs" }, { objets: "à la suite" });
  // dev.logfunction(`une chaine et un`, { objet: "à la suite" });
  // dev.logfunction(["un", "array", "de", "valeurs"]);

  global.tempStorage = getPath.getCacheFolder();
  global.ffmpeg_processes = [];

  if (global.settings.cache_content === true) cache.init();

  await cleanCacheFolder().catch((err) => {
    throw err;
  });

  let full_default_path = path.join(`${global.appRoot}`, `content`);
  if (is_electron)
    full_default_path = path.join(
      `${global.appRoot.replace(`${path.sep}app.asar`, "")}`,
      `content`
    );

  global.pathToUserContent = await copyAndRenameUserFolder(
    full_default_path
  ).catch((err) => {
    throw err;
  });
  dev.log("Will store contents in: " + global.pathToUserContent);

  global.session_options = {};
  // await readsession_metaFile();

  const port = await portscanner
    .findAPortNotInUse(
      global.settings.desired_port,
      global.settings.desired_port + 20
    )
    .catch((err) => {
      dev.error(err);
      throw err;
    });

  global.appInfos.port = port;
  global.appInfos.homeURL = `${global.settings.protocol}://${global.settings.host}:${global.appInfos.port}`;

  dev.log(`main.js - Found available port: ${port}`);
  return;
}

async function copyAndRenameUserFolder(full_default_path) {
  dev.logfunction({ full_default_path });

  let full_path_to_content;

  // two cases:
  if (global.settings.contentPath.startsWith("/")) {
    // otherwise if starts with '/' then its a path to the folder itself
    full_path_to_content = global.settings.contentPath;
  } else {
    // if contentPath is just a name, thats the name of the folder inside /Documents
    const user_dir_path = getPath.getDocumentsFolder();
    full_path_to_content = path.join(
      user_dir_path,
      global.settings.contentPath
    );
  }

  // if path to content exists

  if (await contentFolderIsValid(full_path_to_content)) {
    dev.log(`-> content folder is valid: ${full_path_to_content}`);
  } else {
    dev.log(
      `-> content folder does not already exists at ${full_path_to_content}. Duplicating content folder to create a new one.`
    );
    await fs.copy(full_default_path, full_path_to_content);
  }

  return full_path_to_content;
}

async function contentFolderIsValid(full_path) {
  if (!(await fs.pathExists(full_path))) return false;

  const path_to_content_meta = path.join(full_path, "meta.txt");
  if (!(await fs.pathExists(path_to_content_meta))) return false;

  const meta_file_content = await fs
    .readFile(path_to_content_meta, "UTF-8")
    .catch((err) => {
      return false;
    });
  const meta = utils.parseMeta(meta_file_content);

  if (!meta.dodoc_version || meta.dodoc_version !== "10") return false;

  // TODO improved here: if folder is not valid, create in a subfolder called dodoc-next

  return true;
}

async function cleanCacheFolder() {
  let cachePath = path.join(global.tempStorage, global.settings.cacheDirname);
  dev.log(`Emptying temp folder ${cachePath}`);
  await fs.emptyDir(cachePath).catch((err) => {
    throw err;
  });
  return;
}

async function readAppMeta() {
  utils.readMetaFile();
}

// function readsession_metaFile() {
//   return new Promise(function (resolve, reject) {
//     var pathTosession_meta = api.getFolderPath("meta.txt");
//     try {
//       const metaFileContent = fs.readFileSync(
//         pathTosession_meta,
//         global.settings.textEncoding
//       );
//       const parsed_meta = api.parseData(metaFileContent);
//       _parseSessionMeta(parsed_meta);
//       return resolve();
//     } catch (err) {
//       return resolve();
//     }
//   });
// }

// function _parseSessionMeta(session_meta) {
//   const { session_password, new_account_default_role } = session_meta;

//   if (session_password) {
//     const pass = session_password.trim();
//     dev.log("Found session password in meta.txt set to", pass);
//     // global.session_password = auth.hashCode(pass);
//   }

//   if (new_account_default_role) {
//     dev.log("Found new_account_default_role, set to", new_account_default_role);
//     global.settings.structure.authors.fields.role.default =
//       new_account_default_role;
//   }

//   ["force_login", "simple_login", "require_email", "force_author_password"].map(
//     (rule) => {
//       if (session_meta[rule] === "true") global.session_options[rule] = true;
//       else global.session_options[rule] = false;
//     }
//   );
// }
