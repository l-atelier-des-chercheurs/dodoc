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
      debounce_zoom: undefined,
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      const ow = document.querySelector("._sideCont").offsetWidth || 280;
      this.$refs.viewer.scrollTo(-ow, -5);
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
    onScroll() {
      // console.log("onScroll");
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
}
.viewport {
  position: relative;
  // width: 400px;
  // height: 600px;
}
</style>
