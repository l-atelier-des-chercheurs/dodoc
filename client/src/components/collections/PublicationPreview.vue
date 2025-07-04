<template>
  <router-link
    class="_publicationPreview"
    :to="getURLToFolder(publication.$path)"
  >
    <div class="_publicationPreview_content">
      <div class="_publicationPreview_date">
        {{ formatDate(publication.$date_created) }}
      </div>
      <h3 class="_publicationPreview_title">
        {{ publication.title }}
        <small class="_publicationPreview_type">
          – {{ $t(publication.template || "story").toLowerCase() }}
        </small>
      </h3>
    </div>
    <div v-if="Array.isArray(publication.$admins)" class="u-listOfAvatars">
      <AuthorTag
        v-for="(atpath, index) in publication.$admins"
        :key="atpath + '_' + index"
        :path="atpath"
        :show_image_only="true"
      />
    </div>
  </router-link>
</template>

<script>
export default {
  name: "PublicationPreview",
  components: {},
  props: {
    publication: {
      type: Object,
      required: true,
    },
  },
  i18n: {
    messages: {
      fr: {
        story: "Histoire",
        agora: "Agora",
        edition: "Édition",
        cartography: "Cartographie",
        page_by_page: "Page par page",
      },
      en: {
        story: "Story",
        agora: "Agora",
        edition: "Edition",
        cartography: "Cartography",
        page_by_page: "Page by page",
      },
    },
  },
  methods: {
    getURLToFolder(path) {
      const publication_slug = path.split("/").at(-1);
      return `/publish/${publication_slug}`;
    },
  },
};
</script>

<style lang="scss" scoped>
._publicationPreview {
  display: block;
  padding: calc(var(--spacing) / 2) calc(var(--spacing));
  text-decoration: none;
  background: white;
  border: 1px solid var(--border-color);

  transition: all 0.15s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
}

._publicationPreview_content {
  flex: 1 1 0;
}

._publicationPreview_date {
  font-size: var(--sl-font-size-small);
  color: var(--c-text-secondary);
  margin-bottom: calc(var(--spacing) / 4);
}

._publicationPreview_title {
  margin: 0;
  font-size: var(--sl-font-size-large);
  color: var(--c-text);
  margin-bottom: calc(var(--spacing) / 4);
}

._publicationPreview_type {
  font-size: var(--sl-font-size-small);
  color: var(--c-text-secondary);
}

.u-listOfAvatars {
  padding: 0;
  flex: 0 0 auto;
}
</style>
