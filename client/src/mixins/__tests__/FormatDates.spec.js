import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("formatDurationToHuman", () => {
    it("should format seconds correctly", () => {
      expect(vm.formatDurationToHuman(31)).toMatch(/^31(\s| )?(s|sec)$/);
      expect(vm.formatDurationToHuman(59)).toMatch(/^59(\s| )?(s|sec)$/);
    });

    // it("should format minutes and seconds correctly", () => {
    //   expect(vm.formatDurationToHuman(91)).toBe("1 min 31\u202fs");
    // });

    // it("should format hours, minutes and seconds correctly", () => {
    //   expect(vm.formatDurationToHuman(3600)).toBe("1\u202fh 0min");
    //   expect(vm.formatDurationToHuman(3661)).toBe("1\u202fh 1 min 1\u202fs");
    //   expect(vm.formatDurationToHuman(3691)).toBe("1\u202fh 1 min 31\u202fs");
    // });

    it("should handle zero duration", () => {
      expect(vm.formatDurationToHuman(0)).toMatch(/^0(\s| )?(s|sec)$/);
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

  describe("formatRecentDateTime", () => {
    it("formats today dates with relative time", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-06T14:32:00"));

      const formatted = vm.formatRecentDateTime("2026-05-06T14:12:00");
      expect(formatted).toBe("20 minutes ago");
    });

    it("formats yesterday in french as expected", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-06T14:32:00"));
      vm.$i18n.locale = "fr";

      const formatted = vm.formatRecentDateTime("2026-05-05T14:12:00");
      expect(formatted).toBe("Hier, à 14h12");
    });

    it("formats older dates with locale-aware date-time (not raw UTC ISO)", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-06T14:32:00.000Z"));

      const iso = "2026-05-02T10:11:12.000Z";
      const formatted = vm.formatRecentDateTime(iso);
      const expected = vm.formatDateTimeToPrecise(iso);
      expect(formatted).toBe(expected);
      expect(formatted).not.toMatch(/T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe("formatRemovedDateTime", () => {
    it("formats recent removal in french", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-21T14:32:00"));
      vm.$i18n.locale = "fr";

      const formatted = vm.formatRemovedDateTime("2026-05-21T14:27:00");
      expect(formatted).toBe("Supprimé il y a 5 minutes");
    });

    it("formats yesterday removal in french", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-21T14:32:00"));
      vm.$i18n.locale = "fr";

      const formatted = vm.formatRemovedDateTime("2026-05-20T16:30:00");
      expect(formatted).toBe("Supprimé hier à 16h30");
    });

    it("formats day before yesterday removal in french", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-21T14:32:00"));
      vm.$i18n.locale = "fr";

      const formatted = vm.formatRemovedDateTime("2026-05-19T12:20:00");
      expect(formatted).toBe("Supprimé avant-hier à 12h20");
    });

    it("formats older removal in french", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-21T14:32:00"));
      vm.$i18n.locale = "fr";

      const formatted = vm.formatRemovedDateTime("2026-05-18T13:12:00");
      expect(formatted).toBe("Supprimé le 18/05/2026 à 13h12");
    });
  });
});
