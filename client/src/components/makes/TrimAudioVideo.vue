<template>
  <div class="_trimAudioVideo">
    <div v-if="make.type === 'trim_video'" class="_videoPreview">
      <video :src="base_media_url" muted ref="videoPreview" />
    </div>

    <div class="_btnRow">
      <button type="button" class="u-button u-button_bleuvert" @click="play">
        <b-icon icon="play-circle-fill" />
        {{ $t("play") }}
      </button>
      <button type="button" class="u-button u-button_orange" @click="pause">
        <b-icon icon="pause-circle" />
        {{ $t("pause") }}
      </button>
    </div>

    <div ref="playlist" class="_wfp" />
    <div ref="playlistPreview" v-show="false" />

    <!-- {{ current_time }} -->
    <div v-if="!selection_is_ready">
      <br />
      <p class="u-instructions">
        {{ $t("trim_instructions") }}
      </p>
    </div>
    <div v-else>
      <div class="u-sameRow _extract">
        <span>
          {{ $t("extract_to_export") }}
        </span>
        <input type="text" :value="selection.start" readonly />
        <b-icon icon="arrow-right-circle" />
        <input type="text" :value="selection.end" readonly />
      </div>

      <div class="u-sameRow _submit">
        <button
          type="button"
          class="u-button u-button_bleumarine"
          @click="show_save_export_modal = true"
        >
          <b-icon icon="check" />
          {{ $t("submit") }}
        </button>
      </div>
    </div>

    <!-- <button type="button" @click="renderAudio">startaudiorendering</button> -->
    <!-- is_rendering = {{ is_rendering }} -->

    <ExportSaveMakeModal
      v-if="show_save_export_modal"
      :export_blob="export_blob"
      :export_name="export_name"
      :project_path="project_path"
      @close="show_save_export_modal = false"
    >
      <!-- <p class="u-spacingBottom">
        {{ $t("duration") }} – {{ export_duration }}
      </p> -->
      <audio
        v-if="export_src_url"
        class="_player"
        :src="export_src_url"
        controls
      />
    </ExportSaveMakeModal>
  </div>
</template>
<script>
import WaveformPlaylist from "waveform-playlist";
import ExportSaveMakeModal from "@/components/makes/ExportSaveMakeModal.vue";

export default {
  props: {
    make: Object,
    project_path: String,
    base_media: Object,
  },
  components: {
    ExportSaveMakeModal,
  },
  data() {
    return {
      main_wfpl: undefined,

      current_time: 0,

      is_playing: false,
      selection: {
        start: this.make.selection?.start || 0,
        end: this.make.selection?.end || 0,
      },

      is_rendering: false,
      show_save_export_modal: false,

      debounce_selection: undefined,

      export_blob: false,
      export_src_url: false,
      export_duration: "",
    };
  },
  created() {},
  async mounted() {
    await this.loadWFP();
  },
  beforeDestroy() {},
  watch: {
    show_save_export_modal() {
      if (this.show_save_export_modal)
        this.$nextTick(() => {
          this.renderAudio();
        });
    },
    "make.selection": {
      handler() {
        this.setSelect();
      },
      deep: true,
    },
    current_time() {
      const videoPreview = this.$refs.videoPreview;
      if (!videoPreview) return;

      // only sync if necessary
      const ct = this.roundToDec(this.current_time, 1);
      const vct = this.roundToDec(videoPreview.currentTime, 1);
      if (ct !== vct) {
        videoPreview.currentTime = this.current_time;
      }
    },
  },
  computed: {
    export_name() {
      return this.base_media.$media_filename + "_trim.wav";
    },
    selection_is_ready() {
      return (
        this.selection.start &&
        this.selection.end &&
        this.selection.start !== this.selection.end
      );
    },
    base_media_url() {
      return this.makeMediaFileURL({
        $path: this.base_media.$path,
        $media_filename: this.base_media.$media_filename,
      });
    },
  },
  methods: {
    async loadWFP() {
      this.main_wfpl = WaveformPlaylist({
        samplesPerPixel: 512,
        container: this.$refs.playlist,
        state: "select",
        timescale: true,
        isAutomaticScroll: true,
        zoomLevels: [512, 1024, 2048, 4096],
        states: {
          cursor: false,
          fadein: false,
          fadeout: false,
          select: true,
          shift: false,
        },
        controls: {
          show: true,
          width: 150,
          widgets: {
            muteOrSolo: false,
            volume: true,
            stereoPan: false,
            collapse: false,
            remove: false,
          },
        },
      });

      await this.main_wfpl.load([
        {
          src: this.base_media_url,
          name: this.base_media.$media_filename,
          selected: {
            start: this.selection.start,
            end: this.selection.end,
          },
        },
      ]);

      this.setListener();
    },
    play() {
      this.main_wfpl.getEventEmitter().emit("play");
      this.playPreviewVideo();
      this.is_playing = true;
    },
    playPreviewVideo() {
      const videoPreview = this.$refs.videoPreview;
      if (videoPreview) {
        videoPreview.currentTime = this.current_time;
        videoPreview.play();
      }
    },
    pause() {
      this.main_wfpl.getEventEmitter().emit("pause");
      this.pausePreviewVideo();
      this.is_playing = false;
    },
    // stop() {
    //   this.main_wfpl.getEventEmitter().emit("stop");
    //   this.pausePreviewVideo();
    //   this.is_playing = false;
    // },
    pausePreviewVideo() {
      const videoPreview = this.$refs.videoPreview;
      if (videoPreview) videoPreview.pause();
    },
    setListener() {
      this.main_wfpl.getEventEmitter().on("timeupdate", this.timeUpdate);
      this.main_wfpl.getEventEmitter().on("select", this.select);
      this.main_wfpl.getEventEmitter().on("select", this.select);
      this.main_wfpl.getEventEmitter().on("finished", this.finished);
    },
    timeUpdate(time) {
      this.current_time = time;
    },
    select(start, end) {
      this.selection.start = this.roundToDec(start);
      this.selection.end = this.roundToDec(end);

      if (this.debounce_selection) clearTimeout(this.debounce_selection);
      this.debounce_selection = setTimeout(async () => {
        await this.updateSelectionMeta();
      }, 1000);
    },
    setSelect() {
      const { start, end } = this.make.selection;
      if (start !== this.selection.start || end !== this.selection.end)
        this.main_wfpl.getEventEmitter().emit("select", start, end);
    },
    async updateSelectionMeta() {
      if (
        this.selection.start !== this.make.selection.start ||
        this.selection.end !== this.make.selection.end
      )
        await this.$api.updateMeta({
          path: this.make.$path,
          new_meta: {
            selection: this.selection,
          },
        });
    },
    finished() {
      // this.pause();
    },

    audiorenderingstarting() {
      this.is_rendering = true;
    },
    audiorenderingfinished(type, blob) {
      type;
      this.is_rendering = false;
      this.export_blob = blob;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.export_src_url = e.target.result;
      };
      reader.readAsDataURL(blob);
    },
    async renderAudio() {
      this.export_blob = false;
      this.export_src_url = false;
      this.export_duration = "";

      this.main_wfpl.getEventEmitter().emit("stop");

      const preview_wfpl = WaveformPlaylist({
        // samplesPerPixel: 512,
        container: this.$refs.playlistPreview,
        // state: "select",
        // timescale: true,
        // isAutomaticScroll: true,
        // zoomLevels: [512, 1024, 2048, 4096],
        // states: {
        //   cursor: true,
        //   fadein: false,
        //   fadeout: false,
        //   select: false,
        //   shift: false,
        // },
        // controls: {
        //   show: true,
        //   width: 150,
        //   widgets: {
        //     muteOrSolo: false,
        //     volume: true,
        //     stereoPan: false,
        //     collapse: false,
        //     remove: false,
        //   },
        // },
      });
      await preview_wfpl.load([
        {
          src: this.base_media_url,
          name: this.base_media.$media_filename,
          selected: {
            start: this.selection.start,
            end: this.selection.end,
          },
        },
      ]);

      // await new Promise((r) => setTimeout(r, 1000));

      preview_wfpl
        .getEventEmitter()
        .on("audiorenderingstarting", this.audiorenderingstarting);
      preview_wfpl
        .getEventEmitter()
        .on("audiorenderingfinished", this.audiorenderingfinished);
      preview_wfpl.initExporter();

      preview_wfpl.getEventEmitter().emit("trim");
      preview_wfpl
        .getEventEmitter()
        .emit("shift", -this.selection.start, preview_wfpl.tracks[0]);
      // preview_wfpl.adjustDuration();
      const duration = this.selection.end - this.selection.start;
      preview_wfpl.duration = duration;
      this.export_duration = this.roundToDec(duration);
      preview_wfpl.getEventEmitter().emit("startaudiorendering", "wav");
    },
  },
};
</script>
<style src="@/components/makes/waveform-playlist-main.css" />
<style lang="scss" scoped>
._trimAudioVideo {
  position: relative;
  width: 100%;
  height: auto;
  background: white;

  padding: calc(var(--spacing) * 1);
}

._wfp {
  position: relative;
  box-shadow: 0 1px 4px rgb(0 0 0 / 20%);
  // background: var(--c-bleumarine_fonce);
}

._btnRow {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
  align-items: center;
  width: 100%;
  background: white;

  // padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  border-radius: 2px;
  margin: 0 auto calc(var(--spacing) / 1);
  box-shadow: 0 1px 4px rgb(0 0 0 / 20%);
}

._extract {
  margin: calc(var(--spacing) * 1) auto;
  input {
    width: 10ch;
  }
}
._submit {
  margin: calc(var(--spacing) * 1) auto;
}

._player {
  display: block;
  width: 100%;

  height: auto;
  min-height: 40px;
}

._videoPreview {
  height: 100%;
  width: auto;
  margin: 0 auto;
  background: var(--c-noir);

  video {
    width: 100%;
    max-height: 50vh;
  }
}
</style>
