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
    <div class="u-button u-button_orange _dropNotice">
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

      if (!$event.dataTransfer.getData("text/plain")) return false;

      const file = JSON.parse($event.dataTransfer.getData("text/plain"));
      const path_to_source_media = file.$path;

      this.$emit("mediaDropped", { path_to_source_media });
    },
  },
};
</script>
<style lang="scss" scoped>
._dropZone {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  flex-flow: row wrap;
  align-content: center;
  justify-content: center;

  --color-1: transparent;
  // --color-2: var(--c-bleuvert);
  --color-2: var(--c-orange);

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

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--dragover {
    // --color-1: var(--c-bleuvert);
    // --color-2: white;
  }

  ._dropNotice {
    pointer-events: none;
    white-space: nowrap;
  }
}
</style>
