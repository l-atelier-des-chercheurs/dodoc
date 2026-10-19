const path = require("path");
const fs = require("fs-extra");

const utils = require("./utils");

// A content folder declares which app created it, and in which format, in the
// meta.txt at its root:
//   "$content_app" = "dodoc"
//   "$content_version" = "10"
// The expected values come from the app's default content (its meta.txt), so
// the app is the only source of truth. Without $content_app there, the app name
// (package.json) is used.
//
// Folders created before $content_app only have dodoc_version="10" (dodoc and
// all its forks). They are accepted by the apps that pass
// content: { acceptLegacyDodocVersion: "10" } to start(), and stamped with
// $content_app when adopted (dodoc_version is kept, for older versions).
//
// A folder can be used if it is empty (default content is copied into it) or
// if its format matches. Anything else is refused, to never write into a
// folder holding something else.

let expected;

module.exports = {
  async init(full_default_path, { acceptLegacyDodocVersion } = {}) {
    const meta = await _readMeta(full_default_path);
    if (!meta)
      throw new Error(`default content has no meta.txt: ${full_default_path}`);

    expected = {
      app: meta.$content_app || global.appInfos.name,
      // a default content not updated yet only has dodoc_version
      version: _toString(meta.$content_version ?? meta.dodoc_version),
      legacy_dodoc_version: _toString(acceptLegacyDodocVersion),
    };
    if (expected.version === undefined)
      throw new Error(
        `default content meta.txt has no $content_version: ${full_default_path}`
      );
    return expected;
  },

  getExpected() {
    return expected;
  },

  async getStatus(full_path) {
    const entries = (await fs.readdir(full_path).catch(() => [])).filter(
      (e) => !e.startsWith(".") && e !== "Thumbs.db" && e !== "desktop.ini"
    );
    if (entries.length === 0) return { status: "empty" };

    let meta;
    try {
      meta = await _readMeta(full_path);
    } catch (err) {
      return {
        status: "incompatible",
        reason: `meta.txt could not be read: ${err.message}`,
      };
    }
    if (!meta)
      return {
        status: "incompatible",
        reason: `no meta.txt at the root of the folder (found: ${entries
          .slice(0, 5)
          .join(", ")}${entries.length > 5 ? ", …" : ""})`,
      };

    const found = _readFormat(meta);
    if (!found)
      return {
        status: "incompatible",
        reason: "meta.txt has no $content_app nor dodoc_version",
      };

    if (found.legacy) {
      if (
        expected.legacy_dodoc_version !== undefined &&
        found.version === expected.legacy_dodoc_version
      )
        return { status: "valid", needs_stamp: true, found };
      return {
        status: "incompatible",
        found,
        reason: `meta.txt has dodoc_version = "${found.version}" (created before $content_app), ${expected.app} expects $content_app = "${expected.app}", $content_version = "${expected.version}"`,
      };
    }

    if (found.app === expected.app && found.version === expected.version)
      return { status: "valid", found };

    return {
      status: "incompatible",
      found,
      reason: `meta.txt has $content_app = "${found.app}", $content_version = "${found.version}", expected "${expected.app}", "${expected.version}"`,
    };
  },

  // writes $content_app and $content_version into the folder's meta.txt,
  // keeping everything else: for folders copied from a default content that
  // doesn't declare them, or adopted from before $content_app
  async stamp(full_path) {
    const meta = (await _readMeta(full_path)) || {};
    if (
      meta.$content_app === expected.app &&
      _toString(meta.$content_version) === expected.version
    )
      return false;

    meta.$content_app = expected.app;
    meta.$content_version = expected.version;
    await utils.storeContent({
      full_path: path.join(full_path, "meta.txt"),
      meta,
    });
    return true;
  },
};

function _readFormat(meta) {
  if (meta.$content_app)
    return {
      app: meta.$content_app,
      version: _toString(meta.$content_version),
    };
  if (meta.dodoc_version !== undefined)
    return {
      app: "dodoc",
      version: _toString(meta.dodoc_version),
      legacy: true,
    };
  return undefined;
}

async function _readMeta(full_path) {
  const path_to_meta = path.join(full_path, "meta.txt");
  if (!(await fs.pathExists(path_to_meta))) return undefined;
  return utils.parseMeta(await fs.readFile(path_to_meta, "UTF-8"));
}

function _toString(v) {
  return v === undefined || v === null ? undefined : String(v);
}
