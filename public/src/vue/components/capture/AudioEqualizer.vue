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
      this.current_audio_level_smoothed = Math.round(
        (this.current_audio_level_smoothed * 9 + this.current_audio_level) / 10
      );
    },
    is_recording() {
      this.clearCanvas();
    },
  },
  computed: {},
  methods: {
    startEqualizer() {
      if (!!this.audio_activity) this.audio_activity.destroy();

      if (typeof this.stream !== "object") return;

      this.audio_activity = audioActivity(this.stream, (level) => {
        // 'level' indicates the audio activity in percentage
        this.current_audio_level = Math.round(level * 100);
      });
      this.drawVolume();
    },
    drawVolume() {
      const canvas = this.$refs.canvas;
      if (canvas) window.requestAnimationFrame(this.drawVolume);
      else return;

      const ctx = canvas.getContext("2d");

      if (!this.is_recording) ctx.fillStyle = "#333";
      else ctx.fillStyle = "#fc4b60";

      // draw at pos
      let number_of_bars = canvas.width / 4;

      if (this.type === "Tiny") number_of_bars = canvas.width / 20;

      const bar_pos =
        canvas.width * (this.current_draw_percentage / number_of_bars);

      let bar_width = canvas.width / number_of_bars / 2;

      if (this.type === "Tiny") bar_width = canvas.width / number_of_bars;

      let bar_height = (this.current_audio_level / 100) * canvas.height;
      bar_height = Math.max(bar_width, bar_height);

      ctx.fillRect(
        bar_pos,
        canvas.height / 2 - bar_height / 2,
        bar_width,
        bar_height
      );

      this.current_draw_percentage++;
      if (this.current_draw_percentage >= number_of_bars) {
        this.clearCanvas();
      }
    },
    clearCanvas() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.current_draw_percentage = 0;
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
