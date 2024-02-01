<template>
  <div class="_spaceProjectPicker">
    <DLabel :str="$t('destination_project')" />
    <div class="_row">
      <div class="">
        <div class="u-buttonLink" disabled>
          {{ $t("space") }}
        </div>
        <select v-model="destination_space_path">
          <option
            v-for="space in sorted_spaces"
            :key="space.$path"
            :value="space.$path"
            v-text="makeSpaceTitle(space)"
          />
        </select>
      </div>
      <div class="_arrowBtn">
        <b-icon icon="arrow-right-short" label="" />
      </div>
      <div v-if="!projects" class="_projectLoader">
        <LoaderSpinner />
      </div>
      <div v-else-if="projects.length > 0">
        <div class="u-buttonLink" disabled>
          {{ $t("project") }}
        </div>
        <select v-model="destination_project_path">
          <option
            v-for="project in sorted_projects"
            :key="project.$path"
            :value="project.$path"
            v-text="makeProjectTitle(project)"
          />
        </select>
      </div>
      <div v-else-if="sorted_projects.length === 0">
        <small class="u-instructions">
          {{ $t("no_projects") }}
        </small>
      </div>
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

      current_space_path: undefined,
      current_project_path: undefined,
    };
  },
  async created() {
    const { space_slug, project_slug } = this.decomposePath(this.path);
    this.current_space_path = this.destination_space_path = this.createPath({
      space_slug,
    });

    this.current_project_path = this.destination_project_path = this.createPath(
      {
        space_slug,
        project_slug,
      }
    );

    this.spaces = await this.$api.getFolders({
      path: "spaces",
    });
  },
  async mounted() {},
  beforeDestroy() {},
  watch: {
    async destination_space_path() {
      this.projects = undefined;
      this.projects = await this.$api.getFolders({
        path: this.destination_space_path + "/projects",
      });
      if (this.sorted_projects.length === 0) this.destination_project_path = "";
      else if (
        this.sorted_projects.length > 0 &&
        !this.sorted_projects.some(
          (p) => p.$path === this.destination_project_path
        )
      )
        this.destination_project_path = this.sorted_projects[0].$path;
    },
    destination_project_path() {
      this.$emit("newProjectSelected", this.destination_project_path);
    },
  },
  computed: {
    sorted_spaces() {
      if (!this.spaces) return [];
      return this.spaces
        .slice()
        .filter((s) =>
          this.canLoggedinSeeFolder({
            folder: s,
          })
        )
        .sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
    },
    sorted_projects() {
      if (!this.projects) return [];
      return this.projects
        .slice()
        .filter((p) =>
          this.canLoggedinSeeFolder({
            folder: p,
          })
        )
        .sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
    },
  },
  methods: {
    makeSpaceTitle(space) {
      if (space.$path === this.current_space_path) return "• " + space.title;
      return space.title;
    },
    makeProjectTitle(project) {
      if (project.$path === this.current_project_path)
        return "• " + project.title;
      return project.title;
    },
  },
};
</script>
<style lang="scss" scoped>
._spaceProjectPicker {
  ._row {
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: calc(var(--spacing) / 2);

    > * {
      flex: 1 1 50%;

      &._arrowBtn {
        flex: 0 0 auto;
      }
    }
  }
}

._projectLoader {
  position: relative;
}
</style>
