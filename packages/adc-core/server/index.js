// Public entry of adc-core's server, used by apps (do•doc, slashdoc, Les Cahiers):
//
//   require("adc-core").start({ appRoot, appInfos, settings, clientDist, defaultContent, electron, content })
//
// - appRoot: absolute path of the app (its package.json, build/ icons…)
// - appInfos: { name, productName, version } — productName is shown to users (emails, Bonjour, manifest)
// - settings: settings_base.json merged with the app's settings.json
// - clientDist: folder of the built client, served at /_client and copied into exports
// - views (optional): folder whose index.pug / perf.pug override the core's (server/views)
// - defaultContent: folder copied to the user's Documents on first start
// - electron (optional): { about, backgroundColor } — About panel text and window
//   background, used by the core's electron main process (electron/main.js)
// - content (optional): { acceptLegacyDodocVersion } — accept content folders created
//   before $content_app, that only have dodoc_version="<this value>" (do•doc and its
//   forks), see content-folder.js

const REQUIRED_OPTIONS = [
  "appRoot",
  "appInfos",
  "settings",
  "clientDist",
  "defaultContent",
];

module.exports.start = function start(options) {
  // must run before requiring anything else: dependencies may not load on a wrong runtime
  require("./runtime-check")();

  const missing = REQUIRED_OPTIONS.filter((key) => options[key] === undefined);
  if (missing.length > 0)
    throw new Error(`adc-core start(): missing options ${missing.join(", ")}`);

  return require("./main2")(options);
};
