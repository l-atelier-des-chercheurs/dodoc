/**
 * content-lock tests
 *
 * Usage:
 *   node --test packages/adc-core/server/tests/test-content-lock.js
 */

const test = require("node:test");
const assert = require("node:assert");
const path = require("path");
const os = require("os");
const fs = require("fs-extra");
const { spawn } = require("child_process");

const contentLock = require("../content-lock");

global.appInfos = { name: "testapp", productName: "Test App" };

function lockPath(dir) {
  return path.join(dir, contentLock.LOCK_FILENAME);
}

async function writeLock(dir, owner) {
  const now = new Date().toISOString();
  await fs.writeJson(lockPath(dir), {
    app: "other",
    productName: "Other App",
    hostname: os.hostname(),
    started_at: now,
    heartbeat_at: now,
    ...owner,
  });
}

async function makeDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "adc-lock-"));
}

test.afterEach(() => contentLock.release());

test("acquires an empty folder and releases it", async () => {
  const dir = await makeDir();
  assert.deepStrictEqual(await contentLock.acquire(dir), { ok: true });
  const owner = await fs.readJson(lockPath(dir));
  assert.strictEqual(owner.pid, process.pid);
  assert.strictEqual(owner.app, "testapp");
  await contentLock.release();
  assert.strictEqual(await fs.pathExists(lockPath(dir)), false);
});

test("refuses a folder locked by a running process", async () => {
  const dir = await makeDir();
  const child = spawn(process.execPath, ["-e", "setTimeout(() => {}, 10000)"]);
  try {
    await writeLock(dir, { pid: child.pid });
    const res = await contentLock.acquire(dir);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.owner.pid, child.pid);
    assert.strictEqual((await contentLock.check(dir)).pid, child.pid);
  } finally {
    child.kill();
  }
});

test("takes over a lock from a dead process", async () => {
  const dir = await makeDir();
  const child = spawn(process.execPath, ["-e", ""]);
  await new Promise((r) => child.on("exit", r));
  await writeLock(dir, { pid: child.pid });
  assert.strictEqual(await contentLock.check(dir), undefined);
  assert.deepStrictEqual(await contentLock.acquire(dir), { ok: true });
});

test("takes over a lock with our own pid (container restart)", async () => {
  const dir = await makeDir();
  await writeLock(dir, { pid: process.pid });
  assert.deepStrictEqual(await contentLock.acquire(dir), { ok: true });
});

test("other machine: refused while its heartbeat is recent, then taken over", async () => {
  const dir = await makeDir();
  await writeLock(dir, { pid: 1234, hostname: "elsewhere" });
  assert.strictEqual((await contentLock.acquire(dir)).ok, false);

  const old = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  await writeLock(dir, { pid: 1234, hostname: "elsewhere", heartbeat_at: old });
  assert.deepStrictEqual(await contentLock.acquire(dir), { ok: true });
});

test("release doesn't remove a lock taken over by another process", async () => {
  const dir = await makeDir();
  await contentLock.acquire(dir);
  await writeLock(dir, { pid: 1234, hostname: "elsewhere" });
  await contentLock.release();
  assert.strictEqual(await fs.pathExists(lockPath(dir)), true);

  await writeLock(dir, { pid: process.pid });
  contentLock.releaseSync();
  // releaseSync only acts on a held lock
  assert.strictEqual(await fs.pathExists(lockPath(dir)), true);
});
