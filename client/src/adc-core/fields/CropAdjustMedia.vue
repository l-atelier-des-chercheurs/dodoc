<template>
  <div class="_cropAdjustMedia">
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <b-icon icon="boundingbox" />
      {{ $t("crop_adjust") }}
    </button>

    <BaseModal2
      v-if="show_modal"
      :title="$t('crop_adjust')"
      :size="'full'"
      @close="show_modal = false"
    >
      <div class="_cont">
        <div v-show="!image_preview">
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

            <input
              type="range"
              v-model="saturation"
              min="0"
              max="100"
              step="1"
            />
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
        <template v-if="image_preview">
          <img :src="image_preview" />

          <div class="_btnRow">
            <button type="button" class="u-buttonLink" @click="goBack">
              <b-icon icon="arrow-left-short" />
              {{ $t("back") }}
            </button>
            <button
              type="button"
              class="u-button u-button_bleuvert"
              @click="saveAsNew"
            >
              <b-icon icon="file-plus" />
              {{ $t("save_as_new_media") }}
            </button>
            <button
              type="button"
              class="u-button u-button_red"
              @click="replaceOriginal"
            >
              <b-icon icon="save2-fill" />
              {{ $t("replace_original") }}
            </button>
          </div>
        </template>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import "vue-advanced-cropper/dist/theme.compact.css";

export default {
  props: {
    media: Object,
    project_path: String,
  },
  components: {
    Cropper,
  },
  data() {
    return {
      show_modal: true,

      image_preview: null,
      image_blob: null,
      image_filename: null,

      result: {
        coordinates: null,
        image: null,
      },

      saturation: 1,
      brightness: 1,
      contrast: 1,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    saturation(value) {
      this.$refs.cropper.setSaturation(value);
    },
  },
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
    async previewMedia() {
      console.log("previewMedia");
      const { canvas } = this.$refs.cropper.getResult();

      if (this.media.$media_filename.endsWith(".png")) {
        this.image_preview = canvas.toDataURL("image/png");
        this.image_blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.95);
        });
        this.image_filename = this.media.$media_filename + "_edit.png";
      } else {
        this.image_preview = canvas.toDataURL("image/jpeg", 0.95);
        this.image_blob = await new Promise((resolve) => {
          canvas.toBlob(resolve, "image/jpeg", 0.95);
        });
        this.image_filename = this.media.$media_filename + "_edit.jpg";
      }
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
    goBack() {
      this.image_preview = null;
      this.image_blob = null;
      this.image_filename = null;
    },
    async saveAsNew() {
      console.log("saveAsNew");

      const path = this.getParent(this.media.$path);
      const filename = this.image_filename;
      const file = this.image_blob;
      // todo – get original caption, credits, geolocation, etc.
      const additional_meta = {};

      return await this.$api
        .uploadFile({
          path,
          filename,
          file,
          additional_meta,
          // onProgress,
        })
        .catch((err) => {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(this.$t("media_couldnt_be_sent"));
          throw err;
        });
    },
    async replaceOriginal() {
      const meta_filename = await this.saveAsNew();
      // todo, update $content
    },
  },
};
</script>
<style lang="scss" scoped>
._btnRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) / 2);
}
</style>
