<template>
  <div class="_allProjects">
    <transition name="fade_fast" :duration="150" mode="out-in">
      <LoaderSpinner v-if="is_loading" />
      <ProjectsListWithFilter v-else :projects="all_projects" />
    </transition>
  </div>
</template>
<script>
import ProjectsListWithFilter from "@/components/ProjectsListWithFilter.vue";

export default {
  props: {},
  components: { ProjectsListWithFilter },
  data() {
    return {
      all_projects: [],
      is_loading: true,
    };
  },
  created() {},
  async mounted() {
    await this.loadAllProjects();
    this.is_loading = false;
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async loadAllProjects() {
      let spaces = await this.$api
        .getFolders({
          path: "spaces",
        })
        .catch((err) => {
          return err;
        });

      spaces = spaces.filter((s) =>
        this.canLoggedinSeeFolder({
          folder: s,
        })
      );
      if (spaces.length === 0) return;

      for (const space of spaces) {
        const projects = await this.$api.getFolders({
          path: space.$path + "/projects",
        });
        if (projects.length > 0)
          this.all_projects = this.all_projects.concat(projects);
      }
      return;
    },
  },
};
</script>
<style lang="scss" scoped>
._allProjects {
  position: relative;
  width: 100%;
  max-width: calc(var(--max-column-width));
  // max-width: calc(var(--max-column-width) + 240px);
  margin: 0 auto;
  padding: calc(var(--spacing) * 1);
}
</style>
