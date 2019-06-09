<template>
  <div class="m_authorField">
    <button 
      v-for="author in allAuthors" 
      type="button"
      :key="author.name"
      :class="{ 
        'is--active': authors.filter(a => a.name === author.name).length > 0,
        'is--loggedInAuthor': $root.settings.current_author.name === author.name
      }"
      @click="toggleAuthorName(author.name)"
    >
      {{ author.name }}
    </button>
    <button type="button" @click="show_all_authors = true" v-if="max_authors_displayed_at_first <= allAuthors.length && !show_all_authors"
      class="m_authorField--show_all_authors"
      v-html="$t('show_all_authors')"
    />
  </div>
</template>
<script>
export default {
  props: ['currentAuthors'],
  components: {
  },
  data() {
    return {
      authors: this.currentAuthors !== undefined && this.currentAuthors !== '' ? this.currentAuthors.slice() : [],
      show_all_authors: false,
      max_authors_displayed_at_first: 8
    }
  },
  
  created() {
  },
  mounted() {
    // this.allAuthors = this.getAllUniqueAuthors();
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    allAuthors() {
      const allAuthors = this.authors.concat(this.$root.allAuthors);
      let nameList = [];

      if(this.$root.settings.current_author.hasOwnProperty('name')) {
        allAuthors.unshift(this.$root.settings.current_author);
      }

      let unique_authors = allAuthors.filter(a => {
        if(nameList.indexOf(a.name) === -1) {
          nameList.push(a.name);
          return true;
        }
        return false;
      });

      if(this.show_all_authors) {
        return unique_authors;
      } else {
        return unique_authors.slice(0, this.max_authors_displayed_at_first);
      }
    }
  },
  methods: {
    // getAllUniqueAuthors() {
    //   const allAuthors = this.authors.concat(this.$root.allAuthors);
    //   let nameList = [];
    //   return allAuthors.filter(a => {
    //     if(nameList.indexOf(a.name) === -1) {
    //       nameList.push(a.name);
    //       return true;
    //     }
    //     return false;
    //   });
    // },
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