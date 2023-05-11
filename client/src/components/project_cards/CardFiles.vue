<template>
  <ProjectCard
    :header="$t('files')"
    :icon="'file-earmark-arrow-down'"
    :is_filled="downloadable_files && downloadable_files.length > 0"
  >
    <FilesModule
      :folder_path="project.$path"
      :downloadable_files="downloadable_files"
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
  computed: {
    downloadable_files() {
      return this.project.downloadable_files || [];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
