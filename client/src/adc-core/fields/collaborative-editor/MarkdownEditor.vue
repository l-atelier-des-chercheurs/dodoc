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
export default {
  name: "Editor",
  props: {
    msg: String,
  },
  mounted() {
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, this.$refs.editor);
        ctx.set(defaultValueCtx, this.$props.msg);
      })
      .config(nord)
      .use(commonmark)
      .create();
  },
};
</script>
