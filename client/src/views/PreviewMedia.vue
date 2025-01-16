<template>
  <div class="_previewMedia">
    <div class="_spinner" v-if="is_loading" key="loader">
      <LoaderSpinner />
    </div>
    <template v-else>
      <template v-if="previewing_for === 'node'">
        <iframe
          v-if="media_type === 'pdf'"
          class="_content"
          :src="preview_url"
          @load="onIframeLoad"
        ></iframe>
        <ThreeDPreview
          v-else-if="media_type === 'stl'"
          class="_content"
          :file_type="'stl'"
          :src="preview_url"
        />
      </template>
      <template v-else-if="previewing_for === 'user'">
        <template v-if="media">
          <MediaContent
            class="_content"
            context="full"
            :file="media"
            :resolution="1600"
          />
          <div class="_captionCredits">
            <CaptionCreditsPage :media="media" :can_edit="false" />
          </div>
        </template>
        <span v-else>Error loading media</span>

        <!-- qr code button -->
        <button
          class="u-button u-button_white _qrCodeButton"
          @click="openQRCodeScanner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-qr-code"
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
        </button>
        <QRCodeScanner
          v-if="show_qr_code_scanner"
          @close="show_qr_code_scanner = false"
        />
      </template>
    </template>
  </div>
</template>
<script>
import CaptionCreditsPage from "@/components/publications/modules/CaptionCreditsPage.vue";

export default {
  props: {},
  components: {
    ThreeDPreview: () => import("@/adc-core/fields/ThreeDPreview.vue"),
    CaptionCreditsPage,
    QRCodeScanner: () => import("@/adc-core/modals/QRCodeScanner.vue"),
  },
  data() {
    return {
      media: null,
      is_loading: true,
      show_qr_code_scanner: false,
    };
  },
  async created() {},
  async mounted() {
    if (this.$route.query.path_to_meta && this.previewing_for === "user") {
      this.media = await this.$api
        .getFile({
          path: decodeURIComponent(this.$route.query.path_to_meta),
        })
        .catch((e) => {
          console.error(e);
        });
    }

    this.is_loading = false;
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    previewing_for() {
      return this.$route.query.previewing_for === "node" ? "node" : "user";
    },
    full_media_path() {
      return decodeURIComponent(this.$route.query.path_to_media);
    },
    media_type() {
      return this.full_media_path.split(".").pop().toLowerCase();
    },
    preview_url() {
      let suffix = "";
      if (this.media_type === "pdf") suffix = "#toolbar=0&view=FitV";
      return window.location.origin + this.full_media_path + suffix;
    },
  },
  methods: {
    onIframeLoad() {},
    openQRCodeScanner() {
      this.show_qr_code_scanner = true;
    },
  },
};
</script>
<style lang="scss" scoped>
._previewMedia {
  --plyr-audio-controls-background: var(--c-noir);
  --plyr-audio-control-color: white;

  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  ._content {
    position: relative;
    width: 100%;
    height: 100%;
    object-fit: scale-down;
    object-position: center;

    ::v-deep {
      ._mediaContent--image,
      .plyr--video,
      .plyr__poster,
      ._mediaContent--iframe,
      ._iframeStylePreview {
        position: absolute;
        height: 100%;
        width: 100%;
        object-fit: scale-down;
      }
    }
  }
  ._captionCredits {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    ::v-deep {
      * {
        pointer-events: auto;
      }
    }
  }
}
._qrCodeButton {
  position: absolute;
  top: 0;
  right: 0;
  margin: 1rem;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.1);
  padding: calc(var(--spacing) * 0.75);
  border-radius: 50%;
}
</style>
