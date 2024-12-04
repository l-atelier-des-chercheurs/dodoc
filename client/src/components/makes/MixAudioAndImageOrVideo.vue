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
        />
      </div>
      <div class="_equationIcon">
        <b-icon icon="plus-circle-dotted" />
      </div>

      <div class="_audioMedia">
        <template v-if="make.base_audio_filename">
          {{ make.base_audio_filename }}

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
          </template>
          <div class="_recordAudioLive">
            <button
              type="button"
              class="u-button u-button_red"
              :class="{ 'u-button_small': record_audio_live }"
              @click="record_audio_live = !record_audio_live"
            >
              <template v-if="record_audio_live">
                <b-icon icon="x-circle" />
                {{ $t("cancel") }}
              </template>
              <template v-else>
                <b-icon icon="record-circle-fill" />
                {{ $t("live_dubbing") }}
              </template>
            </button>

            <div class="_captureView" v-if="record_audio_live">
              <CaptureView
                :path="project_path"
                :selected_mode="'audio'"
                :available_modes="[]"
                :must_validate_media="false"
                @insertMedia="
                  (meta_filename) => setAudioMetaFilename(meta_filename)
                "
              />
            </div>
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
          <button type="button" class="u-button u-button_red" @click="playBoth">
            <b-icon icon="play-circle-fill" />
            {{ $t("play_both") }}
          </button>

          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="show_save_export_modal = true"
          >
            <b-icon icon="check" />
            {{ $t("create") }}
          </button>
        </div>
      </div>
    </transition>

    <ExportSaveMakeModal
      v-if="show_save_export_modal"
      :title="$t('export_mix')"
      :export_name="export_name"
      :export_href="export_href"
      @close="show_save_export_modal = false"
    >
      <!-- <p class="u-spacingBottom">
        {{ $t("duration") }} – {{ export_duration }}
      </p> -->
      <div class="_spinner" v-if="is_exporting" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else>
        <MediaContent
          class="_preview"
          :file="created_video"
          :resolution="1600"
          :context="'full'"
        />
      </div>
    </ExportSaveMakeModal>
  </div>
</template>
<script>
import SingleBaseMediaPicker from "@/components/makes/SingleBaseMediaPicker.vue"; // eslint-disable-line
import ExportSaveMakeModal from "@/components/makes/ExportSaveMakeModal.vue";
import CaptureView from "@/adc-core/capture/CaptureView.vue";

export default {
  props: {
    make: Object,
  },
  components: { SingleBaseMediaPicker, ExportSaveMakeModal, CaptureView },
  data() {
    return {
      show_save_export_modal: false,
      is_exporting: false,
      created_video: false,
      export_href: undefined,

      record_audio_live: false,
    };
  },

  created() {},
  mounted() {
    this.$eventHub.$on("capture.isRecording", this.onRecording);
  },
  beforeDestroy() {
    this.$eventHub.$off("capture.isRecording", this.onRecording);
  },
  watch: {
    show_save_export_modal() {
      if (this.show_save_export_modal) this.renderAudioImageOrVideo();
    },
  },
  computed: {
    export_name() {
      if (this.make.type === "mix_audio_and_image")
        return "audio_image_mix.mp4";
      if (this.make.type === "mix_audio_and_video")
        return "audio_video_mix.mp4";
      return "untitled";
    },
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
      const meta_filename_in_project = this.make.base_audio_filename;
      if (meta_filename_in_project)
        return this.getSourceMedia({
          source_media: { meta_filename_in_project },
          folder_path: this.make.$path,
        });
      return false;
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

    async renderAudioImageOrVideo() {
      this.is_exporting = true;
      this.created_video = false;
      this.export_href = undefined;

      const base_audio = this.selected_audio_media;

      debugger;

      const additional_meta = {};
      additional_meta.$origin = "make";
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      let instructions = {
        recipe: this.make.type,
        suggested_file_name: this.make.type,
        base_audio_path: this.makeMediaFilePath({
          $path: base_audio.$path,
          $media_filename: base_audio.$media_filename,
        }),
        output_width: 1280,
        output_height: 720,
        additional_meta,
      };

      debugger;

      if (this.make.type === "mix_audio_and_image") {
        const base_image = this.getSourceMedia({
          source_media: {
            meta_filename_in_project: this.make.base_image_filename,
          },
          folder_path: this.make.$path,
        });
        instructions.base_image_path = this.makeMediaFilePath({
          $path: base_image.$path,
          $media_filename: base_image.$media_filename,
        });
      } else if (this.make.type === "mix_audio_and_video") {
        const base_video = this.getSourceMedia({
          source_media: {
            meta_filename_in_project: this.make.base_video_filename,
          },
          folder_path: this.make.$path,
        });

        const duration = this.getMaxDuration(
          base_video.$infos?.duration,
          base_audio.$infos?.duration
        );
        instructions.duration = duration;
        instructions.base_video_path = this.makeMediaFilePath({
          $path: base_video.$path,
          $media_filename: base_video.$media_filename,
        });
      }

      const current_task_id = await this.$api.exportFolder({
        path: this.make.$path,
        instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (message.event === "completed") {
          this.created_video = message.file;
          this.export_href = this.makeMediaFileURL({
            $path: this.created_video.$path,
            $media_filename: this.created_video.$media_filename,
          });
        } else if (message.event === "aborted") {
          //
        } else if (message.event === "failed") {
          message.info;
        }

        this.is_exporting = false;
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
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
      }
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
  gap: calc(var(--spacing) * 1);
  background: var(--c-bleumarine_fonce);
  color: white;
  padding: calc(var(--spacing) / 4);
}
._exportPlayButtons {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 1);
}
</style>
