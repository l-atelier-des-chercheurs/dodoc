<template>
  <div class="">
    <slot />
  </div>
</template>
<script>
import Panzoom from "@panzoom/panzoom";

export default {
  props: {
    scale: Number,
  },
  components: {},
  data() {
    return {
      panzoom: undefined,
      debounce_zoom: undefined,
    };
  },
  created() {},
  async mounted() {
    /* eslint-disable */
    this.panzoom = Panzoom(this.$el, {
      maxScale: 5,
      step: 0.05,
      canvas: true,
      // handleStartEvent: () => {
      // this.$emit("startPan");
      // },
    });
    setTimeout(() => {
      this.panzoom.pan(280, 50);
    }, 100);

    this.$el.addEventListener("wheel", (e) => {
      if (!e.ctrlKey) return;
      this.panzoom.zoomWithWheel(e);
    });
    this.$el.addEventListener("panzoomzoom", this.panzoomzoom);
    this.$el.addEventListener("panzoomstart", this.panzoomstart);
    this.$el.addEventListener("panzoomend", this.panzoomend);

    this.$eventHub.$on(`panzoom.panTo`, this.panTo);
  },
  beforeDestroy() {
    this.$eventHub.$off(`panzoom.panTo`, this.panTo);
  },
  watch: {
    scale() {
      this.updateScale(this.scale);
    },
  },
  computed: {},
  methods: {
    panTo({ x, y }) {
      console.log(`panto ${x} - ${y}`);
      this.panzoom.pan(-x + 280, -y, { animate: true });
    },
    panzoomzoom($event) {
      if (this.debounce_zoom) clearTimeout(this.debounce_zoom);

      this.debounce_zoom = setTimeout(async () => {
        if ($event.detail.scale !== this.scale)
          this.$emit("update:scale", $event.detail.scale);
      }, 500);
    },
    panzoomstart($event) {
      this.start_pan_x = $event.detail.x;
      this.start_pan_y = $event.detail.y;
    },
    panzoomend($event) {
      $event.stopPropagation();

      const min_pan_distance = 10;
      const calcPanDist = (a, b) => Math.abs(a - b) < 10;

      if (
        calcPanDist(this.start_pan_x, $event.detail.x) &&
        calcPanDist(this.start_pan_y, $event.detail.y)
      )
        this.disableActiveModule();
    },
    updateScale(scale) {
      if (scale !== this.panzoom.getScale()) {
        this.panzoom.zoom(scale, { animate: true });
      }
    },
    disableActiveModule() {
      this.$eventHub.$emit("module.setActive", false);
    },
  },
};
</script>
<style lang="scss" scoped></style>
