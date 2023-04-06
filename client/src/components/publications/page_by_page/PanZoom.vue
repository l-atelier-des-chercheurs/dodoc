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
    page_opened_id: String,
  },
  components: {},
  data() {
    return {
      panzoom: undefined,
      debounce_zoom: undefined,
      pan_margin_when_moving_to_media: 15,
    };
  },
  created() {},
  async mounted() {
    /* eslint-disable */
    this.$nextTick(() => {
      this.init();
    });
  },
  beforeDestroy() {
    this.$eventHub.$off(`panzoom.panTo`, this.panTo);
  },
  watch: {
    scale() {
      this.updateScale(this.scale);
    },
    page_opened_id: {
      handler() {
        this.$nextTick(() => {
          // const { left, top } = this.getActivePagePos();
          // this.panzoom.pan(left, top, { animate: true });
        });
      },
    },
  },
  computed: {},
  methods: {
    init() {
      const { left, top } = this.getActivePagePos();

      this.panzoom = Panzoom(this.$el, {
        maxScale: 5,
        step: 0.05,
        canvas: true,
        startScale: this.scale,
        startX: left,
        startY: top,
      });

      this.$el.addEventListener("wheel", (e) => {
        if (!e.ctrlKey) return;
        this.panzoom.zoomWithWheel(e);
      });
      this.$el.addEventListener("panzoomzoom", this.panzoomzoom);
      this.$el.addEventListener("panzoomstart", this.panzoomstart);
      this.$el.addEventListener("panzoomend", this.panzoomend);

      this.$eventHub.$on(`panzoom.panTo`, this.panTo);
    },
    getActivePagePos() {
      // const top = this.$el.querySelector(
      //   "._spreadNavigator--page.is--active"
      // ).offsetTop;
      const el_left = this.$el.querySelector(
        "._spreadNavigator--page.is--active"
      ).offsetLeft;
      const menu_width = document.querySelector("._sideCont").offsetWidth;

      // 43 is height of sidecont breadcrumb
      const distance_to_corner = this.pan_margin_when_moving_to_media;

      const left = -el_left + menu_width + distance_to_corner;
      const top = distance_to_corner;

      return { left, top };
    },
    panTo({ x, y }) {
      // console.log(`panto ${x} - ${y}`);
      this.panzoom.pan(
        -x + 280 + this.pan_margin_when_moving_to_media,
        -y + this.pan_margin_when_moving_to_media,
        { animate: true }
      );
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
