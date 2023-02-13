<template>
  <div class="_numberInput">
    <DLabel v-if="label" :str="label" :for="label" />

    <div class="u-sameRow">
      <input
        ref="field"
        type="number"
        :name="label"
        :id="'_input_' + label"
        class="u-input-small"
        :min="min"
        v-model.number="local_value"
        @keyup.enter="$emit('save', local_value)"
      />

      <button
        type="button"
        v-if="value !== local_value"
        class="u-button u-button_bleuvert"
        @click="$emit('save', local_value)"
      >
        <sl-icon name="check" :label="$t('submit')" />
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
    },
    value: {
      type: Number,
      default: 0,
    },
    min: Number,
  },
  components: {},
  data() {
    return {
      local_value: this.value || 0,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    value() {
      this.local_value = this.value;
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._numberInput {
}
</style>
