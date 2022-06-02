<template>
  <div class="m_project">
    {{ project.title }} <br />
    <input type="text" v-model="new_title" />
    <br />
    <button type="button" @click="updateProject">save</button>
    <input type="file" />import
    <button type="button" @click="removeProject">delete</button>

    <SendMedia />

    <!-- fetch_status = {{ fetch_status }} <br />
    fetch_error = {{ fetch_error }} <br />
    response = {{ response }} <br /> -->
  </div>
</template>
<script>
import SendMedia from "./fields/SendMedia.vue";

export default {
  props: {
    project: Object,
  },
  components: {
    SendMedia,
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
        const url = this.$root.url_to_api + "/projects/" + this.project.slug;
        const response = await this.$http.post(url, {
          title: this.new_title,
        });

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
        const url = this.$root.url_to_api + "/projects/" + this.project.slug;
        const response = await this.$http.delete(url);
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
