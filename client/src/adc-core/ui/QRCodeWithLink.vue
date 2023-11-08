<template>
  <div class="_QRCodeWithLink">
    <div class="_link">
      <div class="u-inputGroup">
        <input type="text" v-model="local_url" ref="urlToCopy" />
        <button
          type="button"
          class="u-button u-button_icon u-suffix _clipboardBtn"
          @click="copyToClipboard"
        >
          <b-icon icon="clipboard" v-if="!is_copied" />
          <b-icon icon="clipboard-check" v-else />
        </button>
      </div>
      <a :href="local_url" target="_blank" class="u-buttonLink">
        {{ $t("open") }} <b-icon slot="prefix" icon="box-arrow-up-right" />
      </a>
    </div>

    <transition name="pagechange" mode="out-in">
      <div class="_qr" :key="local_url">
        <div class="_fsButton">
          <EditBtn :btn_type="'fullscreen'" @click="show_fullscreen = true" />
        </div>
        <qrcode
          ref="qrCode"
          :value="local_url"
          tag="canvas"
          :options="qr_options"
        />
        <FullscreenView v-if="show_fullscreen" @close="show_fullscreen = false">
          <qrcode
            ref="qrCode"
            :value="local_url"
            tag="canvas"
            :options="qr_options"
          />
        </FullscreenView>
      </div>
    </transition>
    <small>
      <a class="u-buttonLink" @click="downloadCanvas">
        {{ $t("download_this_qr_code") }}
      </a>
    </small>
  </div>
</template>
<script>
import qrcode from "@chenfengyuan/vue-qrcode";

export default {
  props: {
    url: String,
  },
  components: {
    qrcode,
  },
  data() {
    return {
      local_url: this.url,
      qr_options: {
        width: 1200,
        margin: 4,
      },
      canvas_dataurl: undefined,
      show_fullscreen: false,

      is_copied: false,
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.createDownloadFromCanvas();
    });
  },
  beforeDestroy() {},
  watch: {
    local_url() {
      this.$nextTick(() => {
        this.createDownloadFromCanvas();
      });
    },
  },
  computed: {},
  methods: {
    createDownloadFromCanvas() {
      if (this.$refs.qrCode)
        this.canvas_dataurl = this.$refs.qrCode.$el.toDataURL();
    },
    copyToClipboard() {
      this.is_copied = false;

      // Get the text field
      var copyText = this.$refs.urlToCopy;

      // Select the text field
      copyText.select();
      copyText.setSelectionRange(0, 99999); // For mobile devices

      // Copy the text inside the text field
      navigator.clipboard.writeText(copyText.value);

      this.is_copied = true;
    },
    downloadCanvas() {
      var link = document.createElement("a");
      link.download = "qr_code.png";
      const canvas_dataurl = this.$refs.qrCode.$el.toDataURL();
      link.href = canvas_dataurl;
      link.click();
    },
  },
};
</script>
<style lang="scss" scoped>
._QRCodeWithLink {
  display: flex;
  flex-flow: column nowrap;
  justify-content: stretch;
  align-items: stretch;

  gap: calc(var(--spacing) / 2);

  padding: calc(var(--spacing) * 2);
  aspect-ratio: 21/29.7;

  align-items: center;
  justify-content: space-around;
  box-shadow: 0 2px 6px rgb(0 0 0 / 30%);
}

._link {
  display: block;
  width: 100%;
  text-align: center;
  word-break: break-word;

  // display: -webkit-box;
  // -webkit-box-orient: vertical;
  // -webkit-line-clamp: 1;
  // overflow: hidden;
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
    // border: 2px solid var(--c-gris);
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

._clipboardBtn {
  margin: calc(var(--spacing) / 2);
}
</style>
