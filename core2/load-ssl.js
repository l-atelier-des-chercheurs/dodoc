var fs = require("fs");
var path = require("path");

/**
 * Load SSL key and certificate for HTTPS.
 * Exits the process with an error if files are missing or unreadable.
 * @param {object} settings - Settings object with privateKeyPath, certificatePath, passphrase
 * @param {string} ssl_dir - Directory for default SSL paths (e.g. __dirname)
 * @returns {{ key: Buffer, cert: Buffer, passphrase: string }}
 */
function loadHttpsOptions(settings, ssl_dir) {
  const key_path =
    settings.privateKeyPath || path.join(ssl_dir, "ssl", "selfsigned.key");
  const cert_path =
    settings.certificatePath || path.join(ssl_dir, "ssl", "selfsigned.crt");

  try {
    if (!fs.existsSync(key_path)) {
      throw new Error(`SSL key file not found: ${key_path}`);
    }
    if (!fs.existsSync(cert_path)) {
      throw new Error(`SSL certificate file not found: ${cert_path}`);
    }
    return {
      key: fs.readFileSync(key_path),
      cert: fs.readFileSync(cert_path),
      passphrase: settings.passphrase || "",
    };
  } catch (err) {
    console.error("\n❌ SSL certificate error:");
    console.error(`   ${err.message}`);
    console.error(
      "\n   Check privateKeyPath and certificatePath in settings.json, or run 'npm run setup-https' to generate certificates.\n"
    );
    process.exit(1);
  }
}

module.exports = { loadHttpsOptions };
