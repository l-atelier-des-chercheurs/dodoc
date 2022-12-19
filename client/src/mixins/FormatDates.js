export default {
  computed: {},
  methods: {
    formatDateToHuman(date) {
      let options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    formatDateToPrecise(date) {
      let options = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };
      return new Date(date).toLocaleDateString(undefined, options);
    },
    formatDurationToHoursMinutesSeconds(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.round(seconds % 60);
      return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s]
        .filter(Boolean)
        .join(":");
    },
  },
};
