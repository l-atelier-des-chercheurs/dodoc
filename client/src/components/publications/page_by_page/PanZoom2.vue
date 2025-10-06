<template>
  <vue-infinite-viewer
    class="viewer"
    ref="viewer"
    v-bind="viewerOptions"
    @scroll="onScroll"
    @dragStart="dragStart"
    @dragEnd="dragEnd"
    @pinchStart="pinchStart"
    @abortPinch="abortPinch"
    @pinch="pinch"
  >
    <div class="_pzViewport">
      <slot />
    </div>
  </vue-infinite-viewer>

  <!-- <div class="viewer">
    <div class="viewport">
      Donec sit amet enim efficitur, dapibus dolor ac, porttitor ipsum. Mauris
      in maximus erat. Vestibulum diam diam, congue interdum dolor a, lacinia
      egestas neque. Nullam lobortis mattis neque, ut feugiat dolor hendrerit
      quis. Donec aliquet nulla at lacus gravida, vitae faucibus lacus mollis.
      Donec pulvinar ligula mi, non interdum velit sodales nec. Phasellus
      imperdiet convallis sagittis. Quisque sem leo, sagittis in nisi sed,
      accumsan suscipit ipsum. Aliquam erat volutpat.
    </div>
  </div> -->
  <!-- <slot /> -->
</template>
<script>
// import InfiniteViewer from "infinite-viewer";
import { VueInfiniteViewer } from "vue-infinite-viewer";

export default {
  props: {
    scale: Number,
    contentWidth: Number,
    contentHeight: Number,
    magnification: Number,
  },
  components: {
    VueInfiniteViewer,
  },
  data() {
    return {
      viewerOptions: {},

      scroll_left: undefined,
      scroll_top: undefined,

      debounce_zoom: undefined,
      debounce_scroll: undefined,
    };
  },
  created() {},
  mounted() {
    this.updateViewerOptions();
    this.$nextTick(() => {
      this.scrollToCorner({ animate: false });
    });

    this.$eventHub.$on(`panzoom.panTo`, this.panTo);
  },
  beforeDestroy() {
    this.$eventHub.$off(`panzoom.panTo`, this.panTo);
    this.$root.set_new_module_offset_left = 0;
    this.$root.set_new_module_offset_top = 0;
  },
  watch: {
    scale() {
      this.updateScale(this.scale);
      this.updateViewerOptions();
    },
    contentWidth() {
      this.updateViewerOptions();
    },
    contentHeight() {
      this.updateViewerOptions();
    },
    magnification() {
      this.updateViewerOptions();
    },
  },
  computed: {},
  methods: {
    updateViewerOptions() {
      let rangeX = undefined;
      let rangeY = undefined;

      const padding = 50 * this.magnification;
      if (this.$el?.offsetWidth) {
        const max_range_x = Math.max(0, this.contentWidth * this.magnification);
        rangeX = [-padding, max_range_x - padding];
        const max_range_y = Math.max(
          0,
          this.contentHeight * this.magnification
        );
        rangeY = [-padding, max_range_y - padding];
      }

      console.log("rangeX", JSON.stringify(rangeX));
      console.log("rangeY", JSON.stringify(rangeY));

      this.viewerOptions = {
        useMouseDrag: true,
        useWheelScroll: true,
        useAutoZoom: true,
        zoomRange: [0.4, 10],
        maxPinchWheel: 10,

        // Use content dimensions to calculate proper pan ranges
        rangeX,
        rangeY,

        displayVerticalScroll: true,
        displayHorizontalScroll: true,
      };
    },
    dragStart(event) {
      console.log("dragStart");
      if (event.inputEvent.target.classList.contains("panzoom-exclude"))
        event.stop();
    },
    dragEnd(event) {
      console.log("dragEnd");
      if (!event.isDrag) this.disableActiveModule();
    },
    pinchStart() {
      console.log("pinchStart");
    },
    abortPinch() {
      console.log("abortPinch");
    },
    pinch() {
      // console.log("pinch");
      if (this.debounce_zoom) clearTimeout(this.debounce_zoom);
      this.debounce_zoom = setTimeout(async () => {
        const zoom = this.$refs.viewer.getZoom();
        if (zoom !== this.scale) this.$emit("update:scale", zoom);
      }, 500);
    },
    panTo({ x, y }) {
      this.scrollToCorner({ x, y, animate: true });
    },
    scrollToCorner({ x, y, animate }) {
      const opt = animate ? { duration: 200 } : undefined;

      const margin = 80;

      let _x = (x || 0) + -(0 + margin) / this.scale;
      let _y = (y || 0) + -margin / this.scale;
      this.$refs.viewer.scrollTo(_x, _y, opt);
    },
    updateScale(scale) {
      if (scale !== this.$refs.viewer.getZoom()) {
        this.$refs.viewer.setZoom(scale, {
          // easing: () => 100,
          duration: 200,
          zoomBase: "viewport",
          zoomOffsetX: this.$root.zoom_offset,
          zoomOffsetY: this.$root.zoom_offset,
        });
      }
    },
    disableActiveModule() {
      this.$eventHub.$emit("module.setActive", false);
    },
    onScroll() {
      // console.log("onScroll");
      if (this.debounce_scroll) clearTimeout(this.debounce_scroll);
      this.debounce_scroll = setTimeout(async () => {
        this.$root.set_new_module_offset_left = Math.max(
          0,
          this.$refs.viewer.getScrollLeft()
        );
        this.$root.set_new_module_offset_top = Math.max(
          0,
          this.$refs.viewer.getScrollTop()
        );
      }, 500);
    },
  },
};
</script>
<style lang="scss" scoped>
.viewer {
  // border: 1px solid black;
  position: relative;
  width: 100%;
  height: 100%;
  cursor: move;
}
._pzViewport {
  position: relative;
  // width: 400px;
  // height: 600px;
}
</style>
