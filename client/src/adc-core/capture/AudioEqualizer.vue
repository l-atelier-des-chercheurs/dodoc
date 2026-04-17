<template>
  <div
    class="m_audioEqualizer"
    :class="{
      'is--tiny': is_tiny,
      'is--active': is_active,
      'is--recording': is_recording,
    }"
  >
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
      display_audio_level: 0,
      is_active: false,
      activity_hold_ticks: 0,
      animation_frame_id: undefined,
      level_history: [],
    };
  },
  created() {},
  mounted() {
    this.startEqualizer();
  },
  beforeDestroy() {
    this.stopDrawing();
    if (this.audio_activity) this.audio_activity.destroy();
  },
  watch: {
    stream() {
      this.startEqualizer();
    },
    is_recording() {
      // if (!this.is_recording) this.resetVisualState();
    },
  },
  computed: {
    is_tiny() {
      return this.type === "Tiny";
    },
    activity_threshold() {
      return this.is_tiny ? 0.05 : 0.03;
    },
  },
  methods: {
    resetVisualState() {
      this.current_audio_level = 0;
      this.display_audio_level = 0;
      this.is_active = false;
      this.activity_hold_ticks = 0;
      this.level_history = [];
    },
    stopDrawing() {
      if (!this.animation_frame_id) return;
      window.cancelAnimationFrame(this.animation_frame_id);
      this.animation_frame_id = undefined;
    },
    startEqualizer() {
      if (this.audio_activity) this.audio_activity.destroy();
      this.stopDrawing();
      this.resetVisualState();

      if (typeof this.stream !== "object") return;

      this.audio_activity = audioActivity(
        this.stream,
        { activity_threshold: this.activity_threshold },
        (level) => {
          this.current_audio_level = level;
        }
      );
      this.animation_frame_id = window.requestAnimationFrame(() =>
        this.drawVolume()
      );
    },
    drawVolume() {
      const canvas = this.$refs.canvas;
      if (!canvas) return;

      const dpr = 1;
      const canvas_width = Math.max(1, this.$el.clientWidth * dpr);
      const canvas_height = Math.max(1, this.$el.clientHeight * dpr);

      if (canvas_width !== canvas.width || canvas_height !== canvas.height) {
        canvas.width = canvas_width;
        canvas.height = canvas_height;
      }

      const ctx = canvas.getContext("2d");
      const recording_color =
        getComputedStyle(this.$el).getPropertyValue("--c-rouge").trim() ||
        "red";
      const background_color = this.is_tiny ? "#ececec" : "#eaeaea";
      ctx.fillStyle = background_color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const smoothing_factor = 0.2;
      this.display_audio_level +=
        (this.current_audio_level - this.display_audio_level) *
        smoothing_factor;

      const center_y = canvas.height / 2;
      const center_x = Math.floor(canvas.width * 0.66);
      const max_wave_amplitude = this.is_tiny
        ? canvas.height * 0.42
        : canvas.height * 0.48;
      const history_size = center_x + 1;
      while (this.level_history.length < history_size)
        this.level_history.push([undefined, false]);
      if (this.level_history.length > history_size)
        this.level_history = this.level_history.slice(
          this.level_history.length - history_size
        );

      this.level_history.unshift([this.display_audio_level, this.is_recording]);
      if (this.level_history.length > history_size) this.level_history.pop();

      if (this.display_audio_level > this.activity_threshold) {
        this.activity_hold_ticks = this.is_tiny ? 3 : 4;
      } else {
        this.activity_hold_ticks = Math.max(0, this.activity_hold_ticks - 1);
      }
      this.is_active = this.activity_hold_ticks > 0;

      ctx.lineWidth = 2;
      ctx.lineCap = "butt";

      ctx.beginPath();
      ctx.moveTo(0, center_y);
      ctx.lineTo(canvas.width, center_y);
      ctx.stroke();

      this.level_history.forEach(([level, is_recording], index) => {
        if (typeof level === "undefined") return;
        const x = center_x - index;
        if (x < 0) return;
        const line_height = Math.max(2, level * max_wave_amplitude);
        const y = center_y - line_height / 2;
        ctx.strokeStyle = is_recording ? recording_color : "#BBB";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + line_height);
        ctx.stroke();
      });

      this.animation_frame_id = window.requestAnimationFrame(() =>
        this.drawVolume()
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.m_audioEqualizer {
  width: 100%;
  height: 100%;

  overflow: hidden;

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    background-color: #eaeaea;
  }

  &.is--tiny {
    border-radius: 0.35rem;

    canvas {
      background-color: #ececec;
    }
  }
}
</style>
