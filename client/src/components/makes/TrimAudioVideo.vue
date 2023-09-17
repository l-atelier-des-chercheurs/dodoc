<template>
  <div class="_trimAudioVideo">
    <div
      v-if="make.type === 'trim_video'"
      class="u-spacingBottom _videoPreview"
    >
      <video :src="base_media_url" muted ref="videoPreview" />
    </div>

    <!-- {{ base_media.$infos }} -->

    <div class="u-spacingBottom _btnRow">
      <button type="button" class="u-button u-button_bleuvert" @click="play">
        <b-icon icon="play-circle-fill" />
        {{ $t("play") }}
      </button>
      <button type="button" class="u-button u-button_orange" @click="pause">
        <b-icon icon="pause-circle" />
        {{ $t("pause") }}
      </button>
      <button type="button" class="u-button u-button_black" @click="zoomin">
        <b-icon icon="zoom-in" />
      </button>
      <button type="button" class="u-button u-button_black" @click="zoomout">
        <b-icon icon="zoom-out" />
      </button>
    </div>

    <div class="_trimSelect"></div>

    <div ref="playlist" class="u-spacingBottom _wfp" />
    <div ref="playlistPreview" v-show="false" />

    <!-- {{ current_time }} -->
    <p class="u-instructions">
      {{ $t("trim_instructions") }}
    </p>

    <!-- // not working: wfp uses time selection to move cursor as well, we would need to decouple selection from play -->
    <!-- <div class="_btnRow" >
      <div class="">
        {{ roundToDec(current_time, 2) }}
      </div>

      <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="setStartOrEnd({ new_start: current_time })"
      >
        <b-icon icon="chevron-bar-left" />
      </button>
      <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="setStartOrEnd({ new_end: current_time })"
      >
        <b-icon icon="chevron-bar-right" />
      </button>
    </div> -->

    <div class="u-sameRow _extract">
      <span>
        {{ $t("extract_to_export") }}
      </span>

      <NumberInput
        :value="selection.start"
        :suffix="'s'"
        @save="setStartOrEnd({ new_start: $event })"
      />
      <b-icon icon="arrow-right-circle" />
      <NumberInput
        :value="selection.end"
        :suffix="'s'"
        @save="setStartOrEnd({ new_end: $event })"
      />
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
// import { createSilentAudio } from "create-silent-audio";

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
      start_preview_play_from: 0,

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
          if (this.make.type === "trim_video") this.renderVideo();
          else if (this.make.type === "trim_audio") this.renderAudio();
        });
    },
    "make.selection": {
      handler() {
        this.setSelect();
      },
      deep: true,
    },
    current_time() {
      this.updatePreviewVideoTime();
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
        container: this.$refs.playlist,
        samplesPerPixel: 256,
        timescale: true,
        isAutomaticScroll: true,
        zoomLevels: [256, 512, 1024, 2048, 4096],
        state: "select",
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

      this.setListener();

      // const silent_audio = createSilentAudio(10, 44100);
      // await this.main_wfpl.load([
      //   {
      //     src: silent_audio,
      //     name: "silence",
      //     selected: {
      //       start: this.selection.start,
      //       end: this.selection.end,
      //     },
      //   },
      // ]);
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
    },
    play() {
      this.start_preview_play_from = this.current_time;

      this.main_wfpl.getEventEmitter().emit("play");
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.playPreviewVideo();
          });
        });
      });

      this.is_playing = true;
    },
    playPreviewVideo() {
      const videoPreview = this.$refs.videoPreview;
      if (videoPreview) {
        videoPreview.currentTime = this.current_time;
        videoPreview.play();
      }
    },
    updatePreviewVideoTime() {
      const videoPreview = this.$refs.videoPreview;
      if (!videoPreview) return;
      // only sync if necessary
      const ct = this.roundToDec(this.current_time, 1);
      const vct = this.roundToDec(videoPreview.currentTime, 1);

      // console.log("ct", ct, "vct", vct);
      if (ct !== vct) {
        console.log("!!! resync vid", vct - ct);
        // console.log(this.current_time, videoPreview.currentTime);
        videoPreview.currentTime = this.current_time;
      }
      // if (!this.is_playing) {
      //   videoPreview.currentTime = this.current_time;
      // }
    },
    pause() {
      this.main_wfpl.getEventEmitter().emit("pause");
      this.pausePreviewVideo();
      this.is_playing = false;
    },
    zoomin() {
      this.main_wfpl.getEventEmitter().emit("zoomin");
    },
    zoomout() {
      this.main_wfpl.getEventEmitter().emit("zoomout");
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
      this.main_wfpl.getEventEmitter().on("select", this.updateSelection);
      this.main_wfpl.getEventEmitter().on("finished", this.finished);
      this.main_wfpl
        .getEventEmitter()
        .on("audiosourceserror", this.audiosourceserror);
    },
    timeUpdate(time) {
      this.current_time = time;
    },
    audiosourceserror(err) {
      if (err.message === "Unable to decode audio data") {
        err;
      }
    },
    setSelect() {
      const { start, end } = this.make.selection;
      if (start !== this.selection.start || end !== this.selection.end)
        this.main_wfpl.getEventEmitter().emit("select", start, end);
    },
    setStartOrEnd({ new_start, new_end }) {
      // let { start, end } = this.selection;
      // if (start !== new_start) start = new_start;
      // if (end !== new_end) end = new_end;

      const start = new_start || this.selection.start;
      const end = new_end || this.selection.end;

      this.main_wfpl.getEventEmitter().emit("select", start, end);
    },
    updateSelection(start, end) {
      this.selection.start = this.roundToDec(start);
      this.selection.end = this.roundToDec(end);
      if (this.debounce_selection) clearTimeout(this.debounce_selection);
      this.debounce_selection = setTimeout(async () => {
        await this.updateSelectionMeta();
      }, 1000);
    },
    async updateSelectionMeta() {
      if (
        this.selection.start !== this.make.selection?.start ||
        this.selection.end !== this.make.selection?.end
      )
        await this.$api.updateMeta({
          path: this.make.$path,
          new_meta: {
            selection: this.selection,
          },
        });
    },
    finished() {
      this.pausePreviewVideo();
      this.is_playing = false;

      // go back to cursor or select
      // const
      // this.udpateVideoPreviewTo();
      // const videoPreview = this.$refs.videoPreview;
      // if(video)
      // videoPreview.currentTime = this.current_time;
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

    async renderVideo() {
      let instructions = {
        recipe: "trim_video",
        suggested_file_name: this.base_media.$media_filename + "_trim",
        selection: this.selection,
        base_media_path: this.makeMediaFilePath({
          $path: this.base_media.$path,
          $media_filename: this.base_media.$media_filename,
        }),
      };

      const current_task_id = await this.$api.exportFolder({
        path: this.make.$path,
        instructions,
      });
      this.$alertify.delay(4000).log(this.$t("compilation_started"));

      this.is_exporting = true;

      const checkIfEnded = ({ task_id }) => {
        if (task_id !== current_task_id) return;
        this.is_exporting = false;
        this.$eventHub.$off("task.ended", checkIfEnded);
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
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
  // background: white;

  // padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  // border-radius: 2px;
  margin: 0 auto calc(var(--spacing) / 1);

  > * {
    box-shadow: 0 1px 4px rgb(0 0 0 / 20%);
  }
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
  margin-bottom: calc(var(--spacing) / 1);
  background: var(--c-noir);

  video {
    width: 100%;
    max-height: 50vh;
  }
}
</style>
