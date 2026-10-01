/**
 * Filesystem folder path → public app URL path (Vue router).
 * Single place to adjust URL mapping in derived tools (SlashDoc, living-archive, …).
 * ESM so Vite can serve it as-is; core2 loads it with require() (Node ≥ 22.12).
 */
export function pathToPublicPath(fs_path) {
  return String(fs_path)
    .replace(/\\/g, "/")
    .replace("authors/", "/@")
    .replace("spaces/", "/+")
    .replace("events/", "/#")
    .replace("pages/", "/p/")
    .replace("projects/", "");
}
