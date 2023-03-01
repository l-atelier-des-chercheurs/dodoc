<template>
  <div class="_fullscreenView">
    <button type="button" class="u-button _fsButton" @click="toggleFs">
      <sl-icon
        :name="!is_fullscreen ? 'arrows-fullscreen' : 'fullscreen-exit'"
      />
    </button>
    <img :src="image_src" v-if="is_fullscreen" />
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
      is_fullscreen: false,
    };
  },
  created() {},
  mounted() {
    document.addEventListener("fullscreenchange", this.detectFullScreen);
  },
  beforeDestroy() {
    document.removeEventListener("fullscreenchange", this.detectFullScreen);
  },
  watch: {},
  computed: {},
  methods: {
    detectFullScreen() {
      if (document.fullscreenElement) {
        this.is_fullscreen = true;
        // window.addEventListener("popstate", this.quitFSOnBack);
      } else {
        this.is_fullscreen = false;
        this.$nextTick(() => {
          // window.removeEventListener("popstate", this.quitFSOnBack);
        });
      }
    },
    toggleFs() {
      const elem = this.$el;
      if (!this.is_fullscreen) elem.requestFullscreen().catch((err) => err);
      else document.exitFullscreen();
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
</style>
