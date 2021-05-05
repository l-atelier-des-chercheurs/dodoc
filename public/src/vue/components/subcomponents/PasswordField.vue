<template>
  <div class="input-group">
    <input
      :type="field_mode"
      :required="required"
      :autocomplete="field_type"
      :autoselect="autoselect"
      :autofocus="autofocus"
      :placeholder="placeholder"
      @input="updateValue($event.target.value)"
      @keydown.enter.prevent="$emit('enter-was-pressed')"
    />

    <span class="input-addon _passwordfield_toggle">
      <button
        type="button"
        class=""
        :key="field_mode"
        @click="toggleFieldMode"
        :content="
          field_mode === 'password'
            ? $t('reveal_password')
            : $t('hide_password')
        "
        v-tippy="{
          placement: 'top',
          delay: [600, 0],
        }"
      >
        <svg
          class="inline-svg"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          width="144px"
          height="84px"
          viewBox="0 0 144 84"
          style="overflow: visible; enable-background: new 0 0 144 84"
          xml:space="preserve"
        >
          <path
            :style="toggle_fill_color"
            d="M72,0C32.2,0,0,42,0,42s32.2,42,72,42s72-42,72-42S111.8,0,72,0z M72,71.3c-16.5,0-30-13.2-30-29.6
		c0-16.3,13.4-29.6,30-29.6c16.5,0,30,13.3,30,29.6C102,58,88.5,71.3,72,71.3z"
          />
          <line
            x1="20"
            y1="90"
            x2="125"
            y2="-5"
            :style="toggle_stroke_color"
            stroke-width="12"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </span>
  </div>
</template>
<script>
export default {
  props: {
    required: {
      type: Boolean,
      default: false,
    },
    field_type: String,
    placeholder: String,
    autofocus: {
      type: Boolean,
      default: false,
    },
    autoselect: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      field_mode: "password",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    toggle_fill_color() {
      if (this.field_mode === "password") return "fill: var(--c-noir);";
      else return "fill: white;";
    },
    toggle_stroke_color() {
      if (this.field_mode === "password") return "stroke: var(--c-noir);";
      else return "stroke: transparent;";
    },
  },
  methods: {
    toggleFieldMode() {
      if (this.field_mode === "password") this.field_mode = "text";
      else this.field_mode = "password";
    },
    updateValue: function (value) {
      this.$emit("input", value);
    },
  },
};
</script>
<style lang="scss" scoped>
._passwordfield_toggle {
  background-color: #f1f1f1;
  line-height: 1.7;
  // padding: 15px;
  flex-shrink: 0;
  // width: 2em;
  // height: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.2em;
  background-color: var(--c-gris-clair);

  button {
    // padding: calc(var(--spacing) / 2);
    background-color: var(--c-bleuvert);
    min-height: 0;
    padding: 0;
    display: flex;
    width: 0.9em;
    height: 0.9em;
    padding: 0.1em;

    svg {
      height: 100%;
    }
  }
}
</style>
