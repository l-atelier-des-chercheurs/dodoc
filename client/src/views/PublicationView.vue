<template>
  <div
    class="_publicationView"
    :class="{
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
          <PageSlides
            :publication="publication"
            :is_serversidepreview="is_serversidepreview"
            @toggleFs="toggleFs"
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
          <StorySectionTemplate
            :publication="publication"
            :can_edit="false"
            :section_opened_meta="section_opened_meta"
            @toggleSection="section_opened_meta = $event"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import screenfull from "screenfull";

import PageSlides from "@/components/publications/page_by_page/PageSlides.vue";
import StoryTemplate from "@/components/publications/templates/StoryTemplate.vue";
import StorySectionTemplate from "@/components/publications/templates/StorySectionTemplate.vue";

export default {
  props: {},
  components: {
    PageSlides,
    StoryTemplate,
    StorySectionTemplate,
  },
  data() {
    return {
      fetch_project_error: null,
      project: null,
      publication: null,

      section_opened_meta: "",

      is_fullscreen: false,
      is_serversidepreview: false,
    };
  },
  created() {},
  async mounted() {
    if (this.$route.query?.make_preview === "true")
      this.is_serversidepreview = true;

    await this.listProject();
    this.$eventHub.$emit("received.project", this.project);

    await this.listPublication();

    // not pushing changes to presentation for performance reasons – though this could be useful at some point?
    // this.$api.join({ room: this.project.$path });
    // this.$api.join({ room: this.publication_path });

    if (this.publication.template === "story_with_sections") {
      if (this.publication.sections_list)
        this.section_opened_meta =
          this.publication.sections_list[0].meta_filename;
    }
  },
  beforeDestroy() {
    // this.$api.leave({ room: this.project.$path });
    // this.$api.leave({ room: this.publication_path });
  },
  watch: {
    is_fullscreen() {
      this.$nextTick(() => {
        this.fitZoomToPage();
      });
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
.alertify-logs {
  display: none !important;
}
html,
body {
  @media print {
    background: white !important;
  }
}
._storyTemplate {
  padding: calc(var(--spacing) / 1);
}
</style>
