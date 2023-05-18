<template>
  <div class="_QRCodeWithLink">
    <div class="_link">
      <a :href="url" target="_blank">{{ url }}</a>
    </div>
    <div class="_qr">
      <div class="_fsButton">
        <EditBtn
          :icon="'fullscreen'"
          :label="$t('fullscreen')"
          @click="show_fullscreen = true"
        />
      </div>

      <qrcode ref="qrCode" :value="url" tag="canvas" :options="qr_options" />
      <FullscreenView v-if="show_fullscreen" @close="show_fullscreen = false">
        <qrcode ref="qrCode" :value="url" tag="canvas" :options="qr_options" />
      </FullscreenView>
    </div>
    <small v-if="canvas_dataurl">
      <a
        :download="'qr_code.png'"
        :href="canvas_dataurl"
        target="_blank"
        class="u-buttonLink"
      >
        {{ $t("download") }}
      </a>
    </small>
  </div>
</template>
<script>
export default {
  props: {
    url: String,
  },
  components: {},
  data() {
    return {
      qr_options: {
        width: 1200,
        margin: 2,
      },
      canvas_dataurl: undefined,
      show_fullscreen: false,
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      setTimeout(() => {
        if (this.$refs.qrCode)
          this.canvas_dataurl = this.$refs.qrCode.$el.toDataURL();
      }, 100);
    });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._QRCodeWithLink {
  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
  align-items: stretch;

  gap: calc(var(--spacing) / 2);
}

._link {
  display: block;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
._qr {
  position: relative;

  ._fsButton {
    position: absolute;
    bottom: 0;
    left: 0;
    margin: calc(var(--spacing) / 2);
  }

  canvas {
    display: block;
    border: 2px solid var(--c-gris);
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 1;
  }

  ::v-deep ._fsImg canvas {
    border: none !important;
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: none;
  }
}
</style>
