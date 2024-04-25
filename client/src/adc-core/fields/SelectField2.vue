<template>
  <div class="_selectField">
    <div class="u-sameRow">
      <select
        v-model="new_value"
        @change="$emit('change', new_value)"
        :disabled="!can_edit"
      >
        <option
          v-for="option in options"
          :key="option.key"
          :value="option.key"
          :disabled="option.disabled === true"
          v-text="option.text || option.key"
        />
      </select>
    </div>

    <div class="u-instructions" v-if="instructions">
      <small v-html="instructions" />
    </div>

    <div class="_footer" v-if="hide_validation !== true && value !== new_value">
      <SaveCancelButtons
        class="_scb"
        :is_saving="is_saving"
        @save="updateSelect"
        @cancel="cancel"
      />
    </div>
    <!-- {{ value }} / {{ new_value }} -->
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: [Number, String],
      default: "",
    },
    options: {
      type: Array,
    },
    can_edit: {
      type: Boolean,
    },
    hide_validation: Boolean,
  },
  components: {},
  data() {
    return {
      is_saving: false,
      new_value: this.value ? this.value : "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    value() {
      this.new_value = this.value;
    },
  },
  computed: {
    instructions() {
      const new_opt = this.options.find((o) => o.key === this.new_value);
      if (new_opt) return new_opt.instructions;
      return false;
    },
  },
  methods: {
    cancel() {
      this.new_value = this.value;
    },
    async updateSelect() {
      this.$emit("update", this.new_value);
    },
  },
};
</script>
<style lang="scss" scoped>
._selectField {
}

._footer {
  margin-top: calc(var(--spacing) / 4);
}
</style>
