<template>
  <div class="_viewContent">
    <div class="_viewMode">
      <select v-model="view_mode" size="small">
        <option value="book">{{ $t("book") }}</option>
        <option value="html">{{ $t("webpage") }}</option>
      </select>
      <select v-if="view_mode === 'book'" v-model="format_mode" size="small">
        <option value="A4">{{ $t("A4_portrait") }}</option>
        <option value="A4 landscape">{{ $t("A4_landscape") }}</option>
        <option value="A5">{{ $t("A5_portrait") }}</option>
        <option value="A5 landscape">{{ $t("A5_landscape") }}</option>
      </select>
    </div>

    <template v-if="view_mode === 'book'">
      <PagedViewer
        :content_nodes="content_nodes"
        :format_mode="format_mode"
        :viewer_type="viewer_type"
        :opened_chapter_meta_filename="opened_chapter_meta_filename"
        @openChapter="$emit('openChapter', $event)"
      />
    </template>
    <DocViewer
      v-else
      class="_docViewer"
      :content_nodes="content_nodes"
      :opened_chapter_meta_filename="opened_chapter_meta_filename"
      @openChapter="$emit('openChapter', $event)"
    />
    <LoaderSpinner v-if="is_loading" />
  </div>
</template>
<script>
import { marked } from "marked";
import { baseUrl } from "marked-base-url";
import DOMPurify from "dompurify";

import PagedViewer from "@/components/publications/markdown/PagedViewer.vue";
import DocViewer from "@/components/publications/markdown/DocViewer.vue";
import ToggleInput from "@/adc-core/inputs/ToggleInput.vue";

export default {
  props: {
    publication: Object,
    viewer_type: {
      type: String,
      default: "vue-infinite-viewer",
    },
    opened_chapter_meta_filename: String,
  },
  components: {
    PagedViewer,
    DocViewer,
  },
  data() {
    return {
      is_loading: false,
      view_mode: "book",
      format_mode: "A5",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    cover_media() {
      return this.publication.$files.find((f) => f.cover_type === "front");
    },
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
    content_nodes() {
      let nodes = {};

      const cover = this.parseCover();
      if (cover) nodes.cover = cover;

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
    parseCover() {
      let cover = undefined;
      if (
        this.cover_media &&
        (this.cover_media.$content ||
          this.cover_media.source_medias?.length > 0)
      ) {
        cover = {};

        if (this.cover_media.$content?.length > 0) {
          cover.title = this.parseMarkdown(this.cover_media.$content);
        }

        if (this.cover_media.source_medias?.length > 0) {
          const cover_file = this.getSourceMedia({
            source_media: this.cover_media.source_medias[0],
            folder_path: this.publication.$path,
          });
          if (cover_file) {
            cover.image_meta = cover_file;

            const image_url = this.makeMediaFileURL({
              $path: cover_file.$path,
              $media_filename: cover_file.$media_filename,
            });
            if (image_url) cover.image_url = image_url;
          }
        }

        cover.layout_mode = this.cover_media.cover_layout_mode || "normal";
      }
      return cover;
    },
    parseMarkdown(content) {
      // const url_to_medias =
      //   window.location.origin + "/" + this.getParent(this.publication.$path);
      // marked.use(baseUrl(url_to_medias));

      marked.use({
        renderer: {
          image: (meta_src, title, alt) => {
            const media = this.getSourceMedia({
              source_media: {
                meta_filename_in_project: meta_src,
              },
              folder_path: this.publication.$path,
            });
            const src = this.makeMediaFileURL({
              $path: media.$path,
              $media_filename: media.$media_filename,
            });

            debugger;

            const [width, height] = title?.startsWith("=")
              ? title
                  .slice(1)
                  .split("x")
                  .map((v) => v.trim())
                  .filter(Boolean)
              : [];

            return `<div class="_image">
              <img src="${src}" alt="${alt}"${
              width ? ` width="${width}"` : ""
            }${height ? ` height="${height}"` : ""}>
            </div>`;
          },
        },
      });

      const parsed = marked.parse(content);
      return DOMPurify.sanitize(parsed);
    },
  },
};
</script>
<style lang="scss" scoped>
._viewContent {
  position: relative;
  width: 100%;
  height: 100%;
}

._viewMode {
  position: absolute;
  top: 0;
  left: 0;
  // width: 100%;
  z-index: 10;
  margin: 0 auto;
  padding: calc(var(--spacing) / 1);
  pointer-events: none;

  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 1);

  select {
    width: 18ch;
    pointer-events: all;
  }

  @media print {
    display: none;
  }
}
</style>
