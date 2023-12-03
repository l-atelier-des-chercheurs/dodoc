<template>
  <div class="_loadSelectedProjects">
    <LoaderSpinner v-if="is_loading" />
    <ProjectsList
      v-else
      :projects="projects"
      :context="'tiny'"
      :display_original_space="true"
      :separate_finished_from_non_finished="false"
    />
  </div>
</template>
<script>
import ProjectsList from "@/components/ProjectsList.vue";

export default {
  props: {
    paths: Array,
  },
  components: {
    ProjectsList,
  },
  data() {
    return {
      projects: [],
      is_loading: true,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  async mounted() {
    const latest_paths = this.paths.slice(-5);
    await this.loadSelectedProjects(latest_paths);
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
          })
          .catch((err) => {
            this.fetch_stopmotion_error = err.response;
          });
        this.projects.push(project);
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
}
</style>
