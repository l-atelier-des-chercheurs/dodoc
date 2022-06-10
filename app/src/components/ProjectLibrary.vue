<template>
  <div>
    <button type="button" @click="loadLibrary">Charger la bibliothèque</button>
    <div v-for="file of project.files" :key="file.slug">
      <MediaCard :file="file" :project_slug="project_slug" />
    </div>
  </div>
</template>
<script>
import MediaCard from "@/components/MediaCard.vue";

export default {
  props: {
    project_slug: String,
    project: Object,
  },
  components: {
    MediaCard,
  },
  data() {
    return {
      fetch_status: null,
      fetch_error: null,
    };
  },
  created() {},
  mounted() {
    this.loadLibrary();
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async loadLibrary() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$axios.get(
          `/projects/${this.project_slug}`
        );

        const project_index = window.store.projects.findIndex(
          (project) => project.slug === this.project_slug
        );

        this.$set(window.store.projects[project_index], "files", response.data);

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
