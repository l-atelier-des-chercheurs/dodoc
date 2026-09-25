<template>
  <BaseModal2 :title="$t('crop_adjust')" :size="'full'" @close="$emit('close')">
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
        <ExportProcessedMedia
          v-if="current_step === 'export'"
          :media="media"
          :available_save_actions="available_save_actions"
          :preview_image="final_image"
          :final_image_blob="final_image_blob"
          :final_image_filename="final_image_filename"
          processing_label="cropped"
          @back="goBack"
          @close="$emit('close')"
        />
      </div>
    </div>
  </BaseModal2>
</template>
<script>
import CropMedia from "./CropMedia.vue";
import AdjustMedia from "./AdjustMedia.vue";
import ExportProcessedMedia from "./ExportProcessedMedia.vue";

export default {
  props: {
    media: Object,
    project_path: String,
    available_save_actions: {
      type: Array,
      default: () => ["saveAsNew", "replaceOriginal", "download"],
    },
  },
  components: {
    CropMedia,
    AdjustMedia,
    ExportProcessedMedia,
  },
  data() {
    return {
      current_step: "crop",

      cropped_image: null,

      final_image: null,

      saturation: 1,
    };
  },
  created() {},
  mounted() {},
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
  },
};
</script>
<style lang="scss" scoped>
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
