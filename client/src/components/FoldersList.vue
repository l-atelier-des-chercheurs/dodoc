<template>
  <div class="_foldersList">
    <div
      v-if="folders.length === 0"
      class="u-instructions _noFolders"
      :key="'nofolders'"
    >
      {{ empty_message || $t("no_projects") }}
    </div>
    <template v-else>
      <PinnedNonpinnedFolder
        :field_name="pin_field_name"
        :label="pin_label"
        :content="pinned_folders"
        :path="path"
        :folders="folders"
        :can_edit="can_edit"
        :direction="['medium', 'tiny'].includes(view_mode) ? 'grid' : 'list'"
        :view_mode="view_mode"
        v-slot="slotProps"
      >
        <slot :item="slotProps.item" />
      </PinnedNonpinnedFolder>
    </template>
  </div>
</template>
<script>
import PinnedNonpinnedFolder from "@/adc-core/ui/PinnedNonpinnedFolder.vue";

export default {
  props: {
    folders: Array,
    pinned_folders: {
      type: Array,
      default: () => [],
    },
    path: String,
    can_edit: Boolean,
    pin_field_name: {
      type: String,
      default: "projects_pinned",
    },
    pin_label: {
      type: String,
      default: "Pinned",
    },
    empty_message: String,
    view_mode: {
      type: String,
      default: "list",
    },
  },
  components: {
    PinnedNonpinnedFolder,
  },
};
</script>
<style lang="scss" scoped>
._noFolders {
  margin: calc(var(--spacing) / 1) 0 calc(var(--spacing) / 2);
  text-align: left;
}
</style>
