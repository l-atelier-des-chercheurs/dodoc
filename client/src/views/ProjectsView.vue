<template>
  <div class="pageContent">
    <div class="_title">
      <h1>Projets</h1>
      <div>
        <sl-button
          size="small"
          variant="text"
          pill
          @click="show_create_modal = true"
        >
          <sl-icon slot="suffix" name="box-arrow-in-up-right"></sl-icon>
          créer
        </sl-button>
      </div>
    </div>

    <CreateProject
      v-if="show_create_modal"
      @close="show_create_modal = false"
    />

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
import CreateProject from "@/components/modals/CreateProject.vue";

export default {
  props: {},
  components: {
    ProjectPreview,
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
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._projects {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 1);
  align-items: start;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));

  > * {
  }
}

._title {
  text-align: center;
}
</style>
