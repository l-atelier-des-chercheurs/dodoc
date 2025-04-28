<template>
  <BaseModal2 :title="label" :size="modal_width" @close="closeModal">
    <div class="_cont">
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

        <VideoAudioImageQualityPicker
          :media_type="media.$type"
          :media_width="media_width"
          :media_height="media_height"
          :image_width.sync="image_width"
          :image_height.sync="image_height"
          :video_bitrate.sync="video_bitrate"
          :audio_bitrate.sync="audio_bitrate"
        />
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

        <div class="u-spacingBottom" />

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

        <template
          v-if="
            optimized_file.$type === 'image' || optimized_file.$type === 'video'
          "
        >
          <DLabel :str="$t('resolution')" />
          <div class="_comp">
            <span>
              <template
                v-if="media.$infos && media.$infos.width && media.$infos.height"
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
        </template>

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

        <div class="u-spacingBottom" />
      </div>
    </div>

    <!-- <DebugBtn :content="base_instructions" /> -->

    <template slot="footer">
      <div class="_spinner" v-if="is_optimizing" key="loader">
        <AnimatedCounter :value="progress_percent" />
      </div>
      <template v-if="!optimized_file">
        <div />
        <div>
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="optimizeMedia"
          >
            <b-icon icon="tools" />
            {{ $t("preview_new") }}
          </button>
          <div class="u-instructions">
            {{ $t("wont_remove_original") }}
          </div>
        </div>
      </template>
      <template v-else>
        <button type="button" class="u-button u-button_white" @click="cancel">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="keepBoth"
        >
          <b-icon icon="file-plus" />
          {{ $t("save_as_new_media") }}
        </button>
        <button
          type="button"
          class="u-button u-button_red"
          @click="replaceOriginal"
        >
          <b-icon icon="save2-fill" />
          {{ $t("replace_original") }}
        </button>
        <DownloadFile :file="optimized_file" />
      </template>
    </template>
  </BaseModal2>
</template>
<script>
import TrimMedia from "@/adc-core/fields/TrimMedia.vue";
import VideoAudioImageQualityPicker from "@/adc-core/fields/VideoAudioImageQualityPicker.vue";

export default {
  props: {
    media: Object,
  },
  components: {
    TrimMedia,
    VideoAudioImageQualityPicker,
  },
  data() {
    return {
      is_optimizing: false,
      optimized_file: undefined,

      extract_selection: false,
      selection_start: 0,
      selection_end: this.media.$infos?.duration || 0,

      image_width: this.media.$infos?.width,
      image_height: this.media.$infos?.height,
      video_bitrate: 4000,
      audio_bitrate: 256,

      progress_percent: 0,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
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
    media_width() {
      return this.media.$infos?.width;
    },
    media_height() {
      return this.media.$infos?.height;
    },
    base_instructions() {
      let suggested_file_name = "converted";

      if (this.media.$media_filename)
        suggested_file_name = this.getFilenameWithoutExt(
          this.media.$media_filename
        );

      const instructions = {
        recipe: "optimize_media",
        suggested_file_name,

        image_width: this.image_width,
        image_height: this.image_height,
        video_bitrate: this.video_bitrate,
        audio_bitrate: this.audio_bitrate,

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

      return instructions;
    },
  },
  methods: {
    async optimizeMedia() {
      this.progress_percent = 0;
      this.is_optimizing = true;

      const current_task_id = await this.$api.optimizeFile({
        path: this.media.$path,
        instructions: this.base_instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });

      const updateProgress = ({ task_id, progress }) => {
        if (task_id !== current_task_id) return;
        this.progress_percent = progress;
      };
      this.$eventHub.$on("task.status", updateProgress);

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.is_optimizing = false;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (message.event === "completed") {
          this.progress_percent = 100;
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
      this.closeModal();
    },
    async removeOptimizedFile() {
      if (!this.optimized_file?.$path) return;
      await this.$api.deleteItem({
        path: this.optimized_file.$path,
      });
    },
    keepBoth() {
      this.$emit("close");
    },
    closeModal() {
      this.removeOptimizedFile();
      this.$emit("close");
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
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
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

._spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
