<template>
  <div class="_allPublications">
    <h2>{{ $t("all_publications") }}</h2>
    <div class="_allPublications--grid" v-if="pinnedPublications.length > 0">
      <div
        v-for="pub in pinnedPublications"
        class="_allPublications--grid--card"
      >
        <PublicationPreview
          :publication="pub"
          :template_options="[]"
          :can_edit="false"
          @open="openEntry(pub.$path)"
        />
      </div>
    </div>
    <p v-else class="no-publications">{{ $t("no_pinned_publications") }}</p>
    <!-- 
    <SectionWithPrint
      v-if="
        publication_to_open &&
        publication_to_open.template === 'story_with_sections'
      "
      :publication="publication_to_open"
    /> -->
  </div>
</template>

<script>
import PublicationPreview from "@/components/publications/PublicationPreview.vue";

export default {
  name: "GetPinnedPublications",
  components: {
    PublicationPreview,
    SectionWithPrint: () =>
      import("@/components/publications/story/SectionWithPrint.vue"),
  },
  data() {
    return {
      pinnedPublications: [],
      publication_to_open: null,
    };
  },
  created() {
    this.fetchPinnedPublications();
    this.fetchPublicationToOpen();
  },
  methods: {
    async fetchPublicationToOpen() {
      const publication = await this.$api.getFolder({
        path: `spaces/casou/projects/julien/publications/lkj`,
      });
      this.publication_to_open = publication;
    },
    async fetchPinnedPublications() {
      const pinnedPublications = await this.loadAllFolders(
        "spaces",
        "projects",
        "publications"
      );
      this.pinnedPublications = pinnedPublications.slice(0, 5);
    },
  },
};
</script>

<style lang="scss" scoped>
._allPublications {
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: 0 auto;
  padding: calc(var(--spacing) * 1);

  h2 {
    margin-bottom: calc(var(--spacing) * 1);
    text-align: center;
  }
}

._allPublications--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: calc(var(--spacing) / 1);
  // gap: 0;
  margin-top: calc(var(--spacing) * 1);
}

._allPublications--grid--card {
  background: var(--c-blanc);
  border-radius: var(--card-radius);
  // padding: calc(var(--spacing) * 1);
  box-shadow: var(--card-shadow);

  h3 {
    margin-bottom: calc(var(--spacing) * 0.5);
  }

  p {
    color: var(--c-text-secondary);
    margin-bottom: calc(var(--spacing) * 0.5);
  }
}

.publication-meta {
  font-size: var(--sl-font-size-small);
  color: var(--c-text-secondary);
}

.no-publications {
  text-align: center;
  color: var(--c-text-secondary);
  padding: calc(var(--spacing) * 2);
}
</style>
