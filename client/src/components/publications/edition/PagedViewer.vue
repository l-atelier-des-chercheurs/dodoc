<template>
  <div
    class="_pagedViewer edition book"
    :class="{
      'is--infiniteViewer': viewer_type === 'infinite-viewer',
      'is--editable': can_edit,
    }"
  >
    <component :is="'style'" v-html="highlight_opened_pages" />
    <div ref="bookrender" style="opacity: 0; pointer-events: none" />
    <div
      v-if="viewer_type === 'infinite-viewer'"
      ref="infiniteviewer"
      class="_infiniteViewer"
    >
      <div class="" ref="bookpreview" />
    </div>
    <template v-else>
      <div ref="bookpreview" />
    </template>
    <LoaderSpinner v-if="is_loading" />
    <ShowSourceHTML
      v-if="show_source_html"
      :content_html="content_html"
      :opened_chapter_meta_filename="opened_chapter_meta_filename"
    />
  </div>
</template>
<script>
import InfiniteViewer from "infinite-viewer";
import { Handler, Previewer } from "pagedjs";

export default {
  props: {
    content_nodes: {
      type: Object,
      required: true,
    },
    format_mode: {
      type: String,
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
    show_source_html: Boolean,
    can_edit: Boolean,
    opened_chapter_meta_filename: String,
  },
  components: {
    InfiniteViewer,
    ShowSourceHTML: () =>
      import("@/components/publications/edition/ShowSourceHTML.vue"),
  },
  data() {
    return {
      is_loading: true,
      infiniteviewer: null,
      is_generating_book: false,
    };
  },
  created() {},
  async mounted() {
    await this.generateBook();

    if (this.$refs.infiniteviewer) {
      this.infiniteviewer = new InfiniteViewer(
        this.$refs.infiniteviewer,
        this.$refs.bookpreview,
        {
          useMouseDrag: true,
          useWheelScroll: true,
          useAutoZoom: true,

          margin: 0,
          zoomRange: [0.4, 10],
          maxPinchWheel: 10,
          displayVerticalScroll: true,
          displayHorizontalScroll: true,
        }
      );

      this.$nextTick(() => {
        if (this.opened_chapter_meta_filename)
          this.zoomToSection(this.opened_chapter_meta_filename);
        else {
          this.infiniteviewer.setZoom(0.6);
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
    async format_mode() {
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
    content_html() {
      const nodes = this.content_nodes;

      // if (this.opened_chapter) {
      //   delete nodes.chapters
      //   nodes.chapters = [this.opened_chapter];
      // }

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
        html += `
          <!-- ${chapter.title} -->`;
        html += `<section class="chapter"
          data-starts-on-page="${chapter.starts_on_page}"
          data-column-count="${chapter.column_count}"
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
          html += `<div class="chapterContent">${chapter.content}</div>`;
        html += `</section>`;
      });

      html += ``;

      return html;
    },
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

        const bookrender = this.$refs.bookrender;
        if (!bookrender) {
          console.log("no bookrender div");
          return;
        }

        let paged = new Previewer();

        let pagedjs_html = this.content_html;
        if (pagedjs_html.length == 0) pagedjs_html = `<div></div>`;

        let pagedjs_styles = `
        @page {
          size: ${this.format_mode};
        }
      `;
        // --paged-layout: booklet;
        pagedjs_styles += this.css_styles;
        pagedjs_styles += `.makertoidentfyendofcustomcss{}`;

        const theme_styles = [
          {
            pagedjs_styles,
          },
        ];

        paged.preview(pagedjs_html, theme_styles, bookrender).then((flow) => {
          bookrender.innerHTML = "";
          const bookpreview = this.$refs.bookpreview;
          bookpreview.innerHTML = "";
          const pagesOutput = flow.pagesArea;
          bookpreview.appendChild(pagesOutput);

          // const custom_styles_el = document.querySelectorAll(
          //   "[data-pagedjs-inserted-styles]"
          // )[1];
          // const [custom_css, paged_css] = custom_styles_el.innerHTML.split(
          //   ".makertoidentfyendofcustomcss{}"
          // );

          // const wrap_custom_styles = `
          //   ._pagedViewer {
          //     ${custom_css}
          //   }
          // `;
          // custom_styles_el.innerHTML = wrap_custom_styles + paged_css;

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
    beforePrint() {
      // this.impositionPage();
    },
    impositionPage() {
      // from https://gitlab.coko.foundation/pagedjs/pagedjs-plugins/booklet-imposition/-/blob/master/imposition.js?ref_type=heads

      const bookpreview = this.$refs.bookpreview;
      const all_pages = document.querySelectorAll(".pagedjs_page");
      const pageStart = 1;
      const pageEnd = all_pages.length;
      let format = all_pages[0];

      const getCSSCustomProp = (
        propKey,
        element = document.documentElement,
        castAs = "string"
      ) => {
        let response = getComputedStyle(element).getPropertyValue(propKey);

        // Tidy up the string if there's something to work with
        if (response.length) {
          response = response.replace(/\'|"/g, "").trim();
        }

        // Convert the response into a whatever type we wanted
        switch (castAs) {
          case "number":
          case "int":
            return parseInt(response, 10);
          case "float":
            return parseFloat(response, 10);
          case "boolean":
          case "bool":
            return response === "true" || response === "1";
        }

        // Return the string response by default
        return response;
      };

      /* Width of page without bleed, extract the first number of calc() function */
      let width = getCSSCustomProp("--pagedjs-width", format);
      let numbers = width.match(/[0-9]+/g).map(function (n) {
        return +n;
      });
      width = parseInt(numbers[0]);

      /* Height of page with bleed, addition of all the numbers of calc() function*/
      let height = getCSSCustomProp("--pagedjs-height", format);
      numbers = height.match(/[0-9]+/g).map(function (n) {
        return +n;
      });
      const reducer = (previousValue, currentValue) =>
        previousValue + currentValue;
      height = numbers.reduce(reducer);

      /* Bleed of the page */
      let bleed = getCSSCustomProp("--pagedjs-bleed-top", format);
      let bleedNum = parseInt(bleed);

      /* Spread and half-spread*/
      let spread = width * 2 + bleedNum * 2;

      let spreadHalf = width + bleedNum;

      // Add CSS to have pages in spread
      //
      // - change size of the page when printing (actually, sheet size)
      // - flex properties
      // - delete bleeds inside spread */

      var newSize = `
      @media print{
        @page{
          size:  ${spread}mm ${height}mm;
        }
        .pagedjs_pages {
          width: auto;
        }
      }
      @media screen{
        .pagedjs_pages{
          max-width: calc(var(--pagedjs-width) * 2);
        }
      }
      .pagedjs_pages {
        display: flex !important;
        flex-wrap: wrap;
        transform: none !important;
        height: 100% !important;
        min-height: 100%;
        max-height: 100%;
        overflow: visible;
      }

      .pagedjs_page {
        margin: 0;
        padding: 0;
        max-height: 100%;
        min-height: 100%;
        height: 100% !important;
      }

      .pagedjs_sheet {
        margin: 0;
        padding: 0;
        max-height: 100%;
        min-height: 100%;
        height: 100% !important;
      }
      body{
        --pagedjs-bleed-right-left: 0mm;
      }
      .pagedjs_left_page{
        z-index: 20;
        width: calc(var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width))!important;
      }

      .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop {
        border-color: transparent;
      }

      .pagedjs_right_page,
      .pagedjs_right_page .pagedjs_sheet{
        width: calc(var(--pagedjs-bleed-right-right) + var(--pagedjs-pagebox-width))!important;
      }

      .pagedjs_right_page .pagedjs_sheet{
        grid-template-columns: [bleed-left] var(--pagedjs-bleed-right-left) [sheet-center] 1fr [bleed-right] var(--pagedjs-bleed-right-right);
      }
      .pagedjs_right_page .pagedjs_bleed-left{
        display: none;
      }

      .pagedjs_right_page .pagedjs_bleed-top .pagedjs_marks-crop:nth-child(1),
      .pagedjs_right_page .pagedjs_bleed-bottom .pagedjs_marks-crop:nth-child(1){
        width: 0!important;
      }
      .pagedjs_first_page {
              margin-left: 0;
      }
      body{
          margin: 0
      }
      .pagedjs_page:nth-of-type(even){
        break-after: always;
      }
      .pagedjs_page,
      .pagedjs_sheet{
        width: ${spreadHalf - 0.1}mm!important;
      }

`;

      // Add style for the arrangement of the pages

      let style = document.createElement("style");
      style.setAttribute("data-pagedjs-inserted-styles", true);
      style.textContent = newSize;
      document.head.appendChild(style);

      var number_of_pages = all_pages.length;
      var pages_array = [];

      // If the page count isn't a multiple of 4, we need to pad the array with blank
      // pages so we have the correct number of pages for a booklet.
      //
      // ex. [1, 2, 3, 4, 5, 6, 7, 8, 9, blank, blank, blank]

      let modulo = number_of_pages % 4;
      let additional_pages = 0;
      if (modulo != 0) {
        additional_pages = 4 - modulo;
      }

      for (i = 0; i < additional_pages; i++) {
        let added_page = document.createElement("div");
        added_page.classList.add("pagedjs_page", "added");
        added_page.id = `page-${pageEnd + i + 1}`;
        bookpreview.querySelector(".pagedjs_pages").appendChild(added_page);
      }

      // Push each page in the array

      for (var i = number_of_pages + additional_pages; i >= 1; i--) {
        pages_array.push(i);
      }

      // Split the array in half
      //
      // ex. [1, 2, 3, 4, 5, 6], [7, 8, 9, blank, blank, blank]

      var split_start = pages_array.length / 2;

      var split_end = pages_array.length;

      var first_array = pages_array.slice(0, split_start);
      var second_array = pages_array.slice(split_start, split_end);

      // Reverse the second half of the array. This is the beginning of the back half
      // of the booklet (from the center fold, back to the outside last page)
      //
      // ex. [blank, blank, blank, 9, 8, 7]

      var second_array_reversed = second_array.reverse();

      // Zip the two arrays together in groups of 2 These will end up being each '2-up
      // side' of the final document So, the sub-array at index zero will be the first
      // side of physical page one and index 1 will be the back side. However, they
      // won't yet be in the proper order.
      //
      // ex. [[1, blank], [2, blank], [3, blank], [4, 9], [5, 8], [6, 7]]

      var page_groups = [];
      for (var i = 0; i < first_array.length; i++) {
        page_groups[i] = [first_array[i], second_array_reversed[i]];
      }

      // We need to reverse every other sub-array starting with the first side. This
      // is the final step of aligning our booklet pages in the order with which the
      // booklet gets printed and bound.
      //
      // ex. [[blank, 1], [2, blank], [blank, 3], [4, 9], [8, 5], [6, 7]] final_groups
      // = page_groups.each_with_index { |group, index| group.reverse! if (index %
      // 2).zero? }
      var final_groups = [];
      for (var i = 0; i < page_groups.length; i++) {
        var group = page_groups[i];
        if (i % 2 != 0) {
          final_groups[i] = page_groups[i].reverse();
        } else {
          final_groups[i] = page_groups[i];
        }
      }

      var final_flat = final_groups.flat();
      final_flat.forEach((folio, i) => {
        folio = folio;
        document.querySelector(`#page-${folio}`).style.order = i;
      });
    },
    async waitForBookGeneration() {
      while (this.is_generating_book) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
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
      const pages_container = this.$refs.bookpreview;
      const container_scrollLeft = pages_container.getBoundingClientRect().left;
      const container_scrollTop = pages_container.getBoundingClientRect().top;

      const page_scrollLeft = page.getBoundingClientRect().left;
      const page_scrollTop = page.getBoundingClientRect().top;
      console.log("-");
      console.log(container_scrollLeft, container_scrollTop);
      console.log(page_scrollLeft, page_scrollTop);

      const padding = 200;
      this.infiniteviewer.scrollTo(
        page_scrollLeft - container_scrollLeft - padding,
        page_scrollTop - container_scrollTop - padding,
        {
          duration: 1000,
          absolute: true,
        }
      );
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
  ._infiniteViewer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: move;
  }

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

    /* Show grid structure in edit mode */
    @media screen {
      .is--editable & {
        /* Show grid lines on the grid container */
        .grid-content {
          /* Create a visual grid pattern using borders and shadows on each cell */
          // background: transparent;
          // position: relative;
        }

        /* Add visible border to each grid cell */
        .grid-cell {
          outline: 2px solid var(--color-pageBox);
          outline-offset: -1px;
          background-color: rgba(
            238,
            130,
            238,
            0.05
          ); /* light violet background */
          min-height: 30px; /* ensure even empty cells are visible */
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

        margin-top: 10mm;
        transition: opacity 0.3s cubic-bezier(0.19, 1, 0.22, 1);
      }
      .pagedjs_page_content {
        box-shadow: 0 0 0 1px var(--color-pageContent);
        /* Remove margin from .pagedjs_page if it contains a grid chapter */
        &:has(.chapter[data-chapter-type="grid"]) {
          box-shadow: none !important;
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
