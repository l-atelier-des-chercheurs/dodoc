<template>
  <div class="_mixAudioAndImage">
    <div class="_topRow">
      <div class="_videoOrImage">
        <SingleBaseMediaPicker
          v-if="make.type === 'mix_audio_and_image'"
          :title="$t('pick_image')"
          :context="'full'"
          :field_name="'base_image_filename'"
          :content="make.base_image_filename"
          :path="make.$path"
          :media_type_to_pick="'image'"
        />
        <SingleBaseMediaPicker
          v-else-if="make.type === 'mix_audio_and_video'"
          :title="$t('pick_video')"
          :context="'full'"
          :field_name="'base_video_filename'"
          :content="make.base_video_filename"
          :path="make.$path"
          :media_type_to_pick="'video'"
          @videoPaused="videoWasPaused"
          @videoEnded="videoWasEnded"
        />
      </div>
      <div class="_equationIcon">
        <b-icon icon="plus-circle-dotted" />
      </div>

      <div class="_audioMedia">
        <template v-if="make.base_audio_filename">
          <MediaContent
            v-if="selected_audio_media"
            ref="audioMedia"
            :file="selected_audio_media"
            :resolution="440"
            :context="'full'"
          />
          <span v-else>
            {{ $t("media_not_found") }}
          </span>
          <button
            type="button"
            class="u-button u-button_small u-button_red"
            @click="setAudioMetaFilename('')"
          >
            <b-icon icon="arrow-left-right" />
            {{ $t("change") }}
          </button>
        </template>
        <template v-else>
          <template v-if="!record_audio_live">
            <SingleBaseMediaPicker
              :title="$t('pick_audio')"
              :context="'full'"
              :field_name="'base_audio_filename'"
              :content="make.base_audio_filename"
              :path="make.$path"
              :media_type_to_pick="'audio'"
            />
            {{ $t("or") }}
            <div class="_resourcesPickerBtn">
              <button
                type="button"
                class="u-button u-button_orange"
                @click="show_resources_picker = true"
              >
                <b-icon icon="collection" />
                {{ $t("resources") }}
              </button>
            </div>
            {{ $t("or") }}
            <div class="_liveDubbingBtn">
              <button
                type="button"
                class="u-button u-button_red"
                @click="record_audio_live = true"
              >
                <b-icon icon="record-circle-fill" />
                {{ $t("live_dubbing") }}
              </button>
            </div>
            <!-- {{ $t("or") }}
            <button
              type="button"
              class="u-button u-button_red"
              @click="setNoAudio"
            >
              <b-icon icon="record-circle-fill" />
              {{ $t("no_sound") }}
            </button> -->
          </template>
          <div class="_recordAudioLive" v-else>
            <button
              type="button"
              class="u-button u-button_red u-button_small"
              @click="record_audio_live = false"
            >
              <b-icon icon="x-circle" />
              {{ $t("cancel") }}
            </button>

            <div class="_captureView">
              <CaptureView
                :path="project_path"
                :selected_mode="'audio'"
                :available_modes="[]"
                :must_validate_media="false"
                :origin="'make'"
                @insertMedia="
                  (meta_filename) => setAudioMetaFilename(meta_filename)
                "
              />
            </div>

            <ToggleInput
              v-if="make.type === 'mix_audio_and_video'"
              :label="$t('stop_recording_with_video')"
              :content.sync="stop_recording_with_video"
            />
          </div>
        </template>
      </div>
    </div>
    <transition name="pagechange" mode="out-in">
      <div class="_bottomRow" v-if="export_is_available">
        <div class="_equationIcon">
          <b-icon icon="chevron-double-down" />
        </div>
        <div class="_exportPlayButtons">
          <button
            type="button"
            class="u-button u-button_red"
            v-if="make.type === 'mix_audio_and_video'"
            @click="playBoth"
          >
            <b-icon icon="play-circle-fill" />
            {{ $t("play_both") }}
          </button>

          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="show_render_modal = true"
          >
            <b-icon icon="check" />
            {{ $t("create") }}
          </button>
        </div>
      </div>
    </transition>

    <ExportSaveMakeModal2
      v-if="show_render_modal"
      :base_instructions="base_instructions"
      :make_path="make.$path"
      :reference_media="reference_media"
      @close="show_render_modal = false"
    />

    <ResourcesPicker
      v-if="show_resources_picker"
      :project_path="project_path"
      :pick_from_types="['audio']"
      @pickResources="handleResourcesPick"
      @close="show_resources_picker = false"
    />
  </div>
</template>
<script>
import SingleBaseMediaPicker from "@/components/makes/SingleBaseMediaPicker.vue"; // eslint-disable-line
import ExportSaveMakeModal2 from "@/components/makes/ExportSaveMakeModal2.vue";
import CaptureView from "@/adc-core/capture/CaptureView.vue";
import ResourcesPicker from "@/components/publications/modules/ResourcesPicker.vue";

export default {
  props: {
    make: Object,
  },
  components: {
    SingleBaseMediaPicker,
    ExportSaveMakeModal2,
    CaptureView,
    ResourcesPicker,
  },
  data() {
    return {
      show_render_modal: false,
      is_exporting: false,
      created_video: false,
      export_href: undefined,

      record_audio_live: false,
      stop_recording_with_video: true,
      show_resources_picker: false,
    };
  },

  created() {},
  mounted() {
    this.$eventHub.$on("capture.isRecording", this.onRecording);
    this.$eventHub.$on("capture.isRecordingStopped", this.onRecordingStopped);
  },
  beforeDestroy() {
    this.$eventHub.$off("capture.isRecording", this.onRecording);
    this.$eventHub.$off("capture.isRecordingStopped", this.onRecordingStopped);
  },
  watch: {},
  computed: {
    project_path() {
      let { space_slug, project_slug } = this.decomposePath(this.make.$path);
      return this.createPath({ space_slug, project_slug });
    },
    export_is_available() {
      if (this.make.type === "mix_audio_and_image")
        return this.make.base_audio_filename && this.make.base_image_filename;
      if (this.make.type === "mix_audio_and_video")
        return this.make.base_audio_filename && this.make.base_video_filename;
      return false;
    },
    selected_audio_media() {
      return this.getMediaFromFilename(this.make.base_audio_filename);
    },
    selected_video_media() {
      return this.getMediaFromFilename(this.make.base_video_filename);
    },
    selected_image_media() {
      return this.getMediaFromFilename(this.make.base_image_filename);
    },
    reference_media() {
      if (this.make.type === "mix_audio_and_image")
        return this.selected_image_media;
      if (this.make.type === "mix_audio_and_video")
        return this.selected_video_media;
      return undefined;
    },
    base_instructions() {
      let instructions = {
        recipe: this.make.type,
        suggested_file_name: this.make.type,
      };

      if (this.selected_audio_media)
        instructions.base_audio_path = this.makeMediaFilePath({
          $path: this.selected_audio_media.$path,
          $media_filename: this.selected_audio_media.$media_filename,
        });
      if (this.selected_image_media)
        instructions.base_image_path = this.makeMediaFilePath({
          $path: this.selected_image_media.$path,
          $media_filename: this.selected_image_media.$media_filename,
        });
      if (this.selected_video_media)
        instructions.base_video_path = this.makeMediaFilePath({
          $path: this.selected_video_media.$path,
          $media_filename: this.selected_video_media.$media_filename,
        });

      if (
        this.make.type === "mix_audio_and_video" &&
        this.selected_video_media &&
        this.selected_audio_media
      )
        instructions.duration = this.getMaxDuration(
          this.selected_video_media.$infos?.duration,
          this.selected_audio_media.$infos?.duration
        );
      return instructions;
    },
  },
  methods: {
    async setAudioMetaFilename(meta_filename) {
      const new_meta = {
        base_audio_filename: meta_filename,
      };
      await this.$api.updateMeta({
        path: this.make.$path,
        new_meta,
      });
      this.record_audio_live = false;
    },
    async handleResourcesPick(resources) {
      if (resources && resources.length > 0) {
        const selectedResource = resources[0];
        const meta_filename = this.getFilename(selectedResource.$path);
        await this.setAudioMetaFilename(meta_filename);
        this.show_resources_picker = false;
      }
    },
    getMediaFromFilename(meta_filename_in_project) {
      if (meta_filename_in_project)
        return this.getSourceMedia({
          source_media: { meta_filename_in_project },
          folder_path: this.make.$path,
        });
      return undefined;
    },
    getMaxDuration() {
      return Array.prototype.slice.call(arguments).reduce((acc, val) => {
        if (typeof val === "number" && val > acc) acc = val;
        return acc;
      }, 0);
    },
    onRecording(type) {
      if (type === "audio") {
        this.rewindAndPlayVideo();

        // video on pause or stop
      }
    },
    videoWasPaused() {
      if (this.stop_recording_with_video)
        this.$eventHub.$emit("capture.stopRecording");
    },
    videoWasEnded() {
      if (this.stop_recording_with_video)
        this.$eventHub.$emit("capture.stopRecording");
    },
    onRecordingStopped() {
      this.pauseVideo();
    },
    playBoth() {
      this.rewindAndPlayVideo();
      this.rewindAndPlayAudio();
    },
    rewindAndPlayAudio() {
      const audio = this.$refs.audioMedia?.player;
      if (audio) {
        audio.currentTime = 0;
        audio.muted = false;
        audio.volume = 1;
        audio.play();
      }
    },
    rewindAndPlayVideo() {
      const video = this.$el.querySelector("._videoOrImage video");
      if (video) {
        video.currentTime = 0;
        video.muted = true;
        video.play();
      }
    },
    pauseVideo() {
      const video = this.$el.querySelector("._videoOrImage video");
      if (video) {
        video.pause();
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._mixAudioAndImage {
  padding: calc(var(--spacing) / 1) 0;

  > * {
    // background: white;
  }
}

._topRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  // gap: calc(var(--spacing) * 2);

  @media (max-width: 1000px) {
    flex-flow: column nowrap;
  }
}

._equationIcon {
  font-size: 2em;
  line-height: 1;
  margin: calc(var(--spacing) * 2);
  color: white;
}

._bottomRow {
  margin-top: calc(var(--spacing) * 2);
  text-align: center;
}
._recordAudioLive {
  padding: calc(var(--spacing) / 4);
}
._captureView {
  width: 440px;
  max-width: 100%;
}
._audioMedia {
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  background: var(--c-bleumarine_fonce);
  color: white;
  // padding: calc(var(--spacing) / 4);
  border-radius: 4px;
}
._exportPlayButtons {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 1);
}
._liveDubbingBtn {
  padding: calc(var(--spacing) / 4);
}
._resourcesPickerBtn {
  padding: calc(var(--spacing) / 4);
}
</style>
