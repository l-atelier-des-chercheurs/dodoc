<template>
  <div class="_markdownTemplate">
    <splitpanes class="_splitpanes">
      <pane>
        <ChaptersSummary
          :publication="publication"
          :cover_image="cover_image"
          :sections="all_chapters"
          :opened_section_meta_filename="opened_section_meta_filename"
          :can_edit="can_edit"
          @toggleSection="$emit('toggleSection', $event)"
        />
        <transition name="scaleInFade" mode="out-in">
          <OpenChapter
            v-if="open_chapter"
            :key="open_chapter.$path"
            :chapter="open_chapter"
            :can_edit="can_edit"
            @remove="removeChapter(open_chapter)"
            @close="$emit('toggleSection', null)"
          />
        </transition>
      </pane>
      <pane>
        <div class="_viewer">
          <ViewContent
            :content_nodes="content_nodes"
            :opened_chapter_meta_filename="opened_section_meta_filename"
            :can_edit="can_edit"
            @openChapter="$emit('toggleSection', $event)"
          />
        </div>
      </pane>
    </splitpanes>
  </div>
</template>
<script>
import { Splitpanes, Pane } from "splitpanes";
import { marked } from "marked";
import { baseUrl } from "marked-base-url";
import DOMPurify from "dompurify";

import ChaptersSummary from "@/components/publications/markdown/ChaptersSummary.vue";
import OpenChapter from "@/components/publications/markdown/OpenChapter.vue";
import ViewContent from "@/components/publications/markdown/ViewContent.vue";
export default {
  props: {
    publication: Object,
    opened_section_meta_filename: String,
    can_edit: Boolean,
  },
  components: {
    Splitpanes,
    Pane,
    ChaptersSummary,
    OpenChapter,
    ViewContent,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_chapters() {
      return this.getSectionsWithProps({
        publication: this.publication,
        group: "sections_list",
      }).map((chapter) => {
        // const associated_text = this.publication.$files.find(
        //   (f2) => f2.$path.endsWith(".md")
        // );
        if (chapter.main_text_meta) {
          chapter._main_text = this.publication.$files.find((f) =>
            f.$path.endsWith("/" + chapter.main_text_meta)
          );
        }
        return chapter;
      });
    },
    cover_image() {
      if (this.publication.cover_enabled !== true) return false;

      let cover = {};
      if (this.publication.cover_meta_filename) {
        cover = this.getSourceMedia({
          source_media: {
            meta_filename_in_project: this.publication.cover_meta_filename,
          },
          folder_path: this.publication.$path,
        });
        if (cover) {
          return cover;
        }
      }

      return false;
    },
    open_chapter() {
      if (this.opened_section_meta_filename) {
        return this.all_chapters.find((f) =>
          f.$path.endsWith(this.opened_section_meta_filename)
        );
      }
      return false;
    },

    content_nodes() {
      let nodes = {};

      if (this.publication.cover_enabled) {
        nodes.cover = {};
        if (this.publication.cover_title)
          nodes.cover.title = this.publication.cover_title;

        if (this.cover_image) {
          const image_url = this.makeMediaFileURL({
            $path: this.cover_image.$path,
            $media_filename: this.cover_image.$media_filename,
          });
          if (image_url) {
            nodes.cover.image_url = image_url;
          }
          nodes.cover.layout_mode =
            this.publication.cover_image_layout || "normal";
        }
      }

      nodes.chapters = [];
      this.all_chapters.map((chapter) => {
        let _chapter = {};

        _chapter.title = chapter.section_title;
        _chapter.meta_filename = this.getFilename(chapter.$path);
        _chapter.starts_on_page = chapter.section_starts_on_page || "in_flow";
        if (chapter._main_text?.$content) {
          if (chapter._main_text?.content_type === "markdown") {
            _chapter.content = this.parseMarkdown(chapter._main_text.$content);
          } else {
            _chapter.content = chapter._main_text?.$content;
          }
        }

        nodes.chapters.push(_chapter);
      });

      return nodes;
    },
  },
  methods: {
    parseMarkdown(content) {
      const url_to_medias =
        window.location.origin + "/" + this.getParent(this.publication.$path);
      marked.use(baseUrl(url_to_medias));

      marked.use({
        renderer: {
          image(src, title, alt) {
            console.log("---", src, alt, title);
            const [width, height] = title?.startsWith("=")
              ? title
                  .slice(1)
                  .split("x")
                  .map((v) => v.trim())
                  .filter(Boolean)
              : [];
            return `<img src="${src}" alt="${alt}"${
              width ? ` width="${width}"` : ""
            }${height ? ` height="${height}"` : ""}>`;
          },
        },
      });

      const parsed = marked.parse(content);
      return DOMPurify.sanitize(parsed);
    },
    async removeChapter(chapter) {
      if (chapter._main_text) {
        await this.$api.deleteItem({
          path: chapter._main_text.$path,
        });
      }
      await this.$api.deleteItem({
        path: chapter.$path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._markdownTemplate {
  position: relative;
  width: 100%;
  height: 100%;
}
._splitpanes {
  position: absolute;
  height: 100%;
  width: 100%;
}
._viewer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: auto;
}
</style>
