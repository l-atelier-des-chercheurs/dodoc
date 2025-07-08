const path = require("path");
const fs = require("fs-extra");
const portscanner = require("portscanner");

const server = require("./server"),
  dev = require("./dev-log"),
  cache = require("./cache"),
  cacheManager = require("./cache-manager"),
  utils = require("./utils"),
  paths = require("./paths"),
  auth = require("./auth"),
  mail = require("./mail"),
  journal = require("./journal");

module.exports = async function () {
  global.is_electron = process.versions.hasOwnProperty("electron");

  const infos = `Starting ${global.appInfos.name} v${
    global.appInfos.version
  }, app is ${global.is_electron ? "electron" : "node"}, node v${
    process.versions.node
  }`;
  console.log(infos);
  journal.log({ message: infos, from: "main2" });

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

  // Initialize dev logger without file logging first (file logging starts after content path is set)
  dev.init({ debug, verbose, livereload, logToFile });
  journal.log({
    message: `Debug mode: ${debug}, verbose: ${verbose}, livereload: ${livereload}, logToFile: ${logToFile}`,
    from: "main2",
  });

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
      dialog.showErrorBox(`Failed to start the application`, `Error: ${err}`);
    }

    throw err;
  });

  server();

  if (global.settings.bonjour_domain !== false) {
    if (typeof global.settings.bonjour_domain !== "string") {
      if (global.is_electron) {
        const { dialog } = require("electron");
        dialog.showErrorBox(
          `Impossible de démarrer l'application`,
          `Le domaine Bonjour doit être une chaîne de caractères.`
        );
      }
      throw new Error("Le domaine Bonjour doit être une chaîne de caractères.");
    } else {
      await require("./bonjour").init({
        name: "do•doc",
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

  await cacheManager.init();

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
  journal.log({
    message: "Will store contents in: " + global.pathToUserContent,
    from: "main2",
  });

  // Now that content path is available, start file logging if requested
  journal.init();
  dev.log("Journal logging started");

  global.can_send_email = mail.canSendMail();
  journal.log({
    message: "Can send email: " + global.can_send_email,
    from: "main2",
  });

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

  if (port === global.settings.desired_port) {
    dev.log(`Desired port ${port} available`);
    journal.log({
      message: `Desired port ${port} available`,
      from: "main2",
    });
  } else {
    dev.log(
      `Desired port ${global.settings.desired_port} NOT available, using ${port}`
    );
    journal.log({
      message: `Desired port ${global.settings.desired_port} NOT available, using ${port}`,
      from: "main2",
    });
  }

  global.appInfos.port = port;
  global.appInfos.homeURL = `${global.settings.protocol}://${global.settings.host}:${global.appInfos.port}`;

  return;
}

async function copyAndRenameUserFolder(full_default_path) {
  dev.logfunction({ full_default_path });

  const user_dir_path = paths.getDocumentsFolder();
  let full_path_to_content;

  if (
    global.settings.contentPath.includes("/") ||
    global.settings.contentPath.includes(path.sep)
  ) {
    full_path_to_content = global.settings.contentPath.replaceAll(
      "/",
      path.sep
    );
  } else {
    full_path_to_content = path.join(
      user_dir_path,
      global.settings.contentPath
    );
  }

  try {
    // Check write permissions for both custom and default paths
    await utils.testWriteFileInFolder(full_path_to_content);
  } catch (err) {
    dev.error(`-> failed to write to content path`, err);

    if (global.is_electron) {
      const { dialog } = require("electron");
      dialog.showErrorBox(
        `Failed to write to content path: ${full_path_to_content}`,
        `Error: ${err}\n\n` +
          `Please check if the path is correct and if you have the necessary permissions to write to it. do•doc will start with the default Documents/dodoc folder`
      );
    }

    // Fallback to default path
    full_path_to_content = path.join(user_dir_path, "dodoc");
    dev.log("fallback to default path for content", full_path_to_content);

    // Check write permissions for fallback path
    try {
      await utils.testWriteFileInFolder(full_path_to_content);
    } catch (fallbackErr) {
      dev.error(`-> failed to write to fallback path`, fallbackErr);
      throw new Error(
        `Cannot write to any content directory: ${fallbackErr.message}`
      );
    }
  }

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
