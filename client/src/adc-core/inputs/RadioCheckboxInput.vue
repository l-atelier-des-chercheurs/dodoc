<template>
  <transition-group
    tag="section"
    name="projectsList"
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
          :name="id + '-radiocheckboxi-option-' + option.key"
          :id="id + '-radiocheckboxi-option-' + option.key"
          :value="option.key"
          :checked="optionIsSelected(option.key)"
          @input="checkOption(option.key)"
        />
        <span>
          <img
            v-if="option.thumb_src"
            :src="option.thumb_src"
            class="_option_preview"
          />
          <component :is="option.key === '' ? 'i' : 'span'">
            {{ option.label }}
          </component>
          <br />
          <div class="u-instructions">
            <small v-html="option.instructions" />
          </div>
        </span>
      </label>
    </template>
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
    adjusted_options() {
      let _options = [];
      // if (this.input_type === "radio")
      //   _options.push({
      //     key: "",
      //     label: "–",
      //   });
      return _options.concat(this.options);
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
    ._option_preview {
      display: inline-block;
      vertical-align: middle;
      height: 1em;
      aspect-ratio: 1;
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
}
</style>
