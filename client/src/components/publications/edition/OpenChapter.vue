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
        <div>
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
        </div>
        <div>
          <button type="button" class="u-linkList" @click="$emit('close')">
            <b-icon icon="x-circle" :label="$t('close')" />
            {{ $t("close") }}
          </button>
        </div>
        <div>
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
    <div class="_openChapter--content">
      <div class="_topButtons">
        <TitleField
          :field_name="'section_title'"
          :content="chapter.section_title"
          :maxlength="40"
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
            {{ $t("text") }}
            <b-icon icon="markdown" />
          </template>
          <template v-else-if="chapter.section_type === 'gallery'">
            {{ $t("gallery") }}
            <b-icon icon="image" />
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

        <div class="_selects--starts_on_page" v-if="view_mode === 'book'">
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
          <transition-group
            tag="div"
            class="_gallery"
            name="StoryModules"
            appear
          >
            <div
              class="_gallery--item"
              v-for="media in gallery_medias"
              :key="media.$path"
            >
              <MediaContent :file="media" :context="'full'" />
              <div class="_remove_media">
                <RemoveMenu
                  :show_button_text="false"
                  @remove="removeMedia(media)"
                />
              </div>
            </div>

            <div class="_add_medias" key="add_medias">
              <button
                type="button"
                class="u-button u-button_bleuvert"
                @click="show_media_picker = true"
              >
                {{ $t("add_medias") }}
              </button>
            </div>
          </transition-group>

          <MediaPicker
            v-if="show_media_picker"
            :publication_path="publication.$path"
            :select_mode="'multiple'"
            :pick_from_types="['image']"
            @pickMedias="pickMediasForGallery"
            @close="show_media_picker = false"
          />
        </template>
        <template v-if="chapter.section_type === 'story'">
          <SingleSection
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
import MediaPicker from "@/components/publications/MediaPicker.vue";

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
    MediaPicker,
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
    gallery_medias() {
      const medias = [];
      if (
        this.chapter.section_type !== "gallery" ||
        !this.chapter.source_medias
      )
        return [];
      for (const source_media of this.chapter.source_medias) {
        const folder_path = this.getParent(this.chapter.$path);
        const media = this.getSourceMedia({
          source_media,
          folder_path,
        });
        if (media) medias.push(media);
      }
      return medias;
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
          return this.getSourceMedia({
            source_media: {
              meta_filename_in_project: src,
            },
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

    insertToText(text) {
      // Find the collaborative editor instance and insert the text
      const editor = this.$refs.collaborativeEditor;
      if (editor) {
        editor.insertAtCursor(text);
      }
    },

    async pickMediasForGallery(medias) {
      const new_entries = [];
      for (const media of medias) {
        const new_entry = await this.prepareMediaForPublication({
          path_to_source_media_meta: media.$path,
          publication_path: this.publication.$path,
        });
        new_entries.push(new_entry);
      }

      const existing_source_medias = this.chapter.source_medias || [];
      const source_medias = [...existing_source_medias, ...new_entries];

      this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta: {
          source_medias,
        },
      });
    },
    removeMedia(media) {
      const source_medias = this.chapter.source_medias.filter(
        (sm) => sm.meta_filename_in_project !== this.getFilename(media.$path)
      );
      this.$api.updateMeta({
        path: this.chapter.$path,
        new_meta: { source_medias },
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

  margin: 0;
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
  padding: calc(var(--spacing) / 2);
  // padding-top: calc(var(--spacing) * 4);
  // padding-bottom: calc(var(--spacing) * 4);
}
._navBtns--content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 1);

  > * {
    flex: 1 1 0;

    &:nth-child(2) {
      .u-linkList {
        justify-content: center;
      }
    }
    &:last-child {
      .u-linkList {
        justify-content: flex-end;
      }
    }
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

._gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: calc(var(--spacing) * 1);

  ._add_medias {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  ._gallery--item {
    position: relative;
    aspect-ratio: 1/1;

    border: 2px solid var(--c-gris_clair);
    // aspect-ratio: 1/1;
    overflow: hidden;

    ::v-deep {
      ._mediaContent {
        width: 100%;
        height: 100%;
      }

      ._mediaContent--image,
      .plyr--video,
      .plyr__poster,
      ._mediaContent--iframe,
      ._iframeStylePreview {
        position: absolute;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        object-fit: scale-down;
        background-size: scale-down;
        background-color: var(--c-gris_clair);
      }
    }
  }
}

._remove_media {
  position: absolute;
  top: 0;
  right: 0;
  margin: var(--spacing);
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
</style>
