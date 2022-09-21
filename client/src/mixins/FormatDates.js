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
  },
};
