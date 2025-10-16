<template>
  <div class="_colorInput">
    <ToggledSection
      class=""
      :label="label"
      :can_toggle="can_toggle"
      :show_toggle.sync="show_color_input"
    >
      <div class="_currentColor" v-if="!edit_mode">
        <span
          class="_colorPatch"
          :data-color="local_value"
          :style="`--patch-color: ${local_value}`"
          :title="local_value"
        />
        <EditBtn @click="edit_mode = true" />
      </div>
      <template v-else>
        <div class="_defaultColors">
          <button
            type="button"
            v-for="color in computed_default_colors"
            class="_colorPatch _colorPatch_isButton"
            :data-color="color"
            :class="{
              'is--active': color === local_value,
            }"
            :key="color"
            :style="`--patch-color: ${color}`"
            @click="saveColor(color)"
            :title="color"
          />
          <div
            class="_inputField _colorPatch _colorPatch_isButton _customColorButton"
            :class="{
              'has--novalue': local_value === '',
              'is--active': is_custom_color,
            }"
            :style="`--patch-color: ${
              is_custom_color ? local_value : '#808080'
            }`"
          >
            <label
              :for="'_input_' + label"
              class="_customColorLabel"
              :title="$t('custom_color')"
            >
              <b-icon class="_customColorIcon" icon="palette-fill" />
              <input
                ref="field"
                type="color"
                :name="label"
                :id="'_input_' + label"
                v-model="local_value"
              />
            </label>
          </div>
        </div>
        <!-- <transition name="fade_fast">
          <SaveCancelButtons
            v-if="!live_editing"
            class="_scb"
            @save="saveColor(local_value)"
            @cancel="cancelColor"
          />
        </transition> -->
      </template>
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
    live_editing: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
    },
    value: String,
    default_value: {
      type: String,
      String: "#ffffff",
    },
    default_colors: {
      type: Array,
      default: () => [
        "#000000",
        "#637B83",
        "#ffffff",
        "#1d327f",
        "#52c5b9",
        "#ffbe32",
        "#fc4b60",
        "transparent",
      ],
    },
    allow_transparent: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      show_color_input: this.value ? true : false,
      edit_mode: this.live_editing,

      local_value: this.value || this.default_value,
      previous_value: undefined,

      custom_color_debounce: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    value() {
      this.previous_value = this.local_value;
      this.local_value = this.value;
    },
    local_value() {
      if (this.custom_color_debounce) clearTimeout(this.custom_color_debounce);

      this.custom_color_debounce = setTimeout(() => {
        this.saveColor(this.local_value);
      }, 500);
    },
    show_color_input() {
      if (!this.show_color_input) {
        this.saveColor(this.default_value);
      } else if (this.previous_value) {
        this.saveColor(this.previous_value);
      }
    },
  },
  computed: {
    is_custom_color() {
      return !this.computed_default_colors.includes(this.local_value);
    },
    computed_default_colors() {
      return this.default_colors.filter(
        (color) => color !== "transparent" || this.allow_transparent
      );
    },
  },
  methods: {
    saveColor(col) {
      this.$emit("save", col);
      if (!this.live_editing) this.edit_mode = false;
    },
    cancelColor() {
      this.local_value = this.value;
      if (!this.live_editing) this.edit_mode = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._defaultColors {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-start;
}
._defaultColors--item {
  cursor: pointer;
  padding: calc(var(--spacing) / 2);
}

._currentColor {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
}

._colorPatch {
  display: block;
  width: 1.9rem;
  height: 1.9rem;

  &::before {
    content: "";
    display: block;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    background-color: var(--patch-color);
  }

  &._colorPatch_isButton {
    padding: 0.3rem;
    appearance: none;
    border: none;
    background-color: transparent;

    &::before {
      outline: 2px solid var(--c-gris);
      border: 1px solid white;
    }

    &:hover,
    &:focus-visible {
      &::before {
        outline-color: var(--active-color);
      }
    }
  }

  &.is--active {
    // pointer-events: none;
    &::before {
      outline-color: var(--c-noir);
    }
  }

  &[data-color="transparent"] {
    &::before {
      background-image: repeating-conic-gradient(
        var(--c-gris) 0% 25%,
        white 0% 50%
      );
      background-size: 8px 8px;
    }
  }
}

._inputField {
  position: relative;
  display: flex;
  display: block;

  input {
    width: 1px;
    height: 1px;
    opacity: 0;
    padding: 0;
    display: inline-block;
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

  &._customColorButton {
    margin: 0;
    padding: 0.3rem;
    width: 1.9rem;
    height: 1.9rem;
    appearance: none;
    border: none;
    background-color: transparent;
  }
}

._customColorLabel {
  position: relative;
  display: block;
  cursor: pointer;

  position: absolute;
  inset: 0;

  &:hover,
  &:focus-visible {
    &::before {
      outline-color: var(--active-color);
    }
  }

  &.is--active::before {
    outline-color: var(--c-noir);
  }
}

._customColorIcon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.9rem;
  z-index: 1;
  pointer-events: none;
  color: white;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.7));
}

._customCol {
  margin: calc(var(--spacing) / 4) auto;
  padding: calc(var(--spacing) / 4);
  display: flex;
}
._customCol--label {
  // padding: calc(var(--spacing) / 4);
}

._submitBtn {
  // padding: calc(var(--spacing) / 8);
}
</style>
