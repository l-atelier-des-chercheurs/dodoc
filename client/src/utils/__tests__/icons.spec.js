import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

// bootstrap-vue icons are imported one by one in src/utils/icons.js: any icon
// used in a template but not registered there renders as nothing.
// Only static names are checked (icon="x" and string literals in :icon="…").

const src_dir = path.resolve(__dirname, "../..");
const icons_js = fs.readFileSync(path.join(src_dir, "utils/icons.js"), "utf8");
const registered = new Set(
  [...icons_js.matchAll(/Vue\.component\("BIcon(\w+)"/g)].map((m) => m[1])
);

const toPascal = (name) =>
  name
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");

const listVueFiles = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return listVueFiles(p);
    return e.name.endsWith(".vue") ? [p] : [];
  });

function usedIcons(source) {
  const names = [];
  for (const [tag] of source.matchAll(/<b-icon\b[^>]*>/g)) {
    const static_icon = tag.match(/\sicon="([a-z0-9-]+)"/);
    if (static_icon) names.push(static_icon[1]);
    const bound_icon = tag.match(/\s:icon="([^"]+)"/);
    // keep ternary branches (`a ? 'x' : 'y'`), not compared values
    if (bound_icon)
      for (const [, n] of bound_icon[1]
        .trim()
        .matchAll(/(?:^|[?:])\s*'([a-z0-9-]+)'/g))
        names.push(n);
  }
  return names;
}

describe("icons.js", () => {
  it("registers every b-icon used in templates", () => {
    const missing = [];
    for (const file of listVueFiles(src_dir)) {
      const source = fs.readFileSync(file, "utf8");
      for (const name of usedIcons(source))
        if (!registered.has(toPascal(name)))
          missing.push(`BIcon${toPascal(name)} (${path.relative(src_dir, file)})`);
    }
    expect(missing).toEqual([]);
  });
});
