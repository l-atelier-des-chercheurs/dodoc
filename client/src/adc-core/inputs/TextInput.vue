<template>
  <div>
    <template v-if="tag === 'input'">
      <input
        ref="field"
        :type="current_input_type"
        class=""
        :required="required"
        :placeholder="'…'"
        @input="$emit('update:content', $event.target.value)"
        @keyup.enter="$emit('onEnter')"
      />
    </template>
    <span
      v-else-if="tag === 'span'"
      ref="field"
      class="u-input _content"
      :contenteditable="true"
      :required="required"
      @input="$emit('update:content', $event.target.innerText)"
      @keyup.enter="$emit('onEnter')"
      @paste.prevent="onPaste"
    />

    <div
      class="_notices fieldCaption"
      :class="{
        'u-colorRed': !validity,
      }"
    >
      <div>
        <template v-if="minlength || maxlength">
          <template v-if="minlength">{{ minlength }} ≤ </template>
          {{ content.length }}
          <template v-if="maxlength"> ≤ {{ maxlength }}</template>
        </template>
      </div>
      <div v-if="input_type === 'password'">
        <button
          type="button"
          class="u-buttonLink _revealBtn"
          :class="{
            'is--active': show_password_in_clear,
          }"
          @click="toggleInputType"
        >
          {{ $t("reveal") }}
        </button>
      </div>
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
    input_type: {
      type: String,
      default: "text",
    },
    content: {
      type: String,
      default: "",
    },
    required: {
      type: Boolean,
      default: true,
    },
    minlength: {
      type: [Boolean, Number],
      default: false,
    },
    maxlength: {
      type: [Boolean, Number],
      default: false,
    },
  },
  components: {},
  data() {
    return {
      show_password_in_clear: false,
    };
  },
  created() {},
  mounted() {
    if (this.tag === "span") {
      this.$refs.field.innerText = this.content;
      this.focusSpanAtEnd();
    } else if (this.tag === "input") {
      this.$refs.field.value = this.content;
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
      if (this.minlength && this.content.length < this.minlength) return false;
      if (this.maxlength && this.content.length > this.maxlength) return false;
      return true;
    },
    current_input_type() {
      if (this.input_type === "password") {
        if (this.show_password_in_clear) return "text";
        else return "password";
      }
      return this.input_type;
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
    toggleInputType() {
      this.show_password_in_clear = !this.show_password_in_clear;
    },
  },
};
</script>
<style lang="scss" scoped>
._notices {
  flex: 0 0 auto;
  // padding: calc(var(--spacing) / 4);
  padding: 0;

  display: flex;
  justify-content: space-between;
}
._revealBtn {
  padding: 0;
}
</style>
