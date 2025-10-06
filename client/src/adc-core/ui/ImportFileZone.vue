<template>
  <div class="_importFileZone">
    <label
      class="u-dropzone"
      :class="{
        'is--dragover': is_dragover,
        'is--active': $root.has_file_dragover_on_window,
      }"
      :for="id + '-add_file'"
      @dragover="onDragover"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div class="u-button u-button_red">
        <b-icon icon="upload" :label="$t('import')" />
        {{ $t("import") }}
      </div>
      <div class="u-instructions">
        {{ $t("or_drag_drop_file_here").toLowerCase() }}
      </div>
    </label>
    <input
      type="file"
      :multiple="multiple"
      :id="id + '-add_file'"
      name="file"
      :accept="accepts"
      class=""
      @change="updateInputFiles($event)"
    />
  </div>
</template>
<script>
export default {
  props: {
    files_to_import: Array,
    accepts: String,
    multiple: Boolean,
  },
  components: {},
  data() {
    return {
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      is_dragover: false,
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
    handlePaste($event) {
      if (this.$root.modal_is_opened) return;
      if ($event.clipboardData.files && $event.clipboardData.files.length > 0) {
        $event.preventDefault();
        $event.stopPropagation();
        this.importFiles(Array.from($event.clipboardData.files));
      }
    },
    updateInputFiles($event) {
      this.importFiles(Array.from($event.target.files));
      $event.target.value = "";
    },
    fileDropped(files) {
      this.importFiles(Array.from(files));
    },
    importFiles(files) {
      files = files.reduce((acc, file) => {
        if (file.size > 0) acc.push(file);
        else if (file.size === 0)
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(`File ${file.name} is empty, skipping`);
        return acc;
      }, []);
      this.$emit("update:files_to_import", files);
    },

    onDragover($event) {
      $event.preventDefault();
    },
    onDragEnter($event) {
      $event.preventDefault();
      const dt = $event.dataTransfer;
      const hasFiles = dt && dt.types && dt.types.includes("Files");
      // Some browsers only expose the actual URL at drop time. Use type hints to enable hover.
      const hasPotentialUrl =
        dt &&
        dt.types &&
        (dt.types.includes("text/uri-list") ||
          dt.types.includes("text/html") ||
          dt.types.includes("text/plain"));
      if (hasFiles || hasPotentialUrl) this.is_dragover = true;
    },
    onDragLeave($event) {
      $event.preventDefault();
      this.is_dragover = false;
    },
    async onDrop($event) {
      this.is_dragover = false;
      const dt = $event.dataTransfer;
      if (dt.files?.length > 0) {
        this.$emit("update:files_to_import", Array.from(dt.files));
        return;
      }

      // Handle image dragged from a website (URL payload)
      const imageUrl = this.extractImageUrlFromDataTransfer(dt);
      if (imageUrl) {
        try {
          const file = await this.downloadUrlAsFile(imageUrl);
          if (file) this.importFiles([file]);
          else
            this.$alertify
              .closeLogOnClick(true)
              .delay(4000)
              .error(this.$t("import_image_from_url_failed"));
        } catch (e) {
          this.$alertify
            .closeLogOnClick(true)
            .delay(4000)
            .error(
              `${this.$t("import_image_from_url_failed")}: ${
                e && e.message ? e.message : e
              }`
            );
        }
      }
    },

    hasImageUrlInDataTransfer(dataTransfer) {
      if (!dataTransfer || !dataTransfer.types) return false;
      const url = this.extractImageUrlFromDataTransfer(dataTransfer);
      return Boolean(url);
    },

    extractImageUrlFromDataTransfer(dataTransfer) {
      try {
        // text/uri-list is the most reliable for dragged links/images
        if (dataTransfer.types.includes("text/uri-list")) {
          const data = dataTransfer.getData("text/uri-list");
          const url = (data || "")
            .split("\n")
            .find((l) => l && !l.startsWith("#"));
          if (url && this.looksLikeImageUrl(url)) return url;
        }
        // text/html may contain an <img src="...">
        if (dataTransfer.types.includes("text/html")) {
          const html = dataTransfer.getData("text/html");
          const match = html && html.match(/<img[^>]+src=["']([^"']+)["']/i);
          if (match && match[1] && this.looksLikeImageUrl(match[1]))
            return match[1];
        }
        // Fallback: some browsers put URL in text/plain
        if (dataTransfer.types.includes("text/plain")) {
          const txt = dataTransfer.getData("text/plain");
          if (txt && this.looksLikeImageUrl(txt)) return txt;
        }
      } catch (e) {
        // noop
      }
      return null;
    },

    looksLikeImageUrl(url) {
      try {
        const u = new URL(url);
        const pathname = (u.pathname || "").toLowerCase();
        const exts = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"];
        if (exts.some((ext) => pathname.endsWith(ext))) return true;
        // If no extension, still allow; server may set image/* content-type
        return true;
      } catch (_) {
        return false;
      }
    },

    async downloadUrlAsFile(url) {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      // If not an image, skip
      if (!(blob && blob.type && blob.type.startsWith("image/"))) return null;
      const filename = this.filenameFromUrl(url, blob.type);
      return new File([blob], filename, { type: blob.type });
    },

    filenameFromUrl(url, mimeType) {
      try {
        const u = new URL(url);
        let name = u.pathname.split("/").pop() || "image";
        if (!name.includes(".")) {
          const ext = this.extensionFromMime(mimeType) || "png";
          name = `${name}.${ext}`;
        }
        // Strip query fragments
        name = name.split("?")[0].split("#")[0];
        return name;
      } catch (_) {
        const ext = this.extensionFromMime(mimeType) || "png";
        return `image.${ext}`;
      }
    },

    extensionFromMime(mimeType) {
      if (!mimeType) return null;
      const map = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/bmp": "bmp",
        "image/svg+xml": "svg",
      };
      return map[mimeType] || null;
    },
  },
};
</script>
<style lang="scss" scoped>
._importFileZone {
  .u-dropzone {
    cursor: pointer;
    color: currentColor;

    &.is--dragover,
    &:hover,
    &:focus {
    }
  }
  .u-instructions {
    color: currentColor;
  }
}
</style>
