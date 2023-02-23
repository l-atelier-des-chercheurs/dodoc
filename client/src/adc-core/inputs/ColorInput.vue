<template>
  <div class="_numberInput">
    <DLabel v-if="label" :str="label" :for="label" />

    <transition name="fade" mode="out-in">
      <div class="u-sameRow" :key="'value-' + value">
        <input
          ref="field"
          type="color"
          :name="label"
          :id="'_input_' + label"
          v-model="local_value"
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
    </transition>

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
    label: {
      type: String,
    },
    value: String,
    default_value: {
      type: String,
      default: "#ffffff",
    },
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
<style lang="scss" scoped></style>
