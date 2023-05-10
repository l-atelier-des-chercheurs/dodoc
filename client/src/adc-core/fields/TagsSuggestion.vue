<template>
  <div>
    <button
      type="button"
      v-if="new_tag_name.length === 0 && show_suggestions === false"
      @click="show_suggestions = true"
      class="u-buttonLink"
    >
      {{ $t("suggestions") }}
    </button>
    <template v-else>
      <DLabel :str="$t('suggestions')" />
      <TagsList
        :tags="suggestions_list"
        :tag_type="tag_type"
        :addable="true"
        :clickable="true"
        @tagClick="$emit('newTag', $event)"
      />
    </template>
  </div>
</template>
<script>
import suggestions from "@/adc-core/fields/TagsSuggestionsList";

export default {
  props: {
    tag_type: String,
    new_tag_name: String,
    tags_to_exclude: Array,
  },
  components: {},
  data() {
    return {
      suggestions,
      show_suggestions: false,
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
        return local_suggestions.filter(
          (s) =>
            s.toLowerCase().startsWith(this.new_tag_name.toLowerCase()) &&
            !this.tags_to_exclude.some((t) => t === s)
        );
      return [];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
