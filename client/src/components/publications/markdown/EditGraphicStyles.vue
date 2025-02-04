<template>
  <div class="_editGraphicStyles">
    <CollaborativeEditor3
      v-for="style_file in style_files"
      :key="style_file.$path"
      :content="style_file.$content"
      :path="style_file.$path"
      :custom_formats="[]"
      :save_format="'raw'"
      :mode="'always_active'"
      :can_edit="true"
    />
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    if (!this.style_files || this.style_files.length === 0) {
      this.createStyles();
    }
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    style_files() {
      return this.publication.$files?.filter((f) =>
        f.$media_filename?.endsWith(".css")
      );
    },
  },
  methods: {
    async createStyles() {
      const filename = "styles.css";
      const { meta_filename } = await this.$api.uploadText({
        path: this.publication.$path,
        filename,
        content: "",
        additional_meta: {
          $type: "text",
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._editGraphicStyles {
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
  overflow: auto;
  color: white;
  background-color: var(--c-noir);
  z-index: 10;

  padding: calc(var(--spacing) * 2);
}
.EditGraphicStyles {
}
</style>
