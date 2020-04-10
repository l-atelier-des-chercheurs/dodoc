<template>
  <div class="m_authorField">
    <button
      v-for="author_slug in all_authors_slugs"
      type="button"
      :key="author_slug"
      :class="{
        'is--active': authors.some((a) => a.slugFolderName === author_slug),
        'is--loggedInAuthor':
          $root.current_author &&
          $root.current_author.slugFolderName === author_slug,
      }"
      @click="toggleAuthorName(author_slug)"
    >
      {{ $root.getAuthor(author_slug).name }}
    </button>
    <button
      type="button"
      @click="show_all_authors = true"
      v-if="
        max_authors_displayed_at_first <= all_authors_slugs.length &&
        !show_all_authors
      "
      class="m_authorField--show_all_authors"
      v-html="$t('show_all_authors')"
    />
  </div>
</template>
<script>
export default {
  props: ["currentAuthors"],
  components: {},
  data() {
    return {
      authors: !!this.currentAuthors ? this.currentAuthors.slice() : [],
      show_all_authors: false,
      max_authors_displayed_at_first: 8,
    };
  },

  created() {},
  mounted() {
    // this.allAuthors = this.getAllUniqueAuthors();
  },
  beforeDestroy() {},

  watch: {},
  computed: {
    all_authors_slugs() {
      let _all_authors_slugs = [];

      if (this.$root.current_author)
        _all_authors_slugs.push(this.$root.current_author.slugFolderName);

      this.authors.map((acc, a) => {
        if (a.slugFolderName && !_all_authors_slugs.includes(a.slugFolderName))
          _all_authors_slugs.push(a.slugFolderName);
      });

      this.$root.allAuthors.map((a) => {
        if (a.slugFolderName && !_all_authors_slugs.includes(a.slugFolderName))
          _all_authors_slugs.push(a.slugFolderName);
      });

      if (this.show_all_authors) {
        return _all_authors_slugs;
      } else {
        return _all_authors_slugs.slice(0, this.max_authors_displayed_at_first);
      }
    },
  },
  methods: {
    toggleAuthorName: function (author_slug) {
      // author_slug is already in authors, then remove it
      if (this.authors.some((a) => a.slugFolderName === author_slug)) {
        this.authors = this.authors.filter(
          (a) => a.slugFolderName !== author_slug
        );
      } else {
        this.authors.push({
          slugFolderName: author_slug,
        });
      }
      this.$emit("authorsChanged", this.authors);
    },
  },
};
</script>
<style></style>
