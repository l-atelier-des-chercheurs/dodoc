const path = require("path");
const fs = require("fs-extra");

const utils = require("./utils");

// a content folder can be used if it is empty (default content will be copied
// into it) or if it was created by dodoc 10. Anything else is refused, to never
// write into a folder holding something else.
module.exports = {
  async getStatus(full_path) {
    const entries = (await fs.readdir(full_path).catch(() => [])).filter(
      (e) => !e.startsWith(".") && e !== "Thumbs.db" && e !== "desktop.ini"
    );
    if (entries.length === 0) return { status: "empty" };

    const path_to_content_meta = path.join(full_path, "meta.txt");
    if (!(await fs.pathExists(path_to_content_meta)))
      return {
        status: "incompatible",
        reason: `no meta.txt at the root of the folder (found: ${entries
          .slice(0, 5)
          .join(", ")}${entries.length > 5 ? ", …" : ""})`,
      };

    let meta;
    try {
      meta = utils.parseMeta(await fs.readFile(path_to_content_meta, "UTF-8"));
    } catch (err) {
      return {
        status: "incompatible",
        reason: `meta.txt could not be read: ${err.message}`,
      };
    }

    if (meta.dodoc_version === "10") return { status: "valid" };
    if (meta.dodoc_version === undefined)
      return {
        status: "incompatible",
        reason: "meta.txt has no dodoc_version",
      };
    return {
      status: "incompatible",
      reason: `meta.txt has dodoc_version = "${meta.dodoc_version}", expected "10"`,
    };
  },
};
