<template>
  <!-- not a <button> because buttons cant be draggable on Firefox -->
  <div
    v-if="can_be_dragged"
    class="_dragFile"
    draggable="true"
    @dragstart="startMediaDrag($event)"
    @dragend="endMediaDrag()"
  >
    <button
      type="button"
      class="u-button u-button_icon"
      :class="{
        'is--dragged': is_dragged,
        'u-button_small': size === 'small',
      }"
    >
      <b-icon icon="hand-index-thumb" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    size: String,
    is_dragged: Boolean,
  },
  components: {},
  data() {
    return {};
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
      console.log(`DragFile / startMediaDrag`);
      this.$emit("update:is_dragged", true);
      $event.dataTransfer.setData("text/plain", JSON.stringify(this.file));
      $event.dataTransfer.effectAllowed = "move";
      this.$eventHub.$emit(`dragfile.start`);
      this.$eventHub.$on("dragfile.success", this.dragfileSuccess);
    },
    endMediaDrag() {
      console.log(`DragFile / endMediaDrag`);
      this.$emit("update:is_dragged", false);
      this.$eventHub.$emit(`dragfile.end`);
      this.$nextTick(() => {
        this.$eventHub.$off("dragfile.success", this.dragfileSuccess);
      });
    },
    dragfileSuccess() {
      console.log(`DragFile / dragfileSuccess`);
      // adding some timeout to make sure some operations finished
      setTimeout(() => {
        this.$emit("dragfileSuccess");
      }, 100);
    },
  },
};
</script>
<style lang="scss" scoped>
._dragFile {
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
  }
}
</style>
