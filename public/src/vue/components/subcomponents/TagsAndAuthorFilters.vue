<template>
  <div class="flex-wrap bg-blanc margin-top-small">
    <div v-if="$root.allKeywords.length > 0" class="padding-sides-small">
      <label>{{ $t('keywords') }}</label>
      <div class="m_keywordField margin-bottom-none font-large">
        <button
          v-for="keyword in $root.allKeywords" 
          :key="keyword.text"
          :class="[keyword.classes, { 'is--active' : keywordFilter === keyword.text }]"
          @click="$emit('setKeywordFilter',keyword.text)"
        >
          {{ keyword.text }}
        </button>
      </div>
    </div>
    <div v-if="$root.allAuthors.length > 0" class="padding-sides-small">
      <label>{{ $t('authors') }}</label>
      <div class="m_authorField margin-bottom-none">
        <button
          v-for="author in $root.allAuthors" 
          :key="author.name"
          :class="{ 'is--active' : authorFilter === author.name }"
          @click="$emit('setAuthorFilter',author.name)"
        >
          {{ author.name }}
        </button>
      </div>
    </div>
  </div>
</template>
<script>


export default {
  props: ['keywordFilter', 'authorFilter'],
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
  },
  methods: {
  }
}
</script>
<style>

</style>