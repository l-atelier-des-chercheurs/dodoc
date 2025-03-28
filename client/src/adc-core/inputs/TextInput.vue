<template>
  <div>
    <DLabel v-if="label_str" :str="$t(label_str)" :for_input="label_str" />
    <template v-if="tag === 'input'">
      <input
        ref="field"
        :id="label_str"
        :type="field_input_type_prop"
        :name="label_str"
        :autocomplete="autocomplete"
        :size="size"
        :required="required"
        :placeholder="placeholder"
        :value="content"
        @input="$emit('update:content', $event.target.value)"
        @input_txt="innerText = $event.target.value"
        @keydown.enter.exact.prevent="$emit('onEnter')"
        @keydown.enter.shift.exact.prevent="$emit('onShiftEnter')"
      />
    </template>
    <CollaborativeEditor3
      v-else-if="tag === 'editor'"
      ref="field"
      :field_to_edit="'field_to_edit'"
      :content="content"
      :custom_formats="['bold', 'italic', 'link']"
      :is_collaborative="false"
      :edit_on_mounted="true"
      :can_edit="true"
      @input="$emit('update:content', $event)"
    />
    <span
      v-else-if="tag === 'span'"
      ref="field"
      class="u-input _content"
      :contenteditable="true"
      :required="required"
      @input="$emit('update:content', $event.target.innerText)"
    />
    <!-- @paste.prevent="onPaste" -->
    <!-- @keyup.enter="$emit('onEnter')" -->

    <div
      class="fieldCaption _notices"
      :class="{
        'u-colorRed': !validity,
      }"
      v-if="minlength || maxlength || input_type === 'password'"
    >
      <div>
        <template v-if="minlength || maxlength">
          <template v-if="minlength">{{ minlength }} ≤ </template>
          {{ content_txt.length }}
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

    <div v-if="instructions">
      <small class="u-instructions" v-html="instructions" />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label_str: {
      type: String,
    },
    input_type: {
      type: String,
      default: "text",
    },
    autocomplete: {
      type: String,
    },
    content: {
      type: [String, Number],
      default: "",
    },
    placeholder: {
      type: String,
      default: "…",
    },
    instructions: {
      type: String,
    },
    size: {
      type: String,
    },
    required: {
      type: Boolean,
      default: true,
    },
    autofocus: {
      type: Boolean,
      default: false,
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
    this.initInput();
  },
  beforeDestroy() {},
  watch: {
    validity: {
      handler() {
        this.$emit("toggleValidity", this.validity);
      },
      immediate: true,
    },
    content() {},
  },
  computed: {
    tag() {
      if (this.input_type === "editor") return "editor";
      return "input";
    },
    validity() {
      if (this.required && this.content_txt.length === 0) return false;
      if (this.minlength && this.content_txt.length < this.minlength)
        return false;
      if (this.maxlength && this.content_txt.length > this.maxlength)
        return false;
      return true;
    },
    field_input_type_prop() {
      if (this.input_type === "password")
        if (this.show_password_in_clear) return "text";
        else return "password";
      return this.input_type;
    },
    content_txt() {
      // Create a temporary div to parse HTML and get plain text
      const temp = document.createElement("div");
      temp.innerHTML = this.content;
      return temp.innerText;
    },
  },
  methods: {
    initInput() {
      if (!this.autofocus) return;
      if (this.tag === "span") {
        this.$refs.field.innerText = this.content;
        this.focusSpanAtEnd();
      } else if (this.tag === "input") {
        this.$refs.field.focus();
      }
    },

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
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 8);

  display: flex;
  justify-content: space-between;
}
._revealBtn {
  padding: 0;
  text-transform: lowercase;
}
</style>
