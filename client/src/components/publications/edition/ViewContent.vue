<template>
  <div class="_viewContent">
    <!-- <pre>{{ css_styles }}</pre> -->
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
        :viewer_type="viewer_type"
        :css_styles="css_styles"
        :content_html="content_html"
        :opened_chapter_meta_filename="opened_chapter_meta_filename"
        :can_edit="can_edit"
        @openChapter="$emit('openChapter', $event)"
        @updateChaptersPositions="$emit('updateChaptersPositions', $event)"
        @updateNumberOfBookPages="updateNumberOfBookPages"
      />
      <DocViewer
        v-else
        :content_nodes="content_nodes"
        :css_styles="css_styles"
        :opened_chapter_meta_filename="opened_chapter_meta_filename"
        @openChapter="$emit('openChapter', $event)"
      />
    </div>
    <ShowSourceHTML
      v-if="show_source_html"
      :content_html="content_html"
      :css_styles="css_styles"
      :opened_chapter_meta_filename="opened_chapter_meta_filename"
    />
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
import DOMPurify from "dompurify";

import { generate } from "lean-qr";
import { renderMedia as renderMediaFunction } from "@/components/publications/edition/renderMedia.js";

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
    ShowSourceHTML: () =>
      import("@/components/publications/edition/ShowSourceHTML.vue"),
  },
  data() {
    return {
      is_loading: false,
      available_view_modes: [
        {
          label: this.$t("webpage"),
          value: "web",
          icon: "window-sidebar",
        },
        {
          label: this.$t("book"),
          value: "book",
          icon: "book",
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
      debugger;
      if (
        this.opened_style_file_meta === "default" ||
        this.style_files?.length === 0
      ) {
        return default_styles;
      } else if (
        !this.opened_style_file_meta ||
        this.opened_style_file_meta === "first"
      ) {
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
        } else if (chapter.section_type === "grid") {
          _chapter.content = this.parseGrid(chapter);
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
      let css_styles = [];

      css_styles.push(
        `/****************** paged.js engine styles (added by do•doc) ******************/\n` +
          pagedengine
      );

      css_styles.push(
        `/****************** page size ${this.format_mode} ******************/\n` +
          `@page {
          size: ${this.format_mode};
        }`
      );

      css_styles.push(
        `/****************** custom styles ${
          this.opened_style_file_meta || "default"
        } ******************/\n` + (this.custom_styles_unnested || "")
      );

      return css_styles.join("\n\n");
    },
    content_html() {
      const nodes = this.content_nodes;

      let html = "";

      if (nodes.cover) {
        html = `<!-- ${this.$t("cover")} -->`;
        html += `<section class="cover" id="cover" data-layout-mode="${nodes.cover.layout_mode}">`;
        if (nodes.cover.title)
          html += `<hgroup class="coverTitle">${nodes.cover.title}</hgroup>`;
        if (nodes.cover.image_url)
          html += `<div class="coverImage"><img src="${nodes.cover.image_url}" /></div>`;
        html += `</section>\n\n`;
      }

      nodes.chapters.forEach((chapter) => {
        let starts_on_page = chapter.starts_on_page;
        if (
          !starts_on_page &&
          (chapter.section_type === "gallery" ||
            chapter.section_type === "grid")
        ) {
          starts_on_page = "page";
        }

        html += `
          <!-- ${chapter.title} -->`;
        html += `<section class="chapter"
          data-starts-on-page="${starts_on_page}"
          data-chapter-meta-filename="${chapter.meta_filename}"
          data-chapter-title="${chapter.title}"
          data-chapter-type="${chapter.section_type}"
        >`;
        if (
          chapter.title &&
          chapter.section_type !== "gallery" &&
          chapter.section_type !== "grid"
        )
          html += `<h1 class="chapterTitle">${chapter.title}</h1>`;
        if (chapter.content)
          html += `
        <div class="chapterContent${
          chapter.section_type === "grid" ? " grid" : ""
        }"
          style="--column-count: ${chapter.column_count};"
        >${chapter.content}</div>`;
        html += `</section>`;
      });

      html += ``;

      return html;
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

    parseMarkdownWithMarkedownIt(content, source_medias) {
      const md = markdownit({
        breaks: true,
        linkify: true,
        typographer: true,
        html: true,
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
          // Use the renderMedia method to handle the image
          const { html } = this.renderMedia({
            meta_src: src,
            source_medias,
            alt,
            title,
          });
          return html;
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
        renderMedia: ({ meta_src, alt, width, height, title, size, tag }) =>
          this.renderMedia({
            meta_src,
            source_medias,
            alt,
            width,
            height,
            title,
            size,
            tag,
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
      // Allow iframes for PDFs and other embedded content
      const sanitized_result = DOMPurify.sanitize(result, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: [
          "src",
          "frameborder",
          "type",
          "style",
          "width",
          "height",
          "allowfullscreen",
          "allow",
        ],
      });

      return sanitized_result;
    },
    parseGallery(source_medias) {
      if (!source_medias || source_medias.length === 0)
        return `<div class="gallery"><i>${this.$t(
          "no_media_selected"
        )}</i></div>`;

      const medias = source_medias
        .map((source_media) => {
          return this.getSourceMedia({
            source_media,
            folder_path: this.publication.$path,
          });
        })
        .filter(Boolean);

      let html = `<div class="gallery"><div class="gallery-content" data-number-of-medias="${medias.length}" >`;

      medias.forEach((media) => {
        if (media?.$status === "missing") {
          html += `<figure class="media gallery--item media-missing"><i>${this.$t(
            "source_media_missing"
          )}</i></figure>`;
          return;
        }
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
      const pmodules = this.getModulesForSection({
        publication: this.publication,
        section: chapter,
      }).map(({ _module }) => _module);

      let md_string = "";

      pmodules.forEach((pmodule) => {
        // parse source medias
        const source_medias = pmodule.source_medias;

        const medias = source_medias
          .map((media) => {
            return this.getSourceMedia({
              source_media: media,
              folder_path: this.publication.$path,
            });
          })
          .filter(Boolean);

        medias.forEach((media) => {
          const meta_filename = this.getFilename(media.$path);

          if (media.$type === "text") {
            // SOUCIS : le HTML n'est pas géré ni dans quill ni dans markdownIt. Donc ça rends du texte brut.
            md_string += media.$content;
          } else if (media.$type === "image") {
            md_string += `(image: ${meta_filename})`;
          } else if (media.$type === "video") {
            md_string += `(video: ${meta_filename})`;
          } else if (media.$type === "audio") {
            md_string += `(audio: ${meta_filename})`;
          } else if (media.$type === "pdf") {
            md_string += `(pdf: ${meta_filename})`;
          } else if (media.$type === "embed") {
            md_string += `(embed: ${meta_filename})`;
          }
        });

        md_string += "\n\n";
      });

      const html = this.parseMarkdownWithMarkedownIt(
        md_string,
        chapter.source_medias
      );

      return html;
    },

    parseGrid(chapter) {
      if (!chapter.grid_areas || chapter.grid_areas.length === 0)
        return `<div class="grid"><i>${this.$t("no_areas_defined")}</i></div>`;

      // Use row_count and column_count from chapter
      const col_count = chapter.column_count || 6;
      const row_count = chapter.row_count || 6;

      let html = document.createElement("div");
      html.className = "grid";
      let grid_content = document.createElement("div");
      grid_content.className = "grid-content";
      grid_content.style.setProperty("--col-count", col_count);
      grid_content.style.setProperty("--row-count", row_count);

      const grid_areas = chapter.grid_areas;

      grid_areas.forEach((area) => {
        let media;
        const objectFit = area?.objectFit || "cover";
        const objectPosition = area?.objectPosition || "center";

        const source_media = area?.source_medias?.[0];
        if (source_media) {
          media = this.getSourceMedia({
            source_media,
            folder_path: this.publication.$path,
          });
        }

        if (!media && source_media) {
          // try to find in chapter source_medias
          const local_media = chapter?.source_medias?.find(
            (sm) =>
              sm?.meta_filename_in_project ===
              source_media?.meta_filename_in_project
          );
          if (local_media) media = local_media._media;
        }

        let cell = document.createElement("div");
        cell.className = "grid-cell";

        // Parse ID to get letter part and number part
        const match = area.id.match(/^([A-Z]+)(\d*)$/);
        const cell_id = match ? match[1] : area.id;
        const chain_index = match && match[2] ? parseInt(match[2]) : 0;

        cell.setAttribute("data-grid-area-id", cell_id);

        if (media && media.$type) {
          cell.setAttribute("data-grid-area-type", media.$type);
        }

        // check if the cell is part of a chain
        const is_part_of_chain =
          grid_areas.filter((a) => {
            const m = a.id.match(/^([A-Z]+)(\d*)$/);
            return m && m[1] === cell_id;
          }).length > 1;

        if (is_part_of_chain) {
          cell.setAttribute("data-grid-area-is-chain-index", chain_index);
        }
        cell.style.gridColumnStart = area.column_start;
        cell.style.gridColumnEnd = area.column_end;
        cell.style.gridRowStart = area.row_start;
        cell.style.gridRowEnd = area.row_end;

        if (media?.$type === "text") {
          const content = media.$content || "";
          const text = this.parseMarkdownWithMarkedownIt(
            content,
            media.source_medias
          );
          cell.innerHTML = text;
        } else if (media?.$status === "missing") {
          cell.innerHTML = `<div class="u-instructions">${this.$t(
            "source_media_missing"
          )}</div>`;
        } else if (media?.$type === "image") {
          const img = document.createElement("img");
          img.src = this.makeMediaFileURL({
            $path: media.$path,
            $media_filename: media.$media_filename,
          });
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = objectFit;
          img.style.objectPosition = objectPosition;
          cell.appendChild(document.createTextNode("\n"));
          cell.appendChild(img);
        } else if (media?.$type === "video") {
        } else {
        }

        grid_content.appendChild(cell);
      });
      html.appendChild(grid_content);

      return html.innerHTML;
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
    renderMedia({
      media,
      meta_src,
      source_medias,
      alt,
      width,
      height,
      title,
      size,
      tag,
    }) {
      return renderMediaFunction({
        media,
        meta_src,
        source_medias,
        alt,
        width,
        height,
        title,
        size,
        tag,
        context: {
          view_mode: this.view_mode,
          getMediaSrc: this.getMediaSrc.bind(this),
          makeMediaFileURL: this.makeMediaFileURL.bind(this),
          makeQREmbedForQR: this.makeQREmbedForQR.bind(this),
          makeQREmbedForExternalURL: this.makeQREmbedForExternalURL.bind(this),
          getMissingMediaNoticeText: () => this.$t("source_media_missing"),
        },
      });
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
      } else if (media.$type === "pdf") {
        // Show PDF name for PDFs
        const pdf_name = media.title || media.$media_filename || this.$t("pdf");
        html += `<div class="mediaDuration">
                ${pdf_name}
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
    makeQREmbedForExternalURL({ url, alt, width, height }) {
      const code = generate(url);
      const data_url = code.toDataURL({ scale: 10 });

      let html = `
        <a href="${url}" target="_blank" rel="noopener" data-url="url">
          <img class="_qrCode" src="${data_url}" alt="QR code for link" />
        </a>
      `;
      html += `<div class="mediaInfos">`;
      html += `<div class="mediaDuration">${url}</div>`;
      html += `<div class="mediaSourceCaption">${alt || ""}</div>`;
      html += `</div>`;
      return html;
    },
    async updateNumberOfBookPages(number_of_book_pages) {
      if (
        this.publication.number_of_book_pages === number_of_book_pages ||
        !this.can_edit
      )
        return;
      await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          number_of_book_pages,
        },
      });
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
  margin: calc(var(--spacing) / 2);
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
