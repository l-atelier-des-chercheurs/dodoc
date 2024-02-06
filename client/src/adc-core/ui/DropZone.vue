<template>
  <transition name="pagechange">
    <div
      v-if="show_dropzone"
      class="_dropZone"
      :class="{
        'is--dragover': is_dragover,
      }"
      @dragover="onDragover"
      @dragenter="onDragEnter"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <div
        class="u-dropzone is--active _dzBg"
        :class="{
          'is--dragover': is_dragover,
        }"
      />
      <div class="u-instructions _dropNotice">
        <small v-html="$t('drop_here')" />
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      show_dropzone: false,
      is_dragover: false,
    };
  },
  created() {},
  mounted() {
    // détecter côté mediatile qu'une dropzone est ouverte,
    // avec les contraintes (que les images, que les images et vidéos, etc.)
    this.$eventHub.$on(`mediatile.drag.start`, this.showDropzone);
    this.$eventHub.$on(`mediatile.drag.end`, this.hideDropzone);

    debugger;
  },
  beforeDestroy() {
    this.$eventHub.$off(`mediatile.drag.start`, this.showDropzone);
    this.$eventHub.$off(`mediatile.drag.end`, this.hideDropzone);
  },
  watch: {},
  computed: {},
  methods: {
    showDropzone() {
      this.show_dropzone = true;
    },
    hideDropzone() {
      this.show_dropzone = false;
    },
    onDragover($event) {
      $event.preventDefault();
    },
    onDragEnter($event) {
      $event.preventDefault();
      this.is_dragover = true;
    },
    onDragLeave($event) {
      $event.preventDefault();
      this.is_dragover = false;
    },
    async onDrop($event) {
      this.is_dragover = false;
      $event.preventDefault();
      $event.dataTransfer.dropEffect = "link";

      if ($event.dataTransfer.files?.length > 0) this.droppedFiles($event);
      else if ($event.dataTransfer.getData("text/plain"))
        this.droppedMediaInDodoc($event);
    },
    droppedFiles($event) {
      this.$emit("fileDropped", $event.dataTransfer.files);
    },
    droppedMediaInDodoc($event) {
      const file = JSON.parse($event.dataTransfer.getData("text/plain"));
      const path_to_source_media_metas = [file.$path];
      this.$emit("mediaDropped", { path_to_source_media_metas });
    },
  },
};
</script>
<style lang="scss" scoped>
._dropZone {
  // --color-1: white;
  // --color-2: var(--c-bleuvert);

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: calc(var(--spacing) / 1);

  display: flex;
  flex-flow: row wrap;
  align-content: center;
  justify-content: center;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--dragover {
    // --color-1: var(--c-bleuvert);
    // --color-2: white;
  }
}

._dzBg {
  position: absolute;
  z-index: 0;
  inset: 0;
}

._dropNotice {
  position: relative;
  pointer-events: none;
}
</style>
