<template>
  <div>
    Test API
    <button type="button" @click="getProjects">Fetch projects</button>
    {{ projects }}
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      projects: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async getProjects() {
      // TODO
      try {
        const url = this.$root.url_to_api + "/projects";
        this.projects = await this.$http.get(url);
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
