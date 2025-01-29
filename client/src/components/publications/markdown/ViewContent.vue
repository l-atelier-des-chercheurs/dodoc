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
      <vue-infinite-viewer
        class="_bookViewer"
        ref="viewer"
        v-bind="viewerOptions"
        :style="pagedvar"
      >
        <div class="bookpreview" ref="bookpreview" />
      </vue-infinite-viewer>
    </template>
    <div v-else class="_docViewer">
      <div class="_docViewer--menu">
        <ol>
          <li v-for="(chapter, index) in content_nodes.chapters" :key="index">
            <button
              type="button"
              class="u-buttonLink"
              :class="{
                'is--active':
                  chapter.meta_filename === opened_chapter_meta_filename,
              }"
              @click="$emit('openChapter', chapter.meta_filename)"
            >
              {{ chapter.title }}
            </button>
          </li>
        </ol>
      </div>
      <transition name="pagechange" mode="out-in">
        <div
          class="_docViewer--content"
          :key="opened_chapter_meta_filename"
          v-if="opened_chapter"
          v-html="opened_chapter.content"
        />
      </transition>
    </div>
    <LoaderSpinner v-if="is_loading" />
  </div>
</template>
<script>
import VueInfiniteViewer from "vue-infinite-viewer";
import { Previewer } from "pagedjs";

import default_pagedstyles from "@/components/publications/markdown/pagedstyles.css?raw";

export default {
  props: {
    content_nodes: Object,
    opened_chapter_meta_filename: String,
  },
  components: {
    VueInfiniteViewer,
  },
  data() {
    return {
      is_loading: false,

      view_mode: "book",
      format_mode: "A5",

      viewerOptions: {
        useMouseDrag: true,
        useWheelScroll: true,
        useAutoZoom: true,
        zoomRange: [0.4, 10],
        maxPinchWheel: 10,
        displayVerticalScroll: true,
        displayHorizontalScroll: true,
        rangeX: [0, 1000],
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
      this.$nextTick(() => {
        this.refreshView();
      });
    },
    format_mode() {
      this.refreshView();
    },
  },
  computed: {
    pagedvar() {
      return {
        "--pagedjs-format": this.format_mode,
      };
    },
    opened_chapter() {
      return this.content_nodes.chapters.find(
        (chapter) => chapter.meta_filename === this.opened_chapter_meta_filename
      );
    },
  },
  methods: {
    async refreshView() {
      this.is_loading = true;

      document
        .querySelectorAll("style[data-pagedjs-inserted-styles]")
        .forEach((styleElement) => {
          styleElement.parentNode.removeChild(styleElement);
        });

      if (this.view_mode === "book") {
        await this.generateBook();
      }

      this.is_loading = false;
    },
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
          html += `<h1 class="_coverTitle">${nodes.cover.title}</h1>`;
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
        // bookpreview.style.width =
        //   bookpreview.getBoundingClientRect().width + "px";
        // bookpreview.style.height =
        //   bookpreview.getBoundingClientRect().height + "px";

        bookpreview.innerHTML = "";
        const pagesOutput = flow.pagesArea;
        bookpreview.appendChild(pagesOutput);

        this.$nextTick(() => {
          const { width, height } = bookpreview.getBoundingClientRect();
          this.viewerOptions.rangeX = [-width, width * 2];
          this.viewerOptions.rangeY = [-100, height];
        });

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
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
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
  // cursor: move;

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
      .pagedjs_page_content {
        box-shadow: 0 0 0 1px var(--color-pageSheet);
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
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 1);
  padding: calc(var(--spacing) / 1);
  background-color: var(--body-bg);
  position: relative;
  overflow: auto;
  height: 100%;

  ._docViewer--menu {
    flex: 0 0 20ch;
    position: sticky;
    top: 0;
    padding: calc(var(--spacing) / 1);

    ul,
    ol {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  }
  ._docViewer--content {
    flex: 1 1 100%;
  }
}
</style>
