/** Strip ./ or ../ prefix from a markdown or CSC media reference. */
export function normalizeMetaSrc(meta_src) {
  if (!meta_src) return "";
  if (meta_src.startsWith("./")) return meta_src.substring(2);
  if (meta_src.startsWith("../")) return meta_src.substring(3);
  return meta_src;
}

/**
 * Ordered lookup keys for getSourceMedia: publication copy first, then project link.
 */
export function parseMetaSrcLookupAttempts(meta_src) {
  if (!meta_src) return [];
  if (meta_src.startsWith("./")) {
    return [{ meta_filename: meta_src.substring(2) }];
  }
  if (meta_src.startsWith("../")) {
    return [{ meta_filename_in_project: meta_src.substring(3) }];
  }
  const bare = meta_src;
  return [{ meta_filename: bare }, { meta_filename_in_project: bare }];
}

/** True when two source_media refs denote the same attachment (no undefined===undefined). */
export function sourceMediaRefsMatch(a, b) {
  if (!a || !b) return false;
  if (a.meta_filename && b.meta_filename) {
    return a.meta_filename === b.meta_filename;
  }
  if (a.meta_filename_in_project && b.meta_filename_in_project) {
    return a.meta_filename_in_project === b.meta_filename_in_project;
  }
  if (a.path && b.path) return a.path === b.path;
  return false;
}

export function findSourceMediaEntry(source_medias, meta_src) {
  if (!Array.isArray(source_medias) || !meta_src) return;
  const normalized = normalizeMetaSrc(meta_src);
  return source_medias.find(
    (sm) =>
      sm?.meta_filename === normalized ||
      sm?.meta_filename_in_project === normalized
  );
}
