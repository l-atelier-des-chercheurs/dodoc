<template>
  <div>
    <DLabel :str="$t('suggestions')" />
    <TagsList
      :tags="suggestions_list"
      :tag_type="tag_type"
      :addable="true"
      :clickable="true"
      @tagClick="$emit('newTag', $event)"
    />
  </div>
</template>
<script>
import suggestions from "@/adc-core/fields/TagsSuggestionsList";

export default {
  props: {
    tag_type: String,
    new_tag_name: String,
  },
  components: {},
  data() {
    return {
      suggestions,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    suggestions_list() {
      const local_suggestions = this.suggestions[this.tag_type];
      if (local_suggestions)
        return local_suggestions.filter((s) =>
          s.toLowerCase().startsWith(this.new_tag_name.toLowerCase())
        );
      return [];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
