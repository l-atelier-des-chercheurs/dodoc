<template>
  <div class="m_keywordField">
    <!-- <VueTagsInput
      v-model="tag"
      :placeholder="$t('add_keyword')"
      :tags="tags"
      @tags-changed="newTags => sendTags(newTags)"
    />     -->
    <button type="button"
      v-for="tag in tags"
      :key="tag.text"
      @click="removeTag(tag.text)"
    >
      {{ tag.text }}
    </button>

    <div class="new-tag-input-wrapper">
      <input type="text" class="new-tag-input" v-model="tag" 
        :placeholder="$t('add_keyword')"
      />
      <button type="button" @click="createTag" :disabled="tag.length === 0">
        +
      </button>
    </div>
    <div v-if="matchingKeywords.length > 0" class="autocomplete">
      <button type="button"
        v-for="keyword in matchingKeywords"
        :key="keyword.text"
        class="tag"
        @click="createTagFromAutocomplete(keyword.text)"
      >
        {{ keyword.text }}
      </button>
    </div>
  </div>
</template>
<script>
import { VueTagsInput, createTags } from '@johmun/vue-tags-input';

export default {
  props: ['keywords'],
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
      this.updateTags(this.tags);
    }
  },
  beforeDestroy() {
  },
  watch: {
  },
  computed: {
    matchingKeywords() {
      if(this.tag.trim().length === 0) {
        return [];
      }
      return this.$root.allKeywords.filter(i => new RegExp(this.tag, 'i').test(i.text) && !this.tags.find(t => t.text === i.text));
    }
  },
  methods: {
    createTagFromAutocomplete: function(tag) {
      this.tag = tag;
      this.createTag();
    },
    createTag: function() {
      if(this.tag.trim().length === 0) {
        return;
      }
      this.tags.push({ text: this.tag });
      this.sendTags(this.tags);
      this.tag = '';
    },
    removeTag: function(tag_text) {
      this.tags = this.tags.filter(t => t.text !== tag_text);
      this.sendTags(this.tags);
    },
    updateTags: function(newTags) {
      this.tags = newTags.map(val => {
        val.classes = "tagcolorid_" + parseInt(val.text, 36)%2;
        return val;
      });
    },
    sendTags: function(newTags) {
      this.updateTags(newTags);
      const tag_array = this.tags.map((val) => { 
        return { title: val.text }
      });
      this.$emit('tagsChanged', tag_array);
    }
  }
}
</script>
<style>

</style>