<template>
  <div class="">
    <router-link to="/projects">Tous les projets</router-link>

    Projet
    <template v-if="is_loading">
      <sl-spinner></sl-spinner>
    </template>
    <template v-else>
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
      project: null,
    };
  },
  created() {},
  async mounted() {
    this.project = await this.$api.getFolder({
      folder_type: "projects",
      folder_slug: this.project_slug,
    });
    this.$api.join({ room: `projects/${this.project_slug}` });
    this.is_loading = false;
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
