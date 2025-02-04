<template>
  <div class="_openChapter">
    <div class="_topButtons">
      <div>
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>
      </div>
      <!-- <SelectField
        :field_name="'content_type'"
        :content="content_type"
        :path="chapter._main_text.$path"
        :options="[
          { key: 'html', text: 'HTML' },
          { key: 'markdown', text: 'Markdown' },
        ]"
        :can_edit="can_edit"
        :hide_validation="true"
      /> -->
      <RemoveMenu @remove="$emit('remove')" />
    </div>
    <div class="_content">
      <div class="u-spacingBottom">
        <TitleField
          :label="$t('section_title')"
          :field_name="'section_title'"
          :content="chapter.section_title"
          :required="true"
          :maxlength="40"
          :tag="'h1'"
          :path="chapter.$path"
          :can_edit="can_edit"
        />
      </div>
      <template v-if="chapter._main_text">
        <DLabel :str="$t('content')" />
        <!-- <MarkdownEditor
          :content="chapter._main_text.$content"
          :path="chapter._main_text.$path"
          :edit_on_mounted="true"
          :can_edit="can_edit"
        /> -->
        <CollaborativeEditor3
          :content="chapter._main_text.$content"
          :path="chapter._main_text.$path"
          :custom_formats="custom_formats"
          :save_format="save_format"
          :can_edit="can_edit"
          :mode="'always_active'"
        />
      </template>
    </div>
  </div>
</template>
<script>
// import MarkdownEditor from "@/adc-core/fields/collaborative-editor/MarkdownEditor.vue";
import { marked } from "marked";

export default {
  props: {
    chapter: Object,
    can_edit: Boolean,
  },
  components: {
    // MarkdownEditor,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    "chapter._main_text.$content": {
      handler(content) {
        this.listAllEmbeddedMedias(content);
      },
      deep: true,
    },
  },
  computed: {
    content_type() {
      return this.chapter._main_text?.content_type || "html";
    },
    custom_formats() {
      if (this.content_type === "markdown") return [];
      else return;
    },
    save_format() {
      if (this.content_type === "html") return "html";
      else if (this.content_type === "markdown") return "raw";
      else return "html";
    },
  },
  methods: {
    listAllEmbeddedMedias(content) {
      let source_medias = [];

      marked.use({
        renderer: {
          image: (meta_src, title, alt) => {
            const folder_path = this.getParent(this.chapter.$path);
            const media = this.getSourceMedia({
              source_media: {
                meta_filename_in_project: meta_src,
              },
              folder_path,
            });
            if (!media) return;
            source_medias.push({
              meta_filename_in_project: meta_src,
            });
          },
        },
      });
      marked.parse(content);

      // update list of embedded medias if it changed
      if (
        JSON.stringify(source_medias) !==
        JSON.stringify(this.chapter.source_medias)
      )
        this.$api.updateMeta({
          path: this.chapter.$path,
          new_meta: {
            source_medias,
          },
        });
    },
  },
};
</script>
<style lang="scss" scoped>
._openChapter {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: var(--c-gris_clair);
  background-color: white;
  z-index: 10;

  // display: flex;
  // flex-direction: row nowrap;

  // > * {
  //   flex: 1 1 0;
  // }
}

._topButtons {
  display: flex;
  flex-direction: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 2) 0;
}

._content {
  padding: 0 calc(var(--spacing) * 2) calc(var(--spacing) * 2);
}
</style>
