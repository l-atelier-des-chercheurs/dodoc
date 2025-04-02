<template>
  <div class="_cropAdjustMedia">
    <button
      type="button"
      class="u-button u-button_orange"
      @click="show_modal = true"
    >
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
            v-if="current_step === 'crop'"
            :media="media"
            @updateCrop="updateCrop"
          />
          <AdjustMedia
            v-if="current_step === 'adjust'"
            :image="cropped_image"
            @back="current_step = 'crop'"
            @updateAdjust="updateAdjust"
          />
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
                type="button"
                class="u-button u-button_bleuvert"
                @click="buttonSaveAsNew"
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
              <div class="_download_media_without_validation">
                <small>
                  <a
                    ref=""
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
      show_modal: false,

      is_saving: false,
      media_being_sent_percent: 0,

      current_step: "crop",

      cropped_image: null,

      final_image: null,

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
    final_image_filename() {
      let ext = this.media.$media_filename.endsWith(".png") ? ".png" : ".jpg";
      return (
        this.getFilenameWithoutExt(this.media.$media_filename) + "_edit" + ext
      );
    },
    final_image_blob() {
      return this.dataURLtoBlob(this.final_image);
    },
  },
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
      this.current_step = "adjust";
    },
    async buttonSaveAsNew() {
      await this.saveAsNew();
      this.closeModal();
    },
    async saveAsNew() {
      console.log("saveAsNew");
      this.is_saving = true;

      const path = this.getParent(this.media.$path);

      // todo – get original caption, credits, geolocation, etc. for new
      const additional_meta = {
        $origin: "collect",
      };

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
      // not very clean… Should rework with specific API route ? $api.updateContent ?
      const { uploaded_meta, meta_filename } = await this.saveAsNew();
      const temp_path = this.getParent(this.media.$path) + "/" + meta_filename;

      const old_media_filename = this.media.$media_filename;
      const new_media_filename = uploaded_meta.$media_filename;

      // set $media_filename from temp to the new filename
      await this.$api.updateMeta({
        path: this.media.$path,
        new_meta: {
          $media_filename: new_media_filename,
        },
      });

      // set $media_filename of temp to the old media file
      await this.$api.updateMeta({
        path: temp_path,
        new_meta: {
          $media_filename: old_media_filename,
        },
      });

      await this.$api.deleteItem({
        path: temp_path,
      });

      this.closeModal();
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
  position: relative;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2);
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
  // background-color: var(--c-noir);
  padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 4);
  // margin-top: calc(-0.5 * var(--spacing));
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
