<template>
  <div v-if="filtered_suggestions.length > 0">
    <button
      type="button"
      v-if="new_tag_name.length === 0"
      @click="show_suggestions = !show_suggestions"
      class="u-buttonLink"
    >
      {{ $t("suggestions") }}
    </button>

    <template v-if="new_tag_name.length > 0 || show_suggestions">
      <!-- <DLabel :str="$t('suggestions')" /> -->
      <TagsList
        v-if="filtered_suggestions.length > 0"
        :tags="filtered_suggestions"
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
  watch: {
    new_tag_name() {
      if (this.new_tag_name === 0) {
        this.show_suggestions = false;
      }
    },
    // suggestions_list(new_suggestions_list, old_suggestions_list) {
    // if (old_suggestions_list.length === 0 && new_suggestions_list.length > 0)
    //   this.show_suggestions = true;
    // },
  },
  computed: {
    suggestions_list() {
      const suggestions_by_type = this.suggestions[this.tag_type] || [];
      return suggestions_by_type.sort((a, b) => {
        return a.localeCompare(b);
      });
    },

    filtered_suggestions() {
      return this.suggestions_list.filter(
        (s) =>
          s.toLowerCase().startsWith(this.new_tag_name.toLowerCase()) &&
          !this.tags_to_exclude.some((t) => t === s)
      );
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
