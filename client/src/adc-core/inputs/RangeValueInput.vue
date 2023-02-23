<template>
  <div class="_rangeInput">
    <DLabel v-if="label" :str="label" :for="label" />

    <div class="u-sameRow">
      <input
        type="range"
        class="_inputRange"
        :list="steplist_id"
        :min="min"
        :max="max"
        :step="step"
        v-model.number="local_value"
        @change="$emit('save', +$event.target.value)"
      />
      <datalist :id="steplist_id" v-if="ticks">
        <option v-for="tick in ticks" :key="tick">{{ tick }}</option>
      </datalist>
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
          :value="local_value"
          :min="min"
          :step="step"
          :suffix="suffix"
          class="_numberField"
          @save="$emit('save', $event)"
        />
      </transition>
    </div>

    <div class="u-defaultValue" v-if="value !== default_value">
      {{ $t("default_value") }} =
      <button type="button" @click="$emit('save', default_value)">
        {{ default_value }}
      </button>
    </div>
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
    step: {
      type: Number,
      default: 1,
    },
    ticks: Array,
    suffix: String,
  },
  components: {},
  data() {
    return {
      local_value: this.value || this.default_value,
      steplist_id: `steplist_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 5)}`,
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
