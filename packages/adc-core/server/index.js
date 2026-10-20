// Public entry of adc-core's server, used by apps (do•doc, slashdoc, Les Cahiers):
//
//   require("adc-core").start({ appRoot, clientDist, defaultContent, electron, content })
//
// - appRoot: absolute path of the app (its package.json, settings_base.json, settings.json…)
// - appInfos (optional): { name, productName, version } — read from appRoot/package.json by default.
//   productName is shown to users (emails, Bonjour, manifest)
// - settings (optional): appRoot/settings_base.json merged with appRoot/settings.json by default
// - clientDist: folder of the built client, served at /_client and copied into exports
// - views (optional): folder whose index.pug / perf.pug override the core's (server/views)
// - defaultContent: folder copied to the user's Documents on first start
// - electron (optional): { about, backgroundColor } — About panel text and window
//   background, used by the core's electron main process (electron/main.js)
// - content (optional): { acceptLegacyDodocVersion } — accept content folders created
//   before $content_app, that only have dodoc_version="<this value>" (do•doc and its
//   forks), see content-folder.js

const REQUIRED_OPTIONS = ["appRoot", "clientDist", "defaultContent"];

module.exports.start = function start(options) {
  // must run before requiring anything else: dependencies may not load on a wrong runtime
  require("./runtime-check")();

  const missing = REQUIRED_OPTIONS.filter((key) => options[key] === undefined);
  if (missing.length > 0)
    throw new Error(`adc-core start(): missing options ${missing.join(", ")}`);

  // the server uses a self-signed certificate by default (https on localhost):
  // accept it for requests made from this process
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

  const { loadAppInfos, loadSettings } = require("./app-config");
  return require("./main2")({
    ...options,
    appInfos: options.appInfos ?? loadAppInfos(options.appRoot),
    settings: options.settings ?? loadSettings(options.appRoot),
  });
};
