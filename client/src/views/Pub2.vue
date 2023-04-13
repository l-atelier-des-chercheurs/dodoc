<template>
  <div class="_publicationView">
    <!-- <img src="./assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/> -->
    <div class="u-divCentered" v-if="!project || !publication" key="loader">
      <LoaderSpinner />
    </div>
    <div v-else-if="fetch_project_error" key="err">
      {{ fetch_project_error }}
    </div>
    <template v-else-if="publication.template === 'page_by_page'">
      <div class="reveal">
        <div class="slides">
          <template v-if="!is_spread">
            <section
              v-for="(page, page_number) in pages"
              class="_page"
              :key="'page-' + page.id"
            >
              <SinglePage
                :context="'full'"
                :page_modules="getModulesForPage({ modules, page_id: page.id })"
                :page_color="page.page_color"
                :layout_mode="publication.layout_mode"
                :hide_pagination="page.hide_pagination === true"
                :page_number="page_number"
                :pagination="pagination"
                :can_edit="false"
              />
            </section>
          </template>
          <section v-for="(spread, s_index) in spreads" :key="s_index">
            <div class="_spread">
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
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import SinglePage from "@/components/publications/page_by_page/SinglePage.vue";
import Reveal from "reveal.js/js/reveal";

export default {
  name: "app",
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
  async mounted() {
    if (this.$route.query?.display === "slides") this.display_mode = "slides";

    await this.listProject();
    // this.$eventHub.$emit("received.project", this.project);
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
      this.startReveal();
    }
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    pagination() {
      return this.setPaginationFromPublication(this.publication);
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
    async startReveal() {
      // load css conditionnally
      const link = document.createElement("link");
      link.setAttribute("rel", "stylesheet");
      link.setAttribute("type", "text/css");
      link.setAttribute(
        "href",
        "https://cdn.jsdelivr.net/npm/reveal.js@3.6.0/css/reveal.css"
      );
      document.head.appendChild(link);
      await new Promise((r) => setTimeout(r, 2000));
      await Reveal.initialize({
        width: this.publication.page_width,
        height: this.publication.page_height,
      });
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
  },
};
</script>
<style lang="scss">
// @import url("../../node_modules/reveal.js/css/reveal.css");
// @import url("../../node_modules/reveal.js/css/theme/white.css");

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
._publicationView {
  height: 100vh;
}

._singlePage ._pagecontent {
  @media print {
    box-shadow: none;
    // fixes in Firefox, but bugs in chrome/puppeteer
    // overflow: visible;
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
</style>
