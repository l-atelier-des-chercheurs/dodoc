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
        <div class="_viewMode">
          <select v-model="view_mode" size="small">
            <option value="book">{{ $t("book") }}</option>
            <option value="html">{{ $t("website") }}</option>
          </select>
          <select
            v-if="view_mode === 'book'"
            v-model="format_mode"
            size="small"
          >
            <option value="A4">{{ $t("A4_portrait") }}</option>
            <option value="A4 landscape">{{ $t("A4_landscape") }}</option>
            <option value="A5">{{ $t("A5_portrait") }}</option>
            <option value="A5 landscape">{{ $t("A5_landscape") }}</option>
          </select>
        </div>
        <div class="_viewer">
          <ViewContent
            v-if="content_to_view"
            :content="content_to_view"
            :view_mode="view_mode"
            :format_mode="format_mode"
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
    return {
      view_mode: "book",
      format_mode: "A5",
    };
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
    content_to_view() {
      let html = "";

      if (this.publication.cover_enabled) {
        html += `<div class="_cover">`;

        if (this.publication.cover_title)
          html += `<h1 class="_coverTitle">${this.publication.cover_title}</h1>`;

        if (this.cover_image) {
          const cover_full = this.makeMediaFileURL({
            $path: this.cover_image.$path,
            $media_filename: this.cover_image.$media_filename,
          });
          let layout_mode = this.publication.cover_image_layout || "normal";
          html += `<div class="_coverImage" data-layout-mode="${layout_mode}"><img src="${cover_full}" /></div>`;
        }

        html += `</div>`;
      }

      const formatChapter = (chapter) => {
        const starts_on_page = chapter.section_starts_on_page || "in_flow";

        let content = `<section class='_chapter' data-starts-on-page="${starts_on_page}">`;
        content += `<h1 class="_chapterTitle">${chapter.section_title}</h1>`;
        if (
          chapter._main_text?.content_type === "markdown" &&
          chapter._main_text?.$content
        ) {
          content += this.parseMarkdown(chapter._main_text.$content);
        } else {
          content += chapter._main_text?.$content || "";
        }
        content += "</section>";
        return content;
      };

      html += this.all_chapters.reduce((acc, chapter) => {
        acc += formatChapter(chapter);
        return acc;
      }, "");

      return html;
    },
  },
  methods: {
    parseMarkdown(content) {
      const url_to_medias =
        window.location.origin + "/" + this.getParent(this.publication.$path);
      marked.use(baseUrl(url_to_medias));
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

._viewMode {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
  margin: 0 auto;
  padding: calc(var(--spacing) / 2);
  pointer-events: none;

  select {
    max-width: 20ch;
    pointer-events: all;
  }
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
<style data-pagedjs-inserted-styles="true">
@media print {
  .pagedjs-page {
    background: red;
  }
}
</style>
