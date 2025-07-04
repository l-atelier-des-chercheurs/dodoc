import { describe, it, expect, beforeEach } from "vitest";
import Vue from "vue";
import Strings from "../Strings";

describe("Strings mixin", () => {
  let vm;

  beforeEach(() => {
    // Create a Vue instance with the mixin
    const Component = Vue.extend({
      mixins: [Strings],
    });
    vm = new Component();
  });

  describe("cleanUpString", () => {
    it("should remove whitespace from beginning and end", () => {
      expect(vm.cleanUpString("  hello world  ")).toBe("hello world");
      expect(vm.cleanUpString("\t\nhello world\t\n")).toBe("hello world");
    });

    it("should remove carriage returns and line feeds from beginning", () => {
      expect(vm.cleanUpString("\r\nmy world")).toBe("my world");
      expect(vm.cleanUpString("\n\n\rmy world")).toBe("my world");
    });

    it("should remove carriage returns and line feeds from end", () => {
      expect(vm.cleanUpString("my world\r\n")).toBe("my world");
      expect(vm.cleanUpString("my world\n\n\r")).toBe("my world");
    });

    it("should remove carriage returns and line feeds from both ends", () => {
      expect(vm.cleanUpString("\r\n\nmy world\n\r\n")).toBe("my world");
      expect(vm.cleanUpString("\n\n\n\rmy world\r\n\n")).toBe("my world");
    });

    it("should handle the example case from user query", () => {
      expect(vm.cleanUpString("\n\n\nmy world\n\n\n")).toBe("my world");
      expect(vm.cleanUpString("   \n\n\nmy world\n\n\n   ")).toBe("my world");
    });

    it("should preserve internal whitespace and line breaks", () => {
      expect(vm.cleanUpString("  hello\nbeautiful\r\nworld  ")).toBe(
        "hello\nbeautiful\r\nworld"
      );
      expect(vm.cleanUpString("\n  my\n  world  \n")).toBe("my\n  world");
    });

    it("should handle mixed whitespace characters", () => {
      expect(vm.cleanUpString(" \t\r\n\fhello world\f\n\r\t ")).toBe(
        "hello world"
      );
    });

    it("should handle strings with no leading/trailing whitespace", () => {
      expect(vm.cleanUpString("hello world")).toBe("hello world");
      expect(vm.cleanUpString("test")).toBe("test");
    });

    it("should handle empty and whitespace-only strings", () => {
      expect(vm.cleanUpString("")).toBe("");
      expect(vm.cleanUpString("   ")).toBe("");
      expect(vm.cleanUpString("\n\r\t")).toBe("");
      expect(vm.cleanUpString("\n\n\n")).toBe("");
    });

    it("should handle strings with only internal content", () => {
      expect(vm.cleanUpString("\n\nhello\n\n")).toBe("hello");
      expect(vm.cleanUpString("  a  ")).toBe("a");
    });
  });

  describe("twoStringsMatch", () => {
    it("should match strings with normalized search", () => {
      expect(vm.twoStringsMatch("Hello World", "hello")).toBe(true);
      expect(vm.twoStringsMatch("Hello World", "hello w")).toBe(true);
      expect(vm.twoStringsMatch("Hello World", "world")).toBe(false);
    });
  });

  describe("twoStringsSearch", () => {
    it("should find strings with normalized search", () => {
      expect(vm.twoStringsSearch("Hello World", "hello")).toBe(true);
      expect(vm.twoStringsSearch("Hello World", "world")).toBe(true);
      expect(vm.twoStringsSearch("Hello World", "xyz")).toBe(false);
    });
  });

  describe("normalizeStringForSearch", () => {
    it("should normalize strings for search", () => {
      expect(vm.normalizeStringForSearch("Héllo Wörld")).toBe("hello world");
      expect(vm.normalizeStringForSearch("UPPERCASE")).toBe("uppercase");
      expect(vm.normalizeStringForSearch("àáâãäå")).toBe("aaaaaa");
    });
  });
});
