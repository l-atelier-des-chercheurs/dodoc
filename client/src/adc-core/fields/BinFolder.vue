<template>
  <BaseModal2 :title="modal_title || button_text" @close="$emit('close')">
    <div class="_cont">
      <transition name="fade" mode="out-in">
        <div class="_loader" v-if="is_loading" key="loader">
          <LoaderSpinner />
        </div>
        <div v-else-if="bin_items.length === 0" key="empty">
          <p class="u-instructions">{{ $t("bin_is_empty") }}</p>
        </div>
        <div v-else key="content">
          <div class="_infos">
            <div class="u-metaField">
              <DLabel :str="$t('items_in_bin')" />
              <div>
                {{ bin_items.length }}
              </div>
            </div>
            <SizeDisplay
              v-if="bin_folder_size"
              class="u-spacingBottom"
              :size="bin_folder_size"
            />
          </div>

          <!-- <hr /> -->
          <div class="_items">
            <BinFolderItem
              v-for="bin_item in bin_items"
              :key="bin_item.$path"
              :item="bin_item"
              @restoredSuccessfully="getBinContent"
              @removedSuccessfully="getBinContent"
            >
              <template v-slot="slotProps">
                <slot
                  :project="slotProps.project"
                  :context="slotProps.context"
                  :display_original_space="slotProps.display_original_space"
                  :can_edit="slotProps.can_edit"
                />
              </template>
            </BinFolderItem>
          </div>
        </div>
      </transition>
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
  },
  components: {
    BinFolderItem,
  },
  data() {
    return {
      is_loading: false,
      bin_folder_size: undefined,
      bin_items: [],
    };
  },
  async created() {
    this.is_loading = true;
    await this.getBinContent();
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.is_loading = false;
  },
  methods: {
    async getBinContent() {
      const bin_content = await this.$api
        .getBin({
          path: this.path,
        })
        .catch((err) => {
          console.error(err);
        });

      this.bin_folder_size = bin_content.size;
      this.bin_items = bin_content.items;
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

._loader {
  height: 4rem;
}
._infos {
  display: flex;
  flex-flow: row nowrap;
  // justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing) / 1);
  gap: calc(var(--spacing) / 1);

  > * {
    flex: 1 1 0;
    margin-bottom: 0;
  }
}
._items {
  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
  align-items: stretch;
  gap: calc(var(--spacing) / 1);
}
</style>
