<template>
  <div class="_authorsView">
    <div class="_backBtn">
      <router-link :to="'/'" class="u-buttonLink">
        <b-icon icon="arrow-left-short" />
        {{ $t("home") }}
      </router-link>
    </div>

    <h1 class="_title" v-text="$t('list_of_contributors')" />

    <div class="_allAuthors">
      <template v-for="author in authors">
        <AuthorCard
          v-if="!connected_as"
          :key="author.$path"
          :author="author"
          :links_to_author_page="true"
        />
        <AuthorCard
          v-else
          :key="author.$path"
          :author="author"
          :links_to_author_page="true"
        />
      </template>
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
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
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
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
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
  margin-top: calc(var(--spacing) * 2);
  margin-bottom: calc(var(--spacing) * 1);
}
</style>
