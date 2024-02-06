<template>
  <div v-if="can_be_dragged" class="_dragTile">
    <div
      class="u-button u-button_icon"
      :class="{
        'is--dragged': is_dragged,
      }"
      draggable="true"
      @dragstart="startMediaDrag($event)"
      @dragend="endMediaDrag()"
    >
      <b-icon icon="hand-index-fill" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    is_dragged: Boolean,
  },
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    can_be_dragged() {
      return this.$root.fileCanBeDragged({
        type: this.file.$type,
      });
    },
  },
  methods: {
    startMediaDrag($event) {
      console.log(`MediaFocus / startMediaDrag`);
      this.$emit("update:is_dragged", true);
      $event.dataTransfer.setData("text/plain", JSON.stringify(this.file));
      $event.dataTransfer.effectAllowed = "move";
      this.$eventHub.$emit(`mediatile.drag.start`);
    },
    endMediaDrag() {
      console.log(`MediaFocus / endMediaDrag`);
      this.$emit("update:is_dragged", false);
      this.$eventHub.$emit(`mediatile.drag.end`);
    },
  },
};
</script>
<style lang="scss" scoped>
._dragTile {
  position: absolute;
  top: 0;
  right: 0;
  color: white;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  pointer-events: none;

  > * {
    display: block;
    pointer-events: auto;

    cursor: -webkit-grab;
    cursor: -moz-grab;
    cursor: grab;

    &:hover,
    &:focus {
      cursor: -webkit-grabbing;
      cursor: -moz-grabbing;
      cursor: dragging;
    }

    ::v-deep svg {
      stroke: var(--c-noir);
      stroke-width: 1px;
    }
  }
}
</style>
