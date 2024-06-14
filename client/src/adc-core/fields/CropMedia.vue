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
        <span class="_spacer" />
        <button type="button" class="u-button" @click="flipX">
          {{ $t("flip_horizontally") }}
          <b-icon icon="arrow-left-right" />
        </button>
        <button type="button" class="u-button" @click="flipY">
          {{ $t("flip_vertically") }}
          <b-icon icon="arrow-left-right" rotate="90" />
        </button>
        <span class="_spacer" />
        <button type="button" class="u-button" @click="rotateLeft">
          {{ $t("rotate_left") }}
          <b-icon icon="arrow-counterclockwise" />
        </button>
        <button type="button" class="u-button" @click="rotateRight">
          {{ $t("rotate_right") }}
          <b-icon icon="arrow-clockwise" />
        </button>
      </div>
      <div class="_aspectRatio">
        <label for="aspect_ratio">{{ $t("aspect_ratio") }}</label>
        <select v-model="aspect_ratio">
          <option
            v-for="ratio in available_aspect_ratios"
            :key="ratio.key"
            :value="ratio.key"
          >
            {{ ratio.label }}
          </option>
        </select>
        <input
          type="number"
          v-if="aspect_ratio === 'custom'"
          v-model.number="custom_aspect_ratio"
        />
        <small>{{ $t("custom_aspect_ratio") }}</small>
      </div>
      <div class="u-spacingBottom" />
      <Cropper
        class="_cropper"
        :key="'' + stencil_props"
        ref="cropper"
        :src="file_full_path"
        :default-size="defaultSize"
        :stencil-props="stencil_props"
        @change="onChange"
      />
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
      aspect_ratio: "none",
      available_aspect_ratios: [
        { key: "none", label: this.$t("free") },
        { key: "square", label: this.$t("square") },
        { key: "16 / 9", label: "16 / 9" },
        { key: "4 / 3", label: "4 / 3" },
        { key: "3 / 4", label: "3 / 4" },
        { key: "2 / 3", label: "2 / 3" },
        { key: "3 / 2", label: "3 / 2" },
        { key: "A_portrait", label: this.$t("A_portrait") },
        { key: "A_landscape", label: this.$t("A_landscape") },
        { key: "custom", label: this.$t("custom") },
      ],
      custom_aspect_ratio: 1,
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
    stencil_props() {
      if (this.aspect_ratio === "none") return {};
      if (this.aspect_ratio === "square") return { aspectRatio: 1 / 1 };
      if (this.aspect_ratio === "16 / 9") return { aspectRatio: 16 / 9 };
      if (this.aspect_ratio === "4 / 3") return { aspectRatio: 4 / 3 };
      if (this.aspect_ratio === "3 / 4") return { aspectRatio: 3 / 4 };
      if (this.aspect_ratio === "2 / 3") return { aspectRatio: 2 / 3 };
      if (this.aspect_ratio === "3 / 2") return { aspectRatio: 3 / 2 };
      if (this.aspect_ratio === "A_portrait") return { aspectRatio: 21 / 29.7 };
      if (this.aspect_ratio === "A_landscape")
        return { aspectRatio: 29.7 / 21 };
      if (this.aspect_ratio === "custom")
        return { aspectRatio: this.custom_aspect_ratio };
      return {};
    },
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
  padding: calc(var(--spacing) / 2);

  display: flex;
  flex-flow: column nowrap;
  overflow: hidden;
}
._bottomBar {
  flex: 0 0 auto;
}

._btn {
  // padding: calc(var(--spacing) / 2) 0;
  padding-right: 0;
  // padding-bottom: 0;

  > * {
    margin-right: calc(var(--spacing) / 2);
    margin-bottom: calc(var(--spacing) / 2);
  }

  // ._spacer {
  //   padding:
  // }
}
._cropper {
  flex: 1 1 0;

  overflow: hidden;

  ::v-deep {
    .vue-advanced-cropper__background,
    .vue-advanced-cropper__foreground {
      background-color: var(--c-noir);
    }
  }
}

._bottomBar {
  text-align: center;
  padding: var(--spacing);
}

._aspectRatio {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  select {
    width: 20ch;
  }
  > * {
  }
}
</style>
