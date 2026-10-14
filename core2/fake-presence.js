// DEV ONLY — fills presence with fake tabs to review the UI
// enabled with --debug, DODOC_FAKE_PRESENCE=<number of fake browsers>
// (defaults to 6, set to 0 to disable), e.g. DODOC_FAKE_PRESENCE=10 npm run debug
const { randomUUID } = require("crypto");

const dev = require("./dev-log"),
  folder = require("./folder"),
  users = require("./users"),
  utils = require("./utils");

module.exports = (function () {
  const MOVE_EVERY_MS = 8000;
  const DEFAULT_COUNT = 6;

  async function init() {
    if (!dev.isDebug()) return;
    const env_count = process.env.DODOC_FAKE_PRESENCE;
    const count =
      env_count === undefined || env_count === ""
        ? DEFAULT_COUNT
        : Number(env_count);
    if (!count) return;

    // accounts are authors in every dodoc-based tool
    const authors = await _listPaths("authors");
    const locations = ["/", "authors", ...(await _listSchemaLocations())];

    const devices = ["laptop", "phone", "tablet"];
    const fake_tabs = [];

    for (let i = 0; i < count; i++) {
      const browser_id = "fake-" + i;
      // a third of fake browsers are anonymous, to check the count
      const token_path =
        authors.length > 0 && i % 3 !== 2 ? authors[i % authors.length] : null;
      const device = devices[i % devices.length];
      const tabs_count = 1 + (i % 3);

      for (let t = 0; t < tabs_count; t++) {
        const id = randomUUID();
        users.addUser(id, {
          is_fake: true,
          device,
          browser_id,
          token_path,
          path: _pick(locations),
        });
        fake_tabs.push(id);
      }
    }

    dev.log(
      `FAKE PRESENCE — ${count} browsers, ${fake_tabs.length} tabs, over ${locations.length} locations`
    );

    // one fake tab moves now and then, to see live updates
    setInterval(() => {
      users.updateUser(_pick(fake_tabs), { path: _pick(locations) });
    }, MOVE_EVERY_MS);
  }

  // folders of the current tool's schema, on two levels (ie spaces/projects)
  async function _listSchemaLocations() {
    const locations = [];
    const root_types = global.settings?.schema?.$folders || {};
    for (const [type, type_schema] of Object.entries(root_types)) {
      for (const folder_path of await _listPaths(type)) {
        locations.push(folder_path);
        for (const sub_type of Object.keys(type_schema.$folders || {}))
          locations.push(...(await _listPaths(`${folder_path}/${sub_type}`)));
      }
    }
    return locations;
  }

  async function _listPaths(path_to_type) {
    try {
      const folders = await folder.getFolders({ path_to_type });
      return folders.map((f) => utils.convertToSlashPath(f.$path));
    } catch (err) {
      return [];
    }
  }

  function _pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  return { init };
})();
