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
      maxHistoryPoints: 150,
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
      // this.clearCanvas();
    },
  },
  computed: {},
  methods: {
    startEqualizer() {
      if (this.audio_activity) this.audio_activity.destroy();

      if (typeof this.stream !== "object") return;

      this.audio_activity = audioActivity(this.stream, (level) => {
        this.current_audio_level = Math.round(level * 100);
      });
      this.drawVolume();
    },
    drawVolume() {
      console.log("drawVolume");

      const canvas = this.$refs.canvas;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const w = this.$el.clientWidth * dpr;
      const h = this.$el.clientHeight * dpr;
      if (w !== canvas.width || h !== canvas.height) {
        canvas.width = w;
        canvas.height = h;
      }

      this.audioHistory.push(this.current_audio_level);
      if (this.audioHistory.length > this.maxHistoryPoints) {
        this.audioHistory.shift();
      }

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!this.is_recording) ctx.fillStyle = "#333";
      else ctx.fillStyle = "#fc4b60";

      const pointWidth = canvas.width / this.maxHistoryPoints;
      const maxHeight = canvas.height * 0.8;

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      this.audioHistory.forEach((level, index) => {
        const x = index * pointWidth;
        const y = canvas.height - (level / 100) * maxHeight;

        if (index === 0) {
          ctx.moveTo(x, canvas.height / 2);
        }
        ctx.lineTo(x, y);
      });

      ctx.lineTo(canvas.width, canvas.height);
      ctx.closePath();

      ctx.fill();

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
