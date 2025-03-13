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
          <div class="_pickFileButton">
            <button
              type="button"
              class="u-button u-button_bleumarine"
              @click="show_media_picker = !show_media_picker"
            >
              {{ $t("import") }}
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
            v-if="picked_file_filename"
            :title="$t('add_media')"
            @close="closePickModal"
          >
            <ToggleInput
              :content.sync="full_page_media"
              :label="$t('full_page')"
            />
            <div class="u-spacingBottom" />

            <div class="u-spacingBottom u-inputGroup">
              <input
                type="text"
                ref="urlToCopy"
                v-model="pick_file_shortcut"
                readonly
              />
              <button
                type="button"
                class="u-button u-button_icon u-suffix _clipboardBtn"
                @click="copyToClipboard"
              >
                <b-icon icon="clipboard" v-if="!is_copied" />
                <b-icon icon="clipboard-check" v-else />
              </button>
            </div>

            <div class="u-instructions">
              {{ $t("copy_paste_to_include_media") }}
            </div>
          </BaseModal2>
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
import { marked } from "marked";

import MediaPicker from "@/components/publications/MediaPicker.vue";

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
    MediaPicker,
  },
  data() {
    return {
      show_media_picker: false,
      picked_file_filename: null,
      picked_file_caption: "",
      full_page_media: false,
      is_copied: false,
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
    pick_file_shortcut() {
      let html = "";

      if (this.picked_file_caption) html += `![${this.picked_file_caption}]`;
      else html += "![]";

      if (!this.picked_file_filename) html += "()";
      else {
        if (this.full_page_media)
          html += `(${this.picked_file_filename} "=full-page")`;
        else html += `(${this.picked_file_filename})`;
      }

      return html;
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
      this.picked_file_filename = this.getFilename(source_media_meta);
    },
    copyToClipboard() {
      this.is_copied = false;

      // Get the text field
      var copyText = this.$refs.urlToCopy;

      // Select the text field
      copyText.select();
      copyText.setSelectionRange(0, 99999); // For mobile devices

      // Copy the text inside the text field
      navigator.clipboard.writeText(copyText.value);

      this.is_copied = true;
    },
    closePickModal() {
      this.picked_file_filename = null;
      this.picked_file_caption = "";
      this.full_page_media = false;
      this.is_copied = false;
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

._pickFileButton {
  position: sticky;
  top: 0;
  // height: 0;
  // width: 100%;
  text-align: right;
  // margin: calc(var(--spacing) * 2);
  z-index: 10;
  padding: calc(var(--spacing) / 2);
  pointer-events: none;

  > * {
    pointer-events: auto;
  }
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
</style>
