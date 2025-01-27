<template>
  <editor-content :editor="editor" />
</template>
<script>
import { Editor, EditorContent } from "@tiptap/vue-2";
import StarterKit from "@tiptap/starter-kit";
import { createMarkdownEditor } from "tiptap-markdown";

// import { Highlight } from "@tiptap/extension-highlight";
// import markdownitMark from "markdown-it-mark";

export default {
  components: {
    EditorContent,
  },

  data() {
    return {
      editor: null,
    };
  },

  mounted() {
    const MarkdownEditor = createMarkdownEditor(Editor);
    this.editor = new MarkdownEditor({
      content: "# Title",
      extensions: [StarterKit],
    });
  },

  beforeDestroy() {
    this.editor.destroy();
  },
};
</script>
<style lang="scss" scoped></style>
