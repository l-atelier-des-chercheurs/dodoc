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
          <div v-for="bin_folder in bin_folders" :key="bin_folder.slug">
            <!-- {{ bin_folder.title }} – {{ bin_folder.$path }} -->

            <div class="_projectThumb">
              <div class="_projectThumb--infos">
                <div class="_projectThumb--infos--preview">
                  <ProjectPresentation
                    :project="bin_folder"
                    :context="'tiny'"
                    :display_original_space="false"
                    :can_edit="false"
                  />
                </div>
                <SizeDisplay
                  v-if="bin_folder.$infos.size"
                  class="u-spacingBottom"
                  :size="bin_folder.$infos.size"
                />
                <DateDisplay
                  :title="$t('date_created')"
                  :date="bin_folder.$date_created"
                  :context="'tiny'"
                  class="u-spacingBottom"
                />
                <DateDisplay
                  :title="$t('date_removed')"
                  :date="bin_folder.$date_modified"
                  :context="'tiny'"
                  class="u-spacingBottom"
                />
              </div>
              <div class="u-sameRow _btns">
                <button
                  type="button"
                  class="u-button u-button u-button_bleuvert"
                  @click="restoreFolder(bin_folder.$path)"
                >
                  {{ $t("restore") }}
                </button>
                <button
                  type="button"
                  class="u-button u-button_small u-button_red"
                  @click="removeForGood(bin_folder.$path)"
                >
                  {{ $t("remove_for_good") }}
                </button>
              </div>

              <div v-if="is_loading">
                <LoaderSpinner />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </BaseModal2>
</template>
<script>
import ProjectPresentation from "@/components/ProjectPresentation.vue";

export default {
  props: {
    button_text: String,
    modal_title: String,
    path: String,
    subfolders_type: String,
  },
  components: {
    ProjectPresentation,
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
    async restoreFolder(path) {
      this.is_loading = true;
      await this.$api.restoreFromBin({ path });
      await new Promise((resolve) => setTimeout(resolve, 200));
      this.getBinContent();
      this.is_loading = false;
    },
    async removeForGood(path) {
      this.is_loading = true;
      await this.$api.deleteItem({ path });
      await new Promise((resolve) => setTimeout(resolve, 200));
      this.getBinContent();
      this.is_loading = false;
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

._projectThumb {
  // border: 2px solid var(--c-gris);
  // background-color: var(--c-gris_clair);
  // border-radius: var(--border-radius);
  // padding: calc(var(--spacing) / 2);
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
._restoreProjectBtn {
}
._btns {
  justify-content: space-around;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) / 1);
}
</style>
