<template>
  <div class="m_audioEqualizer">
    <canvas ref="canvas" width="1280" height="720" />
  </div>
</template>
<script>
import audioActivity from "./audio-activity.js";

export default {
  props: {
    stream: MediaStream,
    is_recording: Boolean,
    type: {
      type: String,
      default: "Full",
    },
  },
  components: {},
  data() {
    return {
      audio_activity: undefined,
      current_audio_level: 0,
      audioHistory: [],
      maxHistoryPoints: 1000,
    };
  },
  created() {},
  mounted() {
    this.startEqualizer();
  },
  beforeDestroy() {
    this.audio_activity.destroy();
  },
  watch: {
    stream() {
      this.startEqualizer();
    },
    is_recording() {
      this.audioHistory = [];
    },
  },
  computed: {},
  methods: {
    startEqualizer() {
      if (this.audio_activity) this.audio_activity.destroy();

      if (typeof this.stream !== "object") return;

      this.audio_activity = audioActivity(this.stream, (level) => {
        this.current_audio_level = level;
      });
      this.drawVolume();
    },
    drawVolume() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;

      const dpr = 1;
      // const dpr = window.devicePixelRatio || 1;
      const w = this.$el.clientWidth * dpr;
      const h = this.$el.clientHeight * dpr;
      if (w !== canvas.width || h !== canvas.height) {
        canvas.width = w;
        canvas.height = h;
      }

      const max_history_points = this.maxHistoryPoints;
      // const max_history_points = !this.is_recording
      //   ? this.maxHistoryPoints
      //   : Infinity;

      // const smoothed_level = this.current_audio_level;
      // const latest_level = this.audioHistory.at(-1) || 0;
      // const smoothed_level = (latest_level * 3 + this.current_audio_level) / 4;

      this.audioHistory.push(this.current_audio_level);

      if (this.audioHistory.length > max_history_points) {
        this.audioHistory.shift();
      }

      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!this.is_recording) ctx.fillStyle = "#333";
      else ctx.fillStyle = "#fc4b60";

      const pointWidth = canvas.width / this.audioHistory.length;
      const maxHeight = canvas.height * 1.6;

      this.audioHistory.forEach((level, index) => {
        const x = index * pointWidth;
        const width = pointWidth;
        const height = Math.max(level * maxHeight, 2);
        const y = canvas.height / 2 - height / 2;
        // if (index === 0) ctx.moveTo(x, 0);
        // ctx.lineTo(x, y);
        ctx.fillRect(x, y, width, height);
      });

      window.requestAnimationFrame(this.drawVolume);
    },
  },
};
</script>
<style lang="scss" scoped>
.m_audioEqualizer {
  width: 100%;
  height: 100%;
  object-fit: scale-down;

  canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;

    background-color: white;
  }
}
</style>
