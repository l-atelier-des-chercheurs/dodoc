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
      @close="closeModal"
    >
      <div class="_cont">
        <CropMedia
          v-show="step === 'crop'"
          :image_type="image_type"
          :media="media"
          @updateCrop="updateCrop"
        />
        <AdjustMedia
          v-if="step === 'adjust'"
          :image_blob="image_blob"
          :image_type="image_type"
          @back="step = 'crop'"
          @updateAdjust="updateAdjust"
        />
        <div v-if="step === 'final'">
          <img :src="final_image_preview" />
          <div class="_btnRow" v-if="final_image_preview">
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
        </div>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
import CropMedia from "./CropMedia.vue";
import AdjustMedia from "./AdjustMedia.vue";

export default {
  props: {
    media: Object,
    project_path: String,
  },
  components: {
    CropMedia,
    AdjustMedia,
  },
  data() {
    return {
      show_modal: true,

      step: "crop",

      image_preview: null,
      image_blob: null,
      image_filename: null,

      final_image_blob: null,
      final_image_filename: null,

      saturation: 1,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    saturation(value) {},
  },
  computed: {
    image_type() {
      return this.media.$media_filename.endsWith(".png") ? "png" : "jpeg";
    },
    final_image_preview() {
      return this.final_image_blob
        ? URL.createObjectURL(this.final_image_blob)
        : null;
    },
  },
  methods: {
    updateCrop({ blob, filename }) {
      this.image_blob = blob;
      this.image_filename = filename;
      this.step = "adjust";
    },
    updateAdjust(blob) {
      this.final_image_blob = blob;
      this.step = "final";
    },

    goBack() {
      this.step = "crop";
    },
    async saveAsNew() {
      console.log("saveAsNew");

      const path = this.getParent(this.media.$path);
      const filename = this.image_filename;
      const file = this.final_image_blob;
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
    closeModal() {
      this.show_modal = false;
      this.step = "crop";
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
