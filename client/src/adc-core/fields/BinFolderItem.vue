<template>
  <BinItem>
    <div class="_projectThumb">
      <div class="_projectThumb--infos">
        <div class="_projectThumb--infos--preview">
          <ProjectPresentation
            :project="folder"
            :context="'tiny'"
            :display_original_space="false"
            :can_edit="false"
          />
        </div>
        <SizeDisplay
          v-if="folder.$infos.size"
          class="u-spacingBottom"
          :size="folder.$infos.size"
        />
        <DateDisplay
          :title="$t('date_created')"
          :date="folder.$date_created"
          :context="'tiny'"
          class="u-spacingBottom"
        />
        <DateDisplay
          :title="$t('date_removed')"
          :date="folder.$date_modified"
          :context="'tiny'"
          class="u-spacingBottom"
        />
      </div>
      <div class="u-sameRow _btns">
        <button
          type="button"
          class="u-button u-button_small u-button_red"
          @click="removeForGood"
        >
          {{ $t("remove_for_good") }}
        </button>
        <button
          type="button"
          class="u-button u-button u-button_bleuvert"
          @click="restoreFolder"
        >
          {{ $t("restore") }}
        </button>
      </div>

      <div v-if="is_loading">
        <LoaderSpinner />
      </div>
    </div>
  </BinItem>
</template>

<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";
import BinItem from "./BinItem.vue";

export default {
  props: {
    folder: Object,
  },
  components: {
    ProjectPresentation,
    BinItem,
  },
  data() {
    return {
      is_loading: false,
    };
  },
  methods: {
    async restoreFolder() {
      this.is_loading = true;
      await this.$api.restoreFromBin({ path: this.folder.$path });
      this.$emit("restoredSuccessfully");
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("restored_success"));

      this.is_loading = false;
    },
    async removeForGood() {
      this.is_loading = true;
      await this.$api.deleteItem({ path: this.folder.$path });
      this.$emit("removedSuccessfully");
      this.is_loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
._projectThumb {
  position: relative;
  box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
    0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
    0 0.9px 1.5px hsla(230, 13%, 9%, 0.025),
    0 3.5px 6px hsla(230, 13%, 9%, 0.09);
}

._projectThumb--infos {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}
._projectThumb--infos--preview {
  width: 100px;
  pointer-events: none;
}
._btns {
  justify-content: space-around;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) / 1);
}
</style>
