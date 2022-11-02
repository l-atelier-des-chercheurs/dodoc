<template>
  <div class="_projectsView">
    <pre>
       {{ projects }}
    </pre>
    <div class="_title">
      <h1>Projets</h1>
      <div>
        <button
          type="button"
          class="u-button u-button_red u-button_big"
          v-if="$api.is_logged_in"
          @click="show_create_modal = true"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 168 168"
            style="enable-background: new 0 0 168 168"
            xml:space="preserve"
          >
            <path
              style="fill: #fc4b60"
              d="M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7
		C110.5-8.2,57.5-8.2,24.6,24.4z"
            />
            <polygon
              style="fill: #ffbe32"
              points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
            />
          </svg>
          créer
        </button>
      </div>
    </div>

    <CreateProject
      v-if="show_create_modal"
      @close="show_create_modal = false"
      @openNewProject="openNewProject"
    />

    <h2>Finalisés</h2>
    <div class="_projectsList">
      <ProjectPresentation
        v-for="project in finalized_projects"
        :project="project"
        context="list"
        :key="project.$slug"
      />
    </div>
    <hr />
    <h2>En cours</h2>
    <div class="_projectsList">
      <ProjectPresentation
        v-for="project in draft_projects"
        :project="project"
        context="list"
        :key="project.$slug"
      />
    </div>
  </div>
</template>
<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";
import CreateProject from "@/components/modals/CreateProject.vue";

export default {
  props: {},
  components: {
    ProjectPresentation,
    CreateProject,
  },
  data() {
    return {
      projects: [],
      show_create_modal: false,
    };
  },
  created() {},
  async mounted() {
    this.projects = await this.$api.getFolders({
      folder_type: "projects",
    });
    this.$api.join({ room: "projects" });
  },
  beforeDestroy() {
    this.$api.leave({ room: "projects" });
  },
  watch: {},
  computed: {
    sorted_projects() {
      const _projects = this.projects.slice();
      return _projects.sort(function (a, b) {
        let valA = a.date_created;
        let valB = b.date_created;
        if (valA === valB) return 0;
        return valA < valB ? -1 : 1;
      });
    },
    finalized_projects() {
      return this.sorted_projects.filter((p) => p.status === "finished");
    },
    draft_projects() {
      return this.sorted_projects.filter((p) => p.status !== "finished");
    },
  },
  methods: {
    openNewProject(new_folder_slug) {
      this.show_create_modal = false;
      this.$router.push(`/projects/${new_folder_slug}`);
    },
  },
};
</script>
<style lang="scss" scoped>
._projectsView {
  padding: calc(var(--spacing) * 2);
}
._projectsList {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1);
  align-items: flex-start;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));

  border-radius: 6px;
  overflow: hidden;

  > * {
  }

  ::v-deep ._projectInfos {
    min-height: 100%;
    display: block;
  }
}

._title {
  text-align: center;
}
</style>
