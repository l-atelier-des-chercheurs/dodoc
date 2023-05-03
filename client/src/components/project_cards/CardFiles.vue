<template>
  <ProjectCard :header="$t('files')" :icon="'file-earmark-arrow-down'">
    <FilesModule
      :folder_path="project.$path"
      :downloadable_files="project.downloadable_files"
      :can_edit="can_edit"
    />
  </ProjectCard>
</template>
<script>
import ProjectCard from "@/components/ProjectCard.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {
    ProjectCard,
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
<style lang="scss" scoped></style>
