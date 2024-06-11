<template>
  <div>
    <div class="_btnRow">
      <button type="button" class="u-button" @click="zoomIn">
        zoom
        <b-icon icon="plus" />
      </button>
      <button type="button" class="u-button" @click="zoomOut">
        zoom
        <b-icon icon="dash" />
      </button>
      <button type="button" class="u-button" @click="flipX">
        flip horizontally
        <b-icon icon="flip" />
      </button>
      <button type="button" class="u-button" @click="flipY">
        flip vertically
        <b-icon icon="flip" />
      </button>
      <button type="button" class="u-button" @click="rotateLeft">
        rotate left
        <b-icon icon="rotate-left" />
      </button>
      <button type="button" class="u-button" @click="rotateRight">
        rotate right
        <b-icon icon="rotate-right" />
      </button>
    </div>
    <Cropper ref="cropper" :src="file_full_path" @change="onChange" />
    <button
      type="button"
      class="u-button u-button_bleuvert"
      @click="previewMedia"
    >
      <b-icon icon="tools" />
      {{ $t("preview") }}
    </button>
  </div>
</template>
<script>
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import "vue-advanced-cropper/dist/theme.compact.css";

export default {
  props: {
    media: Object,
  },
  components: {
    Cropper,
  },
  data() {
    return {
      result: {
        coordinates: null,
        image: null,
      },
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    file_full_path() {
      const p = this.makeMediaFilePath({
        $path: this.media.$path,
        $media_filename: this.media.$media_filename,
      });
      return `/${p}?v=${this.timestamp}`;
    },
    timestamp() {
      if (this.media.$date_created) return +new Date(this.media.$date_created);
      else return +new Date();
    },
  },
  methods: {
    onChange({ coordinates, image }) {
      this.result.coordinates = coordinates;
      this.result.image = image;
    },
    zoomIn() {
      console.log("zoomIn");
      this.$refs.cropper.zoom(1.5);
    },
    zoomOut() {
      console.log("zoomOut");
      this.$refs.cropper.zoom(0.66);
    },
    flipX() {
      console.log("flipX");
      this.$refs.cropper.flip(true, false);
    },
    flipY() {
      console.log("flipY");
      this.$refs.cropper.flip(false, true);
    },
    rotateLeft() {
      this.$refs.cropper.rotate(90);
    },
    rotateRight() {
      this.$refs.cropper.rotate(-90);
    },
    async previewMedia() {
      console.log("previewMedia");
      const { canvas } = this.$refs.cropper.getResult();

      this.$emit("updateCrop", canvas.toDataURL());
    },
  },
};
</script>
<style lang="scss" scoped></style>
