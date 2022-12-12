export default {
  computed: {
    connected_as() {
      if (this.$api.tokenpath.token_path)
        return this.getAuthor(this.$api.tokenpath.token_path);
      return false;
    },
    is_identified() {
      return this.$api.tokenpath.token !== "";
    },
    is_admin() {
      // TODO
      return this.is_identified;
      // return true;
    },
  },
  methods: {
    getAuthor(author_path) {
      if (this.$api.store[author_path]) return this.$api.store[author_path];

      const folder_path = author_path.substring(
        0,
        author_path.lastIndexOf("/")
      );
      if (!folder_path || !this.$api.store[folder_path]) return false;
      return this.$api.store[folder_path].find((f) => f.$path === author_path);
      // return this.$api.store[folder_path]?.$files?.find(
      //   ({ $path }) => $path === source_media_path
      // );
      // if (path === "authors/louis")
      //   return {
      //     name: "Louis",
      //     image:
      //       "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80",
      //   };
      // if (path === "authors/pauline")
      //   return {
      //     name: "Pauline",
      //     image:
      //       "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80",
      //   };
      // if (path === "authors/sarah")
      //   return {
      //     name: "Sarah",
      //     image:
      //       "https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right",
      //   };
    },
  },
};
