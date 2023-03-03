<template>
  <div class="_fullscreenView">
    <transition name="scaleInFade">
      <img class="_fsImg" v-if="show_img" :src="image_src" />
    </transition>
    <FullscreenBtn
      class="u-floatingFsButton"
      :icon="'fullscreen-exit'"
      :label="$t('exit_fullscreen')"
      @click="closeFs"
    />
  </div>
</template>
<script>
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
  created() {
    document.addEventListener("fullscreenchange", this.detectFullScreen);
  },
  mounted() {
    this.openFs();
    this.$nextTick(() => {
      this.show_img = true;
    });
  },
  beforeDestroy() {
    document.removeEventListener("fullscreenchange", this.detectFullScreen);
  },
  watch: {},
  computed: {},
  methods: {
    detectFullScreen() {
      // if (document.fullscreenElement) this.is_fullscreen = true;
      // else this.is_fullscreen = false;
      if (!document.fullscreenElement) this.$emit("close");
    },

    openFs() {
      this.$el.requestFullscreen().catch((err) => err);
    },
    closeFs() {
      document.exitFullscreen();
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
  height: 100%;
  width: 100%;

  object-fit: contain;
  object-position: center;
}
</style>
