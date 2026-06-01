<template>
  <transition-group
    tag="section"
    name="listComplete"
    appear
    class="_radioCheckboxInput"
    :class="{
      'is--editable': can_edit,
    }"
  >
    <template v-for="option in adjusted_options">
      <label
        :for="id + '-radiocheckboxi-option-' + option.key"
        :key="option.key"
        v-if="can_edit || optionIsSelected(option.key)"
        :data-selectable="can_edit"
      >
        <input
          v-if="can_edit"
          :type="input_type"
          :name="radio_name"
          :id="id + '-radiocheckboxi-option-' + option.key"
          :value="option.key"
          :checked="optionIsSelected(option.key)"
          @input="checkOption(option.key)"
        />
        <span class="_optionContent">
          <div class="_option_icon_container">
            <img
              v-if="option.thumb_src"
              :src="option.thumb_src"
              class="_option_preview"
            />
            <span
              v-if="option.icon_html"
              class="_option_icon"
              v-html="option.icon_html"
            />
            <component :is="option.key === '' ? 'i' : 'span'">
              {{ option.label }}
            </component>
          </div>

          <div v-if="option.instructions" class="u-instructions">
            <small v-html="option.instructions" />
          </div>
        </span>
      </label>
    </template>

    <div
      v-if="
        allow_custom_option &&
        input_type === 'radio' &&
        (can_edit || is_custom_value)
      "
      :key="'_custom'"
      class="_customOptionRow"
    >
      <label
        :for="id + '-radiocheckboxi-custom'"
        :data-selectable="can_edit"
        class="_customOptionLabel"
      >
        <input
          v-if="can_edit"
          :type="input_type"
          :name="radio_name"
          :id="id + '-radiocheckboxi-custom'"
          :value="custom_placeholder"
          :checked="is_custom_value"
          @input="selectCustomOption"
        />
        <span class="_optionContent">
          <span>{{ custom_option_label }}</span>
        </span>
      </label>
      <div
        v-if="is_custom_value"
        class="_customOptionEditorBlock"
      >
        <template v-if="custom_option_is_html">
          <TextInput
            v-if="can_edit"
            ref="custom_text_input"
            :content="custom_text_value"
            input_type="editor"
            :custom_formats="custom_option_formats"
            class="_customEditorWrap"
            @update:content="onCustomHtmlInput"
          />
          <div
            v-else
            class="_customHtmlDisplay"
            v-html="custom_text_value"
          />
        </template>
        <template v-else>
          <input
            v-if="can_edit"
            ref="custom_text_input"
            type="text"
            class="_customTextInput"
            :value="custom_text_value"
            :placeholder="custom_option_placeholder"
            @input="onCustomTextInput"
          />
          <span v-else class="_customTextDisplay">
            {{ custom_text_value }}
          </span>
        </template>
      </div>
    </div>
  </transition-group>
</template>
<script>
export default {
  props: {
    value: [String, Array],
    input_type: {
      type: String,
      default: "radio",
    },
    options: Array,
    can_edit: Boolean,
    allow_custom_option: {
      type: [Boolean, String],
      default: false,
    },
    custom_option_label: {
      type: String,
      default: "",
    },
    custom_option_placeholder: {
      type: String,
      default: "",
    },
    custom_option_formats: {
      type: Array,
      default: () => ["bold", "italic", "link", "emoji"],
    },
  },
  components: {
    TextInput: () => import("@/adc-core/inputs/TextInput.vue"),
  },
  data() {
    return {
      id: `image_upload_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    radio_name() {
      return this.id + "-radiocheckboxi-group";
    },
    custom_placeholder() {
      return "__custom__";
    },
    adjusted_options() {
      let _options = [];
      return _options.concat(this.options);
    },
    option_keys() {
      return (this.options || []).map((o) => o.key);
    },
    custom_option_is_html() {
      return this.allow_custom_option === "html";
    },
    is_custom_value() {
      if (
        !this.allow_custom_option ||
        this.input_type !== "radio" ||
        this.value == null
      )
        return false;
      return (
        this.value === this.custom_placeholder ||
        (this.value !== "" && !this.option_keys.includes(this.value))
      );
    },
    custom_text_value() {
      if (this.value === this.custom_placeholder) return "";
      return this.is_custom_value ? this.value : "";
    },
  },
  methods: {
    optionIsSelected(key) {
      if (this.input_type === "radio") return this.value === key;
      else if (this.input_type === "checkbox") return this.value.includes(key);
    },
    checkOption(key) {
      if (this.input_type === "radio") {
        this.$emit("update:value", key);
        return;
      } else if (this.input_type === "checkbox") {
        let values = this.value.slice();
        if (values.includes(key)) values = values.filter((v) => v !== key);
        else values.push(key);
        return this.$emit("update:value", values);
      }
    },
    selectCustomOption() {
      this.$emit("update:value", this.custom_placeholder);
      this.$nextTick(() => {
        const ref = this.$refs.custom_text_input;
        if (!ref) return;
        if (ref.focus) ref.focus();
        else if (ref.$refs && ref.$refs.field) ref.$refs.field.focus();
      });
    },
    onCustomTextInput(e) {
      this.$emit("update:value", e.target.value);
    },
    onCustomHtmlInput(html) {
      this.$emit("update:value", html);
    },
  },
};
</script>
<style lang="scss" scoped>
._radioCheckboxInput {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 8);

  label {
    display: flex;
    flex-flow: row nowrap;
    align-content: center;
    align-items: center;

    background: white;
    // padding: calc(var(--spacing) / 4) 0;

    gap: calc(var(--spacing) / 2);

    ._option_icon_container {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      gap: calc(var(--spacing) / 2);
    }
    ._option_preview,
    ._option_icon {
      display: inline-flex;
      flex: 0 0 auto;
      vertical-align: middle;
      height: 2em;
      aspect-ratio: 1;
      object-fit: cover;
    }
    ._option_icon {
      align-items: center;
      justify-content: center;
    }
  }

  &.is--editable {
    label {
      background: var(--c-gris_clair);
      padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
      cursor: pointer;
      &:hover {
        background: var(--c-gris);
      }
    }
  }

  input {
    margin: 0;
  }

  ._customOptionRow {
    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing) / 4);

    ._customOptionLabel {
      display: flex;
      flex-flow: row nowrap;
      align-items: center;
      gap: calc(var(--spacing) / 2);
    }

    ._customOptionEditorBlock {
      margin-left: calc(var(--spacing) / 2);
      min-width: 0;
    }

    ._customTextInput {
      min-width: 0;
      width: 100%;
      background: white;
    }
    ._customEditorWrap {
      min-width: 0;
      background: white;
    }
    ._customHtmlDisplay {
      min-height: 1em;
    }
  }
}
</style>
