<template>
  <div class="_previewMedia">
    <iframe
      v-if="media_type === 'pdf'"
      :src="preview_url"
      @load="onIframeLoad"
    ></iframe>
    <ThreeDPreview
      v-else-if="media_type === 'stl'"
      :file_type="'stl'"
      :src="preview_url"
    />
    <img
      v-else-if="['jpg', 'png', 'jpeg', 'gif'].includes(media_type)"
      :src="preview_url"
    />
    <video
      v-else-if="['mp4', 'mov', 'webm'].includes(media_type)"
      :src="preview_url"
    />
    <span v-else>
      No preview module for <strong>{{ media_type }}</strong
      >, ask Louis to develop it :)
    </span>
  </div>
</template>
<script>
export default {
  props: {},
  components: {
    ThreeDPreview: () => import("@/adc-core/fields/ThreeDPreview.vue"),
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    media_type() {
      return this.full_media_path.split(".").pop();
    },
    full_media_path() {
      return decodeURIComponent(this.$route.query.path);
    },
    preview_url() {
      return (
        window.location.origin + this.full_media_path + "#toolbar=0&view=FitV"
      );
    },
  },
  methods: {
    onIframeLoad() {},
  },
};
</script>
<style lang="scss" scoped>
._previewMedia {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  > * {
    width: 100%;
    height: 100%;
    object-fit: scale-down;
    object-position: center;
  }
}
</style>
