// Checks that Node and Electron versions agree everywhere they are written.
// The app pins Node exactly (.nvmrc, Dockerfile) in the range adc-core supports.
// adc-core pins Electron exactly (packages/adc-core/electron/package.json).
// When electron is installed (`npm run install:electron`), also checks that the
// Node embedded in Electron is the one of .nvmrc.
//
// usage: node scripts/check-versions.js

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { satisfies } = require("../packages/adc-core/server/runtime-check");

const root = path.join(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const json = (p) => JSON.parse(read(p));

const errors = [];
const check = (ok, message) => {
  console.log(`${ok ? "✅" : "❌"} ${message}`);
  if (!ok) errors.push(message);
};

const core = json("packages/adc-core/package.json");
const app = json("package.json");
const coreElectronDir = "packages/adc-core/electron";
const electronPackage = json(`${coreElectronDir}/package.json`);

// Node
const nvmrc = read(".nvmrc").trim().replace(/^v/, "");
check(
  /^\d+\.\d+\.\d+$/.test(nvmrc),
  `.nvmrc is an exact version (${nvmrc})`
);
check(
  satisfies(nvmrc, core.engines.node),
  `.nvmrc ${nvmrc} is in adc-core engines.node "${core.engines.node}"`
);
check(
  satisfies(nvmrc, app.engines.node),
  `.nvmrc ${nvmrc} is in the app engines.node "${app.engines.node}"`
);
const docker_versions = [
  ...read("Dockerfile").matchAll(/^FROM node:([\d.]+)/gm),
].map((m) => m[1]);
check(
  docker_versions.length > 0 && docker_versions.every((v) => v === nvmrc),
  `Dockerfile node images (${docker_versions.join(", ")}) match .nvmrc ${nvmrc}`
);

// Electron
const electron = electronPackage.dependencies.electron;
check(
  /^\d+\.\d+\.\d+$/.test(electron),
  `adc-core pins an exact electron version (${electron})`
);
check(
  !/^electronVersion:/m.test(read("electron/electron-builder.yml")),
  `electron/electron-builder.yml does not set electronVersion (adc-electron dist passes adc-core's)`
);

// what is actually installed, when electron is
let electron_binary;
try {
  electron_binary = require(path.join(root, coreElectronDir, "node_modules/electron"));
} catch (err) {}
if (electron_binary) {
  const res = spawnSync(
    electron_binary,
    ["-p", "process.versions.electron + ' ' + process.versions.node"],
    { env: { ...process.env, ELECTRON_RUN_AS_NODE: "1" }, encoding: "utf8" }
  );
  const [installed_electron, embedded_node] = (res.stdout || "")
    .trim()
    .split(" ");
  check(
    installed_electron === electron,
    `installed electron (${installed_electron}) matches adc-core (${electron})`
  );
  check(
    embedded_node === nvmrc,
    `Node embedded in Electron (${embedded_node}) matches .nvmrc ${nvmrc}`
  );
} else {
  console.log("—  electron not installed: skipping the embedded Node check");
}

if (errors.length > 0) {
  console.error(`\n${errors.length} version mismatch(es)`);
  process.exit(1);
}
