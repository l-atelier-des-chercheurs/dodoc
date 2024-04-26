<template>
  <div class="_authorsView">
    <div class="_backBtn">
      <router-link :to="'/'" class="u-buttonLink">
        <b-icon icon="arrow-left-short" />
        {{ $t("home") }}
      </router-link>
    </div>

    <h1 class="_title" v-text="$t('list_of_accounts')" />

    <div class="u-spacingBottom _searchField">
      <SearchInput
        v-model="search_author_name"
        :search_placeholder="$t('search_by_name')"
        :name="'search_author'"
      />
    </div>

    <transition-group
      tag="section"
      class="_allAuthors"
      name="listComplete"
      appear
    >
      <AuthorCard
        v-for="author in filtered_authors"
        :key="author.$path"
        :author="author"
        :links_to_author_page="true"
      />
    </transition-group>
    <div v-if="filtered_authors.length === 0">
      {{ $t("no_accounts_to_show") }}
    </div>
  </div>
</template>
<script>
import AuthorCard from "@/adc-core/author/AuthorCard.vue";

export default {
  props: {},
  components: {
    AuthorCard,
  },
  data() {
    return {
      path: "authors",
      authors: [],
      search_author_name: "",
    };
  },
  created() {},
  async mounted() {
    this.authors = await this.$api.getFolders({
      path: this.path,
    });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    sorted_authors() {
      return this.authors.slice().sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
    filtered_authors() {
      return this.sorted_authors.filter((a) => {
        if (this.search_author_name)
          return this.twoStringsSearch(a.name, this.search_author_name);
        return true;
      });
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._backBtn {
  margin-bottom: calc(var(--spacing) * 2);
}
._authorsView {
  padding: calc(var(--spacing) * 1);
  max-width: calc(var(--max-column-width));
  margin: 0 auto;
}
._allAuthors {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: calc(var(--spacing) / 1);
}
._title {
  margin-bottom: calc(var(--spacing) * 1);
}

._searchField {
  max-width: 30ch;
}
</style>
