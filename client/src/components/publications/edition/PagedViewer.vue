<template>
  <div
    class="_pagedViewer edition book"
    :class="{
      'is--infiniteViewer': viewer_type === 'infinite-viewer',
      'is--editable': can_edit,
    }"
  >
    <component :is="'style'" v-html="highlight_opened_pages" />
    <div
      class=""
      ref="bookrender"
      style="
        position: absolute;
        top: 0;
        left: -200vw;
        pointer-events: none;
        opacity: 0;
      "
    />
    <PanZoom3
      v-if="viewer_type === 'infinite-viewer'"
      ref="panzoom3"
      :zoom="current_zoom"
      :layout_mode="'print'"
      @scroll-end="onScrollEnd"
    >
      <div class="" ref="bookpreview" />
    </PanZoom3>
    <template v-else>
      <div ref="bookpreview" />
    </template>
    <LoaderSpinner v-if="is_loading" />
  </div>
</template>
<script>
import { Handler, Previewer } from "pagedjs";
import { PagedjsFlowHandler } from "./PagedjsFlowHandler.js";
import PanZoom3 from "@/components/publications/page_by_page/PanZoom3.vue";

export default {
  props: {
    content_nodes: {
      type: Object,
      required: true,
    },
    viewer_type: {
      type: String,
      required: true,
    },
    css_styles: {
      type: String,
      required: true,
    },
    content_html: {
      type: String,
      required: true,
    },
    can_edit: Boolean,
    opened_chapter_meta_filename: String,
  },
  components: {
    PanZoom3,
  },
  data() {
    return {
      is_loading: true,
      is_generating_book: false,
      current_zoom: 0.6,
    };
  },
  created() {},
  async mounted() {
    await this.generateBook();

    if (this.viewer_type === "infinite-viewer" && this.$refs.panzoom3) {
      this.$nextTick(() => {
        if (this.opened_chapter_meta_filename)
          this.zoomToSection(this.opened_chapter_meta_filename);
        else {
          this.current_zoom = 0.6;
          this.$nextTick(() => {
            this.zoomToSection("first page");
          });
        }
      });
    }
    this.$eventHub.$on("edition.zoomToSection", this.zoomToSection);
    window.addEventListener("beforeprint", this.beforePrint);
  },
  beforeDestroy() {
    this.removeExistingStyles();
    this.$eventHub.$off("edition.zoomToSection", this.zoomToSection);
    window.removeEventListener("beforeprint", this.beforePrint);
  },
  watch: {
    async content_html() {
      await this.generateBook();
    },
    async css_styles() {
      await this.generateBook();
    },
    opened_chapter_meta_filename() {
      this.zoomToSection(this.opened_chapter_meta_filename);
    },
  },
  computed: {
    pages_to_show() {
      const pages_to_display = this.$route.query?.page;
      if (pages_to_display && pages_to_display.includes("-")) {
        const [start, end] = pages_to_display.split("-");
        return {
          start: +start,
          end: +end,
        };
      } else if (pages_to_display && !pages_to_display.includes("-")) {
        return +pages_to_display;
      }
      return false;
    },
    highlight_opened_pages() {
      if (this.can_edit && this.opened_chapter_meta_filename) {
        return `
        .pagedjs_page:not(:hover):not(:has([data-chapter-meta-filename="${this.opened_chapter_meta_filename}"]))
        {
          opacity: .7 !important;
        }
        .pagedjs_page:hover:not(:has([data-chapter-meta-filename="${this.opened_chapter_meta_filename}"]))
        {
          opacity: .85 !important;
        }
        .chapter.clickable[data-chapter-meta-filename="${this.opened_chapter_meta_filename}"] {
          cursor: default !important;
        }
      `;
      }
      return "";
    },
  },
  methods: {
    async generateBook() {
      await new Promise((resolve) => {
        console.log("generateBook");

        this.is_generating_book = true;

        this.removeExistingStyles();

        const bookpreview = this.$refs.bookpreview;
        if (!bookpreview) {
          console.log("no bookpreview div");
          return;
        }

        let paged = new Previewer();

        let pagedjs_html = this.content_html;
        if (pagedjs_html.length == 0) pagedjs_html = `<div></div>`;

        const theme_styles = [
          {
            pagedjs_styles: this.css_styles,
          },
        ];

        const bookrender = this.$refs.bookrender;

        // Register the Flow Handler
        paged.registerHandlers(PagedjsFlowHandler);

        paged.preview(pagedjs_html, theme_styles, bookrender).then((flow) => {
          bookpreview.innerHTML = "";
          bookpreview.appendChild(flow.pagesArea);
          bookrender.innerHTML = "";

          this.$nextTick(() => {
            this.showOnlyPages();
            if (this.can_edit) {
              this.addChapterShortcuts();
              this.reportChapterPositions();
            }
            setTimeout(() => {
              this.is_loading = false;
              this.is_generating_book = false;
              resolve();
            }, 100);
          });
        });
      });
    },
    addChapterShortcuts() {
      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview) return;
      const chapters = bookpreview.querySelectorAll(
        ".chapter[data-chapter-meta-filename]"
      );
      chapters.forEach((chapter) => {
        const btn = document.createElement("button");
        btn.classList.add("editChapterBtn");
        btn.textContent = chapter.getAttribute("data-chapter-title");
        chapter.appendChild(btn);
        chapter.classList.add("clickable");
        chapter.addEventListener("click", () => {
          // only if not active
          if (
            chapter.getAttribute("data-chapter-meta-filename") ===
            this.opened_chapter_meta_filename
          )
            return;
          this.$emit(
            "openChapter",
            chapter.getAttribute("data-chapter-meta-filename")
          );
        });
      });
    },
    removeExistingStyles() {
      document
        .querySelectorAll("style[data-pagedjs-inserted-styles]")
        .forEach((styleElement) => {
          styleElement.parentNode.removeChild(styleElement);
        });
    },
    showOnlyPages() {
      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview || !this.pages_to_show) return;
      const pages = bookpreview.querySelectorAll(".pagedjs_page");

      /* Reset page counter */
      let reset = parseInt(this.pages_to_show.start) - 1;
      let containerPages = document.querySelector(".pagedjs_pages");
      containerPages.style.counterReset = "page " + reset;

      if (this.pages_to_show.start && this.pages_to_show.end) {
        pages.forEach((page, index) => {
          if (
            index + 1 >= this.pages_to_show.start &&
            index + 1 <= this.pages_to_show.end
          ) {
            page.style.display = "block";
          } else {
            page.style.display = "none";
          }
        });
      } else {
        pages.forEach((page, index) => {
          if (index + 1 === this.pages_to_show) {
            page.style.display = "block";
          } else {
            page.style.display = "none";
          }
        });
      }
    },
    reportChapterPositions() {
      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview) return;

      const total_number_of_pages =
        bookpreview.querySelectorAll(".pagedjs_page").length;
      const pages_with_chapters = bookpreview.querySelectorAll(
        ".chapter[data-chapter-meta-filename]"
      );

      // list for each page the chapter it belongs to
      const pages_with_chapters_list = [];
      pages_with_chapters.forEach((page) => {
        const chapter_meta_filename = page.getAttribute(
          "data-chapter-meta-filename"
        );
        const number = +page
          .closest(".pagedjs_page")
          .getAttribute("data-page-number");
        pages_with_chapters_list.push({
          number,
          chapter_meta_filename,
        });
      });

      // transform this list to a list of chapters with the start and end page
      const chapters_positions = {};
      pages_with_chapters_list.map((page) => {
        if (!chapters_positions[page.chapter_meta_filename]) {
          chapters_positions[page.chapter_meta_filename] = {
            first_page: page.number,
            last_page: page.number,
          };
        } else {
          chapters_positions[page.chapter_meta_filename].last_page =
            page.number;
        }
      });

      this.$emit("updateChaptersPositions", chapters_positions);
    },
    async waitForBookGeneration() {
      while (this.is_generating_book) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    },
    onScrollEnd({ zoom }) {
      this.current_zoom = zoom;
    },
    async zoomToSection(meta_filename) {
      if (!meta_filename) return;

      if (this.is_generating_book) {
        await this.waitForBookGeneration();
      }

      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview) return;

      let page;

      if (meta_filename === "first page") {
        page = bookpreview.querySelector(".pagedjs_first_page");
      } else {
        page = bookpreview.querySelector(
          `[data-chapter-meta-filename="${meta_filename}"]`
        );
      }

      if (!page) return;

      this.zoomToPage(page);
    },
    zoomToPage(page) {
      if (!this.$refs.panzoom3) return;

      const pages_container = this.$refs.bookpreview;
      const container_scrollLeft = pages_container.getBoundingClientRect().left;
      const container_scrollTop = pages_container.getBoundingClientRect().top;

      const page_scrollLeft = page.getBoundingClientRect().left;
      const page_scrollTop = page.getBoundingClientRect().top;
      console.log("-");
      console.log(container_scrollLeft, container_scrollTop);
      console.log(page_scrollLeft, page_scrollTop);

      const padding = 200;
      this.$refs.panzoom3.scrollTo(
        page_scrollLeft - container_scrollLeft - padding,
        page_scrollTop - container_scrollTop - padding,
        {
          duration: 1000,
          absolute: true,
        }
      );
    },
    beforePrint() {
      // Handler for beforeprint event
      // Can be extended if needed for print-specific behavior
    },
  },
};
</script>
<style lang="scss" scoped>
._pagedViewer {
  position: relative;

  --color-pageSheet: var(--c-gris);
  --color-pageBox: violet;
  --color-paper: white;
  --color-marginBox: transparent;
  --pagedjs-crop-color: black;
  --pagedjs-crop-shadow: white;
  --pagedjs-crop-stroke: 1px;

  &.is--infiniteViewer {
    width: 100%;
    height: 100%;
    overflow: auto;
    height: 100%;
    background-color: var(--c-gris_fonce);
  }
  // Panzoom3 handles its own styling through .viewer class

  &.is--editable {
    --color-pageContent: #ff00ff;
  }

  &:not(.is--infiniteViewer) {
    ::v-deep {
      @media screen {
        .pagedjs_pages {
          &::before {
            color: var(--c-gris_fonce);
          }
        }
      }
    }
  }

  ::v-deep {
    .editChapterBtn {
      display: none;
    }

    ._textOverflowWarning {
      display: none;
    }

    /* Show grid structure in edit mode */
    @media screen {
      &.is--editable {
        /* Show grid lines on the grid container */
        /* Add visible border to each grid cell */

        .grid-cell {
          outline: 1px solid var(--color-pageBox);
          // outline-offset: -1px;
          position: relative;

          /* Change outline to red when text overflows */
          &.has--textOverflow {
            outline-width: 2px;
            outline-color: var(--c-rouge);
          }
        }
        .pagedjs_area:has(.chapter[data-chapter-type="text"]) {
          outline: 1px solid var(--color-pageBox);
          // outline-offset: -1px;
        }

        ._textOverflowWarning {
          position: absolute;
          inset: calc(var(--spacing) / 2);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
          pointer-events: none;

          .u-warning {
            background-color: white;
          }
        }
      }
    }

    /* To define how the book look on the screen: */
    @media screen {
      .editChapterBtn {
        display: block !important;
        position: absolute;
        // top: calc(var(--pagedjs-margin-top) / -1);
        // left: calc(var(--pagedjs-margin-left) / -1);
        bottom: 100%;
        left: -1px;
        background-color: var(--color-pageContent);
        font-size: 0.8rem;
        color: white;

        &:hover {
          background-color: var(--c-noir);
        }
      }
      .chapter[data-chapter-type="grid"] .editChapterBtn {
        bottom: auto;
        top: calc(var(--pagedjs-margin-top) * -1);
        left: calc(var(--pagedjs-margin-left) * -1 + var(--spacing));
        background-color: var(--color-pageContent);
        font-size: 0.8rem;
        color: white;

        &:hover {
          background-color: var(--c-noir);
        }
      }

      .chapter.clickable {
        cursor: pointer;

        // &:hover {
        //   .editChapterBtn {
        //     background-color: var(--c-noir);
        //   }
        // }
      }
      .pagedjs_pages {
        display: flex;
        width: calc(var(--pagedjs-width) * 2);
        flex: 0;
        flex-wrap: wrap;
        margin: 0 auto;

        &::before {
          content: "➵";
          position: absolute;
          // width: calc(
          //   var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width)
          // ) !important;
          width: var(--pagedjs-width-left);
          height: var(--pagedjs-height-left);

          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 500%;
          margin-top: 10mm;
          color: white;
          pointer-events: none;
        }
      }

      .pagedjs_page {
        background-color: var(--color-paper);
        margin: 0;
        flex-shrink: 0;
        flex-grow: 0;
        border: 1px solid var(--c-gris);

        margin-top: 10mm;
        transition: opacity 0.3s cubic-bezier(0.19, 1, 0.22, 1);
        // box-shadow: 0 0px 4px rgba(0, 0, 0, 0.5);

        &.pagedjs_right_page:not(.pagedjs_first_page) {
          border-left-width: 0px;
        }
      }

      .pagedjs_first_page {
        margin-left: var(--pagedjs-width);
      }

      .pagedjs_page:last-of-type {
        margin-bottom: 10mm;
      }

      .pagedjs_pagebox {
        box-shadow: 0 0 0 1px var(--color-pageBox);
      }

      .pagedjs_left_page {
        z-index: 20;
        width: calc(
          var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width)
        ) !important;
      }

      .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop {
        border-color: transparent;
      }

      .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-middle {
        width: 0;
      }

      .pagedjs_right_page {
        z-index: 10;
        position: relative;
        left: calc(var(--pagedjs-bleed-left) * -1);
      }

      /* show the margin-box */

      .pagedjs_margin-top-left-corner-holder,
      .pagedjs_margin-top,
      .pagedjs_margin-top-left,
      .pagedjs_margin-top-center,
      .pagedjs_margin-top-right,
      .pagedjs_margin-top-right-corner-holder,
      .pagedjs_margin-bottom-left-corner-holder,
      .pagedjs_margin-bottom,
      .pagedjs_margin-bottom-left,
      .pagedjs_margin-bottom-center,
      .pagedjs_margin-bottom-right,
      .pagedjs_margin-bottom-right-corner-holder,
      .pagedjs_margin-right,
      .pagedjs_margin-right-top,
      .pagedjs_margin-right-middle,
      .pagedjs_margin-right-bottom,
      .pagedjs_margin-left,
      .pagedjs_margin-left-top,
      .pagedjs_margin-left-middle,
      .pagedjs_margin-left-bottom {
        box-shadow: 0 0 0 1px inset var(--color-marginBox);
      }
    }

    /* Marks (to delete when merge in paged.js) */

    .pagedjs_marks-crop {
      z-index: 999999999999;
    }

    .pagedjs_bleed-top .pagedjs_marks-crop,
    .pagedjs_bleed-bottom .pagedjs_marks-crop {
      box-shadow: 1px 0px 0px 0px var(--pagedjs-crop-shadow);
    }

    .pagedjs_bleed-top .pagedjs_marks-crop:last-child,
    .pagedjs_bleed-bottom .pagedjs_marks-crop:last-child {
      box-shadow: -1px 0px 0px 0px var(--pagedjs-crop-shadow);
    }

    .pagedjs_bleed-left .pagedjs_marks-crop,
    .pagedjs_bleed-right .pagedjs_marks-crop {
      box-shadow: 0px 1px 0px 0px var(--pagedjs-crop-shadow);
    }

    .pagedjs_bleed-left .pagedjs_marks-crop:last-child,
    .pagedjs_bleed-right .pagedjs_marks-crop:last-child {
      box-shadow: 0px -1px 0px 0px var(--pagedjs-crop-shadow);
    }
  }
}
</style>
