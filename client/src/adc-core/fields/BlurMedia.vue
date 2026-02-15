<template>
  <BaseModal2 :title="$t('to_blur')" :size="'full'" @close="$emit('close')">
    <div class="_cont">
      <div class="_steps">
        <span class="_step">
          <component :is="current_step === 'draw' ? 'strong' : 'span'">
            {{ $t("blur") }}
          </component>
          <b-icon icon="chevron-right" aria-role="presentation" />
        </span>
        <span class="_step">
          <component :is="current_step === 'export' ? 'strong' : 'span'">
            {{ $t("export") }}
          </component>
        </span>
      </div>

      <div class="_panes">
        <div v-if="current_step === 'draw'" class="_drawPane">
          <div class="_drawPanes">
            <div class="_settings">
              <div class="_drawModes">
                <button
                  type="button"
                  class="u-button u-button_small"
                  :class="
                    draw_mode === 'blur'
                      ? 'u-button_bleuvert'
                      : 'u-button_white'
                  "
                  @click="draw_mode = 'blur'"
                >
                  <b-icon icon="dash-circle-dotted" />
                  {{ $t("blur") }}
                </button>
                <button
                  type="button"
                  class="u-button u-button_small"
                  :class="
                    draw_mode === 'erase'
                      ? 'u-button_bleuvert'
                      : 'u-button_white'
                  "
                  @click="draw_mode = 'erase'"
                >
                  <b-icon icon="eraser" />
                  {{ $t("erase") }}
                </button>
              </div>
              <RangeValueInput
                class="u-spacingBottom"
                :label="$t('brush_size')"
                :value="brush_size"
                :can_toggle="false"
                :min="10"
                :max="120"
                :step="1"
                :default_value="40"
                :suffix="'px'"
                :ticks="[30]"
                @input="brush_size = $event"
                @save="brush_size = $event"
              />
              <RangeValueInput
                class="u-spacingBottom"
                :label="$t('feather')"
                :value="mask_feather_px"
                :can_toggle="false"
                :min="0"
                :max="60"
                :step="1"
                :default_value="10"
                :suffix="'px'"
                :ticks="[10]"
                @input="mask_feather_px = $event"
                @save="mask_feather_px = $event"
              />
              <RangeValueInput
                class="u-spacingBottom"
                :label="$t('blur_radius')"
                :value="blur_radius"
                :can_toggle="false"
                :min="1"
                :max="20"
                :step="1"
                :default_value="5"
                :suffix="'px'"
                :ticks="[5]"
                @input="blur_radius = $event"
                @save="blur_radius = $event"
              />
              <button
                type="button"
                class="u-button u-button_small u-button_white"
                @click="clearMask"
              >
                <b-icon icon="trash" />
                {{ $t("clear") }}
              </button>
            </div>
            <div class="_drawArea" ref="draw_wrapper">
              <img
                ref="source_img"
                class="_sourceImg _sourceImg_hidden"
                :src="image_src"
                @load="onImageLoad"
              />
              <canvas
                ref="mask_canvas"
                class="_maskCanvas _maskCanvas_hidden"
                width="1"
                height="1"
              />
              <canvas
                ref="preview_canvas"
                class="_previewCanvas"
                width="1"
                height="1"
                @mousedown="startDraw"
                @mousemove="onPreviewMouseMove"
                @mouseup="endDraw"
                @mouseleave="onPreviewMouseLeave"
                @mouseenter="show_brush_cursor = true"
                @touchstart.prevent="startDrawTouch"
                @touchmove.prevent="drawTouch"
                @touchend.prevent="endDraw"
              />
              <div
                v-show="show_brush_cursor && !$root.is_mobile_view"
                class="_brushCursor"
                :style="brush_cursor_style"
              />
            </div>
          </div>
          <div class="_bottomBar">
            <button
              type="button"
              class="u-button u-button_bleuvert"
              :disabled="!image_loaded"
              @click="applyBlurAndNext"
            >
              {{ $t("next") }}
              <b-icon icon="arrow-right" />
            </button>
          </div>
        </div>

        <div v-if="current_step === 'export'" class="_exportPane">
          <img :src="final_image" />
          <div class="_btnRow">
            <button
              type="button"
              class="u-button u-button_white"
              @click="goBack"
            >
              <b-icon icon="arrow-left-short" />
              {{ $t("previous") }}
            </button>

            <button
              v-if="available_save_actions.includes('saveAsNew')"
              type="button"
              class="u-button u-button_bleuvert"
              data-action="saveAsNew"
              @click="buttonSaveAsNew"
            >
              <b-icon icon="file-plus" />
              {{ $t("save_as_new_media") }}
            </button>
            <button
              v-if="available_save_actions.includes('replaceOriginal')"
              type="button"
              class="u-button u-button_red"
              data-action="replaceOriginal"
              @click="replaceOriginal"
            >
              <b-icon icon="save2-fill" />
              {{ $t("replace_original") }}
            </button>
            <div
              v-if="available_save_actions.includes('download')"
              data-action="download"
              class="_download_media_without_validation"
            >
              <small>
                <a
                  :href="final_image_blob"
                  :download="final_image_filename"
                  target="_blank"
                >
                  {{ $t("or_download_media_on_device") }}
                  <template v-if="final_image_blob">
                    — {{ formatBytes(final_image_blob.size) }}
                  </template>
                </a>
              </small>
            </div>

            <div class="_spinner" v-if="is_saving" key="loader">
              <AnimatedCounter :value="media_being_sent_percent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
import { getCopyableMediaMeta } from "@/utils/mediaMeta.js";

export default {
  props: {
    media: Object,
    available_save_actions: {
      type: Array,
      default: () => ["saveAsNew", "replaceOriginal", "download"],
    },
  },
  data() {
    return {
      is_saving: false,
      media_being_sent_percent: 0,
      current_step: "draw",
      image_loaded: false,
      image_src: null,
      img_natural_width: 0,
      img_natural_height: 0,
      display_width: 0,
      display_height: 0,
      brush_size: 30,
      draw_mode: "blur",
      is_drawing: false,
      last_x: 0,
      last_y: 0,
      blur_radius: 5,
      mask_feather_px: 10,
      final_image: null,
      cursor_x: 0,
      cursor_y: 0,
      show_brush_cursor: false,
    };
  },
  computed: {
    brush_cursor_style() {
      const r = this.brush_size / 2;
      return {
        left: this.cursor_x - r + "px",
        top: this.cursor_y - r + "px",
        width: this.brush_size + "px",
        height: this.brush_size + "px",
      };
    },
    final_image_filename() {
      const ext = this.media.$media_filename.endsWith(".png") ? ".png" : ".jpg";
      return (
        this.getFilenameWithoutExt(this.media.$media_filename) + "_blur" + ext
      );
    },
    final_image_blob() {
      return this.final_image ? this.dataURLtoBlob(this.final_image) : null;
    },
  },
  watch: {
    media: {
      immediate: true,
      handler(media) {
        if (media) {
          this.image_src = this.makeMediaFilePath({
            $path: media.$path,
            $media_filename: media.$media_filename,
            with_timestamp: true,
            $date_created: media.$date_created,
          });
          this.image_loaded = false;
        }
      },
    },
    blur_radius() {
      if (this.image_loaded && this._blurred_display) {
        this.updateBlurredDisplay();
      }
    },
    mask_feather_px() {
      if (this.image_loaded && this._blurred_display) {
        this.redrawPreview();
      }
    },
  },
  mounted() {
    window.addEventListener("resize", this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.onResize);
  },
  methods: {
    onImageLoad() {
      const img = this.$refs.source_img;
      if (!img) return;
      this.img_natural_width = img.naturalWidth;
      this.img_natural_height = img.naturalHeight;
      this.image_loaded = true;
      this.$nextTick(() => {
        this.initMaskCanvas();
      });
    },
    onResize() {
      if (this.current_step === "draw" && this.image_loaded) {
        this.$nextTick(() => this.initMaskCanvas());
      }
    },
    initMaskCanvas() {
      const wrapper = this.$refs.draw_wrapper;
      const img = this.$refs.source_img;
      const mask = this.$refs.mask_canvas;
      const preview = this.$refs.preview_canvas;
      if (!wrapper || !img || !mask || !preview) return;

      const rect = img.getBoundingClientRect();
      this.display_width = Math.round(rect.width);
      this.display_height = Math.round(rect.height);

      const w = this.img_natural_width;
      const h = this.img_natural_height;

      mask.width = w;
      mask.height = h;
      mask.style.width = this.display_width + "px";
      mask.style.height = this.display_height + "px";

      preview.width = w;
      preview.height = h;
      preview.style.width = this.display_width + "px";
      preview.style.height = this.display_height + "px";

      const mask_ctx = mask.getContext("2d");
      mask_ctx.fillStyle = "rgba(0,0,0,0)";
      mask_ctx.fillRect(0, 0, mask.width, mask.height);

      this._original_display = document.createElement("canvas");
      this._original_display.width = w;
      this._original_display.height = h;
      const orig_ctx = this._original_display.getContext("2d");
      orig_ctx.drawImage(img, 0, 0);

      this._blurred_display = document.createElement("canvas");
      this._blurred_display.width = w;
      this._blurred_display.height = h;
      const blur_ctx = this._blurred_display.getContext("2d");
      blur_ctx.filter = `blur(${this.blur_radius}px)`;
      blur_ctx.drawImage(img, 0, 0);
      blur_ctx.filter = "none";

      this.redrawPreview();
    },
    updateBlurredDisplay() {
      const img = this.$refs.source_img;
      if (!img || !this._blurred_display) return;
      const w = this._blurred_display.width;
      const h = this._blurred_display.height;
      const blur_ctx = this._blurred_display.getContext("2d");
      blur_ctx.filter = `blur(${this.blur_radius}px)`;
      blur_ctx.drawImage(img, 0, 0);
      blur_ctx.filter = "none";
      this.redrawPreview();
    },
    getEventCoords(e) {
      const canvas = this.$refs.preview_canvas;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const scale_x = canvas.width / rect.width;
      const scale_y = canvas.height / rect.height;
      const point = e.touches && e.touches.length ? e.touches[0] : e;
      return {
        x: (point.clientX - rect.left) * scale_x,
        y: (point.clientY - rect.top) * scale_y,
      };
    },
    startDraw(e) {
      this.is_drawing = true;
      const { x, y } = this.getEventCoords(e);
      this.last_x = x;
      this.last_y = y;
      this.drawStroke(x, y);
    },
    onPreviewMouseMove(e) {
      this.cursor_x = e.clientX;
      this.cursor_y = e.clientY;
      this.draw(e);
    },
    onPreviewMouseLeave() {
      this.show_brush_cursor = false;
      this.endDraw();
    },
    draw(e) {
      if (!this.is_drawing) return;
      const { x, y } = this.getEventCoords(e);
      this.drawLine(this.last_x, this.last_y, x, y);
      this.last_x = x;
      this.last_y = y;
    },
    endDraw() {
      this.is_drawing = false;
    },
    startDrawTouch(e) {
      if (e.touches.length) {
        this.is_drawing = true;
        const { x, y } = this.getEventCoords(e);
        this.last_x = x;
        this.last_y = y;
        this.drawStroke(x, y);
      }
    },
    drawTouch(e) {
      if (!this.is_drawing || !e.touches.length) return;
      const { x, y } = this.getEventCoords(e);
      this.drawLine(this.last_x, this.last_y, x, y);
      this.last_x = x;
      this.last_y = y;
    },
    drawStroke(x, y) {
      const canvas = this.$refs.mask_canvas;
      if (!canvas || !this.display_width) return;
      const ctx = canvas.getContext("2d");
      const scale = canvas.width / this.display_width;
      const r = (this.brush_size * scale) / 2;
      ctx.globalCompositeOperation =
        this.draw_mode === "erase" ? "destination-out" : "source-over";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      this.redrawPreview();
    },
    drawLine(x0, y0, x1, y1) {
      const canvas = this.$refs.mask_canvas;
      if (!canvas || !this.display_width) return;
      const ctx = canvas.getContext("2d");
      const scale = canvas.width / this.display_width;
      const r = (this.brush_size * scale) / 2;
      ctx.globalCompositeOperation =
        this.draw_mode === "erase" ? "destination-out" : "source-over";
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = r * 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      this.redrawPreview();
    },
    clearMask() {
      const canvas = this.$refs.mask_canvas;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.redrawPreview();
    },
    getFeatheredMask(source_mask) {
      if (!this.display_width) return source_mask;
      const feather = Math.max(
        1,
        (this.mask_feather_px * source_mask.width) / this.display_width
      );
      const c = document.createElement("canvas");
      c.width = source_mask.width;
      c.height = source_mask.height;
      const ctx = c.getContext("2d");
      ctx.filter = `blur(${feather}px)`;
      ctx.drawImage(source_mask, 0, 0);
      return c;
    },
    redrawPreview() {
      const preview = this.$refs.preview_canvas;
      const mask = this.$refs.mask_canvas;
      if (
        !preview ||
        !mask ||
        !this._original_display ||
        !this._blurred_display
      )
        return;
      const ctx = preview.getContext("2d");
      ctx.drawImage(this._original_display, 0, 0);
      const mask_soft = this.getFeatheredMask(mask);
      const temp = document.createElement("canvas");
      temp.width = mask.width;
      temp.height = mask.height;
      const temp_ctx = temp.getContext("2d");
      temp_ctx.drawImage(this._blurred_display, 0, 0);
      temp_ctx.globalCompositeOperation = "destination-in";
      temp_ctx.drawImage(mask_soft, 0, 0);
      ctx.drawImage(temp, 0, 0);
    },
    async applyBlurAndNext() {
      const preview = this.$refs.preview_canvas;
      if (!preview || !this.image_loaded) return;

      this.final_image = preview.toDataURL(
        this.media.$media_filename.endsWith(".png")
          ? "image/png"
          : "image/jpeg",
        0.92
      );
      this.current_step = "export";
    },
    goBack() {
      this.current_step = "draw";
    },
    async buttonSaveAsNew() {
      await this.saveAsNew();
      this.$emit("closeParentModal");
    },
    async saveAsNew() {
      this.is_saving = true;
      const path = this.getParent(this.media.$path);
      const additional_meta = getCopyableMediaMeta(this.media, {
        $origin: "collect",
        $processing: ["blurred"],
      });

      const onProgress = (progressEvent) => {
        this.media_being_sent_percent = parseInt(
          Math.round((progressEvent.loaded * 100) / progressEvent.total)
        );
      };

      const { uploaded_meta, meta_filename } = await this.$api
        .uploadFile({
          path,
          filename: this.final_image_filename,
          file: this.final_image_blob,
          additional_meta,
          onProgress,
        })
        .catch((err) => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("media_couldnt_be_sent"));
          throw err;
        });

      this.is_saving = false;
      return { uploaded_meta, meta_filename };
    },
    async replaceOriginal() {
      const { uploaded_meta, meta_filename } = await this.saveAsNew();
      const temp_path = this.getParent(this.media.$path) + "/" + meta_filename;
      const old_media_filename = this.media.$media_filename;
      const new_media_filename = uploaded_meta.$media_filename;
      const processing = this.media.$processing || [];
      processing.push("blurred");

      await this.$api.updateMeta({
        path: this.media.$path,
        new_meta: {
          $media_filename: new_media_filename,
          $processing: processing,
        },
      });
      await this.$api.updateMeta({
        path: temp_path,
        new_meta: { $media_filename: old_media_filename },
      });
      await this.$api.deleteItem({ path: temp_path });
      this.$emit("closeParentModal");
    },
  },
};
</script>
<style lang="scss" scoped>
._cont {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}

._steps {
  flex: 0 0 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  gap: calc(var(--spacing) / 2);
  overflow-x: auto;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
}

._step {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}

._panes {
  flex: 1 1 0;
  overflow-y: auto;
}

._drawPane {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
}

._drawPanes {
  flex: 1 1 0;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;
  padding: calc(var(--spacing) / 4);
  gap: calc(var(--spacing) / 4);
  background-color: var(--c-noir);
  min-height: 0;

  @media (max-width: 500px) {
    flex-flow: column nowrap;
    overflow: auto;
  }
}

._settings {
  flex: 1 0 240px;
  overflow: auto;
  padding: calc(var(--spacing) / 1);
  background-color: white;
  border-radius: var(--border-radius);
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  align-items: flex-start;
}

._drawArea {
  flex: 8 1 200px;
  position: relative;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: calc(var(--spacing) / 2);
}

._sourceImg {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

._sourceImg_hidden {
  opacity: 0;
  pointer-events: none;
}

._maskCanvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  touch-action: none;
}

._maskCanvas_hidden {
  pointer-events: none;
  visibility: hidden;
}

._previewCanvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  cursor: none;
  touch-action: none;
}

._brushCursor {
  position: fixed;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  z-index: 1;
  box-sizing: border-box;
}

._drawModes {
  display: flex;
  flex-flow: row nowrap;
  gap: 2px;
}

._bottomBar {
  flex: 0 0 auto;
  text-align: center;
  padding: calc(var(--spacing) / 2);
}

._exportPane {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;

  img {
    flex: 1 1 0;
    width: 100%;
    overflow: hidden;
    object-fit: contain;
    background-color: var(--c-noir);
    padding: calc(var(--spacing) / 2);
  }

  ._btnRow {
    flex: 0 0 auto;
  }
}

._btnRow {
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
}

._spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
}

._download_media_without_validation {
  padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 4);
  margin-bottom: -0.2em;
  line-height: 1;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;

  a {
    color: var(--c-noir);
  }
}
</style>
