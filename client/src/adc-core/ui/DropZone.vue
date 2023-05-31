<template>
  <div
    class="_dropZone"
    :class="{
      'is--dragover': is_dragover,
    }"
    @dragover="onDragover"
    @dragenter="onDragEnter"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div class="_dzBg" />
    <div class="u-button u-button_small u-button_bleuvert _dropNotice">
      {{ $t("drop_here") }}
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      is_dragover: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
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
  --color-1: white;
  --color-2: var(--c-bleuvert);

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  flex-flow: row wrap;
  align-content: center;
  justify-content: center;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--dragover {
    --color-1: var(--c-bleuvert);
    --color-2: white;
  }

  ._dropNotice {
    position: relative;
    pointer-events: none;
    white-space: nowrap;
  }
  &.is--dragover ._dropNotice {
    background: var(--c-bleuvert_fonce);
  }
}

._dzBg {
  position: absolute;
  z-index: 0;
  inset: 0;

  background: radial-gradient(
      circle,
      transparent 20%,
      var(--color-1) 20%,
      var(--color-1) 80%,
      transparent 80%,
      transparent
    ),
    radial-gradient(
        circle,
        transparent 20%,
        var(--color-1) 20%,
        var(--color-1) 80%,
        transparent 80%,
        transparent
      )
      15px 15px,
    linear-gradient(
        var(--color-2) 1.2000000000000002px,
        transparent 1.2000000000000002px
      )
      0 -0.6000000000000001px,
    linear-gradient(
        90deg,
        var(--color-2) 1.2000000000000002px,
        var(--color-1) 1.2000000000000002px
      ) -0.6000000000000001px 0;
  background-size: 30px 30px, 30px 30px, 15px 15px, 15px 15px;
  // background-size: 4px;

  mix-blend-mode: multiply;
}
</style>
