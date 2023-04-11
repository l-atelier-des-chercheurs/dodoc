<template>
  <div>
    <div class="_player">
      <template v-if="!created_stopmotion">
        <MediaContent :file="current_media" :resolution="1600" />
        <div v-if="!is_playing" class="_miniListPreview">
          <MediaContent
            v-for="media in medias"
            :key="'previews-' + media.$path"
            :file="media"
            :resolution="1600"
          />
        </div>

        <button type="button" class="_playPauseBtn" @click="playPausePreview">
          <img
            v-if="!is_playing"
            :src="`${$root.publicPath}images/i_play.svg`"
            width="48"
            height="48"
            draggable="false"
          />
          <!-- {{ $t("play") }} -->
        </button>

        <transition name="fade">
          <div class="_fps" v-if="!is_playing">
            <div class="">
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
        </transition>
      </template>
      <template v-else>
        <MediaContent
          :key="created_stopmotion.$path"
          context="full"
          :file="created_stopmotion"
          :resolution="1600"
        />
      </template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    medias: Array,
    frame_rate: Number,
    created_stopmotion: [Boolean, Object],
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
    // this.playPreview();
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
    playPausePreview() {
      if (!this.is_playing) this.playPreview();
      else this.stopPreview();
    },
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
  flex-flow: column nowrap;

  justify-content: center;
  align-items: center;
  background: black;
}

._playPauseBtn {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;

  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;

  padding: calc(var(--spacing) / 1);

  button {
    border-radius: 50%;
    padding: calc(var(--spacing) / 2);
  }
}

._fps {
  position: absolute;

  display: flex;
  justify-content: center;
  bottom: 0;
  width: 100%;
  padding: calc(var(--spacing) / 1);
}

._miniListPreview {
  display: flex;
  flex-flow: row wrap;
  // height: 100%;
  // width: 100%;
  position: relative;
  gap: 1px;

  justify-content: center;
  align-items: center;
  align-content: center;
  padding: calc(var(--spacing) * 2);

  > * {
    width: 50px;
    height: 50px;
  }
}
</style>
