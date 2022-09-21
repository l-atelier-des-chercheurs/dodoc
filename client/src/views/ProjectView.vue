<template>
  <div class="_projectView">
    <div class="_topbar">
      <template v-if="is_loading">Chargement…</template>
      <template v-else-if="error">
        <div v-if="error.status === 404">Projet introuvable</div>
      </template>
      <template v-else>
        <sl-breadcrumb>
          <sl-breadcrumb-item @click="$router.push('/')">
            <sl-icon slot="prefix" name="house-door-fill" />
            Plateau
          </sl-breadcrumb-item>
          <sl-breadcrumb-item @click="$router.push('/projects')">
            Projets
          </sl-breadcrumb-item>
          <sl-breadcrumb-item @click="$router.replace({ query: {} })">
            {{ project.title }}
          </sl-breadcrumb-item>
        </sl-breadcrumb>

        <PaneList class="_paneList" :panes.sync="projectpanes" />
      </template>
    </div>
    <div class="_panes" v-if="!is_loading && !error">
      <ProjectPanes :projectpanes.sync="projectpanes" :project="project" />
    </div>
  </div>
</template>

<script>
import PaneList from "@/components/nav/PaneList.vue";
import ProjectPanes from "@/components/ProjectPanes.vue";

export default {
  props: {},
  components: {
    PaneList,
    ProjectPanes,
  },
  data() {
    return {
      project_slug: this.$route.params.slug,
      is_loading: true,
      error: null,
      project: null,

      projectpanes: [],
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
  watch: {
    $route: {
      handler() {
        let projectpanes = this.$route.query?.projectpanes;
        if (projectpanes) this.projectpanes = JSON.parse(projectpanes);
      },
      immediate: true,
    },
    projectpanes: {
      handler() {
        this.updateQueryPanes();
      },
      deep: true,
    },
  },
  computed: {
    // project() {
    // return window.store.projects?.find((p) => p.slug === this.project_slug);
    // },
  },
  methods: {
    updateQueryPanes() {
      let query = {};

      if (this.projectpanes)
        query.projectpanes = JSON.stringify(this.projectpanes);
      if (
        this.$route.query &&
        JSON.stringify(this.$route.query) === JSON.stringify(query)
      )
        return false;

      this.$router.replace({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._projectView {
  height: 100vh;
  max-height: -webkit-fill-available;

  display: flex;
  flex-flow: column nowrap;
}

._topbar {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  // justify-content: space-between;
  gap: calc(var(--spacing));
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);

  border-bottom: 1px solid black;

  ._paneList {
    flex: 1 1 auto;
  }
}

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
