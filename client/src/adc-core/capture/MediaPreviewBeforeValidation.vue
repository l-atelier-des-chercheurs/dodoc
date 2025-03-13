<template>
  <div class="m_previewValidation" v-if="media_to_validate">
    <img
      v-if="media_to_validate.type === 'image'"
      :src="media_to_validate.objectURL"
    />
    <vue-plyr
      class="m_previewValidation--video"
      v-else-if="
        media_to_validate.type === 'video' || media_to_validate.type === 'audio'
      "
    >
      <video
        ref="videoElement"
        :src="media_to_validate.objectURL"
        :poster="media_to_validate.preview"
        preload="auto"
      />
    </vue-plyr>
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
    return {};
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

      if (
        this.media_to_validate.type === "video" ||
        this.media_to_validate.type === "audio"
      ) {
        this.$refs.videoElement.setSinkId(this.audio_output_deviceId);
      }
      // else if (this.media_to_validate.type === "audio") {
      //   this.$refs.audioElement.setSinkId(this.audio_output_deviceId);
      // }
    },
  },
};
</script>
<style lang="scss" scoped>
.m_previewValidation {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #000;

  // border: 10px solid var(--c-rouge);
  padding: calc(var(--spacing) * 1);

  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;
  height: 100%;
  object-fit: contain;

  ::v-deep {
    > * {
      // position: absolute;
      object-fit: contain;
      width: 100%;
      height: 100%;
      margin: 0;
    }
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
