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
  },
  computed: {},
  methods: {
    startEqualizer() {
      if (!!this.audio_activity) this.audio_activity.destroy();
      this.audio_activity = audioActivity(this.stream, (level) => {
        // 'level' indicates the audio activity in percentage
        this.current_audio_level = Math.round(level * 100);
      });
      this.drawVolume();
    },
    drawVolume() {
      console.log("loop");
      const canvas = this.$refs.canvas;
      if (canvas) window.requestAnimationFrame(this.drawVolume);
      else return;

      const ctx = canvas.getContext("2d");

      if (!this.is_recording) ctx.fillStyle = "#ffffff";
      else ctx.fillStyle = "#fc4b60";

      // draw at pos
      const number_of_bars = 400;

      const bar_pos =
        canvas.width * (this.current_draw_percentage / number_of_bars);
      const bar_width = canvas.width / number_of_bars / 2;

      let bar_height = (this.current_audio_level / 100) * canvas.height;
      bar_height = Math.max(10, bar_height);

      ctx.fillRect(
        bar_pos,
        canvas.height / 2 - bar_height / 2,
        bar_width,
        bar_height
      );

      this.current_draw_percentage++;
      if (this.current_draw_percentage >= number_of_bars) {
        this.current_draw_percentage = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.m_audioEqualizer {
  max-width: 100%;
  max-height: 100%;
  object-fit: scale-down;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  canvas {
  }
}
</style>
