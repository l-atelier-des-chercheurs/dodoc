<template>
  <div class="_openedStyleFile">
    <TitleField
      :label="$t('name')"
      :field_name="'css_title'"
      :tag="'h2'"
      :content="style_file.css_title"
      :path="style_file.$path"
      :maxlength="40"
      :can_edit="true"
    />

    <div class="u-spacingBottom" />

    <div class="_topBtns">
      <button
        type="button"
        class="u-buttonLink u-buttonLink_red"
        key="resetCustom"
        @click="resetCustom"
      >
        {{ $t("back_to_default_styles") }}
      </button>
    </div>

    <CollaborativeEditor3
      ref="styleEditor"
      :key="style_file.$path"
      :content="style_file.$content"
      :path="style_file.$path"
      :custom_formats="[]"
      :save_format="'raw'"
      :mode="'always_active'"
      :can_edit="true"
    />
    <div class="u-spacingBottom" />
  </div>
</template>
<script>
export default {
  props: {
    style_file: Object,
    default_styles: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async resetCustom() {
      this.$refs.styleEditor.restoreVersion(this.default_styles);
    },
  },
};
</script>
<style lang="scss" scoped>
._openedStyleFile {
  padding: calc(var(--spacing) * 1);
  background-color: var(--c-gris_fonce);
  background-color: var(--c-noir);
  color: white;
}

._collaborativeEditor.is--editing_is_enabled {
  background-color: var(--c-noir);
}

._topBtns {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  justify-content: flex-end;
  margin-bottom: calc(var(--spacing) / 1);
}
</style>
