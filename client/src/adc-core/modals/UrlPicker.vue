<template>
  <BaseModal2
    :title="$t('import_from_url')"
    :confirm_before_closing="full_url.length > 0"
    :is_loading="is_importing_url"
    @close="$emit('close')"
    @save="importFromUrl"
  >
    <div class="_urlPicker">
      <div class="_urlBox">
        <TextInput
          :label_str="$t('input_url')"
          :instructions="$t('input_url_instr')"
          :content.sync="full_url"
          :placeholder="'https://example.com/image.jpg'"
          :required="true"
          :autofocus="true"
          :input_type="'url'"
          @toggleValidity="($event) => (allow_save = $event)"
        />
      </div>

      <div class="u-instructions">
        <small class="_examples">
          {{ $t("for_example") }}
          <button
            type="button"
            class="u-buttonLink"
            @click="
              full_url =
                'https://latelier-des-chercheurs.fr/thumbs/outils/station-de-documentation/_1060635-1200x801-q60.jpg'
            "
          >
            {{ $t("example_image_url") }}
          </button>
        </small>
      </div>

      <div class="_importButton">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          :disabled="!allow_save || is_importing_url"
          @click="importFromUrl"
        >
          {{ $t("import") }}
        </button>
      </div>

      <div v-if="is_importing_url" class="_loader">
        <div class="u-spinner"></div>
        <p>{{ $t("importing_from_url") }}</p>
      </div>

      <div v-if="preview_url" class="_previewImage">
        <img :src="preview_url" :alt="$t('preview')" />
        <p class="u-instructions">{{ $t("preview_of_image") }}</p>
      </div>
    </div>
  </BaseModal2>
</template>

<script>
export default {
  props: {
    path: {
      type: String,
      required: true,
    },
  },
  components: {},
  data() {
    return {
      full_url: "",
      allow_save: false,
      is_importing_url: false,
      preview_url: "",
      debounce_timeout: null,
    };
  },
  watch: {
    full_url(new_url) {
      if (this.debounce_timeout) clearTimeout(this.debounce_timeout);

      // Clear previous preview
      this.preview_url = "";

      if (new_url && this.isValidImageUrl(new_url)) {
        this.debounce_timeout = setTimeout(() => {
          this.preview_url = new_url;
        }, 1000);
      }
    },
  },
  methods: {
    isValidImageUrl(url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(pathname);
      } catch {
        return false;
      }
    },

    async importFromUrl() {
      if (!this.full_url || !this.allow_save) return;

      this.is_importing_url = true;

      let additional_meta = {
        url: this.full_url,
        $credits: this.full_url,
        $origin: "collect",
        $authors: [this.connected_as.$path],
        requested_slug: this.extractFilenameFromUrl(this.full_url),
      };

      try {
        const { uploaded_meta } = await this.$api.uploadFile({
          path: this.path,
          additional_meta,
        });

        if (uploaded_meta) {
          this.$emit("importedURL", uploaded_meta);
          this.$emit("close");
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error importing from URL:", error);
        this.$alertify.delay(4000).error(this.$t("failed_to_import_from_url"));
      } finally {
        this.is_importing_url = false;
      }
    },

    extractFilenameFromUrl(url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const filename = pathname.split("/").pop();
        return filename.replace(/\.[^/.]+$/, ""); // Remove extension
      } catch {
        return "imported-image";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
._urlPicker {
  width: 100%;
  margin: 0 auto;
}

._urlBox {
  margin-bottom: calc(var(--spacing) * 1);
}

._examples {
  display: inline-flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
}

._loader {
  position: relative;
  margin-top: calc(var(--spacing) * 1);
  text-align: center;
}

._importButton {
  margin-top: calc(var(--spacing) * 1);
  text-align: center;
}

._previewImage {
  margin-top: calc(var(--spacing) * 1);
  text-align: center;

  img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 4px;
    border: 2px solid var(--c-gris);
  }
}
</style>
