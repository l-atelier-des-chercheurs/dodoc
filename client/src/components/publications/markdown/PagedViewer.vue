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
  },
  beforeDestroy() {
    this.removeExistingStyles();
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

      let html = "";

      if (nodes.cover) {
        html += `<section class="_cover" data-layout-mode="${nodes.cover.layout_mode}">`;
        if (nodes.cover.title)
          html += `<hgroup class="_coverTitle">${nodes.cover.title}</hgroup>`;
        if (nodes.cover.image_url)
          html += `<div class="_coverImage"><img src="${nodes.cover.image_url}" /></div>`;
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
    async generateBook() {
      console.log("generateBook");

      this.removeExistingStyles();

      const bookpreview = this.$refs.bookpreview;
      if (!bookpreview) {
        console.log("no bookpreview div");
        return;
      }

      let paged = new Previewer();

      const pagedjs_html = this.makePagedjsHTML();

      let pagedjs_styles = `
      @page {
        size: ${this.format_mode};
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
          const { width, height } = bookpreview.getBoundingClientRect();
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
