const path = require('path');

const packagejson = require('./package.json');
const base_settings = require('./settings_base.json');
const override_settings = require('./settings.json');
const settings = Object.assign(base_settings, override_settings);

global.appRoot = path.resolve(__dirname);
global.appInfos = {
  name: packagejson.name,
  version: packagejson.version
};
global.settings = settings;

const router = require('./router');

require('./core/main')({
  router
});
