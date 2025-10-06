<template>
  <div
    class="_imageZoom"
    :data-zoomed="is_zoomed"
    @click="toggleZoom"
    @mousemove="mouseMoved"
  >
    <transition name="fade_fast" mode="in-out">
      <img
        v-if="!is_zoomed"
        :src="small_img"
        :style="image_styles"
        :key="'zoom-' + is_zoomed"
      />
      <img
        v-else
        :src="large_img"
        :style="image_styles"
        :key="'zoom-' + is_zoomed"
      />
    </transition>

    <transition name="slideupFade" mode="out-in">
      <div class="_clickToZoomBtn" :key="is_zoomed">
        <button
          v-if="!is_zoomed"
          type="button"
          class="u-button u-button_white u-button_small"
          @click.stop="toggleZoom"
        >
          <b-icon icon="zoom-in" />
          {{ $t("click_to_zoom") }}
        </button>
        <button
          v-else
          type="button"
          class="u-button u-button_white u-button_small"
          @click.stop="toggleZoom"
        >
          <b-icon icon="zoom-out" />
          {{ $t("zoom_out") }}
        </button>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    small_img: String,
    large_img: String,
    width: Number,
    ratio: Number,
  },
  components: {},
  data() {
    return {
      is_zoomed: false,
      ro: undefined,

      cont_width: undefined,
      cont_height: undefined,
      pos_x: undefined,
      pos_y: undefined,
    };
  },

  created() {},
  mounted() {
    this.updateContSize();
    this.ro = new ResizeObserver(this.updateContSize);
    this.ro.observe(this.$el);
  },
  beforeDestroy() {
    this.ro.unobserve(this.$el);
  },
  watch: {
    is_zoomed(new_val) {
      if (new_val) this.$emit("zoomingIn");
      else this.$emit("zoomingOut");
    },
  },
  computed: {
    pos_x_percent() {
      return this.pos_x / this.cont_width;
    },
    pos_y_percent() {
      return this.pos_y / this.cont_height;
    },
    padding() {
      return this.$root.window.innerWidth * 0.2;
    },
    image_styles() {
      if (this.is_zoomed) {
        const zoom_level = this.width
          ? Math.max(2, this.width / this.cont_width / 2)
          : 2;
        const new_width = this.cont_width * zoom_level;
        const new_height = new_width * this.ratio;

        const translate_x =
          this.pos_x_percent *
            -1 *
            (new_width - this.cont_width + this.padding) +
          this.padding / 2;
        const translate_y =
          this.pos_y_percent *
            -1 *
            (new_height - this.cont_height + this.padding) +
          this.padding / 2;

        // en haut à gauche = 0 0 -> 0 0
        // en haut à droite = 1 0 ->
        return `
        max-width: none;
        width: ${new_width}px;
        height: ${new_height}px;
        transform: translate(${translate_x}px, ${translate_y}px);
        pointer-events: none;
        `;
      }
      return `
        position: absolute;
        width: 100%;
        height: 100%;
        object-fit: contain;
`;
    },
  },
  methods: {
    toggleZoom() {
      this.is_zoomed = !this.is_zoomed;
    },
    updateContSize() {
      this.cont_width = this.$el.offsetWidth;
      this.cont_height = this.$el.offsetHeight;
    },
    mouseMoved(event) {
      let { offsetX, offsetY } = event.touches ? event.touches[0] : event;
      this.pos_x = offsetX;
      this.pos_y = offsetY;
    },
  },
};
</script>
<style lang="scss" scoped>
._imageZoom {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: zoom-in;

  img {
  }

  &[data-zoomed] {
    cursor: zoom-out;
  }
}

._clickToZoomBtn {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  margin: calc(var(--spacing) / 1);
  pointer-events: none;
}
</style>
