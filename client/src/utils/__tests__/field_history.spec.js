import { describe, it, expect } from "vitest";
import { extract_field_entries } from "@/utils/field_history.js";

describe("extract_field_entries", () => {
  const entries = [
    {
      ts: "2026-01-01T10:00:00.000Z",
      event: "created",
      fields: { title: "A", description: "d" },
      author: "authors/louis",
    },
    {
      ts: "2026-01-02T10:00:00.000Z",
      event: "updated",
      field: "title",
      value: "B",
      author: "authors/marie",
    },
    {
      ts: "2026-01-03T10:00:00.000Z",
      event: "updated",
      field: "description",
      value: "e",
    },
    {
      ts: "2026-01-04T10:00:00.000Z",
      event: "updated",
      fields: { title: "C", description: "f" },
    },
  ];

  it("returns rows for the field only, newest first", () => {
    const rows = extract_field_entries(entries, "title");
    expect(rows.map((r) => r.value)).toEqual(["C", "B", "A"]);
  });

  it("keeps event type and author", () => {
    const rows = extract_field_entries(entries, "title");
    expect(rows[2]).toEqual({
      ts: "2026-01-01T10:00:00.000Z",
      value: "A",
      author_path: "authors/louis",
      event: "created",
    });
    expect(rows[0].author_path).toBe("");
  });

  it("returns an empty list for unknown field or invalid input", () => {
    expect(extract_field_entries(entries, "nope")).toEqual([]);
    expect(extract_field_entries(undefined, "title")).toEqual([]);
    expect(extract_field_entries([null], "title")).toEqual([]);
  });
});
