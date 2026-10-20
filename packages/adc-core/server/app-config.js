// Reads what start() needs from the app folder, so each app's index.js doesn't have to:
// - appInfos: name, productName, version from the app's package.json
// - settings: the app's settings_base.json, overridden by its settings.json if present
// Only uses Node built-ins: runs before the core's dependencies are loaded.

const fs = require("fs");
const path = require("path");

module.exports.loadAppInfos = function loadAppInfos(appRoot) {
  const { name, productName, version } = require(path.join(
    appRoot,
    "package.json"
  ));
  return { name, productName, version };
};

module.exports.loadSettings = function loadSettings(appRoot) {
  const base_settings = require(path.join(appRoot, "settings_base.json"));
  const settings_path = path.join(appRoot, "settings.json");

  if (!fs.existsSync(settings_path)) {
    console.log("CORE / didn't find override settings, using base settings");
    return { ...base_settings };
  }

  try {
    const override_settings = JSON.parse(
      fs.readFileSync(settings_path, "utf8")
    );
    console.log("CORE / found override settings.json");
    return { ...base_settings, ...override_settings };
  } catch (ex) {
    console.error("ERROR: Invalid settings.json file");
    console.error(
      "The settings.json file exists but contains invalid JSON syntax."
    );
    console.error("Error details:", ex.message);
    console.error(
      "\nPlease fix the JSON syntax in settings.json or remove the file."
    );
    process.exit(1);
  }
};
