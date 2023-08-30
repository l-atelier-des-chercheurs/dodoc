<template>
  <div>
    <div ref="playlist" />
  </div>
</template>
<script>
import WaveformPlaylist from "waveform-playlist";

export default {
  props: {},
  components: {},
  data() {
    return {
      WaveformPlaylist: undefined,
    };
  },
  created() {},
  mounted() {
    this.WaveformPlaylist = WaveformPlaylist({
      samplesPerPixel: 3000,
      mono: true,
      waveHeight: 70,
      container: this.$refs.playlist,
      state: "cursor",
      colors: {
        waveOutlineColor: "#E0EFF1",
        timeColor: "grey",
        fadeColor: "black",
      },
      controls: {
        show: false,
        width: 150,
      },
      zoomLevels: [500, 1000, 3000, 5000],
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
