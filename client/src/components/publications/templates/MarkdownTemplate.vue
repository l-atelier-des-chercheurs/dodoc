<template>
  <div class="_markdownTemplate">
    <splitpanes class="_splitpanes">
      <pane>
        <ChaptersSummary
          :publication="publication"
          :sections="all_chapters"
          :opened_section_meta_filename="opened_section_meta_filename"
          :can_edit="can_edit"
          @toggleSection="$emit('toggleSection', $event)"
        />
        <transition name="pagechange" mode="out-in">
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
            <option value="a4">{{ $t("a4") }}</option>
            <option value="a5">{{ $t("a5") }}</option>
          </select>
        </div>
        <div class="_viewer">
          <ViewContent
            v-if="content_to_view"
            :key="content_to_view"
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
      format_mode: "a5",
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
    open_chapter() {
      if (this.opened_section_meta_filename) {
        return this.all_chapters.find((f) =>
          f.$path.endsWith(this.opened_section_meta_filename)
        );
      }
      return false;
    },
    content_to_view() {
      function formatChapter(chapter) {
        let content = "<section class='_chapter'>";
        content += `<h1 class="_chapterTitle">${chapter.section_title}</h1>`;
        if (chapter.section_type === "markdown") {
          // todo parse markdown to html
          content += chapter._main_text?.$content || "";
        } else {
          content += chapter._main_text?.$content || "";
        }
        content += "</section>";
        return content;
      }

      if (this.open_chapter) return formatChapter(this.open_chapter);

      return this.all_chapters.reduce((acc, chapter) => {
        acc += formatChapter(chapter);
        return acc;
      }, "");
    },
  },
  methods: {
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
