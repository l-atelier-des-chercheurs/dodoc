<template>
  <div class="m_project">
    {{ project.slug }}
    <h1>
      <TitleField
        :field_name="'title'"
        :content="project.title"
        :show_label="false"
        :path_to_resource="`/projects/${project.slug}`"
      />
    </h1>

    <TextField
      field_name="description"
      :content="project.description"
      :path_to_resource="`/projects/${project.slug}`"
    />

    <br />
    <button type="button" @click="updateProject">save</button>
    <button type="button" @click="removeProject">delete</button>

    <SendMedia :folder_type="'projects'" :folder_slug="project.slug" />

    <ProjectLibrary :project_slug="project.slug" :project="project" />
    <!-- fetch_status = {{ fetch_status }} <br />
    fetch_error = {{ fetch_error }} <br />
    response = {{ response }} <br /> -->
  </div>
</template>
<script>
import SendMedia from "./SendMedia.vue";
import ProjectLibrary from "./ProjectLibrary.vue";

export default {
  props: {
    project: Object,
  },
  components: {
    SendMedia,
    ProjectLibrary,
  },
  data() {
    return {
      new_title: this.project.title,

      fetch_status: null,
      fetch_error: null,
      response: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async updateProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$axios.post(
          `/projects/${this.project.slug}`,
          {
            title: this.new_title,
          }
        );

        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    async removeProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$axios.delete(
          `/projects/${this.project.slug}`
        );
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.m_project {
  border: 1px solid black;
  padding: 1rem;
}
</style>
