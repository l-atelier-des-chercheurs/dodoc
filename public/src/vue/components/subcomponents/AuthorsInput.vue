<template>
  <div class="m_authorField">
    <button
      v-for="author_slug in all_authors_slugs"
      v-if="
        !read_only ||
        (read_only && authors.some((a) => a.slugFolderName === author_slug))
      "
      type="button"
      :key="author_slug"
      :class="{
        'is--active': authors.some((a) => a.slugFolderName === author_slug),
        'is--loggedInAuthor':
          $root.current_author &&
          $root.current_author.slugFolderName === author_slug,
      }"
      :disabled="read_only"
      @click="toggleAuthorName(author_slug)"
    >
      {{ $root.getAuthor(author_slug).name }}
    </button>
    <button
      type="button"
      @click="show_all_authors = true"
      v-if="
        max_authors_displayed_at_first <= all_authors_slugs.length &&
        !show_all_authors &&
        !read_only
      "
      class="m_authorField--show_all_authors"
      v-html="$t('show_all_authors')"
    />
  </div>
</template>
<script>
export default {
  props: {
    currentAuthors: Array,
    read_only: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      show_all_authors: false,
      max_authors_displayed_at_first: 8,
      authors: [],
    };
  },

  created() {},
  mounted() {
    // this.allAuthors = this.getAllUniqueAuthors();
  },
  beforeDestroy() {},

  watch: {
    currentAuthors: {
      handler() {
        this.authors = !!this.currentAuthors ? this.currentAuthors.slice() : [];
      },
      deep: true,
      immediate: true,
    },
  },
  computed: {
    all_authors_slugs() {
      let _all_authors_slugs = [];

      if (this.$root.current_author)
        _all_authors_slugs.push(this.$root.current_author.slugFolderName);

      this.authors.map((a) => {
        if (a.slugFolderName && !_all_authors_slugs.includes(a.slugFolderName))
          _all_authors_slugs.push(a.slugFolderName);
      });

      this.$root.all_authors.map((a) => {
        if (a.slugFolderName && !_all_authors_slugs.includes(a.slugFolderName))
          if (
            this.show_all_authors ||
            _all_authors_slugs.length < this.max_authors_displayed_at_first
          )
            _all_authors_slugs.push(a.slugFolderName);
      });

      return _all_authors_slugs;
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
      this.$emit("update:currentAuthors", this.authors);
    },
  },
};
</script>
<style></style>
