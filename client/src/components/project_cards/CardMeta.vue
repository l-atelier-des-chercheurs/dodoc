<template>
  <DetailsPane
    :header="$t('informations')"
    :icon="'info-square'"
    :is_open_initially="true"
    :can_be_toggled="false"
  >
    <EventField
      class="u-spacingBottom"
      v-if="$root.app_infos.instance_meta.enable_events"
      :project="project"
      :can_edit="can_edit"
    />

    <RemixField
      class="u-spacingBottom"
      :project="project"
      :can_edit="can_edit"
    />

    <div class="u-spacingBottom">
      <DateDisplay :title="$t('date_created')" :date="project.$date_created" />
      <DateDisplay
        :title="$t('date_modified')"
        :date="project.$date_modified"
      />
    </div>

    <div class="" v-if="$root.app_infos.is_electron && is_instance_admin">
      <div class="u-spacingBottom" />
      <DLabel :str="$t('open_in_finder')" />
      <button
        type="button"
        class="u-button u-button_bleumarine u-button_small"
        @click="openInFinder(project.$path)"
        v-html="project_path_wrappable"
      />
    </div>
  </DetailsPane>
</template>
<script>
import EventField from "@/components/project/EventField.vue";
import RemixField from "@/components/project/RemixField.vue";

export default {
  props: {
    project: Object,
    can_edit: Boolean,
  },
  components: {
    EventField,
    RemixField,
  },
  data() {
    return {
      show_dup_modal: false,
    };
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
  methods: {
    openInFinder(path) {
      window.electronAPI.send("toMain", {
        type: "open_path",
        path,
      });
    },
  },
};
</script>
<style lang="scss" scoped></style>
