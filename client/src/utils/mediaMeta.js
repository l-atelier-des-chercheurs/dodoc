/**
 * Keys that are server-managed or identity and should not be copied when
 * creating a new file from an existing media (e.g. save as new, crop, blur).
 */
const META_KEYS_NOT_COPIED = [
  "$path",
  "$media_filename",
  "$infos",
  "$type",
  "$thumbs",
  "$date_uploaded",
  "$date_modified",
  "$date_created",
];

/**
 * Builds additional_meta by copying all copyable metadata from a media item,
 * then applying overrides (e.g. $processing, $origin).
 *
 * @param {Object} media - Source media/item
 * @param {Object} overrides - Keys to set after copy (e.g. { $processing: ["cropped"], $origin: "collect" })
 * @returns {Object} Object suitable for uploadFile additional_meta
 */
export function getCopyableMediaMeta(media, overrides = {}) {
  const additional_meta = {};
  if (!media || typeof media !== "object") {
    return { ...overrides };
  }
  for (const key of Object.keys(media)) {
    if (META_KEYS_NOT_COPIED.includes(key)) continue;
    const value = media[key];
    if (value === undefined) continue;
    additional_meta[key] = value;
  }
  const result = { ...additional_meta, ...overrides };
  if (Object.prototype.hasOwnProperty.call(overrides, "$processing")) {
    const existing = Array.isArray(additional_meta.$processing)
      ? additional_meta.$processing
      : [];
    const to_append = Array.isArray(overrides.$processing)
      ? overrides.$processing
      : [overrides.$processing];
    result.$processing = [...existing, ...to_append];
  }
  return result;
}
