<template>
  <BaseModal2 :title="label" :size="modal_width" @close="closeModal">
    <div class="_cont">
      <div v-if="media.$optimized === true" class="u-spacingBottom">
        {{ $t("already_optimized") }}
      </div>
      <div v-if="optimization_strongly_recommended" class="u-spacingBottom">
        {{ $t("convert_to_format") }}
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

    <!-- <DebugBtn :content="base_instructions" /> -->

    <template slot="footer">
      <div />
      <div>
        <button
          type="button"
          class="u-button u-button_bleuvert"
          @click="startOptimization"
        >
          <b-icon icon="tools" />
          {{ $t("preview_new") }}
        </button>
        <div class="u-instructions _wontremove">
          {{ $t("wont_remove_original") }}
        </div>
      </div>
    </template>

    <OptimizeMediaModal
      v-if="show_optimization_modal"
      :media="media"
      :instructions="base_instructions"
      @close="show_optimization_modal = false"
    />
  </BaseModal2>
</template>
<script>
import TrimMedia from "@/adc-core/fields/TrimMedia.vue";
import VideoAudioImageQualityPicker from "@/adc-core/fields/VideoAudioImageQualityPicker.vue";
import OptimizeMediaModal from "@/adc-core/modals/OptimizeMediaModal.vue";

export default {
  props: {
    media: Object,
  },
  components: {
    TrimMedia,
    VideoAudioImageQualityPicker,
    OptimizeMediaModal,
  },
  data() {
    return {
      show_optimization_modal: false,

      extract_selection: false,
      selection_start: 0,
      selection_end: this.media.$infos?.duration || 0,

      image_width: this.media.$infos?.width,
      image_height: this.media.$infos?.height,
      video_bitrate: 4000,
      audio_bitrate: 256,
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
    optimization_strongly_recommended() {
      return this.fileShouldBeOptimized({
        filename: this.media.$media_filename,
      });
    },
    modal_width() {
      if (this.extract_selection) return "large";
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
    startOptimization() {
      this.show_optimization_modal = true;
    },
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._cont {
  position: relative;
}

._wontremove {
  text-align: center;
  text-transform: lowercase;
  font-size: var(--sl-font-size-small);
}
</style>
