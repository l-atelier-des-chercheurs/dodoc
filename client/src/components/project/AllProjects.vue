<template>
  <div class="_allProjects">
    <transition name="fade_fast" :duration="150" mode="out-in">
      <LoaderSpinner v-if="is_loading" />
      <ProjectsListWithFilter
        v-else
        :projects="filtered_projects"
        :display_original_space="true"
      />
    </transition>
  </div>
</template>
<script>
import ProjectsListWithFilter from "@/components/ProjectsListWithFilter.vue";

export default {
  props: {
    show_only_my_projects: Boolean,
  },
  components: { ProjectsListWithFilter },
  data() {
    return {
      all_projects: [],
      is_loading: true,
    };
  },
  created() {},
  async mounted() {
    this.all_projects = (await this.loadAllFolders("spaces", "projects")) || [];
    this.is_loading = false;
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    filtered_projects() {
      let _projects = this.all_projects;

      if (this.show_only_my_projects)
        _projects = _projects.filter((p) => {
          if (!p) return false;
          if (
            Array.isArray(p.$admins) &&
            p.$admins?.includes(this.connected_as.$path)
          )
            return true;
          if (
            Array.isArray(p.$contributors) &&
            p.$contributors?.includes(this.connected_as.$path)
          )
            return true;
          return false;
        });

      return _projects;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._allProjects {
  position: relative;
  width: 100%;
  // max-width: calc(var(--max-column-width));
  // max-width: calc(var(--max-column-width) + 240px);
  margin: 0 auto;
}
</style>
