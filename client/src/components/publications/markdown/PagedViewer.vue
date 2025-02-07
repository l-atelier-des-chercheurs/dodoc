<template>
  <div
    class="_pagedViewer"
    :class="{ 'is--infiniteViewer': viewer_type === 'vue-infinite-viewer' }"
    :style="pagedvar"
  >
    <vue-infinite-viewer
      v-if="viewer_type === 'vue-infinite-viewer'"
      class="_infiniteViewer"
      v-bind="viewerOptions"
      :style="pagedvar"
    >
      <div class="bookpreview" ref="bookpreview" />
    </vue-infinite-viewer>
    <template v-else>
      <div class="bookpreview" ref="bookpreview" />
    </template>
  </div>
</template>
<script>
import VueInfiniteViewer from "vue-infinite-viewer";
import { Previewer } from "pagedjs";
import default_pagedstyles from "@/components/publications/markdown/pagedstyles.css?raw";

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
  },
  components: {
    VueInfiniteViewer,
  },
  data() {
    return {
      viewerOptions: {
        useMouseDrag: true,
        useWheelScroll: true,
        useAutoZoom: true,

        zoomRange: [0.4, 10],
        maxPinchWheel: 10,
        displayVerticalScroll: true,
        displayHorizontalScroll: true,
        rangeX: [-100, 2000],
        rangeY: [0, Infinity],
      },
    };
  },
  created() {},
  mounted() {
    this.generateBook();
    window.addEventListener("beforeprint", this.beforePrint);
  },
  beforeDestroy() {
    this.removeExistingStyles();
    window.removeEventListener("beforeprint", this.beforePrint);
  },
  watch: {
    content_nodes() {
      this.generateBook();
    },
    format_mode() {
      this.generateBook();
    },
  },
  computed: {
    pagedvar() {
      return {
        width: this.format_mode,
        height: this.format_mode,
      };
    },
  },
  methods: {
    makePagedjsHTML() {
      const nodes = this.content_nodes;

      // if (this.opened_chapter) {
      //   delete nodes.chapters
      //   nodes.chapters = [this.opened_chapter];
      // }

      let html = "<div class='_book'>";

      if (nodes.cover) {
        html += `<section class="_cover" data-layout-mode="${nodes.cover.layout_mode}">`;
        if (nodes.cover.title)
          html += `<hgroup class="_coverTitle">${nodes.cover.title}</hgroup>`;
        if (nodes.cover.image_url)
          html += `<div class="_coverImage"><img src="${nodes.cover.image_url}" /></div>`;
        html += `</section>`;
      }

      nodes.chapters.forEach((chapter) => {
        html += `<section class="_chapter" data-starts-on-page="${chapter.starts_on_page}" data-chapter-meta-filename="${chapter.meta_filename}" data-chapter-title="${chapter.title}" >`;
        if (chapter.title)
          html += `<h1 class="_chapterTitle">${chapter.title}</h1>`;
        if (chapter.content) html += `${chapter.content}`;
        html += `</section>`;
      });

      html += `</div>`;

      return html;
    },
    async generateBook() {
      console.log("generateBook");

      this.removeExistingStyles();

      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview) {
        console.log("no bookpreview div");
        return;
      }

      let paged = new Previewer();

      let pagedjs_html = this.makePagedjsHTML();
      if (pagedjs_html.length == 0) pagedjs_html = `<div></div>`;

      let pagedjs_styles = `
      @page {
        size: ${this.format_mode};
        --paged-layout: booklet;
      }
      `;
      pagedjs_styles += default_pagedstyles;

      const theme_styles = [
        {
          pagedjs_styles,
        },
      ];

      paged.preview(pagedjs_html, theme_styles, undefined).then((flow) => {
        bookpreview.innerHTML = "";
        const pagesOutput = flow.pagesArea;
        bookpreview.appendChild(pagesOutput);

        this.$nextTick(() => {
          this.addChapterShortcuts();
        });
      });
    },
    addChapterShortcuts() {
      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview) return;
      const chapters = bookpreview.querySelectorAll(
        "._chapter[data-chapter-meta-filename]"
      );
      chapters.forEach((chapter) => {
        chapter.addEventListener("click", () => {
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
    beforePrint() {
      this.impositionPage();
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
  },
};
</script>
<style lang="scss" scoped>
._pagedViewer {
  position: relative;

  &.is--infiniteViewer {
    width: 100%;
    height: 100%;
    background-color: var(--c-gris_fonce);
    overflow: auto;
    height: 100%;
    cursor: move;
  }

  ._infiniteViewer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  --color-pageSheet: #cfcfcf;
  --color-pageBox: violet;
  --color-paper: white;
  --color-marginBox: transparent;
  --color-pageContent: #eee;
  --pagedjs-crop-color: black;
  --pagedjs-crop-shadow: white;
  --pagedjs-crop-stroke: 1px;

  ::v-deep {
    /* To define how the book look on the screen: */
    @media screen {
      ._chapter {
        cursor: pointer !important;

        &:hover {
          opacity: 0.85;
        }
      }

      .pagedjs_pages {
        display: flex;
        width: calc(var(--pagedjs-width) * 2);
        flex: 0;
        flex-wrap: wrap;
        margin: 0 auto;
      }

      .pagedjs_page {
        background-color: var(--color-paper);
        box-shadow: 0 0 0 1px var(--color-pageSheet);
        margin: 0;
        flex-shrink: 0;
        flex-grow: 0;
        margin-top: 10mm;
      }
      .pagedjs_page_content {
        box-shadow: 0 0 0 1px var(--color-pageContent);
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
