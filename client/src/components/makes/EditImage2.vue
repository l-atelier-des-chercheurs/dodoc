<template>
  <div class="_editImage2">
    <img :src="image_url" />
  </div>
</template>
<script>
export default {
  props: {
    make: Object,
    project_path: String,
    base_media: Object,
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
    image_url() {
      return this.makeMediaFileURL({
        $path: this.base_media.$path,
        $media_filename: this.base_media.$media_filename,
      });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._editImage2 {
  margin: 0;
  background: white;
  padding: calc(var(--spacing) / 1);
  border-radius: 6px;

  height: auto;

  img {
    width: 100%;
  }
}
</style>
