<template>
  <div
    class="_numberInput"
    :class="{ 'is--beingEdited': value !== local_value }"
  >
    <DLabel v-if="label" :str="label" :for="label" />

    <div class="u-sameRow">
      <div class="u-inputGroup">
        <input
          ref="field"
          type="number"
          :name="label"
          :id="'_input_' + label"
          :size="size"
          class="_input"
          :min="min"
          :max="max"
          :step="step"
          v-model.number="local_value"
          @keyup.enter="$emit('save', local_value)"
        />
        <span class="u-suffix">
          {{ suffix }}
        </span>
      </div>
      <button
        type="button"
        v-if="value !== local_value"
        class="u-button u-button_bleuvert _submitBtn"
        @click="$emit('save', local_value)"
      >
        <b-icon style="font-size: 1.5em" icon="check" />
      </button>
    </div>
    <div class="u-instructions" v-if="instructions">
      <small>{{ instructions }}</small>
    </div>

    <button
      type="button"
      v-if="default_value && value !== default_value"
      class="u-button u-button_bleumarine u-button_small"
      @click="$emit('save', default_value)"
    >
      <b-icon icon="trash" :label="$t('erase')" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    instructions: String,
    value: Number,
    default_value: Number,
    min: Number,
    max: Number,
    step: Number,
    suffix: String,
    size: {
      type: String,
      default: "small",
    },
  },
  components: {},
  data() {
    return {
      local_value: this.value || this.default_value || 0,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    value() {
      if (this.value !== this.local_value) {
        this.local_value = this.value;
      }
    },
    local_value() {
      this.$emit("update:value", this.local_value);
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._numberInput {
}

._input {
  flex: 1 0 30px;
}

._submitBtn {
  padding: calc(var(--spacing) / 8);
}
</style>
