<template>
  <div class="m_previewValidation" v-if="media_to_validate">
    <img
      v-if="media_to_validate.type === 'image'"
      :src="media_to_validate.objectURL"
    />
    <vue-plyr
      v-else-if="media_to_validate.type === 'video'"
      :options="plyr_options"
    >
      <video
        :poster="linkToVideoThumb"
        :src="media_to_validate.objectURL"
        preload="none"
      />
    </vue-plyr>
    <div
      v-else-if="media_to_validate.type === 'audio'"
      class="m_previewValidation--audio"
    >
      <img :src="media_to_validate.preview" />
      <vue-plyr :options="plyr_options">
        <audio :src="media_to_validate.objectURL" preload="none" />
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
  },
  components: {},
  data() {
    return {
      plyr_options: {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "fullscreen",
        ],
        iconUrl: "/images/plyr.svg",
      },
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
.m_previewValidation {
  position: absolute;
  top: 0;
  left: 0;

  width: 100%;
  height: 100%;
  object-fit: contain;

  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}
</style>
