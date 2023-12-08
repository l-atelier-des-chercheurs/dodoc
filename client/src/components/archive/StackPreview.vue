<template>
  <div class="u-card2 _stackPreview">
    <div class="_preview">
      <img v-if="cover_thumb" :src="cover_thumb" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    stack: Object,
  },
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    cover_thumb() {
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.stack.$cover,
        $type: "image",
        $path: this.stack.$path,
        resolution: 640,
      });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._preview {
  width: 100%;
  aspect-ratio: 1/1;
  overflow: hidden;
  background: var(--c-gris_clair);

  > * {
    object-fit: contain;
    object-position: bottom;
    height: 100%;
    width: 100%;
  }
}
</style>
