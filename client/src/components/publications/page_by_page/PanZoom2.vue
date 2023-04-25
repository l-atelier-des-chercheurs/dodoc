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
    <div class="viewport">
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
    page_opened_id: String,
  },
  components: {
    VueInfiniteViewer,
  },
  data() {
    return {
      viewerOptions: {
        useMouseDrag: true,
        useWheelScroll: true,
        useAutoZoom: true,
        zoomRange: [0.1, 10],
        maxPinchWheel: 10,

        displayVerticalScroll: true,
        displayHorizontalScroll: true,
      },

      scroll_left: undefined,
      scroll_top: undefined,

      debounce_zoom: undefined,
      debounce_scroll: undefined,
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.scrollToCorner({ animate: false });
    });

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
    onScroll() {
      // console.log("onScroll");
      if (this.debounce_scroll) clearTimeout(this.debounce_scroll);
      this.debounce_scroll = setTimeout(async () => {
        // this.$root.default_new_module_top = -this.$refs.viewer.getScrollTop();
        // this.$root.default_new_module_left = -this.$refs.viewer.getScrollLeft();
      }, 500);
    },
    dragStart() {
      console.log("dragStart");
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
      const ow = document.querySelector("._sideCont").offsetWidth || 280;

      const margin = 10;

      let _x = (x || 0) + -(ow + margin) / this.scale;
      let _y = (y || 0) + -margin / this.scale;
      this.$refs.viewer.scrollTo(_x, _y, opt);
    },
    updateScale(scale) {
      if (scale !== this.$refs.viewer.getZoom()) {
        this.$refs.viewer.setZoom(scale, {
          // easing: () => 100,
          duration: 200,
          zoomBase: "viewport",
          zoomOffsetX: document.querySelector("._sideCont").offsetWidth,
          zoomOffsetY: 50,
        });
      }
    },
    disableActiveModule() {
      this.$eventHub.$emit("module.setActive", false);
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
.viewport {
  position: relative;
  // width: 400px;
  // height: 600px;
}
</style>
