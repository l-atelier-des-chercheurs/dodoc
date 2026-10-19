// Compares adc-core's paths.js with the platform-folders package it replaced,
// on the current OS: both must give the same documents and cache folders,
// since the documents folder decides where existing content is found.
// Used by the "Platform paths" workflow.
//
// usage: node scripts/compare-platform-folders.js <path to platform-folders> [--expect-documents <path>]
//   platform-folders is installed outside the repo, for example:
//   npm install --prefix "$RUNNER_TEMP/pf" platform-folders@0.6.1

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const [platform_folders, ...flags] = process.argv.slice(2);
if (!platform_folders) {
  console.error("usage: node scripts/compare-platform-folders.js <path to platform-folders>");
  process.exit(2);
}
const expect_index = flags.indexOf("--expect-documents");
const expected_documents = expect_index >= 0 ? flags[expect_index + 1] : undefined;

const paths_js = path.join(__dirname, "..", "packages", "adc-core", "server", "paths.js");

// both modules are loaded in the same child process, with the same environment
// (a null value removes the variable)
function compare(label, env) {
  const code = `
    const ours = require(${JSON.stringify(paths_js)});
    const theirs = require(${JSON.stringify(path.resolve(platform_folders))});
    const r = {};
    for (const fn of ["getDocumentsFolder", "getCacheFolder"]) {
      try { r[fn] = { ours: ours[fn]() }; } catch (e) { r[fn] = { ours: "THROWS " + e.message }; }
      try { r[fn].theirs = theirs[fn](); } catch (e) { r[fn].theirs = "THROWS " + e.message; }
    }
    console.log(JSON.stringify(r));`;
  const child_env = { ...process.env, ...env };
  for (const key of Object.keys(env)) if (env[key] === null) delete child_env[key];
  const res = spawnSync(process.execPath, ["-e", code], {
    env: child_env,
    encoding: "utf8",
  });
  if (res.status !== 0) {
    console.log(`❌ ${label}: child process failed\n${res.stderr}`);
    return false;
  }
  const r = JSON.parse(res.stdout);
  let ok = true;
  for (const [fn, { ours, theirs }] of Object.entries(r)) {
    // same folder, written the same way or not (trailing or doubled separators)
    const same = path.normalize(ours) === path.normalize(theirs);
    if (!same) ok = false;
    console.log(`${same ? "✅" : "❌"} ${label} — ${fn}\n     ours:   ${ours}\n     theirs: ${theirs}`);
  }
  return ok;
}

let ok = true;
const run = (label, env = {}) => (ok = compare(label, env) && ok);

const as_root = process.getuid && process.getuid() === 0;
console.log(
  `platform ${process.platform}, node ${process.version}${as_root ? ", running as root" : ""}\n`
);

run("current environment");

if (process.platform === "win32") {
  if (expected_documents) {
    const ours = require(paths_js).getDocumentsFolder();
    const same = path.normalize(ours) === path.normalize(expected_documents);
    if (!same) ok = false;
    console.log(`${same ? "✅" : "❌"} documents folder is the expected one\n     ours:     ${ours}\n     expected: ${expected_documents}`);
  }
} else {
  const fx = fs.mkdtempSync(path.join(os.tmpdir(), "pf-compare-"));
  const home = path.join(fx, "home");
  const config = path.join(home, ".config");
  fs.mkdirSync(config, { recursive: true });
  const user_dirs = (content) =>
    fs.writeFileSync(path.join(config, "user-dirs.dirs"), content);

  run("custom HOME", { HOME: home });
  run("HOME unset", { HOME: null });
  run("absolute XDG_CACHE_HOME", { HOME: home, XDG_CACHE_HOME: path.join(fx, "cache") });

  if (process.platform === "linux") {
    user_dirs('# written by xdg-user-dirs-update\nXDG_DESKTOP_DIR="$HOME/Bureau"\nXDG_DOCUMENTS_DIR="$HOME/Documents perso"\n');
    run("user-dirs.dirs: custom documents folder", { HOME: home });
    user_dirs('XDG_DOCUMENTS_DIR="$HOME"\n');
    run('user-dirs.dirs: documents disabled ("$HOME")', { HOME: home });
    user_dirs(`XDG_DOCUMENTS_DIR="${path.join(fx, "elsewhere")}"\n`);
    run("user-dirs.dirs: absolute path", { HOME: home });
    user_dirs('XDG_DOCUMENTS_DIR="$HOME/A"\nXDG_DOCUMENTS_DIR="$HOME/B"\n');
    run("user-dirs.dirs: later line wins", { HOME: home });

    const alt_config = path.join(fx, "alt-config");
    fs.mkdirSync(alt_config);
    fs.writeFileSync(path.join(alt_config, "user-dirs.dirs"), 'XDG_DOCUMENTS_DIR="$HOME/FromAltConfig"\n');
    run("XDG_CONFIG_HOME", { HOME: home, XDG_CONFIG_HOME: alt_config });

    fs.rmSync(path.join(config, "user-dirs.dirs"), { force: true });
    run("no user-dirs.dirs", { HOME: home });
  }
}

console.log(ok ? "\nall identical" : "\nDIFFERENCES FOUND");
process.exit(ok ? 0 : 1);
