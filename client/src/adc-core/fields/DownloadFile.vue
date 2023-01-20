<template>
  <a
    :download="file.$media_filename"
    :href="file_url"
    target="_blank"
    class="u-buttonLink"
  >
    <sl-icon name="file-earmark-arrow-down" />
    {{ $t("download") }}
  </a>
</template>
<script>
export default {
  props: {
    file: Object,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    file_url() {
      return this.makeMediaFileURL({
        $path: this.file.$path,
        $media_filename: this.file.$media_filename,
      });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
