<template>
  <div class="_cropMedia">
    <div class="_topPanes">
      <div class="_btn">
        <button type="button" class="u-button u-button_small" @click="zoomIn">
          {{ $t("zoom") }}
          <b-icon icon="plus" />
        </button>
        <button type="button" class="u-button u-button_small" @click="zoomOut">
          {{ $t("zoom") }}
          <b-icon icon="dash" />
        </button>
        <span class="_spacer" v-text="'•'" />
        <button type="button" class="u-button u-button_small" @click="flipX">
          {{ $t("flip_horizontally") }}
          <b-icon icon="arrow-left-right" />
        </button>
        <button type="button" class="u-button u-button_small" @click="flipY">
          {{ $t("flip_vertically") }}
          <b-icon icon="arrow-left-right" rotate="90" />
        </button>
        <span class="_spacer" v-text="'•'" />
        <button
          type="button"
          class="u-button u-button_small"
          @click="rotateCrop(-90)"
        >
          {{ $t("rotate_90_deg") }}
          <b-icon icon="arrow-counterclockwise" />
        </button>
        <button
          type="button"
          class="u-button u-button_small"
          @click="rotateCrop(90)"
        >
          {{ $t("rotate_90_deg") }}
          <b-icon icon="arrow-clockwise" />
        </button>
        <button
          type="button"
          class="u-button u-button_small"
          @click="show_rotate_deg_picker = true"
        >
          {{ $t("rotate_x_deg") }}
        </button>
        <BaseModal2
          v-if="show_rotate_deg_picker"
          :title="$t('rotate_x_deg')"
          :is_closable="true"
          @close="show_rotate_deg_picker = false"
        >
          <form @submit.prevent="rotateSpecificCrop">
            <div class="u-spacingBottom">
              <NumberInput
                :label="$t('angle')"
                :value="rotation_deg"
                :size="'medium'"
                :min="0"
                :max="360"
                :step="1"
                :suffix="'°'"
                @save="rotation_deg = $event"
              />
            </div>
            <button class="u-button u-button_bleuvert" type="submit">
              {{ $t("rotate") }}
            </button>
          </form>
        </BaseModal2>

        <span class="_spacer" v-text="'•'" />
        <button
          type="button"
          class="u-button u-button_small u-button_red"
          @click="resetCrop"
        >
          {{ $t("reset_crop") }}
          <b-icon icon="arrow-counterclockwise" />
        </button>
      </div>
      <div class="_resizeRatio" v-if="!forced_ratio">
        <div>
          <DLabel :str="$t('constrain_crop_resize')" />
          <label>
            <input type="radio" v-model="crop_resize_mode" :value="'none'" />
            {{ $t("none_f") }}
          </label>
          <label>
            <input type="radio" v-model="crop_resize_mode" :value="'ratio'" />
            {{ $t("aspect_ratio") }}
          </label>
          <label>
            <input type="radio" v-model="crop_resize_mode" :value="'resize'" />
            {{ $t("resize") }}
          </label>
        </div>

        <div class="_targetResolution" v-if="crop_resize_mode === 'resize'">
          <div class="u-sameRow">
            <NumberInput
              :label="$t('width')"
              :value="new_width"
              :min="0"
              :suffix="'px'"
              @save="new_width = $event"
            />
            <NumberInput
              :label="$t('height')"
              :value="new_height"
              :min="0"
              :suffix="'px'"
              @save="new_height = $event"
            />
          </div>
        </div>
        <div class="_aspectRatio" v-if="crop_resize_mode === 'ratio'">
          <DLabel :str="$t('aspect_ratio')" />
          <select v-model="aspect_ratio">
            <option
              v-for="ratio in available_aspect_ratios"
              :key="ratio.key"
              :value="ratio.key"
            >
              {{ ratio.label }}
            </option>
          </select>
          <div v-if="aspect_ratio === 'custom'">
            <input
              type="number"
              min="0.1"
              max="100"
              v-model.number="custom_aspect_ratio"
            />
            <small>{{ $t("custom_aspect_ratio") }}</small>
          </div>
        </div>
      </div>

      <!-- 
      <div class="_resolution">
        <ResolutionDisplay
          v-if="img_width && img_height"
          :width="img_width"
          :height="img_height"
        />
        <ToggledSection
          class=""
          :label="$t('resize')"
          :can_toggle="true"
          :show_toggle.sync="is_resizing"
        >
          <NumberInput
            :label="$t('width')"
            :value="new_width"
            :min="0"
            :suffix="'%'"
            @save="new_width = $event"
          />
          <NumberInput
            :label="$t('height')"
            :value="new_height"
            :min="0"
            :suffix="'%'"
            @save="new_height = $event"
          />
        </ToggledSection> 
      </div>
      -->

      <div class="_cropper" v-if="cropper_src">
        <Cropper
          class=""
          :key="'' + stencil_props"
          ref="cropper"
          :src="cropper_src"
          :default-size="defaultSize"
          :stencil-props="stencil_props"
          :stencil-component="
            preview_format === 'circle' ? 'circle-stencil' : undefined
          "
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
import "vue-advanced-cropper/dist/theme.bubble.css";

export default {
  props: {
    media: Object,
    blob: String,
    forced_ratio: String,
    preview_format: String,
  },
  components: {
    Cropper,
  },
  data() {
    return {
      crop_resize_mode: "none",
      show_percent_picker: false,
      show_rotate_deg_picker: false,

      rotation_deg: 5,

      aspect_ratio: "original",
      available_aspect_ratios: [
        { key: "original", label: this.$t("original") },
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

      img_width: this.media?.$infos?.width || undefined,
      img_height: this.media?.$infos?.height || undefined,
      new_width: this.media?.$infos?.width || undefined,
      new_height: this.media?.$infos?.height || undefined,
    };
  },
  created() {},
  mounted() {
    this.initCrop();
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    stencil_props() {
      if (this.crop_resize_mode === "none") return {};

      if (this.crop_resize_mode === "resize") {
        if (!this.new_width || !this.new_height)
          return { aspectRatio: undefined };
        const aspectRatio = this.new_width / this.new_height;
        return {
          aspectRatio,
        };
      }

      if (this.aspect_ratio === "original")
        return {
          aspectRatio: this.img_width / this.img_height,
        };
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
    cropper_src() {
      if (this.media)
        return this.makeMediaFilePath({
          $path: this.media.$path,
          $media_filename: this.media.$media_filename,
          with_timestamp: true,
          $date_created: this.media.$date_created,
        });
      else if (this.blob) return this.blob;
      return null;
    },
  },
  methods: {
    initCrop() {
      this.crop_resize_mode = this.forced_ratio ? "ratio" : "none";
      this.aspect_ratio = this.forced_ratio || "original";
      this.custom_aspect_ratio = 1;
      if (this.$refs.cropper) this.$refs.cropper.reset();
    },
    resetCrop() {
      this.initCrop();
    },
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
    unZoom() {
      this.$refs.cropper.zoom(0.001);
    },
    rotateCrop(deg = 90) {
      this.$refs.cropper.rotate(deg);

      setTimeout(() => {
        this.unZoom();
      }, 500);
    },
    rotateSpecificCrop() {
      this.show_rotate_deg_picker = false;
      this.$refs.cropper.rotate(this.rotation_deg);

      setTimeout(() => {
        this.unZoom();
      }, 500);
    },
    rotateXPercent() {
      this.show_percent_picker = true;
    },
    async previewMedia() {
      const { coordinates, canvas } = this.$refs.cropper.getResult();

      if (["none", "ratio"].includes(this.crop_resize_mode)) {
        this.$emit("updateCrop", canvas.toDataURL());
      } else if (
        this.crop_resize_mode === "resize" &&
        this.new_width &&
        this.new_height
      ) {
        let img = new Image();
        img.src = canvas.toDataURL();
        await img.decode();

        const resized_canvas = document.createElement("canvas");
        resized_canvas.width = this.new_width;
        resized_canvas.height = this.new_height;

        const ctx = resized_canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, this.new_width, this.new_height);

        this.$emit("updateCrop", resized_canvas.toDataURL());
      }
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
  // background: var(--c-noir);
  padding-top: calc(var(--spacing) / 1);

  display: flex;
  flex-flow: column nowrap;
  overflow: auto;

  > *:not(:last-child) {
    border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  }
}
._bottomBar {
  flex: 0 0 auto;
}

._btn {
  padding: 0 calc(var(--spacing) / 1) calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 1);

  > * {
    margin-right: calc(var(--spacing) / 2);
    margin-bottom: calc(var(--spacing) / 2);
  }

  // ._spacer {
  //   padding:
  // }
}

._bottomBar {
  text-align: center;
  padding: calc(var(--spacing) / 2);
}

._resizeRatio {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  padding: 0 calc(var(--spacing) / 1) calc(var(--spacing) / 1);
}

._targetResolution {
  flex: 0 0 240px;
}

._aspectRatio {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  // margin-bottom: calc(var(--spacing) / 2);

  select,
  input {
    width: 20ch;
  }
}

._cropper {
  flex: 1 1 0;
  padding: calc(var(--spacing) / 1);
  overflow: hidden;
  min-height: 240px;

  ::v-deep {
    .vue-advanced-cropper {
      height: 100%;
    }

    .vue-advanced-cropper__background,
    .vue-advanced-cropper__foreground {
      background-color: white;
    }
    .vue-advanced-cropper__foreground {
      cursor: move;
    }
    .vue-simple-handler {
      border-width: 3px;
      background-color: var(--c-orange);
      // border-color: var(--c-orange);
      opacity: 1;

      &:hover {
        border-color: white;
      }
    }
    .vue-simple-line {
      border-color: var(--c-orange);

      &:hover {
        border-color: white;
      }
    }
    .vue-simple-line--east {
      border-right-width: 2px;
    }
    .vue-simple-line--south {
      border-bottom-width: 2px;
    }
    .vue-simple-line--north {
      border-top-width: 2px;
    }
    .vue-simple-line--west {
      border-left-width: 2px;
    }
  }
}
</style>
