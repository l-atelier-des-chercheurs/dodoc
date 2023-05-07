<template>
  <div class="_markdownField" v-html="md_text" />
</template>
<script>
import { marked } from "marked";

export default {
  props: {
    text: String,
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
    md_text() {
      return marked.parse(this.text);
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._markdownField {
  ::v-deep p {
    margin: 0;
  }
}
</style>
