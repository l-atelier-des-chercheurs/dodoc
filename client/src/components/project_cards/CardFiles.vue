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
    has_items() {
      return this.downloadable_files.length > 0
        ? this.downloadable_files.length
        : false;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
