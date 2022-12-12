export default {
  computed: {
    connected_as() {
      if (this.$api.tokenpath.token_path)
        return this.getAuthor(this.$api.tokenpath.token_path);
      return false;
    },
    is_admin() {
      if (this.connected_as) return this.connected_as.role === "admin";
      return false;
    },
  },
  methods: {
    getAuthor(author_path) {
      const folder_path = author_path.substring(
        0,
        author_path.lastIndexOf("/")
      );
      if (!folder_path || !this.$api.store[folder_path]) return false;
      return this.$api.store[folder_path].find((f) => f.$path === author_path);
    },
  },
};
