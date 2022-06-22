<template>
  <div class="">
    <h3>Projet</h3>
    <template v-if="is_loading">
      <button type="button" class="bg-indigo-500 ..." disabled>
        <svg class="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24"></svg>
        Processing...
      </button>
    </template>
    <template v-else-if="error">
      <div v-if="error.status === 404">Projet introuvable</div>
    </template>
    <template v-else>
      <h1>{{ project.title }}</h1>
      <br />
      <SendMedia :folder_type="'projects'" :folder_slug="project_slug" />
      <ProjectLibrary :project_slug="project_slug" :project="project" />
    </template>
  </div>
</template>

<script>
// @ is an alias to /src
import SendMedia from "@/components/SendMedia.vue";
import ProjectLibrary from "@/components/ProjectLibrary.vue";

export default {
  props: {},
  components: {
    SendMedia,
    ProjectLibrary,
  },
  data() {
    return {
      project_slug: this.$route.params.slug,
      is_loading: true,
      error: null,
      project: null,
    };
  },
  created() {},
  mounted() {
    this.$api
      .getFolder({
        folder_type: "projects",
        folder_slug: this.project_slug,
      })
      .then((project) => {
        this.project = project;
        this.$api.join({ room: `projects/${this.project_slug}` });
      })
      .catch((err) => {
        this.error = err.response;
      })
      .then(() => (this.is_loading = false));
  },
  beforeDestroy() {
    this.$api.leave({ room: `projects/${this.project_slug}` });
  },
  watch: {},
  computed: {
    // project() {
    // return window.store.projects?.find((p) => p.slug === this.project_slug);
    // },
  },
  methods: {},
};
</script>
