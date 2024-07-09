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
            <CaptionCreditsPage :media="media" />
          </div>
        </template>
        <span v-else>Error loading media</span>
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
  },
  data() {
    return {
      media: null,
      is_loading: true,
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
      return this.full_media_path.split(".").pop();
    },
    preview_url() {
      let suffix = "";
      if (this.media_type === "pdf") suffix = "#toolbar=0&view=FitV";
      return window.location.origin + this.full_media_path + suffix;
    },
  },
  methods: {
    onIframeLoad() {},
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
</style>
