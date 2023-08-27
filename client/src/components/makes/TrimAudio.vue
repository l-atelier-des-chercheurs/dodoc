<template>
  <div class="_trimAudio">
    <button type="button" class="u-button u-button_bleuvert" @click="play">
      <b-icon icon="play-circle-fill" />
      {{ $t("play") }}
    </button>
    <button type="button" class="u-button u-button_orange" @click="pause">
      <b-icon icon="pause-circle" />
      {{ $t("pause") }}
    </button>

    <div ref="playlist" class="_wfp" />
  </div>
</template>
<script>
import WaveformPlaylist from "waveform-playlist";

export default {
  props: {
    make: Object,
    project_path: String,
    base_media: Object,
  },
  components: {},
  data() {
    return {
      WaveformPlaylist: undefined,
    };
  },
  created() {},
  mounted() {
    this.loadWFP();
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    loadWFP() {
      this.WaveformPlaylist = WaveformPlaylist({
        samplesPerPixel: 128,
        container: this.$refs.playlist,
        state: "select",
        // colors: {
        //   waveOutlineColor: "#262626",
        //   timeColor: "#fc4b60",
        //   fadeColor: "white",
        // },
        zoomLevels: [128, 256, 512],
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

      const audio_url = this.makeMediaFileURL({
        $path: this.base_media.$path,
        $media_filename: this.base_media.$media_filename,
      });

      this.WaveformPlaylist.load([
        {
          src: audio_url,
          name: this.$t("track"),
          // gain: 1,
        },
      ]).then(function () {
        // can do stuff with the playlist.
      });
    },
    play() {
      this.WaveformPlaylist.getEventEmitter().emit("play");
    },
    pause() {
      this.WaveformPlaylist.getEventEmitter().emit("pause");
    },
  },
};
</script>
<style src="@/components/makes/waveform-playlist-main.css" />
<style lang="scss" scoped>
._trimAudio {
  position: relative;
  width: 100%;
  height: auto;
  background: white;

  padding: calc(var(--spacing) * 1);
}

._wfp {
  position: relative;
  background: var(--c-bleumarine_fonce);
}
</style>
