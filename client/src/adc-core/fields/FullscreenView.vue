<template>
  <div class="_fullscreenView">
    <transition name="scaleInFade">
      <div class="_fsImg">
        <slot />
      </div>
    </transition>

    <div class="_fsButton">
      <EditBtn :btn_type="'fullscreen-exit'" @click="closeFs" />
    </div>
  </div>
</template>
<script>
import screenfull from "screenfull";

export default {
  props: {
    image_src: String,
  },
  components: {},
  data() {
    return {
      show_img: false,
    };
  },
  created() {},
  mounted() {
    this.openFs();
    this.$nextTick(() => {
      this.show_img = true;
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async openFs() {
      await screenfull.request(this.$el);
      screenfull.onchange(() => {
        if (!screenfull.isFullscreen) this.$emit("close");
      });
    },
    async closeFs() {
      await screenfull.exit();
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._fullscreenView {
  position: relative;
  background: var(--c-noir);

  width: 100%;
  height: 100%;
}

._fsImg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  ::v-deep {
    img,
    canvas {
      width: 100%;
      height: 100%;
      object-fit: scale-down;
    }
  }
}

._fsButton {
  position: absolute;
  left: 0;
  bottom: 0;
  margin: calc(var(--spacing) / 1);
}
</style>
