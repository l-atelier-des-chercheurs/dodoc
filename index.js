const packagejson = require("./package.json");
const path = require("path");

// Configure Node.js to accept self-signed certificates
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const base_settings = require("./settings_base.json");

let settings = base_settings;
const fs = require("fs");
const settings_path = path.join(__dirname, "settings.json");

if (fs.existsSync(settings_path)) {
  try {
    // Try to read and parse the JSON file
    const settings_content = fs.readFileSync(settings_path, "utf8");
    const override_settings = JSON.parse(settings_content);
    Object.assign(settings, override_settings);
    console.log("INDEX / found override settings.json");
  } catch (ex) {
    console.error("ERROR: Invalid settings.json file");
    console.error(
      "The settings.json file exists but contains invalid JSON syntax."
    );
    console.error("Error details:", ex.message);
    console.error(
      "\nPlease fix the JSON syntax in settings.json or remove the file."
    );
    process.exit(1); // Exit with error code
  }
} else {
  console.log("INDEX / didn't find override settings, using base settings");
}
// adc-core checks the Node.js / Electron version before loading anything else
require("adc-core").start({
  appRoot: path.resolve(__dirname),
  appInfos: {
    name: packagejson.name,
    productName: packagejson.productName,
    version: packagejson.version,
  },
  settings,
  clientDist: path.join(__dirname, "client", "dist"),
  views: __dirname,
  defaultContent: path.join(__dirname, "content"),
  electron: () => require("./electron/electron"),
  // content folders created before $content_app only have dodoc_version="10"
  content: { acceptLegacyDodocVersion: "10" },
});
