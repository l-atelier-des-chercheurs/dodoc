<template>
  <div>
    Test API
    <button type="button" @click="getProjects">Fetch projects</button>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async populateProjects() {
      try {
        const users = await axios.get(
          "https://jsonplaceholder.typicode.com/users"
        );

        this.users = users.data;
      } catch (e) {
        console.log(e);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
