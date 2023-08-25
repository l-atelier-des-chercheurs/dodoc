export default {
  computed: {},
  methods: {
    formatBytes(a, b) {
      if (0 == a) return `0 ${this.$t("bytes")}`;

      var e = [
        this.$t("bytes"),
        this.$t("kb"),
        this.$t("mb"),
        this.$t("gb"),
        "TB",
        "PB",
        "EB",
        "ZB",
        "YB",
      ];

      var c = 1024,
        d = b || 2,
        f = Math.floor(Math.log(a) / Math.log(c));
      const n = parseFloat((a / Math.pow(c, f)).toFixed(d));
      return n.toLocaleString(this.$i18n.locale) + " " + e[f];
    },
  },
};
