<template>
  <div class="_cropAdjustMedia">
    <button type="button" class="u-buttonLink" @click="show_modal = true">
      <b-icon icon="bounding-box" />
      {{ $t("crop_adjust") }}
    </button>

    <BaseModal2
      v-if="show_modal"
      :title="$t('crop_adjust')"
      :size="'full'"
      @close="closeModal"
    >
      <div class="_cont">
        <div class="_steps">
          <span
            class="_step"
            v-for="(step, index) in ['crop', 'adjust', 'export']"
            :key="step"
          >
            <component :is="step === current_step ? 'strong' : 'span'">
              {{ $t(step) }}
            </component>
            <b-icon
              v-if="index !== 2"
              icon="chevron-right"
              aria-role="presentation"
            />
          </span>
        </div>

        <div class="_panes">
          <CropMedia
            v-show="current_step === 'crop'"
            :media="media"
            @updateCrop="updateCrop"
          />
          <AdjustMedia
            v-if="current_step === 'adjust'"
            :image="cropped_image"
            @back="current_step = 'crop'"
            @updateAdjust="updateAdjust"
          />
          <div v-if="current_step === 'export'">
            <img :src="final_image" />
            <div class="_btnRow">
              <button type="button" class="u-buttonLink" @click="goBack">
                <b-icon icon="arrow-left-short" />
                {{ $t("previous") }}
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
      </div>
    </BaseModal2>
  </div>
</template>
<script>
import CropMedia from "./CropMedia.vue";
import AdjustMedia from "./AdjustMedia.vue";

function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

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
      show_modal: false,

      current_step: "crop",

      cropped_image: null,

      final_image: null,
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
  computed: {},
  methods: {
    updateCrop(image) {
      this.cropped_image = image;
      this.current_step = "adjust";
    },
    updateAdjust(image) {
      this.final_image = image;
      this.current_step = "export";
    },

    goBack() {
      this.current_step = "crop";
    },
    async saveAsNew() {
      console.log("saveAsNew");

      const path = this.getParent(this.media.$path);
      let filename;
      if (this.media.$media_filename.endsWith(".png")) {
        filename =
          this.getFilenameWithoutExt(this.media.$media_filename) + "_edit.png";
      } else {
        filename =
          this.getFilenameWithoutExt(this.media.$media_filename) + "_edit.jpg";
      }

      const file = dataURLtoBlob(this.final_image);
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
      this.current_step = "crop";
    },
  },
};
</script>
<style lang="scss" scoped>
._btnRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: stretch;
  gap: calc(var(--spacing) / 2);
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

._cont {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
}
._panes {
  flex: 1 1 0;
  overflow-y: auto;
}
</style>
