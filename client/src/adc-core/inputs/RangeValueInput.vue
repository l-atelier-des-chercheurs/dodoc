<template>
  <div class="_rangeValueInput">
    <div class="item">
      <label :for="id">
        {{ label }}
        <button
          type="button"
          class="buttonLink"
          v-if="value !== default_value"
          @click="$emit('value', default_value)"
        >
          ×
        </button>
      </label>
      <div>
        <input type="range" min="0" max="1" step="0.1" v-model="new_value" />
      </div>
      <div class="input-group">
        <input type="number" :id="id" class="input-small" v-model="new_value" />
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    value: Number,
    default_value: Number,
  },
  components: {},
  data() {
    return {
      id: `id_${(Math.random().toString(36) + "00000000000000000").slice(
        2,
        3 + 2
      )}`,

      new_value: this.value,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    value() {
      this.new_value = this.value;
    },
    new_value() {
      if (this.new_value !== this.value)
        this.$emit("update:value", this.new_value);
    },
  },
  computed: {
    current_instruction() {
      if (!this.options) return false;
      return this.options[this.content.toString()];
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._toggleInput {
}
._inputLabel {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}
._maxlength {
  flex: 0 0 auto;
  padding: calc(var(--spacing) / 4) 0;
}
</style>
