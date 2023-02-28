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
  },
};
