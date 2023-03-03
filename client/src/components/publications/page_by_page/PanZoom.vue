<template>
  <div class="">
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
    /* eslint-disable */
    this.panzoom = Panzoom(this.$el, {
      maxScale: 5,
      step: 0.05,
      handleStartEvent: () => {
        this.$emit("startPan");
      },
    });

    this.$el.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      this.panzoom.zoomWithWheel(e);
    });
    this.$el.addEventListener("panzoomzoom", this.panzoomend);
  },
  beforeDestroy() {},
  watch: {
    scale() {
      this.updateScale(this.scale);
    },
  },
  computed: {},
  methods: {
    panzoomend($event) {
      if ($event.detail.scale !== this.scale)
        this.$emit("update:scale", $event.detail.scale);
    },
    updateScale(scale) {
      debugger;
      if (scale !== this.panzoom.getScale()) {
        this.panzoom.zoom(scale, { animate: true });
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
