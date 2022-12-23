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
    canLoggedinEditProject({ project_authors }) {
      // if admin, or part of authors, or no authors
      if (this.connected_as?.role === "admin") return true;
      if (
        !project_authors ||
        !Array.isArray(project_authors) ||
        project_authors.length === 0
      )
        return true;

      if (project_authors.includes(this.connected_as?.$path)) return true;
      return false;
    },
    canLoggedinSeeProject({ project }) {
      // if public, if author admin, if author part of $authors
      // todo do this API side
      if (project.$public) return true;
      if (this.connected_as?.role === "admin") return true;

      if (
        Array.isArray(project.$authors) &&
        project.$authors.includes(this.connected_as?.$path)
      )
        return true;
      return false;
    },
  },
};
