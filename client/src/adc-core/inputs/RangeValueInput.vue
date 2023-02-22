<template>
  <div class="_rangeInput">
    <DLabel v-if="label" :str="label" :for="label" />

    <div class="u-sameRow">
      <input
        type="range"
        class="_inputRange"
        :min="min"
        :max="max"
        step="1"
        v-model.number="local_value"
        @change="$emit('save', +$event.target.value)"
      />
      <!-- <div class="u-inputGroup">
            <input
              ref="field"
              type="number"
              :name="label"
              :id="'_input_' + label"
              class="u-input-small _numberField"
              :min="min"
              :max="max"
              v-model.number="local_value"
              @keyup.enter="$emit('save', local_value)"
            />
            <span class="u-suffix">
              {{ suffix }}
            </span>
          </div> -->

      <transition name="fade" mode="out-in">
        <NumberInput
          :key="'value-' + value"
          :value="value"
          :min="min"
          :max="max"
          :suffix="suffix"
          class="_numberField"
          @save="$emit('save', $event)"
        />
      </transition>
    </div>

    <button
      type="button"
      v-if="value !== default_value"
      class="u-buttonLink"
      @click="$emit('save', default_value)"
    >
      ×
    </button>
  </div>
</template>
<script>
export default {
  props: {
    label: String,
    value: Number,
    default_value: {
      type: Number,
      default: 0,
    },
    min: Number,
    max: Number,
    suffix: String,
  },
  components: {},
  data() {
    return {
      local_value: this.value || this.default_value,
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
._inputRange {
  flex: 1 1 60px;
  min-width: 60px;
}
._numberField {
  flex: 2 0 0px;
}
</style>
