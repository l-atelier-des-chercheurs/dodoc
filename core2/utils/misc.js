const path = require("path"),
  fs = require("fs-extra"),
  { networkInterfaces } = require("os"),
  crypto = require("crypto");

module.exports = function createMiscUtils(API) {
  return {
    getLocalIPs() {
      const nets = networkInterfaces();
      const results = [];

      for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
          // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
          // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
          const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
          if (net.family === familyV4Value && !net.internal) {
            // if (!results[name]) {
            //   results[name] = [];
            // }
            results.push(net.address);
          }
        }
      }

      return results;
    },

    async hashPassword({
      password,
      salt = crypto.randomBytes(32).toString("hex"),
    }) {
      // see https://stackoverflow.com/a/67038052
      const buf = crypto.scryptSync(password, salt, 64).toString("hex");
      return `${buf.toString("hex")}.${salt}`;
    },
    async checkPassword({ submitted_password, stored_password_with_salt }) {
      // check if password matches stored_password once it is hashed
      const [stored_password, salt] = stored_password_with_salt.split(".");
      const submitted_password_with_salt = await API.hashPassword({
        password: submitted_password,
        salt,
      });
      return submitted_password_with_salt === stored_password_with_salt;
    },

    endsWithAny(suffixes, string) {
      return suffixes.some(function (suffix) {
        return string.endsWith(suffix);
      });
    },

    hashCode(s) {
      return (
        "" +
        s.split("").reduce(function (a, b) {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0)
      );
    },
    remap(val, in_min, in_max, out_min, out_max) {
      const new_val =
        ((val - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
      return Math.min(Math.max(new_val, out_min), out_max);
    },

    addhttp(url) {
      if (!/^(?:f|ht)tps?\:\/\//.test(url)) url = "http://" + url;
      return url;
    },

    getDependenciesWithVersions() {
      try {
        const packageJsonPath = path.join(global.appRoot, "package.json");
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );

        const allDependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.optionalDependencies,
        };

        // Get actual installed versions from node_modules
        const installedVersions = [];
        for (const [depName, requiredVersion] of Object.entries(
          allDependencies
        )) {
          try {
            const depPackageJsonPath = path.join(
              global.appRoot,
              "node_modules",
              depName,
              "package.json"
            );
            if (fs.existsSync(depPackageJsonPath)) {
              const depPackageJson = JSON.parse(
                fs.readFileSync(depPackageJsonPath, "utf8")
              );
              installedVersions.push(`${depName}:${depPackageJson.version}`);
            } else {
              installedVersions.push(`${depName}:NOT_INSTALLED`);
            }
          } catch (err) {
            installedVersions.push(`${depName}:ERROR_READING`);
          }
        }

        // Sort dependencies alphabetically
        installedVersions.sort((a, b) =>
          a.split(":")[0].localeCompare(b.split(":")[0])
        );

        return installedVersions.join(", ");
      } catch (err) {
        return `Error reading dependencies: ${err.message}`;
      }
    },

    /**
     * Canonical public URL for user-facing links (emails, PDF, QR, share).
     * Reads public_url first, then legacy url. Optional fallback to homeURL.
     */
    getPublicUrl({ fallback_to_home_url = false } = {}) {
      let raw = (global.settings.public_url || global.settings.url || "").trim();
      if (!raw && fallback_to_home_url && global.appInfos?.homeURL) {
        raw = global.appInfos.homeURL;
      }
      if (!raw) return "";
      return raw.replace(/\/+$/, "");
    },
  };
};
