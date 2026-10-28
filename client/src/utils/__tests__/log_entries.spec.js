import { describe, it, expect } from "vitest";
import {
  parseLogLines,
  getLevel,
  matchesFilters,
  countBy,
} from "@/utils/log_entries.js";

const text = [
  '{"ts":"2026-10-10T10:00:00.000Z","message":"DODOC LOG STARTED"}',
  '{"ts":"2026-10-10T10:00:01.000Z","event":"create_folder","from":"api2","details":{"outcome":"success"}}',
  "not json",
  '{"ts":"2026-10-10T10:00:02.000Z","event":"upload_file","from":"api2","details":{"outcome":"error","error":"ENOSPC"}}',
  "",
].join("\n");

describe("parseLogLines", () => {
  it("returns entries newest first, skipping blank lines", () => {
    const entries = parseLogLines(text);
    expect(entries.map((e) => e.line)).toEqual([4, 3, 2, 1]);
  });

  it("keeps invalid lines as errors", () => {
    const bad = parseLogLines(text).find((e) => e.parse_error);
    expect(bad).toMatchObject({ raw: "not json", level: "error" });
  });

  it("handles empty input", () => {
    expect(parseLogLines("")).toEqual([]);
    expect(parseLogLines(undefined)).toEqual([]);
  });
});

describe("getLevel", () => {
  it("flags crashes and failed operations", () => {
    expect(getLevel({ event: "crash" })).toBe("error");
    expect(getLevel({ details: { outcome: "error" } })).toBe("error");
    expect(getLevel({ details: { outcome: "partial_success" } })).toBe(
      "warning"
    );
    expect(getLevel({ message: "DODOC CLEAN SHUTDOWN" })).toBe("notice");
    expect(getLevel({ details: { outcome: "success" } })).toBe("info");
  });
});

describe("matchesFilters", () => {
  const entries = parseLogLines(text);

  it("filters by level, event, origin and text", () => {
    expect(entries.filter((e) => matchesFilters(e, { levels: ["error"] })))
      .toHaveLength(2);
    expect(
      entries.filter((e) => matchesFilters(e, { events: ["create_folder"] }))
    ).toHaveLength(1);
    expect(
      entries.filter((e) => matchesFilters(e, { froms: ["api2"] }))
    ).toHaveLength(2);
    expect(
      entries.filter((e) => matchesFilters(e, { search: "enospc" }))
    ).toHaveLength(1);
    expect(entries.filter((e) => matchesFilters(e, {}))).toHaveLength(4);
  });
});

describe("countBy", () => {
  it("counts values, most frequent first", () => {
    expect(countBy(parseLogLines(text), "from")).toEqual([
      { value: "api2", count: 2 },
    ]);
  });
});
