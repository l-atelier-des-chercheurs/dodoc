<template>
  <div class="_openChapter">
    <div class="_close_button">
      <button
        type="button"
        class="u-button u-button_icon"
        @click="$emit('close')"
      >
        <b-icon icon="x-lg" :label="$t('close')" />
      </button>
    </div>
    <div class="_openChapter--content">
      <div class="_topButtons">
        <TitleField
          :field_name="'section_title'"
          :content="chapter.section_title"
          :maxlength="40"
          :tag="'h1'"
          :path="chapter.$path"
          :can_edit="can_edit"
        />
        <DropDown :right="true" :show_label="false">
          <RemoveMenu @remove="$emit('remove')" />
        </DropDown>

        <!-- <div>
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          <b-icon icon="arrow-left-short" />
          {{ $t("back") }}
        </button>
      </div> -->
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
      </div>
      <div class="_content">
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
            :content_type="'markdown'"
            :can_edit="can_edit"
            :mode="'always_active'"
          >
            <template #custom_buttons>
              <button
                type="button"
                class="u-button u-button_bleumarine _customBtn"
                @click="show_media_picker = !show_media_picker"
              >
                {{ $t("import_medias") }}
              </button>
            </template>
          </CollaborativeEditor3>

          show_media_picker = {{ show_media_picker }}

          <PickMediaForMarkdown
            v-if="show_media_picker"
            :publication_path="publication_path"
            @close="closePickModal"
          />
        </template>
      </div>

      <div class="_navBtns">
        <div class="_navBtns--content">
          <button
            type="button"
            class="u-linkList"
            v-if="prev_section"
            @click="$emit('prev')"
          >
            <b-icon icon="arrow-left-square" />
            <span>
              {{ prev_section.section_title }}
            </span>
          </button>

          <button
            type="button"
            class="u-linkList"
            v-if="next_section"
            @click="$emit('next')"
          >
            <span>
              {{ next_section.section_title }}
            </span>
            <b-icon icon="arrow-right-square" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// import MarkdownEditor from "@/adc-core/fields/collaborative-editor/MarkdownEditor.vue";
import markdownit from "markdown-it";
import markdownItCsc from "@/components/publications/edition/markdownItCsc.js";

import PickMediaForMarkdown from "@/components/publications/edition/PickMediaForMarkdown.vue";

export default {
  props: {
    chapter: Object,
    prev_section: Object,
    next_section: Object,
    publication_path: String,
    can_edit: Boolean,
  },
  components: {
    // MarkdownEditor,
    PickMediaForMarkdown,
  },
  data() {
    return {
      show_media_picker: false,
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

      const md = new markdownit();

      // Add the CSC plugin
      md.use(markdownItCsc, {
        getMediaSrc: (src) => {
          const folder_path = this.getParent(this.chapter.$path);
          return this.getSourceMedia({
            source_media: {
              meta_filename_in_project: src,
            },
            folder_path,
          });
        },
        source_medias,
      });

      // Store default renderer
      const defaultRender =
        md.renderer.rules.image ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options);
        };

      // Override image renderer
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const srcIndex = token.attrIndex("src");
        if (srcIndex >= 0) {
          const meta_src = token.attrs[srcIndex][1];
          const folder_path = this.getParent(this.chapter.$path);
          const media = this.getSourceMedia({
            source_media: {
              meta_filename_in_project: meta_src,
            },
            folder_path,
          });
          if (media) {
            source_medias.push({
              meta_filename_in_project: meta_src,
            });
          }
        }
        // Pass token to default renderer
        return defaultRender(tokens, idx, options, env, self);
      };

      // Also capture CSC format images
      const originalCscRenderer = md.renderer.rules.csc;
      md.renderer.rules.csc = (tokens, idx) => {
        const token = tokens[idx];
        if (token.tag === "image" && token.content) {
          const meta_src = token.content;
          const folder_path = this.getParent(this.chapter.$path);
          const media = this.getSourceMedia({
            source_media: {
              meta_filename_in_project: meta_src,
            },
            folder_path,
          });
          if (media) {
            source_medias.push({
              meta_filename_in_project: meta_src,
            });
          }
        }
        // Call the original renderer if it exists, otherwise return empty string
        return originalCscRenderer ? originalCscRenderer(tokens, idx) : "";
      };

      md.render(content);

      // update list of embedded medias if it changed

      // remove duplicates
      source_medias = source_medias.filter(
        (media, index, self) =>
          index ===
          self.findIndex(
            (t) => t.meta_filename_in_project === media.meta_filename_in_project
          )
      );

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
    closePickModal() {
      this.show_media_picker = false;
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
  background: var(--c-gris_clair);
  z-index: 10;

  // display: flex;
  // flex-direction: row nowrap;

  // > * {
  //   flex: 1 1 0;
  // }
}
._openChapter--content {
  position: relative;
  min-height: calc(100% - calc(var(--spacing) * 1));
  background-color: white;
  box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
    0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
    0 0.9px 1.5px hsla(230, 13%, 9%, 0.025),
    0 3.5px 6px hsla(230, 13%, 9%, 0.09);

  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  margin: calc(var(--spacing) * 1);
  margin-bottom: 0;
  padding: calc(var(--spacing) * 1);
}

._close_button {
  position: sticky;
  height: 0;
  top: 0;
  text-align: right;
  right: 0;
  z-index: 100;
}

._topButtons {
  display: flex;
  flex-direction: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(var(--spacing) * 1);
  padding-bottom: calc(var(--spacing) / 2);
}

._content {
  padding-bottom: calc(var(--spacing) * 1);
}

._navBtns {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: calc(var(--spacing) * 4);
}
._navBtns--content {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}

._customBtn {
  background-color: var(--c-bleumarine) !important;
  color: white !important;
  border-radius: var(--input-border-radius) !important;
}

._textField {
  resize: vertical;
  min-height: 8rem;
}
</style>
