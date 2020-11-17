<template>
  <div>
    <button
      type="button"
      class="bg-orange button-inline _captureButton"
      :class="{ 'is--justCaptured': capture_button_pressed }"
      :disabled="is_saving"
      @mousedown.stop.prevent="captureOrStop()"
      @touchstart.stop.prevent="captureOrStop()"
    >
      <img
        v-if="!is_recording"
        class="inline-svg inline-svg_larger"
        src="/images/i_record.svg"
      />
      <img v-else class="inline-svg" src="/images/i_stop.svg" />

      <span v-if="selected_mode === 'photo'"> {{ $t("take_picture") }}</span>
      <span v-else-if="selected_mode === 'video'"> {{ $t("take_video") }}</span>
    </button>
  </div>
</template>
<script>
export default {
  props: {
    selected_mode: String,
  },
  components: {},
  data() {
    return {
      is_sending_to_server: true,
      is_recording: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    captureKeyListener(event) {
      console.log("METHODS • CaptureView: captureKeyListener");

      // don’t register if validating a media
      if (this.media_to_validate || this.is_validating_stopmotion_video) {
        return false;
      }

      // disabled because it clashes with the input type range from stopmotion panel
      // if (event.target.tagName.toLowerCase() === 'input' || event.target.tagName.toLowerCase() === 'textarea') {
      //   return false;
      // }

      switch (event.key) {
        case "w":
        case "z":
        case "ArrowLeft":
          this.previousMode();
          break;
        case "s":
        case "ArrowRight":
          this.nextMode();
          break;
        case "a":
        case "q":
        case " ":
          this.captureOrStop();
          break;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
