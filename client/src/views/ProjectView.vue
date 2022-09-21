<template>
  <div class="_projectView pageContent">
    <div class="">
      <div class="_projectPres">
        <h1>
          {{ project.title }}
        </h1>
        <DateField :title="'date_created'" :date="project.date_created" />
        Ajouter des mots-clés <br />
        Ajouter une image de couverture <br />
      </div>

      <div>
        <h2>1. Collecter</h2>
        <div>bibliothèque de médias</div>
        <div>"capturer"</div>
        <div>"importer"</div>
        <h2>2. Remixer</h2>
        <h2>3. Raconter</h2>

        <PaneList class="_paneList" :panes.sync="projectpanes" />

        {{ projectpanes }}

        <ProjectArticles :project="project" :articles="articles" />
      </div>
    </div>
  </div>
</template>

<script>
import ProjectArticles from "@/components/ProjectArticles.vue";
import PaneList from "../components/nav/PaneList.vue";

export default {
  props: {},
  components: {
    ProjectArticles,
    PaneList,
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
    articles() {
      return this.project.files.filter((f) => f.is_article === true) || [];
    },
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
}

._topbar {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  // justify-content: space-between;
  gap: calc(var(--spacing));
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
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
