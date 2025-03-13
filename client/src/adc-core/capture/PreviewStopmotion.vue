<template>
  <div>
    <div class="_player">
      <template v-if="!created_stopmotion">
        <MediaContent
          v-if="current_media"
          :file="current_media.media"
          :resolution="1600"
        />
        <div v-if="!is_playing" class="_miniListPreview">
          <MediaContent
            v-for="{ media } in medias"
            :key="'previews-' + media.$path"
            :file="media"
            :resolution="1600"
          />
        </div>

        <div class="_imgCount">
          {{ current_media_index + 1 }}/{{ medias.length }}
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
            <div class="u-sameRow">
              <div>
                <label class="u-label" for="fps_select">{{
                  $t("img_per_second")
                }}</label>
                <select
                  v-model.number="new_frame_rate"
                  size="small"
                  name="fps_select"
                  id="fps_select"
                >
                  <option>2</option>
                  <option>4</option>
                  <option>8</option>
                  <option>15</option>
                  <option>24</option>
                  <option>30</option>
                </select>
              </div>
              <div>
                <label class="u-label" for="output_format">{{
                  $t("format")
                }}</label>
                <select
                  v-model="new_output_format"
                  size="small"
                  name="output_format"
                  :id="output_format"
                >
                  <option :value="'gif'">{{ $t("gif") }}</option>
                  <option :value="'mp4'">{{ $t("video") }}</option>
                </select>
              </div>
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
    output_format: String,
    created_stopmotion: [Boolean, Object],
  },
  components: {},
  data() {
    return {
      current_media_index: 0,
      is_playing: false,
      new_frame_rate: this.frame_rate,
      new_output_format: this.output_format,
      next_image_timeout: null,
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
    new_output_format() {
      this.$emit("update:output_format", this.new_output_format);
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
    stopPreview() {
      this.is_playing = false;
      window.clearTimeout(this.next_image_timeout);
    },
    playPreview() {
      this.is_playing = true;

      const playCurrentImage = () => {
        const duration = this.current_media.duration;
        const time_between_images = 1000 / this.frame_rate;
        const time_for_image = duration * time_between_images;

        this.next_image_timeout = window.setTimeout(() => {
          if (this.current_media_index < this.medias.length - 1) {
            this.current_media_index++;
            playCurrentImage();
          } else {
            this.is_playing = false;
            return;
          }
        }, time_for_image);
      };

      this.current_media_index = 0;
      playCurrentImage(this.current_media_index);
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

  ::v-deep {
    ._mediaContent,
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
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

  > * {
    background: var(--c-noir);

    label {
      color: white;
    }
    padding: calc(var(--spacing) / 4);
  }
}

._miniListPreview {
  display: flex;
  flex-flow: row wrap;
  // height: 100%;
  // width: 100%;
  position: absolute;
  gap: 1px;

  z-index: -1;
  opacity: 0.5;

  justify-content: center;
  align-items: center;
  align-content: center;
  padding: calc(var(--spacing) * 2);

  > * {
    width: 50px;
    height: 50px;
  }
}

._imgCount {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: calc(var(--spacing) / 2);
  color: white;
  font-size: var(--sl-font-size-small);
}
</style>
