<template>
  <DetailsPane
    v-if="can_edit || has_items"
    :header="$t('files')"
    :icon="'file-earmark-arrow-down'"
    :has_items="has_items"
  >
    <FilesModule
      :field_name="'downloadable_files'"
      :path="project.$path"
      :content="downloadable_files"
      :project_path="project.$path"
      :can_edit="can_edit"
    />
  </DetailsPane>
</template>
<script>
export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {},
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
    existing_files_count() {
      // ignore references to medias that were removed from the project
      return this.downloadable_files.filter((meta_filename) =>
        this.getMediaInFolder({
          folder_path: this.project.$path,
          meta_filename,
        })
      ).length;
    },
    has_items() {
      return this.existing_files_count > 0 ? this.existing_files_count : false;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
