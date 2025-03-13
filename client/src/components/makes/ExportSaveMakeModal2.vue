<template>
  <BaseModal2 :title="$t('make')" @close="removeAndCloseModal">
    <div class="_cont">
      <template v-if="!created_video">
        <div class="u-spacingBottom" v-if="possible_formats">
          <DLabel :str="$t('format')" />
          <SelectField2
            :value="output_format"
            :options="possible_formats"
            :can_edit="true"
            :hide_validation="true"
            @change="output_format = $event"
          />
        </div>

        <div>
          <DLabel :str="$t('quality')" />
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
              :ratio="ref_infos.ratio"
              :is_video="true"
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
        </div>
        <div v-if="allow_disable_audio">
          <div class="u-spacingBottom" />
          <ToggleInput
            :content.sync="keep_audio_track"
            :label="$t('keep_audio_track')"
          />
        </div>
      </template>
      <template v-else>
        <div class="_preview">
          <MediaContent
            :file="created_video"
            :resolution="1600"
            :show_fs_button="true"
            :context="'full'"
          />
          <div class="u-spacingBottom" />
          <ShowExportedFileInfos :file="created_video" />
        </div>
      </template>
    </div>

    <template slot="footer">
      <template v-if="!created_video && !is_exporting">
        <div />
        <div>
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="renderVideo"
          >
            <b-icon icon="tools" />
            {{ $t("preview_new") }}
          </button>
          <div class="u-instructions">
            {{ $t("wont_remove_original").toLowerCase() }}
          </div>
        </div>
      </template>
      <template v-else-if="is_exporting">
        <div class="_spinner" key="loader">
          <AnimatedCounter :value="progress_percent" />
        </div>
      </template>
      <div class="_bottomBtns" v-else>
        <button type="button" class="u-button" @click="cancelExport">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>

        <div class="_rightRow">
          <a
            :disabled="!export_href"
            :download="export_name"
            :href="export_href"
            target="_blank"
            class="u-buttonLink"
          >
            {{ $t("download") }}
          </a>
          <button
            type="button"
            class="u-button u-button_orange"
            @click="saveToProject"
          >
            <span class="u-icon" v-html="dodoc_icon_collect" />
            {{ $t("save_to_project") }}
          </button>
        </div>
      </div>
    </template>
  </BaseModal2>
</template>
<script>
import ShowExportedFileInfos from "@/components/fields/ShowExportedFileInfos.vue";

export default {
  props: {
    base_instructions: Object,
    make_path: String,
    reference_media: Object,
    possible_formats: Array,
    allow_disable_audio: Boolean,
    default_resolution_preset: {
      type: String,
      default: "source",
    },
  },
  components: {
    ShowExportedFileInfos,
  },
  data() {
    return {
      is_exporting: false,
      created_video: false,

      resolution_preset_picked: this.default_resolution_preset,
      progress_percent: 0,

      output_format: "mp4",

      custom_resolution_width: 1920,
      custom_resolution_height: 1080,
      custom_bitrate: 4000,

      keep_audio_track: true,
    };
  },
  created() {},
  mounted() {
    if (this.reference_media) {
      this.custom_resolution_width = this.ref_infos.width;
      this.custom_resolution_height = this.ref_infos.height;
    }
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    export_href() {
      if (!this.created_video) return "";
      return this.makeMediaFileURL({
        $path: this.created_video.$path,
        $media_filename: this.created_video.$media_filename,
      });
    },
    export_name() {
      if (!this.created_video) return "";
      return this.created_video.$media_filename;
    },
    ref_infos() {
      if (!this.reference_media) return {};
      let { width, height, ratio } = this.reference_media.$infos;
      if (width) width = Math.ceil(width / 2) * 2;
      if (height) height = Math.ceil(height / 2) * 2;
      return { width, height, ratio };
    },
    presets() {
      const presets = [];
      presets.push({
        key: "source",
        text: this.$t("close_to_source"),
        width: this.ref_infos.width,
        height: this.ref_infos.height,
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
    },
  },
  methods: {
    async renderVideo() {
      this.progress_percent = 0;
      this.is_exporting = true;
      this.created_video = false;

      let instructions = Object.assign({}, this.base_instructions);

      const additional_meta = {};
      additional_meta.$origin = "make";
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      let output_width = 1920,
        output_height = 1080,
        video_bitrate = 4000;
      if (this.resolution_preset_picked === "custom") {
        output_width = this.custom_resolution_width;
        output_height = this.custom_resolution_height;
        video_bitrate = this.custom_bitrate;
      } else {
        const selected_preset = this.presets.find(
          (p) => p.key === this.resolution_preset_picked
        );
        output_width = selected_preset.width;
        output_height = selected_preset.height;
        video_bitrate = selected_preset.bitrate;
      }

      if (this.possible_formats)
        instructions.output_format = this.output_format;

      if (this.allow_disable_audio) {
        instructions.keep_audio_track = this.keep_audio_track;
      }

      const current_task_id = await this.$api.exportFolder({
        path: this.make_path,
        instructions: {
          ...instructions,
          output_width,
          output_height,
          video_bitrate,
          additional_meta,
        },
      });

      this.$api.join({ room: "task_" + current_task_id });

      const updateProgress = ({ task_id, progress }) => {
        if (task_id !== current_task_id) return;
        this.progress_percent = progress;
      };
      this.$eventHub.$on("task.status", updateProgress);

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (message.event === "completed") {
          this.created_video = message.file;

          //
          this.$nextTick(() => {
            const video = this.$el.querySelector("video");
            if (video) video.volume = 1;
          });
        } else if (message.event === "aborted") {
          //
        } else if (message.event === "failed") {
          message.info;
        }

        this.progress_percent = 100;
        this.is_exporting = false;
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
    cancelExport() {
      if (this.created_video)
        this.$api.deleteItem({ path: this.created_video.$path });
      this.created_video = false;
    },
    removeAndCloseModal() {
      if (this.created_video)
        this.$api.deleteItem({ path: this.created_video.$path });
      this.$emit("close");
    },
    async saveToProject() {
      this.$eventHub.$emit("pane.animate", "collect");
      this.$alertify
        .closeLogOnClick(true)
        .delay(4000)
        .success(this.$t("media_was_saved_to_project"));
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._cont {
}

._saveNotice {
  position: absolute;
  inset: -2px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
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

._preview {
  // margin: calc(var(--spacing) * 1) 0;
}
._bottomBtns {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: calc(var(--spacing) / 2);
}
._rightRow {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-end;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
</style>
