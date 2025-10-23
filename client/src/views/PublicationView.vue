<template>
  <div
    class="_publicationView"
    :class="{
      'is--serversidepreview': is_serversidepreview,
    }"
  >
    <component :is="'style'">
      {{ set_print_margins }}
    </component>
    <transition name="fade_fast" mode="out-in">
      <div class="u-divCentered" v-if="$root.is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else-if="fetch_publication_error" class="_errorMessage">
        <span
          class="u-warning"
          v-html="$t('error:') + ' ' + fetch_publication_error"
        />
      </div>
      <div v-else-if="publication" key="publication" ref="fsContainer">
        <template v-if="!is_serversidepreview && !is_fullscreen">
          <transition name="pagechange" mode="out-in">
            <div class="_pubTopbar" v-if="show_topbar">
              <PublicationTopbar
                :publication="publication"
                :no_back_button="true"
                :can_edit="false"
              />
            </div>
          </transition>
          <div class="_toggleTopbar">
            <button
              type="button"
              class="u-button u-button_small u-button_icon"
              @click="show_topbar = !show_topbar"
            >
              <b-icon icon="chevron-up" :rotate="show_topbar ? 0 : 180" />
            </button>
          </div>
        </template>

        <template v-if="publication.template === 'page_by_page'">
          <PageExport
            :publication="publication"
            :is_serversidepreview="is_serversidepreview"
          />
        </template>
        <div v-else-if="publication.template === 'story'">
          <StoryTemplate
            class="_storyTemplate"
            :publication="publication"
            :can_edit="false"
          />
        </div>
        <div v-else-if="publication.template === 'story_with_sections'">
          <SectionWithPrint :publication="publication" />
        </div>
        <div v-else-if="publication.template === 'cartography'">
          <MapForPrint :publication="publication" />
        </div>
        <div v-else-if="publication.template === 'edition'">
          <EditionExport :publication="publication" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import screenfull from "screenfull";

import PublicationTopbar from "@/components/publications/PublicationTopbar.vue";
import DynamicTitle from "@/mixins/DynamicTitle.js";

export default {
  props: {},
  mixins: [DynamicTitle],
  components: {
    PublicationTopbar,
    PageExport: () =>
      import("@/components/publications/page_by_page/PageExport.vue"),
    StoryTemplate: () =>
      import("@/components/publications/templates/StoryTemplate.vue"),
    SectionWithPrint: () =>
      import("@/components/publications/story/SectionWithPrint.vue"),
    MapForPrint: () =>
      import("@/components/publications/cartography/MapForPrint.vue"),
    EditionExport: () =>
      import("@/components/publications/edition/EditionExport.vue"),
  },
  data() {
    return {
      project: null,
      publication: null,
      fetch_publication_error: undefined,
      show_topbar: false,

      is_fullscreen: false,
      is_serversidepreview: false,
    };
  },
  created() {
    console.log("Loading PublicationView");
  },
  async mounted() {
    if (this.$route.query?.make_preview === "true")
      this.is_serversidepreview = true;

    let superadmintoken = undefined;
    if (this.$route.query?.superadmintoken)
      superadmintoken = this.$route.query.superadmintoken;

    if (window.app_infos.page_is_standalone_html) {
      this.publication = window.folder_data;
    } else
      this.publication = await this.$api
        .getPublicFolder({
          path: this.publication_path,
          superadmintoken,
        })
        .catch((err) => {
          if (err.code === "folder_not_public") {
            this.fetch_publication_error = this.$t("folder_not_public");
          } else {
            this.fetch_publication_error = err.code;
          }
        });

    // Update document title with actual publication name
    if (this.publication) {
      this.updateDocumentTitle(this.publication.title);
    }

    // not pushing changes to presentation for performance reasons – though this could be useful at some point?
    // this.$api.join({ room: this.project.$path });
    // this.$api.join({ room: this.publication_path });

    this.$root.is_loading = false;
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
    // this.$api.leave({ room: this.publication_path });
  },
  watch: {
    is_fullscreen() {
      // this.$nextTick(() => {
      // this.fitZoomToPage();
      // });
    },
  },
  computed: {
    project_path() {
      return this.createPath({
        space_slug: this.$route.params.space_slug,
        project_slug: this.$route.params.project_slug,
      });
    },
    publication_path() {
      return `${this.project_path}/publications/${this.$route.params.publication_slug}`;
    },
    set_print_margins() {
      let margins = 15;
      if (
        this.publication &&
        ["page_by_page", "edition"].includes(this.publication.template)
      )
        margins = 0;
      return `
      @page {
        margin: ${margins}mm;
      }
      `;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._publicationView {
  background: white;

  @media screen {
    // margin: 0 calc(var(--spacing) * 2);
  }
}
</style>
<style lang="scss">
.alertify-logs {
  display: none !important;
}
html,
body {
  background: white !important;
  @media print {
    // background: white !important;
  }
}
._storyTemplate {
  padding: calc(var(--spacing) / 1);
}

._pubTopbar {
  // margin: 0 auto;
  // max-width: 86ch;

  @media print {
    display: none;
  }
}

._toggleTopbar {
  position: absolute;
  width: 100%;
  text-align: center;
  z-index: 1;
  pointer-events: none;

  button {
    pointer-events: auto;
  }

  @media print {
    display: none;
  }
}
._sectionsSummary {
  @media print {
    display: none;
  }
}
._storyContent {
  @media print {
    box-shadow: none !important;
  }
}

._errorMessage {
  padding: calc(var(--spacing) * 2);
  text-align: center;
  max-width: 86ch;
  margin: 0 auto;
}
</style>
