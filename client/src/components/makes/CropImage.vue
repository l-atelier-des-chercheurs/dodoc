<template>
  <div class="_cropImage">
    <button
      type="button"
      class="u-button u-button_bleumarine"
      @click="show_media_picker = true"
    >
      <b-icon icon="image" />
      <template v-if="!base_media">
        {{ $t("pick_image") }}
      </template>
      <template v-else>
        {{ $t("change_base_image") }}
      </template>
    </button>

    <PickMediaFromProjects
      v-if="show_media_picker"
      :path="current_project_path"
      :select_mode="'single'"
      :pick_from_type="'image'"
      @addMedias="pickMedia"
      @close="show_media_picker = false"
    />

    <template v-if="base_media">
      <p>
        {{ $t("crop_instructions") }}
      </p>

      <button
        type="button"
        class="u-button u-button_small u-button_bleuvert"
        @click="rotateImage(90)"
      >
        <b-icon icon="arrow-clockwise" />
      </button>
      <button
        type="button"
        class="u-button u-button_small u-button_bleuvert"
        @click="rotateImage(-90)"
      >
        <b-icon icon="arrow-counterclockwise" />
      </button>

      {{ crop_transform }}

      <div class="_cropPreviewPanes">
        <div class="_cropWindow">
          <canvas class="_canvas" ref="cropCanvas" width="1280" height="720" />
          <DDR
            class="_crop"
            :key="crop_key"
            :value="crop_transform"
            :acceptRatio="aspect_ratio"
            :id="'1'"
            :parent="true"
            :handlerSize="15"
            @dragend="dragEnd"
            @resizestart="resizeStart"
            @resizeend="dragEnd"
          />
        </div>

        <div class="_preview">
          <canvas
            class="_previewCanvas"
            ref="previewCanvas"
            width="1280"
            height="720"
          />
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import DDR from "@/ddr/index.vue"; // eslint-disable-line
import "yoyoo-ddr/dist/yoyoo-ddr.css";

export default {
  props: {
    make: Object,
  },
  components: {
    DDR,
  },
  data() {
    return {
      show_media_picker: false,
      is_clicked: false,

      crop_key: new Date().getTime(),
      aspect_ratio: true,
      crop_transform: {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: 0,
      },
    };
  },
  created() {
    this.setTransformFromMake();
  },
  async mounted() {
    if (this.base_media)
      this.$nextTick(async () => {
        await this.drawImageToCanvas();
        this.$nextTick(() => {
          this.updatePreviewCanvas();
        });
      });
  },
  beforeDestroy() {},
  watch: {
    crop_transform: {
      handler() {
        this.updatePreviewCanvas();
        this.updatePubliMeta({ options: this.crop_transform });
      },
      deep: true,
    },
    "make.options": {
      handler() {
        this.setTransformFromMake();
      },
      deep: true,
    },
  },
  computed: {
    current_project_path() {
      const makes_path = this.getParent(this.make.$path);
      return this.getParent(makes_path);
    },
    base_media() {
      const meta_filename_in_project = this.make.base_media_filename;
      if (meta_filename_in_project)
        return this.getSourceMedia({
          source_media: { meta_filename_in_project },
          folder_path: this.make.$path,
        });
      return false;
    },
  },
  methods: {
    async pickMedia({ path_to_source_media_metas }) {
      const path_to_source_media_meta = path_to_source_media_metas[0];
      const base_media_filename = this.getFilename(path_to_source_media_meta);
      await this.updatePubliMeta({ base_media_filename });
      this.$nextTick(async () => {
        await this.drawImageToCanvas();
      });
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.make.$path,
        new_meta,
      });
    },
    setTransformFromMake() {
      if (this.make.options) this.updateCrop(this.make.options);
    },
    async drawImageToCanvas() {
      const canvas = this.$refs.cropCanvas;
      if (!canvas) return false;

      const width = this.base_media.$infos?.width || 1280;
      const height = this.base_media.$infos?.height || 720;

      canvas.width = width;
      canvas.height = height;

      const image_url = this.makeMediaFileURL({
        $path: this.base_media.$path,
        $media_filename: this.base_media.$media_filename,
      });

      let img = new Image();
      img.src = image_url;
      await img.decode();

      const context = canvas.getContext("2d");
      context.drawImage(img, 0, 0, width, height);
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
      ["x", "y", "width", "height"].map((k) => {
        if (Object.prototype.hasOwnProperty.call(transform, k))
          this.crop_transform[k] = transform[k];
      });
    },
    updatePreviewCanvas() {
      debugger;

      const cropCanvas = this.$refs.cropCanvas;
      const previewCanvas = this.$refs.previewCanvas;

      if (!cropCanvas || !previewCanvas) return false;

      const previewCanvasCtx = previewCanvas.getContext("2d");

      const preview_width = cropCanvas.parentElement.offsetWidth;
      const preview_height = cropCanvas.parentElement.offsetHeight;
      const crop_x = (this.crop_transform.x / preview_width) * cropCanvas.width;
      const crop_y =
        (this.crop_transform.y / preview_height) * cropCanvas.height;
      const crop_width =
        (this.crop_transform.width / preview_width) * cropCanvas.width;
      const crop_height =
        (this.crop_transform.height / preview_height) * cropCanvas.height;

      previewCanvas.width = cropCanvas.width;
      previewCanvas.height = cropCanvas.height;

      const x_of_crop_in_dest = previewCanvas.width / 2 - crop_width / 2;
      const y_of_crop_in_dest = previewCanvas.height / 2 - crop_height / 2;

      // console.log(
      //   "crop options",
      //   crop_x,
      //   crop_y,
      //   crop_width,
      //   crop_height,
      //   x_of_crop_in_dest,
      //   y_of_crop_in_dest
      // );

      previewCanvasCtx.drawImage(
        cropCanvas,
        crop_x,
        crop_y,
        crop_width,
        crop_height,
        x_of_crop_in_dest,
        y_of_crop_in_dest,
        crop_width,
        crop_height
      );
    },
  },
};
</script>
<style lang="scss" scoped>
._cropWindow {
  position: relative;
  width: 100%;
}
._canvas,
._previewCanvas {
  width: 100%;
  display: block;
}

._preview {
}

._cropPreviewPanes {
  display: flex;
  flex-flow: row wrap;
  gap: var(--spacing);

  > * {
    flex: 1 1 200px;
  }
}
</style>
