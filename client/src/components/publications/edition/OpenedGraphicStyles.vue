<template>
  <div class="_openedStyleFile">
    <template v-if="style_file.$path === 'default'">
      <h2>{{ $t("default_styles") }}</h2>
    </template>
    <template v-else>
      <TitleField
        :label="$t('name')"
        :show_label="false"
        :field_name="'css_title'"
        :tag="'h2'"
        :content="style_file.css_title"
        :path="style_file.$path"
        :maxlength="40"
        :can_edit="true"
      />
    </template>

    <div class="u-spacingBottom" />

    <div class="_topBtns">
      <ToggleInput
        :content="show_source_html"
        :label="$t('show_source_html')"
        @update:content="$emit('update:show_source_html', $event)"
      />

      <template v-if="style_file.$path !== 'default'">
        <button
          type="button"
          class="u-buttonLink u-buttonLink_red"
          key="resetCustom"
          @click="show_reset_modal = true"
        >
          {{ $t("back_to_default_styles") }}
        </button>

        <BaseModal2
          v-if="show_reset_modal"
          :title="$t('back_to_default_styles')"
          @close="show_reset_modal = false"
          @save="resetCustom"
        >
          <div class="defaultCode">
            <pre v-html="pretty_default_styles" />
          </div>

          <template slot="footer">
            <SaveCancelButtons
              :cancel_text="$t('cancel')"
              :save_text="$t('reset')"
              @save="resetCustom"
              @cancel="show_reset_modal = false"
            />
          </template>
        </BaseModal2>

        <button
          type="button"
          class="u-buttonLink u-buttonLink_red"
          @click="show_remove_modal = true"
        >
          <b-icon icon="trash" />
          {{ $t("remove") }}
        </button>

        <RemoveMenu2
          v-if="show_remove_modal"
          :modal_title="$t('remove_css_file', { name: style_file.css_title })"
          :path="style_file.$path"
          @removedSuccessfully="$emit('close')"
          @close="show_remove_modal = false"
        />
      </template>
    </div>

    <CollaborativeEditor3
      v-if="style_file.$path !== 'default'"
      ref="styleEditor"
      :key="style_file.$path"
      :content="style_file.$content"
      :path="style_file.$path"
      :custom_formats="[]"
      :save_format="'raw'"
      :mode="'always_active'"
      :can_edit="true"
    />
    <div v-else class="defaultCode">
      <pre v-html="pretty_default_styles" />
    </div>
    <div class="u-spacingBottom" />
  </div>
</template>
<script>
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/vs2015.css";

export default {
  props: {
    style_file: Object,
    default_styles: String,
    show_source_html: Boolean,
  },
  components: {},
  data() {
    return {
      show_reset_modal: false,
      show_remove_modal: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    pretty_default_styles() {
      return hljs.highlight(this.default_styles, { language: "css" }).value;
    },
  },
  methods: {
    async resetCustom() {
      this.$refs.styleEditor.restoreVersion(this.default_styles);
      this.show_reset_modal = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._openedStyleFile {
  padding: calc(var(--spacing) * 1);
  color: white;

  ::v-deep label {
    color: inherit;
  }
}

._collaborativeEditor.is--editing_is_enabled {
  background-color: var(--c-noir);
  // background-color: transparent;
}

._topBtns {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  justify-content: space-between;
  margin-bottom: calc(var(--spacing) / 1);

  --label-color: white;
}
</style>
