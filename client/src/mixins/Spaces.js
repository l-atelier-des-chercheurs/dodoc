export default {
  computed: {},
  methods: {
    getSpaceFromCache(space_path) {
      if (!this.$api.store?.spaces) return false;
      return this.$api.store.spaces.find((s) => s.$path === space_path);
    },
  },
};
