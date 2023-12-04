<template>
  <div
    class="_documentSpot"
    :class="{
      'is--draggedOn': is_draggedOn,
    }"
    v-text="index + 1"
    @dragenter="dragEnter"
    @dragover="dragOver"
    @dragleave="dragLeave"
    @drop="drop"
  />
</template>
<script>
export default {
  props: {
    index: Number,
  },
  components: {},
  data() {
    return {
      is_draggedOn: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    dragEnter(event) {
      const file_path = event.dataTransfer.getData("text/uri-list");
      if (file_path) this.is_draggedOn = true;
    },
    dragOver(event) {
      event.preventDefault();
    },
    dragLeave() {
      this.is_draggedOn = false;
    },
    drop(event) {
      event.preventDefault();
      this.is_draggedOn = false;
      const file_path = event.dataTransfer.getData("text/uri-list");
      if (file_path) {
        // this.$alertify.delay(4000).success("add file" + file_path);
        this.createOrAppendToStack(file_path);
      }
    },
    createOrAppendToStack() {
      debugger;
    },
  },
};
</script>
<style lang="scss" scoped>
._documentSpot {
  position: relative;

  width: 60px;
  height: 60px;
  margin-bottom: calc(var(--spacing) / 1);
  border-radius: 8px;

  border: 2px dotted currentColor;

  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  text-transform: uppercase;
  font-size: var(--sl-font-size-x-large);
  font-weight: bolder;

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  &.is--draggedOn {
    background: var(--c-gris);
  }
}
</style>
