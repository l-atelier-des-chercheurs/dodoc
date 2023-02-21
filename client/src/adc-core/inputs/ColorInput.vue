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
          class="u-input-small"
          v-model.number="local_value"
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
    <button
      type="button"
      v-if="value !== ''"
      class="u-buttonLink"
      @click="$emit('save', '')"
    >
      <sl-icon name="trash3" :label="$t('erase')" />
    </button>
  </div>
</template>
<script>
export default {
  props: {
    label: {
      type: String,
    },
    value: String,
  },
  components: {},
  data() {
    return {
      local_value: this.value || "",
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
