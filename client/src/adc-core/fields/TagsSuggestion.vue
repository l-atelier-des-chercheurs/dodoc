<template>
  <div>
    <DLabel :str="$t('suggestions')" />
    <div v-if="filtered_suggestions.length === 0">–</div>
    <template v-else>
      <TagsList
        v-if="filtered_suggestions.length > 0"
        :tags="filtered_suggestions"
        :tag_type="tag_type"
        :mode="'add'"
        @tagClick="$emit('newTag', $event)"
      />
    </template>
  </div>
</template>
<script>
export default {
  props: {
    tag_type: String,
    local_suggestions: Array,
    new_tag_name: String,
    tags_to_exclude: Array,
  },
  components: {},
  data() {
    return {
      suggestions: [],
    };
  },
  async created() {
    if (this.local_suggestions !== undefined)
      this.suggestions = this.local_suggestions;
    else this.suggestions = await this.loadSuggestions(this.tag_type);
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    new_tag_name() {},
    // suggestions_list(new_suggestions_list, old_suggestions_list) {
    // if (old_suggestions_list.length === 0 && new_suggestions_list.length > 0)
    //   this.show_suggestions = true;
    // },
  },
  computed: {
    suggestions_list() {
      return this.suggestions;
    },
    filtered_suggestions() {
      return this.suggestions_list.filter(
        (s) =>
          this.twoStringsMatch(s, this.new_tag_name) &&
          !this.tags_to_exclude.some((t) => t === s)
      );
    },
  },
  methods: {
    async loadSuggestions(tag_type) {
      const path = `categories/${tag_type}`;
      const suggestions = await this.$api
        .getFolders({
          path,
        })
        .catch((err) => {
          // probably no suggestions, abort
          err;
          return;
        });
      return suggestions?.list_of_suggestions
        ? suggestions.list_of_suggestions
        : [];
    },
  },
};
</script>
<style lang="scss" scoped></style>
