<template>
  <ProjectCard
    :header="$t('files')"
    :icon="'file-earmark-arrow-down'"
    :has_items="
      downloadable_files.length > 0 ? downloadable_files.length : false
    "
  >
    <FilesModule
      :field_name="'downloadable_files'"
      :path="project.$path"
      :content="downloadable_files"
      :project_path="project.$path"
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
