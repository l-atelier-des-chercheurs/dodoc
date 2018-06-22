<template>
  <aside class="m_searchsidebar">
    <h2 class="sectionTitle_small">
      Filtrer les médias par auteur
    </h2>

    <div class="flex-wrap flex-vertically-centered">
      <button type="button" 
        v-if="Object.keys(sortedAuthors).length > 0"
        v-for="(author, slug) in sortedAuthors" 
        :key="author.name" 
        class="m_searchsidebar--author flex-wrap padding-small flex-vertically-centered"
        :class="{ 'is--selected' : author.name === $root.settings.media_filter.authors }"
        @click="setAuthorFilter(author)"
      >
        <img 
          v-if="!!author.preview"
          :src="urlToPortrait(slug, author.preview)"
        />
        <div class="m_searchsidebar--author--name">{{ author.name }}</div>
      </button>

    </div>

  </aside>
</template>
<script>


export default {
  props: {
  },
  components: {
  },
  data() {
    return {
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    sortedAuthors() {
      return this.$root.store.authors;
    }
  },
  methods: {
    urlToPortrait(slug, filename) {
      if(filename === undefined) {
        return '';
      }
      return `/${this.$root.state.authorsFolder}/${slug}/${filename}`;
    },
    setAuthorFilter(author) {
      if(author.name !== this.$root.settings.media_filter.authors) {
        this.$root.setMediaFilter({ authors: author.name });
      } else {
        this.$root.unsetMediaFilter();
      }
    }
  }
}
</script>
<style>

</style>