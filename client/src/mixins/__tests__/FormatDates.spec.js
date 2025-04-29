import { describe, it, expect, beforeEach } from "vitest";
import Vue from "vue";
import FormatDates from "../FormatDates";

describe("FormatDates mixin", () => {
  let vm;
  let i18n;

  beforeEach(() => {
    // Create a Vue instance with the mixin
    const Component = Vue.extend({
      mixins: [FormatDates],
    });
    vm = new Component();
    i18n = { locale: "en" };
    vm.$i18n = i18n;
  });

  describe("formatDurationToHuman", () => {
    it("should format seconds correctly", () => {
      expect(vm.formatDurationToHuman(31)).toBe("31\u202fs");
      expect(vm.formatDurationToHuman(59)).toBe("59\u202fs");
    });

    it("should format minutes and seconds correctly", () => {
      expect(vm.formatDurationToHuman(91)).toBe("1 min 31\u202fs");
      expect(vm.formatDurationToHuman(3599)).toBe("59 min 59\u202fs");
    });

    it("should format hours, minutes and seconds correctly", () => {
      expect(vm.formatDurationToHuman(3691)).toBe("1\u202fh 1 min 31\u202fs");
      expect(vm.formatDurationToHuman(3661)).toBe("1\u202fh 1 min 1\u202fs");
      expect(vm.formatDurationToHuman(3600)).toBe("1\u202fh 0 min 0\u202fs");
    });

    it("should handle zero duration", () => {
      expect(vm.formatDurationToHuman(0)).toBe("0\u202fs");
    });
  });

  describe("formatDurationToHoursMinutesSeconds", () => {
    it("should format seconds correctly", () => {
      expect(vm.formatDurationToHoursMinutesSeconds(31)).toBe("0:31");
      expect(vm.formatDurationToHoursMinutesSeconds(59)).toBe("0:59");
    });

    it("should format minutes and seconds correctly", () => {
      expect(vm.formatDurationToHoursMinutesSeconds(91)).toBe("1:31");
      expect(vm.formatDurationToHoursMinutesSeconds(3599)).toBe("59:59");
    });

    it("should format hours, minutes and seconds correctly", () => {
      expect(vm.formatDurationToHoursMinutesSeconds(3691)).toBe("1:01:31");
      expect(vm.formatDurationToHoursMinutesSeconds(3661)).toBe("1:01:01");
      expect(vm.formatDurationToHoursMinutesSeconds(3600)).toBe("1:00:00");
    });

    it("should handle zero duration", () => {
      expect(vm.formatDurationToHoursMinutesSeconds(0)).toBe("0:01");
      expect(vm.formatDurationToHoursMinutesSeconds(0, false)).toBe("0:00");
    });
  });

  describe("formatDurationToHoursMinutesSecondsDeciseconds", () => {
    it("should format with deciseconds", () => {
      expect(vm.formatDurationToHoursMinutesSecondsDeciseconds(31.5)).toBe(
        "0:31.5"
      );
      expect(vm.formatDurationToHoursMinutesSecondsDeciseconds(91.7)).toBe(
        "1:31.7"
      );
      expect(vm.formatDurationToHoursMinutesSecondsDeciseconds(3691.9)).toBe(
        "1:01:31.9"
      );
    });

    it("should handle zero deciseconds", () => {
      expect(vm.formatDurationToHoursMinutesSecondsDeciseconds(31)).toBe(
        "0:31.0"
      );
    });
  });
});
