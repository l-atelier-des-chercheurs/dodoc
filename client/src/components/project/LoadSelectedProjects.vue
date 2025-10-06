<template>
  <div class="_loadSelectedProjects">
    <!-- {{ fetch_err }} -->
    <div v-for="project in projects" :key="project.$path">
      <ProjectPresentation
        :project="project"
        :context="'tiny'"
        :display_original_space="true"
        :can_edit="false"
      />
    </div>
  </div>
</template>
<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";

export default {
  props: {
    paths: Array,
  },
  components: {
    ProjectPresentation,
  },
  data() {
    return {
      projects: [],
      is_loading: true,
      fetch_err: undefined,
    };
  },
  created() {},
  async mounted() {
    await this.loadSelectedProjects(this.paths);
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async loadSelectedProjects(paths) {
      for (const path of paths) {
        const project = await this.$api
          .getFolder({
            path,
            no_files: true,
          })
          .catch((err) => {
            // this.fetch_err = err.response;
          });
        if (project && project.$path) this.projects.push(project);
      }
      this.is_loading = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._loadSelectedProjects {
  position: relative;
  margin-bottom: calc(var(--spacing) / 2);

  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 2);
  align-items: stretch;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
}
</style>
