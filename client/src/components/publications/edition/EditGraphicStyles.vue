<template>
  <div class="_editGraphicStyles">
    <div class="_close_button">
      <button
        type="button"
        class="u-button u-button_icon"
        @click="$emit('close')"
      >
        <b-icon icon="x-lg" :label="$t('close')" />
      </button>
    </div>
    <div class="_topBtns">
      <transition name="fade_fast" mode="out-in">
        <button
          type="button"
          class="u-button u-button_bleumarine"
          v-if="!style_file"
          @click="createCustom"
        >
          {{ $t("edit_default_styles") }}
        </button>
        <button
          v-else
          type="button"
          class="u-button u-button_red"
          @click="resetCustom"
        >
          {{ $t("back_to_default_styles") }}
        </button>
      </transition>
    </div>

    <template v-if="!style_file">
      <pre class="_defaultStyles" v-html="default_styles" />
    </template>
    <template v-else>
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
    async resetCustom() {
      this.$refs.styleEditor.restoreVersion(default_styles);
    },
  },
};
</script>
<style lang="scss" scoped>
._editGraphicStyles {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  color: white;
  background-color: black;
  z-index: 10;

  padding: calc(var(--spacing) * 1);

  ::v-deep {
    ._collaborativeEditor.is--editing_is_enabled {
      background-color: var(--c-noir);
    }
  }
}

._defaultStyles {
  background-color: var(--c-noir);
  padding: calc(var(--spacing) / 2);
  font-family: "Fira Code", monospace;
  border-radius: 4px;
}

._topBtns {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  justify-content: space-between;
  margin-bottom: calc(var(--spacing) / 1);
}
._close_button {
  position: sticky;
  height: 0;
  top: 0;
  text-align: right;
  right: 0;
  z-index: 100;
}
</style>
