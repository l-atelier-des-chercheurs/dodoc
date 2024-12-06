export default {
  computed: {},
  methods: {
    getFromCache(path) {
      if (this.$api.store[path]) return this.$api.store[path];

      const type = path.split("/")[0];
      if (this.$api.store[type])
        return this.$api.store[type].find((s) => s.$path === path);

      return false;
    },
  },
};
