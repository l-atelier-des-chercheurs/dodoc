<template>
  <div class="_spaceProjectPicker">
    <DLabel :str="$t('destination_project')" />
    <div class="_row">
      <select v-model="destination_space_path">
        <option
          v-for="space in spaces"
          :key="space.$path"
          :value="space.$path"
          v-text="space.title"
        />
      </select>
      <select v-model="destination_project_path">
        <option
          v-for="project in projects"
          :key="project.$path"
          :value="project.$path"
          v-text="project.title"
        />
      </select>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    path: String,
  },
  components: {},
  data() {
    return {
      destination_space_path: undefined,
      destination_project_path: undefined,
      spaces: undefined,
      projects: undefined,
    };
  },
  async created() {
    const { space_slug, project_slug } = this.decomposePath(this.path);
    this.destination_space_path = this.createPath({ space_slug });

    this.destination_project_path = this.createPath({
      space_slug,
      project_slug,
    });

    this.spaces = await this.$api.getFolders({
      path: "spaces",
    });
  },
  async mounted() {},
  beforeDestroy() {},
  watch: {
    async destination_space_path() {
      this.projects = await this.$api.getFolders({
        path: this.destination_space_path + "/projects",
      });
      if (this.projects.length === 0) this.destination_project_path = "";
      else if (
        this.projects.length > 0 &&
        !this.projects.some((p) => p.$path === this.destination_project_path)
      )
        this.destination_project_path = this.projects[0].$path;
    },
    destination_project_path() {
      this.$emit("newProjectSelected", this.destination_project_path);
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._spaceProjectPicker {
  ._row {
    display: flex;
    flex-flow: row nowrap;
    gap: calc(var(--spacing) / 2);

    > * {
      flex: 1 1 0;
    }
  }
}
</style>
