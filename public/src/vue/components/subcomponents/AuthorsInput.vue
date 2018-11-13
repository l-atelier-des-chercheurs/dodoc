<template>
  <div>
    <button 
      v-for="author in allAuthors" 
      type="button"
      :key="author.name"
      :class="{ 'is--active': authors.filter(a => a.name === author.name).length > 0 }"
      @click="toggleAuthorName(author.name)"
    >
      {{ author.name }}
    </button>
    <!-- <VueTagsInput
      v-model="tag"
      :placeholder="$t('add_authors')"
      :autocomplete-items="filteredKeyword"
      :tags="tags"
      @tags-changed="newTags => editTags(newTags)"
    />     -->
  </div>
</template>
<script>
export default {
  props: {
    currentAuthors: Array
  },
  components: {
  },
  data() {
    return {
      authors: this.currentAuthors !== undefined && this.currentAuthors !== '' ? this.currentAuthors : []
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
    allAuthors() {
      return this.$root.allAuthors;
    },
    filteredAuthors() {
    }
  },
  methods: {
    toggleAuthorName: function(authorName) {
      // authorName is already in authors, then remove it
      if(this.authors.filter(a => a.name === authorName).length > 0) {
        this.authors = this.authors.filter(a => a.name !== authorName);
      } else {
        this.authors.push({
          name: authorName
        });
      }
      this.$emit('authorsChanged', this.authors);
    }
  }
}
</script>
<style>

</style>