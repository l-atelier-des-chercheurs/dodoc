<template>
  <div class="_viewContent">
    <div class="_viewMode">
      <div class="_viewMode--buttons">
        <div
          v-for="available_view_mode in available_view_modes"
          :key="available_view_mode.value"
        >
          <button
            class="u-button u-button_white u-button_icon"
            :class="{ 'is--active': view_mode === available_view_mode.value }"
            @click="$emit('changeView', available_view_mode.value)"
          >
            <b-icon :icon="available_view_mode.icon" />
            <!-- {{ view_mode.label }} -->
          </button>
        </div>
      </div>
      <!-- <select
        :value="view_mode"
        size="small"
        @change="$emit('changeView', $event.target.value)"
      >
        <option value="book">{{ $t("book") }}</option>
        <option value="html">{{ $t("webpage") }}</option>
      </select> -->

      <select
        size="small"
        v-if="style_files?.length > 0"
        :value="opened_style_file_meta"
        @change="$emit('setStyleFile', $event.target.value)"
      >
        <option
          v-for="style_file in style_files"
          :key="style_file.$path"
          :value="getFilename(style_file.$path)"
        >
          {{ style_file.css_title || getFilename(style_file.$path) }}
        </option>
        <option value="default">{{ $t("default_styles") }}</option>
      </select>
    </div>

    <div v-if="show_source_html_toggle" class="_toggleHTML">
      <ToggleInput
        :content="show_source_html"
        :label="$t('show_source_html')"
        @update:content="$emit('update:show_source_html', $event)"
      />
    </div>

    <div class="_viewContent--content">
      <PagedViewer
        v-if="view_mode === 'book'"
        :content_nodes="content_nodes"
        :format_mode="format_mode"
        :viewer_type="viewer_type"
        :css_styles="css_styles"
        :show_source_html="show_source_html"
        :opened_chapter_meta_filename="opened_chapter_meta_filename"
        :can_edit="can_edit"
        @openChapter="$emit('openChapter', $event)"
        @updateChaptersPositions="$emit('updateChaptersPositions', $event)"
      />
      <DocViewer
        v-else
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
import markdownit from "markdown-it";
import markdownItCsc from "@/components/publications/edition/markdownItCsc.js";
import markdownItAttrs from "markdown-it-attrs";
import markdownItBracketedSpans from "markdown-it-bracketed-spans";
import LinkAttributes from "markdown-it-link-attributes";
import hljs from "highlight.js/lib/common";

import { generate } from "lean-qr";

import PagedViewer from "@/components/publications/edition/PagedViewer.vue";
import DocViewer from "@/components/publications/edition/DocViewer.vue";

import pagedengine from "@/components/publications/edition/pagedengine.css?raw";
import default_styles from "@/components/publications/edition/default_styles.css?raw";

export default {
  props: {
    publication: Object,
    view_mode: String,
    opened_style_file_meta: String,
    viewer_type: {
      type: String,
      default: "infinite-viewer",
    },
    opened_chapter_meta_filename: String,
    show_source_html_toggle: Boolean,
    show_source_html: Boolean,
    can_edit: Boolean,
  },
  components: {
    PagedViewer,
    DocViewer,
  },
  data() {
    return {
      is_loading: false,
      available_view_modes: [
        {
          label: this.$t("book"),
          value: "book",
          icon: "book",
        },
        {
          label: this.$t("webpage"),
          value: "html",
          icon: "window-sidebar",
        },
      ],
      // custom_styles_nested: "",
    };
  },
  created() {
    if (
      this.style_files.length > 0 &&
      this.opened_style_file_meta === "first"
    ) {
      this.$emit("setStyleFile", this.getFilename(this.style_files[0]?.$path));
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    // custom_styles_unnested: {
    //   handler() {
    //     this.custom_styles_nested = this.prepareCustomStyles(
    //       this.custom_styles_unnested
    //     );
    //   },
    //   immediate: true,
    // },
  },
  computed: {
    format_mode() {
      if (this.publication.page_width && this.publication.page_height) {
        return `${this.publication.page_width}mm ${this.publication.page_height}mm`;
      }
      return "A4";
    },
    cover_media() {
      return this.publication.$files.find((f) => f.cover_type === "front");
    },
    custom_styles_unnested() {
      if (
        this.opened_style_file_meta === "default" ||
        this.style_files?.length === 0
      ) {
        return default_styles;
      } else if (!this.opened_style_file_meta) {
        return this.style_files[0];
      } else {
        return (
          this.style_files.find(
            (f) => this.getFilename(f.$path) === this.opened_style_file_meta
          )?.$content || ""
        );
      }
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
        _chapter.column_count = chapter.column_count || 1;
        _chapter.section_type = chapter.section_type || "text";
        if (!chapter.section_type || chapter.section_type === "text") {
          if (chapter._main_text?.$content) {
            if (chapter._main_text?.content_type === "markdown") {
              _chapter.content = this.parseMarkdownWithMarkedownIt(
                chapter._main_text.$content,
                chapter.source_medias
              );
            } else {
              _chapter.content = chapter._main_text?.$content;
            }
          }
        } else if (chapter.section_type === "gallery") {
          _chapter.content = this.parseGallery(chapter.source_medias);
        } else if (chapter.section_type === "story") {
          _chapter.content = this.parseStory(chapter);
        }

        nodes.chapters.push(_chapter);
      });

      return nodes;
    },
    style_files() {
      return this.publication.$files
        ?.filter((f) => f.is_css_styles === true)
        .sort((a, b) => {
          const a_title = a.css_title || this.getFilename(a.$path);
          const b_title = b.css_title || this.getFilename(b.$path);
          if (a_title < b_title) return -1;
          if (a_title > b_title) return 1;
        });
    },
    css_styles() {
      return `
      ${pagedengine || ""}
      ${this.custom_styles_unnested}
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
          cover.title = this.parseMarkdownWithMarkedownIt(
            this.cover_media.$content
          );
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

        cover.layout_mode = this.cover_media?.cover_layout_mode || "normal";
      }
      return cover;
    },
    prepareCustomStyles(cssContent) {
      // const out = postcss()
      //   .use(
      //     prefixer({
      //       prefix: ".bookpreview",
      //       exclude: ["@"],
      //     })
      //   )
      //   .process(cssContent).css;
      // return out;

      // makes @page not working… oh well

      return cssContent;

      // return new Promise((resolve, reject) => {
      //   const plugins = [
      //     prefixer({
      //       prefix: ".my-prefix",
      //       transform: (prefix, selector, prefixedSelector) => {
      //         // Exclude @page rules
      //         if (selector.includes("@page")) {
      //           return selector;
      //         }
      //         return prefixedSelector;
      //       },
      //     }),
      //   ];

      //   // Process the CSS content with the configured plugins
      //   postcss(plugins)
      //     .process(cssContent)
      //     .then((result) => {
      //       // Output the processed CSS
      //       console.log(result.css);
      //       debugger;
      //     });
      // });
    },
    renderImage(meta_src, title, alt, source_medias) {
      if (meta_src.startsWith("http")) {
        let custom_classes = ["media"],
          width,
          height;

        if (title?.startsWith("=")) {
          if (title.startsWith("=full-page")) {
            if (this.view_mode === "book") {
              custom_classes.push("_isFullPage");
              if (title.startsWith("=full-page-cover")) {
                custom_classes.push("_isFullPageCover");
              }
            }
          } else {
            [width, height] = title
              .slice(1)
              .split("x")
              .map((v) => v.trim())
              .filter(Boolean);
          }
        }

        let html = `
            <img src="${meta_src}"
              alt="${alt}"
              ${width ? ` width="${width}"` : ""}
              ${height ? ` height="${height}"` : ""}
            >
          `;

        if (alt) {
          html += `<figcaption class="mediaCaption"><span>${alt}</span></figcaption>`;
        }

        return `<figure class="${custom_classes.join(" ")}">${html}</figure>`;
      } else {
        const { html } = this.placeLocalMedia({
          meta_src,
          source_medias,
          alt,
          title,
        });
        return html;
      }
    },

    parseMarkdownWithMarkedownIt(content, source_medias) {
      const md = markdownit({
        breaks: true,
        linkify: true,
        typographer: true,
        html: false,
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(str, {
                language: lang,
                ignoreIllegals: true,
              }).value;
            } catch (__) {}
          }

          return ""; // use external default escaping
        },
      });

      // Override default image renderer to handle standard markdown image format ![alt](src)
      const defaultImageRenderer = md.renderer.rules.image;
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const src = token.attrGet("src");
        const title = token.attrGet("title");
        const alt = token.content;

        if (src) {
          // Use the existing renderImage method to handle the image
          return this.renderImage(src, title, alt, source_medias);
        }

        // Fallback to default renderer if no src
        return defaultImageRenderer(tokens, idx, options, env, self);
      };
      // not working :(
      md.use(LinkAttributes, {
        matcher: (link) => /^https?:\/\//.test(link),
        attrs: {
          target: "_blank",
          rel: "noopener",
          class: "link-external",
        },
      });
      md.use(markdownItCsc, {
        placeLocalMedia: ({ meta_src, alt, width, height, title }) =>
          this.placeLocalMedia({
            meta_src,
            source_medias,
            alt,
            width,
            height,
            title,
          }),
        transformURL: (url) => this.transformURL(url),
      });
      md.use(markdownItBracketedSpans);
      md.use(markdownItAttrs, {
        // optional, these are default options
        leftDelimiter: "{",
        rightDelimiter: "}",
        allowedAttributes: [], // empty array = all attributes are allowed
      });

      const result = md.render(content);
      return result;
    },
    parseGallery(source_medias) {
      if (!source_medias || source_medias.length === 0)
        return `<div class="gallery"><i>${this.$t(
          "no_media_selected"
        )}</i></div>`;

      const medias = source_medias
        .map((media) => {
          return this.getSourceMedia({
            source_media: media,
            folder_path: this.publication.$path,
          });
        })
        .filter(Boolean);

      let html = `<div class="gallery"><div class="gallery-content" data-number-of-medias="${medias.length}" >`;

      medias.forEach((media) => {
        html += `<figure class="media gallery--item">
          <img src="${this.makeMediaFileURL({
            $path: media.$path,
            $media_filename: media.$media_filename,
          })}" />
        </figure>`;
      });

      html += "</div></div>";

      return html;
    },
    parseStory(chapter) {
      const modules = this.getModulesForSection({
        publication: this.publication,
        section: chapter,
      }).map(({ _module }) => _module);

      let html = "<p>// TODO</p>";

      modules.forEach((module) => {
        html += `<p class="module">
          <div class="module-type">${
            this.$t("type") + " " + module.module_type
          }</div>
        </p>`;
        //           <div class="module-content">${JSON.stringify(module, null, 4)}</div>
      });

      return html;
    },

    getMediaSrc(meta_src, source_medias) {
      if (!meta_src) return;

      let source_media;

      if (meta_src.startsWith("./")) {
        meta_src = meta_src.substring(2);
        source_media = {
          meta_filename: meta_src,
        };
      } else if (meta_src.startsWith("../")) {
        meta_src = meta_src.substring(3);
        source_media = {
          meta_filename_in_project: meta_src,
        };
      } else {
        source_media = {
          meta_filename_in_project: meta_src,
        };
      }

      let media = this.getSourceMedia({
        source_media,
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

      return media;
    },
    placeLocalMedia({ meta_src, source_medias, alt, width, height, title }) {
      let media_html = "";
      let is_qr_code = false;
      let custom_classes = ["media"];

      // Handle special title attributes for styling and dimensions
      if (title?.startsWith("=")) {
        if (title.startsWith("=full-page")) {
          if (this.view_mode === "book") {
            custom_classes.push("_isFullPage");
            if (title.startsWith("=full-page-cover")) {
              custom_classes.push("_isFullPageCover");
            }
          }
        } else {
          [width, height] = title
            .slice(1)
            .split("x")
            .map((v) => v.trim())
            .filter(Boolean);
        }
      }

      const media = this.getMediaSrc(meta_src, source_medias);
      if (!media)
        return {
          html: `<figure class="${custom_classes.join(
            " "
          )}"><i>Media not found</i></figure>`,
          is_qr_code: false,
        };

      const src = this.makeMediaFileURL({
        $path: media.$path,
        $media_filename: media.$media_filename,
      });

      if (!width && !height) {
        width = media.$infos.width;
        height = media.$infos.height;
      }

      if (media.$type === "image") {
        media_html = `
                  <img src="${src}"
                    alt="${alt}"
                    ${width ? ` width="${width}"` : ""}
                    ${height ? ` height="${height}"` : ""}
                  />
                `;
      } else {
        if (this.view_mode === "book") {
          is_qr_code = true;
          custom_classes.push("_isqrcode");
          media_html = this.makeQREmbedForQR({
            alt,
            width,
            height,
            media,
          });
        } else {
          if (media.$type === "video") {
            media_html = `
              <video src="${src}" controls
                alt="${alt}"
                ${width ? ` width="${width}"` : ""}
                ${height ? ` height="${height}"` : ""}
              />
            `;
          } else if (media.$type === "audio") {
            media_html = `
              <audio src="${src}" controls
                alt="${alt}"
                ${width ? ` width="${width}"` : ""}
                ${height ? ` height="${height}"` : ""}
              />
            `;
          }
        }
      }

      // Add caption if alt text is provided
      if (alt) {
        media_html += `<figcaption class="mediaCaption"><span>${alt}</span></figcaption>`;
      }

      const html = `<figure class="${custom_classes.join(
        " "
      )}">${media_html}</figure>`;

      return { html, is_qr_code };
    },
    makeQREmbedForQR({ alt, width, height, media }) {
      const url =
        window.location.origin + "/_previewmedia?path_to_meta=" + media.$path;

      const code = generate(url);
      const dataUrl = code.toDataURL({ scale: 10 });

      let html = `
              <a href="${url}" target="_blank" data-url="url">
                <img class="_qrCode" src="${dataUrl}" alt="QR code for media" />
              </a>
            `;

      // html += `<div class="_mediaFilename">${media.$media_filename}</div> `;
      html += `<div class="mediaInfos">`;

      if (media.$infos.duration) {
        html += `<div class="mediaDuration">
                ${this.$t(media.$type)}
                ${this.formatDurationToHoursMinutesSeconds(
                  media.$infos.duration
                )}
              </div>`;
      }

      html += `
              <div class="mediaSourceCaption">
                ${media.caption || ""}
              </div>
              <div class="mediaSourceCredits">
                ${media.$credits || ""}
              </div>`;

      html += `</div>`;

      const small_thumb = this.getFirstThumbURLForMedia({
        file: media,
        resolution: 220,
      });

      if (small_thumb) {
        html += `
              <div class="_thumbnail">
                <img src="${small_thumb}"
                  alt="${alt}"
                  ${width ? ` width="${width}"` : ""}
                  ${height ? ` height="${height}"` : ""}
                >
              </div>`;
      }
      return html;
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
  padding: calc(var(--spacing) / 2);
  pointer-events: none;

  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  ._viewMode--buttons {
    display: flex;
    flex-flow: row nowrap;
    justify-content: center;
    align-items: center;
    gap: calc(var(--spacing) / 2);
  }

  select {
    width: 18ch;
  }

  * {
    pointer-events: all;
  }

  ::v-deep {
    ._toggleHTML {
      ._label {
        color: white;
      }
    }
  }

  @media print {
    display: none;
  }
}

._toggleHTML {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  background-color: var(--c-gris_clair);
  margin: calc(var(--spacing) / 1);
  border-radius: var(--border-radius);

  ::v-deep {
    > * {
      padding: calc(var(--spacing) / 2);
      background-color: var(--c-gris_fonce);
      border: 2px solid white;
      border-radius: var(--border-radius);
    }
    ._label {
      color: white;
    }
  }
}
</style>
