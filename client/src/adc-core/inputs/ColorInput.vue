<template>
  <div class="_colorInput">
    <ToggledSection
      class="u-spacingBottom"
      :label="label"
      :content.sync="show_color_input"
    >
      <div class="_defaultColors">
        <div
          v-for="color in default_colors"
          class="_defaultColors--item"
          :key="color"
          :style="`--default-color: ${color}`"
          @click="$emit('save', color)"
        >
          <span
            class="_colorPatch"
            :class="{
              'is--active': color === local_value,
            }"
          />
        </div>
      </div>
      <div class="u-sameRow" :key="'value-' + value">
        <div
          class="_inputField"
          :class="{
            'has--novalue': local_value === '',
          }"
        >
          <label
            :for="'_input_' + label"
            class="u-sameRow _inputField--label"
            :style="`--current-color: ${local_value}`"
          >
            <small>{{ $t("custom_color") }}</small>
            <span class="_colorPatch" />
          </label>
          <input
            visi
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

      <!-- <div class="u-defaultValue" v-if="value !== default_value.value">
        {{ $t("default_value") }} =
        <button
          type="button"
          class="u-button u-button_bleumarine u-button_small"
          @click="$emit('save', default_value.value)"
        >
          {{ $t(default_value.label_untranslated) }}
        </button>
      </div> -->
    </ToggledSection>
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
      String: "#ffffff",
    },
  },
  components: {},
  data() {
    return {
      show_color_input: this.value ? true : false,

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
    show_color_input() {
      if (!this.show_color_input) this.$emit("save", this.default_value.value);
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
  cursor: pointer;
  padding: calc(var(--spacing) / 2);
}

._colorPatch {
  display: block;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.06);
  background-color: var(--default-color);

  &:hover,
  &:focus-visible {
    outline: 2px solid var(--c-gris_fonce) !important;
  }

  &.is--active {
    outline: 2px solid var(--c-noir) !important;
  }
}

._inputField {
  position: relative;

  ._inputField--label {
    ._colorPatch {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 4px;
      background: var(--current-color);
    }
  }

  input {
    width: 1px;
    height: 1px;
    opacity: 0;
  }

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
