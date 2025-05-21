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
  </div>
</template>

<script>
import PublicationPreview from "@/components/publications/PublicationPreview.vue";

export default {
  name: "GetPinnedPublications",
  components: {
    PublicationPreview,
  },
  data() {
    return {
      pinnedPublications: [],
    };
  },
  created() {
    this.fetchPinnedPublications();
  },
  methods: {
    async fetchPinnedPublications() {
      this.pinnedPublications = await this.loadAllFolders(
        "spaces",
        "projects",
        "publications"
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.allPublications {
  padding: calc(var(--spacing) * 1);

  h2 {
    margin-bottom: calc(var(--spacing) * 1);
    text-align: center;
  }
}

.allPublications--grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: calc(var(--spacing) * 1);
  margin-top: calc(var(--spacing) * 1);
}

.allPublications--grid--card {
  background: var(--c-blanc);
  border-radius: var(--card-radius);
  padding: calc(var(--spacing) * 1);
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
