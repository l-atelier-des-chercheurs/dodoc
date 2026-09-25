/**
 * Normalize a stored calendar date for `<input type="date">` (local YYYY-MM-DD).
 * Canonical persisted format for schema `type: "date"` fields (ISO 8601 date, no time).
 */
export function toDateInputValue(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Alias for persisted calendar dates (`start_date`, `end_date`, …). */
export const toStoredCalendarDate = toDateInputValue;

/** Whether a schema field config should use the date picker. */
export function is_date_input_field(field) {
  if (!field || typeof field !== "object") return false;
  return field.type === "date" || field.input_type === "date";
}

/** Today's local date as YYYY-MM-DD. */
export function todayDateInputValue() {
  return toDateInputValue(new Date());
}
