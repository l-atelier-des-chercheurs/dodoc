const os = require("os");
const path = require("path");
const fs = require("fs");

module.exports = (function () {
  const API = {
    getCacheFolder() {
      if (global.is_electron) {
        const { app } = require("electron");
        return app.getPath("temp");
      } else {
        return _getNodeCacheFolder();
      }
    },
    getDocumentsFolder() {
      if (global.is_electron) {
        const { app } = require("electron");
        return app.getPath("documents");
      } else {
        return _getNodeDocumentsFolder();
      }
    },
  };

  return API;
})();

// same folders as the platform-folders package used before, without its native build

function _getNodeCacheFolder() {
  const home = os.homedir();
  if (process.platform === "darwin") return path.join(home, "Library", "Caches");
  if (process.platform === "win32")
    return process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
  return process.env.XDG_CACHE_HOME || path.join(home, ".cache");
}

function _getNodeDocumentsFolder() {
  const home = os.homedir();
  if (process.platform === "linux") {
    const xdg_documents = _readXdgUserDir("XDG_DOCUMENTS_DIR");
    if (xdg_documents) return xdg_documents;
  }
  // on Windows, a Documents folder redirected (to OneDrive for example) is not
  // followed: set contentPath to an absolute path in settings.json instead
  return path.join(home, "Documents");
}

// reads ~/.config/user-dirs.dirs, for example XDG_DOCUMENTS_DIR="$HOME/Documents"
function _readXdgUserDir(key) {
  const home = os.homedir();
  const config_home = process.env.XDG_CONFIG_HOME || path.join(home, ".config");
  try {
    const content = fs.readFileSync(path.join(config_home, "user-dirs.dirs"), "utf8");
    const match = content.match(new RegExp(`^${key}="(.*)"\\s*$`, "m"));
    if (!match) return undefined;
    const value = match[1].replace(/^\$HOME/, home);
    // a value equal to $HOME means "disabled"
    return path.isAbsolute(value) && value !== home ? value : undefined;
  } catch (err) {
    return undefined;
  }
}
