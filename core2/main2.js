const getPath = require("platform-folders");
const path = require("path");
const fs = require("fs-extra");
const portscanner = require("portscanner");

const server = require("./server");
const dev = require("./dev-log"),
  cache = require("./cache");
// auth = require("./auth");

module.exports = async function () {
  const is_electron = process.versions.hasOwnProperty("electron");

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
  if (is_electron) {
    if (dev.isDebug())
      try {
        // require("electron-reloader")(module);
      } catch {}

    win = await require("./electron")
      .init()
      .catch((err) => {
        dev.error(`Error code: ${err}`);
      });

    global.sourcePathInApp = path.join(
      `${global.appRoot.replace(`${path.sep}app.asar`, "")}`,
      `${global.settings.contentDirname}`
    );
  } else {
    global.sourcePathInApp = path.join(
      `${global.appRoot}`,
      `${global.settings.contentDirname}`
    );
  }

  await setupApp().catch((err) => {
    dev.error(`Error code: ${err}`);

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

  global.pathToUserContent = await copyAndRenameUserFolder().catch((err) => {
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
      dev.error(`err ${err}`);
      throw err;
    });

  global.appInfos.port = port;
  global.appInfos.homeURL = `${global.settings.protocol}://${global.settings.host}:${global.appInfos.port}`;

  dev.log(`main.js - Found available port: ${port}`);
  return;
}

function copyAndRenameUserFolder() {
  return new Promise(function (resolve, reject) {
    const userDirPath = getPath.getDocumentsFolder();

    const pathToUserContent = path.join(
      userDirPath,
      global.settings.userDirname
    );
    fs.access(pathToUserContent, fs.F_OK, function (err) {
      // if userDir folder doesn't exist yet at destination
      if (err) {
        dev.log(
          `Content folder ${global.settings.userDirname} does not already exists in ${userDirPath} -> duplicating ${global.settings.contentDirname} to create a new one`
        );
        fs.copy(global.sourcePathInApp, pathToUserContent, function (err) {
          if (err) {
            dev.error(`Failed to copy: ${err}`);
            return reject(err);
          }
          return resolve(pathToUserContent);
        });
      } else {
        dev.log(
          `Content folder ${global.settings.userDirname} already exists in ${userDirPath}`
        );
        dev.log(`-> not creating a new one`);
        return resolve(pathToUserContent);
      }
    });
  });
}

function cleanCacheFolder() {
  return new Promise(function (resolve, reject) {
    let cachePath = path.join(global.tempStorage, global.settings.cacheDirname);
    dev.log(`Emptying temp folder ${cachePath}`);
    fs.emptyDir(cachePath)
      .then(() => {
        resolve();
      })
      .catch((err) => {
        dev.error(err);
        return reject(err);
      });
  });
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

function _parseSessionMeta(session_meta) {
  const { session_password, new_account_default_role } = session_meta;

  if (session_password) {
    const pass = session_password.trim();
    dev.log("Found session password in meta.txt set to", pass);
    // global.session_password = auth.hashCode(pass);
  }

  if (new_account_default_role) {
    dev.log("Found new_account_default_role, set to", new_account_default_role);
    global.settings.structure.authors.fields.role.default =
      new_account_default_role;
  }

  ["force_login", "simple_login", "require_email", "force_author_password"].map(
    (rule) => {
      if (session_meta[rule] === "true") global.session_options[rule] = true;
      else global.session_options[rule] = false;
    }
  );
}
