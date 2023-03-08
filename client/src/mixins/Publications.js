export default {
  computed: {},
  methods: {
    calculateZoomToFit({ width, height, desired_largest_dimension }) {
      const largest_dimension = Math.max(width, height);
      return (
        desired_largest_dimension /
        (largest_dimension * this.$root.page_magnification)
      );
    },
    getModulesForPage({ modules, page_id }) {
      return (
        modules
          .filter((f) => f.page_id === page_id)
          .sort(
            (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
          ) || []
      ).reverse();
    },
  },
};
