<template>
  <div>
    <div class="u-keywords" v-if="keywords.length > 0">
      <SingleKeyword
        v-for="keyword in keywords"
        :key="keyword"
        :keyword="keyword"
        :can_remove="edit_mode"
        @remove="removeKeyword(keyword)"
      />
    </div>

    <template v-if="edit_mode">
      <KeywordsFieldEditor
        :keywords="keywords"
        @update:keywords="$emit('update:keywords', $event)"
      />
    </template>
  </div>
</template>
<script>
import KeywordsFieldEditor from "@/components/KeywordsFieldEditor.vue";
import SingleKeyword from "@/components/SingleKeyword.vue";

export default {
  props: {
    keywords: Array,
    edit_mode: Boolean,
  },
  components: {
    KeywordsFieldEditor,
    SingleKeyword,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    removeKeyword(_kw) {
      this.$emit(
        "update:keywords",
        this.keywords.filter((kw) => kw !== _kw)
      );
    },
  },
};
</script>
<style lang="scss" scoped></style>
