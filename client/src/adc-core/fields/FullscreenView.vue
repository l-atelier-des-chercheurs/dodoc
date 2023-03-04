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
