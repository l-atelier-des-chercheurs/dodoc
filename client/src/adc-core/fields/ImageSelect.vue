<template>
  <BaseModal2 :title="label" :size="modal_size" @close="$emit('close')">
    <div class="_imageselect">
      <PickImage
        v-if="!picked_image"
        :path="project_path || path"
        :instructions="instructions"
        :available_options="available_options"
        @newPreview="setNewPreview"
      />
      <template v-else>
        <div v-if="crop_mode" class="_imageselect--crop">
          <CropMedia
            :blob="picked_image"
            :preview_format="preview_format"
            :forced_ratio="ratio"
            @updateCrop="updateCrop"
          />
        </div>
        <div v-else class="_imageselect--image">
          <img
            :data-format="preview_format"
            :src="picked_image"
            draggable="false"
          />
          <button class="u-buttonLink" type="button" @click="removeImage">
            {{ $t("replace_remove_image") }}
          </button>
        </div>
      </template>
    </div>
    <template slot="footer" v-if="image_has_been_changed && !crop_mode">
      <SaveCancelButtons
        :is_saving="is_saving"
        :allow_save="allow_save"
        @save="updateCover"
        @cancel="cancel"
      />
    </template>
  </BaseModal2>
</template>
<script>
import PickImage from "@/adc-core/fields/PickImage.vue";
import CropMedia from "./CropMedia.vue";

export default {
  props: {
    existing_preview: [Boolean, String],
    label: String,
    path: String,
    project_path: String,
    ratio: String,
    instructions: String,
    preview_format: String,
    available_options: Array,
  },
  components: {
    CropMedia,
    PickImage: () => import("@/adc-core/fields/PickImage.vue"),
  },
  data() {
    return {
      picked_image: this.existing_preview,

      crop_mode: false,

      allow_save: true,
      is_saving: false,
    };
  },

  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    modal_size() {
      return this.crop_mode ? "x-large" : "";
    },
    image_has_been_changed() {
      return this.picked_image !== this.existing_preview;
    },
  },
  methods: {
    async setNewPreview(file) {
      if (!file) {
        this.$emit("newPreview", "");
        return;
      }

      let blob = null;
      blob = file.data;

      if (this.ratio) this.crop_mode = true;
      this.picked_image = URL.createObjectURL(blob);
    },
    async fetchURLToFile(url) {
      return await fetch(url).then((r) => r.blob());
      // .then((blobFile) => new File([blobFile], "filename"));
    },
    updateCrop(image) {
      this.picked_image = image;
      // this.crop_mode = false;
      this.updateCover();
    },
    removeImage: function () {
      this.picked_image = "";
      this.$emit("newPreview", "");
    },
    async updateCover() {
      this.is_saving = true;

      // dataurl to file
      let file = "";
      if (this.picked_image) {
        const response = await fetch(this.picked_image);
        file = await response.blob();
      }

      if (!this.path) {
        this.$emit("close");
        return this.$emit("newPreview", file);
      }

      try {
        await this.$api.updateCover({
          path: this.path,
          new_cover_data: file,
          // onProgress,
        });
        this.is_saving = false;
        this.$emit("close");
      } catch (e) {
        this.is_saving = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("couldntbesaved"));

        this.$alertify.closeLogOnClick(true).error(e.response);
      }
    },
    cancel() {
      this.$emit("close");
    },
  },
};
</script>
<style scoped lang="scss">
._imageselect {
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 auto;
  width: 100%;

  gap: calc(var(--spacing) / 4);
}

._imageselect--crop {
  min-height: 60vh;
  height: 400px;
}

._imageselect--image {
  width: 100%;

  img {
    // border: 2px solid var(--c-gris);
    border-radius: 4px;

    &[data-format="square"] {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      object-position: center;
    }
    &[data-format="circle"] {
      width: 100%;
      aspect-ratio: 1;
      border-radius: 50%;
      overflow: hidden;
      object-fit: cover;
      object-position: center;
    }
  }
}
</style>
