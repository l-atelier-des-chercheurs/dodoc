<template>
  <div>
    <h1>Test API</h1>
    <button type="button" @click="getProjects">Fetch projects</button>

    <input type="text" v-model="new_project_title" />
    <button type="button" @click="createProject">Create</button>
    <br />
    <br />
    <ProjectView
      v-for="project in projects"
      :project="project"
      :key="project.slug"
    />
  </div>
</template>
<script>
import ProjectView from "@/components/ProjectView.vue";

export default {
  props: {},
  components: {
    ProjectView,
  },
  data() {
    return {
      fetch_status: null,
      fetch_error: null,

      new_project_title: (
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2),
    };
  },
  created() {},
  mounted() {
    this.getProjects();
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    projects() {
      return this.$root.store.projects;
    },
  },
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
    async getProjects() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$axios.get("/projects");
        window.store.projects = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
