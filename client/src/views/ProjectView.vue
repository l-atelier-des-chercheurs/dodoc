<template>
  <div class="">
    {{ $route.params.slugFolderName }}
    <SendMedia :folder_type="'projects'" :folder_slug="project.slug" />
    <ProjectLibrary
      v-if="show_lib"
      :project_slug="project.slug"
      :project="project"
    />
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
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
