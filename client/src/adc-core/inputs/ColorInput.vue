<template>
  <div class="_numberInput">
    <DLabel v-if="label" :str="label" :for="label" />

    <transition name="fade" mode="out-in">
      <div class="u-sameRow" :key="'value-' + value">
        <input
          ref="field"
          type="color"
          class="_inputField"
          :class="{
            'has--novalue': local_value === '',
          }"
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

    <div class="u-defaultValue" v-if="value !== default_value.value">
      {{ $t("default_value") }} =
      <button type="button" @click="$emit('save', default_value.value)">
        {{ $t(default_value.label_untranslated) }}
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
      type: Object,
      default: () => ({ label_untranslated: "white", value: "#ffffff" }),
    },
  },
  components: {},
  data() {
    return {
      local_value: this.value || this.default_value.value,
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
._inputField {
  position: relative;

  &.has--novalue::after {
    content: "";
    position: absolute;
    top: calc(var(--spacing) / 4);
    right: calc(var(--spacing) / 4);
    left: calc(var(--spacing) / 4);
    bottom: calc(var(--spacing) / 4);

    background-image: linear-gradient(
        to right,
        rgba(255, 255, 255, 0.75),
        rgba(255, 255, 255, 0.75)
      ),
      linear-gradient(to right, black 50%, white 50%),
      linear-gradient(to bottom, black 50%, white 50%);
    background-blend-mode: normal, difference, normal;
    background-size: 2em 2em;
  }
}
</style>
