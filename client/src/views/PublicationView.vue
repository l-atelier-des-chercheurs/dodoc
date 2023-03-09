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
      <div v-else key="publication" :style="page_size">
        <!-- Publication view project = {{ project }} <br />
        publication = {{ publication }} -->
        <div v-if="publication.template === 'page_by_page'" class="_pages">
          <div class="_page" v-for="page in pages" :key="'page-' + page.id">
            <SinglePage
              :context="'full'"
              :page_modules="getModulesForPage({ modules, page_id: page.id })"
              :page_color="page.page_color"
              :can_edit="false"
            />
          </div>
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
      --page-height: ${this.publication.page_height}cm;
    `;

    // this.$api.join({ room: this.project.$path });
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
  },
  watch: {},
  computed: {
    page_size() {
      return `
        --page-width: ${this.publication.page_width}cm;
        --page-height: ${this.publication.page_height}cm;
      `;
      // return `
      //   --page-width: ${this.publication.page_width}cm;
      //   --page-height: ${this.publication.page_height}cm;
      // `;
    },
    project_path() {
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
._page {
  page-break-after: always;
  page-break-inside: avoid;
  -webkit-region-break-inside: avoid;
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
    height: calc(var(--page-height) - 0.3mm);
  }
}
@page {
  size: var(--page-width) var(--page-height);
}

._singlePage ._pagecontent {
  @media print {
    overflow: visible;
  }
}
</style>
