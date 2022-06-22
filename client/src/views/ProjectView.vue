<template>
  <div class="">
    <template v-if="is_loading">Chargement…</template>
    <template v-else-if="error">
      <div v-if="error.status === 404">Projet introuvable</div>
    </template>
    <template v-else>
      <PaneList :panes.sync="panes" />
      <h1>{{ project.title }}</h1>

      <div class="_panes">
        <ProjectPanes :panes="panes" />
      </div>
      <ProjectLibrary :project_slug="project_slug" :project="project" />
    </template>
  </div>
</template>

<script>
import ProjectLibrary from "@/components/ProjectLibrary.vue";
import PaneList from "@/components/nav/PaneList.vue";
import ProjectPanes from "@/components/ProjectPanes.vue";

export default {
  props: {},
  components: {
    ProjectLibrary,
    PaneList,
    ProjectPanes,
  },
  data() {
    return {
      project_slug: this.$route.params.slug,
      is_loading: true,
      error: null,
      project: null,

      panes: [],
    };
  },
  created() {},
  mounted() {
    this.$api
      .getFolder({
        folder_type: "projects",
        folder_slug: this.project_slug,
      })
      .then((project) => {
        this.project = project;
        this.$api.join({ room: `projects/${this.project_slug}` });
      })
      .catch((err) => {
        this.error = err.response;
      })
      .then(() => (this.is_loading = false));
  },
  beforeDestroy() {
    this.$api.leave({ room: `projects/${this.project_slug}` });
  },
  watch: {},
  computed: {
    // project() {
    // return window.store.projects?.find((p) => p.slug === this.project_slug);
    // },
  },
  methods: {
    updatePanes(panes) {
      panes;
      debugger;
    },
  },
};
</script>
<style lang="scss" scoped>
._panes {
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  > * {
    height: 100%;
  }
}
</style>
