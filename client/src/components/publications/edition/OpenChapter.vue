<template>
  <div class="_openChapter">
    <!-- <div class="_close_button">
      <button
        type="button"
        class="u-button u-button_icon"
        @click="$emit('close')"
      >
        <b-icon icon="x-lg" :label="$t('close')" />
      </button>
    </div> -->
    <div class="_navBtns">
      <div class="_navBtns--content">
        <div class="" />
        <div
          class="_navBtns--content--buttons"
          v-show="next_section || prev_section"
        >
          <span>
            <button
              type="button"
              class="u-linkList"
              v-if="prev_section"
              @click="$emit('prev')"
            >
              <b-icon icon="arrow-left-short" />
              <span>
                {{ prev_section.section_title }}
              </span>
            </button>
            <span v-else>–</span>
          </span>

          <span class="_separator">|</span>

          <span>
            <button
              type="button"
              class="u-linkList"
              v-if="next_section"
              @click="$emit('next')"
            >
              <span>
                {{ next_section.section_title }}
              </span>
              <b-icon icon="arrow-right-short" />
            </button>
            <span v-else>–</span>
          </span>
        </div>
        <div>
          <button type="button" class="u-linkList" @click="$emit('close')">
            <b-icon icon="x" :label="$t('close')" />
            {{ $t("close") }}
          </button>
        </div>
      </div>
    </div>
    <div class="_openChapter--content">
      <div class="_topButtons">
        <TitleField
          :field_name="'section_title'"
          :content="chapter.section_title"
          :maxlength="100"
          :tag="'h1'"
          :path="chapter.$path"
          :can_edit="true"
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

      <div class="_infos">
        <div class="_content--type">
          <template v-if="chapter.section_type === 'text'">
            <b-icon icon="markdown" />
            {{ $t("text") }}
          </template>
          <template v-else-if="chapter.section_type === 'gallery'">
            <b-icon icon="image" />
            {{ $t("gallery") }}
          </template>
          <template v-else-if="chapter.section_type === 'story'">
            <b-icon icon="list" />
            {{ $t("story") }}
          </template>
        </div>

        <transition name="fade" mode="out-in">
          <div v-if="view_mode === 'book' && chapter_position?.first_page">
            <div class="_selects--pageRange" :key="chapter_position.first_page">
              p.{{ chapter_position.first_page }}
              <template
                v-if="
                  chapter_position.first_page !== chapter_position.last_page
                "
              >
                <b-icon icon="arrow-right-short" /> p.{{
                  chapter_position.last_page
                }}
              </template>
            </div>
          </div>
        </transition>
      </div>

      <fieldset
        v-if="chapter.section_type === 'text' && view_mode === 'book'"
        class="u-spacingBottom _layout"
      >
        <legend>{{ $t("layout") }}</legend>
        <div class="_optionsRow">
          <div class="_colCount">
            <DLabel :str="$t('column_count')" />
            <div class="">
              <SelectField2
                :field_name="'column_count'"
                :value="chapter.column_count || 1"
                :path="chapter.$path"
                size="small"
                :hide_validation="true"
                :can_edit="true"
                :options="[
                  { key: 1, text: '1' },
                  { key: 2, text: '2' },
                  { key: 3, text: '3' },
                ]"
              />
            </div>
          </div>
          <div class="_selects--starts_on_page">
            <DLabel :str="$t('starts_on_page')" />
            <SelectField2
              :field_name="'section_starts_on_page'"
              :value="chapter.section_starts_on_page || ''"
              :path="chapter.$path"
              size="small"
              :hide_validation="true"
              :can_edit="true"
              :options="starts_on_page_options"
            />
          </div>
        </div>
      </fieldset>

      <div class="_content">
        <template v-if="chapter.section_type === 'text'">
          <template v-if="chapter._main_text">
            <DLabel :str="$t('content')" />
            <CollaborativeEditor3
              :content="main_text_content"
              :path="chapter._main_text.$path"
              :custom_formats="custom_formats"
              :save_format="save_format"
              :content_type="'markdown'"
              :can_edit="true"
              :mode="'always_active'"
              ref="collaborativeEditor"
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

            <PickMediaForMarkdown
              v-if="show_media_picker"
              :publication_path="publication.$path"
              @insertToText="insertToText"
              @close="closePickModal"
            />
          </template>
          <template v-else>
            <div class="u-instructions">
              {{ $t("no_content") }}
            </div>
          </template>
        </template>
        <template v-if="chapter.section_type === 'gallery'">
          <GalleryChapter :chapter="chapter" :publication="publication" />
        </template>
        <template v-if="chapter.section_type === 'story'">
          <SingleSection
            class="_singleSection"
            :publication="publication"
            :section="chapter"
            :can_edit="true"
          />
        </template>
      </div>
    </div>
  </div>
</template>
<script>
// import MarkdownEditor from "@/adc-core/fields/collaborative-editor/MarkdownEditor.vue";
import markdownit from "markdown-it";
import markdownItCsc from "@/components/publications/edition/markdownItCsc.js";

import PickMediaForMarkdown from "@/components/publications/edition/PickMediaForMarkdown.vue";
import GalleryChapter from "@/components/publications/edition/GalleryChapter.vue";

export default {
  props: {
    chapter: Object,
    chapters: Array,
    prev_section: Object,
    next_section: Object,
    publication: Object,
    chapter_position: Object,
    view_mode: String,
  },
  components: {
    // MarkdownEditor,
    PickMediaForMarkdown,
    GalleryChapter,
    SingleSection: () =>
      import("@/components/publications/story/SingleSection.vue"),
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
    main_text_content: {
      handler(content) {
        if (content) this.listAllEmbeddedMedias(content);
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
    main_text_content() {
      return this.chapter._main_text?.$content;
    },
    starts_on_page_options() {
      if (this.chapter.section_type === "gallery")
        return [
          {
            key: "page",
            text: this.$t("next_page"),
          },
          {
            key: "left",
            text: this.$t("next_left_page"),
          },
          {
            key: "right",
            text: this.$t("next_right_page"),
          },
        ];
      else
        return [
          {
            key: "",
            text: this.$t("in_flow"),
          },
          {
            key: "page",
            text: this.$t("next_page"),
          },
          {
            key: "left",
            text: this.$t("next_left_page"),
          },
          {
            key: "right",
            text: this.$t("next_right_page"),
          },
        ];
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

          let source_media = this.transformMediaSrc(src);

          return this.getSourceMedia({
            source_media,
            folder_path,
          });
        },
        vue_instance: this,
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
        if (["image", "video", "audio"].includes(token.tag) && token.content) {
          const meta_src = token.content;
          const folder_path = this.getParent(this.chapter.$path);

          const source_media = this.transformMediaSrc(meta_src);
          const media = this.getSourceMedia({
            source_media,
            folder_path,
          });
          if (media) {
            source_medias.push(source_media);
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
            (t) =>
              t.meta_filename_in_project === media.meta_filename_in_project ||
              t.meta_filename === media.meta_filename
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

    insertToText(text) {
      // Find the collaborative editor instance and insert the text
      const editor = this.$refs.collaborativeEditor;
      if (editor) {
        editor.insertAtCursor(text);
      }
    },

    transformMediaSrc(meta_src) {
      if (meta_src.startsWith("./")) {
        return {
          meta_filename: meta_src.substring(2),
        };
      } else if (meta_src.startsWith("../")) {
        return {
          meta_filename_in_project: meta_src.substring(3),
        };
      } else {
        return {
          meta_filename_in_project: meta_src,
        };
      }
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
  scroll-behavior: smooth;
  scroll-padding: 10vh;
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
  // box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
  //   0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
  //   0 0.9px 1.5px hsla(230, 13%, 9%, 0.025),
  //   0 3.5px 6px hsla(230, 13%, 9%, 0.09);
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1));

  border-top-left-radius: 4px;
  border-top-right-radius: 4px;

  margin: 0 calc(var(--spacing) / 1);
  margin-bottom: 0;
  padding: calc(var(--spacing) * 2);
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
  padding: calc(var(--spacing) / 2);
  // padding-top: calc(var(--spacing) * 4);
  // padding-bottom: calc(var(--spacing) * 4);
}

._navBtns--content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 1);
  height: 20px;

  &:first-child,
  &:last-child {
    flex: 0 0 10ch;
  }

  > * {
    flex: 0 1 10ch;
    overflow: hidden;
  }
}

._navBtns--content--buttons {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  flex: 1 1 0;

  > * {
    display: block;
    flex: 1 0 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    > * {
      padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
    }

    &:first-child {
      text-align: right;

      > * {
        justify-content: flex-end;
      }
    }

    &:last-child > * {
      text-align: left;
    }
  }

  ._separator {
    flex: 0 0 1ch;
    margin: 0ch;
    text-align: center;
  }
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
._content--type {
  .b-icon {
    vertical-align: middle;
  }
}

._infos {
  margin-bottom: calc(var(--spacing) * 1);
  font-size: var(--sl-font-size-small);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
  gap: calc(var(--spacing) * 1);
}

._selects--starts_on_page {
  width: 30ch;
  // width: auto;
  flex: 0 0 auto;
  position: relative;
  z-index: 2;
  // margin-bottom: calc(var(--spacing) * 1);
}

._selects--pageRange {
  // font-size: var(--sl-font-size);
  color: var(--c-gris_fonce);
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  // gap: calc(var(--spacing) / 2);
}

._singleSection {
  ::v-deep {
    ._topbar {
      display: none;
    }
  }
}

._colCount {
  max-width: 20ch;
}

._optionsRow {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: calc(var(--spacing) * 1);
}
</style>
