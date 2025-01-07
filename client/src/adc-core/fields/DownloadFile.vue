<template>
  <a
    :download="file.$media_filename"
    :href="file_url"
    target="_blank"
    class="u-buttonLink"
  >
    <template v-if="$slots.hasOwnProperty('default')">
      <slot />
    </template>
    <template v-else>
      <b-icon icon="file-earmark-arrow-down" />
      {{ $t("download") }}
    </template>
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
      if (!this.file.$path) return false;
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
