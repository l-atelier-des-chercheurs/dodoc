import { describe, it, expect } from "vitest";
import {
  is_date_input_field,
  toDateInputValue,
  todayDateInputValue,
} from "@/utils/date_input.js";

describe("toDateInputValue", () => {
  it("returns empty string for blank values", () => {
    expect(toDateInputValue("")).toBe("");
    expect(toDateInputValue(null)).toBe("");
  });

  it("keeps YYYY-MM-DD values unchanged", () => {
    expect(toDateInputValue("2026-06-01")).toBe("2026-06-01");
  });

  it("parses ISO datetime strings to local calendar date", () => {
    const parsed = toDateInputValue("2026-06-01T14:30:00.000Z");
    expect(parsed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("is_date_input_field", () => {
  it("detects date field configs", () => {
    expect(is_date_input_field({ type: "date" })).toBe(true);
    expect(is_date_input_field({ input_type: "date" })).toBe(true);
    expect(is_date_input_field({ type: "text" })).toBe(false);
  });
});

describe("todayDateInputValue", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayDateInputValue()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
