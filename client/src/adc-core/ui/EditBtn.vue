<template>
  <button
    type="button"
    class="u-button u-button_verysmall _editBtn"
    :class="{
      'is--unfolded': is_unfolded,
    }"
    :style="btn_styles"
    @click="$emit('click')"
  >
    <span class="_label" :data-position="label_position">
      {{ btn_props.label }}
    </span>
    <b-icon class="_icon" :icon="btn_props.icon" />
    <!-- <sl-icon :name="icon" :label="label" /> -->
  </button>
</template>
<script>
export default {
  props: {
    btn_type: {
      type: String,
      default: "edit",
    },
    label_position: {
      type: String,
      default: "right",
    },
    is_unfolded: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    btn_props() {
      if (this.btn_type === "fullscreen")
        return {
          label: this.$t("fullscreen"),
          icon: "fullscreen",
        };
      else if (this.btn_type === "fullscreen-exit")
        return {
          label: this.$t("exit_fullscreen"),
          icon: "fullscreen-exit",
        };
      else if (this.btn_type === "add")
        return {
          label: this.$t("add"),
          icon: "plus-lg",
        };
      else if (this.btn_type === "close")
        return {
          label: this.$t("close"),
          icon: "x-lg",
        };
      else if (this.btn_type === "select_author")
        return {
          label: this.$t("login"),
          icon: "box-arrow-in-right",
        };
      else if (this.btn_type === "check")
        return {
          label: this.$t("ok"),
          icon: "check-lg",
        };

      return {
        label: this.$t("edit"),
        icon: "pencil-fill",
      };
    },
    btn_styles() {
      if (this.btn_type === "fullscreen")
        return `
          --color2: var(--c-noir);
        `;
      if (this.btn_type === "fullscreen-exit")
        return `
          --color1: var(--c-noir);
          --color2: white;
          --color-hover-icon: var(--c-noir);
        `;
      return ``;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._editBtn {
  --color1: rgba(255, 255, 255, 1);
  // --color1: white;
  --color2: var(--c-bleuvert);
  --color-hover-icon: white;

  position: relative;
  display: inline-flex;
  background: var(--color1);
  color: var(--color2);
  border: 1px solid var(--color2);

  box-shadow: 0 1px 40px rgb(0 0 0 / 10%);

  // margin-top: -0.5rem;
  // margin-bottom: -0.5rem;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;

  // backdrop-filter: blur(5px);
  background: var(--color1);

  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    z-index: 10;
    transform: scale(1.2);
  }

  ._icon {
    position: relative;
    z-index: 1;
  }

  ._label {
    position: absolute;
    top: 0;
    height: calc(100% + 2px);

    background: var(--color2);
    color: var(--color1);

    margin: -1px;
    padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);

    display: flex;
    align-items: center;
    border-radius: 1rem;
    white-space: nowrap;

    pointer-events: none;
    opacity: 0;
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    &[data-position="right"] {
      left: 0;
      padding-left: 100%;
      transform: translateX(15px);
    }
    &[data-position="left"] {
      right: 0;
      padding-right: 100%;
      transform: translateX(-15px);
    }
  }

  &:hover,
  &:active,
  &:focus-visible,
  &.is--unfolded {
    // background: var(--color2);
    color: var(--color-hover-icon);

    ._label {
      transform: none;
      color: inherit;
      opacity: 1;
      pointer-events: auto;
      // transition: all 0.25s 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      transition: all 0.25s 0s cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
}
</style>
