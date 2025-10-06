<template>
  <div class="_trackAuthorChanges">
    <!-- <pre>{{ projects_recently_edited }}</pre> -->
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      projects_recently_edited: [],
      max_items_in_memory: 3,
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
    projects_recently_edited() {
      this.updateRecentProjectForAuthor();
    },
    "connected_as.projects_recently_edited": {
      handler() {
        if (this.connected_as?.projects_recently_edited)
          this.projects_recently_edited =
            this.connected_as.projects_recently_edited.slice();
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {},
  methods: {
    newPathEdited({ path }) {
      const { space_slug, project_slug } = this.decomposePath(path);
      if (space_slug && project_slug)
        // get project path, only push project
        path = this.createPath({
          space_slug,
          project_slug,
        });
      else return;

      // only update if latest is not already this project
      if (this.projects_recently_edited.at(-1) === path) return;

      let _projects_recently_edited = this.projects_recently_edited.slice();
      // if updated project before, remove from list
      _projects_recently_edited = _projects_recently_edited.filter(
        (p) => p !== path
      );
      _projects_recently_edited.push(path);
      _projects_recently_edited = _projects_recently_edited.slice(
        -this.max_items_in_memory
      );
      this.projects_recently_edited = _projects_recently_edited;
    },
    async updateRecentProjectForAuthor() {
      if (!this.connected_as || this.projects_recently_edited.length === 0)
        return false;

      if (
        JSON.stringify(this.connected_as.projects_recently_edited) ===
        JSON.stringify(this.projects_recently_edited)
      )
        return false;

      await this.$api.updateMeta({
        path: this.connected_as.$path,
        new_meta: {
          projects_recently_edited: this.projects_recently_edited,
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
