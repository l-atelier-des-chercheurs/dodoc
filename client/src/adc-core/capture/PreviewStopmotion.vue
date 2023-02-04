<template>
  <div>
    <div class="_player">
      <MediaContent :file="current_media" :resolution="1600" />
      <div class="_playBtn">
        <button
          type="button"
          class="u-button"
          @click="playPreview"
          v-if="!is_playing"
        >
          {{ $t("play") }}
        </button>
      </div>
      <div class="_fps">
        <label class="u-label">{{ $t("img_per_second") }}</label>
        <select v-model.number="new_frame_rate">
          <option>2</option>
          <option>4</option>
          <option>8</option>
          <option>15</option>
          <option>24</option>
          <option>30</option>
        </select>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    medias: Array,
    frame_rate: Number,
  },
  components: {},
  data() {
    return {
      current_media_index: 0,
      is_playing: false,
      preview_playing_event: undefined,
      new_frame_rate: this.frame_rate,
    };
  },
  created() {},
  mounted() {
    this.playPreview();
  },
  beforeDestroy() {},
  watch: {
    new_frame_rate() {
      this.$emit("update:frame_rate", this.new_frame_rate);
    },
  },
  computed: {
    current_media() {
      return this.medias[this.current_media_index];
    },
  },
  methods: {
    playPreview() {
      this.is_playing = true;

      this.preview_playing_event = window.setInterval(() => {
        this.current_media_index++;

        this.$nextTick(() => {
          if (this.current_media_index === this.medias.length - 1)
            this.stopPreview();
        });
      }, 1000 / this.frame_rate);
    },
    stopPreview() {
      this.is_playing = false;

      window.clearInterval(this.preview_playing_event);
      this.preview_playing_event = undefined;
      this.current_media_index = 0;
    },
  },
};
</script>
<style lang="scss" scoped>
._player {
  position: absolute;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  background: black;
}

._playBtn {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;

  padding: calc(var(--spacing) / 1);
}

._fps {
}
</style>
