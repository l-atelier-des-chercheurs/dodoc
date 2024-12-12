<template>
  <div>
    <button
      type="button"
      class="u-buttonLink"
      @click="show_qr_code_modal = true"
    >
      <slot />
    </button>

    <QRModal
      v-if="show_qr_code_modal"
      :url_to_access="preview_url"
      @close="show_qr_code_modal = false"
    />
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
  },
  components: {},
  data() {
    return {
      show_qr_code_modal: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    preview_url() {
      if (!this.file.$path) return false;
      // const full_path = this.makeMediaFilePath({
      //   $path: this.file.$path,
      //   $media_filename: this.file.$media_filename,
      // });
      return (
        window.location.origin +
        "/_previewmedia?path_to_meta=" +
        this.file.$path
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
