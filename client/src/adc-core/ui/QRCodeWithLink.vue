<template>
  <div class="_QRCodeWithLink">
    <div class="_link">
      <div class="u-inputGroup">
        <input
          type="text"
          v-model="local_url"
          ref="urlToCopy"
          class="_urlInput"
          :placeholder="$t('add_link')"
        />
        <button
          type="button"
          class="u-button u-button_icon u-suffix _clipboardBtn"
          @click="copyToClipboard"
        >
          <b-icon icon="clipboard" v-if="!is_copied" />
          <b-icon icon="clipboard-check" v-else />
        </button>
      </div>
      <a
        v-if="local_url && local_url.length > 0"
        :href="local_url"
        target="_blank"
        class="u-buttonLink"
      >
        {{ $t("open") }} <b-icon slot="prefix" icon="box-arrow-up-right" />
      </a>
    </div>

    <svg
      v-if="!local_url || local_url.length === 0"
      class="_qrIcon"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      viewBox="0 0 16 16"
    >
      <path d="M2 2h2v2H2V2Z"></path>
      <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"></path>
      <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"></path>
      <path
        d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"
      ></path>
      <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"></path>
    </svg>
    <div v-else :key="'qrcode'">
      <div class="_qr">
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

      <small>
        <a class="u-buttonLink" @click="downloadCanvas">
          {{ $t("download_this_qr_code") }}
        </a>
      </small>
    </div>
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
      this.updateDataUrl();
    });
  },
  beforeDestroy() {},
  watch: {
    local_url() {
      this.$nextTick(() => {
        this.updateDataUrl();
      });
    },
  },
  computed: {},
  methods: {
    updateDataUrl() {
      if (this.$refs.qrCode)
        this.canvas_dataurl = this.$refs.qrCode.$el.toDataURL();
      else this.canvas_dataurl = undefined;
      this.$nextTick(() => {
        this.$emit("updateQRCode", {
          dataurl: this.canvas_dataurl,
          text: this.local_url,
        });
      });
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
      const canvas_dataurl = this.canvas_dataurl;
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

  // padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2);
  // aspect-ratio: 21/29.7;

  align-items: center;
  // justify-content: space-between;
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

._urlInput {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
._clipboardBtn {
  font-size: 1rem;
  margin: calc(var(--spacing) / 2);
}

._qrIcon {
  width: 100%;
  max-width: 320px;
  height: auto;
  aspect-ratio: 1;
  color: var(--c-gris);
  padding: var(--spacing);
}
</style>
