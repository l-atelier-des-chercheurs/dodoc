<template>
  <div class="_cropMedia">
    <div class="_topPanes">
      <div class="_btn">
        <button type="button" class="u-button" @click="zoomIn">
          {{ $t("zoom") }}
          <b-icon icon="plus" />
        </button>
        <button type="button" class="u-button" @click="zoomOut">
          {{ $t("zoom") }}
          <b-icon icon="dash" />
        </button>
        <button type="button" class="u-button" @click="flipX">
          {{ $t("flip_horizontally") }}
          <b-icon icon="arrow-left-right" />
        </button>
        <button type="button" class="u-button" @click="flipY">
          {{ $t("flip_vertically") }}
          <b-icon icon="arrow-left-right" rotate="90" />
        </button>
        <button type="button" class="u-button" @click="rotateLeft">
          {{ $t("rotate_left") }}
          <b-icon icon="arrow-counterclockwise" />
        </button>
        <button type="button" class="u-button" @click="rotateRight">
          {{ $t("rotate_right") }}
          <b-icon icon="arrow-clockwise" />
        </button>
      </div>
      <div class="">
        <Cropper
          ref="cropper"
          :src="file_full_path"
          :default-size="defaultSize"
          @change="onChange"
        />
      </div>
    </div>
    <div class="_bottomBar">
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="previewMedia"
      >
        {{ $t("next") }}
        <b-icon icon="arrow-right" />
      </button>
    </div>
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
    defaultSize({ imageSize, visibleArea }) {
      return {
        width: (visibleArea || imageSize).width,
        height: (visibleArea || imageSize).height,
      };
    },
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
      this.$refs.cropper.rotate(-90);
    },
    rotateRight() {
      this.$refs.cropper.rotate(90);
    },
    async previewMedia() {
      const { canvas } = this.$refs.cropper.getResult();
      this.$emit("updateCrop", canvas.toDataURL());
    },
  },
};
</script>
<style lang="scss" scoped>
._cropMedia {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
}
._topPanes {
  flex: 1 1 0;
  background: var(--c-gris_fonce);
  padding: var(--spacing);
}
._bottomBar {
  flex: 0 0 auto;
}

._btn {
  display: flex;
  flex-flow: row wrap;
  gap: var(--spacing);
  margin-bottom: var(--spacing);
}
._bottomBar {
  text-align: center;
  padding: var(--spacing);
}
</style>
