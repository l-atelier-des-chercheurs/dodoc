<template>
  <div>
    <router-link to="/">Accueil</router-link>
    <h1>Projets</h1>
    <input type="text" v-model="new_project_title" />
    <button type="button" @click="createProject">Create</button>
    <br />
    <br />
    <ProjectPreview
      v-for="project in projects"
      :project="project"
      :key="project.slug"
    />
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
      fetch_status: null,
      fetch_error: null,

      new_project_title: (
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2),

      projects: null,
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
  computed: {},
  methods: {
    async createProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        await this.$axios.post("/projects", {
          title: this.new_project_title,
          requested_folder_name: this.new_project_title,
        });
        this.fetch_status = "success";

        this.new_project_title = (
          Math.random().toString(36) + "00000000000000000"
        ).slice(2, 3 + 2);
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
