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

    <div class="_currentTime">{{ current_time_displayed }} s</div>
    <div class="_startEndBlock">
      <!-- // not working: wfp uses time selection to move cursor as well, we would need to decouple selection from play -->

      <div class="_startEndBlock--b" :key="selection.start">
        <button
          type="button"
          class="u-button u-button_red _picto"
          :disabled="current_time === selection.start"
          @click="setStartOrEnd({ new_start: current_time })"
        >
          <b-icon icon="chevron-bar-left" />
          {{ $t("start") }}
        </button>
        <NumberInput
          :value="selection.start"
          :suffix="'s'"
          :size="'medium'"
          @save="setStartOrEnd({ new_start: $event })"
        />
        <div class="u-sameRow">
          <button
            type="button"
            class="u-buttonLink"
            @click="setStartOrEnd({ new_start: 0 })"
          >
            <b-icon icon="chevron-double-left" />
          </button>
          <button
            type="button"
            class="u-buttonLink"
            @click="setStartOrEnd({ new_start: selection.start - 0.1 })"
          >
            -0.1s
          </button>
          <button
            type="button"
            class="u-buttonLink"
            @click="setStartOrEnd({ new_start: selection.start + 0.1 })"
          >
            +0.1s
          </button>
        </div>
      </div>

      <b-icon icon="arrow-right-circle" />

      <div class="_startEndBlock--b">
        <button
          type="button"
          class="u-button u-button_red _picto"
          :disabled="current_time === selection.end"
          @click="setStartOrEnd({ new_end: current_time })"
        >
          {{ $t("end") }}
          <b-icon icon="chevron-bar-right" />
        </button>
        <NumberInput
          :value="selection.end"
          :suffix="'s'"
          :size="'medium'"
          @save="setStartOrEnd({ new_end: $event })"
        />
        <div class="u-sameRow">
          <button
            type="button"
            class="u-buttonLink"
            @click="setStartOrEnd({ new_end: selection.end - 0.1 })"
          >
            -0.1s
          </button>
          <button
            type="button"
            class="u-buttonLink"
            @click="setStartOrEnd({ new_end: selection.end + 0.1 })"
          >
            +0.1s
          </button>
          <button
            type="button"
            class="u-buttonLink"
            @click="setStartOrEnd({ new_end: main_wfpl.tracks[0].duration })"
          >
            <b-icon icon="chevron-double-right" />
          </button>
        </div>
      </div>
    </div>

    <div class="_currentVolume">{{ $t("volume") }} = {{ player_volume }}%</div>

    <div class="_submit">
      <div class="u-instructions">
        <template v-if="selection.start === selection.end">
          {{ $t("start_egal_to_end") }}
        </template>
        <template v-if="+selection.end < +selection.start">
          {{ $t("end_before_start") }}
        </template>
      </div>
      <button
        type="button"
        class="u-button u-button_bleuvert"
        :disabled="selection.start === selection.end && player_volume === 100"
        @click="show_save_export_modal = true"
      >
        <b-icon icon="check" />
        {{ $t("test_and_export") }}
      </button>
    </div>

    <!-- <button type="button" @click="renderAudio">startaudiorendering</button> -->
    <!-- is_rendering = {{ is_rendering }} -->

    <ExportSaveMakeModal
      v-if="show_save_export_modal"
      :title="export_modal_title"
      :export_blob="export_blob"
      :export_name="export_name"
      :export_href="export_href"
      :project_path="project_path"
      @close="show_save_export_modal = false"
    >
      <!-- <p class="u-spacingBottom">
        {{ $t("duration") }} – {{ export_duration }}
      </p> -->
      <template v-if="make.type === 'trim_audio'">
        <vue-plyr v-if="export_src_url">
          <audio :src="export_src_url" />
        </vue-plyr>
      </template>
      <template v-else-if="make.type === 'trim_video'">
        <div class="_spinner" v-if="is_exporting" key="loader">
          <LoaderSpinner />
        </div>
        <div v-else>
          <MediaContent
            class="_preview"
            :file="trimmed_video"
            :resolution="1600"
            :context="'full'"
          />
        </div>
      </template>
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

      debounce_volumeChange: undefined,
      player_volume:
        typeof this.make.volume !== "undefined" ? this.make.volume : 100,

      trimmed_video: false,

      is_rendering: false,
      show_save_export_modal: false,

      debounce_selection: undefined,
      is_exporting: false,

      export_blob: false,
      export_href: undefined,
      export_src_url: false,
      export_duration: "",
    };
  },
  i18n: {
    messages: {
      fr: {
        start_egal_to_end: "Le début est identique à la fin",
        end_before_start: "La fin est avant le début",
        export_trim_video: "Exporter la vidéo recoupée",
      },
      en: {
        start_egal_to_end: "Start is equal to end",
        end_before_start: "End is before start",
        export_trim_audio: "Export trimmed video",
      },
    },
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
    "make.volume": {
      handler() {
        this.setVolume();
      },
    },
    current_time() {
      this.updatePreviewVideoTime();
    },
  },
  computed: {
    export_name() {
      if (this.make.type === "trim_video")
        return this.base_media.$media_filename + "_trim.mp4";
      else if (this.make.type === "trim_audio")
        return this.base_media.$media_filename + "_trim.wav";
      return "untitled";
    },
    export_modal_title() {
      if (this.make.type === "trim_video") return this.$t("export_trim_video");
      else if (this.make.type === "") return this.$t("export_trim_audio");
      return "";
    },
    current_time_displayed() {
      // const r = "" + this.roundToDec(this.current_time, 2);
      // this.formatTime(this.current_time, );
      // return r.replace(".", ",");
      return parseFloat(this.current_time.toFixed(2)).toLocaleString(
        this.$i18n.locale
      );
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
        state: "cursor",
        states: {
          cursor: true,
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
      this.setVolume();
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
      this.main_wfpl.getEventEmitter().on("volumechange", this.volumeChange);
      this.main_wfpl.getEventEmitter().on("finished", this.finished);
      this.main_wfpl
        .getEventEmitter()
        .on("audiosourceserror", this.audiosourceserror);
    },
    timeUpdate(time) {
      this.current_time = this.roundToDec(time);
    },
    async volumeChange(volume) {
      this.player_volume = +volume;

      if (this.debounce_volumeChange) clearTimeout(this.debounce_volumeChange);
      this.debounce_volumeChange = setTimeout(async () => {
        await this.$api.updateMeta({
          path: this.make.$path,
          new_meta: {
            volume: this.player_volume,
          },
        });
      }, 1000);
    },
    audiosourceserror(err) {
      if (err.message === "Unable to decode audio data") {
        err;
      }
    },
    select(start, end) {
      if (start !== end) {
        this.updateSelection(start, end);
      }
    },
    setSelect() {
      const { start, end } = this.make.selection;
      if (start !== this.selection.start || end !== this.selection.end)
        this.main_wfpl.getEventEmitter().emit("select", start, end);
    },
    setVolume() {
      if (typeof this.make.volume === "undefined") return;
      this.player_volume = this.make.volume;
      this.main_wfpl
        .getEventEmitter()
        .emit("volumechange", this.make.volume, this.main_wfpl.tracks[0]);
    },
    setStartOrEnd({ new_start, new_end }) {
      // let { start, end } = this.selection;
      // if (start !== new_start) start = new_start;
      // if (end !== new_end) end = new_end;

      const start =
        typeof new_start !== "undefined" ? new_start : this.selection.start;
      const end = typeof new_end !== "undefined" ? new_end : this.selection.end;
      debugger;
      this.updateSelection(start, end);

      // this.main_wfpl.getEventEmitter().emit("select", start, end);
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
      this.export_href = window.URL.createObjectURL(blob);

      const reader = new FileReader();
      reader.onload = (e) => {
        this.export_src_url = e.target.result;
      };
      reader.readAsDataURL(blob);
    },
    async renderAudio() {
      this.export_blob = false;
      this.export_href = undefined;
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
          gain: this.player_volume / 100,
          fadeIn: {
            shape: "logarithmic",
            duration: 0.3,
          },
          fadeOut: {
            shape: "logarithmic",
            duration: 0.3,
          },

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
      this.trimmed_video = false;
      this.export_href = undefined;

      const additional_meta = {};
      additional_meta.$origin = "make";
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      let instructions = {
        recipe: "trim_video",
        suggested_file_name: this.base_media.$media_filename + "_trim",
        selection: this.selection,
        volume: this.player_volume,
        base_media_path: this.makeMediaFilePath({
          $path: this.base_media.$path,
          $media_filename: this.base_media.$media_filename,
        }),
        additional_meta,
      };

      const current_task_id = await this.$api.exportFolder({
        path: this.make.$path,
        instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });
      this.is_exporting = true;

      const checkIfEnded = ({ task_id, message }) => {
        if (task_id !== current_task_id) return;
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$api.leave({ room: "task_" + current_task_id });

        if (message.event === "completed") {
          message.file;
          this.trimmed_video = message.file;

          this.export_href = this.makeMediaFileURL({
            $path: this.trimmed_video.$path,
            $media_filename: this.trimmed_video.$media_filename,
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
  --wp-range-slider-label-color: var(--c-noir);

  ::v-deep {
    .playlist .controls label.volume {
      font-weight: bold;
      font-family: inherit;
      &::before {
        content: "-";
      }
      &::after {
        content: "+";
      }
    }
  }
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
  text-align: center;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
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

._currentTime,
._currentVolume {
  margin: calc(var(--spacing) * 2) auto;
  text-align: center;
}
._currentTime {
  font-size: var(--sl-font-size-x-large);
}

._startEndBlock {
  display: flex;
  justify-content: center;
  gap: calc(var(--spacing) * 2);
  margin: calc(var(--spacing) * 2) auto;
}
._startEndBlock--b {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  border: 2px solid var(--c-gris);
  padding: calc(var(--spacing) / 2);
}

._picto {
  // padding: calc(var(--spacing) / 2);
  // background: var(--c-rouge);
  // text-align: center;
  // color: white;
  width: 100%;
}
</style>
