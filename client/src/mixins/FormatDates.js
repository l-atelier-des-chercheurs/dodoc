export default {
  computed: {},
  methods: {
    formatTime(date, options) {
      return new Date(date).toLocaleTimeString(undefined, options);
    },
    formatDate(date, options) {
      return new Date(date).toLocaleDateString(undefined, options);
    },
    formatDateToHuman(date) {
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
    formatDurationToHoursMinutesSeconds(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.round(seconds % 60);
      return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s]
        .filter(Boolean)
        .join(":");
    },
    datetimeLocal(datetime) {
      const dt = new Date(datetime);
      dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
      return dt.toISOString().slice(0, 16);
    },
  },
};
