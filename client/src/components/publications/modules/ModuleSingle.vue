<template>
  <div class="_moduleSingle">
    <MediaContent :file="source_media" :resolution="1600" :context="'full'" />
  </div>
</template>
<script>
export default {
  props: {
    publimodule: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    source_media() {
      if (
        !this.publimodule.source_medias ||
        this.publimodule.source_medias.length === 0
      )
        return false;
      return this.getSourceMedia({
        source_media_path: this.publimodule.source_medias[0].path,
      });
    },
  },
  methods: {
    removeMedia() {
      this.$emit("updateMeta", { source_medias: [] });
    },
  },
};
</script>
<style lang="scss" scoped>
._moduleSingle {
}
._mediaGrid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: calc(var(--spacing) / 4);
  width: 100%;

  > ._mediaGrid--item {
    position: relative;
    aspect-ratio: 1/1;
    overflow: hidden;

    ::v-deep ._mediaContent {
      img {
        position: absolute;
        height: 100%;
        width: 100%;
        object-fit: cover;
      }
    }
  }
}

._mediaPickerTile {
  background: var(--c-gris);
  width: 100%;
  height: 100%;
  display: flex;
  place-content: center;
}
._removeMedia {
  position: absolute;
  padding: calc(var(--spacing) / 2);
  bottom: 0;
  right: 0;
  left: auto;

  button {
    background: rgba(255, 255, 255, 0.7);
  }
}
</style>
