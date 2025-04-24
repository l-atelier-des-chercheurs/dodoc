<template>
  <div class="_debugMode">
    <h2>HTML</h2>
    <code v-html="pretty_content_html" />
  </div>
</template>
<script>
import pretty from "pretty";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/vs2015.css";

export default {
  props: {
    content_html: String,
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
    pretty_content_html() {
      // return this.content_html;
      const html = pretty(this.content_html, { ocd: true });
      const highlighted = hljs.highlight(html, { language: "xml" }).value;
      return highlighted;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._debugMode {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background-color: var(--c-noir);
  background-color: var(--c-noir);
  color: white;
  overflow: auto;
  padding: calc(var(--spacing) * 2);

  code {
    background-color: var(--c-noir);
    color: white;
    font-size: inherit;
    padding: 0;
    white-space: pre-wrap;
  }
  ::selection {
    background-color: #555;
  }
}
</style>
