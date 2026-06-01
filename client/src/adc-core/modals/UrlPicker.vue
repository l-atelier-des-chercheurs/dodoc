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
          :label_str="$t('file_url')"
          :instructions="$t('file_url_instr')"
          :content.sync="full_url"
          :placeholder="'https://example.com/document.pdf'"
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
            {{ $t("example_file_url") }}
          </button>
        </small>
      </div>

      <div class="_importButton">
        <button
          type="button"
          class="u-button u-button_bleuvert"
          :disabled="!allow_save || is_importing_url || !is_valid_file_url"
          @click="importFromUrl"
        >
          {{ $t("import") }}
        </button>
      </div>

      <div v-if="is_importing_url" class="_loader">
        <div class="u-spinner"></div>
        <p>{{ $t("importing_from_url") }}</p>
      </div>

      <div v-if="preview_url" class="_previewFile">
        <!-- Image preview -->
        <img
          v-if="isImageFile(preview_url)"
          :src="preview_url"
          :alt="$t('preview')"
        />
        <!-- Video preview -->
        <video v-else-if="isVideoFile(preview_url)" :src="preview_url" controls>
          {{ $t("video_preview_not_supported") }}
        </video>
        <!-- Audio preview -->
        <audio v-else-if="isAudioFile(preview_url)" :src="preview_url" controls>
          {{ $t("audio_preview_not_supported") }}
        </audio>
        <!-- PDF preview -->
        <iframe
          v-else-if="isPdfFile(preview_url)"
          :src="preview_url"
          type="application/pdf"
        >
          {{ $t("pdf_preview_not_supported") }}
        </iframe>
        <!-- Executable files -->
        <div v-else-if="isExecutableFile(preview_url)" class="_fileInfo">
          <div class="_fileIcon">⚠️</div>
          <p class="_fileName">{{ getFileNameFromUrl(preview_url) }}</p>
          <p class="u-warning">{{ $t("executable_file_warning") }}</p>
        </div>
        <!-- Code files -->
        <div v-else-if="isCodeFile(preview_url)" class="_fileInfo _codeFile">
          <div class="_fileIcon">💻</div>
          <p class="_fileName">{{ getFileNameFromUrl(preview_url) }}</p>
          <p class="_fileType">{{ $t("code_file") }}</p>
        </div>
        <!-- Archive files -->
        <div
          v-else-if="isArchiveFile(preview_url)"
          class="_fileInfo _archiveFile"
        >
          <div class="_fileIcon">📦</div>
          <p class="_fileName">{{ getFileNameFromUrl(preview_url) }}</p>
          <p class="_fileType">{{ $t("archive_file") }}</p>
        </div>
        <!-- Generic file info -->
        <div v-else class="_fileInfo">
          <div class="_fileIcon">📄</div>
          <p class="_fileName">{{ getFileNameFromUrl(preview_url) }}</p>
          <p class="_fileType">
            {{
              getFileExtension(preview_url)
                ? `.${getFileExtension(preview_url).toUpperCase()}`
                : ""
            }}
          </p>
        </div>
        <p class="u-instructions">{{ $t("preview_of_file") }}</p>
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

      if (new_url && this.isValidFileUrl(new_url)) {
        this.debounce_timeout = setTimeout(() => {
          this.preview_url = new_url;
        }, 1000);
      }
    },
  },
  computed: {
    is_valid_file_url() {
      return this.isValidFileUrl(this.full_url);
    },
  },
  methods: {
    isValidFileUrl(url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();

        // Accept any URL that ends with a file extension (dot followed by characters)
        // This covers all possible file types without maintaining a specific list
        return /\.[a-zA-Z0-9]+$/.test(pathname);
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
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error importing from URL:", error);

        // Handle specific error cases
        if (error.code === "file_size_limit_exceeded") {
          const maxSize = error.err_infos?.upload_max_file_size_in_mo || 10000;
          this.$alertify
            .delay(6000)
            .error(this.$t("file_size_limit_exceeded", { maxSize }));
        } else {
          this.$alertify
            .delay(4000)
            .error(this.$t("failed_to_import_from_url"));
        }
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
        return "imported-file";
      }
    },

    getFileExtension(url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        const match = pathname.match(/\.([a-zA-Z0-9]+)$/);
        return match ? match[1] : null;
      } catch {
        return null;
      }
    },

    isImageFile(url) {
      const ext = this.getFileExtension(url);
      return (
        ext &&
        [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "svg",
          "bmp",
          "tiff",
          "tif",
        ].includes(ext)
      );
    },

    isVideoFile(url) {
      const ext = this.getFileExtension(url);
      return (
        ext && ["mp4", "webm", "mov", "avi", "flv", "mkv", "wmv"].includes(ext)
      );
    },

    isAudioFile(url) {
      const ext = this.getFileExtension(url);
      return ext && ["mp3", "wav", "aac", "ogg"].includes(ext);
    },

    isPdfFile(url) {
      const ext = this.getFileExtension(url);
      return ext === "pdf";
    },

    isExecutableFile(url) {
      const ext = this.getFileExtension(url);
      return (
        ext &&
        [
          "exe",
          "msi",
          "deb",
          "rpm",
          "dmg",
          "pkg",
          "app",
          "bat",
          "cmd",
          "sh",
          "bash",
          "ps1",
        ].includes(ext)
      );
    },

    isCodeFile(url) {
      const ext = this.getFileExtension(url);
      return (
        ext &&
        [
          "ino",
          "cpp",
          "c",
          "h",
          "hpp",
          "java",
          "py",
          "rb",
          "pl",
          "php",
          "lua",
          "go",
          "rs",
          "swift",
          "kt",
          "scala",
          "r",
          "m",
          "mm",
          "cs",
          "vb",
        ].includes(ext)
      );
    },

    isArchiveFile(url) {
      const ext = this.getFileExtension(url);
      return ext && ["zip", "rar", "7z", "tar", "gz"].includes(ext);
    },

    getFileNameFromUrl(url) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        return pathname.split("/").pop() || "file";
      } catch {
        return "file";
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

._previewFile {
  margin-top: calc(var(--spacing) * 1);
  text-align: center;

  img,
  video,
  iframe {
    max-width: 100%;
    max-height: 200px;
    margin: 0 auto;
    border-radius: 4px;
    border: 2px solid var(--c-gris);
  }

  audio {
    width: 100%;
    max-width: 300px;
    margin: 0 auto;
  }

  ._fileInfo {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: calc(var(--spacing) * 1);
    border: 2px solid var(--c-gris);
    border-radius: 4px;
    background: var(--c-gris_clair);

    ._fileIcon {
      font-size: 2rem;
      margin-bottom: calc(var(--spacing) / 2);
    }

    ._fileName {
      font-weight: bold;
      margin: 0;
      word-break: break-all;
    }

    ._fileType {
      font-size: 0.9rem;
      color: var(--c-gris);
      margin: calc(var(--spacing) / 4) 0 0 0;
    }

    &._codeFile {
      border-color: var(--c-bleuvert);
      background: rgba(0, 150, 255, 0.05);
    }

    &._archiveFile {
      border-color: var(--c-orange);
      background: rgba(255, 165, 0, 0.05);
    }
  }
}
</style>
