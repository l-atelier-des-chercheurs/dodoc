<template>
  <div class="_mainText">
    <!-- <pre>{{ medias_holder.source_medias }}</pre> -->
    <DLabel v-if="show_label" :str="$t('content')" />
    <CollaborativeEditor3
      :content="main_text_content"
      :path="text_file.$path"
      :custom_formats="custom_formats"
      :save_format="save_format"
      :content_type="'markdown'"
      :mode="edit_mode"
      :can_edit="can_edit"
      ref="collaborativeEditor"
    >
      <template #custom_buttons>
        <button
          type="button"
          class="u-button u-button_orange"
          @click="show_media_picker = !show_media_picker"
        >
          <b-icon icon="image" />
          {{ $t("import") }}
        </button>
      </template>
    </CollaborativeEditor3>

    <PickMediaForMarkdown
      v-if="show_media_picker"
      :publication_path="publication_path"
      @insertToText="insertToText"
      @close="closePickModal"
    />
  </div>
</template>

<script>
import markdownit from "markdown-it";
import markdownItCsc from "@/components/publications/edition/markdownItCsc.js";
import PickMediaForMarkdown from "@/components/publications/edition/PickMediaForMarkdown.vue";

export default {
  props: {
    text_file: Object,
    medias_holder: Object,
    publication_path: String,
    show_label: {
      type: Boolean,
      default: true,
    },
    can_edit: {
      type: Boolean,
      default: true,
    },
    edit_mode: {
      type: String,
      default: undefined,
    },
  },
  components: {
    PickMediaForMarkdown,
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  computed: {
    content_type() {
      return this.text_file?.content_type || "html";
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
      return this.text_file?.$content;
    },
  },
  watch: {
    main_text_content: {
      handler(content) {
        if (content) this.listAllEmbeddedMedias(content);
      },
      deep: true,
    },
  },
  methods: {
    listAllEmbeddedMedias(content) {
      let source_medias = [];

      const md = new markdownit();

      // Add the CSC plugin
      md.use(markdownItCsc, {
        getMediaSrc: (src) => {
          const folder_path = this.publication_path;

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
          const folder_path = this.publication_path;
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
        if (
          ["image", "video", "audio", "pdf"].includes(token.tag) &&
          token.content
        ) {
          const meta_src = token.content;
          const folder_path = this.publication_path;

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
      // Two media objects are duplicates if they have the same identifier
      // (either meta_filename_in_project or meta_filename)
      source_medias = source_medias.filter((media, index, self) => {
        const mediaId = media.meta_filename_in_project || media.meta_filename;
        if (!mediaId) return true; // Keep items without identifiers

        // Find the first occurrence of this media
        const firstIndex = self.findIndex((t) => {
          const tId = t.meta_filename_in_project || t.meta_filename;
          return tId && tId === mediaId;
        });

        return index === firstIndex;
      });

      if (
        JSON.stringify(source_medias) !==
        JSON.stringify(this.medias_holder.source_medias)
      )
        this.$api.updateMeta({
          path: this.medias_holder.$path,
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
._mainText {
  // margin-bottom: calc(var(--spacing) * 1);
}
</style>
