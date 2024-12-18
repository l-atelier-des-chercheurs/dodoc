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
    formatDurationToHoursMinutesSecondsDeciseconds(seconds) {
      const ds = (seconds % 1).toFixed(1).substring(1);
      // const ds = (
      //   +(seconds % 1).toFixed(1).toLocaleString(this.$i18n.locale) + ""
      // ).substring(1);
      return this.formatDurationToHoursMinutesSeconds(seconds, false) + ds;
    },
    datetimeLocal(datetime) {
      const dt = new Date(datetime);
      dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
      return dt.toISOString().slice(0, 16);
    },
  },
};
