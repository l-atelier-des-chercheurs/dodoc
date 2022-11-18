<template>
  <div>
    <input
      v-if="tag === 'input'"
      ref="field"
      type="text"
      class=""
      :required="required"
      :placeholder="'…'"
      @input="$emit('update:content', $event.target.value)"
      @keyup.enter="$emit('onEnter')"
    />
    <span
      v-else-if="tag === 'span'"
      ref="field"
      class="_content"
      :contenteditable="true"
      :required="required"
      @input="$emit('update:content', $event.target.innerText)"
      @keyup.enter="$emit('onEnter')"
      @paste.prevent="onPaste"
    />

    <div
      v-if="maxlength"
      class="_maxlength fieldCaption"
      :class="{
        'u-colorRed': !validity,
      }"
    >
      {{ content.length }} ≤ {{ maxlength }}
    </div>
  </div>
</template>
<script>
export default {
  props: {
    tag: {
      type: String,
      default: "input",
    },
    content: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: true,
    },
    maxlength: {
      type: [Boolean, Number],
      default: false,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {
    if (this.tag === "span") {
      this.$refs.field.innerText = this.content;
      this.focusSpanAtEnd();
    } else if (this.tag === "input") {
      this.$refs.field.focus();
    }
  },
  beforeDestroy() {},
  watch: {
    validity: {
      handler() {
        this.$emit("toggleValidity", this.validity);
      },
      immediate: true,
    },
  },
  computed: {
    validity() {
      if (this.required && this.content.length === 0) return false;
      if (this.maxlength && this.content.length > this.maxlength) return false;
      return true;
    },
  },
  methods: {
    focusSpanAtEnd() {
      function placeCaretAtEnd(el) {
        el.focus();
        if (
          typeof window.getSelection != "undefined" &&
          typeof document.createRange != "undefined"
        ) {
          var range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
          var textRange = document.body.createTextRange();
          textRange.moveToElementText(el);
          textRange.collapse(false);
          textRange.select();
        }
      }
      const field = this.$refs.field;
      placeCaretAtEnd(field);
    },
    onPaste(e) {
      // Get the copied text from the clipboard
      const text = e.clipboardData
        ? (e.originalEvent || e).clipboardData.getData("text/plain")
        : // For IE
        window.clipboardData
        ? window.clipboardData.getData("Text")
        : "";

      if (document.queryCommandSupported("insertText")) {
        document.execCommand("insertText", false, text);
      } else {
        // Insert text at the current position of caret
        const range = document.getSelection().getRangeAt(0);
        range.deleteContents();

        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.selectNodeContents(textNode);
        range.collapse(false);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._maxlength {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4) 0;
}
</style>
