const path = require("path");
const packagejson = require("./package.json");
const base_settings = require("./settings_base.json");
const main = require("./core2/main2");

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

main();
