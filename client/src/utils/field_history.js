/**
 * Builds a list (newest first) of history rows for one meta field from the
 * flat log returned by `$api.getFieldHistory` (see adc-core/server/history.js).
 *
 * Supports the three entry shapes:
 * - `{ event: "created", fields }` — initial snapshot
 * - `{ event: "updated", field, value }` — one field per line
 * - `{ event: "updated", fields }` — several fields changed at once
 *
 * @param {Array<object>} entries
 * @param {string} field_key
 * @returns {Array<{ ts: string, value: *, author_path: string, event: string }>}
 */
export function extract_field_entries(entries, field_key) {
  const rows = [];
  const list = Array.isArray(entries) ? entries : [];
  const has = (obj, key) =>
    !!obj && Object.prototype.hasOwnProperty.call(obj, key);

  for (const entry of list) {
    if (!entry) continue;
    let value;
    if (entry.event === "updated" && entry.field === field_key)
      value = entry.value;
    else if (
      ["created", "updated"].includes(entry.event) &&
      has(entry.fields, field_key)
    )
      value = entry.fields[field_key];
    else continue;

    rows.push({
      ts: entry.ts,
      value,
      author_path: entry.author || "",
      event: entry.event,
    });
  }
  return rows.reverse();
}
