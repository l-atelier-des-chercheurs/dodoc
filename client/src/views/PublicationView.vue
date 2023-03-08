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
      <div v-else key="project">
        <!-- Publication view project = {{ project }} <br />
        publication = {{ publication }} -->
        <div v-if="publication.template === 'page_by_page'" class="_pages">
          <div class="_page" v-for="page in pages" :key="'page-' + page.id">
            <SinglePage
              :context="'full'"
              :page_modules="getModulesForPage({ modules, page_id: page.id })"
              :page_width="publication.page_width"
              :page_height="publication.page_height"
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
    // this.$api.join({ room: this.project.$path });
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
  },
  watch: {},
  computed: {
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
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  align-items: center;
  gap: calc(var(--spacing) * 2);

  @media screen {
    padding: calc(var(--spacing) * 2);
  }
}
._page {
  page-break-before: always;
  page-break-after: always;
  page-break-inside: avoid;
  -webkit-region-break-inside: avoid;
}

._publicationView ::v-deep {
  ._singlePage {
    > ._container {
      margin: 0;
    }
  }
}
</style>
