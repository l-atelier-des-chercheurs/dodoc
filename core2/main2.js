const path = require("path");
const fs = require("fs-extra");
const net = require("net");

const server = require("./server"),
  dev = require("./dev-log"),
  cache = require("./cache"),
  cacheManager = require("./cache-manager"),
  binCleanup = require("./bin-cleanup"),
  exitHandler = require("./exit-handler"),
  utils = require("./utils"),
  paths = require("./paths"),
  auth = require("./auth"),
  mail = require("./mail"),
  journal = require("./journal"),
  ffmpegTracker = require("./ffmpeg-tracker"),
  contentFolder = require("./content-folder"),
  t = require("./startup-messages");

module.exports = async function () {
  global.is_electron = process.versions.hasOwnProperty("electron");

  const infos = `Starting ${global.appInfos.name} v${
    global.appInfos.version
  }, app is ${global.is_electron ? "electron" : "node"}, node v${
    process.versions.node
  }`;
  console.log(infos);
  journal.log({ message: infos, from: "main2" });

  // Check for Node-specific dependencies when not in Electron
  if (!global.is_electron) {
    try {
      require.resolve("puppeteer");
    } catch (e) {
      console.error(
        "\n❌ ERROR: Puppeteer not installed. Node mode requires puppeteer for PDF/screenshot generation."
      );
      console.error("Run 'npm install' to install required dependencies.\n");
      process.exit(1);
    }
  }

  // Log all dependencies with their installed versions
  console.log(utils.getDependenciesWithVersions());
  journal.log({ message: utils.getDependenciesWithVersions(), from: "main2" });

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

  // Initialize dev logger
  dev.init({ debug, verbose, livereload });
  journal.log({
    message: `Debug mode: ${debug}, verbose: ${verbose}, livereload: ${livereload}`,
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
      win = await require("../electron/electron").init();
    } catch (err) {
      dev.error(err);
      throw err;
    }
  }

  await setupApp().catch((err) => {
    // configuration errors (node / VPS): print a readable message and exit,
    // without a stack trace or an unhandled rejection
    if (!global.is_electron && err.cli_message) {
      console.error(err.cli_message);
      process.exit(1);
    }

    dev.error(err);

    if (global.is_electron) {
      const { dialog } = require("electron");
      dialog.showErrorBox(
        t("failed_to_start"),
        t("error", { error: err })
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
          t("failed_to_start"),
          t("bonjour_domain_must_be_string")
        );
      }
      throw new Error(t("bonjour_domain_must_be_string", {}, "en"));
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

  // Initialize ffmpeg tracker for process management
  ffmpegTracker.init();

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

  // Initialize auth module (tokens file creation and cleanup task)
  await auth.init();
  journal.log({
    message: "Auth module initialized",
    from: "main2",
  });

  auth.createSuperadminToken();

  // Initialize bin cleanup module (runs periodically to remove old bin items)
  await binCleanup.init();
  journal.log({
    message: "Bin cleanup module initialized",
    from: "main2",
  });

  // Centralized exit handler (bin cleanup, cache manager, ffmpeg tracker)
  exitHandler.init();

  const port = await findAvailablePort(
    global.settings.desired_port,
    global.settings.desired_port + 20
  ).catch((err) => {
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
  let full_path_to_content = resolveContentPath(global.settings.contentPath);

  try {
    // Check write permissions for both custom and default paths
    await utils.testWriteFileInFolder(full_path_to_content);
  } catch (err) {
    dev.error(`-> failed to write to content path`, err);

    if (global.is_electron) {
      const { dialog } = require("electron");
      dialog.showErrorBox(
        t("failed_to_write_content_path", { path: full_path_to_content }),
        t("error", { error: err }) +
          "\n\n" +
          t("failed_to_write_content_path_details")
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

  let { status, reason } = await contentFolder.getStatus(full_path_to_content);

  // in electron, let the user pick another folder or go back to the default
  // one, otherwise they would be stuck with a path they can't change from the app
  while (global.is_electron && status === "incompatible") {
    const content_path = await require("../electron/electron").pickContentFolder(
      { refused_path: full_path_to_content }
    );
    full_path_to_content = resolveContentPath(content_path);
    await utils.testWriteFileInFolder(full_path_to_content);
    ({ status, reason } = await contentFolder.getStatus(full_path_to_content));
  }

  if (status === "valid") {
    dev.log(`-> content folder is valid: ${full_path_to_content}`);
  } else if (status === "empty") {
    dev.log(
      `-> content folder is empty at ${full_path_to_content}. Duplicating default content folder.`
    );
    await fs.copy(full_default_path, full_path_to_content);
  } else {
    // never write into a folder we don't recognize: it may hold content from
    // another app or an incompatible version
    const err = new Error(
      t(
        "content_folder_incompatible",
        {
          path: full_path_to_content,
          subfolder: path.join(full_path_to_content, "dodoc"),
        },
        "en"
      )
    );
    err.code = "content_folder_incompatible";
    err.cli_message = [
      "",
      "❌ Incompatible content folder, do•doc will not start.",
      "",
      `   contentPath setting: "${global.settings.contentPath}"`,
      `   Resolved to:         ${full_path_to_content}`,
      `   Problem:             ${reason}`,
      "",
      "   This folder is not empty and was not created by do•doc 10, so do•doc",
      "   refuses to use it. Nothing was changed in it.",
      "",
      "   To fix it, set contentPath in settings.json (next to settings_base.json) to either:",
      "   - a path to an empty or non-existent folder, for example a new subfolder of this one",
      `     ("${path.join(full_path_to_content, "dodoc")}"): do•doc will create its content there,`,
      '   - an existing do•doc 10 content folder (with a meta.txt containing dodoc_version="10").',
      "   A name without slashes is a folder inside the user's Documents folder.",
      "   With Docker, also check the volume mounted on this path.",
      "",
    ].join("\n");
    throw err;
  }

  return full_path_to_content;
}

function resolveContentPath(content_path) {
  // a name without slashes is a folder inside the user's Documents folder
  if (content_path.includes("/") || content_path.includes(path.sep))
    return content_path.replaceAll("/", path.sep);
  return path.join(paths.getDocumentsFolder(), content_path);
}

// test ports by listening on them the same way the server will (all interfaces)
async function findAvailablePort(start_port, end_port) {
  for (let port = start_port; port <= end_port; port++) {
    const is_available = await new Promise((resolve, reject) => {
      const tester = net.createServer();
      tester.once("error", (err) => {
        if (err.code === "EADDRINUSE") resolve(false);
        else reject(err);
      });
      tester.once("listening", () => tester.close(() => resolve(true)));
      tester.listen(port);
    });
    if (is_available) return port;
  }
  throw new Error(`No available port between ${start_port} and ${end_port}`);
}
