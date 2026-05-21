export default {
  computed: {},
  methods: {
    formatTime(date, options) {
      return new Date(date).toLocaleTimeString(this.$i18n.locale, options);
    },
    formatDate(date, options) {
      return new Date(date).toLocaleDateString(this.$i18n.locale, options);
    },
    formatDateToHuman(date) {
      if (new Date(date).toDateString() === new Date().toDateString()) {
        return this.$t("today");
      }

      return this.formatDate(date, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    formatDateTimeToHuman(date) {
      return this.formatDate(date, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
    },
    formatDateToPrecise(date) {
      return this.formatDate(date, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });
    },
    formatDateTimeToPrecise(date) {
      return this.formatDate(date, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
    },
    formatDateToHoursMinutesOnly(date) {
      return this.formatDate(date, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
    },
    formatDurationToHoursMinutesSeconds(seconds, round_zero = true) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      let s = Math.floor(seconds % 60);
      // dont display 00:00, round to 00:01
      if (round_zero && h === 0 && m === 0 && s === 0) s = 1;
      return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s]
        .filter(Boolean)
        .join(":");
    },
    formatDurationToHuman(duration) {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor(duration % 60);

      const parts = [];
      if (hours > 0) {
        parts.push(
          new Intl.NumberFormat(undefined, {
            style: "unit",
            unit: "hour",
            unitDisplay: "short",
          }).format(hours)
        );
      }
      if (minutes > 0 || hours > 0) {
        parts.push(
          new Intl.NumberFormat(undefined, {
            style: "unit",
            unit: "minute",
            unitDisplay: "short",
          }).format(minutes)
        );
      }
      if (seconds > 0 || (hours === 0 && minutes === 0)) {
        parts.push(
          new Intl.NumberFormat(undefined, {
            style: "unit",
            unit: "second",
            unitDisplay: "short",
          }).format(seconds)
        );
      }

      return parts.join(" ");
    },
    formatDurationToHoursMinutesSecondsDeciseconds(seconds) {
      const ds = (seconds % 1).toFixed(1).substring(1);
      return this.formatDurationToHoursMinutesSeconds(seconds, false) + ds;
    },
    datetimeLocal(datetime) {
      const dt = new Date(datetime);
      dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
      return dt.toISOString().slice(0, 16);
    },
    formatRecentDateTime(date) {
      const parsed_date = new Date(date);
      if (Number.isNaN(parsed_date.getTime())) return "";

      const now_date = new Date();
      const start_of_today = new Date(now_date);
      start_of_today.setHours(0, 0, 0, 0);

      const start_of_target_day = new Date(parsed_date);
      start_of_target_day.setHours(0, 0, 0, 0);

      const day_diff = Math.round(
        (start_of_today.getTime() - start_of_target_day.getTime()) /
          (24 * 60 * 60 * 1000)
      );

      const locale = this.$i18n?.locale || "en";

      if (day_diff === 0) {
        const diff_seconds = Math.round(
          (parsed_date.getTime() - now_date.getTime()) / 1000
        );
        const abs_diff_seconds = Math.abs(diff_seconds);
        const relative_time_formatter = new Intl.RelativeTimeFormat(locale, {
          numeric: "auto",
        });

        if (abs_diff_seconds < 60) {
          return relative_time_formatter.format(diff_seconds, "second");
        }
        if (abs_diff_seconds < 3600) {
          return relative_time_formatter.format(
            Math.round(diff_seconds / 60),
            "minute"
          );
        }
        return relative_time_formatter.format(
          Math.round(diff_seconds / 3600),
          "hour"
        );
      }

      if (day_diff === 1) {
        if (locale.startsWith("fr")) {
          const hours = String(parsed_date.getHours()).padStart(2, "0");
          const minutes = String(parsed_date.getMinutes()).padStart(2, "0");
          return `Hier, à ${hours}h${minutes}`;
        }
        return `Yesterday, at ${parsed_date.toLocaleTimeString(locale, {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      return this.formatDateTimeToPrecise(parsed_date);
    },
    formatRemovedDateTime(date) {
      const parsed_date = new Date(date);
      if (Number.isNaN(parsed_date.getTime())) return "";

      const locale = this.$i18n?.locale || "en";
      const is_fr = locale.startsWith("fr");
      const prefix = is_fr ? "Supprimé" : "Removed";

      const now_date = new Date();
      const start_of_today = new Date(now_date);
      start_of_today.setHours(0, 0, 0, 0);

      const start_of_target_day = new Date(parsed_date);
      start_of_target_day.setHours(0, 0, 0, 0);

      const day_diff = Math.round(
        (start_of_today.getTime() - start_of_target_day.getTime()) /
          (24 * 60 * 60 * 1000)
      );

      const time_at = () => {
        if (is_fr) {
          const hours = String(parsed_date.getHours()).padStart(2, "0");
          const minutes = String(parsed_date.getMinutes()).padStart(2, "0");
          return `${hours}h${minutes}`;
        }
        return parsed_date.toLocaleTimeString(locale, {
          hour: "numeric",
          minute: "2-digit",
        });
      };

      if (day_diff === 0) {
        const diff_seconds = Math.round(
          (parsed_date.getTime() - now_date.getTime()) / 1000
        );
        const abs_diff_seconds = Math.abs(diff_seconds);
        const relative_time_formatter = new Intl.RelativeTimeFormat(locale, {
          numeric: "auto",
        });

        if (abs_diff_seconds < 60) {
          return `${prefix} ${relative_time_formatter.format(
            diff_seconds,
            "second"
          )}`;
        }
        if (abs_diff_seconds < 3600) {
          return `${prefix} ${relative_time_formatter.format(
            Math.round(diff_seconds / 60),
            "minute"
          )}`;
        }
        return `${prefix} ${relative_time_formatter.format(
          Math.round(diff_seconds / 3600),
          "hour"
        )}`;
      }

      if (day_diff === 1) {
        if (is_fr) return `${prefix} hier à ${time_at()}`;
        return `${prefix} yesterday at ${time_at()}`;
      }

      if (day_diff === 2) {
        if (is_fr) return `${prefix} avant-hier à ${time_at()}`;
        return `${prefix} the day before yesterday at ${time_at()}`;
      }

      if (is_fr) {
        const day = String(parsed_date.getDate()).padStart(2, "0");
        const month = String(parsed_date.getMonth() + 1).padStart(2, "0");
        const year = parsed_date.getFullYear();
        return `${prefix} le ${day}/${month}/${year} à ${time_at()}`;
      }

      const date_str = this.formatDate(parsed_date, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return `${prefix} on ${date_str} at ${time_at()}`;
    },
  },
};
