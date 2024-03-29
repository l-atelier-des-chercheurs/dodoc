<template>
  <div class="_mixAudioAndImage">
    <div class="_topRow">
      <div class="">
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

      <div class="">
        <SingleBaseMediaPicker
          :title="$t('pick_audio')"
          :context="'full'"
          :field_name="'base_audio_filename'"
          :content="make.base_audio_filename"
          :path="make.$path"
          :media_type_to_pick="'audio'"
        />
      </div>
    </div>
    <transition name="pagechange" mode="out-in">
      <div class="_bottomRow" v-if="export_is_available">
        <div class="_equationIcon">
          <b-icon icon="chevron-double-down" />
        </div>
        <div class="">
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

export default {
  props: {
    make: Object,
  },
  components: { SingleBaseMediaPicker, ExportSaveMakeModal },
  data() {
    return {
      show_save_export_modal: false,
      is_exporting: false,
      created_video: false,
      export_href: undefined,
    };
  },
  i18n: {
    messages: {
      fr: {
        pick_audio: "Choisissez le son à utiliser",
        pick_image: "Choisissez l’image à utiliser",
        pick_video: "Choisissez la vidéo à utiliser",
        export_mix: "Exporter la composition",
      },
      en: {
        pick_audio: "Pick audio media",
        pick_image: "Pick image media",
        pick_video: "Pick video media",
        export_mix: "Export composition",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
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
    export_is_available() {
      if (this.make.type === "mix_audio_and_image")
        return this.make.base_audio_filename && this.make.base_image_filename;
      if (this.make.type === "mix_audio_and_video")
        return this.make.base_audio_filename && this.make.base_video_filename;
      return false;
    },
  },
  methods: {
    async renderAudioImageOrVideo() {
      this.is_exporting = true;
      this.created_video = false;
      this.export_href = undefined;

      const base_audio = this.getSourceMedia({
        source_media: {
          meta_filename_in_project: this.make.base_audio_filename,
        },
        folder_path: this.make.$path,
      });

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
  gap: calc(var(--spacing) * 2);
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
</style>
