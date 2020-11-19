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
        @click="toggleFieldMode"
        :content="$t('reveal_password')"
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
      else return "fill: var(--c-orange);";
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
}
</style>
