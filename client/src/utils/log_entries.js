/**
 * Parses a journal (.jsonl, see adc-core/server/journal.js) into entries, newest first.
 * Lines that aren't valid JSON are kept (as `parse_error`) so nothing is
 * silently hidden while debugging.
 *
 * @param {string} text
 * @returns {Array<object>}
 */
export function parseLogLines(text) {
  const entries = [];
  const lines = String(text || "").split("\n");

  lines.forEach((raw, index) => {
    if (!raw.trim()) return;
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      entries.push({
        line: index + 1,
        raw,
        parse_error: true,
        level: "error",
        message: raw,
      });
      return;
    }
    entries.push({
      line: index + 1,
      raw,
      ts: data.ts,
      message: data.message || "",
      event: data.event || "",
      from: data.from || "",
      details: data.details,
      level: getLevel(data),
    });
  });

  return entries.reverse();
}

/** "error" for crashes and failed operations, "notice" for lifecycle events. */
export function getLevel({ event, message, details } = {}) {
  if (event === "crash" || event === "error") return "error";
  if (details?.outcome === "error" || details?.error) return "error";
  if (details?.outcome === "partial_success") return "warning";
  if (
    event === "shutdown" ||
    /^DODOC (LOG STARTED|CLEAN SHUTDOWN)/.test(message || "")
  )
    return "notice";
  return "info";
}

/**
 * @param {object} entry
 * @param {{ search?: string, levels?: string[], events?: string[], froms?: string[] }} filters
 *  empty arrays mean "no filter"
 */
export function matchesFilters(entry, { search, levels, events, froms } = {}) {
  if (levels?.length && !levels.includes(entry.level)) return false;
  if (events?.length && !events.includes(entry.event)) return false;
  if (froms?.length && !froms.includes(entry.from)) return false;
  if (search) {
    const needle = search.toLowerCase();
    if (!entry.raw.toLowerCase().includes(needle)) return false;
  }
  return true;
}

/** Counts per value of `key`, most frequent first. */
export function countBy(entries, key) {
  const counts = {};
  for (const entry of entries) {
    const value = entry[key];
    if (!value) continue;
    counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}
