<template>
  <div class="_debugMode">
    <h2>HTML</h2>
    <code ref="chapter" v-html="pretty_content_html" />
  </div>
</template>
<script>
import pretty from "pretty";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/vs2015.css";

export default {
  props: {
    content_html: String,
    opened_chapter_meta_filename: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    opened_chapter_meta_filename: {
      handler() {
        this.scrollToChapter();
      },
      immediate: true,
    },
  },
  computed: {
    pretty_content_html() {
      // return this.content_html;
      const html = pretty(this.content_html, { ocd: true });
      const highlighted = hljs.highlight(html, { language: "xml" }).value;
      return highlighted;
    },
  },
  methods: {
    scrollToChapter() {
      const chapter = this.$refs.chapter;
      if (chapter && this.opened_chapter_meta_filename) {
        // find hljs-attr = data-chapter-meta-filename and hljs-string = this.opened_chapter_meta_filename
        const attrs = chapter.querySelectorAll(`.hljs-tag .hljs-attr`);
        const all_chapters = Array.from(attrs).filter(
          (el) => el.textContent === "data-chapter-meta-filename"
        );

        all_chapters.map((el) => {
          let chapter_filename = el.nextSibling.nextSibling.textContent;
          chapter_filename = chapter_filename.substring(
            1,
            chapter_filename.length - 1
          );
          if (chapter_filename === this.opened_chapter_meta_filename) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._debugMode {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background-color: var(--c-noir);
  background-color: var(--c-noir);
  color: white;
  overflow: auto;
  padding: calc(var(--spacing) * 2);
  scroll-margin-top: 50px;

  code {
    background-color: var(--c-noir);
    color: white;
    font-size: inherit;
    padding: 0;
    white-space: pre-wrap;
  }
  ::selection {
    background-color: #555;
  }
}
</style>
