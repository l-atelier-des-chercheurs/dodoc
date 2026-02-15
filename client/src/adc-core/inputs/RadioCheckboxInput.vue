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

    <label
      v-if="
        allow_custom_option &&
        input_type === 'radio' &&
        (can_edit || is_custom_value)
      "
      :key="'_custom'"
      :for="id + '-radiocheckboxi-custom'"
      :data-selectable="can_edit"
      class="_customOptionRow"
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
        <input
          v-if="can_edit && is_custom_value"
          ref="custom_text_input"
          type="text"
          class="_customTextInput"
          :value="custom_text_value"
          :placeholder="custom_option_placeholder"
          @input="onCustomTextInput"
        />
        <span
          v-else-if="!can_edit && is_custom_value"
          class="_customTextDisplay"
        >
          {{ custom_text_value }}
        </span>
      </span>
    </label>
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
      type: Boolean,
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
  },
  components: {},
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
        this.$refs.custom_text_input && this.$refs.custom_text_input.focus();
      });
    },
    onCustomTextInput(e) {
      this.$emit("update:value", e.target.value);
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
    ._optionContent {
      flex: 1;
    }

    ._customTextInput {
      min-width: 0;
      background: white;
      width: 100%;
    }
    ._customTextDisplay {
      margin-left: calc(var(--spacing) / 2);
    }
  }
}
</style>
