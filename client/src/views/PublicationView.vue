<template>
  <div class="_publicationView">
    <!-- <pre>
      {{ $api.store }}
    </pre> -->
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
            <div
              class="_page"
              v-for="(page, page_number) in pages"
              :key="'page-' + page.id"
            >
              <SinglePage
                :context="'full'"
                :page_modules="getModulesForPage({ modules, page_id: page.id })"
                :page_color="page.page_color"
                :hide_pagination="page.hide_pagination === true"
                :can_edit="false"
                :page_number="page_number"
                :pagination="pagination"
              />
            </div>
          </template>
          <template v-else>
            <div
              class="_spread"
              v-for="(spread, s_index) in spreads"
              :key="s_index"
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
    };
  },
  created() {},
  async mounted() {
    await this.listProject();
    this.$eventHub.$emit("received.project", this.project);

    await this.listPublication();

    document.body.style = `
      --page-width: ${this.publication.page_width}cm;
      --page-height: calc(${this.publication.page_height}cm - 0.2mm);
    `;

    // this.$api.join({ room: this.project.$path });
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
  },
  watch: {},
  computed: {
    pagination() {
      return this.setPaginationFromPublication(this.publication);
    },
    project_path() {
      // FIX123
      debugger;
      return `/projects/${this.$route.params.project_slug}`;
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
</style>
