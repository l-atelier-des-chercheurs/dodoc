<template>
  <div>
    Test API
    <input type="text" v-model="path" />
    <button type="button" @click="getProjects">Fetch projects</button>
    <pre>
      {{ projects }}
    </pre>
    fetch_status = {{ fetch_status }} <br />
    fetch_error = {{ fetch_error }} <br />
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      projects: null,
      fetch_status: null,
      fetch_error: null,
      path: "/projects",
    };
  },
  created() {},
  mounted() {
    this.getProjects();
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async getProjects() {
      this.projects = null;
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const url = this.$root.url_to_api + this.path;
        const response = await this.$http.get(url);
        this.projects = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
        debugger;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
