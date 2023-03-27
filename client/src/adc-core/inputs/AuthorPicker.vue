<template>
  <div class="_authorPicker">
    <div v-if="all_authors_except_current.length === 0" class="u-instructions">
      {{ $t("no_authors_to_show") }}
    </div>

    <div class="_list">
      <div
        v-for="author_path in all_authors_except_current"
        :key="author_path"
        @click="$emit('addAuthor', author_path)"
      >
        <AuthorTag :path="author_path" :key="author_path" />
      </div>
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
    return {
      all_authors_path: [],
    };
  },
  async created() {
    const all_authors = await this.$api.getFolders({
      path: `authors`,
    });
    this.all_authors_path = all_authors.map(({ $path }) => $path);
  },
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    all_authors_except_current() {
      return this.all_authors_path.filter(
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
._label {
}

._authorPicker {
  // border: 2px solid var(--c-bleumarine);
}
._list {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
  // padding: calc(var(--spacing) / 4);
  > * {
    cursor: pointer;
  }
}
</style>
