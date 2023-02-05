<template>
  <div class="m_previewValidation" v-if="media_to_validate">
    <img
      v-if="media_to_validate.type === 'image'"
      :src="media_to_validate.objectURL"
    />
    <vue-plyr
      class="m_previewValidation--video"
      v-else-if="media_to_validate.type === 'video'"
    >
      <video
        ref="videoElement"
        :src="media_to_validate.objectURL"
        preload="auto"
      />
    </vue-plyr>
    <div
      v-else-if="media_to_validate.type === 'audio'"
      class="m_previewValidation--audio"
    >
      <img :src="media_to_validate.preview" />
      <vue-plyr>
        <audio
          ref="audioElement"
          :src="media_to_validate.objectURL"
          preload="none"
          @canplay="updatePaused"
          @playing="updatePaused"
          @pause="updatePaused"
        />
      </vue-plyr>
    </div>
    <div
      v-else-if="media_to_validate.type === 'svg'"
      v-html="media_to_validate.preview"
      class="m_previewValidation--svg"
    />
  </div>
</template>
<script>
export default {
  props: {
    media_to_validate: Object,
    audio_output_deviceId: String,
  },
  components: {},
  data() {
    return {
      is_paused: false,
    };
  },
  created() {},
  mounted() {
    this.setSinkId();
  },
  beforeDestroy() {},
  watch: {
    audio_output_deviceId: {
      handler() {
        this.setSinkId();
      },
    },
  },
  computed: {},
  methods: {
    setSinkId() {
      if (!this.audio_output_deviceId) return;

      if (this.media_to_validate.type === "video") {
        this.$refs.videoElement.setSinkId(this.audio_output_deviceId);
      } else if (this.media_to_validate.type === "audio") {
        this.$refs.audioElement.setSinkId(this.audio_output_deviceId);
      }
    },
    play() {
      this.$refs.audioElement.play();
    },
    updatePaused(event) {
      // this.videoElement = event.target;
      this.is_paused = event.target.paused;
    },
  },
};
</script>
<style lang="scss" scoped>
.m_previewValidation {
  position: absolute;
  top: 0;
  left: 0;
  // background-color: var(--c-noir);

  // border: 10px solid var(--c-rouge);
  padding: calc(var(--spacing) / 1);

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;
  object-fit: contain;

  > * {
    // position: absolute;
    object-fit: contain;
    width: 100%;
    height: 100%;
    margin: 0;
    // .padding-medium;
  }
  .m_previewValidation--audio {
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: column nowrap;

    .plyr .plyr__controls {
      color: white;
    }

    img {
      object-fit: contain;
    }

    > * {
      flex: 1 1 auto;
      // width: 100%;
      // height: 100%;
      height: 90%;

      &:last-child {
        height: auto;
      }
    }
  }
}

.play_picto {
  position: absolute;
  top: 0;
  left: 0;
  svg {
    width: 50px;
    height: 50px;
    padding: 10px;
    border-radius: 50%;
  }
}

.m_previewValidation--svg {
  ::v-deep {
    svg {
      width: 100%;
      height: 100%;
      max-width: 100%;
      margin: auto;
    }
  }
}
</style>
