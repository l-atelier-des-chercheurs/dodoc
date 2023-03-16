<template>
  <div class="_spaceView">
    <div v-if="space">
      <SpacePresentation :space="space" :can_edit="can_edit_space" />

      <br />

      <DLabel
        :str="$t('contributors')"
        :instructions="$t('space_contrib_instr')"
      />

      <div class="_contributorsList">
        <div v-for="contributor in contributors" :key="contributor">
          <sl-avatar
            image="https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
            label="Avatar of a gray tabby kitten looking down"
          />
          Pauline
        </div>
      </div>

      <br /><br />

      <h2>Les projets</h2>

      <button
        type="button"
        class="u-button u-button_red u-button_small"
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

      <CreateProject
        v-if="show_create_modal"
        :path="projects_path"
        @close="show_create_modal = false"
        @openNewProject="openNewProject"
      />

      <br />
      <br />

      <ProjectsList v-if="projects" :projects="projects" />
    </div>
  </div>
</template>
<script>
import CreateProject from "@/components/modals/CreateProject.vue";
import ProjectsList from "@/components/ProjectsList.vue";
import SpacePresentation from "@/components/space/SpacePresentation.vue";

export default {
  props: {},
  components: {
    CreateProject,
    ProjectsList,
    SpacePresentation,
  },
  data() {
    return {
      space: undefined,
      projects: undefined,
      show_create_modal: false,

      contributors: new Array(6).fill(undefined),
    };
  },
  created() {},
  async mounted() {
    this.getSpace();
    this.getProjects();
  },
  beforeDestroy() {
    this.$api.leave({ room: this.space_path });
    this.$api.leave({ room: this.projects_path });
  },
  watch: {},
  computed: {
    space_path() {
      return "spaces/" + this.$route.params.space_slug;
    },
    projects_path() {
      return this.space_path + "/projects";
    },
    can_edit_space() {
      return this.canLoggedinEditProject({
        project_authors: this.space.$authors,
      });
    },
  },
  methods: {
    async getSpace() {
      this.space = await this.$api
        .getFolder({
          path: this.space_path,
        })
        .catch(() => {
          return;
        });
      this.$api.join({ room: this.space_path });
    },
    async getProjects() {
      this.projects = await this.$api
        .getFolders({
          path: this.projects_path,
        })
        .catch(() => {
          return;
        });
      this.$api.join({ room: this.projects_path });
    },
    openNewProject(new_folder_slug) {
      this.show_create_modal = false;
      this.$router.push("projects/" + new_folder_slug);
    },
  },
};
</script>
<style lang="scss" scoped>
._spaceView {
  max-width: var(--max-column-width);
  margin: 0 auto;
  padding: calc(var(--spacing) * 2);
}

._contributorsList {
  display: grid;
  grid-auto-rows: max-content;
  grid-gap: calc(var(--spacing) / 2);
  align-items: stretch;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));

  > * {
    background: white;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    gap: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 1);
  }
}
</style>
