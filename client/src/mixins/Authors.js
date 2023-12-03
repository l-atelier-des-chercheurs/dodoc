export default {
  computed: {
    connected_as() {
      if (this.$api.tokenpath.token_path)
        return this.$api.store[this.$api.tokenpath.token_path];
      return false;
    },
    is_instance_admin() {
      // return true;
      return this.authorIsInstance({
        field: "$admins",
        folder_path: this.connected_as?.$path,
      });
    },
    is_instance_contributor() {
      return this.authorIsInstance({
        field: "$contributors",
        folder_path: this.connected_as?.$path,
      });
    },
  },
  methods: {
    authorIsInstance({ field, folder_path }) {
      const $ = this.$root.app_infos.instance_meta[field];
      return $.includes(folder_path) || $ === "everyone";
    },
    isOwnFolder({ folder }) {
      if (this.connected_as?.$path)
        return (
          folder.$admins?.includes(this.connected_as.$path) ||
          folder.$contributors?.includes(this.connected_as.$path)
        );
      return false;
    },
    getAuthor(author_path) {
      const folder_path = author_path.substring(
        0,
        author_path.lastIndexOf("/")
      );
      if (!folder_path || !this.$api.store[folder_path]) return false;
      return this.$api.store[folder_path].find((f) => f.$path === author_path);
    },
    setDefaultContentAdmins() {
      if (this.connected_as) return [this.$api.tokenpath.token_path];
      return "everyone";
    },
    canLoggedinEditFolder({ folder }) {
      if (this.is_instance_admin) return true;
      if (folder.$admins === "everyone") return true;
      if (!this.connected_as) return false;
      if (
        Array.isArray(folder.$admins) &&
        folder.$admins.includes(this.connected_as.$path)
      )
        return true;

      // todo : check if parent folder match as well

      return false;
    },
    canLoggedinContributeToFolder({ folder }) {
      if (this.canLoggedinEditFolder({ folder })) return true;

      if (folder.$contributors === "everyone") return true;
      if (!this.connected_as) return false;
      if (
        Array.isArray(folder.$contributors) &&
        folder.$contributors.includes(this.connected_as.$path)
      )
        return true;

      return false;
    },
    canLoggedinSeeFolder({ folder }) {
      // todo do this API side
      // invisible is the old name for private
      if (folder.$status !== "invisible" && folder.$status !== "private")
        return true;
      if (!this.connected_as) return false;
      if (this.is_instance_admin) return true;
      if (
        Array.isArray(folder.$admins) &&
        folder.$admins.includes(this.connected_as.$path)
      )
        return true;
      if (
        Array.isArray(folder.$contributors) &&
        folder.$contributors.includes(this.connected_as.$path)
      )
        return true;
      return false;
    },
  },
};
