const path = require("path");

// Configure Node.js to accept self-signed certificates
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const packagejson = require("./package.json"),
  base_settings = require("./settings_base.json");

global.appRoot = path.resolve(__dirname);
global.appInfos = {
  name: packagejson.name,
  productName: packagejson.productName,
  version: packagejson.version,
};

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
global.settings = settings;

const main = require("./core2/main2");
main();
