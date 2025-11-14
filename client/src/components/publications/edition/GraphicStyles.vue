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

    <div class="_topTabs">
      <button
        type="button"
        v-for="style_file in style_files"
        :key="style_file.$path"
        class="u-button"
        :class="{
          'is--active': opened_style_file?.$path === style_file.$path,
        }"
        @click="openStyleFile(style_file.$path)"
      >
        {{ style_file.css_title || getFilename(style_file.$path) }}
      </button>
      <button
        type="button"
        class="u-button"
        :class="{
          'is--active': opened_style_file?.$path === 'default',
        }"
        @click="openDefaultStyles"
      >
        {{ $t("default_styles") }}
      </button>
      <button
        type="button"
        class="u-button u-button_bleumarine"
        @click="show_create_css_modal = true"
      >
        {{ $t("create_custom_stylesheet") }}
      </button>
      <BaseModal2
        v-if="show_create_css_modal"
        :title="$t('create_custom_stylesheet')"
        @close="show_create_css_modal = false"
        @save="createCustomStylesheet"
      >
        <DLabel :str="$t('name')" />
        <TextInput
          :content.sync="new_css_title"
          :maxlength="40"
          :required="true"
          :autofocus="true"
          ref="titleInput"
          @toggleValidity="($event) => (allow_save = $event)"
          @onEnter="createCustomStylesheet"
        />
        <template #footer>
          <div />
          <button
            type="button"
            class="u-button u-button_bleuvert"
            @click="createCustomStylesheet"
          >
            <b-icon icon="plus-circle" />
            {{ $t("create_and_open") }}
          </button>
        </template>
      </BaseModal2>
    </div>

    <div class="_openedStyleFile">
      <transition name="fade" mode="out-in">
        <!-- <div v-if="!opened_style_file" class="defaultCode" :key="'default'">
          <DLabel :str="$t('default_styles')" />
          <div class="u-spacingBottom" />
          <pre v-html="pretty_default_styles" />
        </div> -->
        <OpenedGraphicStyles
          v-if="opened_style_file"
          :key="opened_style_file.$path"
          :style_file="opened_style_file"
          :default_styles="default_styles"
          :show_source_html="show_source_html"
          @update:show_source_html="$emit('update:show_source_html', $event)"
          @close="openDefaultStyles"
        />
      </transition>
    </div>
  </div>
</template>
<script>
import BaseModal2 from "@/adc-core/modals/BaseModal2.vue";
import OpenedGraphicStyles from "@/components/publications/edition/OpenedGraphicStyles.vue";
import default_styles from "@/components/publications/edition/default_styles.css?raw";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/vs2015.css";

export default {
  props: {
    publication: Object,
    opened_style_file_meta: String,
    show_source_html: Boolean,
  },
  components: {
    OpenedGraphicStyles,
  },
  data() {
    return {
      default_styles,
      show_create_css_modal: false,
      new_css_title: "",
    };
  },
  created() {
    // if (this.style_files?.length > 0)
    //   this.openStyleFile(this.style_files[0].$path);
  },
  mounted() {},
  beforeDestroy() {
    this.$emit("update:show_source_html", false);
  },
  watch: {},
  computed: {
    pretty_default_styles() {
      return hljs.highlight(this.default_styles, { language: "css" }).value;
    },
    style_files() {
      return this.publication.$files
        ?.filter((f) => f.is_css_styles === true)
        .sort((a, b) => {
          const a_title = a.css_title || this.getFilename(a.$path);
          const b_title = b.css_title || this.getFilename(b.$path);
          if (a_title < b_title) return -1;
          if (a_title > b_title) return 1;
        });
    },
    opened_style_file() {
      if (
        this.opened_style_file_meta === "default" ||
        this.style_files.length === 0
      ) {
        return {
          $path: "default",
          css_title: this.$t("default_styles"),
          $content: default_styles,
          is_default: true,
        };
      }
      return this.style_files.find(
        (f) => this.getFilename(f.$path) === this.opened_style_file_meta
      );
    },
  },
  methods: {
    async createCustomStylesheet() {
      const filename = this.new_css_title + ".css";

      const { meta_filename } = await this.$api.uploadText({
        path: this.publication.$path,
        filename,
        content: default_styles,
        additional_meta: {
          $type: "text",
          css_title: this.new_css_title,
          is_css_styles: true,
        },
      });

      this.new_css_title = "";
      this.show_create_css_modal = false;

      this.$emit("setStyleFile", meta_filename);
    },
    async resetCustom() {
      this.$refs.styleEditor.restoreVersion(default_styles);
    },
    openStyleFile(path) {
      this.$emit("setStyleFile", this.getFilename(path));
    },
    openDefaultStyles() {
      this.$emit("setStyleFile", "default");
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
  z-index: 10;
  background-color: var(--c-noir);

  display: flex;
  flex-flow: column nowrap;
}

._topTabs {
  flex: 0 0 auto;
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  overflow-x: auto;

  background-color: #000;
  background-color: var(--c-noir);

  // border-bottom: 2px solid var(--c-gris_fonce);
  padding: calc(var(--spacing) * 1);
}

._openedStyleFile {
  flex: 1 1 auto;
  background-color: #000;
  background-color: #303841;
  background-color: #333;
}

._defaultStyles {
  background-color: var(--c-noir);
  padding: calc(var(--spacing) / 2);
  font-family: "Fira Code", monospace;
  border-radius: 4px;
}

._close_button {
  position: sticky;
  height: 0;
  top: 0;
  text-align: right;
  right: 0;
  color: white;
  z-index: 100;
}
</style>
<style lang="scss">
.defaultCode {
  background-color: var(--c-noir);
  color: white;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
  border-radius: 4px;

  pre {
    margin: 0;
  }
}
</style>
