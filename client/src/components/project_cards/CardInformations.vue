<template>
  <DetailsPane
    v-if="can_edit"
    :header="$t('metadatas')"
    :icon="'rulers'"
    :has_items="false"
  >
    <DateDisplay :title="$t('date_created')" :date="project.$date_created" />
    <DateDisplay :title="$t('date_modified')" :date="project.$date_modified" />
    <ShowFolderSize :path="project.$path" />

    <div class="" v-if="$root.app_infos.is_electron && is_instance_admin">
      <DLabel :str="$t('open_in_finder')" />
      <button
        type="button"
        class="u-button u-button_bleumarine u-button_small"
        @click="openInFinder({ path: project.$path })"
        v-html="project_path_wrappable"
      />
    </div>

    <!-- <br />
    <DLabel :str="$t('latest_changes_to_project')" />
    <div class="u-instructions">
      <small>
        {{ $t("waiting") }}
      </small>
    </div> -->
  </DetailsPane>
</template>
<script>
import ShowFolderSize from "@/adc-core/ui/ShowFolderSize.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {
    ShowFolderSize,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    project_path_wrappable() {
      return this.project.$path.replaceAll("/", "/<wbr>");
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
