<template>
  <div class="_cropImage">
    <div class="_sidebyside">
      <div class="_leftBtns">
        <fieldset>
          <legend class="u-label">{{ $t("crop") }}</legend>

          <div class="_btnRow">
            <button
              type="button"
              class="u-button u-button_small u-button_orange"
              @click="resetCrop"
            >
              <b-icon icon="plus-square-dotted" />
              {{ $t("reset_crop") }}
            </button>
            <button
              type="button"
              class="u-button u-button_small u-button_bleuvert"
              @click="rotateImage(90)"
              disabled
            >
              <b-icon icon="arrow-clockwise" />
            </button>
            <button
              type="button"
              class="u-button u-button_small u-button_bleuvert"
              @click="rotateImage(-90)"
              disabled
            >
              <b-icon icon="arrow-counterclockwise" />
            </button>
          </div>

          <div class="_values">
            <NumberInput
              :label="'x'"
              :value="
                make.crop_options && make.crop_options.x
                  ? make.crop_options.x
                  : 0
              "
              :min="0"
              :suffix="'%'"
              @save="updateFromInputs({ x: $event })"
            />
            <NumberInput
              :label="'y'"
              :value="
                make.crop_options && make.crop_options.y
                  ? make.crop_options.y
                  : 0
              "
              :min="0"
              :suffix="'%'"
              @save="updateFromInputs({ y: $event })"
            />
          </div>
          <div class="u-spacingBottom _values">
            <NumberInput
              :label="$t('width')"
              :value="
                make.crop_options && make.crop_options.width
                  ? make.crop_options.width
                  : 30
              "
              :min="0"
              :suffix="'%'"
              @save="updateFromInputs({ width: $event })"
            />
            <NumberInput
              :label="$t('height')"
              :value="
                make.crop_options && make.crop_options.height
                  ? make.crop_options.height
                  : 20
              "
              :min="0"
              :suffix="'%'"
              @save="updateFromInputs({ height: $event })"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend class="u-label">{{ $t("adjust") }}</legend>

          <RangeValueInput
            :can_toggle="true"
            :label="$t('brightness')"
            :value="make.image_brightness"
            :min="0"
            :max="200"
            :step="1"
            :default_value="100"
            :suffix="'%'"
            @save="updatePubliMeta({ image_brightness: $event })"
          />
          <RangeValueInput
            :can_toggle="true"
            :label="$t('contrast')"
            :value="make.image_contrast"
            :min="0"
            :max="200"
            :step="1"
            :default_value="100"
            :suffix="'%'"
            @save="updatePubliMeta({ image_contrast: $event })"
          />
          <RangeValueInput
            :can_toggle="true"
            :label="$t('saturation')"
            :value="make.image_saturation"
            :min="0"
            :max="200"
            :step="1"
            :default_value="100"
            :suffix="'%'"
            @save="updatePubliMeta({ image_saturation: $event })"
          />
          <RangeValueInput
            :can_toggle="true"
            :label="$t('blur')"
            :value="make.image_blur"
            :min="0"
            :max="100"
            :step="1"
            :default_value="0"
            :suffix="'px'"
            @save="updatePubliMeta({ image_blur: $event })"
          />
        </fieldset>

        <div class="">
          <button
            type="button"
            class="u-button u-button_bleumarine"
            @click="show_save_export_modal = true"
          >
            <b-icon icon="check" />
            {{ $t("submit") }}
          </button>
        </div>
      </div>

      <div class="_cropWindow">
        <div class="_canvasContainer" ref="cropCanvasContainer">
          <canvas class="_canvas" ref="cropCanvas" width="1280" height="720" />
          <div class="_mask">
            <div class="_maskContent" :style="mask_styles" />
          </div>
          <DDR
            class="_cropFrame"
            :key="crop_key"
            :value="crop_transform"
            :rotatable="false"
            :acceptRatio="aspect_ratio"
            :id="'1'"
            :parent="true"
            :handlerSize="20"
            @drag="updateMask"
            @dragend="dragEnd"
            @resizestart="resizeStart"
            @resize="updateMask"
            @resizeend="dragEnd"
          />
        </div>
      </div>
    </div>

    <ExportSaveMakeModal
      v-if="show_save_export_modal"
      :title="$t('save_export_cropped')"
      :export_blob="export_blob"
      :export_name="image_export_name"
      :project_path="project_path"
      @close="show_save_export_modal = false"
    >
      <div class="u-spacingBottom _preview">
        <canvas
          class="_previewCanvas"
          ref="previewCanvas"
          width="1280"
          height="720"
        />
      </div>
      {{ $t("resolution") }}: {{ export_width }}×{{ export_height }}
    </ExportSaveMakeModal>
  </div>
</template>
<script>
import DDR from "@/ddr/index.vue"; // eslint-disable-line
import "yoyoo-ddr/dist/yoyoo-ddr.css";

import ExportSaveMakeModal from "@/components/makes/ExportSaveMakeModal.vue";

export default {
  props: {
    make: Object,
    project_path: String,
    base_media: Object,
  },
  components: {
    DDR,
    ExportSaveMakeModal,
  },
  data() {
    return {
      scale: 1,

      export_blob: false,
      export_width: 0,
      export_height: 0,

      crop_key: new Date().getTime(),
      aspect_ratio: true,

      show_crop: true,
      crop_transform: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
      },
      mask_prop: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
      },

      show_save_export_modal: false,
    };
  },
  created() {},
  async mounted() {
    if (this.base_media)
      this.$nextTick(async () => {
        await this.drawImageToCanvas();
        this.setTransformFromMake();
      });
  },
  beforeDestroy() {},
  watch: {
    "make.crop_options": {
      handler() {
        this.setTransformFromMake();
      },
      deep: true,
    },
    async "make.image_brightness"() {
      await this.drawImageToCanvas();
    },
    async "make.image_contrast"() {
      await this.drawImageToCanvas();
    },
    async "make.image_saturation"() {
      await this.drawImageToCanvas();
    },
    async "make.image_blur"() {
      await this.drawImageToCanvas();
    },
    base_media() {
      (async () => {
        await this.drawImageToCanvas();
        await this.resetCrop();
      })();
    },
    show_save_export_modal() {
      if (this.show_save_export_modal)
        this.$nextTick(() => {
          this.$nextTick(() => {
            this.updatePreviewCanvas();
          });
        });
    },
    "$root.window.innerWidth"() {
      this.setTransformFromMake();
    },
    "$root.window.innerHeight"() {
      this.setTransformFromMake();
    },
  },
  computed: {
    image_export_name() {
      return this.base_media.$media_filename + "_edited.png";
    },
    image_url() {
      return this.makeMediaFileURL({
        $path: this.base_media.$path,
        $media_filename: this.base_media.$media_filename,
      });
    },
    mask_styles() {
      return {
        left: this.mask_prop.x + "px",
        top: this.mask_prop.y + "px",
        width: this.mask_prop.width + "px",
        height: this.mask_prop.height + "px",
      };
    },
  },
  methods: {
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.make.$path,
        new_meta,
      });
    },
    async resetCrop() {
      const default_transform = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
      };
      await this.updatePubliMeta({
        crop_options: default_transform,
      });
    },
    setTransformFromMake() {
      let x = this.make.crop_options?.x || 0;
      let y = this.make.crop_options?.y || 0;
      let width = this.make.crop_options?.width || 100;
      let height = this.make.crop_options?.height || 100;

      const cropCanvas = this.$refs.cropCanvas;
      const cw = cropCanvas.parentElement.offsetWidth;
      const ch = cropCanvas.parentElement.offsetHeight;

      this.crop_transform.x = (x / 100) * cw;
      this.crop_transform.y = (y / 100) * ch;
      this.crop_transform.width = (width / 100) * cw;
      this.crop_transform.height = (height / 100) * ch;

      this.setMaskProps(this.crop_transform);

      this.crop_key = new Date().getTime();
    },
    async drawImageToCanvas() {
      const cropCanvas = this.$refs.cropCanvas;
      const cropCanvasContainer = this.$refs.cropCanvasContainer;
      if (!cropCanvas || !cropCanvasContainer) return false;

      let img = new Image();
      img.src = this.image_url;
      await img.decode();

      let width = img.naturalWidth || 1280;
      let height = img.naturalHeight || 720;
      const ratio = width / height;

      const max_crop_height = this.$root.window.innerHeight * 0.75;
      if (height > max_crop_height) {
        height = max_crop_height;
        width = height * ratio;
      }

      const max_crop_width = this.$root.window.innerWidth * 0.75;
      if (width > max_crop_width) {
        width = max_crop_width;
        height = width / ratio;
      }

      if (width !== cropCanvas.width) cropCanvas.width = width;
      if (height !== cropCanvas.height) cropCanvas.height = height;

      // cropCanvasContainer.style["aspect-ratio"] = width + "/" + height;
      cropCanvasContainer.style.width = width + "px";
      cropCanvasContainer.style.height = height + "px";

      const context = cropCanvas.getContext("2d");
      context.clearRect(0, 0, cropCanvas.width, cropCanvas.height);

      // context.filter = "contrast(1.4) sepia(1) drop-shadow(-9px 9px 3px #e81)";
      let filter = "";

      if (Object.prototype.hasOwnProperty.call(this.make, "image_brightness"))
        filter += `brightness(${this.make.image_brightness}%)`;
      if (Object.prototype.hasOwnProperty.call(this.make, "image_contrast"))
        filter += `contrast(${this.make.image_contrast}%)`;
      if (Object.prototype.hasOwnProperty.call(this.make, "image_blur"))
        filter += `blur(${this.make.image_blur}px)`;
      if (Object.prototype.hasOwnProperty.call(this.make, "image_saturation"))
        filter += `saturate(${this.make.image_saturation}%)`;
      context.filter = filter;

      context.drawImage(img, 0, 0, width, height);
    },

    updateMask(event, transform) {
      event;
      this.setMaskProps(transform);
    },
    setMaskProps(transform) {
      this.mask_prop.x = transform.x;
      this.mask_prop.y = transform.y;
      this.mask_prop.width = transform.width;
      this.mask_prop.height = transform.height;
    },

    dragEnd(event, transform) {
      this.updateCrop(transform);
      event.stopPropagation();
    },
    resizeStart(event) {
      if (
        event.target.classList.contains("br") ||
        event.target.classList.contains("bl") ||
        event.target.classList.contains("tl") ||
        event.target.classList.contains("tr")
      )
        return (this.aspect_ratio = true);
      return (this.aspect_ratio = false);
    },
    updateCrop(transform) {
      const cropCanvas = this.$refs.cropCanvas;
      if (!cropCanvas) return false;

      const preview_width = cropCanvas.parentElement.offsetWidth;
      const preview_height = cropCanvas.parentElement.offsetHeight;

      let _transform_pc = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
      };

      if (Object.prototype.hasOwnProperty.call(transform, "x")) {
        _transform_pc.x = this.roundToDec((transform.x / preview_width) * 100);
      }
      if (Object.prototype.hasOwnProperty.call(transform, "y")) {
        _transform_pc.y = this.roundToDec((transform.y / preview_height) * 100);
      }
      if (Object.prototype.hasOwnProperty.call(transform, "width")) {
        _transform_pc.width = this.roundToDec(
          (transform.width / preview_width) * 100
        );
      }
      if (Object.prototype.hasOwnProperty.call(transform, "height")) {
        _transform_pc.height = this.roundToDec(
          (transform.height / preview_height) * 100
        );
      }

      this.updatePubliMeta({
        crop_options: _transform_pc,
      });
    },
    updateFromInputs(prop) {
      const _transform_pc = Object.assign({}, this.make.crop_options, prop);
      this.updatePubliMeta({
        crop_options: _transform_pc,
      });
    },
    async updatePreviewCanvas() {
      const cropCanvas = this.$refs.cropCanvas;
      const previewCanvas = this.$refs.previewCanvas;

      if (!cropCanvas || !previewCanvas) return false;

      const previewCanvasCtx = previewCanvas.getContext("2d");

      // create canvas, same size as source image, crop from this
      let img = new Image();
      img.src = this.image_url;
      await img.decode();

      let width = img.naturalWidth || 1280;
      let height = img.naturalHeight || 720;

      const x = this.make.crop_options?.x || 0;
      const y = this.make.crop_options?.y || 0;
      const w = this.make.crop_options?.width || 100;
      const h = this.make.crop_options?.height || 100;

      const crop_x = Math.round((x / 100) * width);
      const crop_y = Math.round((y / 100) * height);
      const crop_width = Math.round((w / 100) * width);
      const crop_height = Math.round((h / 100) * height);

      previewCanvas.width = crop_width;
      previewCanvas.height = crop_height;

      previewCanvasCtx.drawImage(
        img,
        crop_x,
        crop_y,
        crop_width,
        crop_height,
        0,
        0,
        crop_width,
        crop_height
      );

      this.export_width = crop_width;
      this.export_height = crop_height;

      this.export_blob = await new Promise((resolve) => {
        previewCanvas.toBlob(resolve, "image/jpeg", 0.95);
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._cropImage {
  margin: 0;
  background: white;
  padding: calc(var(--spacing) / 1);
  border-radius: 6px;

  height: auto;
}

._sidebyside {
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  gap: calc(var(--spacing) * 1);

  ._leftBtns {
    flex: 0 1 250px;
  }
  ._cropWindow {
    flex: 1 1 250px;
  }
}
._cropWindow {
  position: relative;
  width: 100%;
  overflow: visible;
}
._canvasContainer {
  position: relative;
  canvas {
    max-width: 100%;
  }
}

._cropFrame {
  cursor: -webkit-grab;
  cursor: -moz-grab;
  cursor: grab;

  &.ddr-dragging {
    cursor: -webkit-grabbing;
    cursor: -moz-grabbing;
    cursor: dragging;
  }

  ::v-deep {
    .br,
    .tr,
    .tl,
    .bl {
      background: var(--c-orange);
    }
  }
}

._canvas {
}

._canvas,
._previewCanvas {
  width: 100%;
  margin: 0 auto;
  display: block;
  // outline: 2px solid var(--c-gris);
}

._previewCanvas {
  max-width: 100%;
  max-height: 40vh;
  width: auto;
}

._preview {
}

._btnRow {
  display: flex;
  flex-flow: column nowrap;

  gap: calc(var(--spacing) / 8);
  margin-bottom: var(--spacing);
}

._values {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  align-items: center;
  width: 100%;
  background: white;
  // max-width: 800px;

  > * {
    flex: 1 1 0;
  }
}

._modalP {
  position: relative;
}

._mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  pointer-events: none;

  ._maskContent {
    position: absolute;
    box-shadow: 0 0 0 max(100vh, 100vw) rgba(0, 0, 0, 0.4);
  }
}
</style>
