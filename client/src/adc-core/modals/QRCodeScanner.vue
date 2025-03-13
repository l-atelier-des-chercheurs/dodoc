<template>
  <BaseModal2
    :title="$t('scan_qr_code')"
    :size="'full'"
    @close="$emit('close')"
  >
    <div class="_videoContainer">
      <video ref="videoElem" />

      <div class="_qrCodeResult" v-if="last_detected_qr">
        <div class="_qrCodeResult--content">
          <div v-if="will_open_in !== null">
            <div class="_linkToOpen">{{ last_detected_qr }}</div>
            <b>{{ $t("opening_link_in") }} {{ will_open_in }}…</b>
          </div>
          <div v-else>{{ $t("qr_code_content") }}: {{ last_detected_qr }}</div>
        </div>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
import QrScanner from "qr-scanner";

export default {
  props: {},
  components: {},
  data() {
    return {
      is_loading: true,
      qrScanner: null,

      last_detected_qr: null,
      will_open_in: null,
    };
  },
  async created() {},
  async mounted() {
    await new Promise((r) => setTimeout(r, 500));
    await this.startQR();
  },
  async beforeDestroy() {
    await this.stopQR();
  },
  watch: {},
  computed: {},
  methods: {
    async startQR() {
      const videoElem = this.$refs.videoElem;
      this.qrScanner = new QrScanner(
        videoElem,
        (result) => {
          this.updateLastDetectedQR(result.data);
        },
        {
          maxScansPerSecond: 5,
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      await this.qrScanner.start();
    },
    async stopQR() {
      if (this.qrScanner) {
        this.qrScanner.destroy();
        this.qrScanner = null;
      }
    },
    updateLastDetectedQR(qr_content) {
      this.last_detected_qr = qr_content;

      if (this.last_detected_qr.startsWith("http")) {
        this.handleOpenURL(this.last_detected_qr);
      } else {
        this.handleText(this.last_detected_qr);
      }
    },
    handleOpenURL(url) {
      if (this.will_open_in) return;

      const videoElem = this.$refs.videoElem;
      videoElem.pause();

      // this.qrScanner.stop();
      this.will_open_in = 3;

      const intv = setInterval(() => {
        this.will_open_in--;
        if (this.will_open_in === 0) {
          window.open(url, "_self");
          clearInterval(intv);
        }
      }, 1000);
    },
    handleText(text) {
      clearTimeout(this.reset_timeout);
      this.reset_timeout = setTimeout(() => {
        this.last_detected_qr = null;
      }, 3000);
    },
  },
};
</script>
<style lang="scss" scoped>
._videoContainer,
video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--c-noir);
}

._qrCodeResult {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;

  padding: calc(var(--spacing) * 1);
}
._qrCodeResult--content {
  text-align: center;
  padding: calc(var(--spacing) / 2);
  background-color: white;
  border-radius: var(--border-radius);

  // b {
  //   color: var(--active-color);
  // }
}

._linkToOpen {
  text-decoration: underline;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
