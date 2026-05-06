const path = require("path"),
  fs = require("fs-extra");

const utils = require("./utils"),
  dev = require("./dev-log");

module.exports = (function () {
  const META_ARCHIVE_FILENAME = "meta_archive.jsonl";

  // Keys that are server-generated or binary and carry no meaningful edit
  // history — always excluded from the log.
  const EXCLUDED_KEYS = new Set([
    "$path",
    "$date_created",
    "$date_modified",
    "$cover",
    "$files",
    "$preview",
    "$archives",
    "$infos",
  ]);

  // Keys whose value must never be stored — presence in the log is enough.
  const SENSITIVE_KEYS = new Set(["$password"]);

  const API = {
    META_ARCHIVE_FILENAME,

    // Called once at folder creation. Snapshots all user-editable fields so
    // history is complete from day one.
    appendCreated: async ({ path_to_folder, meta, author_path }) => {
      dev.logfunction({ path_to_folder });

      const fields = {};
      for (const [key, value] of Object.entries(meta || {})) {
        if (EXCLUDED_KEYS.has(key)) continue;
        fields[key] = SENSITIVE_KEYS.has(key) ? null : value;
      }
      if (Object.keys(fields).length === 0) return;

      await _appendLine(path_to_folder, {
        ts: new Date().toISOString(),
        event: "created",
        fields,
        author: author_path || "",
      });
    },

    // Called on every meta update. Each changed user-editable field gets its
    // own line. Sensitive values are blanked — their presence is enough.
    appendUpdated: async ({ path_to_folder, data, author_path }) => {
      dev.logfunction({ path_to_folder });

      const ts = new Date().toISOString();
      const writes = [];

      for (const [key, value] of Object.entries(data || {})) {
        if (EXCLUDED_KEYS.has(key)) continue;
        writes.push(
          _appendLine(path_to_folder, {
            ts,
            event: "updated",
            field: key,
            value: SENSITIVE_KEYS.has(key) ? null : value,
            author: author_path || "",
          })
        );
      }

      await Promise.all(writes);
    },

    // Returns all entries in chronological order (oldest first).
    getEntries: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });

      const full_path = _getFullPath(path_to_folder);
      try {
        const content = await fs.readFile(full_path, "utf8");
        return content
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      } catch {
        return [];
      }
    },
  };

  function _getFullPath(path_to_folder) {
    return utils.getPathToUserContent(path_to_folder, META_ARCHIVE_FILENAME);
  }

  async function _appendLine(path_to_folder, entry) {
    const full_path = _getFullPath(path_to_folder);
    await fs.ensureDir(path.dirname(full_path));
    await fs.appendFile(full_path, JSON.stringify(entry) + "\n", "utf8");
  }

  return API;
})();
