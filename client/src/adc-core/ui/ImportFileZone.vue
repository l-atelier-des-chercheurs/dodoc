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
        <svg width="20" height="17" viewBox="0 0 20 17">
          <path
            d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
          />
        </svg>
        {{ $t("import") }}
      </div>
      <div class="u-instructions">
        {{ $t("or_drag_drop_file_here").toLowerCase() }}
      </div>
    </label>
    <input
      type="file"
      multiple="multiple"
      :id="id + '-add_file'"
      name="file"
      accept=""
      class=""
      @change="updateInputFiles($event)"
    />
    <UploadFiles
      v-if="files_to_import.length > 0"
      :files_to_import="files_to_import"
      :path="project_path"
      @importedMedias="$emit('mediaJustImported', $event)"
      @close="files_to_import = []"
    />
  </div>
</template>
<script>
export default {
  props: {
    project_path: String,
  },
  components: {},
  data() {
    return {
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      files_to_import: [],
      is_dragover: false,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {
    window.addEventListener("paste", this.handlePaste);
  },
  mounted() {
    window.removeEventListener("paste", this.handlePaste);
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    handlePaste($event) {
      if (this.$root.modal_is_opened) return;
      if ($event.clipboardData.files?.length > 0)
        this.files_to_import = Array.from($event.clipboardData.files);
    },
    updateInputFiles($event) {
      this.files_to_import = Array.from($event.target.files);
      $event.target.value = "";
    },
    fileDropped(files) {
      this.files_to_import = Array.from(files);
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
        this.files_to_import = Array.from($event.dataTransfer.files);
    },
  },
};
</script>
<style lang="scss" scoped>
._importFileZone {
  .u-dropzone {
    --dropzone-color1: var(--c-orange);
    --dropzone-color2: var(--c-rouge);
    cursor: pointer;

    &.is--dragover,
    &:hover,
    &:focus {
    }
  }
  .u-instructions {
    color: white;
  }
}
</style>
