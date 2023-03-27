<template>
  <div
    class="_publicationView"
    :class="{
      'is--slides': display_mode === 'slides',
    }"
  >
    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered" v-if="!project || !publication" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else-if="fetch_project_error" key="err">
        {{ fetch_project_error }}
      </div>
      <div v-else key="publication">
        <!-- Publication view project = {{ project }} <br />
        publication = {{ publication }} -->
        <div v-if="publication.template === 'page_by_page'" class="_pages">
          <template v-if="!is_spread">
            <template v-if="display_mode !== 'slides'">
              <div
                v-for="(page, page_number) in pages"
                class="_page"
                :key="'page-' + page.id"
              >
                <SinglePage
                  :context="'full'"
                  :page_modules="
                    getModulesForPage({ modules, page_id: page.id })
                  "
                  :page_color="page.page_color"
                  :hide_pagination="page.hide_pagination === true"
                  :can_edit="false"
                  :page_number="page_number"
                  :pagination="pagination"
                />
              </div>
            </template>
            <template v-else>
              <transition name="fade_fast" mode="out-in">
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
                v-for="(spread, s_index) in spreads"
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
                        :hide_pagination="page.hide_pagination === true"
                        :page_number="
                          (slides_current_page_or_spread_index - 1) * 2 + index
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
              @click="updatePageQuery(-1)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                <path
                  d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
                />
              </svg>
            </button>
          </span>
          <span class="_pageInd"
            ><b>{{ slides_current_page_or_spread_index }}</b>
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
              @click="updatePageQuery(+1)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                <path
                  d="M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"
                />
              </svg>
            </button>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";

export default {
  props: {},
  components: { SinglePage },
  data() {
    return {
      fetch_project_error: null,
      project: null,
      publication: null,
      projectpanes: [],

      display_mode: "print",
    };
  },
  created() {},
  async mounted() {
    if (this.$route.query?.display === "slides") this.display_mode = "slides";

    await this.listProject();
    this.$eventHub.$emit("received.project", this.project);

    await this.listPublication();

    document.body.style = `
      --page-width: ${this.publication.page_width}cm;
      --page-height: calc(${this.publication.page_height}cm - 0.2mm);
    `;

    document.addEventListener("keydown", this.keyPressed);

    // this.$api.join({ room: this.project.$path });
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
    document.removeEventListener("keydown", this.keyPressed);
  },
  watch: {},
  computed: {
    pagination() {
      return this.setPaginationFromPublication(this.publication);
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
      return this.publication.pages;
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
  },
  methods: {
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

      if (
        event.key === "ArrowLeft" &&
        this.slides_current_page_or_spread_index > 1
      )
        this.updatePageQuery(-1);
      if (
        event.key === "ArrowRight" &&
        this.slides_current_page_or_spread_index <
          (this.is_spread ? this.spreads.length : this.pages.length)
      )
        this.updatePageQuery(+1);
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
    updatePageQuery(increment) {
      let query = {};

      if (this.$route.query)
        query = JSON.parse(JSON.stringify(this.$route.query));

      // if (Object.prototype.hasOwnProperty.call(query, "page"))
      query.page = this.slides_current_page_or_spread_index + increment;

      this.$router.push({ query });
    },
  },
};
</script>
<style lang="scss" scoped>
._pages {
  @media screen {
    display: flex;
    justify-content: center;
    flex-flow: column nowrap;
    align-items: center;
    gap: calc(var(--spacing) * 2);
    padding: calc(var(--spacing) * 2);
  }
}
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
}
</style>
<style lang="scss">
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
}

._navBtns {
  position: fixed;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 1) calc(var(--spacing) * 2);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);
}
._pageInd {
  width: 5ch;
  text-align: center;
}
</style>
