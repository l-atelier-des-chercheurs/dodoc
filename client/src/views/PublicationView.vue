<template>
  <div
    class="_publicationView"
    :class="{
      'is--slides': display_mode === 'slides',
      'is--serversidepreview': is_serversidepreview,
    }"
  >
    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered" v-if="!project || !publication" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else-if="fetch_project_error" key="err">
        {{ fetch_project_error }}
      </div>
      <div v-else key="publication" ref="fsContainer">
        <!-- Publication view project = {{ project }} <br />
        publication = {{ publication }} -->
        <template v-if="publication.template === 'page_by_page'">
          <div class="_pages" :style="pages_style">
            <template v-if="!is_spread">
              <template v-if="display_mode !== 'slides'">
                <div
                  v-for="(page, page_number) in pages_to_show"
                  class="_page"
                  :key="'page-' + page.id"
                >
                  <SinglePage
                    :context="'full'"
                    :page_modules="
                      getModulesForPage({ modules, page_id: page.id })
                    "
                    :page_color="page.page_color"
                    :layout_mode="publication.layout_mode"
                    :hide_pagination="page.hide_pagination === true"
                    :page_number="page_number"
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
                      :hide_pagination="
                        slide_current_page.hide_pagination === true
                      "
                      :page_number="slides_current_page_or_spread_index - 1"
                      :pagination="pagination"
                      :can_edit="false"
                    />
                  </div>
                </transition>
              </template>
            </template>
            <template v-else>
              <template v-if="display_mode !== 'slides'">
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
                        :page_number="s_index * 2 + index"
                        :pagination="pagination"
                        :can_edit="false"
                      />
                    </template>
                    <div v-else class="_noPage" />
                  </div>
                </div>
              </template>
              <template v-else>
                <transition name="fade" mode="out-in">
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
                          :page_number="
                            (slides_current_page_or_spread_index - 1) * 2 +
                            index
                          "
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
          <div class="_navBtns" v-if="display_mode === 'slides'">
            <span>
              <button
                type="button"
                class="u-button u-button_transparent u-button_small"
                :disabled="slides_current_page_or_spread_index <= 1"
                @click="updatePageQuery({ increment: -1 })"
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
                <select
                  class=""
                  :value="slides_current_page_or_spread_index"
                  @change="
                    updatePageQuery({ page_number: $event.target.value })
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
                @click="updatePageQuery({ increment: +1 })"
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
        </template>
        <div v-else-if="publication.template === 'story'">
          <StoryTemplate
            class="_storyTemplate"
            :publication="publication"
            :can_edit="false"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import screenfull from "screenfull";
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";
import StoryTemplate from "@/components/publications/templates/StoryTemplate.vue";

export default {
  props: {},
  components: {
    SinglePage,
    StoryTemplate,
  },
  data() {
    return {
      fetch_project_error: null,
      project: null,
      publication: null,
      projectpanes: [],
      page_zoom: 100,

      is_fullscreen: false,
      is_serversidepreview: false,

      display_mode: "print",
    };
  },
  created() {},
  async mounted() {
    if (this.$route.query?.display === "slides") this.display_mode = "slides";

    if (this.$route.query?.make_preview === "true")
      this.is_serversidepreview = true;

    await this.listProject();
    this.$eventHub.$emit("received.project", this.project);

    await this.listPublication();

    if (this.publication.template === "page_by_page") {
      if (this.publication.layout_mode === "screen")
        document.body.style = `
          --page-width: ${this.publication.page_width}px;
          --page-height: ${this.publication.page_height}px;
        `;
      else if (this.publication.layout_mode === "print")
        document.body.style = `
          --page-width: ${this.publication.page_width}mm;
          --page-height: calc(${this.publication.page_height}mm - 0.2mm);
        `;
      document.addEventListener("keydown", this.keyPressed);
    }

    if (this.display_mode === "slides") {
      this.fitZoomToPage();
      window.addEventListener("resize", () => {
        this.fitZoomToPage();
      });
    }
    // this.$api.join({ room: this.project.$path });
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
    document.removeEventListener("keydown", this.keyPressed);
  },
  watch: {
    is_fullscreen() {
      this.$nextTick(() => {
        this.fitZoomToPage();
      });
    },
  },
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
    project_path() {
      return this.createPath({
        space_slug: this.$route.params.space_slug,
        project_slug: this.$route.params.project_slug,
      });
    },
    publication_path() {
      return `${this.project_path}/publications/${this.$route.params.publication_slug}`;
    },
    pages() {
      if (!this.publication.pages) return [];
      return this.publication.pages;
    },
    pages_to_show() {
      const page_to_display = +this.$route.query?.page;
      if (page_to_display)
        return this.pages.slice(page_to_display - 1, page_to_display);
      return this.pages;
    },
    modules() {
      return this.publication.$files || [];
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
      const spread_to_display = +this.$route.query?.page;
      if (spread_to_display)
        return this.spreads.slice(spread_to_display - 1, spread_to_display);
      return this.spreads;
    },
  },
  methods: {
    async openFs() {
      await screenfull.request(this.$refs.fsContainer);
      this.is_fullscreen = true;
      screenfull.onchange(() => {
        if (!screenfull.isFullscreen) this.is_fullscreen = false;
      });
    },
    async closeFs() {
      await screenfull.exit();
      this.is_fullscreen = false;
    },
    async toggleFs() {
      if (this.is_fullscreen) this.closeFs();
      else this.openFs();
    },
    fitZoomToPage() {
      const margin = 70;
      let zoom_w =
        window.innerWidth / (this.page_dimensions_to_px.width + margin);
      let zoom_h =
        window.innerHeight / (this.page_dimensions_to_px.height + margin);
      this.page_zoom = Math.min(zoom_w, zoom_h) * 100;
    },
    keyPressed(event) {
      if (
        this.$root.modal_is_opened ||
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
          if (this.slides_current_page_or_spread_index > 1)
            this.updatePageQuery({ increment: -1 });
          break;
        case "s":
        case "ArrowRight":
          if (
            this.slides_current_page_or_spread_index <
            (this.is_spread ? this.spreads.length : this.pages.length)
          )
            this.updatePageQuery({ increment: +1 });
          break;
        case "p":
          this.page_zoom += 2;
          break;
        case "m":
          this.page_zoom -= 2;
          break;
        case "f":
          this.toggleFs();
          break;
      }
    },
    async listProject() {
      const project = await this.$api
        .getFolder({
          path: this.project_path,
        })
        .catch((err) => {
          this.fetch_project_error = err.response;
          this.is_loading = false;
        });
      this.project = project;
    },
    async listPublication() {
      const publication = await this.$api
        .getFolder({
          path: this.publication_path,
        })
        .catch((err) => {
          this.fetch_publication_error = err.response;
        });
      this.publication = publication;
    },
    updatePageQuery({ increment, page_number }) {
      let query = {};

      if (this.$route.query)
        query = JSON.parse(JSON.stringify(this.$route.query));

      // if (Object.prototype.hasOwnProperty.call(query, "page"))
      if (increment)
        query.page = this.slides_current_page_or_spread_index + increment;
      else if (page_number) query.page = page_number;

      this.$router.push({ query });
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
}

._publicationView ::v-deep {
  ._singlePage {
    > ._pagecontainer {
      margin: 0;
    }
  }

  .u-floatingFsButton {
    display: none;
  }
}

._publicationView.is--slides {
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
</style>
<style lang="scss">
.alertify-logs {
  display: none !important;
}
html,
body {
  @media print {
    background: white !important;
  }
}
body {
  @media print {
    width: var(--page-width);
    height: calc(var(--page-height));
  }
}
@page {
  size: var(--page-width) var(--page-height);
}

._singlePage ._pagecontent {
  ._publicationView.is--serversidepreview & {
    box-shadow: none;
  }
  @media print {
    box-shadow: none;
    // fixes in Firefox, but bugs in chrome/puppeteer
    // overflow: visible;
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

  ._publicationView.is--serversidepreview & {
    display: none;
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

  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover {
    background-color: rgba(255, 255, 255, 1);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
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
    background-color: rgba(205, 205, 205, 0.5);
    width: 6ch;
  }
}
._storyTemplate {
  padding: calc(var(--spacing) / 1);
}
</style>
