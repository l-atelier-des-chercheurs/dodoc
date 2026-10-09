<template>
  <portal to="destination">
    <transition name="fade_fast" @after-leave="$emit('close')">
      <div class="_fullscreenView" v-if="show_overlay">
        <div class="_overlay" @click="closeFs" />
        <transition name="scaleInFade" appear>
          <div class="_fsImg">
            <slot />
          </div>
        </transition>

        <button
          type="button"
          class="u-button u-button_icon _closeBtn"
          @click="closeFs"
        >
          <b-icon icon="x-lg" :label="$t('close')" />
        </button>
      </div>
    </transition>
  </portal>
</template>
<script>
export default {
  props: {
    image_src: String,
  },
  components: {},
  data() {
    return {
      show_overlay: false,
      current_level: undefined,
    };
  },
  created() {},
  mounted() {
    this.show_overlay = true;
    window.addEventListener("keyup", this.handleKeyPress);
    this.$eventHub.$emit(`modal.is_opened`);
    this.current_level = this.$root.opened_modals;
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handleKeyPress);
    this.$eventHub.$emit(`modal.is_closed`);
  },
  watch: {},
  computed: {},
  methods: {
    handleKeyPress($event) {
      if (this.current_level !== this.$root.opened_modals) return;
      if ($event.key === "Escape") {
        this.closeFs();
        $event.stopImmediatePropagation();
      }
    },
    closeFs() {
      // close event is emitted once the leave transition is over
      this.show_overlay = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._fullscreenView {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

._overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  cursor: zoom-out;
}

._fsImg {
  position: absolute;
  inset: calc(var(--spacing) * 3);

  ::v-deep {
    img,
    canvas {
      width: 100%;
      height: 100%;
      object-fit: scale-down;
    }
  }
}

._closeBtn {
  position: absolute;
  top: 0;
  right: 0;
  margin: calc(var(--spacing) / 2);
  color: white;
  z-index: 1;
}
</style>
