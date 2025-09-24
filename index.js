const path = require("path");

// Configure Node.js to accept self-signed certificates
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const packagejson = require("./package.json"),
  base_settings = require("./settings_base.json"),
  journal = require("./core2/journal");

global.appRoot = path.resolve(__dirname);
global.appInfos = {
  name: packagejson.name,
  productName: packagejson.productName,
  version: packagejson.version,
};

let settings = base_settings;
try {
  const override_settings = require("./settings.json");
  Object.assign(settings, override_settings);
  console.log("INDEX / found override settings.json");
} catch (ex) {
  console.log("INDEX / didn’t find override settings");
}
global.settings = settings;

const main = require("./core2/main2");
main();
