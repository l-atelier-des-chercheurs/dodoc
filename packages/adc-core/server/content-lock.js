const path = require("path");
const os = require("os");
const fs = require("fs-extra");

// Only one process (any adc-core app, node or electron) may use a content
// folder at a time: two servers writing the same metas would corrupt them.
//
// The owner writes a .adc-lock at the root of the folder (hidden: ignored by
// content-folder.js, an otherwise empty folder stays "empty") and refreshes
// heartbeat_at regularly. A lock is stale, and taken over, when:
// - it comes from this machine and its process is gone (or has our own pid,
//   like pid 1 when a Docker container restarts),
// - or its heartbeat is too old (other machine, folder on a network share).

const LOCK_FILENAME = ".adc-lock";
const HEARTBEAT_INTERVAL = 30 * 1000;
const STALE_AFTER = 2 * 60 * 1000;

let held_path;
let heartbeat_interval;

module.exports = {
  LOCK_FILENAME,

  // { ok: true } once the lock is ours, { ok: false, owner } if another
  // running process holds it
  async acquire(full_path) {
    const lock_path = path.join(full_path, LOCK_FILENAME);

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        // exclusive creation: of two apps starting at the same time, only one wins
        await fs.writeFile(lock_path, _lockContent(), { flag: "wx" });
        _hold(full_path);
        return { ok: true };
      } catch (err) {
        if (err.code !== "EEXIST") throw err;
      }

      const owner = await _readLock(lock_path);
      if (owner && !_isStale(owner)) return { ok: false, owner };

      // stale or unreadable lock
      await fs.remove(lock_path);
    }
    // another process recreated it between our remove and write
    return { ok: false, owner: await _readLock(lock_path) };
  },

  // the owner of the folder's lock if another running process holds it,
  // without taking it
  async check(full_path) {
    const owner = await _readLock(path.join(full_path, LOCK_FILENAME));
    if (!owner || _isStale(owner) || _isOurs(owner)) return undefined;
    return owner;
  },

  // variables for the content_folder_in_use message
  describeOwner(full_path, owner = {}) {
    return {
      path: full_path,
      other_app: owner.productName || owner.app || "?",
      pid: owner.pid,
      hostname: owner.hostname,
      since: owner.started_at
        ? new Date(owner.started_at).toLocaleString()
        : "?",
    };
  },

  async release() {
    _stopHeartbeat();
    if (!held_path) return;
    const lock_path = path.join(held_path, LOCK_FILENAME);
    held_path = undefined;
    const owner = await _readLock(lock_path);
    if (owner && _isOurs(owner)) await fs.remove(lock_path);
  },

  // for process.on("exit") and app.exit(), where async work never runs
  releaseSync() {
    _stopHeartbeat();
    if (!held_path) return;
    const lock_path = path.join(held_path, LOCK_FILENAME);
    held_path = undefined;
    try {
      const owner = JSON.parse(fs.readFileSync(lock_path, "utf8"));
      if (_isOurs(owner)) fs.removeSync(lock_path);
    } catch (err) {}
  },
};

function _hold(full_path) {
  held_path = full_path;
  const started_at = new Date().toISOString();
  _stopHeartbeat();
  heartbeat_interval = setInterval(async () => {
    try {
      const lock_path = path.join(full_path, LOCK_FILENAME);
      const owner = await _readLock(lock_path);
      // taken over by someone else (we were considered stale): don't fight
      if (owner && !_isOurs(owner)) return _stopHeartbeat();
      await fs.writeFile(lock_path, _lockContent({ started_at }));
    } catch (err) {}
  }, HEARTBEAT_INTERVAL);
  heartbeat_interval.unref();
}

function _stopHeartbeat() {
  if (heartbeat_interval) clearInterval(heartbeat_interval);
  heartbeat_interval = undefined;
}

function _lockContent({ started_at } = {}) {
  const now = new Date().toISOString();
  return JSON.stringify(
    {
      app: global.appInfos?.name,
      productName: global.appInfos?.productName,
      pid: process.pid,
      hostname: os.hostname(),
      started_at: started_at || now,
      heartbeat_at: now,
    },
    null,
    2
  );
}

async function _readLock(lock_path) {
  try {
    return JSON.parse(await fs.readFile(lock_path, "utf8"));
  } catch (err) {
    return undefined;
  }
}

function _isOurs(owner) {
  return owner.pid === process.pid && owner.hostname === os.hostname();
}

function _isStale(owner) {
  if (owner.hostname === os.hostname()) {
    if (owner.pid === process.pid) return true;
    return !_isProcessAlive(owner.pid);
  }
  const heartbeat = Date.parse(owner.heartbeat_at);
  return !heartbeat || Date.now() - heartbeat > STALE_AFTER;
}

function _isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // EPERM: exists but belongs to another user
    return err.code === "EPERM";
  }
}
