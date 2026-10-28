const path = require("path");

// adc-core checks the Node.js / Electron version, then reads package.json,
// settings_base.json and settings.json from appRoot
require("adc-core").start({
  appRoot: path.resolve(__dirname),
  clientDist: path.join(__dirname, "client", "dist"),
  defaultContent: path.join(__dirname, "content"),
  electron: {
    about:
      "do•doc est un outil de documentation pour la créativité. Publié sous licence libre GNU AGPL.\n\ndo•doc is a documentation tool for creativity. Released under the free software GNU AGPL license.",
  },
  // content folders created before $content_app only have dodoc_version="10"
  content: { acceptLegacyDodocVersion: "10" },
});
