/**
 * Replaces the original media item with a new file (e.g. optimized, cropped).
 * Updates the original item's meta to the new file, then cleans up so one item remains.
 *
 * @param {Object} api - $api instance (updateMeta, deleteItem)
 * @param {Object} original_media - Current media item (has $path, $processing, etc.)
 * @param {Object} new_file - The replacement file (has $path, $media_filename, $type)
 * @param {string} processing_label - Label to append to $processing (e.g. 'optimized', 'cropped')
 * @param {boolean} keep_original_path - If true, keep the original path and delete new_file's path; if false, keep new path and delete original (default)
 */
export async function replaceOriginalWithNewFile(
  api,
  original_media,
  new_file,
  processing_label,
  keep_original_path = false
) {
  const old_source_file = JSON.parse(JSON.stringify(original_media));
  const new_source_file = JSON.parse(JSON.stringify(new_file));

  const existing_processing = original_media.$processing;
  const processing =
    Array.isArray(existing_processing) && existing_processing.length > 0
      ? [...existing_processing, processing_label]
      : [processing_label];

  await api.updateMeta({
    path: original_media.$path,
    new_meta: {
      $media_filename: new_source_file.$media_filename,
      $type: new_source_file.$type,
      $processing: processing,
    },
  });

  const path_to_clean = keep_original_path
    ? new_source_file.$path
    : old_source_file.$path;
  await api.updateMeta({
    path: path_to_clean,
    new_meta: {
      $media_filename: old_source_file.$media_filename,
    },
  });
  await api.deleteItem({
    path: path_to_clean,
  });
}
