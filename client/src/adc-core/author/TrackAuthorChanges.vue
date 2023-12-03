<template>
  <div class="_trackAuthorChanges">
    <!-- <pre>
      {{ latest_edited_projects }}
    </pre> -->
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      all_edited_paths: [],
    };
  },

  created() {},
  mounted() {
    this.$eventHub.$on("hooks.createFolder", this.newPathEdited);
    this.$eventHub.$on("hooks.uploadFile", this.newPathEdited);
    this.$eventHub.$on("hooks.copyFile", this.newPathEdited);
    this.$eventHub.$on("hooks.copyFolder", this.newPathEdited);
    // this.$eventHub.$on("hooks.downloadFolder", this.newPathEdited);
    this.$eventHub.$on("hooks.importFolder", this.newPathEdited);
    this.$eventHub.$on("hooks.remixFolder", this.newPathEdited);
    this.$eventHub.$on("hooks.exportFolder", this.newPathEdited);
    this.$eventHub.$on("hooks.optimizeFile", this.newPathEdited);
    this.$eventHub.$on(
      "hooks.generatePreviewForPublication",
      this.newPathEdited
    );
    this.$eventHub.$on("hooks.updateMeta", this.newPathEdited);
    this.$eventHub.$on("hooks.updateCover", this.newPathEdited);
    this.$eventHub.$on("hooks.deleteItem", this.newPathEdited);
  },
  beforeDestroy() {},
  watch: {
    latest_edited_projects() {
      this.updateRecentProjectForAuthor();
    },
    connected_as: {
      handler() {
        if (!this.connected_as?.latest_edited_projects)
          this.all_edited_paths = [];
        else
          this.all_edited_paths =
            this.connected_as.latest_edited_projects.slice();
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    latest_edited_paths() {
      let list = this.all_edited_paths.slice();
      list = [...new Set(list)];
      return list.slice(-5);
    },
    latest_edited_projects() {
      let list = this.all_edited_paths.slice();
      if (list.length === 0) return [];
      list = list.reduce((acc, i) => {
        const { space_slug, project_slug } = this.decomposePath(i);
        if (space_slug && project_slug) {
          // push project
          const path_to_project = this.createPath({
            space_slug,
            project_slug,
          });
          acc.push(path_to_project);
        }
        return acc;
      }, []);
      // keep order at the end
      list.reverse();
      list = [...new Set(list)];
      list.reverse();
      return list.slice(0, 10);
    },
  },
  methods: {
    newPathEdited({ path }) {
      this.all_edited_paths.push(path);
    },
    async updateRecentProjectForAuthor() {
      if (!this.connected_as || this.latest_edited_projects.length === 0)
        return false;

      if (
        JSON.stringify(this.latest_edited_projects) ===
        JSON.stringify(this.connected_as.latest_edited_projects)
      )
        return false;

      this.$alertify.delay(4000).log("update recent");

      await this.$api.updateMeta({
        path: this.connected_as.$path,
        new_meta: {
          latest_edited_projects: this.latest_edited_projects,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._trackAuthorChanges {
  // display: none;
}
</style>
