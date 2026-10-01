/**
 * Filesystem folder path → public app URL path (Vue router).
 * Single place to adjust URL mapping in derived tools (SlashDoc, living-archive, …).
 * ESM so Vite can serve it as-is; core2 loads it with require() (Node ≥ 22.12).
 */
export function pathToPublicPath(fs_path) {
  let public_path = String(fs_path)
    .replace(/\\/g, "/")
    .replace("authors/", "/@")
    .replace("spaces/", "/+")
    .replace("events/", "/#")
    .replace("pages/", "/p/")
    .replace("projects/", "");
  if (!public_path.startsWith("/")) public_path = "/" + public_path;
  return public_path;
}

/** base URL (no trailing slash) + public path (leading slash). */
export function joinPublicUrl(base_url, fs_path) {
  const base = String(base_url || "").replace(/\/+$/, "");
  return base + pathToPublicPath(fs_path);
}
