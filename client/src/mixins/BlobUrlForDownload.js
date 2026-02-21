/**
 * Keeps final_image_blob_url in sync with final_image_blob (prop or computed).
 * Revokes the object URL on destroy to avoid leaks.
 * Component must expose final_image_blob (Blob | null).
 */
export default {
  data() {
    return {
      final_image_blob_url: null,
    };
  },
  watch: {
    final_image_blob: {
      immediate: true,
      handler(blob) {
        this.revokeFinalImageBlobUrl();
        this.final_image_blob_url = blob
          ? window.URL.createObjectURL(blob)
          : null;
      },
    },
  },
  beforeDestroy() {
    this.revokeFinalImageBlobUrl();
  },
  methods: {
    revokeFinalImageBlobUrl() {
      if (this.final_image_blob_url) {
        window.URL.revokeObjectURL(this.final_image_blob_url);
        this.final_image_blob_url = null;
      }
    },
  },
};
