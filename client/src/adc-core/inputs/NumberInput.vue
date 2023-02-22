<template>
  <div class="_numberInput">
    <DLabel v-if="label" :str="label" :for="label" />

    <transition name="fade" mode="out-in">
      <div class="u-sameRow" :key="'value-' + value">
        <div class="u-inputGroup">
          <input
            ref="field"
            type="number"
            :name="label"
            :id="'_input_' + label"
            class="u-input-small _input"
            :min="min"
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
          <sl-icon
            style="font-size: 1.5em"
            name="check"
            :label="$t('submit')"
          />
        </button>
      </div>
    </transition>

    <button
      type="button"
      v-if="default_value && value !== default_value"
      class="u-buttonLink"
      @click="$emit('save', default_value)"
    >
      <sl-icon name="trash3" :label="$t('erase')" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    value: Number,
    default_value: Number,
    min: Number,
    suffix: String,
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

._input {
  flex: 1 0 30px;
}

._submitBtn {
  padding: calc(var(--spacing) / 8);
}
</style>
