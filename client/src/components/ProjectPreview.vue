<template>
  <div class="m_project">
    <strong>
      <TitleField
        :field_name="'title'"
        :content="project.title"
        :show_label="false"
        :path_to_resource="`/projects/${project.slug}`"
      />
    </strong>

    <TextField
      field_name="description"
      :content="project.description"
      :path_to_resource="`/projects/${project.slug}`"
    />

    <br />
    <button type="button" @click="updateProject">save</button>
    <button type="button" @click="removeProject">delete</button>

    <router-link :to="`/project/${project.slug}`">Ouvrir</router-link>

    <!-- fetch_status = {{ fetch_status }} <br />
    fetch_error = {{ fetch_error }} <br />
    response = {{ response }} <br /> -->
  </div>
</template>
<script>
export default {
  props: {
    project: Object,
  },
  components: {},
  data() {
    return {
      new_title: this.project.title,

      fetch_status: null,
      fetch_error: null,
      response: null,

      show_lib: false,
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
        const response = await this.$axios.patch(
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
  background: #eee;
  padding: 1rem;
}
</style>
