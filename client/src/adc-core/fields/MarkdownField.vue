<template>
  <div class="_markdownField" v-html="md_text" />
</template>
<script>
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

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
      const renderer = new marked.Renderer();
      const linkRenderer = renderer.link;
      renderer.link = (href, title, text) => {
        const localLink = href.startsWith(
          `${location.protocol}//${location.hostname}`
        );
        const html = linkRenderer.call(renderer, href, title, text);
        return localLink
          ? html
          : html.replace(
              /^<a /,
              `<a rel="noreferrer noopener nofollow" target="_blank" `
            );
      };
      marked.use({ renderer });

      const hooks = {
        postprocess(html) {
          return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
        },
      };
      marked.use({ hooks });

      // return marked.parse(`<img src="x" onerror="alert('not happening')">`);
      return marked.parse(this.text, { breaks: true });
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
