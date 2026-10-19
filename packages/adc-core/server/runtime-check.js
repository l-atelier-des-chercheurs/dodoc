// Checks that the running Node (or Electron) matches the ranges supported by the core.
// Ranges come from the core's package.json: engines.node, and adc.electron.
// Must run before requiring anything else, so this file has no dependencies.

const corePackage = require("../package.json");

module.exports = function checkRuntime() {
  const is_electron = process.versions.hasOwnProperty("electron");

  const runtime = is_electron ? "Electron" : "Node.js";
  const current = is_electron
    ? process.versions.electron
    : process.versions.node;
  const required = is_electron
    ? corePackage.adc?.electron
    : corePackage.engines?.node;

  if (!required || satisfies(current, required)) return;

  const message =
    `${runtime} version mismatch!\n` +
    `   Required: ${required}\n` +
    `   Current:  ${current}`;

  console.error(`\n❌ ${message}`);

  if (is_electron) {
    // showErrorBox can be called before the app is ready
    const { dialog } = require("electron");
    dialog.showErrorBox(`Unsupported ${runtime} version`, message);
  } else {
    console.error(
      `\nPlease install a matching Node.js version, for example with nvm:\n` +
        `   nvm install\n` +
        `   nvm use\n`
    );
  }
  process.exit(1);
};

// Minimal semver range matching: supports "||", space-separated comparators,
// ^, ~, >=, >, <=, <, = and partial versions ("24", "24.21").
// Prerelease tags are ignored.
function satisfies(version, range) {
  const v = parse(version);
  return range
    .split("||")
    .some((set) =>
      set
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .every((comparator) => matchComparator(v, comparator))
    );
}

function matchComparator(v, comparator) {
  if (comparator === "*" || comparator === "x") return true;

  const [, op = "", raw] = comparator.match(/^(\^|~|>=|<=|>|<|=)?v?(.+)$/);
  const parts = raw.split(".").filter((p) => p !== "x" && p !== "*");
  const target = parse(raw);

  if (op === "^") {
    // ^24.21.0 → >=24.21.0 <25.0.0 ; ^0.3.1 → >=0.3.1 <0.4.0
    const upper =
      target[0] > 0 || parts.length < 2
        ? [target[0] + 1, 0, 0]
        : target[1] > 0 || parts.length < 3
        ? [0, target[1] + 1, 0]
        : [0, 0, target[2] + 1];
    return compare(v, target) >= 0 && compare(v, upper) < 0;
  }
  if (op === "~" || (op === "" && parts.length < 3)) {
    // ~24.21.0 → >=24.21.0 <24.22.0 ; "24" → >=24.0.0 <25.0.0
    const upper =
      parts.length < 2
        ? [target[0] + 1, 0, 0]
        : [target[0], target[1] + 1, 0];
    return compare(v, target) >= 0 && compare(v, upper) < 0;
  }

  const diff = compare(v, target);
  if (op === ">=") return diff >= 0;
  if (op === ">") return diff > 0;
  if (op === "<=") return diff <= 0;
  if (op === "<") return diff < 0;
  return diff === 0;
}

function parse(version) {
  const [major = 0, minor = 0, patch = 0] = version
    .split("-")[0]
    .split(".")
    .map((n) => parseInt(n, 10) || 0);
  return [major, minor, patch];
}

function compare(a, b) {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

module.exports.satisfies = satisfies;
