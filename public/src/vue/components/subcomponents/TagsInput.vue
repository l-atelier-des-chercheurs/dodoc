<template>
  <div>
    <VueTagsInput
      v-model="tag"
      :placeholder="$t('add_keyword')"
      :autocomplete-items="filteredKeyword"
      :tags="tags"
      @tags-changed="newTags => editTags(newTags)"
    />    
  </div>
</template>
<script>
import { VueTagsInput, createTags } from '@johmun/vue-tags-input';

export default {
  props: {
    keywords: Array
  },
  components: {
    VueTagsInput
  },
  data() {
    return {
      tags: !!this.keywords && this.keywords.length > 0 ? createTags(this.keywords.map(k => k.title)) : [],
      tag: ''
    }
  },
  
  created() {
  },
  mounted() {
    if(this.tags.length > 0) {
      this.editTags(this.tags);
    }
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    filteredKeyword() {
      return this.$root.allKeywords.filter(i => new RegExp(this.tag, 'i').test(i.text));
    }
  },
  methods: {
    editTags: function(newTags) {
      this.tags = newTags.map(val => {
        val.classes = "tagcolorid_" + parseInt(val.text, 36)%2;
        return val;
      });
      const tag_array = this.tags.map((val) => { 
        return { title: val.text }
      });
      this.$emit('tagsChanged', tag_array);
    },
  }
}
</script>
<style>

</style>