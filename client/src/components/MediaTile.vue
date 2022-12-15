<template>
  <div
    class="_mediaTile"
    :class="{
      'was--focused': was_focused,
    }"
    :draggable="true"
    @dragstart="startMediaDrag($event)"
    @dragend="endMediaDrag()"
  >
    <MediaContent :file="file" />
    <button
      type="button"
      class="_focusMediaBtn"
      @click="$emit('toggleMediaFocus', file.$path)"
    />
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    project_path: String,
    was_focused: Boolean,
  },
  components: {},
  data() {
    return { is_dragged: false };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    startMediaDrag($event) {
      console.log(`MediaFocus / startMediaDrag`);
      this.is_dragged = true;
      $event.dataTransfer.setData("text/plain", JSON.stringify(this.file));
      $event.dataTransfer.effectAllowed = "move";
      this.$eventHub.$emit(`mediadrag.start`);
    },
    endMediaDrag() {
      this.is_dragged = false;
      console.log(`MediaFocus / endMediaDrag`);
      this.$eventHub.$emit(`mediadrag.end`);
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaTile {
  position: relative;
  aspect-ratio: 1/1;
  background: rgba(255, 255, 255, 0.35);
  overflow: hidden;
  border-radius: 3px;

  transition: all 1s 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &.was--focused {
    // border: 2px solid var(--c-vert);
    background: var(--c-noir);
  }

  &[data-type="text"],
  &[data-type="other"] {
    display: flex;
    justify-content: center;
    align-items: center;

    text-align: center;
  }

  ::v-deep {
    img {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      max-width: none;
    }
  }
}

._focusMediaBtn {
  appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  background: transparent;
  opacity: 0.3;
  transition: all 0.1s linear;

  &:hover {
    background: white;
    // background: rgba(255, 255, 255, 0.35);
    transition: none;
  }
}
</style>
