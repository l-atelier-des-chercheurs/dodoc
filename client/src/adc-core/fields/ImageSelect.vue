<template>
  <BaseModal2 :title="label" @close="$emit('close')">
    <div class="_imageselect">
      <PickImage
        v-if="!picked_image"
        :path="path"
        :instructions="instructions"
        :available_options="available_options"
        @newPreview="setNewPreview"
      />
      <div class="_imageselect--image" v-else>
        <!-- 
      <img
        :data-format="preview_format"
        :src="picked_image"
        draggable="false"
      /> -->
        <div class="u-cropper" v-if="crop_mode">
          <Cropper :key="picked_image" :src="picked_image" />
        </div>
        <div v-else>
          <img
            :data-format="preview_format"
            :src="picked_image"
            draggable="false"
          />
        </div>
        <button class="u-buttonLink" type="button" @click="removeImage">
          {{ $t("remove_image") }}
        </button>
      </div>
    </div>
    <div slot="footer">
      <SaveCancelButtons
        class="_scb"
        :is_saving="is_saving"
        :allow_save="allow_save"
        @save="updateCover"
        @cancel="cancel"
      />
    </div>
  </BaseModal2>
</template>
<script>
import PickImage from "@/adc-core/fields/PickImage.vue";
import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import "vue-advanced-cropper/dist/theme.bubble.css";

export default {
  props: {
    existing_preview: [Boolean, String],
    label: String,
    path: String,
    instructions: String,
    preview_format: String,
    available_options: Array,
  },
  components: {
    PickImage: () => import("@/adc-core/fields/PickImage.vue"),
    Cropper,
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
  mounted() {
    window.addEventListener("paste", this.handlePaste);
  },
  beforeDestroy() {
    window.removeEventListener("paste", this.handlePaste);
  },

  watch: {},
  computed: {},
  methods: {
    async setNewPreview(file) {
      if (!file) {
        this.$emit("newPreview", "");
        return;
      }

      let blob = null;
      blob = file.data;

      this.crop_mode = true;
      this.picked_image = URL.createObjectURL(blob);
    },
    async fetchURLToFile(url) {
      return await fetch(url).then((r) => r.blob());
      // .then((blobFile) => new File([blobFile], "filename"));
    },
    createImage(blob) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onerror = reject;
        reader.onload = async () => {
          await new Promise((resolve) => setTimeout(resolve, 20));
          return resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    },
    removeImage: function () {
      this.picked_image = "";
      this.$emit("newPreview", "");
    },
    async updateCover() {
      this.is_saving = true;

      if (!this.path) return this.$emit("newImage", this.new_cover);

      try {
        await this.$api.updateCover({
          path: this.path,
          new_cover_data: this.new_cover,
          // onProgress,
        });

        this.is_saving = false;
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

._imageselect--image {
  width: 200px;

  img {
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

._imageselect--upload {
  ::v-deep label {
    width: 100%;
  }
}

._imageselect--takePhoto,
._imageselect--fromLib {
  > button {
    width: 100%;
  }
}

._close_button {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  // background-color: white;

  img {
    width: auto;
  }
}
</style>
