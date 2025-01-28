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
    <vue-infinite-viewer
      v-if="view_mode === 'book'"
      class="_bookViewer"
      ref="viewer"
      v-bind="viewerOptions"
    >
      <div class="bookpreview" ref="bookpreview" />
    </vue-infinite-viewer>
    <div v-else class="_docViewer">
      <div class="_docViewer--menu">
        <ol v-for="(chapter, index) in content_nodes.chapters" :key="index">
          <li>{{ chapter.title }}</li>
        </ol>
      </div>
      <!-- <div class="_docViewer--content" v-html="content"></div> -->
    </div>
  </div>
</template>
<script>
import VueInfiniteViewer from "vue-infinite-viewer";
import { Previewer } from "pagedjs";

export default {
  props: {
    content_nodes: Object,
    view_mode: {
      type: String,
      default: "book",
    },
    format_mode: {
      type: String,
      default: "A5",
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
      },
    };
  },
  created() {},
  mounted() {
    this.$nextTick(() => {
      this.refreshView();
    });
  },
  beforeDestroy() {},
  watch: {
    content_nodes() {
      this.refreshView();
    },
    view_mode() {
      this.refreshView();
    },
    format_mode() {
      this.refreshView();
    },
  },
  computed: {
    theme_styles() {
      let styles = "";

      styles += `
        ._chapter {
        }
        ._chapter[data-starts-on-page="in_flow"]:not(:first-child) {
          margin-top: 3rem;
        }
        ._chapter[data-starts-on-page="left"] {
          break-before: left;
        }

        ._chapter[data-starts-on-page="right"] {
          break-before: right;
        }

        p {
          margin: 1em 0;
        }
        ._cover {
          break-after: left;
        }
        ._coverTitle {
          position: relative;
          z-index: 1000;
        }
        ._coverImage {
          position: relative;
          z-index: 2;
        }
        ._coverImage[data-layout-mode="full_page"] {
          position: absolute;
          z-index: 1;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        ._coverImage[data-layout-mode="half_top"] {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 50%;
        }
        ._coverImage[data-layout-mode="half_bottom"] {
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 50%;
        }
        ._coverImage:not([data-layout-mode="normal"]) img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `;
      styles += `
        @page {
          size: ${this.format_mode};
        }

        ._chapterTitle {
          string-set: title content(text);
        }

        @page:left {
          @bottom-left {
            content: counter(page);
            font-size: 10px;
          }
        }
        @page:right {
          @bottom-right {
            content: counter(page);
            font-size: 10px;
          }
        }

        @page {
          @bottom-center {
            content: string(title);
            font-size: 10px;
          }
        }
      `;

      return [
        {
          pagedjs_styles: styles,
        },
      ];
    },
  },
  methods: {
    refreshView() {
      document
        .querySelectorAll("style[data-pagedjs-inserted-styles]")
        .forEach((styleElement) => {
          styleElement.parentNode.removeChild(styleElement);
        });

      if (this.view_mode === "book") {
        this.generateBook();
      }
    },
    makePagedjsHTML() {
      const nodes = this.content_nodes;

      let html = "";

      if (nodes.cover) {
        html += `<section class="_cover">`;
        if (nodes.cover.title)
          html += `<h1 class="_coverTitle">${nodes.cover.title}</h1>`;
        if (nodes.cover.image_url)
          html += `<div class="_coverImage" data-layout-mode="${nodes.cover.layout_mode}"><img src="${nodes.cover.image_url}" /></div>`;
        html += `</section>`;
      }

      nodes.chapters.forEach((chapter) => {
        html += `<section class="_chapter" data-starts-on-page="${chapter.starts_on_page}">`;
        if (chapter.title)
          html += `<h1 class="_chapterTitle">${chapter.title}</h1>`;
        if (chapter.content) html += `${chapter.content}`;
        html += `</section>`;
      });

      return html;
    },
    generateBook() {
      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview) return;

      let paged = new Previewer();

      const pagedjs_html = this.makePagedjsHTML();

      // let flow = paged.preview(DOMContent, ["path/to/css/file.css"], document.body).then((flow) => {
      paged.preview(pagedjs_html, this.theme_styles, undefined).then((flow) => {
        // bookpreview.style.width =
        //   bookpreview.getBoundingClientRect().width + "px";
        // bookpreview.style.height =
        //   bookpreview.getBoundingClientRect().height + "px";

        bookpreview.innerHTML = "";
        const pagesOutput = flow.pagesArea;
        bookpreview.appendChild(pagesOutput);

        // bookpreview.style.width = "";
        // bookpreview.style.height = "";
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

  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);

  select {
    max-width: 20ch;
    pointer-events: all;
  }
}

._bookViewer {
  // border: 1px solid black;
  position: relative;
  width: 100%;
  height: 100%;
  cursor: move;

  background-color: var(--c-gris_fonce);
  // background: white;
  overflow: auto;
  height: 100%;
  --color-pageSheet: #cfcfcf;
  --color-pageBox: violet;
  --color-paper: white;
  --color-marginBox: transparent;
  --pagedjs-crop-color: black;
  --pagedjs-crop-shadow: white;
  --pagedjs-crop-stroke: 1px;

  ::v-deep {
    /* To define how the book look on the screen: */
    @media screen {
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

._docViewer {
  padding: calc(var(--spacing) / 1);
}
</style>
