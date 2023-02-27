<template>
  <div class="_numberInput">
    <DLabel v-if="label" :str="label" :for="label" />

    <!-- <transition name="fade" mode="out-in"> -->
    <div class="_defaultColors">
      <div
        v-for="color in default_colors"
        class="_defaultColors--item"
        :class="{
          'is--active': color === local_value,
        }"
        :key="color"
        :style="`--default-color: ${color}`"
        @click="$emit('save', color)"
      >
        <span />
      </div>
    </div>
    <div class="u-sameRow" :key="'value-' + value">
      <div
        class="_inputField"
        :class="{
          'has--novalue': local_value === '',
        }"
      >
        <input
          ref="field"
          type="color"
          :name="label"
          :id="'_input_' + label"
          v-model="local_value"
        />
      </div>

      <transition name="popUp_slow">
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
      </transition>
    </div>
    <!-- </transition> -->

    <div class="u-defaultValue" v-if="value !== default_value.value">
      {{ $t("default_value") }} =
      <button
        type="button"
        class="u-button u-button_bleumarine u-button_small"
        @click="$emit('save', default_value.value)"
      >
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

      default_colors: [
        "#000000",
        "#353535",
        "#b9b9b9",
        "#ffffff",
        "#1d327f",
        "#52c5b9",
        "#ffbe32",
        "#fc4b60",
      ],
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
._defaultColors {
  display: flex;
  flex-flow: row wrap;
}
._defaultColors--item {
  padding: calc(var(--spacing) / 2);

  > span {
    display: block;
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
    background-color: var(--default-color);
  }
  &.is--active > span {
    outline: 2px solid var(--c-orange) !important;
  }
}
._inputField {
  position: relative;
  width: 100%;

  &.has--novalue::after {
    content: "";
    position: absolute;
    inset: 0;
    // top: calc(var(--spacing) / 4);
    // right: calc(var(--spacing) / 4);
    // left: calc(var(--spacing) / 4);
    // bottom: calc(var(--spacing) / 4);
    pointer-events: none;

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

._submitBtn {
  padding: calc(var(--spacing) / 8);
}
</style>
