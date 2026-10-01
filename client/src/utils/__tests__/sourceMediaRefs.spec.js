import { describe, it, expect } from "vitest";
import {
  normalizeMetaSrc,
  parseMetaSrcLookupAttempts,
  sourceMediaRefsMatch,
  findSourceMediaEntry,
} from "../sourceMediaRefs.js";

describe("sourceMediaRefs", () => {
  describe("sourceMediaRefsMatch", () => {
    it("matches publication copies by meta_filename", () => {
      expect(
        sourceMediaRefsMatch(
          { meta_filename: "a.txt" },
          { meta_filename: "a.txt" }
        )
      ).toBe(true);
    });

    it("does not match when both only have undefined project keys", () => {
      expect(sourceMediaRefsMatch({}, {})).toBe(false);
      expect(
        sourceMediaRefsMatch(
          { meta_filename: "a.txt" },
          { meta_filename_in_project: "b.txt" }
        )
      ).toBe(false);
    });
  });

  describe("parseMetaSrcLookupAttempts", () => {
    it("tries publication then project for bare names", () => {
      expect(parseMetaSrcLookupAttempts("file.txt")).toEqual([
        { meta_filename: "file.txt" },
        { meta_filename_in_project: "file.txt" },
      ]);
    });
  });

  describe("findSourceMediaEntry", () => {
    it("finds copied media in chapter source_medias", () => {
      const entry = findSourceMediaEntry(
        [{ meta_filename: "copy.txt", _media: { $path: "x" } }],
        "./copy.txt"
      );
      expect(entry?.meta_filename).toBe("copy.txt");
    });
  });

  describe("normalizeMetaSrc", () => {
    it("strips relative prefixes", () => {
      expect(normalizeMetaSrc("./a.txt")).toBe("a.txt");
      expect(normalizeMetaSrc("../b.txt")).toBe("b.txt");
    });
  });
});
