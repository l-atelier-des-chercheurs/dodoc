import { describe, it, expect } from "vitest";
import { keepExtraBlankLines } from "@/utils/markdownBlankLines.js";

describe("keepExtraBlankLines", () => {
  it("leaves a single blank line unchanged", () => {
    expect(keepExtraBlankLines("a\n\nb")).toBe("a\n\nb");
  });

  it("adds one <br> for two blank lines", () => {
    expect(keepExtraBlankLines("a\n\n\nb")).toBe("a\n\n<br>\n\nb");
  });

  it("adds one more <br> per extra blank line", () => {
    expect(keepExtraBlankLines("a\n\n\n\nb")).toBe("a\n\n<br>\n\n<br>\n\nb");
  });

  it("treats whitespace-only lines as blank", () => {
    expect(keepExtraBlankLines("a\n \n\t\nb")).toBe("a\n\n<br>\n\nb");
  });

  it("does not touch fenced code blocks", () => {
    const code = "```\nx\n\n\n\ny\n```";
    expect(keepExtraBlankLines(`a\n\n\n${code}\n\n\nb`)).toBe(
      `a\n\n<br>\n\n${code}\n\n<br>\n\nb`
    );
  });

  it("handles empty content", () => {
    expect(keepExtraBlankLines("")).toBe("");
    expect(keepExtraBlankLines(undefined)).toBe(undefined);
  });
});
