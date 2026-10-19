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

// Same folders as the platform-folders package used before (sago's
// platform_folders.cpp), without its native build. Keep them identical:
// the documents folder decides where existing content is found.

function _getNodeCacheFolder() {
  if (process.platform === "win32") return _getWindowsFolders().local_app_data;
  if (process.platform === "darwin")
    return path.join(_getHome(), "Library", "Caches");
  return _getXdgFolder("XDG_CACHE_HOME", ".cache");
}

function _getNodeDocumentsFolder() {
  if (process.platform === "win32") return _getWindowsFolders().documents;
  if (process.platform === "darwin") return path.join(_getHome(), "Documents");
  return _getXdgUserDirs().XDG_DOCUMENTS_DIR;
}

// HOME is ignored when running as root, which works badly with sudo:
// the home directory of the passwd entry is used instead
function _getHome() {
  if (process.getuid && process.getuid() === 0) return os.userInfo().homedir;
  return process.env.HOME || os.userInfo().homedir;
}

function _getXdgFolder(env_name, default_relative_path) {
  const value = process.env[env_name];
  // XDG requires absolute values
  if (value && value.startsWith("/")) return value;
  return path.join(_getHome(), default_relative_path);
}

// ~/.config/user-dirs.dirs, for example XDG_DOCUMENTS_DIR="$HOME/Documents".
// Same parsing as platform-folders: later lines win, a leading $HOME is
// replaced, and a value of "$HOME" (folder disabled) gives the home folder.
function _getXdgUserDirs() {
  const folders = { XDG_DOCUMENTS_DIR: "$HOME/Documents" };
  try {
    const file = path.join(_getXdgFolder("XDG_CONFIG_HOME", ".config"), "user-dirs.dirs");
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      if (!line.startsWith("XDG_") || !line.includes("_DIR")) continue;
      const split_pos = line.indexOf("=");
      const value_start = line.indexOf('"', split_pos);
      const value_end = line.indexOf('"', value_start + 1);
      if (split_pos < 0 || value_start < 0 || value_end < 0) continue;
      folders[line.slice(0, split_pos)] = line.slice(value_start + 1, value_end);
    }
  } catch (err) {}

  for (const key of Object.keys(folders))
    if (folders[key].startsWith("$HOME"))
      folders[key] = _getHome() + folders[key].slice("$HOME".length);
  return folders;
}

// platform-folders calls SHGetKnownFolderPath(FOLDERID_Documents) and
// (FOLDERID_LocalAppData), which follow redirections (OneDrive, network share…).
// [Environment]::GetFolderPath goes through the same Windows API. Output is
// forced to UTF-8: user names with accents are common. Asked once, then cached.
let windows_folders;
function _getWindowsFolders() {
  if (windows_folders) return windows_folders;

  const home = os.homedir();
  windows_folders = {
    documents: path.win32.join(home, "Documents"),
    local_app_data:
      process.env.LOCALAPPDATA || path.win32.join(home, "AppData", "Local"),
  };
  try {
    // full path: don't depend on PATH to find PowerShell
    const powershell = process.env.SystemRoot
      ? path.win32.join(process.env.SystemRoot, "System32", "WindowsPowerShell", "v1.0", "powershell.exe")
      : "powershell.exe";
    const out = require("child_process").execFileSync(
      powershell,
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; " +
          "[Environment]::GetFolderPath('MyDocuments'); " +
          "[Environment]::GetFolderPath('LocalApplicationData')",
      ],
      { encoding: "utf8", windowsHide: true, timeout: 15000 }
    );
    const [documents, local_app_data] = out
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .map((l) => l.trim());
    if (documents && path.win32.isAbsolute(documents))
      windows_folders.documents = documents;
    if (local_app_data && path.win32.isAbsolute(local_app_data))
      windows_folders.local_app_data = local_app_data;
  } catch (err) {
    // keep the defaults above
  }
  return windows_folders;
}
