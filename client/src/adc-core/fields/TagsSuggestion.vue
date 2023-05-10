<template>
  <div>
    <button
      type="button"
      @click="show_suggestions = !show_suggestions"
      class="u-buttonLink"
    >
      {{ $t("suggestions") }}
    </button>

    <template v-if="new_tag_name > 0 || show_suggestions">
      <!-- <DLabel :str="$t('suggestions')" /> -->
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
  watch: {
    // suggestions_list(new_suggestions_list, old_suggestions_list) {
    // if (old_suggestions_list.length === 0 && new_suggestions_list.length > 0)
    //   this.show_suggestions = true;
    // },
  },
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
