<template>
  <div
    class="_moduleEmbed"
    :class="{
      'is--ratioed': context !== 'page_by_page',
    }"
  >
    <!-- {{ publimodule }} -->
    <img :src="thumb" v-if="!is_active" class="_imgPreview" loading="eager" />
    <IframePreview v-else :full_url="file.$content" />
  </div>
</template>
<script>
export default {
  props: {
    publimodule: Object,
    file: Object,
    context: String,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      is_active: true,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    thumb() {
      const path_to_parent = this.file.$path.substring(
        0,
        this.file.$path.lastIndexOf("/")
      );
      debugger;
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.file.$thumbs,
        $type: this.file.$type,
        $path: path_to_parent,
        resolution: 1600,
      });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._moduleEmbed {
  &:not(.is--ratioed) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  &.is--ratioed {
    aspect-ratio: 16/9;
  }

  > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

._imgPreview {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  max-width: none;
}
</style>
