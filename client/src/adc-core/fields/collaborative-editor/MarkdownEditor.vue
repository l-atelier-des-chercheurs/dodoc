<template>
  <div>
    Ploup
    <div ref="editor"></div>
  </div>
</template>

<script>
import { defaultValueCtx, Editor, rootCtx } from "@milkdown/kit/core";
import { nord } from "@milkdown/theme-nord";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { prism } from "@milkdown/plugin-prism";

export default {
  name: "Editor",
  props: {},
  data() {
    return {
      msg: "# Hello World",
    };
  },
  mounted() {
    const editor = this.$refs.editor;

    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, editor);
        ctx.set(defaultValueCtx, this.msg);
      })
      .config(nord)
      .use(commonmark)
      .use(prism) // Use the Prism plugin for syntax highlighting
      .create();
  },
};
</script>
