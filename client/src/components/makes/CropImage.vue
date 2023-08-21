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
      <p class="_instructions">
        {{ $t("crop_instructions") }}
      </p>

      <div class="_btnRow">
        <button
          type="button"
          class="u-button u-button_small u-button_bleuvert"
          @click="resetCrop"
        >
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
        <button
          type="button"
          class="u-button u-button_small u-button_bleumarine"
          @click="show_save_export_modal = true"
        >
          <b-icon icon="check" />
          {{ $t("save_export") }}
        </button>
      </div>

      <div class="_cropPreviewPanes">
        <div class="_cropWindow">
          <canvas class="_canvas" ref="cropCanvas" width="1280" height="720" />
          <DDR
            class="_crop"
            :key="crop_key"
            :value="crop_transform"
            :rotatable="false"
            :acceptRatio="aspect_ratio"
            :id="'1'"
            :parent="true"
            :handlerSize="15"
            @dragend="dragEnd"
            @resizestart="resizeStart"
            @resizeend="dragEnd"
          />
        </div>

        <BaseModal2
          :title="$t('save_export_cropped')"
          v-if="show_save_export_modal"
          @close="show_save_export_modal = false"
        >
          <!-- <p>
            {{ $t("general_password_modal_text") }}
          </p> -->

          <div class="">
            {{ $t("resolution") }}: {{ export_width }}×{{ export_height }}

            <div class="">
              <div class="u-spacingBottom">
                <a
                  :download="image_export_name"
                  :href="export_string"
                  target="_blank"
                  class="u-buttonLink"
                >
                  {{ $t("download") }}
                </a>
              </div>

              <button
                type="button"
                class="u-button u-button_red"
                @click="saveToProject"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  x="0px"
                  y="0px"
                  viewBox="0 0 168 168"
                  style="enable-background: new 0 0 168 168"
                  xml:space="preserve"
                >
                  <path
                    style="fill: var(--c-rouge)"
                    d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"
                  />
                  <g style="fill: var(--c-orange)">
                    <path d="m42 42h21.6v21h-21.6z" />
                    <path d="m73.2 42h21.6v21h-21.6z" />
                    <path d="m104.4 42h21.6v21h-21.6z" />
                    <path d="m42 73.5h21.6v21h-21.6z" />
                    <path d="m73.2 73.5h21.6v21h-21.6z" />
                    <path d="m104.4 73.5h21.6v21h-21.6z" />
                    <path d="m42 105h21.6v21h-21.6z" />
                    <path d="m73.2 105h21.6v21h-21.6z" />
                    <path d="m104.4 105h21.6v21h-21.6z" />
                  </g>
                </svg>
                {{ $t("save_to_project") }}
              </button>
            </div>
          </div>

          <br />

          <div class="_preview">
            <canvas
              class="_previewCanvas"
              ref="previewCanvas"
              width="1280"
              height="720"
            />
          </div>

          <div class="_saveNotice" v-if="finished_saving_to_project">
            {{ $t("image_saved") }}
          </div>
        </BaseModal2>
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

      export_string: false,
      export_width: 0,
      export_height: 0,

      crop_key: new Date().getTime(),
      aspect_ratio: true,

      finished_saving_to_project: false,

      crop_transform: {
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
    "make.options": {
      handler() {
        this.setTransformFromMake();
        this.updatePreviewCanvas();
      },
      deep: true,
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
    image_export_name() {
      return this.make.base_media_filename + "_cropped.png";
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
    resetCrop() {
      const default_transform = {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        rotation: 0,
      };
      this.updatePubliMeta({
        options: default_transform,
      });
    },
    setTransformFromMake() {
      if (this.make.options) {
        let { x, y, width, height } = this.make.options;

        const cropCanvas = this.$refs.cropCanvas;

        this.crop_transform.x = x * cropCanvas.parentElement.offsetWidth;
        this.crop_transform.y = y * cropCanvas.parentElement.offsetHeight;
        this.crop_transform.width =
          width * cropCanvas.parentElement.offsetWidth;
        this.crop_transform.height =
          height * cropCanvas.parentElement.offsetHeight;

        this.crop_key = new Date().getTime();
      }
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
        _transform_pc.x = this.roundToDec(transform.x / preview_width, 4);
      }
      if (Object.prototype.hasOwnProperty.call(transform, "y")) {
        _transform_pc.y = this.roundToDec(transform.y / preview_height, 4);
      }
      if (Object.prototype.hasOwnProperty.call(transform, "width")) {
        _transform_pc.width = this.roundToDec(
          transform.width / preview_width,
          4
        );
      }
      if (Object.prototype.hasOwnProperty.call(transform, "height")) {
        _transform_pc.height = this.roundToDec(
          transform.height / preview_height,
          4
        );
      }

      this.updatePubliMeta({
        options: _transform_pc,
      });
    },
    updatePreviewCanvas() {
      const cropCanvas = this.$refs.cropCanvas;
      const previewCanvas = this.$refs.previewCanvas;

      if (!cropCanvas || !previewCanvas) return false;

      const previewCanvasCtx = previewCanvas.getContext("2d");

      const crop_x = this.make.options?.x * cropCanvas.width;
      const crop_y = this.make.options?.y * cropCanvas.height;
      const crop_width = this.make.options?.width * cropCanvas.width;
      const crop_height = this.make.options?.height * cropCanvas.height;

      previewCanvas.width = crop_width;
      previewCanvas.height = crop_height;

      previewCanvasCtx.drawImage(
        cropCanvas,
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
      this.export_string = previewCanvas.toDataURL("image/png");
    },
    async saveToProject() {
      const imageBlob = await new Promise((resolve) => {
        this.$refs.previewCanvas.toBlob(resolve, "image/jpeg", 0.95);
      });

      const additional_meta = {};
      await this.$api
        .uploadFile({
          path: this.current_project_path,
          filename: "image-" + +new Date() + ".jpeg",
          file: imageBlob,
          additional_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      this.finished_saving_to_project = true;
      setTimeout(() => {
        this.finished_saving_to_project = false;
      }, 4000);
    },
  },
};
</script>
<style lang="scss" scoped>
._cropImage {
  margin: 0 auto;
  max-width: 90vh;
  height: auto;
}
._cropWindow {
  position: relative;
  width: 100%;
}
._canvas,
._previewCanvas {
  width: 100%;
  margin: 0 auto;
  display: block;
  outline: 2px solid var(--c-gris);
}

._previewCanvas {
  max-width: 100%;
  max-height: 50vh;
  width: auto;
}

._preview {
}

._instructions {
  margin-bottom: var(--spacing);
}

._cropPreviewPanes {
  display: flex;
  flex-flow: row wrap;
  gap: var(--spacing);

  > * {
    flex: 1 1 200px;
  }
}
._btnRow {
  display: flex;
  flex-flow: row wrap;
  gap: var(--spacing);
  margin-bottom: var(--spacing);
}
</style>
