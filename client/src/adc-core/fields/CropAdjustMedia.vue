<template>
  <div class="_cropAdjustMedia">
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <b-icon :icon="media.$optimized === true ? 'check2-circle' : 'tools'" />
      {{ $t("crop/adjust") }}
    </button>

    <BaseModal2
      v-if="show_modal"
      :title="$t('convert')"
      :size="'full'"
      @close="show_modal = false"
    >
      <div class="_cont">
        <template v-if="!image_preview">
          <button type="button" class="u-buttonLink" @click="zoomIn">
            <b-icon icon="plus" />
          </button>
          <button type="button" class="u-buttonLink" @click="zoomOut">
            <b-icon icon="dash" />
          </button>
          <Cropper ref="cropper" :src="file_full_path" @change="onChange" />
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="previewMedia"
          >
            <b-icon icon="tools" />
            {{ $t("preview") }}
          </button>
        </template>
        <template v-else>
          <img v-if="image_preview" :src="image_preview" />

          <div class="_btnRow">
            <button type="button" class="u-buttonLink" @click="cancel">
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
  },
  components: {
    Cropper,
  },
  data() {
    return {
      show_modal: true,

      image_preview: null,
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
    previewMedia() {
      console.log("previewMedia");
      const { canvas } = this.$refs.cropper.getResult();
      this.image_preview = canvas.toDataURL();
    },
    zoomIn() {
      console.log("zoomIn");
      this.$refs.cropper.zoom(1.5);
    },
    zoomOut() {
      console.log("zoomOut");
      this.$refs.cropper.zoom(0.66);
    },
    cancel() {},
    saveAsNew() {
      console.log("saveAsNew");
    },
    replaceOriginal() {},
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
