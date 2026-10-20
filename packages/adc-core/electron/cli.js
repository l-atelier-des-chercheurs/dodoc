#!/usr/bin/env node
// adc-electron: installs, runs and packages an adc-core app with Electron.
// Electron and its build tools are listed in ./package.json and installed
// here (node_modules/adc-core/electron/node_modules) on demand only, so a
// server install of the app never downloads them. Run from the app root
// (npm scripts do).
//
//   adc-electron install                     install Electron, rebuild native modules
//   adc-electron start [flags] [-- app args]  run the app, e.g. start --inspect=5858 -- --debug
//   adc-electron watch [flags] [-- app args]  same, restarting on changes (electronmon)
//   adc-electron dist [builder args]          package with electron-builder, using the
//                                             app's electron/electron-builder.yml

const path = require("path");
const fs = require("fs");
const { spawnSync } = require("child_process");
const { pathToFileURL } = require("url");

const electronDir = __dirname;
const appRoot = process.cwd();
const electronVersion = require("./package.json").dependencies.electron;

const [command, ...args] = process.argv.slice(2);

// set by some hosts (VS Code extensions…): Electron would then run as plain Node
delete process.env.ELECTRON_RUN_AS_NODE;

const commands = { install, start, watch, dist };

if (!fs.existsSync(path.join(appRoot, "package.json"))) {
  fail(`adc-electron must run from the app root (no package.json in ${appRoot})`);
}
if (!commands[command]) {
  fail(`usage: adc-electron <${Object.keys(commands).join("|")}> [args]`);
}
Promise.resolve(commands[command](args)).catch((err) => fail(err.stack || err));

async function install() {
  const has_lock = fs.existsSync(path.join(electronDir, "package-lock.json"));
  run("npm", [has_lock ? "ci" : "install", "--prefix", electronDir]);

  // native modules of the app, for the installed Electron
  const { rebuild } = await import(
    pathToFileURL(resolveTool("@electron/rebuild")).href
  );
  await rebuild({ buildPath: appRoot, electronVersion, arch: process.arch });
  console.log(`adc-electron: Electron ${electronVersion} installed`);
}

function start(args) {
  const { flags, appArgs } = splitArgs(args);
  run(electronBinary(), [...flags, appRoot, ...appArgs]);
}

function watch(args) {
  const { flags, appArgs } = splitArgs(args);
  require(resolveTool("electronmon"))({
    cwd: appRoot,
    args: [...flags, ".", ...appArgs],
    electronPath: electronBinary(),
    patterns: ["!client/**"],
  });
}

function dist(args) {
  run(process.execPath, [
    resolveTool("electron-builder/cli.js"),
    "--projectDir",
    appRoot,
    "--config",
    path.join("electron", "electron-builder.yml"),
    `--config.electronVersion=${electronVersion}`,
    ...args,
  ]);
}

// "--inspect=5858 -- --debug" → electron flags before the app path, app args after
function splitArgs(args) {
  const i = args.indexOf("--");
  if (i === -1) return { flags: args, appArgs: [] };
  return { flags: args.slice(0, i), appArgs: args.slice(i) };
}

function electronBinary() {
  return require(resolveTool("electron"));
}

function resolveTool(name) {
  try {
    return require.resolve(name, { paths: [electronDir] });
  } catch (err) {
    fail(`${name} is not installed: run \`adc-electron install\` (npm run install:electron)`);
  }
}

function run(cmd, cmd_args, options = {}) {
  const res = spawnSync(cmd, cmd_args, {
    stdio: "inherit",
    cwd: appRoot,
    shell: process.platform === "win32" && cmd === "npm",
    ...options,
  });
  if (res.error) fail(res.error.message);
  if (res.status !== 0) process.exit(res.status ?? 1);
}

function fail(message) {
  console.error(`❌ adc-electron: ${message}`);
  process.exit(1);
}
