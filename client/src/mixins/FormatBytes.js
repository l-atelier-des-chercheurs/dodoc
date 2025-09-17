export default {
  computed: {},
  methods: {
    formatBytes(a, b) {
      if (a === 0) return `0 ${this.$t("bytes")}`;

      // dont need two decimals for kb
      // a = Math.round(a / 1000) * 1000;

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

      // const n = parseFloat((a / Math.pow(c, f)).toFixed(d));
      // If in bytes or kilobytes, do not show decimals
      var decimals = f <= 1 ? 0 : d;
      var value = a / Math.pow(c, f);
      var n = Number(value.toFixed(decimals));

      return n.toLocaleString(this.$i18n.locale) + " " + e[f];
    },
  },
};
