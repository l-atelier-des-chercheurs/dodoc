<template>
  <div class="_rangeInput">
    <ToggledSection
      class=""
      :label="label"
      :can_toggle="can_toggle"
      :show_toggle.sync="show_range_input"
    >
      <div class="u-sameRow">
        <input
          type="range"
          class="_inputRange"
          :list="steplist_id"
          :min="min"
          :max="max"
          :step="step"
          v-model.number="local_value"
          @input="$emit('input', +$event.target.value)"
          @change="$emit('save', +$event.target.value)"
        />
        <datalist :id="steplist_id" v-if="ticks">
          <option v-for="tick in ticks" :key="tick">{{ tick }}</option>
        </datalist>

        <NumberInput
          :key="'value-' + value"
          :value="local_value"
          :min="min"
          :step="step"
          :suffix="suffix"
          class="_numberField"
          @save="$emit('save', $event)"
        />
      </div>

      <!-- <div class="u-defaultValue" v-if="value !== default_value">
      {{ $t("default_value") }} =
      <button
        type="button"
        class="u-button u-button_bleumarine u-button_small"
        @click="$emit('save', default_value)"
      >
        {{ default_value }}
      </button>
    </div> -->
    </ToggledSection>
  </div>
</template>
<script>
export default {
  props: {
    can_toggle: {
      type: Boolean,
      default: true,
    },
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
      show_range_input:
        this.value !== undefined && this.value !== this.default_value
          ? true
          : false,
      local_value: this.value || this.default_value,
      previous_value: undefined,
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
      this.previous_value = this.local_value;
      this.local_value = this.value;

      if (this.local_value !== this.default_value && !this.show_range_input) {
        this.previous_value = this.local_value;
        this.show_range_input = true;
      }
    },
    show_range_input() {
      if (!this.show_range_input) this.$emit("save", this.default_value);
      else {
        if (this.previous_value) this.$emit("save", this.previous_value);
        else if (this.default_value) this.$emit("save", this.default_value);
      }
    },
  },
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._rangeInput {
}
._inputRange {
  flex: 1 1 60px;
  min-width: 60px;
  margin: 0;
}
._numberField {
  flex: 2 0 0px;
}

::v-deep {
  ._numberInput {
    // background: blue;
    &.is--beingEdited {
      // background: red;
      flex: 6 0 0;
    }
  }
}
</style>
