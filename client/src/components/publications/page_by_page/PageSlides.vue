<template>
  <div
    class="_pageSlides"
    :class="{
      'is--slides': display_mode === 'slides',
      'is--serversidepreview': is_serversidepreview,
      'is--nightmode': night_mode,
    }"
  >
    <div class="_pages" :style="pages_style">
      <template v-if="!is_spread">
        <template v-if="display_mode !== 'slides'">
          <div
            v-for="page in pages_to_show"
            class="_page"
            :key="'page-' + page.id"
          >
            <SinglePage
              :context="'full'"
              :page_modules="getModulesForPage({ modules, page_id: page.id })"
              :page_color="page.page_color"
              :layout_mode="publication.layout_mode"
              :hide_pagination="page.hide_pagination === true"
              :page_number="getCorrectPageNumber(page.id)"
              :pagination="pagination"
              :can_edit="false"
            />
          </div>
        </template>
        <template v-else>
          <transition name="fade_fast" mode="in-out">
            <div
              class="_page"
              :key="'page-' + slide_current_page.id"
              v-if="slide_current_page"
            >
              <SinglePage
                :context="'full'"
                :page_modules="
                  getModulesForPage({
                    modules,
                    page_id: slide_current_page.id,
                  })
                "
                :page_color="slide_current_page.page_color"
                :layout_mode="publication.layout_mode"
                :hide_pagination="slide_current_page.hide_pagination === true"
                :page_number="getCorrectPageNumber(slide_current_page.id)"
                :pagination="pagination"
                :can_edit="false"
              />
            </div>
          </transition>
        </template>
      </template>
      <template v-else>
        <template v-if="display_mode !== 'slides'">
          <!-- print mode with ?display=print -->
          <div
            class="_spread"
            :key="s_index"
            v-for="(spread, s_index) in spreads_to_show"
          >
            <div
              v-for="(page, index) in spread"
              :key="page.id ? page.id : index"
              class="_spread--page"
            >
              <template v-if="page">
                <SinglePage
                  :context="'full'"
                  :page_modules="
                    getModulesForPage({ modules, page_id: page.id })
                  "
                  :page_color="page.page_color"
                  :layout_mode="publication.layout_mode"
                  :hide_pagination="page.hide_pagination === true"
                  :page_number="getCorrectPageNumber(page.id)"
                  :pagination="pagination"
                  :can_edit="false"
                />
              </template>
              <div v-else class="_noPage" />
            </div>
          </div>
        </template>
        <template v-else>
          <!-- presentation mode with ?display=slides -->
          <transition name="fade_fast" mode="out-in">
            <div
              class="_spread"
              :key="'spread-' + slides_current_page_or_spread_index"
              v-if="slide_current_spread"
            >
              <div
                v-for="(page, index) in slide_current_spread"
                :key="page.id ? page.id : index"
                class="_spread--page"
              >
                <template v-if="page">
                  <SinglePage
                    :context="'full'"
                    :page_modules="
                      getModulesForPage({ modules, page_id: page.id })
                    "
                    :page_color="page.page_color"
                    :layout_mode="publication.layout_mode"
                    :hide_pagination="page.hide_pagination === true"
                    :page_number="getCorrectPageNumber(page.id)"
                    :pagination="pagination"
                    :can_edit="false"
                  />
                </template>
                <div v-else class="_noPage" />
              </div>
            </div>
          </transition>
        </template>
      </template>
    </div>
    <div
      class="_navBtns"
      v-if="display_mode === 'slides' && has_multiple_pages"
    >
      <span>
        <button
          type="button"
          class="u-button u-button_transparent u-button_small"
          :disabled="slides_current_page_or_spread_index <= 1"
          @click="
            updatePageQuery({
              prop: 'page',
              val: slides_current_page_or_spread_index - 1,
            })
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
            <path
              d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
            />
          </svg>
        </button>
      </span>
      <span class="_pageInd">
        <b>
          <transition name="pagechange" mode="out-in">
            <select
              class=""
              :value="slides_current_page_or_spread_index"
              :key="slides_current_page_or_spread_index"
              @change="
                updatePageQuery({
                  prop: 'page',
                  val: $event.target.value,
                })
              "
            >
              <option
                v-for="(o, page_number) in is_spread
                  ? spreads.length
                  : pages.length"
                :key="page_number"
                :value="page_number + 1"
                v-text="page_number + 1"
              />
            </select>
          </transition>
          <div
            v-for="(o, page_number) in is_spread
              ? spreads.length
              : pages.length"
            :key="page_number"
            :v-text="page_number"
          />
        </b>
        /
        {{ is_spread ? spreads.length : pages.length }}</span
      >
      <span>
        <button
          type="button"
          class="u-button u-button_transparent u-button_small"
          :disabled="
            slides_current_page_or_spread_index >=
            (is_spread ? spreads.length : pages.length)
          "
          @click="
            updatePageQuery({
              prop: 'page',
              val: slides_current_page_or_spread_index + 1,
            })
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
            <path
              d="M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"
            />
          </svg>
        </button>
      </span>
      <!-- <input
              type="range"
              class="_inputRange"
              list="zoom_control"
              :min="1"
              :max="200"
              :step="1"
              v-model.number="page_zoom"
            />
            <datalist id="zoom_control">
              <option v-for="tick in [25, 50, 100, 200]" :key="tick">
                {{ tick }}
              </option>
            </datalist> -->
    </div>
  </div>
</template>
<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";

export default {
  props: {
    publication: Object,
    is_serversidepreview: Boolean,
  },
  components: {
    SinglePage,
  },
  data() {
    return {
      display_mode: "print",
      page_zoom: 100,
      night_mode: false,
    };
  },
  created() {
    this.$eventHub.$on("publication.togglePage", this.togglePage);
  },
  async mounted() {
    if (this.publication.layout_mode === "screen")
      document.body.style = `
          --page-width: ${this.publication.page_width}px;
          --page-height: ${this.publication.page_height}px;
        `;
    else if (this.publication.layout_mode === "print")
      document.body.style = `
          --page-width: ${this.publication.page_width}mm;
          --page-height: calc(${this.publication.page_height}mm - 0mm);
        `;
    document.addEventListener("keydown", this.keyPressed);

    if (
      this.$route.query?.display === "slides" ||
      window.app_infos.page_is_standalone_html
    )
      this.display_mode = "slides";

    if (this.display_mode === "slides") {
      this.fitZoomToPage();
      window.addEventListener("resize", () => {
        this.fitZoomToPage();
      });
    }
  },
  beforeDestroy() {
    this.$eventHub.$off("publication.togglePage", this.togglePage);
    document.removeEventListener("keydown", this.keyPressed);
  },
  watch: {},
  computed: {
    page_dimensions_to_px() {
      if (this.publication.layout_mode === "print")
        return {
          width: this.publication.page_width * 3.7952,
          height: this.publication.page_height * 3.7952,
        };
      return {
        width: this.publication.page_width,
        height: this.publication.page_height,
      };
    },
    pagination() {
      return this.setPaginationFromPublication(this.publication);
    },
    pages_style() {
      return {
        "--page-zoom": this.page_zoom / 100,
      };
    },
    slides_current_page_or_spread_index() {
      if (!this.$route.query?.page) return 1;
      return +this.$route.query.page;
    },
    slide_current_page() {
      if (!this.pages) return false;
      return this.pages[this.slides_current_page_or_spread_index - 1];
    },
    slide_current_spread() {
      if (!this.spreads) return false;
      return this.spreads[this.slides_current_page_or_spread_index - 1];
    },
    pages_to_show() {
      const pages_to_display = this.$route.query?.page;
      if (pages_to_display && pages_to_display.includes("-")) {
        const [start, end] = pages_to_display.split("-");
        return this.pages.slice(start - 1, end);
      } else if (pages_to_display && !pages_to_display.includes("-")) {
        return this.pages.slice(+pages_to_display - 1, +pages_to_display);
      }

      return this.pages;
    },
    has_multiple_pages() {
      if (this.is_spread) return this.spreads.length > 1;
      return this.pages.length > 1;
    },
    modules() {
      return this.publication.$files || [];
    },
    pages() {
      if (!this.publication.pages) return [];
      return this.publication.pages;
    },
    is_spread() {
      return this.publication.page_spreads === true;
    },
    spreads() {
      if (!this.is_spread) return false;
      return this.makeSpread({
        pages: this.pages,
      });
    },
    spreads_to_show() {
      const spreads_to_display = this.$route.query?.page;
      if (spreads_to_display && spreads_to_display.includes("-")) {
        const [start, end] = spreads_to_display.split("-");
        return this.spreads.slice(start - 1, end);
      } else if (spreads_to_display) {
        return this.spreads.slice(+spreads_to_display - 1, +spreads_to_display);
      }
      return this.spreads;
    },
  },
  methods: {
    fitZoomToPage() {
      const margin = 70;

      let page_width = this.page_dimensions_to_px.width;
      if (this.is_spread) page_width *= 2;

      let zoom_w = window.innerWidth / (page_width + margin);
      let zoom_h =
        window.innerHeight / (this.page_dimensions_to_px.height + margin);
      this.page_zoom = Math.min(zoom_w, zoom_h) * 100;
    },
    keyPressed(event) {
      if (
        this.$root.modal_is_opened ||
        event.target.tagName.toLowerCase() === "select" ||
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea" ||
        event.target.className.includes("ql-editor") ||
        event.target.hasAttribute("contenteditable")
      )
        return;

      if (this.display_mode !== "slides") return;

      switch (event.key) {
        case "w":
        case "z":
        case "ArrowLeft":
          if (this.slides_current_page_or_spread_index > 1) {
            this.updatePageQuery({
              prop: "page",
              val: this.slides_current_page_or_spread_index - 1,
            });
          }
          break;
        case "s":
        case "ArrowRight":
          if (
            this.slides_current_page_or_spread_index <
            (this.is_spread ? this.spreads.length : this.pages.length)
          ) {
            this.updatePageQuery({
              prop: "page",
              val: this.slides_current_page_or_spread_index + 1,
            });
          }
          break;
        case "p":
          this.page_zoom += 6;
          break;
        case "m":
          this.page_zoom -= 6;
          break;
        case "r":
          this.fitZoomToPage();
          break;
        case "f":
          this.$emit("toggleFs");
          break;
        case "n":
          this.night_mode = !this.night_mode;
          break;
      }
    },
    togglePage(page_id) {
      const page_index = this.pages.findIndex((p) => p.id === page_id);

      if (page_index !== -1) {
        this.updatePageQuery({
          prop: "page",
          val: page_index + 1,
        });
      } else {
        this.$alertify.error(this.$t("page_not_found"));
      }
    },
    getCorrectPageNumber(page_id) {
      const page_index = this.pages.findIndex((p) => p.id === page_id);
      return page_index;
    },
  },
};
</script>
<style lang="scss" scoped>
._page,
._spread {
  page-break-inside: avoid;
  -webkit-region-break-inside: avoid;

  &:not(:last-child) {
    page-break-after: always;
  }

  &:last-child {
    page-break-after: avoid !important;
  }

  ::v-deep {
    ._singlePage {
      > ._pagecontainer {
        margin: 0;
      }

      ._pagecontent {
        ._pageSlides.is--serversidepreview & {
          box-shadow: none;
        }
        @media print {
          box-shadow: none;
          // fixes in Firefox, but bugs in chrome/puppeteer
          // overflow: visible;
        }
      }
    }
  }
}

._spread {
  display: flex;
  flex-flow: row nowrap;
  width: max-content;

  > * {
    position: relative;
    flex: 1 1 50%;
  }
}

._noPage {
  width: calc(var(--page-width));
  height: calc(var(--page-height));

  ._pageSlides.is--serversidepreview & {
    display: none;
  }
}

._pageSlides {
  &.is--slides {
    background-color: var(--c-bodybg);
    overflow: hidden;

    transition: all 2s cubic-bezier(0.19, 1, 0.22, 1);
    &.is--nightmode {
      background-color: var(--c-noir);
    }

    ._pages {
      display: flex;
      justify-content: center;
      flex-flow: column nowrap;
      align-items: center;
      gap: calc(var(--spacing) * 2);
      padding: calc(var(--spacing) * 2);
      height: 100vh;
      transform: scale(var(--page-zoom));

      transition: transform 0.25s cubic-bezier(0.19, 1, 0.22, 1);
    }
    ._page {
      position: absolute;
    }
  }
}
._navBtns {
  position: fixed;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 1) calc(var(--spacing) * 2);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);
  border-radius: 8px;
  color: black;
  background-color: rgba(255, 255, 255, 1);

  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover {
    box-shadow: 0 0px 6px rgba(0, 0, 0, 0.06), 0 0px 6px rgba(0, 0, 0, 0.13);
  }

  ._pageSlides.is--nightmode & {
    background-color: var(--c-noir);
    color: white;

    &:hover {
      box-shadow: 0 0px 6px rgba(255, 255, 255, 0.06),
        0 0px 6px rgba(255, 255, 255, 0.13);
    }
  }
}
._pageInd {
  display: flex;
  flex-flow: row nowrap;
  min-width: 5ch;
  text-align: center;
  // justify-content: center;
  align-items: center;

  select {
    background-color: rgba(205, 205, 205, 0.3);
    // width: 6ch;
    color: inherit;
    padding-top: calc(var(--spacing) / 4);
    padding-bottom: calc(var(--spacing) / 4);
  }
}
</style>
<style lang="scss">
html,
body {
  @media print {
    width: var(--page-width);
    height: calc(var(--page-height));
  }
}

@page {
  size: var(--page-width) var(--page-height);
}
</style>
