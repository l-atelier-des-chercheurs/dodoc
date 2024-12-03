<template>
  <div>
    <button
      type="button"
      class="u-button u-button_orange"
      @click="show_modal = true"
    >
      <b-icon :icon="'tools'" />
      <template v-if="['video', 'audio'].includes(media.$type)">
        {{ $t("convert_shorten") }}
      </template>
      <template v-else-if="media.$type === 'image'">
        {{ $t("optimize") }}
      </template>
    </button>

    <BaseModal2
      v-if="show_modal"
      :title="$t('convert_shorten')"
      :size="modal_width"
      @close="show_modal = false"
    >
      <div class="_cont">
        <LoaderSpinner v-if="is_optimizing" class="_loader" />
        <div v-if="!optimized_file">
          <template v-if="['video', 'audio'].includes(media.$type)">
            <TrimMedia
              :media="media"
              :extract_selection.sync="extract_selection"
              :selection_start.sync="selection_start"
              :selection_end.sync="selection_end"
            />
          </template>

          <div class="">
            <DLabel :str="$t('quality')" />
            <div
              v-if="media.$optimized === true"
              class="u-spacingBottom u-instructions"
            >
              {{ $t("already_optimized") }}
            </div>
            <div class="">
              <SelectField2
                :value="resolution_preset_picked"
                :options="presets"
                :can_edit="true"
                :hide_validation="true"
                @change="resolution_preset_picked = $event"
              />
            </div>
          </div>
        </div>
        <div v-else>
          <div
            class="u-spacingBottom _mediaPreview"
            :data-type="optimized_file.$type"
          >
            <MediaContent
              :file="optimized_file"
              :resolution="1600"
              :context="'full'"
              :zoom_on_click="true"
              :show_fs_button="true"
            />
          </div>
          <!-- <div class="u-spacingBottom">
            <DLabel :str="$t('filename')" />
            <div class="_comp">
              <span>
                {{ media.$media_filename }}
              </span>
              <b-icon icon="arrow-right-circle" />
              <strong>
                {{ optimized_file.$media_filename }}
              </strong>
            </div>
          </div> -->
          <div class="u-spacingBottom">
            <DLabel :str="$t('size')" />
            <div class="_comp">
              <span>
                <template v-if="media.$infos && media.$infos.size">
                  {{ formatBytes(media.$infos.size) }}
                </template>
                <template v-else> ? </template>
              </span>
              <b-icon icon="arrow-right-circle" />
              <strong>
                <template
                  v-if="optimized_file.$infos && optimized_file.$infos.size"
                >
                  {{ formatBytes(optimized_file.$infos.size) }}
                </template>
                <template v-else> ? </template>
              </strong>
            </div>
          </div>
          <div
            class="u-spacingBottom"
            v-if="
              optimized_file.$type === 'image' ||
              optimized_file.$type === 'video'
            "
          >
            <DLabel :str="$t('resolution')" />
            <div class="_comp">
              <span>
                <template
                  v-if="
                    media.$infos && media.$infos.width && media.$infos.height
                  "
                >
                  {{ media.$infos.width + " × " + media.$infos.height }}
                </template>
                <template v-else> ? </template>
              </span>
              <b-icon icon="arrow-right-circle" />
              <strong>
                <template
                  v-if="
                    optimized_file.$infos &&
                    optimized_file.$infos.width &&
                    optimized_file.$infos.height
                  "
                >
                  {{
                    optimized_file.$infos.width +
                    " × " +
                    optimized_file.$infos.height
                  }}
                </template>
                <template v-else> ? </template>
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div slot="footer" class="_convertBtns">
        <template v-if="!optimized_file">
          <div>
            <div>
              <button
                type="button"
                class="u-button u-button_bleuvert"
                @click="optimizeMedia"
              >
                <b-icon icon="tools" />
                {{ $t("preview_new") }}
              </button>
            </div>
            <div class="u-instructions">
              {{ $t("wont_remove_original") }}
            </div>
          </div>
        </template>
        <template v-else>
          <div class="_saveLocal">
            <DownloadFile :file="optimized_file">
              <b-icon icon="file-earmark-arrow-down" />
              {{ $t("download") }}
            </DownloadFile>
          </div>

          <div class="_btnRow">
            <button
              type="button"
              class="u-button u-button_white"
              @click="cancel"
            >
              <b-icon icon="arrow-left-short" />
              {{ $t("back") }}
            </button>
            <button
              type="button"
              class="u-button u-button_bleuvert"
              @click="keepBoth"
            >
              <b-icon icon="file-plus" />
              {{ $t("add_optimized_to_lib") }}
            </button>
            <button
              type="button"
              class="u-button u-button_red"
              @click="replaceOriginal"
            >
              <b-icon icon="save2-fill" />
              {{ $t("replace_original") }}
            </button>
          </div>
        </template>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
import TrimMedia from "@/adc-core/fields/TrimMedia.vue";

export default {
  props: {
    media: Object,
  },
  components: {
    TrimMedia,
  },
  data() {
    return {
      show_modal: false,
      is_optimizing: false,
      optimized_file: undefined,
      resolution_preset_picked: "source",

      extract_selection: false,
      selection_start: 0,
      selection_end: this.media.$infos?.duration || 0,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    show_modal() {
      if (!this.show_modal) {
        this.optimized_file = "";
      }
    },
  },
  computed: {
    modal_width() {
      if (this.optimized_file || this.extract_selection) return "large";
      return undefined;
    },
    presets() {
      if (this.media.$type === "audio")
        return [
          {
            key: "source",
            text: this.$t("close_to_source"),
            instructions: "256k",
          },
          {
            key: "high",
            text: this.$t("high"),
            instructions: "192k",
          },
          {
            key: "medium",
            text: this.$t("medium"),
            instructions: "128k",
          },
        ];
      return [
        {
          key: "source",
          text: this.$t("close_to_source"),
        },
        {
          key: "high",
          text: this.$t("high"),
        },
        {
          key: "medium",
          text: this.$t("medium"),
        },
      ];
    },
  },
  methods: {
    async optimizeMedia() {
      this.is_optimizing = true;

      let suggested_file_name = "converted";
      if (this.media.$media_filename)
        suggested_file_name = this.getFilenameWithoutExt(
          this.media.$media_filename
        );

      const instructions = {
        recipe: "optimize_media",
        suggested_file_name,
        quality_preset: this.resolution_preset_picked,
        base_media_path: this.makeMediaFilePath({
          $path: this.media.$path,
          $media_filename: this.media.$media_filename,
        }),
        additional_meta: {
          $origin: "collect",
          $optimized: true,
        },
      };

      if (this.extract_selection) {
        instructions.trim_start = this.selection_start;
        instructions.trim_end = this.selection_end;
      }

      const current_task_id = await this.$api.optimizeFile({
        path: this.media.$path,
        instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.is_optimizing = false;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (message.event === "completed") {
          message.file;
          this.optimized_file = message.file;
        } else if (message.event === "aborted") {
          //
        } else if (message.event === "failed") {
          this.$alertify.delay(4000).error(message.event);
          //
        }
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
    async cancel() {
      await this.$api.deleteItem({
        path: this.optimized_file.$path,
      });
      this.optimized_file = undefined;
      // this.show_modal = false;
    },
    keepBoth() {
      this.show_modal = false;
    },
    async replaceOriginal() {
      const old_source_file = this.media.$media_filename;
      const new_source_file = this.optimized_file.$media_filename;

      // set original media to new source file
      await this.$api.updateMeta({
        path: this.media.$path,
        new_meta: {
          $media_filename: new_source_file,
          $type: this.optimized_file.$type,
          $optimized: true,
        },
      });

      // CLEAN UP
      // set optimized media to old source file
      await this.$api.updateMeta({
        path: this.optimized_file.$path,
        new_meta: {
          $media_filename: old_source_file,
        },
      });
      // remove optimized media
      await this.$api.deleteItem({
        path: this.optimized_file.$path,
      });

      this.show_modal = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._btnRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) / 2);
}

._mediaPreview {
  &[data-type="image"] {
    aspect-ratio: 1/1;
  }
  &[data-type="video"] {
    max-height: 50vh;
    // aspect-ratio: 16/9;
  }
  ::v-deep {
    ._mediaContent {
      height: 100%;
    }
    ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: scale-down;
      max-width: none;
      background-color: var(--c-gris);
      border-radius: 2px;
    }
  }
}

._cont {
  position: relative;
}
._comp {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}

._convertBtns {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  // justify-content: space-between;
  // justify-content: flex-end;
  // gap: calc(var(--spacing) / 1);
}

._loader {
  z-index: 150;
}

._saveLocal {
  text-align: right;
}
</style>
