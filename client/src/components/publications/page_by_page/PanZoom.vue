<template>
  <div class="" @panzoomzoom="panzoomzoom">
    <slot />
  </div>
</template>
<script>
export default {
  props: {
    scale: Number,
  },
  components: {},
  data() {
    return {
      panzoom: undefined,
    };
  },
  created() {},
  mounted() {
    const elem = this.$el;
    /* eslint-disable */
    this.panzoom = Panzoom(elem, {
      maxScale: 5,
      step: 0.05,
      handleStartEvent: () => {
        this.$emit("startPan");
      },
    });

    elem.parentElement.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      this.panzoom.zoomWithWheel(e);
    });
  },
  beforeDestroy() {},
  watch: {
    scale() {
      this.updateScale(this.scale);
    },
  },
  computed: {},
  methods: {
    panzoomzoom($event) {
      if ($event.detail.scale !== this.scale)
        this.$emit("update:scale", $event.detail.scale);
    },
    updateScale(scale) {
      this.panzoom.zoom(scale, { animate: true });
    },
  },
};
</script>
<style lang="scss" scoped></style>
