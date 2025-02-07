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
        <div class="_pickFileButton">
          <button
            type="button"
            class="u-button u-button_bleumarine"
            @click="show_media_picker = !show_media_picker"
          >
            pick media
          </button>
        </div>

        <CollaborativeEditor3
          :content="chapter._main_text.$content"
          :path="chapter._main_text.$path"
          :custom_formats="custom_formats"
          :save_format="save_format"
          :can_edit="can_edit"
          :mode="'always_active'"
        />

        <MediaPicker
          v-if="show_media_picker"
          :publication_path="publication_path"
          :select_mode="'single'"
          :pick_from_types="['image', 'video', 'audio']"
          @addMedias="pickFile"
          @close="show_media_picker = false"
        />

        <BaseModal2
          v-if="pick_file_shortcut"
          :title="$t('pick_file')"
          @close="pick_file_shortcut = null"
        >
          <input type="text" v-model="pick_file_shortcut" readonly />
        </BaseModal2>
      </template>
    </div>
  </div>
</template>
<script>
// import MarkdownEditor from "@/adc-core/fields/collaborative-editor/MarkdownEditor.vue";
import { marked } from "marked";

import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    chapter: Object,
    publication_path: String,
    can_edit: Boolean,
  },
  components: {
    // MarkdownEditor,
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,
      pick_file_shortcut: null,
    };
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
    pickFile({ path_to_source_media_metas }) {
      const source_media_meta = path_to_source_media_metas[0];
      this.pick_file_shortcut = `![](${this.getFilename(source_media_meta)})`;
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

._pickFileButton {
  position: sticky;
  top: 0;
  width: 100%;
  text-align: right;
  margin: calc(var(--spacing) * 2);
  z-index: 10;
  padding: calc(var(--spacing) / 2);
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
}
</style>
