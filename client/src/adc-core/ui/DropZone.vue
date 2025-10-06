<template>
  <transition name="scaleInFade_fast">
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
      :style="{
        '--rotate-angle': `${rotate}deg`,
      }"
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
  props: {
    media_types_allowed: Array,
    rotate: {
      type: Number,
      default: 0,
    },
  },
  components: {},
  data() {
    return {
      show_dropzone: false,
      is_dragover: false,
      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),
    };
  },
  created() {},
  mounted() {
    // détecter côté mediatile qu'une dropzone est ouverte,
    // avec les contraintes (que les images, que les images et vidéos, etc.)
    this.media_types_allowed;

    let dz = {
      id: this.id,
    };
    if (this.media_types_allowed) dz.allowed_types = this.media_types_allowed;

    this.$root.registerDropzone(dz);
    this.$eventHub.$on(`dragfile.start`, this.showDropzone);
    this.$eventHub.$on(`dragfile.end`, this.hideDropzone);
  },
  beforeDestroy() {
    this.$root.unregisterDropzone({
      id: this.id,
    });
    this.$eventHub.$off(`dragfile.start`, this.showDropzone);
    this.$eventHub.$off(`dragfile.end`, this.hideDropzone);
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
      this.$eventHub.$emit("dragfile.success");
      this.$emit("mediaDropped", file);
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
  padding: 0;
  min-width: 20px;

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
  --dropzone-color2: white;
  --dropzone-color1: var(--active-color);

  position: absolute;
  z-index: 0;
  inset: 0;
  border-radius: 4px;
}

._dropNotice {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(var(--rotate-angle));
  pointer-events: none;
  white-space: nowrap;

  color: var(--c-noir);
  font-weight: 600;
}
</style>
