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
      current_audio_level_smoothed: 0,

      current_draw_percentage: 0,
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
    current_audio_level() {
      // if (this.current_audio_level > this.current_audio_level_smoothed)
      const current_audio_level = Math.max(0, this.current_audio_level - 10);

      this.current_audio_level_smoothed = Math.round(
        (this.current_audio_level_smoothed + current_audio_level) / 2
      );
      // else
    },
    is_recording() {
      // this.clearCanvas();
    },
  },
  computed: {},
  methods: {
    startEqualizer() {
      if (this.audio_activity) this.audio_activity.destroy();

      if (typeof this.stream !== "object") return;

      this.audio_activity = audioActivity(this.stream, (level) => {
        // 'level' indicates the audio activity in percentage
        this.current_audio_level = Math.round(level * 100);
      });
      this.drawVolume();
    },
    drawVolume() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = this.$el.clientWidth * dpr;
      canvas.height = this.$el.clientHeight * dpr;

      const ctx = canvas.getContext("2d");
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      // ctx.fillStyle = "rgba(255,255,255,.1)";
      ctx.fillStyle = "rgba(0,0,0,.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!this.is_recording) ctx.fillStyle = "#333";
      else ctx.fillStyle = "#fc4b60";

      const diam = Math.min(canvas.width, canvas.height);
      const volume = ((diam / 2) * this.current_audio_level_smoothed) / 20;

      ctx.beginPath();
      ctx.ellipse(
        canvas.width / 2,
        canvas.height / 2,
        volume,
        volume,
        0,
        2 * Math.PI,
        false
      );
      ctx.fill();

      // ctx.fillStyle = "#000000";
      // ctx.fillRect(20, Math.random() * 200, 10, 10);
      // ctx.ellipse(
      //   Math.random() * 200 + canvas.width / 2,
      //   Math.random() * 200 + canvas.height / 2,
      //   volume,
      //   volume,
      //   0,
      //   2 * Math.PI,
      //   false
      // );

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

  display: flex;
  align-items: center;
  justify-content: center;

  canvas {
    display: block;
    max-width: 100%;
    max-height: 100%;

    background-color: white;
  }
}
</style>
