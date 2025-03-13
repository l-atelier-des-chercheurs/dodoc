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
      if ($event.dataTransfer.types.includes("Files")) this.is_dragover = true;
    },
    onDragLeave($event) {
      $event.preventDefault();
      this.is_dragover = false;
    },
    onDrop($event) {
      this.is_dragover = false;
      if ($event.dataTransfer.files?.length > 0)
        this.$emit(
          "update:files_to_import",
          Array.from($event.dataTransfer.files)
        );
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
