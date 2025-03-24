const path = require("path");
const fs = require("fs-extra");
const portscanner = require("portscanner");

const server = require("./server"),
  dev = require("./dev-log"),
  cache = require("./cache"),
  utils = require("./utils"),
  paths = require("./paths"),
  auth = require("./auth");

module.exports = async function () {
  global.is_electron = process.versions.hasOwnProperty("electron");

  console.log(`App is ${global.is_electron ? "electron" : "node"}`);
  console.log(`Starting = ${global.appInfos.name}`);
  console.log(`Node = ${process.versions.node}`);

  // setInterval(() => {
  //   const usedHeapSize = process.memoryUsage().heapUsed;
  //   const totalHeapSize = v8.getHeapStatistics().total_available_size;
  //   const heapPercentage = (usedHeapSize / totalHeapSize) * 100;
  //   console.log(`Heap Memory Usage: ${heapPercentage.toFixed(2)}%`);
  // }, 1000);

  const debug = process.argv.length > 0 && process.argv.includes("--debug");
  const verbose = process.argv.length > 0 && process.argv.includes("--verbose");
  const livereload =
    process.argv.length > 0 && process.argv.includes("--livereload");
  const logToFile = false;

  dev.init(debug, verbose, livereload, logToFile);

  if (dev.isDebug()) {
    process.traceDeprecation = true;
    // process.on("unhandledRejection", (err) => {
    //   throw err;
    // });
  }

  let win;
  if (global.is_electron) {
    try {
      win = await require("./electron").init();
    } catch (err) {
      dev.error(err);
      throw err;
    }
  }

  await setupApp().catch((err) => {
    dev.error(err);

    if (global.is_electron) {
      const { dialog } = require("electron");
      dialog.showErrorBox(
        `Impossible de démarrer l’application`,
        `Code erreur: ${err}`
      );
    }

    throw err;
  });

  server();

  if (global.settings.bonjour_domain !== false) {
    if (typeof global.settings.bonjour_domain !== "string") {
      if (global.is_electron) {
        const { dialog } = require("electron");
        dialog.showErrorBox(
          `Impossible de démarrer l’application`,
          `Le domaine Bonjour doit être une chaîne de caractères.`
        );
      }
      throw new Error("Le domaine Bonjour doit être une chaîne de caractères.");
    } else {
      await require("./bonjour").init({
        name: "lumadoc",
        protocol: global.settings.protocol,
        port: global.appInfos.port,
        host: global.settings.bonjour_domain,
      });
    }
  }

  if (global.is_electron) {
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

  global.pathToCache = await createCacheFolder().catch((err) => {
    throw err;
  });

  global.ffmpeg_processes = [];

  if (global.settings.cache_content === true) cache.init();

  let full_default_path = path.join(`${global.appRoot}`, `content`);
  if (global.is_electron)
    full_default_path = path.join(
      `${global.appRoot.replace(
        `${path.sep}app.asar`,
        `${path.sep}app.asar.unpacked`
      )}`,
      `content`
    );

  global.pathToUserContent = await copyAndRenameUserFolder(
    full_default_path
  ).catch((err) => {
    throw err;
  });
  dev.log("Will store contents in: " + global.pathToUserContent);

  // global.session_options = {};
  // await readsession_metaFile();
  auth.createSuperadminToken();

  const port = await portscanner
    .findAPortNotInUse(
      global.settings.desired_port,
      global.settings.desired_port + 20
    )
    .catch((err) => {
      dev.error(err);
      throw err;
    });

  if (port === global.settings.desired_port)
    dev.log(`Desired port ${port} available`);
  else
    dev.log(
      `Desired port ${global.settings.desired_port} NOT available, using ${port}`
    );

  global.appInfos.port = port;
  global.appInfos.homeURL = `${global.settings.protocol}://${global.settings.host}:${global.appInfos.port}`;

  return;
}

async function copyAndRenameUserFolder(full_default_path) {
  dev.logfunction({ full_default_path });

  const user_dir_path = paths.getDocumentsFolder();

  let full_path_to_content;
  const path_is_custom =
    global.settings.contentPath.startsWith("/") ||
    global.settings.contentPath.includes(path.sep);

  if (path_is_custom) {
    try {
      // attempt to use custom path
      const custom_path = global.settings.contentPath.replaceAll("/", path.sep);
      await utils.testWriteFileInFolder(custom_path);
      full_path_to_content = custom_path;
    } catch (err) {
      // failed to write to custom path, fallback to default path
      // todo display error message to user
      dev.error(`-> failed to write to custom path`, err);
      full_path_to_content = path.join(user_dir_path, "dodoc");
      dev.log("fallback to default path for content", full_path_to_content);
    }
  } else {
    full_path_to_content = path.join(
      user_dir_path,
      global.settings.contentPath
    );
  }

  // attempt to write something to dest folder

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

  // TODO improve here: if folder is not valid, create in a subfolder called dodoc-next

  return true;
}

async function createCacheFolder() {
  const cache_folder_path = path.join(
    paths.getCacheFolder(),
    utils.createUniqueName("dodoc_cache")
  );
  try {
    await utils.testWriteFileInFolder(cache_folder_path);
    dev.log(`Cache folder set to`, cache_folder_path);
  } catch (err) {
    dev.error(`-> failed to write to cache folder`, err);
    throw err;
  }
  return cache_folder_path;
}

async function readAppMeta() {
  // utils.readMetaFile();
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
