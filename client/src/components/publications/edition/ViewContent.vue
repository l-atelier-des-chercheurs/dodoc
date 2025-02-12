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

    <div class="_viewContent--content">
      <PagedViewer
        v-if="view_mode === 'book'"
        :content_nodes="content_nodes"
        :format_mode="format_mode"
        :viewer_type="viewer_type"
        :css_styles="css_styles"
        :opened_chapter_meta_filename="opened_chapter_meta_filename"
        @openChapter="$emit('openChapter', $event)"
      />
      <DocViewer
        v-else
        class="_docViewer"
        :content_nodes="content_nodes"
        :css_styles="css_styles"
        :opened_chapter_meta_filename="opened_chapter_meta_filename"
        @openChapter="$emit('openChapter', $event)"
      />
    </div>
    <LoaderSpinner v-if="is_loading" />
  </div>
</template>
<script>
import { marked } from "marked";
import { generate } from "lean-qr";
import DOMPurify from "dompurify";

import PagedViewer from "@/components/publications/edition/PagedViewer.vue";
import DocViewer from "@/components/publications/edition/DocViewer.vue";

import pagedengine from "@/components/publications/edition/pagedengine.css?raw";
import default_styles from "@/components/publications/edition/default_styles.css?raw";

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
            _chapter.content = this.parseMarkdown(
              chapter._main_text.$content,
              chapter.source_medias
            );
          } else {
            _chapter.content = chapter._main_text?.$content;
          }
        }

        nodes.chapters.push(_chapter);
      });

      return nodes;
    },
    css_styles() {
      let custom_styles = default_styles;

      const style_file = this.publication.$files?.find(
        (f) => f.is_css_styles === true
      );
      if (style_file) custom_styles = style_file.$content;

      return `
      ${pagedengine || ""}
      ${custom_styles || ""}
      `;
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
    parseMarkdown(content, source_medias) {
      // const url_to_medias =
      //   window.location.origin + "/" + this.getParent(this.publication.$path);
      // marked.use(baseUrl(url_to_medias));

      marked.use({
        renderer: {
          image: (meta_src, title, alt) => {
            let html;

            let custom_classes = [],
              width,
              height;

            if (title?.startsWith("=")) {
              if (title.startsWith("=full-page")) {
                custom_classes.push("_fullPage");
                if (title.startsWith("=full-page-cover")) {
                  custom_classes.push("_fullPageCover");
                }
              } else {
                [width, height] = title
                  .slice(1)
                  .split("x")
                  .map((v) => v.trim())
                  .filter(Boolean);
              }
            }

            if (meta_src.startsWith("http")) {
              html = `
                  <img src="${meta_src}"
                    alt="${alt}"
                    ${width ? ` width="${width}"` : ""}
                    ${height ? ` height="${height}"` : ""}
                  >

                `;
            } else {
              const _media = this.getMediaSrc(meta_src, source_medias);
              if (!_media) {
                html = `<i>Media not found</i>`;
              } else {
                const { html: _html, is_qr_code } = this.placeLocalMedia({
                  _media,
                  alt,
                  width,
                  height,
                });
                html = _html;
                if (is_qr_code) {
                  custom_classes.push("_isQRCode");
                }
              }
            }

            if (alt)
              html += `<div class="_mediaCaption"><span>${alt}</span></div>`;
            return `<div class='_mediaContainer ${custom_classes.join(
              " "
            )}'>${html}</div>`;
          },
        },
      });

      const parsed = marked.parse(content);
      return DOMPurify.sanitize(parsed);
    },

    getMediaSrc(meta_src, source_medias) {
      if (!meta_src) return;

      let media = this.getSourceMedia({
        source_media: {
          meta_filename_in_project: meta_src,
        },
        folder_path: this.publication.$path,
      });

      if (!media) {
        // attempt to find in chapter source_medias
        if (source_medias?.length > 0) {
          const local_media = source_medias.find(
            (sm) => sm.meta_filename_in_project === meta_src
          );
          if (local_media) media = local_media._media;
        }
      }

      if (!media) return;

      const src = this.makeMediaFileURL({
        $path: media.$path,
        $media_filename: media.$media_filename,
      });

      const url =
        window.location.origin + "/_previewmedia?path_to_meta=" + media.$path;

      const code = generate(url);
      const dataUrl = code.toDataURL({ scale: 10 });

      return {
        media,
        src,
        dataUrl,
      };
    },
    placeLocalMedia({ _media, alt, width, height }) {
      let html = "";
      let is_qr_code = false;

      const { src, dataUrl, media } = _media;
      if (!width && !height) {
        width = media.$infos.width;
        height = media.$infos.height;
      }

      if (media.$type === "image") {
        html = `
                  <img src="${src}"
                    alt="${alt}"
                    ${width ? ` width="${width}"` : ""}
                    ${height ? ` height="${height}"` : ""}
                  >
                `;
      } else {
        is_qr_code = true;
        html += `
              <div>
                <img class="_qrCode" src="${dataUrl}" alt="qr code for media" />
              </div>
            `;

        // html += `<div class="_mediaFilename">${media.$media_filename}</div> `;
        html += `<div class="_mediaInfos">`;

        if (media.$infos.duration) {
          html += `<div class="_mediaDuration">
                ${this.$t(media.$type)}
                ${this.formatDurationToHoursMinutesSeconds(
                  media.$infos.duration
                )}
              </div>`;
        }

        html += `
              <div class="_mediaSourceCaption">
                ${media.caption || ""}
              </div>
              <div class="_mediaSourceCredits">
                ${media.$credits || ""}
              </div>`;

        html += `</div>`;

        // get thumbs
        const thumb = this.getFirstThumbURLForMedia({
          file: media,
          resolution: 220,
        });
        if (thumb) {
          html += `
              <div class="_thumbnail">
                <img src="${thumb}"
                  alt="${alt}"
                  ${width ? ` width="${width}"` : ""}
                  ${height ? ` height="${height}"` : ""}
                >
              </div>`;
        }
      }

      return { html, is_qr_code };
    },
  },
};
</script>
<style lang="scss" scoped>
._viewContent {
  position: relative;
  width: 100%;
  height: 100%;

  ._viewContent--content {
    position: relative;
    width: 100%;
    height: 100%;
  }
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
