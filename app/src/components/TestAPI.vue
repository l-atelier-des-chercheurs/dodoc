<template>
  <div>
    <h1>Test API</h1>
    <input type="text" v-model="path" />
    <button type="button" @click="getProjects">Fetch projects</button>

    <input type="text" v-model="new_project_title" />
    <button type="button" @click="createProject">Create</button>

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
      path: "/projects",

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
        const url = this.$root.url_to_api + this.path;
        await this.$http.post(url, {
          title: this.new_project_title,
          requested_folder_name: this.new_project_title,
        });
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    async getProjects() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const url = this.$root.url_to_api + this.path;
        const response = await this.$http.get(url);
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
