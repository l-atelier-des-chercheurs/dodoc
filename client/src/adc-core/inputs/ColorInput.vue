<template>
  <div class="_colorInput">
    <ToggledSection
      class=""
      :label="label"
      :can_toggle="can_toggle"
      :show_toggle.sync="show_color_input"
    >
      <div class="_currentColor" v-if="!edit_mode">
        <button
          type="button"
          class="u-button u-button_small u-button_transparent"
          @click="edit_mode = true"
        >
          <span class="_colorPatch" :style="`--patch-color: ${local_value}`" />
          {{ $t("edit") }}
        </button>
      </div>
      <template v-else>
        <div class="_defaultColors">
          <div
            v-for="color in default_colors"
            class="_colorPatch"
            :class="{
              'is--active': color === local_value,
            }"
            :key="color"
            :style="`--patch-color: ${color}`"
            @click="local_value = color"
          />
        </div>
        <div class="" :key="'value-' + value">
          <div
            class="_inputField"
            :class="{
              'has--novalue': local_value === '',
            }"
          >
            <label
              :for="'_input_' + label"
              class="u-button u-button_verysmall _customCol"
              :style="`--patch-color: ${local_value}`"
            >
              <span class="_colorPatch is--active" v-if="is_custom_color" />
              {{ $t("custom_color") }}
            </label>
            <input
              ref="field"
              type="color"
              :name="label"
              :id="'_input_' + label"
              v-model="local_value"
            />
          </div>
        </div>
        <transition name="fade_fast">
          <SaveCancelButtons
            class="_scb"
            :allow_save="value !== local_value"
            @save="saveColor(local_value)"
            @cancel="cancelColor"
          />

          <!-- <button
            type="button"
            v-if="value !== local_value"
            class="u-button u-button_bleuvert _submitBtn"
            @click="saveColor(local_value)"
          >
            <sl-icon
              style="font-size: 1.5em"
              name="check"
              :label="$t('submit')"
            />
            {{ $t("save") }}
          </button> -->
        </transition>
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
      edit_mode: false,

      local_value: this.value || this.default_value,
      previous_value: undefined,

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
      this.previous_value = this.local_value;
      this.local_value = this.value;
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
      return !this.default_colors.includes(this.local_value);
    },
  },
  methods: {
    saveColor(col) {
      this.$emit("save", col);
      this.edit_mode = false;
    },
    cancelColor() {
      this.local_value = this.value;
      this.edit_mode = false;
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

._colorPatch {
  display: block;
  width: 2rem;
  height: 2rem;
  padding: 0.3rem;
  cursor: pointer;

  &::before {
    content: "";
    display: block;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    outline: 2px solid var(--c-gris);
    border: 1px solid white;
    background-color: var(--patch-color);
  }

  &:hover,
  &:focus-visible {
    &::before {
      outline-color: var(--active-color);
    }
  }

  &.is--active {
    pointer-events: none;
    &::before {
      outline-color: var(--c-noir);
    }
  }
}

._inputField {
  position: relative;

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
}

._customCol {
  margin-bottom: calc(var(--spacing) / 4);
}

._submitBtn {
  // padding: calc(var(--spacing) / 8);
}
</style>
