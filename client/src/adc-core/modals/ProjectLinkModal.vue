<template>
  <BaseModal2 title="Projet en lien" @close="closeModal">
    <div class="_projectLinkModal">
      <SpaceProjectPicker
        :path="current_linked_project_path"
        @newProjectSelected="onProjectSelected"
      />
      <div v-if="selected_project_path" class="u-spacingTop">
        <div class="u-label">{{ $t("path") }}</div>
        <div class="u-instructions">{{ selected_project_path }}</div>
      </div>
    </div>
    <template #footer>
      <SaveCancelButtons
        :cancel_text="$t('cancel')"
        :save_text="$t('save')"
        @save="linkProject"
        @cancel="closeModal"
      />
    </template>
  </BaseModal2>
</template>
<script>
import SpaceProjectPicker from "@/components/fields/SpaceProjectPicker.vue";

export default {
  props: {
    path: String,
    current_linked_project_path: String,
  },
  components: {
    SpaceProjectPicker,
  },
  data() {
    return {
      selected_project_path: undefined,
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    closeModal() {
      this.$emit("close");
    },
    onProjectSelected(projectPath) {
      this.selected_project_path = projectPath;
    },
    async linkProject() {
      await this.$api.updateMeta({
        path: this.path,
        new_meta: {
          linked_project_path: this.selected_project_path,
        },
      });

      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._projectLinkModal {
  // Add any specific styles if needed
}
</style>
