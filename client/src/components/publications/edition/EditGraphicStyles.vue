<template>
  <div class="_editGraphicStyles">
    <button
      type="button"
      class="u-button u-button_bleumarine"
      v-if="!style_file"
      @click="createCustom"
    >
      {{ $t("edit_default") }}
    </button>
    <template v-if="!style_file">
      <pre v-html="default_styles" />
    </template>
    <template v-else>
      <CollaborativeEditor3
        :key="style_file.$path"
        :content="style_file.$content"
        :path="style_file.$path"
        :custom_formats="[]"
        :save_format="'raw'"
        :mode="'always_active'"
        :can_edit="true"
      />
      <div class="u-spacingBottom" />
      <button type="button" class="u-button u-button_red" @click="removeCustom">
        {{ $t("back_to_default") }}
      </button>
    </template>
  </div>
</template>
<script>
import default_styles from "@/components/publications/edition/default_styles.css?raw";

export default {
  props: {
    publication: Object,
  },
  components: {},
  data() {
    return {
      default_styles,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    style_file() {
      return this.publication.$files?.find((f) => f.is_css_styles === true);
    },
  },
  methods: {
    async createCustom() {
      const filename = "custom_styles.css";
      const { meta_filename } = await this.$api.uploadText({
        path: this.publication.$path,
        filename,
        content: default_styles,
        additional_meta: {
          $type: "text",
          is_css_styles: true,
        },
      });
    },
    removeCustom() {
      this.$api.deleteItem({
        path: this.style_file.$path,
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

  padding: calc(var(--spacing) * 1);

  ::v-deep {
    ._collaborativeEditor.is--editing_is_enabled {
      background-color: transparent;
    }
  }
}
</style>
