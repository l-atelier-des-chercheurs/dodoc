<template>
  <div>
    <button
      type="button"
      class="u-button u-button_orange"
      @click="show_modal = true"
    >
      <b-icon :icon="'file-play-fill'" />
      {{ label }}
    </button>
    <div v-if="instructions" class="u-instructions">
      <small v-html="instructions" />
    </div>

    <BaseModal2
      v-if="show_modal"
      :title="label"
      :size="modal_width"
      @close="closeModal"
    >
      <div class="_cont">
        <LoaderSpinner v-if="is_optimizing" class="_loader" />
        <div v-if="!optimized_file">
          <div
            v-if="media.$optimized === true"
            class="u-spacingBottom u-instructions"
          >
            {{ $t("already_optimized") }}
          </div>

          <div v-if="['video', 'audio'].includes(media.$type)">
            <TrimMedia
              :media="media"
              :extract_selection.sync="extract_selection"
              :selection_start.sync="selection_start"
              :selection_end.sync="selection_end"
            />
            <div class="u-spacingBottom" />
          </div>

          <template v-if="['image', 'video'].includes(media.$type)">
            <ToggledSection
              :label="$t('enable_image')"
              :show_toggle.sync="enable_video"
              :can_toggle="true"
            >
              <DLabel :str="$t('image_quality')" />
              <div class="">
                <SelectField2
                  :value="resolution_preset_picked"
                  :options="presets"
                  :can_edit="true"
                  :hide_validation="true"
                  @change="resolution_preset_picked = $event"
                />
              </div>
              <div v-if="resolution_preset_picked === 'custom'">
                <div class="u-spacingBottom" />
                <CustomResolutionInput
                  :width.sync="custom_resolution_width"
                  :height.sync="custom_resolution_height"
                  :ratio="media_ratio"
                  :is_video="is_video"
                />
                <div class="u-spacingBottom" />
                <NumberInput
                  :label="$t('bitrate')"
                  :instructions="$t('bitrate_instructions')"
                  :value.sync="custom_bitrate"
                  :min="0"
                  :suffix="'kbps'"
                  :size="'normal'"
                />
              </div>
            </ToggledSection>
            <div class="u-spacingBottom" />
          </template>

          <div v-if="['video', 'audio'].includes(media.$type)" class="">
            <ToggledSection
              :label="$t('enable_sound')"
              :show_toggle.sync="enable_audio"
            >
              <DLabel :str="$t('audio_quality')" />
              <SelectField2
                :value="audio_quality_picked"
                :options="audio_quality_options"
                :can_edit="true"
                :hide_validation="true"
                @change="audio_quality_picked = $event"
              />
            </ToggledSection>
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

      <div slot="footer" class="">
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
            <DownloadFile :file="optimized_file" />
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
      audio_quality_picked: "source",

      extract_selection: false,
      selection_start: 0,
      selection_end: this.media.$infos?.duration || 0,
      custom_resolution_width: this.media.$infos?.width || 1920,
      custom_resolution_height: this.media.$infos?.height || 1080,
      custom_bitrate: 4000,

      enable_audio: true,
      enable_video: true,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    media_ratio() {
      return this.media.$infos?.ratio;
    },
    is_video() {
      return this.media.$type === "video";
    },
    label() {
      if (["video", "audio"].includes(this.media.$type))
        return this.$t("convert_shorten");
      return this.$t("optimize_resize");
    },
    instructions() {
      if (["video", "audio"].includes(this.media.$type))
        return this.$t("convert_shorten_instructions");
      if (this.media.$type === "image")
        return this.$t("optimize_resize_instructions");
      return this.$t("convert_instructions");
    },
    modal_width() {
      if (this.optimized_file || this.extract_selection) return "large";
      return undefined;
    },
    presets() {
      // todo refactor using ExportSaveMakeModal2 as a reference
      if (this.media.$type === "audio")
        return [
          {
            key: "source",
            text: this.$t("close_to_source"),
            instructions: this.$t("bitrate_kbps", { bitrate: "256" }),
          },
          {
            key: "high",
            text: this.$t("high"),
            instructions: this.$t("bitrate_kbps", { bitrate: "192" }),
          },
          {
            key: "medium",
            text: this.$t("medium"),
            instructions: this.$t("bitrate_kbps", { bitrate: "128" }),
          },
        ];
      if (this.media.$type === "video") {
        const presets = [];
        presets.push({
          key: "source",
          text: this.$t("close_to_source"),
          width: this.media.$infos?.width,
          height: this.media.$infos?.height,
          bitrate: 4000,
        });
        presets.push({
          key: "high",
          text: this.$t("high"),
          width: 1920,
          height: 1080,
          bitrate: 4000,
        });
        presets.push({
          key: "medium",
          text: this.$t("medium"),
          width: 1280,
          height: 720,
          bitrate: 2000,
        });
        presets.push({
          key: "rough",
          text: this.$t("rough"),
          width: 640,
          height: 360,
          bitrate: 1000,
        });
        presets.push({
          key: "custom",
          text: "↓ " + this.$t("custom_f"),
        });

        return presets.map((p) => {
          if (p.key !== "custom") {
            p.instructions =
              this.$t("resolution_w_h", { width: p.width, height: p.height }) +
              ", " +
              this.$t("bitrate_kbps", { bitrate: p.bitrate }).toLowerCase();
          }
          return p;
        });
      }
      return [
        {
          key: "source",
          text: this.$t("close_to_source"),
        },
        {
          key: "high",
          text: this.$t("high"),
          instructions: this.$t("resolution_on_largest_side", {
            resolution: 1920,
          }),
        },
        {
          key: "medium",
          text: this.$t("medium"),
          instructions: this.$t("resolution_on_largest_side", {
            resolution: 1280,
          }),
        },
        {
          key: "custom",
          text: "↓ " + this.$t("custom_f"),
        },
      ];
    },
    audio_quality_options() {
      let presets = [
        {
          key: "source",
          text: this.$t("very_high"),
          instructions: this.$t("bitrate", { bitrate: "256" }),
        },
        {
          key: "high",
          text: this.$t("high"),
          instructions: this.$t("bitrate", { bitrate: "192" }),
        },
        {
          key: "medium",
          text: this.$t("medium"),
          instructions: this.$t("bitrate", { bitrate: "128" }),
        },
      ];
      return presets;
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

      let image_quality_preset;
      if (this.resolution_preset_picked === "custom") {
        image_quality_preset = {
          width: this.custom_resolution_width,
          height: this.custom_resolution_height,
          bitrate: this.custom_bitrate,
        };
      } else {
        image_quality_preset = this.resolution_preset_picked;
      }

      let audio_quality_preset;
      if (this.enable_audio) audio_quality_preset = this.audio_quality_picked;
      else audio_quality_preset = "no_audio";

      const instructions = {
        recipe: "optimize_media",
        suggested_file_name,
        image_quality_preset,
        audio_quality_preset,
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
      this.removeOptimizedFile();
    },
    async removeOptimizedFile() {
      if (!this.optimized_file?.$path) return;
      await this.$api.deleteItem({
        path: this.optimized_file.$path,
      });
      this.optimized_file = undefined;
    },
    keepBoth() {
      this.show_modal = false;
      this.optimized_file = undefined;
    },
    closeModal() {
      this.removeOptimizedFile();
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

      this.optimized_file = undefined;
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
    ::v-deep video {
      max-height: 50vh;
    }
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
      background-color: var(--c-gris_clair);
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

._loader {
  z-index: 150;
}

._saveLocal {
  text-align: right;
}
</style>
