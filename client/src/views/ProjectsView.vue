<template>
  <div class="_projectsView">
    <!-- <pre>
       {{ projects }}
    </pre> -->
    <!-- <div class="_title">
      <h1>Les projets</h1>
    </div> -->
    <div class="">
      <button
        type="button"
        class="u-button u-button_red u-button_big"
        v-if="connected_as"
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
        {{ $t("create_a_project") }}
      </button>

      <template v-else>
        Vous devez
        <button
          type="button"
          class="u-button u-button_bleumarine u-button_small"
          @click="$eventHub.$emit(`toolbar.openAuthor`)"
        >
          vous inscrire
        </button>
        pour pouvoir créer ou rejoindre un projet.
      </template>

      <CreateProject
        v-if="show_create_modal"
        @close="show_create_modal = false"
        @openNewProject="openNewProject"
      />
    </div>

    <ProjectsTester v-if="is_admin" />

    <div class="">
      <h3>Projets finalisés</h3>
      <div class="_projectsList">
        <div v-if="finalized_projects.length === 0" class="u-instructions">
          {{ $t("no_finalized_proejcts") }}
        </div>

        <ProjectPresentation
          v-for="project in finalized_projects"
          :project="project"
          context="list"
          :key="project.$path"
        />
      </div>
    </div>

    <div class="">
      <h3>Projets en cours</h3>
      <div class="_projectsList">
        <div v-if="draft_projects.length === 0" class="u-instructions">
          {{ $t("no_draft_proejcts") }}
        </div>
        <ProjectPresentation
          v-for="project in draft_projects"
          :project="project"
          context="list"
          :key="project.$path"
        />
      </div>
    </div>
  </div>
</template>
<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";
import CreateProject from "@/components/modals/CreateProject.vue";
import ProjectsTester from "@/adc-core/tests/ProjectsTester.vue";

export default {
  props: {},
  components: {
    ProjectPresentation,
    CreateProject,
    ProjectsTester,
  },
  data() {
    return {
      path: `projects`,
      projects: [],
      show_create_modal: false,
    };
  },
  created() {},
  async mounted() {
    this.projects = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err_msg) => {
        err_msg;
        return;
      });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
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

  > * {
    margin-bottom: var(--spacing);
  }
}
._projectsList {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1);
  align-items: flex-start;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));

  border-radius: 6px;
  overflow: hidden;
  margin-top: calc(var(--spacing) / 4);

  > * {
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
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
