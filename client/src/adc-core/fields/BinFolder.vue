<template>
  <BaseModal2
    :title="modal_title || button_text || $t('download')"
    @close="$emit('close')"
  >
    <div class="_cont">
      <div v-if="bin_folders.length === 0">
        <p class="u-instructions">{{ $t("bin_is_empty") }}</p>
      </div>
      <template v-else>
        <SizeDisplay
          v-if="bin_folder_size"
          class="u-spacingBottom"
          :size="bin_folder_size"
        />

        <div class="_projects">
          <BinFolderItem
            v-for="bin_folder in bin_folders"
            :key="bin_folder.slug"
            :folder="bin_folder"
            @restoredSuccessfully="getBinContent"
            @removedSuccessfully="getBinContent"
          />
        </div>
      </template>
    </div>
  </BaseModal2>
</template>
<script>
import BinFolderItem from "./BinFolderItem.vue";

export default {
  props: {
    button_text: String,
    modal_title: String,
    path: String,
    subfolders_type: String,
  },
  components: {
    BinFolderItem,
  },
  data() {
    return {
      bin_folder_size: undefined,
      bin_folders: [],
    };
  },
  created() {
    this.getBinContent();
  },
  methods: {
    async getBinContent() {
      const bin_content = await this.$api
        .getBin({
          path: `${this.path}/${this.subfolders_type}`,
        })
        .catch((err) => {
          console.error(err);
        });

      this.bin_folder_size = bin_content.size;
      this.bin_folders = bin_content.folders;
    },
    // async emptyBin(path) {
    //   await this.$api.emptyBin({ path });
    //   this.getFolderSize();
    // },
  },
};
</script>

<style lang="scss" scoped>
._cont {
  position: relative;
}
._projects {
  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
  align-items: stretch;
  gap: calc(var(--spacing) / 1);
}
</style>
