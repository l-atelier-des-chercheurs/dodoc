<template>
  <div class="_flickityCarousel">
    <div
      class="_flickityCarousel--inner"
      :class="{ 'is-fullscreen': is_fullscreen }"
      ref="flickity"
    >
      <slot></slot>
    </div>

    <!-- Fullscreen button -->
    <div class="_fsButton" v-if="show_fullscreen_button">
      <EditBtn
        :btn_type="is_fullscreen ? 'fullscreen-exit' : 'fullscreen'"
        @click="toggleFullscreen"
      />
    </div>
  </div>
</template>

<script>
import Flickity from "flickity";
import "flickity-imagesloaded";
import screenfull from "screenfull";

export default {
  name: "FlickityCarousel",
  props: {
    options: {
      type: Object,
      default: () => ({
        initialIndex: 0,
        groupCells: false,
        imagesLoaded: true,
        pageDots: true,
        selectedAttraction: 0.2,
        percentPosition: false,
        friction: 0.8,
        cellAlign: "left",
        contain: true,
      }),
    },
    show_fullscreen_button: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      flickity: null,
      observer: null,
      is_fullscreen: false,
    };
  },
  mounted() {
    this.initFlickity();

    let debounce_resize = undefined;
    this.observer = new ResizeObserver(() => {
      if (debounce_resize) clearTimeout(debounce_resize);
      debounce_resize = setTimeout(() => {
        this.resize();
      }, 700);
    });
    this.observer.observe(this.$el);
  },
  beforeDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.flickity) {
      this.flickity.destroy();
    }
  },
  methods: {
    initFlickity() {
      this.flickity = new Flickity(this.$refs.flickity, this.options);
      this.$emit("flickity-ready", this.flickity);
    },
    resize() {
      if (this.flickity?.resize) {
        console.log("resize");
        this.flickity.resize();
      }
    },
    async toggleFullscreen() {
      if (this.is_fullscreen) {
        await this.exitFullscreen();
      } else {
        await this.enterFullscreen();
      }
    },
    async enterFullscreen() {
      if (!screenfull.isEnabled) return;

      await screenfull.request(this.$el);
      this.is_fullscreen = true;

      screenfull.onchange(() => {
        if (!screenfull.isFullscreen) {
          this.is_fullscreen = false;
          this.$emit("fullscreen-exit");
          setTimeout(() => {
            this.resize();
          }, 1000);
        }
      });

      this.$emit("fullscreen-enter");
    },
    async exitFullscreen() {
      if (!screenfull.isEnabled) return;

      await screenfull.exit();
      this.is_fullscreen = false;
      this.$emit("fullscreen-exit");
    },
  },
};
</script>

<style src="@node_modules/flickity/dist/flickity.min.css"></style>
<style lang="scss" scoped>
._flickityCarousel {
  position: relative;
  width: 100%;
  page-break-inside: avoid;
  -webkit-region-break-inside: avoid;

  ._flickityCarousel--inner {
    width: 100%;
    height: 100%;

    &.is-fullscreen {
      .carousel-cell {
        width: 100vw;
        height: 100vh;
        aspect-ratio: initial;
      }
    }
  }

  .carousel-cell {
    width: 100%;
    aspect-ratio: 3/2;
    margin-right: calc(var(--spacing) * 1);

    &[data-mediatype="text"] {
      padding: min(calc(var(--spacing) * 3), 15%);
    }
  }

  ._fsButton {
    position: absolute;
    bottom: calc(var(--spacing) / 1);
    left: calc(var(--spacing) / 1);
    z-index: 10;
  }

  ::v-deep {
    .flickity-prev-next-button {
      // top: auto;
      // bottom: calc(var(--spacing) * 1);

      &.flickity-prev-next-button.previous {
        left: calc(var(--spacing) / 2);
      }
      &.flickity-prev-next-button.next {
        right: calc(var(--spacing) / 2);
      }
    }
    ._mediaContent .plyr__controls {
      padding-right: calc(var(--spacing) * 3);
    }

    .flickity-page-dots {
      bottom: 0;
      display: flex;
      justify-content: center;
      flex-flow: row nowrap;
      gap: calc(var(--spacing) / 3);
      padding: calc(var(--spacing) / 2);
      pointer-events: none;

      .flickity-page-dot {
        background: rgba(255, 255, 255, 0.5);
        border: none;
        opacity: 1;
        margin: 0;
        padding: calc(var(--spacing) / 4);
        border: 2px solid transparent;
        pointer-events: auto;

        transition: all 0.1s cubic-bezier(0.19, 1, 0.22, 1);

        &:hover,
        &:active,
        &:focus-visible {
          border-color: var(--active-color);
        }

        &.is-selected {
          background: var(--active-color);
          border-color: var(--active-color);
        }
      }
    }
  }
}
</style>
