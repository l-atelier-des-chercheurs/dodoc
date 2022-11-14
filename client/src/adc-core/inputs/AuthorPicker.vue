<template>
  <div class="_authorPicker">
    <div
      v-for="author_slug in all_authors_except_current"
      :key="author_slug"
      @click="$emit('addAuthor', author_slug)"
    >
      <AuthorTag :slug="author_slug" :key="author_slug" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    current_authors: Array,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_authors_except_current() {
      return ["louis", "pauline", "sarah"].filter(
        (a) => !this.current_authors.includes(a)
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._maxlength {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4) 0;
}

._authorPicker {
  border: 2px solid var(--c-bleumarine);
  padding: calc(var(--spacing) / 4);
}
</style>
