#!/usr/bin/env node
/**
 * Generate locally-trusted HTTPS certificates for development using mkcert.
 * Required for WebSockets, getUserMedia, geolocation, etc. in modern browsers.
 *
 * Prerequisites:
 *   brew install mkcert   # macOS
 *   mkcert -install       # trust the local CA (run once)
 *
 * Usage:
 *   node scripts/setup-https-certs.js
 */

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ssl_dir = path.join(__dirname, "..", "core2", "ssl");
const cert_path = path.join(ssl_dir, "localhost.crt");
const key_path = path.join(ssl_dir, "localhost.key");
const settings_path = path.join(__dirname, "..", "settings.json");

function main() {
  try {
    execSync("mkcert -help", { stdio: "ignore" });
  } catch {
    console.error(`
mkcert is not installed. Install it first:

  macOS:   brew install mkcert
  Linux:   See https://github.com/FiloSottile/mkcert#installation

Then run once to trust the local CA:
  mkcert -install
`);
    process.exit(1);
  }

  if (!fs.existsSync(ssl_dir)) {
    fs.mkdirSync(ssl_dir, { recursive: true });
  }

  console.log("Generating locally-trusted certificates for localhost...");
  const result = spawnSync(
    "mkcert",
    [
      "-cert-file", cert_path,
      "-key-file", key_path,
      "localhost", "127.0.0.1", "::1",
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    process.exit(1);
  }

  let settings = {};
  if (fs.existsSync(settings_path)) {
    settings = JSON.parse(fs.readFileSync(settings_path, "utf8"));
  }

  settings.privateKeyPath = key_path;
  settings.certificatePath = cert_path;
  fs.writeFileSync(
    settings_path,
    JSON.stringify(settings, null, 2),
    "utf8"
  );

  console.log(`
Done. Certificates written to:
  ${cert_path}
  ${key_path}

settings.json updated. Restart the server and open https://localhost:8080
`);
}

main();
