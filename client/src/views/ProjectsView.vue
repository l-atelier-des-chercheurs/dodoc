<template>
  <div class="pageContent">
    <div class="_title">
      <h1>Projets</h1>
      <div>
        <sl-button
          size="small"
          variant="text"
          pill
          @click="$refs.createModal.show()"
        >
          <sl-icon slot="suffix" name="box-arrow-in-up-right"></sl-icon>
          créer
        </sl-button>
      </div>
    </div>

    <sl-dialog ref="createModal" label="Créer un projet" class="">
      <sl-input
        type="text"
        autofocus
        placeholder="Titre du nouveau projet"
        v-sl-model="new_project_title"
      />
      <sl-button
        variant="primary"
        slot="footer"
        :loading="is_creating_project"
        @click="createProject"
      >
        créer
      </sl-button>
    </sl-dialog>

    <br />
    <div class="_projects">
      <ProjectPreview
        v-for="project in sorted_projects"
        :project="project"
        :key="project.slug"
      />
    </div>
  </div>
</template>
<script>
import ProjectPreview from "@/components/ProjectPreview.vue";

export default {
  props: {},
  components: {
    ProjectPreview,
  },
  data() {
    return {
      new_project_title: "",
      projects: [],
      is_creating_project: false,
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
  },
  methods: {
    async createProject() {
      this.is_creating_project = true;

      try {
        await this.$axios.post("/projects", {
          title: this.new_project_title,
          requested_folder_name: this.new_project_title,
        });
        this.is_creating_project = false;
        this.$refs.createModal.hide();
        this.new_project_title = "";
      } catch (e) {
        this.$alertify.closeLogOnClick(true).delay(4000).error(e.response.data);
        this.is_creating_project = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._projects {
  display: flex;
  flex-flow: row wrap;
  gap: var(--spacing);
  justify-content: center;

  > * {
    flex: 0 0 220px;
  }
}

._title {
  text-align: center;
}
</style>
